// Simple theme initialization and toggle handling.
// Sets html[data-theme] on load and wires #themeToggle click.
(function(){
  const html = document.documentElement;

  function getSavedTheme(){
    try { return localStorage.getItem('theme'); } catch(e) { return null; }
  }

  function saveTheme(t){
    try{ localStorage.setItem('theme', t); }catch(e){}
  }

  function applyTheme(t){
    if(!t) return;
    html.setAttribute('data-theme', t);
  }

  function detectSystem(){
    try{ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch(e){ return 'light'; }
  }

  function toggleTheme(){
    const current = html.getAttribute('data-theme') || 'light';
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

  window.SLT = window.SLT || {};
  window.SLT.theme = { applyTheme, getSavedTheme, detectSystem, toggleTheme };
})();
