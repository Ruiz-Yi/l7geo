# L7Editor React 示例站点

使用 React + Vite 搭建一个类似 https://l7editor.antv.antgroup.com/ 的站点，集成 @antv/l7-editor 并提供基础地图编辑体验。

## 功能目标
- 在单页应用中嵌入 L7Editor React 组件，默认提供地图场景与基础图层编辑能力。
- 预置全屏布局与全局样式，方便直接体验或二次开发。
- 支持本地开发调试、构建发布。

## 技术栈
- React 18 + Vite
- @antv/l7-editor（React 组件）

## 快速开始
1. 安装依赖
   ```bash
   npm install
   ```
2. 本地开发（指定端口示例 5174）
   ```bash
   npm run dev -- --host 0.0.0.0 --port 5174
   ```
3. 生产构建
   ```bash
   npm run build
   ```
4. 预览构建产物
   ```bash
   npm run preview
   ```

## URL 传参加载 GeoJSON
- 支持通过查询参数传入 GeoJSON：`?geojson=<编码后的字符串>`。
- 传入方式：
  - 直接传字符串化的 GeoJSON（需 URI 编码），例如：`?geojson=%7B%22type%22%3A%22FeatureCollection%22%2C...%7D`
  - 或传入可访问的远程链接（http/https），会自动 fetch 获取 JSON。
- 支持格式：`FeatureCollection`、单个 `Feature`、或 `Feature[]` 数组。
- 解析失败或 WebGL 不可用时会展示友好提示。

## 最小代码示例
```jsx
// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import 'antd/dist/reset.css';

createRoot(document.getElementById('app')).render(<App />);
```

```jsx
// src/App.jsx
import React from 'react';
import { L7Editor } from '@antv/l7-editor';
import { GeoJsonEditor } from '@antv/l7-editor/es/components';

const mapOption = {
  center: [120.19382669582967, 30.258134],
  zoom: 11,
  pitch: 0,
  style: 'light',
};

export default function App() {
  return (
    <div className="page">
      <L7Editor
        className="editor"
        mapOption={mapOption}
        activeTab="geojson"
        tabItems={[{ key: 'geojson', label: 'GeoJSON', children: <GeoJsonEditor /> }]}
        coordConvert="WGS84"
        mapControl={{ saveMapOptionsControl: false }}
        toolbar={false}
      />
    </div>
  );
}
```

```css
/* src/style.css */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: sans-serif;
  background: #f5f5f5;
}
.page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.editor {
  width: 100%;
  height: 100vh;
}
```

## 开发要点
- 样式：当前 npm 包未附带编译后的 CSS，可先引入 `antd/dist/reset.css`；若后续官方发布 CSS，再改为本地或 CDN 引入。
- 默认 WGS84 坐标系，默认缩放 11；保存控件与顶部 toolbar 已禁用，右侧面板通过 `tabItems` 挂载 `GeoJsonEditor`。
- 地图底图：在 `mapOption` 中调整中心点、缩放、底图样式。
- 资源访问：若需加载在线瓦片/数据，注意网络与跨域策略。

## 常见问题
- **空白/报错**：确保使用 React 环境运行（L7Editor 是 React 组件），安装了 `react`/`react-dom`，并使用 Vite React 配置。
- **构建失败**：确保 Node 版本满足 Vite 需求（建议 >= 18）。

## 参考
- L7Editor 仓库：https://github.com/antvis/L7Editor
- 在线示例：https://l7editor.antv.antgroup.com/
- Vite 文档：https://vitejs.dev/guide/

## Monaco 编辑器配置（Vite）
- 已使用 `vite-plugin-monaco-editor`，无需 webpack 配置；如需调整语言可在 `vite.config.js` 的 `monacoEditorPlugin({ languages: [...] })` 中修改。
