/* =====================================================================
   js/docs-links.js — שכבת מוקאפ בלבד (לא מוצר): שני אייקונים ליד ה-"?"
   בפס העליון, "פיתוח" ו"בדיקות", שפותחים את לוח המשימות (board/index.html)
   על המסך הנוכחי. המפתח = אותו מפתח של מנוע העזרה (hkHelpKey), כדי שלא
   יהיה מקור אמת שני. הלוח: ארבעה טאבים לכל מסך — אפיון · נשאר לפתח ·
   תיקונים · בדיקות — ומסך "מרכז" לכולם.
   ===================================================================== */
(function(){
var MAP={
  'cli.dash':'owner-dash', 'adv.clients':'portfolio', 'mgr.clients':'portfolio',
  'adv.today':'today', 'mgr.ops':'today', 'mgr.today':'today',
  'adv.tasks':'tasks', 'mgr.tasks':'tasks', 'adv.comm':'comm', 'mgr.comm':'comm',
  'co.meetings':'company-meetings', 'cli.meetings':'company-meetings',
  'co.calls':'calls-company', 'co.metrics':'metrics', 'co.acct':'acct',
  'co.past':'cashflow-ai', 'cli.past':'cashflow-ai', 'co.dash':'json-widget',
  'cli.chat':'client-ai', 'co.chat':'client-ai', 'cli.fcast':'client-readonly', 'co.fcast':'client-readonly'
};
var ICO={
  dev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5L14 17a2.1 2.1 0 0 1-3 0l-4-4a2.1 2.1 0 0 1 0-3l5.7-5.7z"/><path d="M3 21l6-6"/></svg>',
  chk:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
};
function open(tab){
  var key=(typeof hkHelpKey==='function')?hkHelpKey():'';
  var sc=MAP[key]||'general';
  window.open('board/index.html#screen='+sc+(tab?'&tab='+tab:''),'_blank','noopener');
}
function mk(id,ico,title,tab){
  var b=document.createElement('button');
  b.className='tb-help tb-docs'; b.id=id; b.type='button'; b.title=title+' (מוקאפ)';
  b.setAttribute('aria-label',title); b.innerHTML=ico; b.onclick=function(){open(tab)};
  return b;
}
function boot(){
  var host=document.querySelector('.topbar .top-right'); if(!host||document.getElementById('tbDev')) return;
  var ref=document.getElementById('tbHelp');
  var dev=mk('tbDev',ICO.dev,'פיתוח — אפיון, מה נשאר לפתח ותיקונים במסך הזה',''),
      chk=mk('tbChk',ICO.chk,'בדיקות — מה נשאר לבדוק במסך הזה','check');
  if(ref&&ref.parentNode===host){ host.insertBefore(chk,ref); host.insertBefore(dev,chk); }
  else { host.appendChild(dev); host.appendChild(chk); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
setTimeout(boot,300);
})();
