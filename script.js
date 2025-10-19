// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', currentTheme);

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Optional: Add smooth scroll behavior for navigation
document.addEventListener('DOMContentLoaded', () => {
    // Check system preference on first load if no saved preference
    if (!localStorage.getItem('theme')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
    // Render links from links.json
    renderLinks('#linksContainer', 'links.json');
});

/**
 * Fetches a JSON file containing an array of links and renders them into the page.
 * Each link object may have: { title, url, subtitle, target }
 */
function renderLinks(containerSelector, jsonPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    fetch(jsonPath)
        .then(res => {
            if (!res.ok) throw new Error('Failed to load links.json');
            return res.json();
        })
        .then(links => {
            // Clear container
            container.innerHTML = '';

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
            // Fallback: leave container empty or show a message
            container.innerHTML = '<p class="links-error">Could not load links.</p>';
        });
}
