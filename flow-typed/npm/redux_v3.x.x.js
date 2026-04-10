declare module 'redux' {
    declare export function applyMiddleware(...middlewares: any[]): any
    declare export function compose(...funcs: any[]): any
    declare export function createStore(reducer: any, enhancer?: any): any
    declare export type Store<S, A> = any
    declare export type Dispatch<A> = any
}
