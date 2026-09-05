/* =====================================================================
   js/docs-links.js — שכבת מוקאפ בלבד (לא מוצר): שני אייקונים ליד ה-"?"
   בפס העליון. "פיתוח" פותח את לוח המשימות (board/) — מי שמחובר ורשום
   כמתכנת נוחת ישר בדף שלו. "באג" פותח את דף הדיווח לתמיכה (bug/).
   ===================================================================== */
(function(){
var ICO={
  dev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5L14 17a2.1 2.1 0 0 1-3 0l-4-4a2.1 2.1 0 0 1 0-3l5.7-5.7z"/><path d="M3 21l6-6"/></svg>',
  bug:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2l1.9 1.9M16 2l-1.9 1.9"/><path d="M9 7.5A3 3 0 0 1 15 7.5V9H9z"/><path d="M6 13H2M22 13h-4M6 19l-3 2M18 19l3 2M5 8l3 2M19 8l-3 2"/><path d="M12 9a6 6 0 0 1 6 6v1a6 6 0 0 1-12 0v-1a6 6 0 0 1 6-6z"/><path d="M12 9v13"/></svg>'
};
function openBoard(){
  /* בלי hash: הלוח עצמו מנתב — מי שמחובר ורשום כמתכנת נכנס ישר לדף שלו, אחרים למרכז */
  window.open('board/index.html','_blank','noopener');
}
function openBug(){ window.open('bug/index.html','_blank','noopener'); }
function mk(id,ico,title,fn){
  var b=document.createElement('button');
  b.className='tb-help tb-docs'; b.id=id; b.type='button'; b.title=title+' (מוקאפ)';
  b.setAttribute('aria-label',title); b.innerHTML=ico; b.onclick=fn;
  return b;
}
function boot(){
  var host=document.querySelector('.topbar .top-right'); if(!host||document.getElementById('tbDev')) return;
  var ref=document.getElementById('tbHelp');
  var dev=mk('tbDev',ICO.dev,'פיתוח — לוח המשימות, הדף שלך',openBoard),
      bug=mk('tbBug',ICO.bug,'באג — דיווח לתמיכה',openBug);
  if(ref&&ref.parentNode===host){ host.insertBefore(bug,ref); host.insertBefore(dev,bug); }
  else { host.appendChild(dev); host.appendChild(bug); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
setTimeout(boot,300);
})();
