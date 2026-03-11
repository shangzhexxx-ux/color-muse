# Color Muse（色彩工具）

上传图片，自动提取 5 个主色并生成可下载的色卡 PNG。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物输出在 `dist/`。

## Webify 一键部署（最短流程）

1. 打开 Webify 控制台（腾讯云 Web 应用托管）：https://cloud.tencent.com/product/webify
2. 新建应用 → 选择「Git 导入」
3. 选择代码仓库与分支（通常 `main`）
4. 构建配置按如下填写：
   - 安装命令：`npm install`
   - 构建命令：`npm run build`
   - 输出目录：`dist`
5. 点击部署，等待完成后用默认域名访问（`.app.tcloudbase.com`）

## 环境要求

- Node.js：>= 18

