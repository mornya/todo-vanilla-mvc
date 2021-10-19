/*
 * Store
 * 데이터 I/O를 관리하는 객체로 스토리지를 이용한다.
 */
export class Store {
  // 로컬스토리지 (세션스토리지 사용시 window.sessionStorage)
  private readonly $storage = window.localStorage;
  // 로컬스토리지 저장소 이름
  private readonly storageName: string;

  constructor(storageName: string) {
    this.storageName = `todo.${storageName}`;
  }

  /**
   * load
   * 스토리지의 데이터를 읽어온다.
   *
   * @returns {S | undefined}
   */
  load<S = any>(): S | undefined {
    const storageData = this.$storage.getItem(this.storageName);

    if (storageData) {
      const data: StoreType.Scheme<S> = JSON.parse(storageData);
      console.info('[STORE] load', data);
      return data.data;
    }

    // 스토리지 내용이 존재하지 않으면 생성
    this.save(undefined);
    return undefined;
  }

  /**
   * save
   * 스토리지에 데이터를 저장한다.
   *
   * @param data {S}
   */
  save<S = any>(data: S): void {
    const storageData: StoreType.Scheme<S> = { meta: {}, data };
    console.info('[STORE] save', storageData);
    this.$storage.setItem(this.storageName, JSON.stringify(storageData));
  }

  /**
   * remove
   * 스토리지 데이터를 삭제한다.
   */
  remove(): void {
    this.$storage.removeItem(this.storageName);
  }
}
