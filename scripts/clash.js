// Clash Verge Rev：替换此前的扩展脚本，不是导入为订阅文件。
// 保留订阅节点、DNS 和既有规则；新增规则优先，原有最终 MATCH 改走日常上网。
function main(config) {
  const prefix = "便捷 · ";
  const daily = prefix + "日常上网";
  const auto = prefix + "自动低延迟";
  const manual = prefix + "固定节点";
  const ai = prefix + "AI服务";
  const video = prefix + "视频服务";
  const testUrl = "https://www.gstatic.com/generate_204";
  const exclude = "(?i)中国|中國|大陆|大陸|china|\\bcn\\b|🇨🇳|剩余|到期|流量|套餐|官网|官網";
  const regionDefs = [
    ["香港自动", "(?i)香港|港|hong[ -]?kong|\\bhk[0-9]*\\b|🇭🇰"],
    ["台湾自动", "(?i)台湾|台灣|taiwan|\\btw[0-9]*\\b|🇹🇼"],
    ["日本自动", "(?i)日本|东京|東京|大阪|japan|tokyo|osaka|\\bjp[0-9]*\\b|🇯🇵"],
    ["新加坡自动", "(?i)新加坡|狮城|獅城|singapore|\\bsg[0-9]*\\b|🇸🇬"],
    ["美国自动", "(?i)美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|西雅图|西雅圖|united[ -]?states|america|\\bus[0-9]*\\b|\\busa\\b|🇺🇸"]
  ];

  function autoGroup(name, filter, lazy) {
    const group = {
      name, type: "url-test", "include-all": true,
      "exclude-filter": exclude, "empty-fallback": "REJECT",
      url: testUrl, interval: 60, timeout: 5000,
      tolerance: 50, lazy, "expected-status": 204
    };
    if (filter) group.filter = filter;
    return group;
  }

  // Provider 节点需要在 provider 自己的健康检查中启用定期测速。
  for (const provider of Object.values(config["proxy-providers"] || {})) {
    if (!provider || typeof provider !== "object") continue;
    provider["health-check"] = Object.assign({}, provider["health-check"], {
      enable: true, url: testUrl, interval: 60,
      timeout: 5000, lazy: false, "expected-status": 204
    });
  }

  const regionNames = regionDefs.map(item => prefix + item[0]);
  const choices = [auto, ...regionNames, manual];
  const additions = [
    { name: daily, type: "select", proxies: choices.slice() },
    { name: ai, type: "select", proxies: [daily, ...choices] },
    { name: video, type: "select", proxies: [daily, ...choices] },
    autoGroup(auto, null, false),
    ...regionDefs.map(item => autoGroup(prefix + item[0], item[1], true)),
    { name: manual, type: "select", "include-all": true,
      "exclude-filter": exclude, "empty-fallback": "REJECT" }
  ];

  const oldGroups = (config["proxy-groups"] || [])
    .filter(group => !group.name.startsWith(prefix));
  // 仅向旧组插入日常入口；新组不引用旧组，避免形成循环。
  for (const group of oldGroups) {
    if (group.type !== "select") continue;
    group.proxies = [daily, ...(group.proxies || []).filter(p => p !== daily)];
  }
  config["proxy-groups"] = [...additions, ...oldGroups];

  const aiDomains = [
    "chatgpt.com", "openai.com", "oaistatic.com", "oaiusercontent.com",
    "claude.ai", "anthropic.com", "gemini.google.com",
    "aistudio.google.com", "generativelanguage.googleapis.com"
  ];
  const videoDomains = [
    "youtube.com", "youtu.be", "googlevideo.com", "ytimg.com",
    "youtubei.googleapis.com", "netflix.com", "netflix.net",
    "nflxvideo.net", "nflximg.net", "nflximg.com", "nflxso.net", "nflxext.com"
  ];
  const customRules = [
    ...aiDomains.map(domain => "DOMAIN-SUFFIX," + domain + "," + ai),
    ...videoDomains.map(domain => "DOMAIN-SUFFIX," + domain + "," + video),
    "GEOSITE,cn,DIRECT"
  ];
  let hasMatch = false;
  const originalRules = (config.rules || []).filter(rule =>
    !rule.includes("," + prefix)
  ).map(rule => {
    if (/^MATCH\s*,/i.test(rule)) {
      hasMatch = true;
      return "MATCH," + daily;
    }
    return rule;
  });
  // 可重复执行时，前一轮生成的 MATCH 已被移除，因此补回。
  if (!hasMatch) originalRules.push("MATCH," + daily);
  config.rules = [...new Set([...customRules, ...originalRules])];
  config.mode = "rule";
  return config;
}
