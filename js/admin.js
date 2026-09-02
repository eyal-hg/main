/* ===== איזור האדמין — כל מסכי HK Money מוטמעים כ-iframe ===== */
const ADMIN_SCREENS=[
  {k:'meetings',label:'פגישות ודוחות',file:'adminScreens/index.html?embed=1',
   ic:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'},
  /* תפעול יומי — מבט העל של התפעול. חי רק בתצוגת מנהל התזרים, ורק
     ל-Super Admin: היועץ והלקוח לא אמורים לדעת שהוא קיים. */
  {k:'dailyops',label:'תפעול יומי', file:'adminScreens/daily-ops.html?embed=1', mgrOnly:true,
   ic:'<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'},
  {k:'leads',  label:'לידים',         file:'adminScreens/leads.html?embed=1',
   ic:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>'},
  {k:'advisors',label:'ניהול יועצים', file:'adminScreens/advisors.html?embed=1',
   ic:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'},
  {k:'billing',label:'חיוב וגבייה',   file:'adminScreens/billing.html?embed=1',
   ic:'<rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/>'},
  {k:'messages',label:'הודעות ואוטומציה',file:'adminScreens/messages.html?embed=1',
   ic:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
  {k:'phones', label:'מספרי טלפון',   file:'adminScreens/phones.html?embed=1',
   ic:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'},
  {k:'tags',   label:'ניהול קטגוריות', file:'adminScreens/tags.html?embed=1',
   ic:'<path d="M20.59 13.41 12 22l-9-9V3h10z"/><circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>'},
  {k:'kb',     label:'בסיס ידע',      file:'adminScreens/knowledge-base.html?embed=1',
   ic:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'},
  {k:'aitests',label:'בדיקות AI',     file:'adminScreens/ai-tests.html?embed=1',
   ic:'<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0H5a2 2 0 0 1-2-2v-4m6 6h10a2 2 0 0 0 2-2v-4"/>'},
  /* 'יומן' ירד מאיזור הניהול — זה אותו יומן של היועץ ומנהל התזרים (הכרעת אייל, 02.09) */
  {sep:'המערכת'},
  {k:'memory', label:'זיכרון לקוח — קטגוריות', panel:true,
   ic:'<path d="M12 2a3 3 0 0 0-3 3 3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 6 0M12 2a3 3 0 0 1 3 3 3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-6 0M12 2v20"/>'},
];
let ADM_CUR='meetings';
function openAdmin(){
  document.getElementById('adminShell').classList.add('show');
  renderAdmRail();
  admGo('meetings');
}
function closeAdmin(){ document.getElementById('adminShell').classList.remove('show'); }
const admVisible=s=>!s.mgrOnly||(typeof ROLE!=='undefined'&&ROLE==='manager');
function renderAdmRail(){
  document.getElementById('admRail').innerHTML=ADMIN_SCREENS.filter(admVisible).map(s=>{
    if(s.sep) return `<div class="adm-sep">${s.sep}</div>`;
    return `<div class="adm-item ${ADM_CUR===s.k?'on':''}" onclick="admGo('${s.k}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.ic}</svg>
      <span>${s.label}</span></div>`;
  }).join('');
}
function admGo(k){
  const s=ADMIN_SCREENS.find(x=>x.k===k); if(!s||!admVisible(s)) return;
  ADM_CUR=k; renderAdmRail();
  const f=document.getElementById('admFrame'), p=document.getElementById('admPanel');
  if(s.panel){   // זיכרון לקוח — מסך פנימי, לא iframe ולא פופאפ
    f.style.display='none'; p.style.display='';
    if(typeof renderMemAdminScreen==='function') renderMemAdminScreen(p);
    return;
  }
  f.style.display=''; p.style.display='none';
  if(f.getAttribute('data-k')!==k){ f.src=s.file; f.setAttribute('data-k',k); }
}
