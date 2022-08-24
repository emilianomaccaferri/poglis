export interface UnitMessage{
    type: 'ping' | 'log',
    value?: string
}