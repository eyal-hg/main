/* =====================================================================
   JAMPA · מסכי המטופל — הכרום המשותף
   אותו מבנה בדיוק של docs/cli/cli.js: hkChrome() מרנדר ניווט, רצועת מטופל
   ופס פעולות אחד לכל המסכים. מה שהשתנה הוא הנתונים והתוויות — ואת סלוט
   הכסף של HK מחליף כאן שלב הטיפול. אין מספרים כספיים, אין מנהל תזרים:
   בג'מפה יש מטפל אחד מול מטופל אחד.
   ===================================================================== */

/* נועה ברק — PATIENTS[0] ב-jampa/js/data.js */
const CO = {
  name:'נועה ברק', hp:'בת 34',
  focus:'חרדה חברתית',                 // מוקד הטיפול
  mgr:'ענת שלו',                        // המטפלת
  status:'בטיפול פעיל',
  today:'יום חמישי · 02.07.2026', clock:'10:54',
  unread:2,
  /* משימות מהפגישה — המערכת פונה איתן למטופלת בתזמון שהמטפלת הגדירה */
  tasks:[
    {t:'תרגול נשימות 4-7-8 — פעמיים ביום', due:'יומי',  late:false},
    {t:'יומן מצבים חברתיים — שלושה אירועים השבוע', due:'30.06', late:true},
  ],
  /* מקומו של סלוט הכסף ב-HK. אין כאן מספר — יש מיקום בתהליך */
  stage:{ n:4, of:6, name:'עבודה על דפוסים', since:'מפגש 12 · מאז 26.06' },
  meet:{ when:'היום 16:00', who:'נועה ברק', what:'פגישה שבועית' },
};

const NAVI = [
  {k:'dash',  f:'dashboard.html', l:'דשבורד'},
  {k:'msgs',  f:'messages.html',  l:'השיחה', badge:()=>CO.unread},
  {k:'meets', f:'meetings.html',  l:'פגישות'},
  {k:'ai',    f:'ai.html',        l:'עוזר AI'},
  {k:'flow',  f:'process.html',   l:'התהליך הטיפולי'},
];

const ICO = {
  up:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>',
  doc:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  back:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
};

/* opts.strip=false — הרצועה והפס שמורים לדשבורד בלבד, כמו ב-HK. */
function hkChrome(active, opts){
  opts = opts || {};
  const withStrip = opts.strip !== false;
  const openTasks = CO.tasks.filter(t=>!t.done);
  const lateN = openTasks.filter(t=>t.late).length;
  const sg = CO.stage;

  const nav = `<nav class="nav">
    <a class="brand" href="dashboard.html"><i>J<b>A</b></i>JAMPA</a>
    ${withStrip?'':`<a class="crumb" href="dashboard.html"><span class="d"></span>${CO.name}</a>`}
    <ul>${NAVI.map(n=>{const b=n.badge&&n.badge();
      return `<li><a class="${n.k===active?'on':''}" href="${n.f}">${n.l}${b?`<em>${b}</em>`:''}</a></li>`}).join('')}</ul>
    <div class="me"><div><b>ענת שלו</b>פסיכולוגית קלינית</div><i>עש</i></div>
  </nav>`;

  const strip = !withStrip ? '' : `<header class="strip">
    <div>
      <h1>${CO.name}</h1>
      <div class="sub">${CO.hp} · ${CO.focus} · מטפלת <b>${CO.mgr}</b></div>
    </div>
    <span class="st">${CO.status}</span>
    <div class="spacer"></div>
    <div class="now num"><b>${CO.clock}</b>${CO.today}</div>
  </header>`;

  /* הפס: משימות · שלב בתהליך · הפגישה הבאה. במקום היתרה של HK — המיקום
     בתהליך הטיפולי, בלי מספר: הסולם מראה כמה עברנו וכמה נשאר. */
  const bar = `<div class="bar">
    <div class="cell">
      <button class="tkbtn" onclick="tkListToggle(event)" aria-expanded="false" id="tkBtn">
        <span class="cnt num" id="tkCount">${openTasks.length}</span>
        <span class="lb">משימות פתוחות למטופלת</span>
        <span class="late" id="tkLate">${lateN?`· ${lateN===1?'אחת באיחור':lateN+' באיחור'}`:''}</span>
        <svg class="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <button class="btn pri" onclick="tkOpen()">+ משימה חדשה</button>
    </div>
    <span class="sep"></span>
    <div class="cell">
      <span class="lb">שלב בתהליך</span>
      <span class="v">${sg.name}</span>
      <span class="scale" aria-label="שלב ${sg.n} מתוך ${sg.of}">${
        Array.from({length:sg.of},(_,i)=>`<i class="${i<sg.n?'on':''}"></i>`).join('')}</span>
      <span class="ok30 plain">${sg.since}</span>
    </div>
    <div class="spacer"></div>
    <span class="sep ms"></span>
    ${CO.meet?`<a class="cell meet" href="meetings.html">
        <span class="lb">הפגישה הבאה</span>
        <span class="num"><b>${CO.meet.when}</b> · ${CO.meet.who} · ${CO.meet.what}</span></a>`
     :`<div class="cell">
        <span class="lb">לא נקבעה פגישה</span>
        <button class="btn pri" onclick="cliGo('meetings.html')">הצעת מועדים</button></div>`}
  </div>`;

  const tail = `
  <div class="tklist" id="tkList">
    <div class="tk-h"><b>משימות פתוחות ל${CO.name}</b>
      <button class="x" onclick="tkListClose()" aria-label="סגירה">✕</button></div>
    <div class="tk-b" id="tkRows"></div>
    <div class="tk-f"><button class="btn pri" onclick="tkListClose();tkOpen()">+ משימה חדשה</button>
      <span class="muted">נשלחות למטופלת בתזמון ובמינון שהגדרת</span></div>
  </div>
  <div class="drop" id="drop"><div class="in">שחררו כדי לצרף מסמך לתיק<span>הקובץ ייכנס עם ההקשר שלו — כמשימה או כחומר לפגישה</span></div></div>
  <div class="ov" id="tkOv" onclick="if(event.target===this)tkClose()">
    <div class="md">
      <button class="x" onclick="tkClose()" aria-label="סגירה">✕</button>
      <h3>משימה חדשה ל${CO.name.split(' ')[0]}</h3>
      <div class="s">המערכת תפנה אליה בוואטסאפ בתזמון שהגדרת, בטון ובגישה שלך</div>
      <input id="tkIn" placeholder="מה לתרגל עד הפגישה הבאה?" onkeydown="if(event.key==='Enter')tkSend();if(event.key==='Escape')tkClose()">
      <div class="atts" id="tkAtts"></div>
      <button class="attadd" onclick="tkPick()">${ICO.up} צירוף חומרים
        <span>או גררו לכאן — דף תרגול נשלח יחד עם המשימה</span></button>
      <div class="ft">
        <button class="btn pri" onclick="tkSend()">שליחה ל${CO.name.split(' ')[0]}</button>
        <button class="btn pln" onclick="tkClose()">ביטול</button>
        <span class="to">היעד: עד הפגישה הבאה</span>
      </div>
    </div>
  </div>
  <div id="toast" role="status" aria-live="polite"></div>`;

  document.body.insertAdjacentHTML('afterbegin', nav+strip+(withStrip?bar:''));
  document.body.insertAdjacentHTML('beforeend', tail);
  wireChrome();
}

/* ---------- טוסט ---------- */
let _tt;
function toast(m){const t=document.getElementById('toast');if(!t)return;
  t.textContent=m;t.classList.add('on');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('on'),2600);}

/* ---------- משימה חדשה למטופלת ---------- */
/* החומרים והמשימה הם פעולה אחת: אין העלאה ערומה — דף תרגול נכנס עם
   ההקשר שלו, כמשימה לנועה. גרירה לכל מקום פותחת משימה עם הקובץ מצורף. */
let TK_FILES=[];
function tkOpen(files){document.getElementById('tkOv').classList.add('on');
  if(files&&files.length) TK_FILES=TK_FILES.concat([...files].map(f=>f.name||'מסמך'));
  tkAtts();
  setTimeout(()=>document.getElementById('tkIn').focus(),60);}
function tkClose(){const o=document.getElementById('tkOv');if(!o)return;
  o.classList.remove('on');document.getElementById('tkIn').value='';TK_FILES=[];tkAtts();}
function tkAtts(){const el=document.getElementById('tkAtts');if(!el)return;
  el.innerHTML=TK_FILES.map((f,i)=>`<span class="att">${ICO.doc}${f}
    <button onclick="tkRm(${i})" aria-label="הסרת ${f}">✕</button></span>`).join('');}
function tkRm(i){TK_FILES.splice(i,1);tkAtts();}
function tkPick(){TK_FILES.push('דף תרגול — נשימות 4-7-8.pdf');tkAtts();
  toast('בדמו: בחירת קובץ מהמחשב תיפתח כאן');}
function tkSend(){const i=document.getElementById('tkIn'),v=i.value.trim();if(!v)return;
  const n=TK_FILES.length;
  CO.tasks.unshift({t:v,due:'היום',late:false,mine:true,files:TK_FILES.slice()});
  tkClose();tkRefresh();
  toast('המשימה נשלחה ל'+CO.name.split(' ')[0]
    +(n?' עם '+(n===1?'חומר אחד':n+' חומרים'):'')+' — תצא בתזמון שהגדרת');}

/* ---------- הרשימה עצמה: מונה בפס = פתח את המשימות (§3.1) ---------- */
function tkRefresh(){
  const open=CO.tasks.filter(t=>!t.done), late=open.filter(t=>t.late).length;
  const c=document.getElementById('tkCount'); if(c)c.textContent=open.length;
  const l=document.getElementById('tkLate');
  if(l)l.textContent = late?('· '+(late===1?'אחת באיחור':late+' באיחור')):'';
  const rows=document.getElementById('tkRows'); if(!rows)return;
  rows.innerHTML = open.length ? open.map((t,i)=>`
    <div class="tk-row">
      <div class="tk-t">${t.t}</div>
      <div class="tk-m">${t.mine?'נפתחה על ידך · ':''}יעד ${t.due}${t.late?' <b>· באיחור</b>':''}</div>
      <button class="tk-do" onclick="tkDone(${i})">סמן כבוצע</button>
    </div>`).join('')
    : '<div class="tk-empty">אין משימות פתוחות — הכל טופל</div>';
}
function tkDone(i){const open=CO.tasks.filter(t=>!t.done);const t=open[i];if(!t)return;
  t.done=true;tkRefresh();toast('סומן כבוצע · נרשם במעקב המשימות של '+CO.name.split(' ')[0]);}
function tkListToggle(e){if(e)e.stopPropagation();
  const p=document.getElementById('tkList'),b=document.getElementById('tkBtn');
  const on=!p.classList.contains('on');
  if(on){tkRefresh();
    const bar=document.querySelector('.bar');
    p.style.top=(bar.getBoundingClientRect().bottom+8)+'px';}
  p.classList.toggle('on',on); b.setAttribute('aria-expanded',on);}
/* tkBtn חי בתוך הפס — כלומר בדשבורד בלבד. במסכי strip:false הרשימה
   קיימת אבל הכפתור לא, וללא השמירה הזאת הפונקציה נזרקת; היא נקראת מתוך מטפל
   ה-Escape, ולכן כל פופאפ במסכים האלה הפסיק להיסגר ב-Escape. */
function tkListClose(){const p=document.getElementById('tkList');if(!p)return;
  p.classList.remove('on');const b=document.getElementById('tkBtn');
  if(b)b.setAttribute('aria-expanded','false');}

/* ---------- גרירת קובץ לכל מקום במסך (§3.1) ---------- */
function wireChrome(){
  const drop=document.getElementById('drop');let n=0;
  /* ווידג'טים הם iframes: גרירה מעליהם נבלעת אצל הילד, והקובץ אפילו היה מחליף
     את הווידג'ט. ברגע שהגרירה נכנסת לדף — מכבים pointer-events על ה-iframes,
     כך ששכבת ה-drop תופסת את כל המסך ולא רק את השוליים. */
  const dragOn=on=>{drop.classList.toggle('on',on);
    document.documentElement.classList.toggle('dragging',on)};
  addEventListener('dragenter',e=>{e.preventDefault();if(++n)dragOn(true)});
  addEventListener('dragover',e=>e.preventDefault());
  addEventListener('dragleave',()=>{if(--n<=0){n=0;dragOn(false)}});
  addEventListener('drop',e=>{e.preventDefault();n=0;dragOn(false);
    const f=e.dataTransfer.files;
    tkOpen(f&&f.length?f:[{name:'מסמך שנגרר.pdf'}]);});
  addEventListener('keydown',e=>{if(e.key==='Escape'){tkClose();tkListClose();
    document.querySelectorAll('.ov.on').forEach(o=>o.classList.remove('on'));}});
  addEventListener('click',e=>{const p=document.getElementById('tkList');
    if(p&&p.classList.contains('on')&&!p.contains(e.target))tkListClose();});
  if(/[?&]embed=1/.test(location.search)) hkEmbedWire();
}

/* =====================================================================
   הטמעה במערכת (?embed=1) — אותו פרוטוקול של docs/adv3:
   הניווט הפנימי מוסתר (סרגל המערכת מחליף אותו), הדף מדווח גובה ב-hkCli,
   וקישור פנימי בין מסכי החברה נתפס והופך לבקשת החלפת טאב במקום ניווט
   בתוך המסגרת. המפתח נלקח מ-body[data-cli].
   ===================================================================== */
function hkEmbedWire(){
  document.documentElement.classList.add('embed');
  const key=document.body.dataset.cli||'';
  const send=()=>{
    const h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
    parent.postMessage({hkCli:key,h:h},'*');
  };
  addEventListener('load',()=>{send();setTimeout(send,300);setTimeout(send,900);});
  addEventListener('resize',send);
  new MutationObserver(send).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
  setInterval(send,1200);
  /* ניווט בין מסכי החברה — המערכת מחליפה טאב, המסגרת לא מנווטת */
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href$=".html"]');
    if(!a||a.getAttribute('href').indexOf('/')>-1) return;
    const f=a.getAttribute('href').split('?')[0].replace('.html','');
    if(!NAVI.some(n=>n.f.replace('.html','')===f)) return;
    e.preventDefault(); parent.postMessage({hkCliGo:f},'*');
  },true);
}

/* מעבר בין מסכי החברה. בהטמעה אסור לנווט את המסגרת — היא תפתח ניווט
   שני בתוך המערכת; במקום זה מבקשים מההורה להחליף טאב. */
function cliGo(file,q){
  const embedded=document.documentElement.classList.contains('embed');
  if(embedded){ parent.postMessage({hkCliGo:file.replace('.html',''), q:q||''},'*'); return; }
  location.href=file+(q?'?q='+encodeURIComponent(q):'');
}
function askAI(q){ cliGo('ai.html',q); }
