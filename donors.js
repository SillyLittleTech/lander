// donors.js — renders tech-donor circular icons with hover tooltips.
// Used on donate.html (full-size) and index.html (compact "With help from" strip).
"use strict";

// ── Shared floating tooltip (appended once to body; bypasses overflow clipping) ──
let _tooltip = null;
let _hideTimer = null;

/**
 * Lazily creates and returns the single shared floating tooltip element,
 * appending it to document.body on first call so it escapes any overflow context.
 * @returns {HTMLElement}
 */
function getTooltip() {
  if (!_tooltip) {
    _tooltip = document.createElement("div");
    _tooltip.className = "donor-tooltip";
    _tooltip.setAttribute("role", "tooltip");
    document.body.appendChild(_tooltip);
    // Keep tooltip alive when cursor moves onto it (so the link is clickable)
    _tooltip.addEventListener("mouseenter", cancelHide);
    _tooltip.addEventListener("mouseleave", scheduleHide);
  }
  return _tooltip;
}

/**
 * Cancels any pending hide timer for the floating tooltip.
 */
function cancelHide() {
  if (_hideTimer) {
    clearTimeout(_hideTimer);
    _hideTimer = null;
  }
}

/**
 * Schedules the floating tooltip to be hidden after a short delay,
 * allowing cursor movement between the icon and the tooltip card.
 */
function scheduleHide() {
  cancelHide();
  _hideTimer = setTimeout(() => {
    if (_tooltip) _tooltip.classList.remove("donor-tooltip--visible");
  }, 120);
}

// Hide whenever the page scrolls so stale positions don't linger
window.addEventListener("scroll", scheduleHide, { passive: true });

/**
 * Positions and shows the floating tooltip for the given donor icon.
 * Automatically flips below the icon when there is insufficient space above.
 * @param {HTMLElement} wrap  The .donor-icon-wrap element being hovered.
 * @param {{ name: string, contribution: string, url?: string }} donor  Donor data.
 */
function showTooltip(wrap, donor) {
  cancelHide();
  const tt = getTooltip();

  // Build content
  tt.innerHTML = "";
  const nameEl = document.createElement("strong");
  nameEl.className = "donor-tooltip-name";
  nameEl.textContent = donor.name || "";

  const descEl = document.createElement("p");
  descEl.className = "donor-tooltip-desc";
  descEl.textContent = donor.contribution || "";

  tt.appendChild(nameEl);
  tt.appendChild(descEl);

  if (donor.url) {
    const linkEl = document.createElement("a");
    linkEl.className = "donor-tooltip-link";
    linkEl.href = donor.url;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = "Learn more \u2192";
    tt.appendChild(linkEl);
  }

  // Measure tooltip height before final placement
  tt.style.visibility = "hidden";
  tt.classList.add("donor-tooltip--visible");

  const iconRect = wrap.getBoundingClientRect();
  const ttHeight = tt.offsetHeight;
  const scrollY = window.scrollY || document.documentElement.scrollTop;

  const centerX = iconRect.left + iconRect.width / 2;
  const spaceAbove = iconRect.top;
  const placeBelow = spaceAbove < ttHeight + 16;

  const top = placeBelow
    ? iconRect.bottom + scrollY + 12
    : iconRect.top + scrollY - ttHeight - 12;

  if (placeBelow) {
    tt.classList.add("donor-tooltip--below");
  } else {
    tt.classList.remove("donor-tooltip--below");
  }

  tt.style.position = "absolute";
  tt.style.top = `${top}px`;
  tt.style.left = `${centerX}px`;
  tt.style.transform = "translateX(-50%)";
  tt.style.visibility = "";
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetches a donors JSON file and renders circular logo icons with
 * hover tooltips into the given container element.
 * Only donors with `featured: true` are shown (up to 5), followed by
 * an "expand" arrow button linking to donors.html.
 *
 * @param {string} containerSelector  CSS selector for the target element.
 * @param {string} jsonPath           Path/URL to donors.json.
 * @param {object} [options]
 * @param {boolean} [options.showExpand=true]  Whether to append the expand arrow.
 */
function renderTechDonors(containerSelector, jsonPath, options) {
  const showExpand = !options || options.showExpand !== false;
  const container = document.querySelector(containerSelector);
  if (!container) return;

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
      return res.json();
    })
    .then((donors) => {
      container.innerHTML = "";
      // Show only featured donors (max 5)
      const featured = donors.filter((d) => d.featured).slice(0, 5);
      featured.forEach((donor) => {
        container.appendChild(buildDonorIcon(donor));
      });
      // Append expand button linking to donors.html
      if (showExpand) {
        container.appendChild(buildExpandButton());
      }
    })
    .catch((err) => {
      console.error("donors.js: error rendering donors:", err);
    });
}

/**
 * Builds the circular "expand" button that links to donors.html.
 * @returns {HTMLElement}
 */
function buildExpandButton() {
  const wrap = document.createElement("div");
  wrap.className = "donor-icon-wrap donor-expand-wrap";

  const link = document.createElement("a");
  link.href = "donors.html";
  link.className = "donor-icon donor-expand-btn";
  link.setAttribute("aria-label", "View all technology partners");
  link.title = "View all technology partners";
  link.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

  wrap.appendChild(link);
  return wrap;
}

/**
 * Builds a single .donor-icon-wrap element for the given donor object.
 * @param {{ name: string, logo: string, contribution: string, url: string }} donor
 * @returns {HTMLElement}
 */
function buildDonorIcon(donor) {
  const wrap = document.createElement("div");
  wrap.className = "donor-icon-wrap";

  // ── Icon ────────────────────────────────────────────────────────────────
  const iconEl = document.createElement("div");
  iconEl.className = "donor-icon";

  const img = document.createElement("img");
  img.src = donor.logo || "";
  img.alt = donor.name || "";

  // Fall back to a text initial when the logo cannot be loaded
  img.addEventListener("error", () => {
    if (img.parentNode) img.parentNode.removeChild(img);
    const letter = document.createElement("span");
    letter.className = "donor-icon-letter";
    letter.textContent = (donor.name || "?")[0].toUpperCase();
    iconEl.appendChild(letter);
  });

  iconEl.appendChild(img);
  wrap.appendChild(iconEl);

  // ── Tooltip: JS-driven floating (appended to body, bypasses overflow) ───
  wrap.addEventListener("mouseenter", () => showTooltip(wrap, donor));
  wrap.addEventListener("mouseleave", scheduleHide);

  return wrap;
}

/**
 * Fetches donors.json and renders ALL donors grouped by tag into the
 * given container element. Each tag becomes a labelled section.
 *
 * @param {string} containerSelector  CSS selector for the target element.
 * @param {string} jsonPath           Path/URL to donors.json.
 */
function renderAllDonors(containerSelector, jsonPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
      return res.json();
    })
    .then((donors) => {
      container.innerHTML = "";

      // Group donors by tag
      const groups = {};
      donors.forEach((donor) => {
        const tag = donor.tag || "Other";
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(donor);
      });

      Object.keys(groups).forEach((tag) => {
        const section = document.createElement("div");
        section.className = "donors-group";

        const heading = document.createElement("h2");
        heading.className = "donors-group-title";
        heading.textContent = tag;
        section.appendChild(heading);

        const list = document.createElement("div");
        list.className = "donors-group-list";

        groups[tag].forEach((donor) => {
          list.appendChild(buildDonorCard(donor));
        });

        section.appendChild(list);
        container.appendChild(section);
      });
    })
    .catch((err) => {
      console.error("donors.js: error rendering all donors:", err);
    });
}

/**
 * Builds an expanded card element for the donors.html page.
 * @param {{ name: string, logo: string, contribution: string, url: string }} donor
 * @returns {HTMLElement}
 */
function buildDonorCard(donor) {
  const card = document.createElement("div");
  card.className = "donor-card";

  const iconEl = document.createElement("div");
  iconEl.className = "donor-icon donor-card-icon";

  const img = document.createElement("img");
  img.src = donor.logo || "";
  img.alt = donor.name || "";
  img.addEventListener("error", () => {
    if (img.parentNode) img.parentNode.removeChild(img);
    const letter = document.createElement("span");
    letter.className = "donor-icon-letter";
    letter.textContent = (donor.name || "?")[0].toUpperCase();
    iconEl.appendChild(letter);
  });
  iconEl.appendChild(img);

  const info = document.createElement("div");
  info.className = "donor-card-info";

  const nameEl = document.createElement("strong");
  nameEl.className = "donor-card-name";
  nameEl.textContent = donor.name || "";

  const descEl = document.createElement("p");
  descEl.className = "donor-card-desc";
  descEl.textContent = donor.contribution || "";

  info.appendChild(nameEl);
  info.appendChild(descEl);

  if (donor.url) {
    const linkEl = document.createElement("a");
    linkEl.className = "donor-card-link";
    linkEl.href = donor.url;
    linkEl.target = "_blank";
    linkEl.rel = "noopener noreferrer";
    linkEl.textContent = "Learn more \u2192";
    info.appendChild(linkEl);
  }

  card.appendChild(iconEl);
  card.appendChild(info);
  return card;
}

// Expose via the shared SLT namespace
globalThis.SLT = globalThis.SLT || {};
globalThis.SLT.donors = { renderTechDonors, renderAllDonors };
