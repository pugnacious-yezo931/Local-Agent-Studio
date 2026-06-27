const { endpoint, fetchJson } = require("./fetch.cjs");

function pickProvider(settings, overrideProvider) {
  const requested = overrideProvider || settings.search.provider || "searxng";
  if (requested !== "auto") {
    return requested;
  }
  if (settings.searxng.baseUrl) {
    return "searxng";
  }
  if (settings.serpApi.apiKey) {
    return "serpapi";
  }
  if (settings.ollamaSearch.apiKey) {
    return "ollama";
  }
  return "searxng";
}

function normalizeResult(result, source) {
  return {
    title: result.title || result.name || "Untitled result",
    url: result.url || result.link || result.href || "",
    content: result.content || result.snippet || result.description || result.raw_content || "",
    source,
  };
}

async function searchSearxng(query, settings, maxResults) {
  const url = new URL(endpoint(settings.searxng.baseUrl, "/search"));
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("language", "auto");

  const data = await fetchJson(url.toString(), { timeoutMs: 20000 });
  return (data.results || []).slice(0, maxResults).map((result) => normalizeResult(result, "SearXNG"));
}

async function searchSerpApi(query, settings, maxResults) {
  if (!settings.serpApi.apiKey) {
    throw new Error("SerpAPI key is missing");
  }

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", settings.serpApi.engine || "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", settings.serpApi.apiKey);
  url.searchParams.set("num", String(maxResults));
  if (settings.serpApi.location) {
    url.searchParams.set("location", settings.serpApi.location);
  }

  const data = await fetchJson(url.toString(), { timeoutMs: 30000 });
  const organic = Array.isArray(data.organic_results) ? data.organic_results : [];
  const answer = data.answer_box
    ? [
        normalizeResult(
          {
            title: data.answer_box.title || "Answer box",
            link: data.answer_box.link,
            snippet: data.answer_box.answer || data.answer_box.snippet,
          },
          "SerpAPI",
        ),
      ]
    : [];

  return [...answer, ...organic.map((result) => normalizeResult(result, "SerpAPI"))].slice(0, maxResults);
}

async function searchOllamaWeb(query, settings, maxResults) {
  if (!settings.ollamaSearch.apiKey) {
    throw new Error("Ollama Web Search API key is missing");
  }

  const data = await fetchJson("https://ollama.com/api/web_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.ollamaSearch.apiKey}`,
    },
    body: JSON.stringify({ query, max_results: maxResults }),
    timeoutMs: 30000,
  });

  return (data.results || []).slice(0, maxResults).map((result) => normalizeResult(result, "Ollama Web Search"));
}

async function searchWeb({ query, provider, settings }) {
  const selected = pickProvider(settings, provider);
  const maxResults = Math.max(1, Math.min(Number(settings.search.maxResults || 5), 10));

  if (!query || !query.trim()) {
    throw new Error("Search query is empty");
  }

  if (selected === "serpapi") {
    return { provider: selected, results: await searchSerpApi(query.trim(), settings, maxResults) };
  }

  if (selected === "ollama") {
    return { provider: selected, results: await searchOllamaWeb(query.trim(), settings, maxResults) };
  }

  return { provider: "searxng", results: await searchSearxng(query.trim(), settings, maxResults) };
}

module.exports = {
  searchWeb,
};
