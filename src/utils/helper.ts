const ONE_DAY = 86400000; // 24 * 60 * 60 * 1000

/**
 * getUID
 * 심플 Unique ID 얻기
 *
 * @returns {string}
 */
export function getUID(): string {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

/**
 * reactive
 * Proxy/Reflect를 이용하여 값 변경시 핸들러를 호출 (vue3 reactive 방식과 유사하게 구현)
 *
 * @param initialValue {T}
 * @param handler {(value: T, oldValue: T) => void}
 * @returns {ReactiveTarget<T>}
 */
export function reactive<T = any>(initialValue: T, handler: (value: T, oldValue: T) => void): ReactiveTarget<T> {
  const reactiveTarget: ReactiveTarget<T> = {
    current: initialValue,
  };
  return new Proxy<ReactiveTarget<T>>(reactiveTarget, {
    get: (target, key, receiver) => {
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value, receiver);
      if (oldValue !== res) {
        handler(value, oldValue);
      }
      return res;
    },
  });
}

/**
 * searchNodesByDFS
 * DFS 알고리즘으로 노드를 탐색하면서 콜백을 수행한다.
 *
 * @param rootNode {ChildNode}
 * @param callback {(node: ChildNode) => void}
 */
export function searchNodesByDFS<T extends HTMLElement>(rootNode: ChildNode, callback: (node: T) => void) {
  const nodes: ChildNode[] = [...rootNode.childNodes];

  while (nodes.length) {
    const node = nodes.shift() as T;
    if (node) {
      if (node.childNodes.length) {
        nodes.push(...node.childNodes);
      }
      callback(node);
    }
  }
}

/**
 * getXSS
 * 심플하게 XSS 대응 문자열을 리턴한다.
 *
 * @param value {string}
 * @param isForeward {boolean}
 * @returns {string}
 */
export function getXSS(value: string, isForeward: boolean | undefined = true): string {
  if (isForeward) {
    return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  } else {
    return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
}

/**
 * getTimeleftText
 * 완료일로부터 남은/지난시간 등에 대한 텍스트를 리턴한다.
 *
 * @param limitDate {string}
 * @param today {Date}
 * @param isDone {boolean}
 * @returns {string}
 */
export function getTimeleftText(limitDate: string, today: Date, isDone: boolean): string {
  const timeleft = Math.floor((new Date(limitDate).getTime() - today.getTime()) / ONE_DAY);
  let text: string;

  if (!isDone) {
    if (timeleft < 0) {
      text = `<span><strong>${-timeleft}</strong>일 지남</span>`;
    } else if (timeleft > 0) {
      text = `<span><strong>${timeleft}</strong>일 남음</span>`;
    } else {
      text = '<strong>오늘까지</strong>';
    }

    return `${text}<span>&nbsp;(~${limitDate})</span>`;
  } else {
    return `<span>~${limitDate}</span>`;
  }
}
