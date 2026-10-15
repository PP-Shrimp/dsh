# dsh Aurora Web Theme Plugin

一个为 DeepSeek Harness（dsh）提供 Aurora 靛蓝配色的 Web 主题插件。它只修改 Web UI 的语义主题 token，不注册工具，也不改变 dsh 内置的 `light`、`dark` 和 `system` 外观选择。

## 构建

```sh
pnpm install
pnpm run build
```

构建会同时生成：

- `lib/index.js`：dsh bundle 所需的 Host 入口（无业务逻辑）
- `lib/client.js`：dsh Web 客户端模块 bundle

## 安装到 web profile

```sh
dsh plugin --profile web add /Users/Admin/SGit/dsh
dsh web
```

如果 Web 服务已经运行，请重启后再查看主题效果，并使用浏览器强制刷新。主题代码位于 `src/client.ts`，可以在 `AURORA_TOKENS` 中分别修改 `light` 和 `dark` 配色。

## 主题特性

- 页面背景、卡片层级和边框
- 主文本、辅助文本和状态文本
- 品牌色和主按钮
- Hover/Active 状态
- 设置卡片、滚动条和 Tooltip
- 自动适配 `light`、`dark`、`system`

主题通过 dsh 官方 `ctx.theme.overrideTokens()` API 实现，禁用或卸载插件后会自动移除覆盖层。

## 选择主题颜色

启动后打开 dsh 的设置页，在 General 中找到 **Theme color / 主题颜色**，点击颜色方块即可选择强调色。选择会实时应用到品牌色、主按钮和交互高亮，并保存到当前 dsh profile；下次启动会自动恢复。
