# dsh current-time plugin

一个为 DeepSeek Harness（dsh）注册 `current_time` 工具的本地插件。工具在每次调用时读取当前时间，并返回 ISO 8601 UTC 时间、Unix 毫秒时间戳、使用的时区和本地化时间。

## 构建

```sh
npm install
npm run build
```

## 用 `dsh web` 调试本地插件

先构建插件，再用本地覆盖层启动 Web UI：

```sh
npm run build
dsh web --patch /Users/Admin/SGit/dsh/debug.cordis.yml
```

然后打开 <http://127.0.0.1:3080>，向模型发送：

```text
请调用 current_time 工具，告诉我上海现在的时间。
```

也可以直接指定时区：

```text
请调用 current_time 工具，并将 timeZone 设置为 Asia/Tokyo。
```

`debug.cordis.yml` 使用当前工作区的绝对路径 `/Users/Admin/SGit/dsh/lib/index.js`。如果把项目移动到其他目录，请同步修改该文件中的路径。

## 作为 bundle 安装

如果希望把插件加入 `web` profile，而不是每次通过 overlay 加载：

```sh
dsh plugin --profile web add /Users/Admin/SGit/dsh
dsh --profile web
```

`cordis.patch.yml` 是安装 bundle 使用的 patch；`debug.cordis.yml` 只用于本地开发时直接引用构建后的入口文件。

## 工具返回值

`current_time` 的 `timeZone` 参数是可选的 IANA 时区名称，例如 `Asia/Shanghai`、`Asia/Tokyo` 或 `America/Los_Angeles`。不传时使用运行 dsh 进程的本地时区。无效时区会让工具调用失败并返回明确的运行时错误。

实现遵循 dsh 的[工具编写参考](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/cookbook/adding-a-tool.md)和[本地插件调试教程](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/index.zh.md)。
