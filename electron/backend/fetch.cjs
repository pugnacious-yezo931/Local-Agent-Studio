function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function endpoint(baseUrl, path) {
  const base = trimTrailingSlash(baseUrl);
  const suffix = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function fetchJson(url, options = {}) {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }
    }

    if (!response.ok) {
      const detail = data?.error || data?.message || data?.raw || response.statusText;
      throw new Error(`${response.status} ${response.statusText}: ${detail}`);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  endpoint,
  fetchJson,
  trimTrailingSlash,
};
