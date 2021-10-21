/*
 * Observer
 * 메시지를 전달하기 위한 객체
 */
export class Observer {
  private readonly observers: ObserverType.Subscriber[];
  private prevActionType: string = '';
  private prevValue: any = null;

  constructor() {
    this.observers = [];
  }

  /**
   * addObserver
   * 구독자를 추가한다.
   *
   * @param observer {Subscriber}
   * @returns {number} index of observers
   */
  public addObserver(observer: ObserverType.Subscriber): number {
    this.observers.push(observer);
    return this.observers.length;
  }

  /**
   * broadcast
   * 등록된 모든 구독자에게 메시지를 전달한다.
   *
   * @param actionType {string}
   * @param nextValue {any}
   */
  public broadcast(actionType: string, nextValue: any) {
    for (const observer of this.observers) {
      observer.updateStatus(actionType, nextValue);
      this.prevActionType = actionType;
      this.prevValue = nextValue;
    }
  }

  /**
   * clearObservers
   * 모든 구독자들을 제거한다.
   */
  public clearObservers(): void {
    for (const observer of this.observers) {
      observer.destroy();
    }
    this.observers.length = 0;
  }
}
