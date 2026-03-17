<template>
  <div class="shadcn-macro">
    <!-- Floating control panel -->
    <div v-if="visible"
         class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">

      <!-- Expanded panel -->
      <div v-if="panelOpen"
           class="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-80">

        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-sm text-gray-700">{{ t('macro.text.title') }}</span>
          <div class="flex items-center gap-2">
            <span v-if="isRecording"
                  class="flex items-center gap-1 text-xs text-red-500 font-medium">
              <span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              {{ t('macro.text.recording') }}
            </span>
            <span v-if="isReplaying"
                  class="flex items-center gap-1 text-xs text-blue-500 font-medium">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
              {{ t('macro.text.replaying') }}
            </span>
          </div>
        </div>

        <!-- New macro name input -->
        <div v-if="!isRecording && !isReplaying" class="mb-3">
          <input
              v-model="newMacroName"
              class="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              :placeholder="t('macro.placeholder.name')"
          />
        </div>

        <!-- Recording controls -->
        <div class="flex gap-2 mb-3">
          <button
              v-if="!isRecording"
              :disabled="isReplaying"
              class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              @click="startRecording"
          >
            <span class="inline-block w-2 h-2 rounded-full bg-white"/>
            {{ t('macro.text.startRecord') }}
          </button>
          <button
              v-else
              class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              @click="stopRecording"
          >
            <span class="inline-block w-2 h-2 bg-white"/>
            {{ t('macro.text.stopRecord') }}
          </button>
        </div>

        <!-- Saved records list -->
        <div v-if="internalRecords.length > 0" class="space-y-2 max-h-48 overflow-y-auto">
          <div
              v-for="(record, index) in internalRecords"
              :key="record.createdAt"
              class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 group"
          >
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-700 truncate">{{ record.name }}</div>
              <div class="text-xs text-gray-400">
                {{ record.actions.length }} {{ t('macro.text.actions') }}
              </div>
            </div>
            <button
                :disabled="isRecording || isReplaying"
                class="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                :title="t('macro.text.replay')"
                @click="startReplay(record)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button
                :disabled="isRecording || isReplaying"
                class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
                :title="t('macro.text.export')"
                @click="exportRecord(record)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button
                :disabled="isRecording || isReplaying"
                class="p-1 text-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
                :title="t('macro.text.delete')"
                @click="deleteRecord(index)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-else-if="!isRecording" class="text-xs text-gray-400 text-center py-2">
          {{ t('macro.text.empty') }}
        </div>

        <!-- Import -->
        <div class="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <label
              class="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium border border-gray-200 hover:border-gray-300 text-gray-600 rounded-lg cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            {{ t('macro.text.import') }}
            <input type="file" accept=".json" class="hidden" @change="importRecord"/>
          </label>
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <span>{{ t('macro.text.speed') }}:</span>
            <select
                v-model="replaySpeedInternal"
                class="text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none"
            >
              <option :value="0.5">0.5x</option>
              <option :value="1">1x</option>
              <option :value="2">2x</option>
              <option :value="4">4x</option>
            </select>
          </div>
        </div>

        <!-- Replay progress -->
        <div v-if="isReplaying" class="mt-3">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>{{ t('macro.text.replayProgress') }}</span>
            <span>{{ replayIndex }} / {{ replayTotal }}</span>
          </div>
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
                class="h-full bg-blue-500 transition-all duration-300"
                :style="{ width: replayTotal > 0 ? `${(replayIndex / replayTotal) * 100}%` : '0%' }"
            />
          </div>
        </div>
      </div>

      <!-- Toggle button -->
      <button
          :class="[
            'w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors',
            isRecording ? 'bg-red-500 hover:bg-red-600' : isReplaying ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'
          ]"
          :title="t('macro.text.title')"
          @click="panelOpen = !panelOpen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path v-if="isRecording" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          <path v-else-if="isReplaying" d="M8 5v14l11-7z"/>
          <path v-else d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
        <span v-if="isRecording" class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 animate-ping"/>
      </button>
    </div>

    <!-- Default slot content -->
    <slot/>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { t } from '@/utils/locale'
import { MacroAction, MacroEmits, MacroProps, MacroRecord } from './types'

const emit = defineEmits<MacroEmits>()
const props = withDefaults(defineProps<MacroProps>(), {
  records: () => [],
  replaySpeed: 1,
  visible: true,
  target: ''
})

// State
const panelOpen = ref(false)
const isRecording = ref(false)
const isReplaying = ref(false)
const newMacroName = ref('')
const replayIndex = ref(0)
const replayTotal = ref(0)
const replaySpeedInternal = ref(props.replaySpeed)
const internalRecords = ref<MacroRecord[]>([...props.records])

// Track current recording session
let currentActions: MacroAction[] = []
let recordingStartTime = 0
let replayTimeoutIds: ReturnType<typeof setTimeout>[] = []

// ─── Utility: Build a CSS selector path for an element ───────────────────────
function buildSelector(el: Element): string
{
    if (!el || el === document.body) {
        return 'body'
    }

    // Prefer ID
    if (el.id) {
        return `#${ el.id }`
    }

    const parts: string[] = []
    let current: Element | null = el

    while (current && current !== document.body) {
        let part = current.tagName.toLowerCase()

        // Add meaningful classes (skip utility-only classes like Tailwind)
        const staticClasses = Array.from(current.classList).filter(c => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(c) && !c.startsWith('hover:') && !c.startsWith('focus:') && !c.startsWith('active:'))
        if (staticClasses.length > 0 && staticClasses.length <= 3) {
            part += '.' + staticClasses.slice(0, 2).join('.')
        }

        // Add nth-child for disambiguation
        const parent = current.parentElement
        if (parent) {
            const siblings = Array.from(parent.children).filter(s => s.tagName === current!.tagName)
            if (siblings.length > 1) {
                const idx = siblings.indexOf(current) + 1
                part += `:nth-of-type(${ idx })`
            }
        }

        parts.unshift(part)
        current = current.parentElement
    }

    return parts.join(' > ')
}

// ─── Recording ────────────────────────────────────────────────────────────────
function getRoot(): Document | Element
{
    if (props.target) {
        return document.querySelector(props.target) ?? document
    }
    return document
}

function recordEvent(event: Event)
{
    // Ignore events originating from within the macro panel itself
    const panel = document.querySelector('.shadcn-macro')
    if (panel && panel.contains(event.target as Node)) {
        return
    }

    const el = event.target as Element
    if (!el || typeof el.tagName === 'undefined') {
        return
    }

    const timestamp = Date.now() - recordingStartTime
    const selector = buildSelector(el)
    let action: MacroAction | null = null

    switch (event.type) {
        case 'click': {
            const me = event as MouseEvent
            action = {
                type: 'click',
                selector,
                timestamp,
                offsetX: me.offsetX,
                offsetY: me.offsetY
            }
            break
        }
        case 'input': {
            const ie = event as InputEvent
            action = {
                type: 'input',
                selector,
                timestamp,
                value: (ie.target as HTMLInputElement).value
            }
            break
        }
        case 'change': {
            action = {
                type: 'change',
                selector,
                timestamp,
                value: (event.target as HTMLInputElement).value
            }
            break
        }
        case 'scroll': {
            const scrollTarget = event.target === document ? document.documentElement : (event.target as Element)
            action = {
                type: 'scroll',
                selector: event.target === document ? 'html' : selector,
                timestamp,
                scrollX: scrollTarget.scrollLeft,
                scrollY: scrollTarget.scrollTop
            }
            break
        }
        case 'keydown': {
            const ke = event as KeyboardEvent
            // Only record shortcut keys and functional keys to avoid duplicating input events
            if (ke.ctrlKey || ke.metaKey || ke.altKey || ke.key === 'Enter' || ke.key === 'Tab' || ke.key === 'Escape' || ke.key.startsWith('Arrow') || ke.key === 'Backspace' || ke.key === 'Delete') {
                action = {
                    type: 'keydown',
                    selector,
                    timestamp,
                    key: ke.key,
                    code: ke.code
                }
            }
            break
        }
        case 'focus': {
            action = {
                type: 'focus',
                selector,
                timestamp
            }
            break
        }
        case 'blur': {
            action = {
                type: 'blur',
                selector,
                timestamp
            }
            break
        }
    }

    if (action) {
        currentActions.push(action)
    }
}

function startRecording()
{
    currentActions = []
    recordingStartTime = Date.now()
    isRecording.value = true

    const root = getRoot()
    root.addEventListener('click', recordEvent, true)
    root.addEventListener('input', recordEvent, true)
    root.addEventListener('change', recordEvent, true)
    root.addEventListener('scroll', recordEvent, true)
    root.addEventListener('keydown', recordEvent, true)
    root.addEventListener('focus', recordEvent, true)
    root.addEventListener('blur', recordEvent, true)

    emit('on-record-start')
}

function stopRecording()
{
    isRecording.value = false

    const root = getRoot()
    root.removeEventListener('click', recordEvent, true)
    root.removeEventListener('input', recordEvent, true)
    root.removeEventListener('change', recordEvent, true)
    root.removeEventListener('scroll', recordEvent, true)
    root.removeEventListener('keydown', recordEvent, true)
    root.removeEventListener('focus', recordEvent, true)
    root.removeEventListener('blur', recordEvent, true)

    if (currentActions.length === 0) {
        return
    }

    const record: MacroRecord = {
        name: newMacroName.value.trim() || `Macro ${ internalRecords.value.length + 1 }`,
        createdAt: Date.now(),
        actions: [...currentActions]
    }

    internalRecords.value.push(record)
    newMacroName.value = ''
    currentActions = []

    emit('on-record-stop', record)
    emit('update:records', internalRecords.value)
}

// ─── Replay ───────────────────────────────────────────────────────────────────
async function startReplay(record: MacroRecord)
{
    if (isReplaying.value || isRecording.value) {
        return
    }

    isReplaying.value = true
    replayIndex.value = 0
    replayTotal.value = record.actions.length
    emit('on-replay-start', record)

    const speed = replaySpeedInternal.value

    for (let i = 0; i < record.actions.length; i++) {
        const action = record.actions[i]
        const prevTimestamp = i === 0 ? 0 : record.actions[i - 1].timestamp
        const delay = Math.max(0, (action.timestamp - prevTimestamp) / speed)

        await new Promise<void>(resolve => {
            const id = setTimeout(() => {
                replayIndex.value = i + 1
                try {
                    executeAction(action)
                }
                catch (err) {
                    emit('on-replay-error', record, action, err as Error)
                }
                resolve()
            }, delay)
            replayTimeoutIds.push(id)
        })

        if (!isReplaying.value) {
            // Replay was cancelled
            return
        }
    }

    isReplaying.value = false
    emit('on-replay-complete', record)
}

function stopReplay()
{
    replayTimeoutIds.forEach(id => clearTimeout(id))
    replayTimeoutIds = []
    isReplaying.value = false
    replayIndex.value = 0
}

function executeAction(action: MacroAction)
{
    const el = document.querySelector(action.selector) as HTMLElement | null

    if (!el) {
        return
    }

    switch (action.type) {
        case 'click':
            el.click()
            break
        case 'input': {
            const inputEl = el as HTMLInputElement
            const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
            if (nativeInputSetter && inputEl.tagName.toLowerCase() === 'input') {
                nativeInputSetter.call(inputEl, action.value ?? '')
            }
            else if (nativeTextareaSetter && inputEl.tagName.toLowerCase() === 'textarea') {
                nativeTextareaSetter.call(inputEl, action.value ?? '')
            }
            else {
                (inputEl as HTMLInputElement).value = action.value ?? ''
            }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }))
            inputEl.dispatchEvent(new Event('change', { bubbles: true }))
            break
        }
        case 'change': {
            const changeEl = el as HTMLInputElement | HTMLSelectElement
            if (changeEl.tagName.toLowerCase() === 'select') {
                (changeEl as HTMLSelectElement).value = action.value ?? ''
            }
            else {
                (changeEl as HTMLInputElement).value = action.value ?? ''
            }
            changeEl.dispatchEvent(new Event('change', { bubbles: true }))
            break
        }
        case 'scroll':
            el.scrollTo({ left: action.scrollX ?? 0, top: action.scrollY ?? 0, behavior: 'smooth' })
            break
        case 'keydown':
            el.dispatchEvent(new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: action.key ?? '',
                code: action.code ?? ''
            }))
            break
        case 'focus':
            el.focus()
            break
        case 'blur':
            el.blur()
            break
    }
}

// ─── Import / Export ──────────────────────────────────────────────────────────
function exportRecord(record: MacroRecord)
{
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ record.name.replace(/\s+/g, '-') }.json`
    a.click()
    URL.revokeObjectURL(url)
}

function importRecord(event: Event)
{
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) {
        return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const record = JSON.parse(e.target?.result as string) as MacroRecord
            if (!record.actions || !Array.isArray(record.actions)) {
                return
            }
            internalRecords.value.push(record)
            emit('update:records', internalRecords.value)
        }
        catch (_) {
            // Invalid JSON, silently ignore
        }
    }
    reader.readAsText(file)

    // Reset input so the same file can be imported again
    input.value = ''
}

function deleteRecord(index: number)
{
    internalRecords.value.splice(index, 1)
    emit('update:records', internalRecords.value)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
watch(() => props.records, (val) => {
    internalRecords.value = [...val]
}, { deep: true })

watch(() => props.replaySpeed, (val) => {
    replaySpeedInternal.value = val
})

onMounted(() => {
    panelOpen.value = false
})

onUnmounted(() => {
    if (isRecording.value) {
        stopRecording()
    }
    if (isReplaying.value) {
        stopReplay()
    }
})

// Expose for programmatic access
defineExpose({ startRecording, stopRecording, startReplay, stopReplay, exportRecord, deleteRecord })
</script>
