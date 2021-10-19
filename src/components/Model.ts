import { getXSS } from '@/utils/helper';

export default class Model {
  private readonly $store: App['Store'];

  constructor(store: App['Store']) {
    this.$store = store;
  }

  // 스토리지에 저장된 전체 데이터 가져오기
  findAll(): ModelType.Item[] {
    const items = this.$store.load<ModelType.Item[]>();
    return items?.length ? items : [];
  }

  // 스토리지에 저장된 전체 데이터 중 하나만 가져오기
  find(condition: (item: ModelType.Item) => boolean): ModelType.Item | null {
    const items = this.$store.load<ModelType.Item[]>();
    return items?.length ? items.filter(condition)[0] : null;
  }

  // 스토리지에 전체 데이터 저장
  insert(item: ModelType.Item): boolean {
    const items = this.$store.load<ModelType.Item[]>() ?? [];
    const index = items.findIndex((source) => source.id === item.id);

    if (index === -1) {
      const nextItem: ModelType.Item = {
        ...item,
        subject: getXSS(item.subject),
      };
      const data = [nextItem, ...items];
      console.info('[Model] insert', data);
      this.$store.save<ModelType.Item[]>(data);
      return true;
    } else {
      console.error('ID가 중복되어 추가 할 수 없습니다.');
    }

    return false;
  }

  // 스토리지에 업데이트된 항목을 적용해 전제 데이터 저장
  update(item: ModelType.Item): boolean {
    const items = this.$store.load<ModelType.Item[]>();

    if (items?.length) {
      const index = items.findIndex((source) => source.id === item.id);

      if (index !== -1) {
        items[index] = {
          ...item,
          subject: getXSS(item.subject),
        };
        this.$store.save<ModelType.Item[]>(items);
        return true;
      } else {
        console.error('업데이트 할 데이터가 존재하지 않습니다.');
      }
    }

    return false;
  }

  // 스토리지에 삭제된 항목 적용하여 전체 데이터 저장
  delete(item: ModelType.Item): boolean {
    const items = this.$store.load<ModelType.Item[]>();

    if (items?.length) {
      const result = items.filter((source) => source.id !== item.id);

      if (result.length !== items.length) {
        this.$store.save<ModelType.Item[]>(result);
        return true;
      } else {
        console.error('삭제 할 데이터가 존재하지 않습니다.');
      }
    }

    return false;
  }
}
