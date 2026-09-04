/* =====================================================================
   js/docs-links.js — שכבת מוקאפ בלבד (לא מוצר): שני אייקונים ליד ה-"?"
   בפס העליון, "פיתוח" ו"בדיקות", שפותחים את דף הפיתוח-ובדיקות של המסך
   הנוכחי (Artifact ניתן לעריכה, שלושה טאבים: נשאר לפתח · תיקונים · בדיקות).
   המפתח = אותו מפתח של מנוע העזרה (hkHelpKey), כדי שלא יהיה מקור אמת שני.
   ===================================================================== */
(function(){
var PAGES={
  'cli.dash':      'https://claude.ai/code/artifact/397a336f-30b8-4662-b23d-fe3105adaec7',
  'adv.clients':   'https://claude.ai/code/artifact/829d4b65-1937-43c8-b9d3-ee60971bb871',
  'adv.today':     'https://claude.ai/code/artifact/d907e914-42c5-4165-a8fd-4dd7ac4b971e',
  'mgr.ops':       'https://claude.ai/code/artifact/d907e914-42c5-4165-a8fd-4dd7ac4b971e',
  'adv.tasks':     'https://claude.ai/code/artifact/5e999379-103b-4b52-96f3-fae9855dd895',
  'adv.comm':      'https://claude.ai/code/artifact/f0a88ce7-4b4c-4536-9567-5dc7d5e832ac',
  'co.meetings':   'https://claude.ai/code/artifact/28550d84-3e3c-4ad9-8e26-3ef8fcab42a0',
  'cli.meetings':  'https://claude.ai/code/artifact/28550d84-3e3c-4ad9-8e26-3ef8fcab42a0',
  'co.calls':      'https://claude.ai/code/artifact/297924d8-6a4f-4823-92d0-12e6645637e2',
  'co.metrics':    'https://claude.ai/code/artifact/b82b5b8f-1a37-408b-bf0e-6b73d4e1fa08',
  'co.acct':       'https://claude.ai/code/artifact/64ab6156-9463-445b-abca-e2af275a16c2',
  'co.past':       'https://claude.ai/code/artifact/b0f8ef46-7830-48ed-bd46-f4b276d1652c',
  'cli.past':      'https://claude.ai/code/artifact/b0f8ef46-7830-48ed-bd46-f4b276d1652c',
  'co.dash':       'https://claude.ai/code/artifact/839cc5cb-9b6e-4bda-812e-683e7fb4ecfc',
  'cli.chat':      'https://claude.ai/code/artifact/a6b015df-eb75-48f5-bdef-235e037722ed',
  'cli.fcast':     'https://claude.ai/code/artifact/21e91036-35a5-4417-96ad-0a5af0522cbb',
  'co.fcast':      'https://claude.ai/code/artifact/21e91036-35a5-4417-96ad-0a5af0522cbb'
};
var ICO={
  dev:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 5 5L14 17a2.1 2.1 0 0 1-3 0l-4-4a2.1 2.1 0 0 1 0-3l5.7-5.7z"/><path d="M3 21l6-6"/></svg>',
  chk:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
};
function open(hash){
  var key=(typeof hkHelpKey==='function')?hkHelpKey():'';
  var url=PAGES[key];
  if(!url){ if(typeof toast==='function') toast('אין עדיין דף פיתוח ובדיקות למסך הזה ('+key+')'); return; }
  window.open(url+(hash?'#'+hash:''),'_blank','noopener');
}
function mk(id,ico,title,hash){
  var b=document.createElement('button');
  b.className='tb-help tb-docs'; b.id=id; b.type='button'; b.title=title+' (מוקאפ)';
  b.setAttribute('aria-label',title); b.innerHTML=ico; b.onclick=function(){open(hash)};
  return b;
}
function boot(){
  var host=document.querySelector('.topbar .top-right'); if(!host||document.getElementById('tbDev')) return;
  var ref=document.getElementById('tbHelp');
  var dev=mk('tbDev',ICO.dev,'פיתוח — מה נשאר לפתח ולתקן במסך הזה',''),
      chk=mk('tbChk',ICO.chk,'בדיקות — מה נשאר לבדוק במסך הזה','checks');
  if(ref&&ref.parentNode===host){ host.insertBefore(chk,ref); host.insertBefore(dev,chk); }
  else { host.appendChild(dev); host.appendChild(chk); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
setTimeout(boot,300);
})();
