// Simple theme initialization and toggle handling.
// Sets html[data-theme] on load and wires #themeToggle click.
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

  function init(){
    const saved = getSavedTheme();
    const theme = saved || detectSystem();
    applyTheme(theme);
    if (!saved) saveTheme(theme);

    const btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  globalThis.SLT = globalThis.SLT || {};
  globalThis.SLT.theme = { applyTheme, getSavedTheme, detectSystem, toggleTheme };
})();
