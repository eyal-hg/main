/* HK Dashboard — bootstrap */
  if(location.hash==='#ops') history.replaceState(null,'',location.pathname+location.search);
  renderRail(); renderBoard(); updateOpsBtn(); refreshMsgBadge();
  setRole('advisor');   /* ברירת המחדל בטעינה — התצוגה שעובדים בה */
  /* תפריט המשתמש בפס העליון — ניהול, הגדרות והתנתקות. */
  window.meTg=function(e){
    e.stopPropagation();
    const m=document.getElementById('meMenu'), b=document.getElementById('meBtn');
    const on=!m.classList.contains('on');
    m.classList.toggle('on',on); b.setAttribute('aria-expanded',on);
  };
  window.meClose=function(){
    const m=document.getElementById('meMenu'), b=document.getElementById('meBtn');
    if(m)m.classList.remove('on'); if(b)b.setAttribute('aria-expanded','false');
  };
  window.meGo=function(k){
    meClose();
    if(k==='admin'){ if(typeof openAdmin==='function') openAdmin(); return; }
    if(typeof toast==='function') toast('בדמו: התנתקות מהמערכת');
  };
  document.addEventListener('click',e=>{ if(!e.target.closest('.me-wrap')) meClose(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') meClose(); });

  /* בורר התצוגה גלוי תמיד — ההסתרה עם דאבל-קליק על הלוגו ירדה לבקשת אייל. */
  /* כניסה ישירה לדשבורד חברה — ?hp=<ח.פ> (ממסך הלקוחות של היועץ) */
  (function(){
    const hp=new URLSearchParams(location.search).get('hp'); if(!hp) return;
    const ix=CLIENTS.findIndex(c=>c.hp===hp);
    if(ix>=0) selectClient(ix);
  })();
