// Run non-theme initialization after DOM is ready to avoid errors when elements are missing.
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOMContentLoaded fired')

  // Render links from links.json
  debugLog('Calling renderLinks')
  renderLinks('#linksContainer', 'links.json')

  // Render footer from includes/footer.html
  debugLog('Calling renderFooter')
  renderFooter('#siteFooter', 'includes/footer.html')
})

/**
 * Fetches a JSON file containing an array of links and renders them into the page.
 * Each link object may have: { title, url, subtitle, target }
 */
function renderLinks (containerSelector, jsonPath) {
  const container = document.querySelector(containerSelector)
  if (!container) return
  // Show a visible loading message so it's obvious the script ran
  container.innerHTML = '<p class="links-loading">Loading links</p>'
  console.log('renderLinks: fetching', jsonPath)
  debugLog(`renderLinks: fetching ${jsonPath}`)

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to load links.json')
      return res.json()
    })
    .then((links) => {
      // Clear container
      container.innerHTML = ''
      console.log('renderLinks: got', links.length, 'links')
      debugLog(`renderLinks: got ${links.length} links`)

      links.forEach((link) => {
        const anchor = document.createElement('a')
        anchor.className = 'link-button'
        anchor.href = link.url || '#'
        if (link.target) anchor.target = link.target

        const span = document.createElement('span')
        span.className = 'link-title'
        span.textContent = link.title || link.url || 'Link'

        anchor.appendChild(span)

        // Optional subtitle
        if (link.subtitle) {
          const subtitle = document.createElement('div')
          subtitle.className = 'link-subtitle'
          subtitle.textContent = link.subtitle
          anchor.appendChild(subtitle)
        }

        container.appendChild(anchor)
      })
    })
    .catch((err) => {
      console.error('Error rendering links:', err)
      // Fallback: show an error message in the UI so it's visible
      const msg = err?.message ?? 'unknown error'
      container.innerHTML = `<p class="links-error">Could not load links: ${msg}</p>`
      debugLog(`renderLinks error: ${msg}`)
    })
}

/**
 * Fetches an HTML file and injects its content into the target element.
 * Falls back to the original static footer markup already in the page if the fetch fails.
 */
function renderFooter (containerSelector, htmlPath) {
  const container = document.querySelector(containerSelector)
  if (!container) return
  // Capture whatever static footer HTML is already present so we can restore it on failure
  const originalHTML = container.innerHTML
  debugLog(`renderFooter: fetching ${htmlPath}`)

  fetch(htmlPath)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${htmlPath}`)
      return res.text()
    })
    .then((html) => {
      container.innerHTML = html
      debugLog('renderFooter: footer loaded')
    })
    .catch((err) => {
      const msg = err?.message ?? 'unknown error'
      console.error('Error rendering footer:', err)
      debugLog(`renderFooter error: ${msg}`)
      // Fallback: restore the original static footer markup if available
      if (originalHTML && originalHTML.trim() !== '') {
        container.innerHTML = originalHTML
      } else {
        // Last-resort minimal attribution if no original markup existed
        container.textContent = '© 2026 SillyLittleTech.'
      }
    })
}

let _debugEnabled = false
let _debugBuffer = []

/** Returns the debug overlay box, creating it if it doesn't exist yet. */
function getOrCreateDebugBox () {
  let box = document.getElementById('scriptDebugBox')
  if (!box) {
    box = document.createElement('div')
    box.id = 'scriptDebugBox'
    box.style.position = 'fixed'
    box.style.left = '12px'
    box.style.bottom = '12px'
    box.style.maxWidth = '420px'
    box.style.background = 'rgba(0,0,0,0.6)'
    box.style.color = 'white'
    box.style.fontSize = '12px'
    box.style.padding = '8px'
    box.style.borderRadius = '8px'
    box.style.zIndex = 99999
    box.style.whiteSpace = 'pre-wrap'
    box.style.pointerEvents = 'none'
    document.body.appendChild(box)
  }
  return box
}

function debugLog (message) {
  // always log to console for developers
  console.log(message)
  const time = new Date().toLocaleTimeString()
  const entry = `${time} — ${message}`

  if (!_debugEnabled) {
    // buffer until unlocked
    _debugBuffer.push(entry)
    // keep buffer reasonably small
    if (_debugBuffer.length > 200) _debugBuffer.shift()
    return
  }

  // when enabled, ensure box exists and prepend
  const box = getOrCreateDebugBox()
  box.textContent = `${entry}\n${box.textContent}`
}

// Unlock debug mode by clicking the avatar 5 times quickly
function setupAvatarDebugUnlock () {
  const avatar = document.querySelector('.avatar')
  if (!avatar) return

  let clicks = 0
  let timer = null

  avatar.addEventListener('click', () => {
    clicks += 1
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      clicks = 0
    }, 3000) // 3s window to complete sequence

    if (clicks >= 5) {
      clicks = 0
      _debugEnabled = true
      // flush buffer into the visible box
      const box = getOrCreateDebugBox()
      box.textContent = `${_debugBuffer.reverse().join('\n')}\n${box.textContent}`
      _debugBuffer = []
      debugLog('Debug mode unlocked (avatar clicked 5x)')
    }
  })
}

// initialize avatar unlock after DOM is ready
document.addEventListener('DOMContentLoaded', () => setupAvatarDebugUnlock())
