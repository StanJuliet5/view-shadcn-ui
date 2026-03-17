---
title: 宏录制器 (Macro Recorder)
---

# 介绍

<br />

`ShadcnMacro` 是一个基于原生浏览器事件的**操作录制与回放**组件。它可以录制用户在页面上的交互行为（点击、输入、滚动、键盘快捷键等），并将这些操作以结构化 JSON 格式保存，之后可以在浏览器中自动回放，实现"录制一次，自动执行"的效果。

> **技术原理**：组件通过 `addEventListener` 捕获 DOM 事件，为每个事件生成 CSS 选择器路径，在回放时通过 `querySelector` 定位元素并触发对应的合成事件（`click()`、`dispatchEvent`、`focus()` 等），配合时间戳实现精确的时序回放。

## 用法

::: raw

<CodeRunner title="基础用法">
    <ShadcnMacro>
        <div class="p-6 flex flex-col gap-4 border rounded-lg">
            <p class="text-sm text-gray-500">点击右下角的 ⏸ 按钮打开控制面板，然后点击"开始录制"来录制您的操作。</p>
            <input id="demo-input" class="border rounded px-3 py-2 text-sm w-full" placeholder="在此输入文字..." />
            <div class="flex gap-2">
                <button id="demo-btn-a" class="px-4 py-2 bg-blue-500 text-white rounded text-sm">按钮 A</button>
                <button id="demo-btn-b" class="px-4 py-2 bg-green-500 text-white rounded text-sm">按钮 B</button>
            </div>
        </div>
    </ShadcnMacro>
</CodeRunner>

:::

::: details 查看代码

```vue
<template>
  <ShadcnMacro>
    <div class="p-6 flex flex-col gap-4 border rounded-lg">
      <p class="text-sm text-gray-500">点击右下角按钮打开控制面板，录制您的操作。</p>
      <input id="demo-input" class="border rounded px-3 py-2 text-sm w-full" placeholder="在此输入文字..." />
      <div class="flex gap-2">
        <button id="demo-btn-a" class="px-4 py-2 bg-blue-500 text-white rounded text-sm">按钮 A</button>
        <button id="demo-btn-b" class="px-4 py-2 bg-green-500 text-white rounded text-sm">按钮 B</button>
      </div>
    </div>
  </ShadcnMacro>
</template>

<script setup lang="ts">
import { ShadcnMacro } from 'view-shadcn-ui'
</script>
```

:::

## 回放速度 (replaySpeed)

支持 `0.5x`、`1x`、`2x`、`4x` 多种速度倍率，也可以通过 `replaySpeed` 属性设置默认速度。

::: details 查看代码

```vue
<template>
  <!-- 以 2 倍速回放 -->
  <ShadcnMacro :replay-speed="2">
    <slot />
  </ShadcnMacro>
</template>
```

:::

## 导入 / 导出宏

录制完成后，可以点击导出按钮将宏保存为 `.json` 文件；也可以通过导入按钮加载已保存的宏文件，实现跨会话共享自动化脚本。

::: details 导出的 JSON 格式示例

```json
{
  "name": "我的宏",
  "createdAt": 1710000000000,
  "actions": [
    { "type": "click", "selector": "#demo-btn-a", "timestamp": 500 },
    { "type": "input", "selector": "#demo-input", "timestamp": 1200, "value": "Hello World" },
    { "type": "keydown", "selector": "#demo-input", "timestamp": 1800, "key": "Enter", "code": "Enter" }
  ]
}
```

:::

## 宏录制器 (Macro Recorder) 属性

<ApiTable title="宏录制器 (Macro Recorder) 属性"
    :headers="['属性', '描述', '类型', '默认值']"
    :columns="[
      ['records', '初始宏列表（v-model:records）', 'MacroRecord[]', '[]'],
      ['replaySpeed', '回放速度倍率（1 = 原速）', 'number', '1'],
      ['visible', '是否显示悬浮控制面板', 'boolean', 'true'],
      ['target', '录制范围限定的 CSS 选择器，留空则为整个页面', 'string', ''],
    ]">
</ApiTable>

## 宏录制器 (Macro Recorder) 事件

<ApiTable title="宏录制器 (Macro Recorder) 事件"
    :headers="['事件', '描述', '回调参数']"
    :columns="[
      ['on-record-start', '开始录制时触发', '-'],
      ['on-record-stop', '停止录制并保存宏时触发', 'record: MacroRecord'],
      ['on-replay-start', '开始回放时触发', 'record: MacroRecord'],
      ['on-replay-complete', '回放完成时触发', 'record: MacroRecord'],
      ['on-replay-error', '回放某个操作失败时触发', 'record, action, error'],
      ['update:records', '宏列表变化时触发（支持 v-model:records）', 'records: MacroRecord[]'],
    ]">
</ApiTable>

## 宏录制器 (Macro Recorder) 方法

通过 `ref` 获取组件实例后，可以调用以下方法进行编程控制：

<ApiTable title="宏录制器 (Macro Recorder) 方法"
    :headers="['方法', '描述', '参数']"
    :columns="[
      ['startRecording()', '以编程方式开始录制', '-'],
      ['stopRecording()', '以编程方式停止录制并保存宏', '-'],
      ['startReplay(record)', '以编程方式回放指定宏', 'record: MacroRecord'],
      ['stopReplay()', '中止正在进行的回放', '-'],
      ['exportRecord(record)', '导出宏为 JSON 文件', 'record: MacroRecord'],
      ['deleteRecord(index)', '删除指定序号的宏', 'index: number'],
    ]">
</ApiTable>

## MacroRecord 类型

```typescript
interface MacroRecord {
  name: string         // 宏名称
  createdAt: number    // 创建时间戳
  actions: MacroAction[]
}

interface MacroAction {
  type: 'click' | 'input' | 'change' | 'scroll' | 'keydown' | 'focus' | 'blur'
  selector: string     // 目标元素的 CSS 选择器
  timestamp: number    // 相对于录制开始的毫秒数
  value?: string       // 输入值（input/change 事件）
  scrollX?: number     // 横向滚动位置
  scrollY?: number     // 纵向滚动位置
  key?: string         // 按键名称（keydown 事件）
  code?: string        // 按键代码（keydown 事件）
}
```
