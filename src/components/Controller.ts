import { reactive } from '@/utils/helper';

export default class Controller {
  private readonly $model: App['Model'];
  private readonly $view: App['View'];
  private readonly $observer: App['Observer'];

  // 아이템 목록을 상태값으로 저장해둔다.
  private readonly items: ReactiveTarget<ModelType.Item[]>;

  constructor(model: App['Model'], view: App['View'], observer: App['Observer']) {
    this.$model = model;
    this.$view = view;
    this.$observer = observer;

    // 만약 items 값이 변화가 있을 경우 반응형 처리 (아이템 목록 존재에 따라 결과없음 표시/해제)
    this.items = reactive<ModelType.Item[]>([], this.onChangeItems.bind(this));
  }

  initialize() {
    // 메시지 전달을 위해 구독
    this.$observer.addObserver({
      updateStatus: this.updateStatus.bind(this),
      destroy() {}, // unused
    });
    // 초기화
    this.loadItems();
  }

  updateStatus(actionType: string, nextValue: any) {
    console.info('ACTION: [', actionType, ']', nextValue);

    switch (actionType) {
      case 'ITEM_ADD': // 추가 버튼 클릭시
        this.itemAdd(nextValue);
        break;
      case 'ITEM_CHECK': // 아이템 체크박스 클릭시
        this.itemCheck(nextValue);
        break;
      case 'ITEM_EDIT': // 아이템 수정 버튼 클릭시
        this.itemEdit(nextValue);
        break;
      case 'ITEM_SAVE': // 아이템 저장 버튼 클릭시
        this.itemSave(nextValue);
        break;
      case 'ITEM_DEL': // 아이템 삭제 버튼 클릭시
        this.itemDel(nextValue);
        break;
      default:
        break;
    }
  }

  // 초기실행시 할일 목록 불러와 뷰에 표시
  loadItems() {
    const items = this.$model.findAll();
    this.items.current = items;
    this.$view.loadItems(items);
  }

  // 뷰에 할일 아이템 추가
  itemAdd(payload: ModelType.Item) {
    const result = this.$model.insert(payload);
    if (result) {
      this.items.current = [payload, ...this.items.current];
      this.$view.itemAdd(payload);
    }
  }

  // 뷰에 아이템 체크 표시
  itemCheck(payload: ModelType.Item) {
    const result = this.$model.update(payload);
    if (result) {
      this.items.current = [...this.items.current.map((item) => (item.id === payload.id ? payload : item))];
      this.$view.itemCheck(payload);
    }
  }

  // 완료가 아닐경우 아이템 수정모드로 전환
  itemEdit(payload: ModelType.Item) {
    const item = this.items.current.find((item) => item.id === payload.id);
    this.$view.itemEdit(payload, !item?.isDone);
  }

  // 아이템 저장 후 화면에 해당 아이템만 업데이트
  itemSave(payload: ModelType.Item) {
    const result = this.$model.update(payload);
    if (result) {
      this.items.current = [...this.items.current.map((item) => (item.id === payload.id ? payload : item))];
      this.$view.itemSave(payload);
    }
  }

  // 아이템 삭제 후 화면에 해당 아이템만 제거
  itemDel(payload: ModelType.Item) {
    const result = this.$model.delete(payload);
    if (result) {
      this.items.current = [...this.items.current.filter((item) => item.id !== payload.id)];
      this.$view.itemDel(payload);
    }
  }

  // items 아이템 존재여부에 따라 결과 없음 표시/해제
  onChangeItems(next: ModelType.Item[] /*, prev: ModelType.Item[]*/) {
    this.$view.setNoItems(next.length === 0);
  }
}
