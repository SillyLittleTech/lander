// donors.js — renders tech-donor circular icons with hover tooltips.
// Used on donate.html (full-size) and index.html (compact "With help from" strip).
"use strict";

// ── Shared floating tooltip (appended once to body; bypasses overflow clipping) ──
let _tooltip = null;
let _hideTimer = null;

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

function cancelHide() {
  if (_hideTimer) {
    clearTimeout(_hideTimer);
    _hideTimer = null;
  }
}

function scheduleHide() {
  cancelHide();
  _hideTimer = setTimeout(() => {
    if (_tooltip) _tooltip.classList.remove("donor-tooltip--visible");
  }, 120);
}

// Hide whenever the page scrolls so stale positions don't linger
window.addEventListener("scroll", scheduleHide, { passive: true });

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

  let top;
  if (placeBelow) {
    top = iconRect.bottom + scrollY + 12;
    tt.classList.add("donor-tooltip--below");
  } else {
    top = iconRect.top + scrollY - ttHeight - 12;
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
 * Fetches a tech-donors JSON file and renders circular logo icons with
 * hover tooltips into the given container element.
 *
 * @param {string} containerSelector  CSS selector for the target element.
 * @param {string} jsonPath           Path/URL to tech-donors.json.
 */
function renderTechDonors(containerSelector, jsonPath) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${jsonPath}`);
      return res.json();
    })
    .then((donors) => {
      container.innerHTML = "";
      donors.forEach((donor) => {
        container.appendChild(buildDonorIcon(donor));
      });
    })
    .catch((err) => {
      console.error("donors.js: error rendering donors:", err);
    });
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

// Expose via the shared SLT namespace
globalThis.SLT = globalThis.SLT || {};
globalThis.SLT.donors = { renderTechDonors };
