import { Store } from '@/utils/Store';

let store: Store;

beforeEach(() => (store = new Store('test')));
afterEach(() => store?.remove());

describe('Store module test', () => {
  /*******/

  it('Store.load', () => {
    type T1 = string;
    const data = store.load<T1>();

    expect(data).toBeUndefined();
  });

  it('Store.save (string data)', () => {
    type T1 = string;
    const saveData = 'TEST';

    store.save<T1>(saveData);

    const data = store.load<T1>();

    expect(data).toBe('TEST');
  });

  it('Store.save (object data)', () => {
    type T1 = { a: string };
    const saveData = { a: 'TEST' };

    store.save<T1>(saveData);

    const data = store.load<T1>();

    expect(data).toStrictEqual({ a: 'TEST' });
  });

  it('Store.save (array object data)', () => {
    type T1 = { a: string }[];
    const saveData = [{ a: 'TEST1' }, { a: 'TEST2' }];

    store.save<T1>(saveData);

    const data = store.load<T1>();

    expect(data).toStrictEqual([{ a: 'TEST1' }, { a: 'TEST2' }]);
  });

  /*******/
});
