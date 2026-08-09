/* HK Dashboard — meetings list + summary modal */
  /* ---- meetings + summary ---- */
  // status: upcoming | ai (הוקלטה, ה-AI מעבד) | summary (סיכום ממתין לאישור) | done | noshow
  // rec = משך ההקלטה — כל פגישה מוקלטת ומתועדת אוטומטית
  const MEETINGS=[
    {name:'פגישה שוטפת - סקירת תזרים', client:'אנרגי אינטרנשיונל', date:'02.07.2026', time:'09:00-10:00', adv:'אילון אשכנזי', status:'ai', rec:'46 דק׳'},
    {name:'פגישה חודשית - יולי (Money+)', client:'משה עובד', date:'02.07.2026', time:'16:00-17:00', adv:'אילון אשכנזי', status:'upcoming'},
    {name:'פ.ע - חודש יוני', client:'אנרגי אינטרנשיונל', date:'01.06.2026', time:'11:00-12:00', adv:'אילון אשכנזי', status:'summary', rec:'58 דק׳'},
    {name:'פגישת עבודה - קורס מנחות', client:'מטעי גבעון', date:'12.05.2026', time:'10:00-11:00', adv:'אילון אשכנזי', status:'summary', rec:'52 דק׳'},
    {name:'פגישה חודשית - יולי (Money+)', client:'מטעי גבעון', date:'15.07.2026', time:'10:00-11:00', adv:'אילון אשכנזי', status:'upcoming'},
    {name:'סקירת רבעון Q3', client:'משה עובד', date:'10.07.2026', time:'14:00-15:00', adv:'אילון אשכנזי', status:'upcoming'},
    {name:'לימוד בנדל - לחיות בתשוקה', client:'אנרגי גולני', date:'05.05.2026', time:'09:00-10:00', adv:'אילון אשכנזי', status:'done', rec:'55 דק׳'},
    {name:'פגישה חודשית - מרץ', client:'רימון יצחק', date:'17.03.2026', time:'12:00-13:00', adv:'אילון אשכנזי', status:'done', rec:'61 דק׳'},
    {name:'פ.ע - חודש יוני', client:'אנרגי גולני', date:'24.06.2026', time:'10:30-11:30', adv:'אילון אשכנזי', status:'noshow'},
  ];
  let MEET_FILTER='all';
  const CAL_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>';
  const CLK_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const USR_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
  function renderMeetings(){
    closeMeeting();   // כניסה לסקציה תמיד מתחילה ברשימה
    const isClient=(ROLE==='client1'||ROLE==='clientN');
    document.getElementById('mtFilters').style.display = isClient ? 'none' : 'flex';
    if(!isClient){
      const cnt=s=>MEETINGS.filter(m=>m.status===s).length;
      const F=[['upcoming','פגישות קרובות',cnt('upcoming')],['ai','בעיבוד AI',cnt('ai')],['summary','ממתינות לאישור',cnt('summary')],['done','הושלמו',cnt('done')],['noshow','לא התקיימו',cnt('noshow')]];
      document.getElementById('mtFilters').innerHTML=
        `<div class="ofilter ${MEET_FILTER==='all'?'on':''}" onclick="meetFilter('all')">הכל</div>`+
        F.map(f=>`<div class="ofilter ${MEET_FILTER===f[0]?'on':''}" onclick="meetFilter('${f[0]}')">${f[1]}${f[2]?`<span class="cnt">${f[2]}</span>`:''}</div>`).join('');
    }
    let list=MEETINGS.map((m,i)=>({m,i}));
    if(isClient) list=list.filter(x=>x.m.client===CLIENTS[CUR].name);
    else if(MEET_FILTER!=='all') list=list.filter(x=>x.m.status===MEET_FILTER);
    const el=document.getElementById('mtList');
    if(!list.length){el.innerHTML='<div class="ms-placeholder">אין פגישות</div>';return;}
    /* פגישת-גיבור: הפגישה של היום שממתינה להקלטה — כפתור הקלטה ישר בראש */
    const TODAY='02.07.2026';
    const hero=list.find(x=>x.m.date===TODAY&&x.m.status==='upcoming');
    const heroHtml=hero?`
      <div class="mt-hero">
        <div class="advh-date"><b>${hero.m.date.slice(0,2)}</b><span>יולי</span></div>
        <div class="mt-hero-b">
          <div class="mt-hero-t">${hero.m.name}</div>
          <div class="mt-hero-s">${hero.m.client} · <span dir="ltr">${hero.m.time}</span> · היום</div>
        </div>
        <button class="mrec-btn on-card" onclick="startMeetRec('${hero.m.client}')"><span class="mrec-dot"></span> הקלטת הפגישה</button>
      </div>`:'';
    el.innerHTML=heroHtml+list.map(({m,i})=>{
      const rec=m.rec?`<span class="rec-badge">🎙 ${m.rec}</span>`:'';
      const chip=MS_STATCHIP[m.status]?`<span class="msp-chip ${MS_STATCHIP[m.status][1]}">${MS_STATCHIP[m.status][0]}</span>`:'';
      let btn;
      if(m.status==='ai') btn=`<button class="mt-btn view" disabled style="opacity:.55;cursor:default">סיכום בהכנה…</button>`;
      else if(isClient) btn=`<button class="mt-btn view" onclick="openMeeting(${i})">צפייה בסיכום</button>`;
      else if(m.status==='summary')btn=`<button class="mt-btn" onclick="openMeeting(${i})">אישור הסיכום</button>`;
      else if(m.status==='done')btn=`<button class="mt-btn view" onclick="openMeeting(${i})">צפייה בסיכום</button>`;
      else if(m.status==='upcoming')btn=`<button class="mt-btn view" onclick="toast('פרטי הפגישה')">פרטי פגישה</button>`;
      else btn=`<button class="mt-btn view" onclick="toast('תיאום פגישה מחדש')">תיאום מחדש</button>`;
      return `<div class="mtcard st-${m.status}">
        <div class="mt-info">${isClient?'':`<div class="mt-client">${m.client}</div>`}<div class="mt-name">${m.name} ${chip} ${rec}</div>
          <div class="mt-meta"><span>${CAL_ICO}${m.date}</span><span>${CLK_ICO}${m.time}</span><span>${USR_ICO}${m.adv}</span></div></div>
        ${btn}</div>`;}).join('');
  }
  function meetFilter(k){MEET_FILTER=k;renderMeetings();}
  const MS_SUMMARY=`
    <div class="ms-sec"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg> תמונת מצב ונתוני יסוד</div>
    <div class="ms-point"><span class="num">1.</span><span>בוצע ניתוח תזרים לרבעון מרץ-מאי (הכנסות 116 אש"ח, תוצאה מאוזנת), אפריל (הכנסות 140 אש"ח, עודף 22 אש"ח), מאי (הכנסות 120 אש"ח, גירעון 22.7 אש"ח).</span></div>
    <div class="ms-point"><span class="num">2.</span><span>אומת כי העסק שמר על יציבות תזרימית לאורך הרבעון, עם יתרת סיום כמעט זהה ליתרת הפתיחה (סיום מאי: מינוס 66,178 ₪).</span></div>
    <div class="ms-point"><span class="num">3.</span><span>זוהה פער בנתונים: כרטיס האשראי החדש של 'מקס' אינו מחובר למערכת ה-Bizibox, מה שמקשה על מעקב שוטף אחר הוצאות השיווק.</span></div>
    <div class="ms-point"><span class="num">4.</span><span>זוהתה תקלה אפשרית במערכת: חיוב כפול מחברת 'Payment' טכנולוגיות בחודש אפריל, הנושא דורש בדיקה.</span></div>
    <div class="ms-point"><span class="num">5.</span><span>עודכן תקציב יוני עם הוצאות חד-פעמיות הקשורות לריטריט (ספק 'ירוק עז' 7,500 ₪, ספקית אוכל 5,000 ₪).</span></div>
    <div class="ms-point"><span class="num">6.</span><span>זוהה חוסר עדכון בטבלת מעקב המכירות היומית מאז ה-8 במאי.</span></div>
    <div class="ms-sec t2"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg> תובנות מרכזיות</div>
    <div class="ms-insight"><div class="ms-ititle">1. שמירה על יציבות תזרימית ברבעון האחרון חרף גידול בהכנסות</div><div class="ms-itext">למרות גידול של כ-40% בהכנסות ומהלכים עסקיים שלא צלחו, העסק שמר על איזון תזרימי מלא ברבעון מרץ-מאי, מה שמעיד על חוסן פיננסי ויכולת לספוג אתגרים. <span class="ms-more">קרא עוד</span></div></div>
    <div class="ms-insight"><div class="ms-ititle">2. אופטימיזציה של מבנה כוח האדם: החלפת פונקציית שירות לקוחות</div><div class="ms-itext">הוחלט על סיום העסקה של מיכל וגיוס מחליפה בתפקיד שירות לקוחות ותפעול, בעלות חודשית נמוכה יותר של כ-2,880 ₪. <span class="ms-more">קרא עוד</span></div></div>
  `;
  /* עמוד פגישה — נפתח בתוך סקציית הפגישות במקום פופאפ */
  let MS_CUR=-1;
  const MS_STATCHIP={summary:['ממתין לאישור','amber'],done:['הושלם','green'],ai:['בעיבוד AI','purple'],upcoming:['מתוכננת','blue'],noshow:['לא התקיימה','coral']};
  function openMeeting(i){
    MS_CUR=i; const m=MEETINGS[i];
    const isClient=(ROLE==='client1'||ROLE==='clientN');
    const chip=MS_STATCHIP[m.status]||['',''];
    const foot=(!isClient&&m.status==='summary')?`
      <div class="ms-foot">
        <button class="ms-nosend" onclick="approveSummary(false)">אישור ללא שליחה</button>
        <button class="ms-send" onclick="approveSummary(true)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> אישור ושליחת סיכום</button>
      </div>`:'';
    document.getElementById('mtDetail').innerHTML=`
      <div class="ms-back" onclick="closeMeeting()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg> כל הפגישות</div>
      <div class="ms msp">
        <div class="ms-head">
          <div class="ms-title">${m.name} <span class="msp-chip ${chip[1]}">${chip[0]}</span></div>
          <div class="ms-meta">
            <span>${m.client} · ${m.adv}</span>
            <span>${CAL_ICO}<span>${m.date}</span></span>
            <span>${CLK_ICO}<span>${m.time}</span></span>
            ${m.rec?`<span>🎙 ${m.rec}</span>`:''}
          </div>
        </div>
        <div class="ms-tabs">
          <div class="ms-tab on" onclick="msTab(this,'summary')">סיכום פגישה</div>
          <div class="ms-tab" onclick="msTab(this,'tasks')">משימות</div>
          <div class="ms-tab" onclick="msTab(this,'feedback')">משוב</div>
          <div class="ms-tab" onclick="msTab(this,'transcript')">תמלול</div>
        </div>
        <div class="ms-body" id="msBody">${MS_SUMMARY}</div>
        ${foot}
      </div>`;
    document.querySelector('#viewMeetings .mt-wrap').style.display='none';
    document.getElementById('mtDetail').style.display='';
    document.querySelector('.main').scrollTop=0; window.scrollTo(0,0);
  }
  function closeMeeting(){
    document.getElementById('mtDetail').style.display='none';
    const w=document.querySelector('#viewMeetings .mt-wrap'); if(w)w.style.display='';
  }
  function msTab(el,t){document.querySelectorAll('.ms-tab').forEach(x=>x.classList.remove('on'));el.classList.add('on');
    document.getElementById('msBody').innerHTML = (t==='summary')?MS_SUMMARY:'<div class="ms-placeholder">תוכן "'+el.textContent+'" — בקרוב</div>';}
  function approveSummary(send){
    if(MS_CUR>=0){MEETINGS[MS_CUR].status='done';}
    closeMeeting(); renderMeetings();
    toast(send?'הסיכום אושר ונשלח ללקוח':'הסיכום אושר — לא נשלח ללקוח');
  }
  function sendSummary(){approveSummary(true);}   // תאימות
  /* פתיחת עמוד פגישה מהבית של היועץ — נכנס לחברה, לסקציית הפגישות, ולפגישה */
  function openMeetingFrom(ci,ix){selectClient(ci);showTab('meetings');openMeeting(ix);}

  /* ===== הקלטת פגישה — מכל מקום בדשבורד ===== */
  let MREC=null;
  const fmtRec=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  function startMeetRec(name){
    if(MREC){toast('כבר מתבצעת הקלטה');return;}
    const client=name||(SCOPE==='client'?CLIENTS[CUR].name:'פגישה כללית');
    MREC={sec:0,client};
    document.getElementById('mrecWho').textContent='מקליט פגישה · '+client;
    document.getElementById('mrecClock').textContent='00:00';
    document.getElementById('mrecBar').style.display='flex';
    MREC.iv=setInterval(()=>{MREC.sec++;const el=document.getElementById('mrecClock');if(el)el.textContent=fmtRec(MREC.sec);},1000);
    toast('ההקלטה החלה — '+client);
  }
  function stopMeetRec(){
    if(!MREC) return;
    clearInterval(MREC.iv);
    const mins=Math.max(1,Math.round(MREC.sec/60));
    MEETINGS.unshift({name:'פגישה מוקלטת', client:MREC.client, date:'02.07.2026', time:'עכשיו', adv:'אילון אשכנזי', status:'ai', rec:mins+' דק׳'});
    MREC=null;
    document.getElementById('mrecBar').style.display='none';
    toast('ההקלטה הסתיימה — נשלחה לעיבוד AI');
    if(document.getElementById('viewMeetings').style.display!=='none') renderMeetings();
    if(typeof renderAdvisorHome==='function'&&ROLE==='advisor'&&SCOPE==='portfolio') renderAlerts();
  }


/* ===== הכנה לפגישה — נגזרת מהזיכרון בזמן אמת, לא נשמרת =====
   מקורות: מסמכי הזיכרון + snapshot מספרים + משימות מהפגישה הקודמת.
   נוצרת בפתיחת המסך (ובפרודקשן: אוטומטית 24ש׳ לפני + רענון 30 דק׳ לפני). */
let PREP_TASKS=[
  {t:'העברת הרשאות צפייה בפועלים 112', done:true},
  {t:'עדכון שורה תקציבית — קניות מלאי', done:false},
  {t:'שליחת דוח גבייה מרוכז לצחי', done:true},
];
function prepTaskTg(i){PREP_TASKS[i].done=!PREP_TASKS[i].done;renderPrepView();}
function renderPrepView(){
  const el=document.getElementById('viewPrep'); if(!el) return;
  const c=CLIENTS[CUR]||{};
  const now=new Date();
  const stamp='היום '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const N=(typeof MEM_NUMS!=='undefined'&&MEM_NUMS[CUR])?MEM_NUMS[CUR]:null;
  const kpis=N?N.kpi.slice(0,4).map(n=>`<div class="mem-num ${n.bad?'bad':''}"><span>${n.k}</span><b>${n.v}</b></div>`).join(''):'';
  const openTasks=PREP_TASKS.filter(t=>!t.done).length;
  el.innerHTML=`
  <div class="prp">
    <div class="prp-head">
      <div>
        <div class="prp-ttl">הכנה לפגישה — פגישה חודשית · יולי</div>
        <div class="prp-sub">${c.name||''} · היום 16:00 · <b>נוצרה מהזיכרון והמספרים ${stamp}</b></div>
      </div>
      <div class="prp-acts">
        <button class="mt-btn view" onclick="toast('ההכנה נוצרה מחדש מהזיכרון והמספרים העדכניים');renderPrepView()">↻ רענון</button>
        <button class="mt-btn" onclick="toast('ההכנה נשלחה אליך בוואטסאפ')">שליחה אליי בוואטסאפ</button>
      </div>
    </div>

    <div class="prp-grid">
      <div class="prp-main">
        <div class="prp-card ai">
          <div class="prp-card-h"><span class="prp-spark">✦</span> סיכום AI לפגישה</div>
          <p>הפגישה מגיעה אחרי חודש חזק (הכנסות +12%) אבל עם חריגה צפויה בעו״ש בעוד 9 ימים. הנושא המרכזי: קניות המלאי — גם חרגו מהתקציב (114%) וגם 25,000 ₪ מהן טרם נצבעו בתזרים. צחי ביקש בפגישה הקודמת לרדת לרזולוציית ספקים — להגיע עם הפירוט מוכן.</p>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">נקודות פתיחה</div>
          <div class="prep-pt">ההכנסות +12% מהחודש הקודם — כדאי לפתוח בזה <span class="prp-src">מדדים</span></div>
          <div class="prep-pt">חריגה צפויה בעו״ש בעוד 9 ימים — להציע העברה מפועלים 112 <span class="prp-src">תזרים</span></div>
          <div class="prep-pt">25,000 ₪ קניות מלאי עוד לא נצבעו בתזרים <span class="prp-src">תפעול</span></div>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">מטרה מוצעת לפגישה</div>
          <div class="prp-goal">סגירת תוכנית מלאי לרבעון — תקציב חדש לשורת הקניות + צביעת ה-25,000 ₪ הפתוחים</div>
          <div class="prp-goal-why">למה: זה החוט שמחבר את חריגת התקציב, החריגה הצפויה בעו״ש והכאב שעלה בפגישה הקודמת</div>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">משימות מהפגישה הקודמת <span class="prp-cnt">${openTasks} פתוחות</span></div>
          ${PREP_TASKS.map((t,i)=>`<div class="prp-task ${t.done?'done':''}">
            <label class="mc-chk"><input type="checkbox" ${t.done?'checked':''} onchange="prepTaskTg(${i})"><span></span></label>
            <span>${t.t}</span></div>`).join('')}
        </div>
      </div>

      <aside class="prp-side">
        <div class="prp-card mem">
          <div class="prp-card-h"><span class="pm-tag">מהזיכרון</span> הנחיות אישיות</div>
          <div class="prep-pt mem">פתח במספרים — צחי מאבד סבלנות מהקדמות</div>
          <div class="prep-pt mem">רגישות סביב התלות ברימון — לגעת בזה בעדינות, בלי לחץ</div>
          <div class="prep-pt mem">לצ׳אט נשלח רק: ״ענה ברוגע ובקצרה — הצג תמיד פתרון לצד בעיה״</div>
        </div>
        <div class="prp-card">
          <div class="prp-card-h">מהזיכרון — רלוונטי לפגישה</div>
          <div class="prp-memrow"><span class="mf-cat">מצב תזרימי</span>חריגה בפועל 6 ימים בלאומי · מסגרת 150K בניצול 107%</div>
          <div class="prp-memrow"><span class="mf-cat">כאבי לקוח</span>תלות בשני לקוחות גדולים — 70% מהמחזור</div>
          <div class="prp-memrow"><span class="mf-cat">יעדים והסכמות</span>פתיחת מסגרת נוספת 100 א׳ ₪ — באחריותנו, יעד 15.7</div>
          <button class="mt-btn view sm" style="margin-top:8px" onclick="openMemCard(${CUR})">לכרטיס הלקוח המלא</button>
        </div>
        ${N?`<div class="prp-card"><div class="prp-card-h">מספרים · עכשיו</div><div class="mem-kpis prp-kpis">${kpis}</div></div>`:''}
      </aside>
    </div>
  </div>`;
}

/* ===== זירת הפגישות — גלובלי ליועץ ולמנהל תזרים =====
   כל אינטראקציה מוקלטת (פגישה / שיחה) עוברת צינור אחד:
   הקלטה ← תמלול ← סיכום ← עדכוני זיכרון. המסך שומר שלא מפספסים. */
let MEETS_TAB='meet';   // meet | call
const MEETS_UP=[
  {d:'היום 16:00',  c:'משה עובד',           t:'פגישה חודשית — יולי (Money+)', by:'me',  prep:'ready'},
  {d:'מחר 10:00',   c:'רימון יצחק',          t:'פ.ע חודשית (Money+)',          by:'hk',  hkName:'דנה לוין', prep:'auto'},
  {d:'יום א׳ 09:30', c:'לביא הובלות',         t:'פגישת הקמה',                   by:'me',  prep:'auto'},
];
const MEETS_PAST=[
  {d:'היום 09:00',  c:'אנרגי אינטרנשיונל',  t:'פגישה שוטפת — סקירת תזרים', by:'me', rec:true,  dur:'46 דק׳', sum:'pend', mem:3},
  {d:'אתמול 14:00', c:'מטעי גבעון',          t:'שיחת מעקב — חריגת תקציב',   by:'me', rec:true,  dur:'22 דק׳', sum:'ok',   mem:1},
  {d:'28.06 11:00', c:'אנרגי גולני',         t:'פ.ע חודשית — יוני',          by:'hk', hkName:'דנה לוין', rec:true, dur:'51 דק׳', sum:'ok', mem:2},
  {d:'25.06 13:00', c:'משה עובד',            t:'שיחת היכרות',                by:'me', rec:false, sum:null,  mem:0},
];
const MEETS_CAD=[
  {ci:0, c:'אנרגי אינטרנשיונל', prod:'money+', by:'me', last:'היום',   next:'02.08 · מתואמת', ok:true},
  {ci:2, c:'מטעי גבעון',        prod:'money',  by:'me', last:'אתמול',  next:'לא נדרשת בחוזה',  ok:true, none:true},
  {ci:1, c:'אנרגי גולני',       prod:'money+', by:'hk', last:'28.06',  next:'29.07 · מתואמת', ok:true},
  {ci:3, c:'משה עובד',          prod:'money+', by:'me', last:'25.06',  next:'לא מתואמת',       ok:false, gap:'41 יום מהאחרונה'},
  {ci:4, c:'רימון יצחק',        prod:'money+', by:'hk', last:'15.06',  next:'מחר 10:00',       ok:true},
];
const MEETS_CALLS=[
  {d:'היום 11:15',  c:'אנרגי גולני',  who:'לירון בן כליפא', t:'עדכון חומרים לתזרים', dur:'6 דק׳',  mem:1, st:'ok'},
  {d:'היום 09:40',  c:'משה עובד',     who:'שמרית טובול',    t:'השלמת הרשאות בנק',    dur:'9 דק׳',  mem:0, st:'proc'},
  {d:'אתמול 15:20', c:'מטעי גבעון',   who:'לירון בן כליפא', t:'בירור חריגת תקציב',   dur:'11 דק׳', mem:2, st:'ok'},
];
function meetsTab(t){MEETS_TAB=t;renderMeetsArena();}
const _byChip=m=>m.by==='hk'
  ?`<span class="ms-by hk">יועץ HK · ${m.hkName||'דנה לוין'}</span>`
  :`<span class="ms-by me">שלי</span>`;
function renderMeetsArena(){
  const el=document.getElementById('meetsView'); if(!el) return;
  const isMgr=(typeof ROLE!=='undefined'&&ROLE==='manager');
  const pendSum=MEETS_PAST.filter(m=>m.sum==='pend').length;
  const noNext=MEETS_CAD.filter(r=>!r.ok).length;
  const memTot=MEETS_PAST.reduce((s,m)=>s+m.mem,0);
  /* פס סטטיסטיקה */
  const stats=`<div class="ms-stats">
    <div class="ms-stat"><b>${MEETS_UP.length}</b><span>פגישות קרובות</span></div>
    <div class="ms-stat ${noNext?'bad':''}"><b>${noNext}</b><span>לקוח בלי פגישה מתואמת</span></div>
    <div class="ms-stat ${pendSum?'warn':''}"><b>${pendSum}</b><span>סיכומים לאישורך</span></div>
    <div class="ms-stat mem"><b>${memTot}</b><span>עדכוני זיכרון מהפגישות</span></div>
  </div>`;
  /* טאבים — פגישות / שיחות */
  const tabs=`<div class="ms-tabs">
    <button class="ms-tab ${MEETS_TAB==='meet'?'on':''}" onclick="meetsTab('meet')">פגישות</button>
    <button class="ms-tab ${MEETS_TAB==='call'?'on':''}" onclick="meetsTab('call')">שיחות טלפון${isMgr?'':' <i class="ms-soon">בקרוב · SIM</i>'}</button>
  </div>`;
  let body='';
  if(MEETS_TAB==='call'&&!isMgr){
    body=`<div class="advl"><div class="ms-empty">
      <b>שיחות מוקלטות — בדרך אליך.</b><br>
      עם ה-SIM של HK כל שיחת טלפון עם לקוח תוקלט, תתומלל ותעדכן את זיכרון הלקוח — בדיוק כמו פגישה.
      כרגע השיחות המוקלטות פעילות אצל מנהלי התזרים.</div></div>`;
  }else if(MEETS_TAB==='call'){
    body=`<div class="advl">
      <div class="advl-head"><span class="advl-title">שיחות מוקלטות · SIM</span><span class="advl-sub">כל שיחה מתומללת ומעדכנת את זיכרון הלקוח</span></div>
      ${MEETS_CALLS.map(cl=>`<div class="ms-row">
        <div class="ms-when">${cl.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${cl.c}</b> — ${cl.t}</div>
          <div class="ms-meta">${cl.who} · ${cl.dur} · ${cl.st==='proc'?'<span class="msp-chip purple">בעיבוד AI</span>':`הזיכרון עודכן${cl.mem?' ('+cl.mem+')':''}`}</div></div>
        ${cl.st==='ok'&&cl.mem?`<button class="mt-btn view sm" onclick="advPop&&advPop('mem')">עדכוני זיכרון</button>`:''}
      </div>`).join('')}
    </div>`;
  }else{
    /* דורש פעולה */
    const act=`<div class="advl">
      <div class="advl-head"><span class="advl-title">דורש פעולה</span></div>
      ${pendSum?`<div class="ms-row act"><span class="ms-dot warn"></span><div class="ms-b"><div class="ms-t"><b>אנרגי אינטרנשיונל</b> — סיכום פגישת 09:00 ממתין לאישורך</div><div class="ms-meta">כולל עדכון זיכרון רגיש אחד</div></div><button class="mt-btn" onclick="toast('נפתח הסיכום לאישור')">לאישור</button></div>`:''}
      <div class="ms-row act"><span class="ms-dot bad"></span><div class="ms-b"><div class="ms-t"><b>משה עובד</b> — Money+ בלי פגישה מתואמת · 41 יום מהאחרונה</div><div class="ms-meta">מגיעה לו פגישה חודשית בחוזה</div></div><button class="mt-btn" onclick="toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')">שליחת זמנים</button></div>
      <div class="ms-row act"><span class="ms-dot warn"></span><div class="ms-b"><div class="ms-t"><b>אנרגי גולני</b> — הפגישה לא התקיימה · לתאם מחדש</div><div class="ms-meta">בוטלה אתמול ע״י הלקוח</div></div><button class="mt-btn" onclick="toast('נשלחה הצעה לתיאום מחדש')">תיאום מחדש</button></div>
    </div>`;
    /* קרובות */
    const up=`<div class="advl">
      <div class="advl-head"><span class="advl-title">הפגישות הקרובות</span><span class="advl-sub">שלך ושל יועצי HK עבור הלקוחות שלך</span></div>
      ${MEETS_UP.map(m=>`<div class="ms-row">
        <div class="ms-when">${m.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${m.c}</b> — ${m.t}</div>
          <div class="ms-meta">${m.prep==='ready'?'<span class="ms-prep ok">הכנה מוכנה</span>':'<span class="ms-prep">הכנה תיווצר אוטומטית מהזיכרון</span>'}</div></div>
        ${_byChip(m)}
        ${m.by==='me'?`<button class="mt-btn view sm" onclick="selectClient(${(CLIENTS.findIndex(x=>x.name===m.c)+1||1)-1});showTab('prep')">להכנה</button>`:''}
      </div>`).join('')}
    </div>`;
    /* התקיימו — צינור עיבוד */
    const pipe=m=>{
      if(!m.rec) return `<span class="ms-pipe warn">לא הוקלטה — הזיכרון לא התעדכן</span>`;
      const sum=m.sum==='pend'?'<i class="msp warn">סיכום · לאישורך</i>':'<i class="msp ok">סיכום ✓</i>';
      const mem=m.mem?`<i class="msp mem">זיכרון עודכן (${m.mem})</i>`:'<i class="msp">—</i>';
      return `<span class="ms-pipe"><i class="msp ok">הוקלטה · ${m.dur}</i><i class="msp ok">תומללה ✓</i>${sum}${mem}</span>`;
    };
    const past=`<div class="advl">
      <div class="advl-head"><span class="advl-title">התקיימו לאחרונה</span><span class="advl-sub">כל פגישה מוקלטת הופכת לסיכום, משימות וזיכרון</span></div>
      ${MEETS_PAST.map(m=>`<div class="ms-row">
        <div class="ms-when">${m.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${m.c}</b> — ${m.t}</div><div class="ms-meta">${pipe(m)}</div></div>
        ${_byChip(m)}
        ${m.mem?`<button class="mt-btn view sm" onclick="advPop&&advPop('mem')">עדכוני זיכרון</button>`:''}
      </div>`).join('')}
    </div>`;
    /* מקצב פר לקוח */
    const cad=`<div class="advl">
      <div class="advl-head"><span class="advl-title">מקצב פגישות — לפי לקוח</span><span class="advl-sub">לפי המוצר של כל לקוח · שאף אחד לא יתפספס</span></div>
      <div class="ms-cad-h"><span>לקוח</span><span>מוצר</span><span>מי מקיים</span><span>אחרונה</span><span>הבאה</span><span></span></div>
      ${MEETS_CAD.map(r=>`<div class="ms-cad ${r.ok?'':'bad'}">
        <b>${r.c}</b>
        <span>${typeof prodLogo==='function'&&r.prod?prodLogo(r.prod,'sm'):r.prod}</span>
        <span>${r.by==='hk'?'יועץ HK':'אני'}</span>
        <span>${r.last}</span>
        <span class="${r.ok?(r.none?'mut':''):'neg'}">${r.next}${r.gap?` · ${r.gap}`:''}</span>
        <span>${r.ok?'':`<button class="mt-btn sm" onclick="toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')">שליחת זמנים</button>`}</span>
      </div>`).join('')}
    </div>`;
    body=`${act}<div class="ms-2col">${up}${past}</div>${cad}`;
  }
  el.innerHTML=`<div class="ms-arena">${stats}${tabs}${body}</div>`;
}
