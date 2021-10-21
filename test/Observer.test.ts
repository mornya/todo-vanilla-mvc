import { Observer } from '@/utils/Observer';

let observer: Observer;

beforeEach(() => (observer = new Observer()));
afterEach(() => observer.clearObservers());

describe('Observer module test', () => {
  /******/

  it('Observer.addObserver (gets observer count)', () => {
    const subscriber: ObserverType.Subscriber = {
      updateStatus() {},
      destroy() {},
    };

    expect(observer.addObserver(subscriber)).toBe(1);
    expect(observer.addObserver(subscriber)).toBe(2);
  });

  it('Observer.broadcast (only observer)', () => {
    const subscriber: ObserverType.Subscriber = {
      updateStatus(actionType: string, nextValue: any) {
        expect(actionType).toBe('TEST_ACTION');
        expect(nextValue).toBe('TEST_VALUE');
      },
      destroy() {},
    };

    observer.addObserver(subscriber);
    observer.broadcast('TEST_ACTION', 'TEST_VALUE');
  });

  it('Observer.broadcast (to multi observers)', () => {
    const subscriber1: ObserverType.Subscriber = {
      updateStatus(actionType: string, nextValue: any) {
        expect(actionType).toBe('TEST_ACTION2');
        expect(nextValue).toBe('TEST_VALUE2');
      },
      destroy() {},
    };
    const subscriber2: ObserverType.Subscriber = {
      updateStatus(actionType: string, nextValue: any) {
        expect(actionType).toBe('TEST_ACTION2');
        expect(nextValue).toBe('TEST_VALUE2');
      },
      destroy() {},
    };
    const subscriber3: ObserverType.Subscriber = {
      updateStatus(actionType: string, nextValue: any) {
        expect(actionType).toBe('TEST_ACTION2');
        expect(nextValue).toBe('TEST_VALUE2');
      },
      destroy() {},
    };

    observer.addObserver(subscriber1);
    observer.addObserver(subscriber2);
    observer.addObserver(subscriber3);
    observer.broadcast('TEST_ACTION2', 'TEST_VALUE2');
  });

  /******/
});
