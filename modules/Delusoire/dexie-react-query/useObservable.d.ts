export interface InteropableObservable<T> {
    subscribe(onNext: (x: T) => any, onError?: (error: any) => any): (() => any) | {
        unsubscribe(): any;
    };
    getValue?(): T;
    hasValue?(): boolean;
}
export declare function useObservable<T, TDefault>(observable: InteropableObservable<T>): T | undefined;
export declare function useObservable<T, TDefault>(observable: InteropableObservable<T>, defaultResult: TDefault): T | TDefault;
export declare function useObservable<T>(observableFactory: () => InteropableObservable<T>, deps?: any[]): T | undefined;
export declare function useObservable<T, TDefault>(observableFactory: () => InteropableObservable<T>, deps: any[], defaultResult: TDefault): T | TDefault;
