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

Webify 新建入口如果提示“已合并至云开发 CloudBase”，建议按云开发的一键部署方案使用（本仓库已内置 `cloudbaserc.json`）。

## 云开发 CloudBase 一键部署（推荐）

1. 打开云开发控制台：https://console.cloud.tencent.com/tcb
2. 创建或选择一个云开发环境（记下 `环境 ID`，形如 `xxxx-yyy`）
3. 本地安装 CloudBase CLI：

```bash
npm i -g @cloudbase/cli
```

4. 在项目根目录执行登录与部署：

```bash
cloudbase login
ENV_ID=你的环境ID cloudbase framework deploy
```

部署成功后会输出可访问域名。

## GitHub Actions 自动部署（可选）

参考文档：https://docs.cloudbase.net/hosting/cli-devops

1. 在 GitHub 仓库里设置 Secrets：
   - `TCB_SECRET_ID`
   - `TCB_SECRET_KEY`
   - `TCB_ENV_ID`
2. 本仓库已内置工作流文件：`.github/workflows/deploy-cloudbase.yml`
3. 推送到 `main` 分支会自动构建并将 `dist/` 部署到云开发静态托管根路径 `/`。

## 环境要求

- Node.js：>= 18
