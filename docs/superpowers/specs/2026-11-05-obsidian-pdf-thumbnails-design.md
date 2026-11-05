# PDF Thumbnails —— Obsidian 插件设计文档（v1）

- **状态**：已通过设计评审（2026-11-05）
- **作者**：kbmjj123
- **关联仓库**：`vue-pdf-thumbnails`（已发布，含 `packages/core` 与 `packages/react`）；本插件为**全新独立 Obsidian 社区插件**

---

## 1. 概述与目标

### 1.1 背景
我们已构建 `vue-pdf-thumbnails`（Vue 3 PDF 预览库），其内核引擎被抽成框架无关的
`@kbmjj123/pdf-thumbnails-core` 包（含 pdf.js 渲染 + Web Worker + 虚拟滚动懒加载）。
本插件目标：把同一套内核能力带进 **Obsidian**，让笔记里的 PDF 引用以"页面缩略图网格"形式呈现，
并支持点击放大查看，提升在笔记中浏览/定位 PDF 页面的体验。

### 1.2 目标（v1）
- 阅读模式下，`![[文件.pdf]]` 嵌入**不再**渲染成 Obsidian 原生 PDF 查看器，改为渲染**页面缩略图网格**。
- 点击某页缩略图，在**笔记内弹出 lightbox** 放大查看该页（不离开当前笔记、不打开新视图）。
- 复用已发布的 `@kbmjj123/pdf-thumbnails-core` 内核，pdf.js 及其 decode worker 已内置（worker 运行时从 jsDelivr CDN 拉取）。

### 1.3 非目标（v1 不做）
- 缩略图上的可选文本层 / 批注层叠加（缩略图尺寸下无意义）。
- 多 PDF 合集网格、代码块替代入口、自定义语法。
- `![[文件.pdf#page=3]]` 深链高亮 / 滚动定位。
- 页面选择 / 导出 / 连续处理（那是 minopdf.com 站点的事，与本插件无关）。

---

## 2. 产品形态与范围边界

| 维度 | v1 决定 |
| --- | --- |
| 插件类型 | 独立 Obsidian 社区插件（新仓库，新 id `pdf-thumbnails`，display `PDF Thumbnails`） |
| 主入口 | 笔记内联缩略图（覆盖原生 `![[pdf]]` 嵌入） |
| 触发方式 | 覆盖原生 `![[文件.pdf]]` 嵌入 → 缩略图网格 |
| 点击行为 | 笔记内 lightbox 放大（prev/next、Esc/点外部关闭） |
| 复用策略 | 依赖已发布的 `@kbmjj123/pdf-thumbnails-core`，import 内核引擎 |

**YAGNI 红线**：v1 不引入文本/批注层、不引入多选/导出、不做代码块入口。
任何"顺手加上"的功能若不在第 1.2 节，一律推迟到 v2+。

---

## 3. 架构与目录结构

沿用现有 `json-toolbox` 插件（Obsidian 社区插件）的工程约定：

- 包管理：**仅 pnpm**，`package.json` 保留 `"packageManager": "pnpm@10.14.0"`；唯一锁文件 `pnpm-lock.yaml`。
- 构建：`esbuild` 产出 `main.js`（gitignore，只走 release 资产）。
- 样式：全部集中在根目录 `styles.css`，**不在 TS 里注入内联样式**（Obsidian 审核 Error 级坑）。
- i18n：`src/i18n.ts` 提供 `zh` / `en` 双语文案，按 Obsidian 界面语言选择。
- 测试：`vitest` + `jsdom`，`obsidian` 纯类型包经 `vitest.config.ts` 的 alias 指向 `src/__mocks__/obsidian.ts`；新增涉及 Obsidian API 的模块同步补 mock。
- 发版：`manifest.json` 与 `package.json` 的 `version` **必须相等**；tag 与版本**完全一致且不含 `v` 前缀**；CI 生成 build provenance attestation 后发 release。

### 3.1 目录树
```
pdf-thumbnails/
  manifest.json              # id: pdf-thumbnails, version 与 package.json 一致
  package.json               # name obsidian-pdf-thumbnails, packageManager pnpm@10.14.0
  esbuild.config.mjs         # 产出 main.js（gitignore）
  tsconfig.json
  eslint.config.mjs          # eslint-plugin-obsidianmd recommended + type-aware
  vitest.config.ts
  styles.css
  src/
    main.ts                  # 入口：注册 embed 覆盖、加载设置、i18n
    settings.ts              # PdfThumbnailsSettings 接口 + DEFAULT_SETTINGS
    i18n.ts                  # zh / en 文案
    embed-override.ts        # 覆盖 ![[pdf]] 嵌入（守卫 + 回退）
    grid.ts                  # 由内核产出渲染缩略图网格（虚拟滚动）
    lightbox.ts              # 笔记内放大浮层
    engine-adapter.ts        # TFile/ArrayBuffer → core 的 File[]，桥接引擎
    __mocks__/obsidian.ts    # vitest 用
    __tests__/*.test.ts
  .github/workflows/release.yml   # 镜像 json-toolbox 发版 CI
```

---

## 4. 核心机制：覆盖原生 `![[pdf]]` 嵌入

### 4.1 做法
守卫式 monkey-patch `Embed.prototype.loadFile`（或等价加载钩子）：
当加载到 PDF 类型的嵌入时，清空原生内容并注入我们的缩略图网格。

包裹逻辑须满足：
- `try/catch` 包裹整段 patch 与每次渲染调用；
- Obsidian 版本特性探测（如 `app.getVersion()` 或 `Embed` 原型是否存在目标方法），不兼容版本直接跳过 patch；
- 任何异常 → **回退到原生 PDF 嵌入**，绝不破坏笔记渲染。

### 4.2 开关
设置项 `overrideEmbeds`（默认 `true`）：关闭即恢复原生 `![[pdf]]` 行为。
插件 `onunload` 时还原被 patch 的原型方法。

### 4.3 已知风险与缓解
| 风险 | 缓解 |
| --- | --- |
| 跨 Obsidian 版本内部 API 脆弱 | 特性探测 + try/catch，失败即跳过/回退 |
| 与原生 PDF 视图冲突 | `overrideEmbeds` 开关可关；卸载还原 |
| 社区审核对"深度 patch 内部"敏感 | 仅 Error 级阻断；本地 `pnpm lint` 复现；patch 段补 `-- 原因` 注释 |

> 备注：也可考虑 `app.embedRegistry.registerExtension('pdf', ...)`，但其与原生 PDF 嵌入的优先级/共存行为不确定；
> v1 采用 `loadFile` 守卫式 patch（社区成熟做法），若实测冲突再切换方案。

---

## 5. 数据流

1. 嵌入元素解析出 `data-path` →
   `app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath)` 得到 `TFile`。
2. `app.vault.readBinary(file)` → `ArrayBuffer` → 包成 `File`（`type: 'application/pdf'`）。
3. `engine-adapter.ts`：构造 `PdfPreviewEngine(build)`，其中
   `build = createPdfPreviewBuilder([file])`（来自 core 包）。
4. 内核**虚拟滚动**渲染可视区页面 → 产出每页 bitmap（canvas / blob URL）+ 页码。
5. `grid.ts`：把 bitmap 排成 `columns` 列网格（`<img>` + 页码角标）；
   滚动时按需调用内核 `ensure()` 下一窗口（复用内核懒加载，大 PDF 也流畅）。
6. 点击某页 → `lightbox.ts` 弹出固定浮层显示该页大图，支持 prev/next、Esc / 点击外部关闭。

### 5.1 网格高度
Obsidian 嵌入容器有默认高度限制。v1 方案：网格在嵌入容器内**内部滚动**，
容器高度由设置项或可滚动区域决定（优先不撑破笔记排版）。具体数值在实现期定（参考 `maxPages` + `columns`）。

---

## 6. 设置项（v1 最小集）

| 键 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `overrideEmbeds` | `boolean` | `true` | 是否覆盖 `![[pdf]]` 嵌入 |
| `columns` | `number` | `3` | 缩略图列数 |
| `thumbWidth` | `number` | `160` | 缩略图宽度 px |
| `maxPages` | `number` | `12` | 初始渲染页数（滚动懒加载余下） |

新增设置项须成组改动：`PdfThumbnailsSettings` 接口 + `DEFAULT_SETTINGS` +
`i18n.ts` 的 `zh`/`en` 两侧文案 + README 的开关数量描述（沿用 json-toolbox 约定）。

---

## 7. i18n

`src/i18n.ts` 提供 `zh` / `en`，按 `app.vault.getConfig('lang')` 或 Obsidian 界面语言选择。
需覆盖文案：加载中、第 X / Y 页、空、渲染错误、lightbox 关闭提示等。
新增文案须双语同步。

---

## 8. 错误处理与回退

| 场景 | 行为 |
| --- | --- |
| 文件不存在 / 非 PDF | 回退原生嵌入或显示小错误条 |
| 内核渲染报错 | 回退原生 PDF 嵌入 |
| CDN worker 拉取失败 | 回退原生 PDF 嵌入 |
| 原型 patch 失败 | 整段跳过，笔记保持原生行为 |

所有回退路径必须**不抛未捕获异常**、**不遗留半渲染 DOM**。

---

## 9. 测试

- `vitest` + `jsdom`，`obsidian` 经 alias 指向 `src/__mocks__/obsidian.ts`；
  `src/__tests__/setup.ts` 补齐 Obsidian 的 DOM helper（参考 json-toolbox）。
- 覆盖：
  - 路径解析（`getFirstLinkpathDest` 的 mock）；
  - 网格构建（给定内核产出的 bitmap/页码，验证 DOM 结构、列数、页码角标）；
  - embed 覆盖守卫与回退逻辑（注入抛错时断言回退到原生）；
  - 设置默认值与合并。
- pdf.js / Worker 在 jsdom 难跑 → **mock 内核引擎**，只测 DOM/逻辑层；
  内核本身的正确性问题由 `vue-pdf-thumbnails` 侧的测试与已发布产物保证。

---

## 10. 发版与前置依赖

### 10.1 前置：先发布 core
`@kbmjj123/pdf-thumbnails-core` 尚未发布到 npm（截至本设计时只发了 `vue-pdf-thumbnails@0.1.0`）。
插件依赖它，故**发版顺序**：先 `pnpm --filter @kbmjj123/pdf-thumbnails-core publish`，再发本插件。
插件侧 `pnpm add @kbmjj123/pdf-thumbnails-core`（锁版本，建议 `^0.1.0` 起步）。

### 10.2 CI（镜像 json-toolbox）
`.github/workflows/release.yml`：
1. `corepack enable` 按 `packageManager` 装 pnpm；
2. `pnpm install --frozen-lockfile`；
3. `pnpm typecheck` + `pnpm test`；
4. 版本校验（`manifest.json` == `package.json` == tag，tag 不含 `v` 前缀）；
5. `pnpm build`（esbuild 产出 `main.js`）；
6. 为 `main.js` / `manifest.json` / `styles.css` 生成 build provenance attestation；
7. 发 release（标题含版本号）。

### 10.3 运行时注意
- worker 从 jsDelivr CDN 拉取需联网；Obsidian webview 的 CSP 理论宽松，但属**已知风险点**。
- 若实测被 CSP 拦截，后续改为**本地打包 worker**（v1 不阻塞，列为已知限制）。

---

## 11. 范围边界（YAGNI 复核）

**v1 包含**：embed 覆盖（带开关/回退）、虚拟滚动缩略图网格、页码角标、点击→lightbox、
最小设置 4 项、zh/en i18n、错误回退、vitest 测试、发版 CI。

**v1 不做**：文本/批注叠加层、多 PDF 合集网格、代码块入口、`#page=` 深链高亮、
选择/导出、连续处理。

---

## 12. 开放问题（实现期定，不影响设计）

- 网格容器高度与内部滚动策略的最终数值（`maxPages` × `columns` 的初值）。
- 是否对 `![[pdf#page=N]]` 做"高亮/滚动到该页"（v1 不做，但接口预留）。
- 若 Obsidian 未来版本移除 `Embed.prototype.loadFile` 可 patch 性，回退方案（registerExtension）。

---

## 13. 自审（Spec Self-Review）

- **占位符扫描**：无 TBD/TODO/空白章节；第 12 节为明确的实现期决策，非遗漏。
- **内部一致性**：第 2/3/4/11 节对"覆盖原生嵌入 + 开关 + 回退"的描述一致；第 10.1 节前置依赖与用户已确认的"方案 A（依赖已发布 core）"一致。
- **范围检查**：聚焦单一插件、单一入口，适合一个实现计划；无需要拆除的子项目。
- **歧义检查**：lightbox "笔记内"定义为"不打开新视图/不导航离开当前笔记"的浮层（第 1.2/5.6 节一致）；"虚拟滚动"含义由内核保证（第 5.4 节引用 core 既有能力）。
