<template>
  <div class="p-4">
    <ShadcnRecorder v-model="recordedEvents" :height="400" @start="onStart" @stop="onStop">
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">录制操作演示</h3>

        <div class="space-y-2">
          <label class="text-sm font-medium">用户名</label>
          <ShadcnInput v-model="username" placeholder="请输入用户名"/>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">角色</label>
          <ShadcnSelect v-model="role">
            <template #options>
              <ShadcnSelectOption value="admin" label="管理员"/>
              <ShadcnSelectOption value="editor" label="编辑"/>
              <ShadcnSelectOption value="viewer" label="查看者"/>
            </template>
          </ShadcnSelect>
        </div>

        <div class="flex items-center gap-2">
          <ShadcnSwitch v-model="enabled"/>
          <span class="text-sm">启用账户</span>
        </div>

        <ShadcnButton type="primary" @click="handleSubmit">提交</ShadcnButton>
      </div>
    </ShadcnRecorder>

    <div v-if="recordedEvents.length > 0" class="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
      已录制 {{ recordedEvents.length }} 个事件，点击「回放」按钮可重播这些操作。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const role = ref('viewer')
const enabled = ref(true)
const recordedEvents = ref([])

const onStart = () => {
  console.log('开始录制')
}

const onStop = (events) => {
  console.log('录制停止，共', events.length, '个事件')
}

const handleSubmit = () => {
  alert(`提交成功`)
}
</script>
