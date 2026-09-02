/* =====================================================================
   HK · מסכי החברה של היועץ (docs/cli) — הכרום המשותף
   מרנדר את הניווט, רצועת החברה והפס הכחול בכל חמשת המסכים מתוך מקור אחד,
   כדי שלא ייפרדו זה מזה. כל מסך קורא hkChrome('<key>') ומקבל בדיוק אותו ראש.
   הנתונים כאן הם נתוני הדמו של המערכת (js/data.js · ADV_TASKS · MEETINGS).
   ===================================================================== */

/* אנרגי אינטרנשיונל — CLIENTS[0] ב-js/data.js */
const CO = {
  name:'אנרגי אינטרנשיונל', hp:'511327876',
  product:'HK Money+',                  // כמו ב-js/queue.js. meeting+money — לכן כל סלוטי הפס מוצגים
  mgr:'טל מלקר',                 // מנהלת התזרים
  contact:'צחי עובד',                   // איש הקשר בחברה
  status:'פעיל',
  today:'יום חמישי · 02.07.2026', clock:'10:54',
  unread:5,                             // הודעות שלא נקראו בקבוצה
  /* משימות שהיועץ פתח למנהלת התזרים — ADV_TASKS[0] ב-js/ops.js */
  tasks:[
    {t:'בדיקת העברה מפועלים 112 ללאומי 604 — 42,000 ₪', due:'היום', late:false},
    {t:'פילוח עלות המכר לפי ספקים — לקראת הפגישה',      due:'30.06', late:true},
  ],
  /* כספים — היתרה זהה למה שווידג'ט התזרים מציג */
  money:{ bal:'75,187 ₪', inOverdraft:false, risk:{amount:'32,400- ₪', date:'11.07'} },
  /* הפגישה הבאה — MEETINGS ב-js/meetings.js. פגישת 09:00 של הבוקר כבר הסתיימה
     (status:'ai' — הסיכום בעיבוד), והבאה היא ההמשך של היום ב-17:00. */
  meet:{ when:'היום 17:00', who:'צחי עובד', what:'המשך סקירה — החלטות תקציב' },
};

const NAVI = [
  {k:'dash',   f:'dashboard.html', l:'דשבורד'},
  {k:'msgs',   f:'messages.html',  l:'קבוצת הוואטסאפ', badge:()=>CO.unread},
  {k:'calls',  f:'calls.html',     l:'שיחות טלפון'},
  {k:'meets',  f:'meetings.html',  l:'פגישות'},
  {k:'ai',     f:'ai.html',        l:'עוזר AI'},
  {k:'metric', f:'metrics.html',   l:'מדדים'},
  {k:'past',   f:'cashflow-past.html', l:'תמונת תזרים'},
  {k:'flow',   f:'process.html',       l:'התהליך שלי'},
];

const ICO = {
  up:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>',
  doc:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  back:'<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
};

/* opts.strip=false — **רצועת החברה והפס הכחול שמורים לדשבורד בלבד.**
   הפס מרכז את מה שעושים מול HK (משימות · מסמכים · יתרה · פגישה הבאה), והמקום
   שלו הוא מסך הפתיחה. בשאר המסכים נשארת רק פירורית לחם קומפקטית בניווט —
   מספיק כדי לדעת באיזו חברה אנחנו, בלי הכובד שהשווה בין כל המסכים.
   מודל המשימה וגרירת הקובץ נשארים זמינים בכל מסך — הם שכבות, לא פס. */
function hkChrome(active, opts){
  opts = opts || {};
  const withStrip = opts.strip !== false;
  const openTasks = CO.tasks.filter(t=>!t.done);
  const lateN = openTasks.filter(t=>t.late).length;
  const m = CO.money, hasMoney = !!m, hasMeet = !!CO.meet || CO.product!=='HK Money';

  const nav = `<nav class="nav">
    <a class="brand" href="dashboard.html"><i>שח</i>שחר ייעוץ עסקי</a>
    ${withStrip?'':`<a class="crumb" href="dashboard.html"><span class="d"></span>${CO.name}</a>`}
    <ul>${NAVI.map(n=>{const b=n.badge&&n.badge();
      return `<li><a class="${n.k===active?'on':''}" href="${n.f}">${n.l}${b?`<em>${b}</em>`:''}</a></li>`}).join('')}</ul>
    <div class="me"><div><b>אילון שחר</b>שחר ייעוץ עסקי</div><i>אש</i></div>
  </nav>`;

  const strip = !withStrip ? '' : `<header class="strip">
    <div>
      <h1>${CO.name}</h1>
      <div class="sub num">ח.פ ${CO.hp} · צוות הליווי <b>${CO.mgr}</b> · איש קשר <b>${CO.contact}</b></div>
    </div>
    <span class="st">${CO.status}</span>
    <div class="spacer"></div>
    <div class="now num"><b>${CO.clock}</b>${CO.today}</div>
  </header>`;

  /* הפס דינמי לפי המוצר: אין כספים — הסלוט יורד; אין פגישות — הסלוט יורד (§3.1) */
  const bar = `<div class="bar">
    <div class="cell">
      <button class="tkbtn" onclick="tkListToggle(event)" aria-expanded="false" id="tkBtn">
        <span class="cnt num" id="tkCount">${openTasks.length}</span>
        <span class="lb">משימות פתוחות לצוות הליווי</span>
        <span class="late" id="tkLate">${lateN?`· ${lateN===1?'אחת באיחור':lateN+' באיחור'}`:''}</span>
        <svg class="chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <button class="btn pri" onclick="tkOpen()">+ משימה חדשה</button>
    </div>
    ${hasMoney?`<span class="sep"></span>
    <div class="cell">
      <span class="lb">יתרה נוכחית</span>
      <span class="v num" ${m.inOverdraft?'style="color:var(--bad-on-navy)"':''}>${m.bal}</span>
      ${m.risk?`<span class="risk num">חריגה צפויה ${m.risk.amount} · ${m.risk.date}</span>`
              :`<span class="ok30">אין חריגה ב-30 הימים הקרובים</span>`}
    </div>`:''}
    <div class="spacer"></div>
    ${hasMeet?`<span class="sep ms"></span>
    ${CO.meet?`<a class="cell meet" href="meetings.html">
        <span class="lb">הפגישה הבאה</span>
        <span class="num"><b>${CO.meet.when}</b> · ${CO.meet.who} · ${CO.meet.what}</span></a>`
     :`<div class="cell">
        <span class="lb">אין פגישה קרובה</span>
        <button class="btn pri" onclick="cliGo('meetings.html')">תיאום פגישה</button></div>`}`:''}
  </div>`;

  const tail = `
  <div class="tklist" id="tkList">
    <div class="tk-h"><b>משימות פתוחות ל${CO.mgr}</b>
      <button class="x" onclick="tkListClose()" aria-label="סגירה">✕</button></div>
    <div class="tk-b" id="tkRows"></div>
    <div class="tk-f"><button class="btn pri" onclick="tkListClose();tkOpen()">+ משימה חדשה</button>
      <span class="muted">מופיעות בטאב המשימות של ${CO.name}</span></div>
  </div>
  <div class="drop" id="drop"><div class="in">שחררו כדי לפתוח משימה עם המסמך<span>הקובץ ייצא ל${CO.mgr} יחד עם ההסבר מה לעשות איתו</span></div></div>
  <div class="ov" id="tkOv" onclick="if(event.target===this)tkClose()">
    <div class="md">
      <button class="x" onclick="tkClose()" aria-label="סגירה">✕</button>
      <h3>משימה חדשה למנהלת התזרים</h3>
      <div class="s">תישלח ל${CO.mgr} ותופיע בטאב המשימות של ${CO.name}</div>
      <input id="tkIn" placeholder="מה צריך לעשות?" onkeydown="if(event.key==='Enter')tkSend();if(event.key==='Escape')tkClose()">
      <div class="atts" id="tkAtts"></div>
      <button class="attadd" onclick="tkPick()">${ICO.up} צירוף מסמכים
        <span>או גררו לכאן — הקובץ נשלח יחד עם המשימה</span></button>
      <div class="ft">
        <button class="btn pri" onclick="tkSend()">שליחה ל${CO.mgr.split(' ')[0]}</button>
        <button class="btn pln" onclick="tkClose()">ביטול</button>
        <span class="to">היעד: היום</span>
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

/* ---------- משימה חדשה למנהלת התזרים ---------- */
/* המסמכים והמשימה הם פעולה אחת: אין העלאה ערומה — כל קובץ נכנס עם ההקשר
   שלו, כמשימה לטל. גרירה לכל מקום פותחת את המשימה עם הקובץ מצורף. */
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
function tkPick(){TK_FILES.push('הצעת מחיר ליסינג.pdf');tkAtts();
  toast('בדמו: בחירת קובץ מהמחשב תיפתח כאן');}
function tkSend(){const i=document.getElementById('tkIn'),v=i.value.trim();if(!v)return;
  const n=TK_FILES.length;
  CO.tasks.unshift({t:v,due:'היום',late:false,mine:true,files:TK_FILES.slice()});
  tkClose();tkRefresh();
  toast('המשימה נשלחה ל'+CO.mgr.split(' ')[0]
    +(n?' עם '+(n===1?'מסמך אחד':n+' מסמכים'):'')+' — נפתחה בטאב המשימות של '+CO.name);}

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
  t.done=true;tkRefresh();toast('בוצע · '+CO.mgr+' עודכנה');}
function tkListToggle(e){if(e)e.stopPropagation();
  const p=document.getElementById('tkList'),b=document.getElementById('tkBtn');
  const on=!p.classList.contains('on');
  if(on){tkRefresh();
    const bar=document.querySelector('.bar');
    p.style.top=(bar.getBoundingClientRect().bottom+8)+'px';}
  p.classList.toggle('on',on); b.setAttribute('aria-expanded',on);}
/* tkBtn חי בתוך הפס הכחול — כלומר בדשבורד בלבד. במסכי strip:false הרשימה
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
  /* r=cli — בעל העסק צופה באותו מסך של היועץ; מה ששייך ליועץ יורד */
  if(/[?&]r=cli/.test(location.search)) document.documentElement.classList.add('r-cli');
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
