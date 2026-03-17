import type { eventWithTime } from 'rrweb/typings/types'

export interface RecorderProps
{
    modelValue?: eventWithTime[]
    width?: string | number
    height?: string | number
    speed?: number
    autoPlay?: boolean
}

export interface RecorderEmits
{
    (e: 'update:modelValue', events: eventWithTime[]): void
    (e: 'start'): void
    (e: 'stop', events: eventWithTime[]): void
}
