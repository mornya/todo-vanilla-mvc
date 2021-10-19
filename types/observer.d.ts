/*
 * observer.d.ts
 */

declare namespace ObserverType {
  type Subscriber = {
    updateStatus(actionType: string, nextValue: any): void;
    destroy(): void;
  };
}
