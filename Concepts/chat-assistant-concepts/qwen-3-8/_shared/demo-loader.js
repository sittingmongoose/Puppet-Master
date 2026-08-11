window.PMChatDemoLoader = (() => {
  function candidateUrls() {
    const here = new URL(".", document.baseURI).href;
    return [
      here + "_shared/demoData.json",
      here + "../_shared/demoData.json",
      "_shared/demoData.json"
    ];
  }
  async function load() {
    for (const url of candidateUrls()) {
      try {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.schemaVersion === 1 && Array.isArray(data.threads)) return data;
      } catch (e) {}
    }
    throw new Error("demoData.json could not be loaded; serve this folder over http, for example: python3 -m http.server");
  }
  return { load };
})();
