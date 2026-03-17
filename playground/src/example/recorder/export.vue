<template>
  <div class="p-4 space-y-4">
    <p class="text-sm text-gray-500">
      录制完成后，可将事件导出为 JSON 文件保存，下次通过导入功能加载并回放。
    </p>

    <ShadcnRecorder v-model="recordedEvents" :height="360" :auto-play="true">
      <div class="p-6 space-y-3">
        <h3 class="text-lg font-semibold">待录制区域</h3>
        <ShadcnInput v-model="text" placeholder="输入一些文字..."/>
        <div class="flex gap-2">
          <ShadcnButton type="primary" @click="fillText">填充示例文本</ShadcnButton>
          <ShadcnButton @click="clearText">清空</ShadcnButton>
        </div>
      </div>
    </ShadcnRecorder>

    <div v-if="recordedEvents.length > 0" class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
      <strong>提示：</strong> 已录制 {{ recordedEvents.length }} 个事件。
      点击「导出」保存为 JSON，下次点击「导入」加载后即可点击「回放」还原所有操作。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const text = ref('')
const recordedEvents = ref([])

const fillText = () => {
  text.value = '你好，世界！'
}

const clearText = () => {
  text.value = ''
}
</script>
