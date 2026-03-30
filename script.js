// Run non-theme initialization after DOM is ready to avoid errors when elements are missing.
document.addEventListener("DOMContentLoaded", () => {
  debugLog("DOMContentLoaded fired");

  // Set up fallback src for images that declare a data-fallback attribute.
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener(
      "error",
      function () {
        if (this.dataset.fallback && this.src !== this.dataset.fallback) {
          this.src = this.dataset.fallback;
        }
      },
      { once: true },
    );
  });

  // Render links from links.json
  debugLog("Calling renderLinks");
  renderLinks("#linksContainer", "links.json");
  debugLog("Calling renderLatestAnnouncement");
  renderLatestAnnouncement(
    "#announcementContainer",
    "https://hcb.hackclub.com/sillylittletech/feed.atom",
  );

  // Render contributor icons from contributors.json
  debugLog("Calling renderContributors");
  renderContributors("#contributorsContainer", "contributors.json");

  // Render footer from includes/footer.html
  debugLog("Calling renderFooter");
  renderFooter("#siteFooter", "includes/footer.html");
});

/**
 * Fetches a JSON file containing an array of links and renders them into the page.
 * Each link object may have: { title, url, subtitle, target }
 */
function renderLinks(containerSelector, jsonPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  // Show a visible loading message so it's obvious the script ran
  container.innerHTML = '<p class="links-loading">Loading links</p>';
  console.log("renderLinks: fetching", jsonPath);
  debugLog(`renderLinks: fetching ${jsonPath}`);

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load links.json");
      return res.json();
    })
    .then((links) => {
      // Clear container
      container.innerHTML = "";
      console.log("renderLinks: got", links.length, "links");
      debugLog(`renderLinks: got ${links.length} links`);

      links.forEach((link) => {
        const anchor = document.createElement("a");
        anchor.className = "link-button";
        anchor.href = link.url || "#";
        if (link.target) anchor.target = link.target;

        const span = document.createElement("span");
        span.className = "link-title";
        span.textContent = link.title || link.url || "Link";

        anchor.appendChild(span);

        // Optional subtitle
        if (link.subtitle) {
          const subtitle = document.createElement("div");
          subtitle.className = "link-subtitle";
          subtitle.textContent = link.subtitle;
          anchor.appendChild(subtitle);
        }

        container.appendChild(anchor);
      });
    })
    .catch((err) => {
      console.error("Error rendering links:", err);
      // Fallback: show an error message in the UI so it's visible
      const msg = err?.message ?? "unknown error";
      container.innerHTML = `<p class="links-error">Could not load links: ${msg}</p>`;
      debugLog(`renderLinks error: ${msg}`);
    });
}

/**
 * Fetches an Atom feed and renders the latest entry as a themed card.
 */
function renderLatestAnnouncement(containerSelector, feedUrl) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML =
    '<p class="announcement-loading">Loading latest announcement…</p>';
  debugLog(`renderLatestAnnouncement: fetching ${feedUrl}`);

  fetch(feedUrl)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load feed (${res.status})`);
      return res.text();
    })
    .then((xmlText) => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");
      const entry = xml.querySelector("entry");
      if (!entry) throw new Error("No entries found in feed");

      const title =
        entry.querySelector("title")?.textContent?.trim() ||
        "Latest announcement";
      const rawSummary =
        entry.querySelector("summary, content")?.textContent?.trim() || "";
      const summary =
        formatFeedExcerpt(rawSummary) || "Read the latest update.";
      const updatedRaw = entry
        .querySelector("updated, published")
        ?.textContent?.trim();
      const updatedDate = updatedRaw ? new Date(updatedRaw) : null;
      const linkEl = entry.querySelector('link[rel="alternate"], link[href]');
      const entryUrl = linkEl?.getAttribute("href") || "#";

      const cardLink = document.createElement("a");
      cardLink.className = "announcement-card";
      cardLink.href = entryUrl;
      cardLink.target = "_blank";
      cardLink.rel = "noopener noreferrer";
      cardLink.setAttribute("aria-label", `Read latest announcement: ${title}`);

      const header = document.createElement("div");
      header.className = "announcement-header";
      header.textContent = "Latest announcement";

      const heading = document.createElement("h3");
      heading.className = "announcement-title";
      heading.textContent = title;

      const body = document.createElement("p");
      body.className = "announcement-summary";
      body.textContent =
        summary.length > 240 ? `${summary.slice(0, 237)}…` : summary;

      const meta = document.createElement("p");
      meta.className = "announcement-meta";
      if (updatedDate && !Number.isNaN(updatedDate.getTime())) {
        meta.textContent = updatedDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } else {
        meta.textContent = "Recently posted";
      }

      cardLink.append(header, heading, body, meta);
      container.innerHTML = "";
      container.appendChild(cardLink);
      debugLog("renderLatestAnnouncement: rendered latest entry");
    })
    .catch((err) => {
      const msg = err?.message ?? "unknown error";
      console.error("Error rendering announcement:", err);
      debugLog(`renderLatestAnnouncement error: ${msg}`);
      container.innerHTML =
        '<p class="announcement-error">Latest announcement is temporarily unavailable.</p>';
    });
}

/**
 * Converts potential HTML-rich feed content into clean plain text for compact card display.
 */
function formatFeedExcerpt(rawText) {
  if (!rawText) return "";

  const decoded = document.createElement("textarea");
  decoded.innerHTML = rawText;
  const decodedText = decoded.value || rawText;
  const plainText = decodedText.replace(/<[^>]*>/g, " ");

  return plainText.replace(/\s+/g, " ").trim();
}

/**
 * Fetches a JSON file containing contributor data and renders round profile icon links.
 * Each contributor object may have: { name, url, avatar, label }
 */
function renderContributors(containerSelector, jsonPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  debugLog(`renderContributors: fetching ${jsonPath}`);

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
      return res.json();
    })
    .then((contributors) => {
      container.innerHTML = "";
      debugLog(`renderContributors: got ${contributors.length} contributors`);

      contributors.forEach((contributor) => {
        const anchor = document.createElement("a");
        anchor.className = "contributor-icon";
        anchor.href = contributor.url || "#";
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.setAttribute(
          "aria-label",
          contributor.label ||
            contributor.name ||
            contributor.url ||
            "Contributor",
        );

        const img = document.createElement("img");
        img.src = contributor.avatar || "";
        img.alt = contributor.name || "";

        anchor.appendChild(img);
        container.appendChild(anchor);
      });
    })
    .catch((err) => {
      const msg = err?.message ?? "unknown error";
      console.error("Error rendering contributors:", err);
      debugLog(`renderContributors error: ${msg}`);
    });
}

/**
 * Fetches an HTML file and injects its content into the target element.
 * Falls back to the original static footer markup already in the page if the fetch fails.
 */
function renderFooter(containerSelector, htmlPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  // Capture whatever static footer HTML is already present so we can restore it on failure
  const originalHTML = container.innerHTML;
  debugLog(`renderFooter: fetching ${htmlPath}`);

  fetch(htmlPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${htmlPath}`);
      return res.text();
    })
    .then((html) => {
      container.innerHTML = html;
      debugLog("renderFooter: footer loaded");
    })
    .catch((err) => {
      const msg = err?.message ?? "unknown error";
      console.error("Error rendering footer:", err);
      debugLog(`renderFooter error: ${msg}`);
      // Fallback: restore the original static footer markup if available
      if (originalHTML && originalHTML.trim() !== "") {
        container.innerHTML = originalHTML;
      } else {
        // Last-resort minimal attribution if no original markup existed
        container.textContent = "© 2026 SillyLittleTech.";
      }
    });
}

let _debugEnabled = false;
let _debugBuffer = [];

/** Returns the debug overlay box, creating it if it doesn't exist yet. */
function getOrCreateDebugBox() {
  let box = document.getElementById("scriptDebugBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "scriptDebugBox";
    box.style.position = "fixed";
    box.style.left = "12px";
    box.style.bottom = "12px";
    box.style.maxWidth = "420px";
    box.style.background = "rgba(0,0,0,0.6)";
    box.style.color = "white";
    box.style.fontSize = "12px";
    box.style.padding = "8px";
    box.style.borderRadius = "8px";
    box.style.zIndex = 99999;
    box.style.whiteSpace = "pre-wrap";
    box.style.pointerEvents = "none";
    document.body.appendChild(box);
  }
  return box;
}

function debugLog(message) {
  // always log to console for developers
  console.log(message);
  const time = new Date().toLocaleTimeString();
  const entry = `${time} — ${message}`;

  if (!_debugEnabled) {
    // buffer until unlocked
    _debugBuffer.push(entry);
    // keep buffer reasonably small
    if (_debugBuffer.length > 200) _debugBuffer.shift();
    return;
  }

  // when enabled, ensure box exists and prepend
  const box = getOrCreateDebugBox();
  box.textContent = `${entry}\n${box.textContent}`;
}

// Unlock debug mode by clicking the avatar 5 times quickly
function setupAvatarDebugUnlock() {
  const avatar = document.querySelector(".avatar");
  if (!avatar) return;

  let clicks = 0;
  let timer = null;

  avatar.addEventListener("click", () => {
    clicks += 1;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      clicks = 0;
    }, 3000); // 3s window to complete sequence

    if (clicks >= 5) {
      clicks = 0;
      _debugEnabled = true;
      // flush buffer into the visible box
      const box = getOrCreateDebugBox();
      box.textContent = `${_debugBuffer.toReversed().join("\n")}\n${box.textContent}`;
      _debugBuffer = [];
      debugLog("Debug mode unlocked (avatar clicked 5x)");
    }
  });
}

// initialize avatar unlock after DOM is ready
document.addEventListener("DOMContentLoaded", () => setupAvatarDebugUnlock());
