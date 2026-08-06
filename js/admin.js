/* ===== איזור האדמין — כל מסכי HK Money מוטמעים כ-iframe ===== */
const ADMIN_SCREENS=[
  {k:'meetings',label:'פגישות ודוחות',file:'adminScreens/index.html?embed=1',
   ic:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'},
  {k:'leads',  label:'לידים',         file:'adminScreens/leads.html?embed=1',
   ic:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>'},
  {k:'advisors',label:'ניהול יועצים', file:'adminScreens/advisors.html?embed=1',
   ic:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'},
  {k:'billing',label:'חיוב וגבייה',   file:'adminScreens/billing.html?embed=1',
   ic:'<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>'},
  {k:'messages',label:'הודעות ואוטומציה',file:'adminScreens/messages.html?embed=1',
   ic:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
  {k:'tags',   label:'תגיות',         file:'adminScreens/tags.html?embed=1',
   ic:'<path d="M20.59 13.41 12 22l-9-9V3h10z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>'},
  {k:'kb',     label:'בסיס ידע',      file:'adminScreens/knowledge-base.html?embed=1',
   ic:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'},
  {k:'aitests',label:'בדיקות AI',     file:'adminScreens/ai-tests.html?embed=1',
   ic:'<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0H5a2 2 0 0 1-2-2v-4m6 6h10a2 2 0 0 0 2-2v-4"/>'},
  {k:'calendar',label:'יומן',file:'adminScreens/calendar.html',
   ic:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'},
  {sep:'המערכת'},
  {k:'memory', label:'זיכרון לקוח — קטגוריות', modal:true,
   ic:'<path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 6 0M12 2a3 3 0 0 1 3 3 3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-6 0M12 2v20"/>'},
];
let ADM_CUR='meetings';
function openAdmin(){
  document.getElementById('adminShell').classList.add('show');
  renderAdmRail();
  admGo('meetings');
}
function closeAdmin(){ document.getElementById('adminShell').classList.remove('show'); }
function renderAdmRail(){
  document.getElementById('admRail').innerHTML=ADMIN_SCREENS.map(s=>{
    if(s.sep) return `<div class="adm-sep">${s.sep}</div>`;
    return `<div class="adm-item ${ADM_CUR===s.k?'on':''}" onclick="admGo('${s.k}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.ic}</svg>
      <span>${s.label}</span></div>`;
  }).join('');
}
function admGo(k){
  const s=ADMIN_SCREENS.find(x=>x.k===k); if(!s) return;
  if(s.modal){ if(typeof openMemAdmin==='function') openMemAdmin(); return; }  // זיכרון לקוח — מודל
  ADM_CUR=k; renderAdmRail();
  const f=document.getElementById('admFrame');
  if(f.getAttribute('data-k')!==k){ f.src=s.file; f.setAttribute('data-k',k); }
}
