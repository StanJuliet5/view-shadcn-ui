<template>
  <div class="shadcn-recorder w-full border rounded-lg overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-2 p-3 bg-gray-50 border-b flex-wrap">
      <template v-if="mode === 'idle'">
        <ShadcnButton size="small" type="primary" @click="startRecord">
          <template #icon>
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-white mr-1"></span>
          </template>
          {{ t('recorder.button.startRecord') }}
        </ShadcnButton>
        <ShadcnButton v-if="events.length > 0" size="small" type="success" @click="startReplay">
          {{ t('recorder.button.replay') }}
        </ShadcnButton>
        <ShadcnButton v-if="events.length > 0" size="small" @click="exportEvents">
          {{ t('recorder.button.export') }}
        </ShadcnButton>
        <label class="cursor-pointer">
          <ShadcnButton size="small" @click="triggerImport">
            {{ t('recorder.button.import') }}
          </ShadcnButton>
          <input ref="importInput" type="file" accept=".json" class="hidden" @change="importEvents"/>
        </label>
      </template>

      <template v-if="mode === 'recording'">
        <ShadcnButton size="small" type="danger" @click="stopRecord">
          <template #icon>
            <span class="inline-block w-2.5 h-2.5 bg-white mr-1"></span>
          </template>
          {{ t('recorder.button.stopRecord') }}
        </ShadcnButton>
        <span class="flex items-center gap-1.5 text-sm text-red-500">
          <span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          {{ t('recorder.text.recording') }} ({{ events.length }} {{ t('recorder.text.events') }})
        </span>
      </template>

      <template v-if="mode === 'replaying'">
        <ShadcnButton size="small" @click="stopReplay">
          {{ t('recorder.button.backToIdle') }}
        </ShadcnButton>
        <span class="text-sm text-gray-500">
          {{ t('recorder.text.replaying') }}
        </span>
      </template>
    </div>

    <!-- Record area: show slot content while idle or recording -->
    <div v-show="mode !== 'replaying'" ref="recordArea" class="relative">
      <slot>
        <div class="p-8 text-center text-gray-400 text-sm select-none">
          {{ t('recorder.text.slotHint') }}
        </div>
      </slot>
      <div v-if="mode === 'recording'"
           class="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        REC
      </div>
    </div>

    <!-- Replay area -->
    <div v-show="mode === 'replaying'" ref="replayContainer" :style="replayStyle" class="bg-gray-900"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { eventWithTime } from 'rrweb/typings/types'
import { RecorderProps, RecorderEmits } from '@/ui/recorder/types.ts'
import { t } from '@/utils/locale'
import { calcSize } from '@/utils/common.ts'
import ShadcnButton from '@/ui/button'

const props = withDefaults(defineProps<RecorderProps>(), {
  modelValue: () => [],
  width: '100%',
  height: 400,
  speed: 1,
  autoPlay: false
})

const emit = defineEmits<RecorderEmits>()

type Mode = 'idle' | 'recording' | 'replaying'

const mode = ref<Mode>('idle')
const events = ref<eventWithTime[]>([...props.modelValue])
const replayContainer = ref<HTMLElement | null>(null)
const importInput = ref<HTMLInputElement | null>(null)

let stopFn: (() => void) | null = null
let playerInstance: any = null

const replayStyle = computed(() => ({
  width: calcSize(props.width),
  height: calcSize(props.height)
}))

watch(() => props.modelValue, (val) => {
  if (val && mode.value === 'idle') {
    events.value = [...val]
  }
})

async function startRecord() {
  const { record } = await import('rrweb')
  events.value = []
  mode.value = 'recording'
  emit('start')
  stopFn = record({
    emit(event: eventWithTime) {
      events.value.push(event)
      emit('update:modelValue', [...events.value])
    }
  }) ?? null
}

function stopRecord() {
  if (stopFn) {
    stopFn()
    stopFn = null
  }
  mode.value = 'idle'
  emit('stop', [...events.value])
  emit('update:modelValue', [...events.value])
}

async function startReplay() {
  if (!events.value.length) return
  mode.value = 'replaying'
  await new Promise<void>(resolve => setTimeout(resolve, 50))
  if (!replayContainer.value) return

  replayContainer.value.innerHTML = ''

  const rrwebPlayer = (await import('rrweb-player')).default
  await import('rrweb-player/dist/style.css')

  playerInstance = new rrwebPlayer({
    target: replayContainer.value,
    props: {
      events: events.value,
      width: replayContainer.value.clientWidth || 800,
      height: (replayContainer.value.clientHeight || 400) - 80,
      autoPlay: props.autoPlay,
      speedOption: [0.5, 1, 2, 4],
      speed: props.speed
    }
  })
}

function stopReplay() {
  if (playerInstance) {
    try { playerInstance.$destroy() } catch (e) { console.warn('[ShadcnRecorder] Failed to destroy player:', e) }
    playerInstance = null
  }
  if (replayContainer.value) {
    replayContainer.value.innerHTML = ''
  }
  mode.value = 'idle'
}

function exportEvents() {
  if (!events.value.length) return
  const blob = new Blob([JSON.stringify(events.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rrweb-recording-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importInput.value?.click()
}

function importEvents(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string)
      if (Array.isArray(parsed)) {
        events.value = parsed
        emit('update:modelValue', [...events.value])
      } else {
        console.warn('[ShadcnRecorder] Imported file is not a valid rrweb events array')
      }
    } catch (e) {
      console.error('[ShadcnRecorder] Failed to parse imported JSON:', e)
    }
  }
  reader.readAsText(file)
  if (importInput.value) importInput.value.value = ''
}

onBeforeUnmount(() => {
  if (stopFn) stopFn()
  if (playerInstance) {
    try { playerInstance.$destroy() } catch (e) { console.warn('[ShadcnRecorder] Failed to destroy player on unmount:', e) }
  }
})
</script>
