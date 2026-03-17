export type MacroActionType = 'click' | 'input' | 'change' | 'scroll' | 'keydown' | 'focus' | 'blur'

export interface MacroAction
{
    type: MacroActionType
    selector: string
    timestamp: number
    // value for input/change events
    value?: string
    // scroll position
    scrollX?: number
    scrollY?: number
    // keyboard event details
    key?: string
    code?: string
    // click coordinates (relative to element)
    offsetX?: number
    offsetY?: number
}

export interface MacroRecord
{
    name: string
    createdAt: number
    actions: MacroAction[]
}

export interface MacroProps
{
    // Initial macro records to load
    records?: MacroRecord[]
    // Speed multiplier for replay (1 = real speed, 2 = 2x faster)
    replaySpeed?: number
    // Whether to show the control panel
    visible?: boolean
    // Target element to scope recording within (defaults to document)
    target?: string
}

export interface MacroEmits
{
    (e: 'on-record-start'): void
    (e: 'on-record-stop', record: MacroRecord): void
    (e: 'on-replay-start', record: MacroRecord): void
    (e: 'on-replay-complete', record: MacroRecord): void
    (e: 'on-replay-error', record: MacroRecord, action: MacroAction, error: Error): void
    (e: 'update:records', records: MacroRecord[]): void
}
