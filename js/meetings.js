/* HK Dashboard — meetings list + summary modal */
  /* ---- meetings + summary ---- */
  // status: upcoming | ai (הוקלטה, ה-AI מעבד) | summary (סיכום ממתין לאישור) | done | noshow
  // rec = משך ההקלטה — כל פגישה מוקלטת ומתועדת אוטומטית
  const MEETINGS=[
    {name:'פגישה שוטפת - סקירת תזרים', client:'אנרגי אינטרנשיונל', date:'02.07.2026', time:'09:00-10:00', adv:'אילון אשכנזי', status:'ai', rec:'46 דק׳'},
    {name:'פ.ע - חודש יוני', client:'אנרגי אינטרנשיונל', date:'01.06.2026', time:'11:00-12:00', adv:'אילון אשכנזי', status:'summary', rec:'58 דק׳'},
    {name:'פגישת עבודה - קורס מנחות', client:'מטעי גבעון', date:'12.05.2026', time:'10:00-11:00', adv:'אילון אשכנזי', status:'summary', rec:'52 דק׳'},
    {name:'פגישה חודשית - יולי (Money+)', client:'מטעי גבעון', date:'15.07.2026', time:'10:00-11:00', adv:'אילון אשכנזי', status:'upcoming'},
    {name:'סקירת רבעון Q3', client:'משה עובד', date:'10.07.2026', time:'14:00-15:00', adv:'אילון אשכנזי', status:'upcoming'},
    {name:'לימוד בנדל - לחיות בתשוקה', client:'אנרגי גולני', date:'05.05.2026', time:'09:00-10:00', adv:'אילון אשכנזי', status:'done', rec:'55 דק׳'},
    {name:'פגישה חודשית - מרץ', client:'רימון יצחק', date:'17.03.2026', time:'12:00-13:00', adv:'אילון אשכנזי', status:'done', rec:'61 דק׳'},
    {name:'פ.ע - חודש פברואר', client:'טיב השוק', date:'04.02.2026', time:'10:30-11:30', adv:'אילון אשכנזי', status:'noshow'},
  ];
  let MEET_FILTER='all';
  const CAL_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>';
  const CLK_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const USR_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
  function renderMeetings(){
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
    el.innerHTML=list.map(({m,i})=>{
      const rec=m.rec?`<span class="rec-badge">🎙 ${m.rec}</span>`:'';
      const ai=m.status==='ai'?`<span class="ai-badge"><span class="ai-spin"></span> ה-AI מעבד את ההקלטה</span>`:'';
      let btn;
      if(m.status==='ai') btn=`<button class="mt-btn view" disabled style="opacity:.55;cursor:default">סיכום בהכנה…</button>`;
      else if(isClient) btn=`<button class="mt-btn view" onclick="openMeeting(${i})">צפייה בסיכום</button>`;
      else if(m.status==='summary')btn=`<button class="mt-btn" onclick="openMeeting(${i})">אישור הסיכום</button>`;
      else if(m.status==='done')btn=`<button class="mt-btn view" onclick="openMeeting(${i})">צפייה בסיכום</button>`;
      else if(m.status==='upcoming')btn=`<button class="mt-btn view" onclick="toast('פרטי הפגישה')">פרטי פגישה</button>`;
      else btn=`<button class="mt-btn view" onclick="toast('תיאום פגישה מחדש')">תיאום מחדש</button>`;
      return `<div class="mtcard">
        <div class="mt-info">${isClient?'':`<div class="mt-client">${m.client}</div>`}<div class="mt-name">${m.name} ${rec}${ai}</div>
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
  function openMeeting(i){const m=MEETINGS[i];
    document.getElementById('msTitle').textContent=m.name;
    document.getElementById('msDate').textContent=m.date;
    document.getElementById('msTime').textContent=m.time;
    document.querySelectorAll('.ms-tab').forEach((t,ix)=>t.classList.toggle('on',ix===0));
    document.getElementById('msBody').innerHTML=MS_SUMMARY;
    document.getElementById('msOv').classList.add('show');}
  function closeMeeting(){document.getElementById('msOv').classList.remove('show');}
  function msTab(el,t){document.querySelectorAll('.ms-tab').forEach(x=>x.classList.remove('on'));el.classList.add('on');
    document.getElementById('msBody').innerHTML = (t==='summary')?MS_SUMMARY:'<div class="ms-placeholder">תוכן "'+el.textContent+'" — בקרוב</div>';}
  function sendSummary(){closeMeeting();toast('הסיכום אושר ונשלח ללקוח');}

