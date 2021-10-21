import Model from '@/components/Model';
import View from '@/components/View';
import { Observer } from '@/utils/Observer';
import { Store } from '@/utils/Store';

declare global {
  type App = {
    Model: Model;
    View: View;
    Observer: Observer;
    Store: Store;
  };

  type ReactiveTarget<T> = {
    current: T;
  };
}
