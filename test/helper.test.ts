import * as Helper from '@/utils/helper';

describe('Helper module test', () => {
  /*******/

  it('Helper.getUID', () => {
    const uid = Helper.getUID();

    expect(uid).not.toBe('');
    expect(uid.length).toBe(4);
  });

  it('Helper.reactive', () => {
    type T1 = { a: number };
    type T2 = { a: number[] };
    type T3 = { a: { b: number } };

    const value1: ReactiveTarget<T1> = Helper.reactive({ a: 1 }, (next, prev) => {
      expect(next.a).toBe(2);
      expect(prev.a).toBe(1);
    });
    const value2: ReactiveTarget<T2> = Helper.reactive({ a: [] }, (next, prev) => {
      expect(next.a).toStrictEqual([1]);
      expect(prev.a).toStrictEqual([]);
    });
    const value3: ReactiveTarget<T3> = Helper.reactive({ a: { b: 1 } }, (next, prev) => {
      expect(next.a).toStrictEqual({ b: 2 });
      expect(prev.a).toStrictEqual({ b: 1 });
    });

    value1.current.a = 2;
    value2.current.a = [1];
    value3.current.a.b = 2;
  });

  it('Helper.searchNodesByDFS', () => {
    document.body.innerHTML = `
      <div class="a">
        <div class="a-1">
          <div class="a-1-1"/>
          <div class="a-1-2"/>
        </div>
        <div class="a-2">
          <div class="a-2-1"/>
        </div>
        <div class="a-3"/>
      </div>`;

    const nodes = document.body.cloneNode(true) as HTMLDivElement;
    const result: string[] = [];

    Helper.searchNodesByDFS(nodes, (node: HTMLDivElement) => result.push(node.className));

    expect(result.filter(Boolean)).toStrictEqual(['a', 'a-1', 'a-1-1', 'a-1-2', 'a-2', 'a-2-1', 'a-3']);
  });

  it('Helper.getXSS', () => {
    const value1 = '';
    const value2 = '<script></script>';
    const value3 = '&lt;script&gt;&lt;/script&gt;';

    expect(Helper.getXSS(value1)).toBe('');
    expect(Helper.getXSS(value2)).toBe('&lt;script&gt;&lt;/script&gt;');
    expect(Helper.getXSS(value3, false)).toBe('<script></script>');
  });

  it('Helper.getTimeleftText', () => {
    const today = new Date(new Date().toLocaleDateString());
    const mon = today.getMonth() + 1;
    const day = today.getDate();
    const yyyy = today.getFullYear();
    const mm = mon < 10 ? '0' + mon : mon;
    const dd = day < 10 ? '0' + day : day;
    const tt = `${yyyy}-${mm}-${dd}`;

    const result1 = Helper.getTimeleftText('2021-01-01', today, false);
    const result2 = Helper.getTimeleftText('9999-12-31', today, false);
    const result3 = Helper.getTimeleftText(tt, today, false);

    expect(result1.indexOf('지남') !== -1).toBeTruthy();
    expect(result2.indexOf('남음') !== -1).toBeTruthy();
    expect(result3.indexOf('오늘') !== -1).toBeTruthy();
  });

  /*******/
});
