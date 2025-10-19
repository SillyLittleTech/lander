// Theme and link initialization run after DOM is ready to avoid errors when elements are missing.
const htmlElement = document.documentElement;

document.addEventListener('DOMContentLoaded', () => {
    debugLog('DOMContentLoaded fired');
    // Theme: prefer saved preference, otherwise use system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
        htmlElement.setAttribute('data-theme', saved);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Wire theme toggle if present
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            debugLog('Theme toggled to ' + newTheme);
        });
    }

    // Render links from links.json
    debugLog('Calling renderLinks');
    renderLinks('#linksContainer', 'links.json');
});

/**
 * Fetches a JSON file containing an array of links and renders them into the page.
 * Each link object may have: { title, url, subtitle, target }
 */
function renderLinks(containerSelector, jsonPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    // Show a visible loading message so it's obvious the script ran
    container.innerHTML = '<p class="links-loading">Loading links</p>';
    console.log('renderLinks: fetching', jsonPath);
    debugLog('renderLinks: fetching ' + jsonPath);

    fetch(jsonPath)
        .then(res => {
            if (!res.ok) throw new Error('Failed to load links.json');
            return res.json();
        })
        .then(links => {
            // Clear container
            container.innerHTML = '';
            console.log('renderLinks: got', links.length, 'links');
            debugLog('renderLinks: got ' + links.length + ' links');

            links.forEach(link => {
                const a = document.createElement('a');
                a.className = 'link-button';
                a.href = link.url || '#';
                if (link.target) a.target = link.target;

                const span = document.createElement('span');
                span.className = 'link-title';
                span.textContent = link.title || link.url || 'Link';

                a.appendChild(span);

                // Optional subtitle
                if (link.subtitle) {
                    const sub = document.createElement('div');
                    sub.className = 'link-subtitle';
                    sub.textContent = link.subtitle;
                    a.appendChild(sub);
                }

                container.appendChild(a);
            });
        })
        .catch(err => {
            console.error('Error rendering links:', err);
            // Fallback: show an error message in the UI so it's visible
            const msg = err && err.message ? err.message : 'unknown error';
            container.innerHTML = '<p class="links-error">Could not load links: ' + msg + '</p>';
            debugLog('renderLinks error: ' + msg);
        });
}

// Debug logger: buffer messages until unlocked by clicking the avatar 5x
let _debugEnabled = false;
let _debugBuffer = [];

function debugLog(message) {
    // always log to console for developers
    console.log(message);
    const time = new Date().toLocaleTimeString();
    const entry = time + ' — ' + message;

    if (!_debugEnabled) {
        // buffer until unlocked
        _debugBuffer.push(entry);
        // keep buffer reasonably small
        if (_debugBuffer.length > 200) _debugBuffer.shift();
        return;
    }

    // when enabled, ensure box exists and prepend
    let box = document.getElementById('scriptDebugBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'scriptDebugBox';
        box.style.position = 'fixed';
        box.style.left = '12px';
        box.style.bottom = '12px';
        box.style.maxWidth = '420px';
        box.style.background = 'rgba(0,0,0,0.6)';
        box.style.color = 'white';
        box.style.fontSize = '12px';
        box.style.padding = '8px';
        box.style.borderRadius = '8px';
        box.style.zIndex = 99999;
        box.style.whiteSpace = 'pre-wrap';
        box.style.pointerEvents = 'none';
        document.body.appendChild(box);
    }

    box.textContent = entry + '\n' + box.textContent;
}

// Unlock debug mode by clicking the avatar 5 times quickly
function setupAvatarDebugUnlock() {
    const avatar = document.querySelector('.avatar');
    if (!avatar) return;

    let clicks = 0;
    let timer = null;

    avatar.addEventListener('click', () => {
        clicks += 1;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 3000); // 3s window to complete sequence

        if (clicks >= 5) {
            clicks = 0;
            _debugEnabled = true;
            // flush buffer into the visible box
            let box = document.getElementById('scriptDebugBox');
            if (!box) {
                box = document.createElement('div');
                box.id = 'scriptDebugBox';
                box.style.position = 'fixed';
                box.style.left = '12px';
                box.style.bottom = '12px';
                box.style.maxWidth = '420px';
                box.style.background = 'rgba(0,0,0,0.6)';
                box.style.color = 'white';
                box.style.fontSize = '12px';
                box.style.padding = '8px';
                box.style.borderRadius = '8px';
                box.style.zIndex = 99999;
                box.style.whiteSpace = 'pre-wrap';
                box.style.pointerEvents = 'none';
                document.body.appendChild(box);
            }

            // flush buffer
            box.textContent = _debugBuffer.reverse().join('\n') + '\n' + box.textContent;
            _debugBuffer = [];
            debugLog('Debug mode unlocked (avatar clicked 5x)');
        }
    });
}

// initialize avatar unlock after DOM is ready
document.addEventListener('DOMContentLoaded', () => setupAvatarDebugUnlock());
