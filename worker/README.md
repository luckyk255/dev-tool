# Curl 代理 Worker

这个 Worker 只转发白名单中的 HTTPS API，并将上游响应体直接透传给浏览器，因此普通 JSON 和 SSE 流式响应都能工作。

## 部署

1. 安装并登录 Wrangler：`npm install -g wrangler`、`wrangler login`。
2. 在 `worker/` 下将 `wrangler.toml.example` 复制为 `wrangler.toml`。
3. 配置两个白名单变量：
   - `ALLOWED_WEB_ORIGINS`：本工具的网页来源，例如 `https://luckyk255.github.io,http://localhost:3000`。本地用 `npx serve .` 时默认是 `http://localhost:3000`。
   - `TARGET_ORIGIN_ALLOWLIST`：允许请求的 API **源**（协议、域名、端口），例如 `https://baiying-claw-ops-test.baiying.com.cn`。
4. 执行 `wrangler deploy`，得到 Worker URL。
5. 在网页 Curl 工具中选择“代理转发”，填入该 URL。

不要使用 `*`，也不要移除目标域名白名单，否则此 Worker 会变成可被滥用的开放代理。Worker 不记录请求体或认证头；请同时在 Cloudflare 控制台保持默认日志脱敏策略，并只把它部署在受信任账号下。
