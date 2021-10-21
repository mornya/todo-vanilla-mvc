/*
 * store.d.ts
 */

declare namespace StoreType {
  type Scheme<S> = {
    meta: {}; // 미사용
    data: S; // 실제 데이터 객체
  };
}
