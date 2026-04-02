// donors.js — renders tech-donor circular icons with hover tooltips.
// Used on donate.html (full-size) and index.html (compact "With help from" strip).
"use strict";

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

  // ── Tooltip card ─────────────────────────────────────────────────────────
  const tooltip = document.createElement("div");
  tooltip.className = "donor-tooltip";
  tooltip.setAttribute("role", "tooltip");

  const tooltipName = document.createElement("strong");
  tooltipName.className = "donor-tooltip-name";
  tooltipName.textContent = donor.name || "";

  const tooltipDesc = document.createElement("p");
  tooltipDesc.className = "donor-tooltip-desc";
  tooltipDesc.textContent = donor.contribution || "";

  tooltip.appendChild(tooltipName);
  tooltip.appendChild(tooltipDesc);

  if (donor.url) {
    const link = document.createElement("a");
    link.className = "donor-tooltip-link";
    link.href = donor.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Learn more \u2192";
    tooltip.appendChild(link);
  }

  wrap.appendChild(iconEl);
  wrap.appendChild(tooltip);
  return wrap;
}

// Expose via the shared SLT namespace
globalThis.SLT = globalThis.SLT || {};
globalThis.SLT.donors = { renderTechDonors };
