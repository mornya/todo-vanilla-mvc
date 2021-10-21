import { getUID, getTimeleftText, getXSS } from '@/utils/helper';

type El = {
  template: HTMLTemplateElement; // 아이템 템플릿
  newSubjectText: HTMLInputElement; // 새 할일 제목
  newDateText: HTMLInputElement; // 새 할일 완료일
  addButton: HTMLButtonElement; // 추가 버튼
  listSection: HTMLElement; // 리스트 레퍼
};

// document.querySelector 메소드를 축약형으로 만든 것 뿐입니다.
const qs = <E extends HTMLElement>(selectors: string) => document.querySelector<E>(selectors)!;

export default class View {
  private readonly $observer: App['Observer'];
  private el!: El;

  constructor(observer: App['Observer']) {
    this.$observer = observer;

    // HTML엘리먼트에 대한 레퍼런스값
    this.el = {
      template: qs<HTMLTemplateElement>('#new-template'),
      newSubjectText: qs<HTMLInputElement>('#new-subject'),
      newDateText: qs<HTMLInputElement>('#new-date'),
      addButton: qs<HTMLButtonElement>('.btn-add'),
      listSection: qs<HTMLElement>('.list-wrap'),
    };

    // 버튼 리스너 등록
    this.el.addButton.addEventListener('click', this.onClickAddButton.bind(this), false);
  }

  // 전체 아이템 목록 표시
  loadItems(items: ModelType.Item[]) {
    this.el.listSection.innerHTML = '';

    if (items.length) {
      items.forEach((item) => this.el.listSection.appendChild(this.createItem(item)));
    } else {
      this.setNoItems(true);
    }
  }

  // 결과없음 표시/해제
  setNoItems(isShow: boolean) {
    if (isShow) {
      this.el.listSection.innerHTML += '<div class="no-result">할일 목록이 존재하지 않습니다.</div>';
    } else {
      this.el.listSection.querySelector<HTMLDivElement>('.no-result')?.remove();
    }
  }

  // 수정모드로 전환/해제
  setEditMode(item: ModelType.Item, isEditMode: boolean) {
    const el = this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)!;
    el.classList[isEditMode ? 'add' : 'remove']('editmode');
    el.querySelector<HTMLInputElement>('.item-chk')!.disabled = isEditMode;
    el.querySelector<HTMLButtonElement>('.btn-edit')!.innerHTML = isEditMode ? '저장' : '수정';
    el.querySelector<HTMLButtonElement>('.btn-del')!.innerHTML = isEditMode ? '취소' : '삭제';
  }

  // HTML 템플릿을 복제하여 DocumentFragment 위에 변수값 및 기능을 입혀 아이템을 생성하여 리턴
  createItem<T extends HTMLElement = HTMLDivElement>(item: ModelType.Item): T {
    const today = new Date(new Date().toLocaleDateString());
    const templateNode = document.importNode<T>(
      this.el.template.content.querySelector<T>('.list-item')!,
      true, // 하위노드까지 복제
    );
    templateNode.setAttribute('data-id', item.id);
    templateNode.classList[item.isDone ? 'add' : 'remove']('done');

    // 체크박스 입력폼
    const itemChk = templateNode.querySelector<HTMLInputElement>('.item-chk')!;
    itemChk.id = `item-chk-${item.id}`;
    itemChk.value = item.id;
    itemChk.checked = item.isDone;
    itemChk.addEventListener('change', () => this.onChangeItem(item, itemChk.checked), false);
    (itemChk.nextElementSibling as HTMLLabelElement).htmlFor = itemChk.id;

    // 할일
    const heading = templateNode.querySelector<HTMLHeadingElement>('.form2 h2')!;
    heading.querySelector<HTMLSpanElement>('.txt')!.innerHTML = getXSS(item.subject);

    // 완료일
    const elTimeleft = heading.querySelector<HTMLSpanElement>('.timeleft')!;
    if (!item.limitDate) {
      elTimeleft.classList.add('none');
    } else {
      elTimeleft.innerHTML = getTimeleftText(item.limitDate, today, item.isDone);
    }

    // 할일 입력폼
    const itemSubject = heading.nextElementSibling as HTMLInputElement;
    itemSubject.id = `item-subject-${item.id}`;
    itemSubject.value = getXSS(item.subject, false);
    (itemSubject.nextElementSibling as HTMLLabelElement).htmlFor = itemSubject.id;

    // 완료일 입력폼
    const itemDate = templateNode.querySelector<HTMLInputElement>('.item-date')!;
    itemDate.id = `item-date-${item.id}`;
    itemDate.value = item.limitDate;
    (itemDate.nextElementSibling as HTMLLabelElement).htmlFor = itemDate.id;

    // 수정 버튼
    templateNode
      .querySelector<HTMLButtonElement>('.btn-edit')!
      .addEventListener('click', () => this.onClickEditButton(item), false);

    // 삭제 버튼
    templateNode
      .querySelector<HTMLButtonElement>('.btn-del')!
      .addEventListener('click', () => this.onClickDelButton(item), false);

    return templateNode;
  }

  // 신규 할일 아이템이 저장되고나서의 화면처리
  itemAdd(item: ModelType.Item) {
    this.el.listSection.prepend(this.createItem(item));
    this.el.newSubjectText.value = ''; // 할일 폼 삭제
    this.el.newDateText.value = ''; // 완료일 폼 삭제
  }

  // 할일 아이템의 체크박스 액션처리 후 화면처리
  itemCheck(item: ModelType.Item) {
    const el = this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)!;
    el.classList[item.isDone ? 'add' : 'remove']('done');
    el.querySelector<HTMLInputElement>('.item-chk')!.checked = item.isDone;
    // 완료일
    const elTimeleft = el.querySelector<HTMLSpanElement>('.form2 h2 .timeleft')!;
    if (item.limitDate) {
      elTimeleft.classList.remove('none');
      elTimeleft.innerHTML = getTimeleftText(item.limitDate, new Date(), item.isDone);
    } else {
      elTimeleft.classList.add('none');
      elTimeleft.innerHTML = '';
    }
  }

  // 할일 아이템의 편집모드 변경
  itemEdit(item: ModelType.Item, isEditable: boolean) {
    if (isEditable) {
      this.setEditMode(item, true);
    } else {
      window.alert('완료된 항목은 수정 할 수 없습니다.');
    }
  }

  // 할일 아이템 저장후 화면처리
  itemSave(item: ModelType.Item) {
    // 할일
    const el = this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)!;
    const elHeading = el.querySelector<HTMLHeadingElement>('.form2 h2')!;
    elHeading.querySelector<HTMLSpanElement>('.txt')!.innerHTML = getXSS(item.subject);
    // 완료일
    const elTimeleft = elHeading.querySelector<HTMLSpanElement>('.timeleft')!;
    if (item.limitDate) {
      elTimeleft.classList.remove('none');
      elTimeleft.innerHTML = getTimeleftText(item.limitDate, new Date(), item.isDone);
    } else {
      elTimeleft.classList.add('none');
      elTimeleft.innerHTML = '';
    }

    this.setEditMode(item, false);
  }

  // 할일 아이템 삭제후 화면처리
  itemDel(item: ModelType.Item) {
    this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)?.remove();
  }

  // 추가 버튼 클릭 핸들러
  onClickAddButton() {
    const subject = this.el.newSubjectText.value;
    const limitDate = this.el.newDateText.value ?? '';

    if (subject) {
      const item: ModelType.Item = {
        id: `${getUID()}${getUID()}`, // 8자리 16진수 난수 생성
        subject,
        limitDate,
        isDone: false,
        createdAt: new Date().getTime(),
      };
      this.$observer.broadcast('ITEM_ADD', item);
    } else {
      window.alert('할일을 입력해주세요.');
    }
  }

  // 체크박스 클릭(변경) 핸들러
  onChangeItem(item: ModelType.Item, isDone: boolean) {
    const nextItem = { ...item, isDone };
    this.$observer.broadcast('ITEM_CHECK', nextItem);
  }

  // 수정/저장 버튼 클릭 핸들러
  onClickEditButton(item: ModelType.Item) {
    // 수정모드일때는 "저장", 아닐때는 "수정"
    const el = this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)!;
    if (el.classList.contains('editmode')) {
      // 저장
      const subject = el.querySelector<HTMLInputElement>('.item-subject')!.value;
      const limitDate = el.querySelector<HTMLInputElement>('.item-date')!.value;
      const nextItem = { ...item, subject, limitDate };
      this.$observer.broadcast('ITEM_SAVE', nextItem);
    } else {
      // 수정모드
      this.el.listSection.querySelector<HTMLInputElement>('.item-subject')!.value = getXSS(item.subject, false);
      this.el.listSection.querySelector<HTMLInputElement>('.item-date')!.value = item.limitDate?.toString() ?? '';
      this.$observer.broadcast('ITEM_EDIT', item);
    }
  }

  // 삭제 버튼 클릭 핸들러
  onClickDelButton(item: ModelType.Item) {
    // 수정모드일때는 "취소", 아닐때는 "삭제"
    const el = this.el.listSection.querySelector<HTMLDivElement>(`[data-id="${item.id}"]`)!;
    if (el.classList.contains('editmode')) {
      // 취소
      this.setEditMode(item, false);
    } else if (window.confirm('할일을 삭제하시겠습니까?')) {
      // 삭제
      this.$observer.broadcast('ITEM_DEL', item);
    }
  }
}
