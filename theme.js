// Simple theme initialization and toggle handling.
// Sets html[data-theme] on load, injects #themeToggle if absent, and wires click.
(function(){
  const html = document.documentElement;

  function getSavedTheme(){
    try { return localStorage.getItem('theme'); } catch(e) { console.warn(e); return null; }
  }

  function saveTheme(t){
    try{ localStorage.setItem('theme', t); }catch(e){ console.warn(e); }
  }

  function applyTheme(t){
    if(!t) return;
    html.dataset.theme = t;
  }

  function detectSystem(){
    try{ return globalThis.matchMedia && globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch(e){ console.warn(e); return 'light'; }
  }

  function toggleTheme(){
    const current = html.dataset.theme || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
    saveTheme(next);
    return next;
  }

  // Inject the shared theme-toggle button into <body> so pages don't each need
  // to duplicate the markup.  Any page that already contains #themeToggle keeps
  // its own element unchanged.  Called only from init(), which itself only runs
  // once the DOM is ready, so document.body is always available at this point.
  function injectThemeToggleButton(){
    if (!document.body) return null;
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'themeToggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML =
      '<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="5"></circle>' +
        '<line x1="12" y1="1" x2="12" y2="3"></line>' +
        '<line x1="12" y1="21" x2="12" y2="23"></line>' +
        '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>' +
        '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>' +
        '<line x1="1" y1="12" x2="3" y2="12"></line>' +
        '<line x1="21" y1="12" x2="23" y2="12"></line>' +
        '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>' +
        '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' +
      '</svg>' +
      '<svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' +
      '</svg>';
    document.body.appendChild(btn);
    return btn;
  }

  function init(){
    const saved = getSavedTheme();
    const theme = saved || detectSystem();
    applyTheme(theme);
    if (!saved) saveTheme(theme);

    let btn = document.getElementById('themeToggle');
    if (!btn) btn = injectThemeToggleButton();
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  globalThis.SLT = globalThis.SLT || {};
  globalThis.SLT.theme = { applyTheme, getSavedTheme, detectSystem, toggleTheme };
})();
