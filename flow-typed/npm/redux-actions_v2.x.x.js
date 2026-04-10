declare module 'redux-actions' {
    declare export function createAction(type: string, payloadCreator?: any): any
    declare export function handleActions(handlers: { [string]: any }, defaultState: any): any
}
