import Controller from '@/components/Controller';
import Model from '@/components/Model';
import View from '@/components/View';
import { Observer } from '@/utils/Observer';
import { Store } from '@/utils/Store';
import '@/assets/app.scss';

(() => {
  // 각 객체들을 생성한다.
  const observer = new Observer();
  const store = new Store('sangjun');
  const model = new Model(store);
  const view = new View(observer);
  const controller = new Controller(model, view, observer);

  // 초기화
  controller.initialize();

  // 페이지 unload시 처리
  window.addEventListener('beforeunload', () => observer.clearObservers(), { once: true });
})();
