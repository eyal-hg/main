/* HK Dashboard — operations mode: timer, role, enter/exit, finish flow (Bizibox checks), task handling */
  /* ---- operations mode (מתפעל בלבד) ---- */
  let isOperator=true, OPSMODE=false;
  const opsDoneSet=new Set(), opsDur={}, opsAccum={};
  let opsStart=0, opsTimer=null, opsTotal=0, opsActiveKey=null;
  const opsKey=()=>SCOPE==='portfolio'?'portfolio':'c'+CUR;
  const OPS_ICO_GEAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>';
  const OPS_ICO_CHECK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
  const OPS_ICO_CLOCK='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const fmtDur=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  function startOpsTimer(){opsStart=Date.now();const base=opsAccum[opsActiveKey]||0;const el=document.getElementById('opsClock');
    const tick=()=>{el.innerHTML=OPS_ICO_CLOCK+' '+fmtDur(base+Math.floor((Date.now()-opsStart)/1000));};
    tick();clearInterval(opsTimer);opsTimer=setInterval(tick,1000);}
  function stopOpsTimer(){clearInterval(opsTimer);opsTimer=null;}
  const opsSession=()=>Math.floor((Date.now()-opsStart)/1000);
  function updateOpsBtn(){
    const btn=document.getElementById('btnOps');
    btn.style.display=(isOperator&&!OPSMODE)?'flex':'none';
    const k=opsKey(), done=opsDoneSet.has(k);
    btn.classList.toggle('done',done);
    if(done) btn.innerHTML=OPS_ICO_CHECK+' התפעול הושלם'+(opsDur[k]!=null?' · '+fmtDur(opsDur[k]):'');
    else if(opsAccum[k]) btn.innerHTML=OPS_ICO_GEAR+' תפעל · '+fmtDur(opsAccum[k]);
    else btn.innerHTML=OPS_ICO_GEAR+' תפעל';
  }
  let ROLE='manager';
  function setRole(r){
    ROLE=r; isOperator=(r==='manager');
    const rs=document.getElementById('roleSel'); if(rs&&rs.value!==r) rs.value=r;
    if(OPSMODE) exitOps();
    const client=(r==='client1'||r==='clientN'), single=(r==='client1');
    document.getElementById('shell').classList.toggle('no-rail', client);           /* לקוחות — בלי סרגל צדדי: המחליף העליון מספיק */
    document.getElementById('railPortfolio').style.display = single?'none':'';
    document.querySelector('#railPortfolio .cn').textContent = client?'כל החברות שלי':'כל החברות';
    document.querySelectorAll('.tab.advisor-only').forEach(t=>t.style.display=client?'none':'');
    document.querySelector('.top-mid').style.display = client ? 'none' : 'flex';   /* מנהלי תזרים / מוצרים — כלי משרד */
    document.querySelector('.ddl-wrap').style.display = isOperator ? '' : 'none';  /* מוצרים — רק למנהל תזרים; ליועץ לא רלוונטי */
    document.querySelector('.switcher').style.display = single ? 'none' : 'flex';   /* חברה אחת — אין מה להחליף */
    renderRail();
    if(r==='manager') selectPortfolio();        /* מנהל תזרים = תור התפעול */
    else selectClient(0);                        /* יועץ/לקוח = דשבורד חברה */
  }
  function enterOps(){
    OPSMODE=true; opsActiveKey=opsKey(); document.body.classList.add('ops-on');
    document.querySelector('.tabs').style.display='none';
    ['viewDash','viewMetrics','viewChat','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    document.getElementById('opsScope').textContent = SCOPE==='portfolio' ? 'כל החברות' : document.getElementById('headName').textContent;
    document.getElementById('opsView').style.display='';
    // re-entry after completed finish: keep counting from the recorded duration, button becomes refresh
    const wasDone=opsDoneSet.has(opsActiveKey);
    if(wasDone && opsAccum[opsActiveKey]==null) opsAccum[opsActiveKey]=opsDur[opsActiveKey]||0;
    document.getElementById('opsDoneTag').style.display=wasDone?'':'none';
    document.getElementById('opsFinBtn').innerHTML = wasDone
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg> רענון נתונים'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> סיום תפעול';
    OPS_VIEW='open'; renderOps();
    startOpsTimer();
    updateOpsBtn();
    if(location.hash!=='#ops') history.pushState({hkOps:1},'','#ops');
  }
  function restoreDash(){
    stopOpsTimer();
    OPSMODE=false; document.body.classList.remove('ops-on');
    document.getElementById('opsView').style.display='none';
    if(SCOPE!=='portfolio') document.querySelector('.tabs').style.display='';
    const t=document.querySelectorAll('.tab'); t.forEach(x=>x.classList.remove('on')); t[0].classList.add('on');
    document.getElementById('viewDash').style.display='';
    updateOpsBtn();
  }
  function closeOpsTeardown(){   /* סגירת מצב תפעול — שומר את הזמן שנצבר, בלי לגעת בהיסטוריה */
    if(OPSMODE&&opsActiveKey!=null){
      opsAccum[opsActiveKey]=(opsAccum[opsActiveKey]||0)+opsSession();
      if(opsDoneSet.has(opsActiveKey)) opsDur[opsActiveKey]=opsAccum[opsActiveKey]; // חברה שהושלמה — הזמן ממשיך להיצבר
    }
    restoreDash();
    toast('מצב תפעול נסגר · הזמן נשמר');
  }
  function exitOps(){   /* לחיצה על "סגירת מצב תפעול" — סוגר וגם מנקה את ה-URL */
    closeOpsTeardown();
    if(location.hash==='#ops') history.back();
  }
  // כפתור back בדפדפן יוצא ממצב התפעול (ה-URL חוזר ללא #ops)
  window.addEventListener('popstate',function(){
    if(OPSMODE && location.hash!=='#ops') closeOpsTeardown();
  });

  /* סיום תפעול — רענון מ-Bizibox + בדיקת חריגות */
  const FIN_STEPS=['רענון נתונים מ-Bizibox','בדיקת חסרים בתזרים מול התקציב','בדיקת הוצאות והכנסות כפולות','בדיקת נגררות','בדיקת לא צפויות','בדיקת תקינות התזרים'];
  // findings from the Bizibox validation — each maps to the step that found it.
  // send:1 → פעולה ראשית "שלח הודעה" (כמו במצב תפעול); אחרת act ייעודי
  const FIN_FINDINGS=[
    {kind:'missing', step:1, sev:'high', t:'חסר בתזרים — שכירות יוני', d:'בתקציב מתוכננת שכירות 12,000 ₪ לחודש יוני, אך לא נמצאה תנועה מתאימה בתזרים.', act:'הוספה לתזרים'},
    {kind:'missing', step:1, sev:'mid',  t:'חסר בתזרים — ביטוח עסק',   d:'בתקציב מופיע ביטוח חודשי 1,850 ₪ שטרם נרשם בתזרים החודש.', act:'הוספה לתזרים'},
    {kind:'dup',     step:2, sev:'high', t:'הוצאה כפולה — Payment טכנולוגיות', d:'נמצאו שתי הוצאות זהות של 3,540 ₪ בתאריך 28.6 — ייתכן חיוב כפול.', act:'מחיקת כפילות'},
    {kind:'carry',   step:3, sev:'mid',  t:'נגררת 11 ימים — הראל (שילוח)', d:'בחשבון מזרחי 295199 צפינו הוצאה של 2,049 ₪ שטרם הופיעה בבנק — נגררת 11 ימים.', send:1},
    {kind:'unexpected', step:4, sev:'mid', t:'פעולה לא צפויה — "כהן טוב"', d:'בחשבון מזרחי 139287 הופיעה פעולה ע"ס 238 ₪ שלא צפינו בתזרים.', send:1},
    {kind:'invalid', step:5, sev:'mid',  t:'תנועה ללא קטגוריה — העברה 8,200 ₪', d:'תנועה מ-30.6 ללא סיווג. המלצת AI: <b>העברות בין חשבונות</b> — לפי היסטוריית תנועות דומות.', ai:1, rec:'העברות בין חשבונות'},
  ];
  let finTimers=[], finOpen=[];
  function finishOps(){
    opsTotal=(opsAccum[opsActiveKey]||0)+opsSession(); stopOpsTimer();
    const ov=document.getElementById('finOv'); ov.classList.add('show');
    document.getElementById('finFoot').classList.remove('show');
    document.getElementById('finFoot').innerHTML='';
    document.getElementById('finFindings').innerHTML='';
    finOpen=FIN_FINDINGS.map((f,ix)=>ix); // all findings open at start of each run
    document.getElementById('finTitle').textContent=opsDoneSet.has(opsActiveKey)?'מרענן נתונים…':'מסיים תפעול…';
    document.getElementById('finSub').textContent='מרענן נתונים מ-Bizibox ובודק את תקינות התזרים מול התקציב';
    const ico=document.getElementById('finIco'); ico.className='fin-ico'; ico.innerHTML='<div class="spin"></div>';
    document.getElementById('finSteps').innerHTML=FIN_STEPS.map((s,i)=>
      `<div class="fin-step" id="fstep${i}"><span class="fs-ico"></span><span>${s}</span><span class="fs-tag" id="ftag${i}"></span></div>`).join('');
    finTimers.forEach(clearTimeout); finTimers=[];
    let d=400;
    FIN_STEPS.forEach((s,i)=>{
      finTimers.push(setTimeout(()=>{const el=document.getElementById('fstep'+i);
        if(el){el.className='fin-step run';el.querySelector('.fs-ico').innerHTML='<span class="mini-spin"></span>';}},d));
      d+=750;
      finTimers.push(setTimeout(()=>{
        const el=document.getElementById('fstep'+i); if(!el) return;
        const hits=FIN_FINDINGS.filter((f,ix)=>f.step===i&&finOpen.includes(ix)).length;
        if(hits){el.className='fin-step warn';el.querySelector('.fs-ico').innerHTML='!';
          document.getElementById('ftag'+i).textContent=hits+' ממצאים';}
        else{el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
        if(i===FIN_STEPS.length-1) finVerdict();},d));
      d+=250;
    });
  }
  function finVerdict(){
    const open=finOpen.length;
    const ico=document.getElementById('finIco');
    if(open){
      ico.className='fin-ico warn'; ico.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
      document.getElementById('finTitle').textContent='נמצאו '+open+' ממצאים בתזרים';
      document.getElementById('finSub').textContent='יש לטפל בממצאים לפני שליחת התזרים ללקוח';
    }
    renderFinFindings();
  }
  function renderFinFindings(){
    const box=document.getElementById('finFindings');
    box.innerHTML=finOpen.map(ix=>{const f=FIN_FINDINGS[ix];
      // same buttons as ops mode per task kind
      let btns;
      if(f.ai) btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'קוטלג בקטגוריה אחרת')">החלפת קטגוריה</button>
          <button class="ot-btn done" onclick="finResolve(${ix},'אושר — קוטלג ב${f.rec}')">אשר המלצה</button>`;
      else if(f.send) btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'לא רלוונטי')">לא רלוונטי</button>
          <button class="ot-btn" onclick="finResolve(${ix},'נשלחה הודעה ללקוח בוואטסאפ')">שלח הודעה</button>`;
      else btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'לא רלוונטי')">לא רלוונטי</button>
          <button class="ot-btn done" onclick="finResolve(${ix},'${f.act}')">${f.act}</button>`;
      return `<div class="ffind ${f.sev}">
        <div class="ffind-b"><div class="ffind-t">${f.t}</div><div class="ffind-d">${f.d}</div></div>
        <div class="ffind-act">${btns}</div>
      </div>`;}).join('');
    renderFinFoot();
  }
  function finResolve(ix,action){
    finOpen=finOpen.filter(x=>x!==ix);
    toast(action+' ✓');
    if(!finOpen.length){
      const ico=document.getElementById('finIco'); ico.className='fin-ico ok';
      ico.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
      document.getElementById('finTitle').textContent='התזרים תקין ומעודכן';
      document.getElementById('finSub').textContent='כל הממצאים טופלו · הושלם ב-'+fmtDur(opsTotal);
      document.querySelectorAll('.fin-step.warn').forEach(el=>{el.className='fin-step done';
        el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
        const tag=el.querySelector('.fs-tag'); if(tag) tag.textContent='טופל';});
    }
    renderFinFindings();
  }
  function renderFinFoot(){
    const foot=document.getElementById('finFoot');
    if(finOpen.length){foot.classList.remove('show');foot.innerHTML='';return;}
    foot.innerHTML=`
      <div class="fin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> אין חריגות — התזרים מוכן לשליחה</div>
      <button class="fin-wa" onclick="finSendCF()"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.14-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg> שליחת תזרים ללקוח</button>
      <button class="chip-btn" style="width:100%;justify-content:center" onclick="finishDone()">סיום ללא שליחה</button>`;
    foot.classList.add('show');
  }
  function finSendCF(){
    // sent-confirmation state: the message + how long the operation took
    const c=CLIENTS[CUR]||{};
    const ico=document.getElementById('finIco'); ico.className='fin-ico wa';
    ico.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
    document.getElementById('finTitle').textContent='ההודעה נשלחה ללקוח ✓';
    document.getElementById('finSub').textContent='התזרים המעודכן נשלח בוואטסאפ ל'+(c.name||'לקוח');
    document.getElementById('finSteps').innerHTML='';
    document.getElementById('finFindings').innerHTML=`
      <div class="fin-msg"><div class="fin-msg-b">שלום 👋 סיימנו כעת את התפעול שלך — להלן התזרים המעודכן 📊<span class="fin-msg-t">15:47 ✓✓</span></div></div>
      <div class="fin-stats">
        <div class="fstat"><div class="fs-n">${fmtDur(opsTotal)}</div><div class="fs-l">משך התפעול</div></div>
        <div class="fstat"><div class="fs-n">${FIN_FINDINGS.length}</div><div class="fs-l">ממצאים טופלו</div></div>
        <div class="fstat"><div class="fs-n">6</div><div class="fs-l">בדיקות תקינות</div></div>
      </div>`;
    document.getElementById('finFoot').innerHTML='<button class="chip-btn primary" style="width:100%;justify-content:center" onclick="finishDone()">חזרה לדשבורד</button>';
    document.getElementById('finFoot').classList.add('show');
  }
  function finishDone(){opsDur[opsActiveKey]=opsTotal;opsDoneSet.add(opsActiveKey);delete opsAccum[opsActiveKey];document.getElementById('finOv').classList.remove('show');restoreDash();toast('התפעול הושלם בהצלחה ✓');if(location.hash==='#ops') history.back();}

  /* ops console data + render */
  const OPS_TYPES={
    msg:       {label:'הודעות מלקוח', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>'},
    doc:       {label:'מסמכים', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'},
    ai:        {label:'קיטלוג AI', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg>'},
    carry:     {label:'נגררות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>'},
    unexpected:{label:'לא צפויות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'},
    overdraft: {label:'חריגות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l6 6 4-4 8 8M21 17v-4h-4"/></svg>'},
  };
  let OPS_FILTER='all', OPS_VIEW='open', OPS_DONE=14;
  function seedOps(){
    CLIENTS[0].tasks=[
      {type:'msg', who:'תומר לוי', thread:['האם עדכנת את כל התשלומים?','מה הצפי סה"כ בשלוש החשבונות?'], time:'לפני 12 דק׳'},
      {type:'doc', name:'חשבונית ספק — סונול · 4,820 ₪', time:'לפני 40 דק׳'},
      {type:'ai', op:'עמלת מסלול · 29 ₪- · 1.7.2026', cur:'בנקאיות', rec:'עמלות וריביות בנק', reason:'העסקה היא עמלת מסלול בנקאית עבור ניהול חשבון, ובהתאם להיסטוריה ולמידע מהרשת הקטגוריה המתאימה ביותר היא עמלות וריביות בנק.', src:'HISTORY, SEARCH', time:'לפני 50 דק׳'},
      {type:'carry', text:'בחשבון מזרחי 295199 צפינו פעולת הוצאה "הראל (שילוח)" ע"ס 2,049 ₪. הפעולה טרם הופיעה — נגררת 11 ימים.', time:'לפני שעה'},
      {type:'unexpected', text:'בחשבון מזרחי 139287 הופיעה פעולה בשם "כהן טוב" ע"ס 238 ₪ שלא צפינו.', time:'לפני שעה'},
      {type:'overdraft', text:'חשבון מרכנתיל 69855155 נמצא בחריגה ע"ס 42,445 ₪ ממסגרת האשראי. נא טיפול בהקדם.', time:'היום 09:14'},
      {type:'msg', who:'לירון', thread:['תודה על העדכון!'], time:'אתמול', done:true, result:'טופל · ✓ נשלח ללקוח', handledAt:'אתמול 16:20'},
      {type:'ai', op:'הוצאת ביטוח · 890 ₪-', cur:'כללי', rec:'ביטוחים', reason:'לפי תיאור הספק.', src:'HISTORY', time:'אתמול', done:true, result:'אושר — קוטלג בביטוחים', handledAt:'אתמול 15:05'},
    ];
    CLIENTS[1].tasks=[
      {type:'doc', name:'דף חשבון — מזרחי טפחות · יוני', time:'לפני 20 דק׳'},
      {type:'ai', op:'תשלום ספקים · 2,100 ₪-', cur:'כללי', rec:'ספקים', reason:'לפי היסטוריית התשלומים לספק זה.', src:'HISTORY', time:'לפני שעה'},
    ];
    CLIENTS[2].tasks=[
      {type:'overdraft', text:'חשבון בחריגה — נדרש טיפול בהקדם.', time:'לפני 30 דק׳'},
      {type:'ai', op:'6,773 ₪+ ← "קיר זי בע״מ"', cur:'כללי', rec:'הלוואות', reason:'לפי דפוסי ההכנסה מהמקור.', src:'HISTORY, SEARCH', time:'לפני 55 דק׳'},
      {type:'carry', text:'תשלום צפוי שטרם הופיע — נגררת 4 ימים.', time:'היום 09:14'},
    ];
    CLIENTS[3].tasks=[];
    CLIENTS[4].tasks=[];
    CLIENTS[2].unread=2; CLIENTS[4].unread=1;
    CLIENTS[1].debt=1200; CLIENTS[3].debt=480;
    opsDoneSet.add('c4'); opsDur['c4']=320;
    CLIENTS[0].preview='תחזרו אליי היום · צפייה בתזרים';
    CLIENTS[2].preview='האם היתרה שלי מספיקה?';
    CLIENTS[4].preview='אפשר דוח תזרים מעודכן?';
    CLIENTS[2].stat='trial'; CLIENTS[3].stat='setup';
    CLIENTS[0].product='money'; CLIENTS[1].product='meeting'; CLIENTS[2].product='money+'; CLIENTS[3].product='money'; CLIENTS[4].product='money+';
    // per-company metric values feeding the alert-rule engine (order: אינטרנשיונל · גולני · גבעון · עובד · יצחק)
    // budget=% ביצוע · overdraft=ימים לחריגת עו״ש (0=אין) · liters/cfprofit=% מהיעד
    const MET=[
      {budget:82,  overdraft:9, liters:78,  cfprofit:104},
      {budget:96,  overdraft:0, liters:96,  cfprofit:88},
      {budget:114, overdraft:0, liters:120, cfprofit:70},
      {budget:85,  overdraft:0, liters:101, cfprofit:83},
      {budget:63,  overdraft:0, liters:112, cfprofit:130},
    ];
    MET.forEach((m,i)=>{if(CLIENTS[i]){CLIENTS[i].metrics=m;CLIENTS[i].budgetPct=m.budget;}});
    CLIENTS.forEach(c=>{if(!c.stat)c.stat='active'; c.opsPending=(c.tasks||[]).filter(t=>!t.done).length;});
  }
  function curTasks(){return CLIENTS[CUR].tasks||(CLIENTS[CUR].tasks=[]);}
  function taskTitle(t){
    if(t.type==='msg') return (t.who?t.who+': ':'')+(t.thread?t.thread[t.thread.length-1]:'הודעה');
    if(t.type==='doc') return t.name;
    if(t.type==='ai') return 'קיטלוג: '+t.op;
    return (t.text||'').replace(/\s+/g,' ').slice(0,70);
  }
  let OPS_OPEN=new Set();
  function renderOps(){
    const T=curTasks();
    const open=T.filter(x=>!x.done), done=T.filter(x=>x.done);
    document.getElementById('opsCount').textContent = open.length?'· '+open.length+' משימות ממתינות':'· הכל טופל';
    const pool=(OPS_VIEW==='open'?open:done);
    const head=`<div class="ops-rows-head">
      <div class="orh-l"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg><span>משימות תפעול</span></div>
      <div class="ops-toggle">
        <div class="otg ${OPS_VIEW==='open'?'on':''}" onclick="opsSetView('open')">ממתין <span class="otg-n">${open.length}</span></div>
        <div class="otg ${OPS_VIEW==='done'?'on':''}" onclick="opsSetView('done')">טופל <span class="otg-n">${done.length}</span></div>
      </div>
      <span class="olh-note">טופלו היום: ${OPS_DONE}</span>
    </div>`;
    const body = pool.length
      ? pool.map(t=>opsRow(t,T.indexOf(t))).join('')
      : '<div class="ops-empty" style="padding:50px">'+(OPS_VIEW==='open'?'אין משימות תפעול פתוחות — כל הכבוד':'עדיין לא טופלו משימות')+'</div>';
    document.getElementById('opsGrid').innerHTML = '<div class="ops-rows">'+head+body+'</div>';
  }
  function opsSetView(v){OPS_VIEW=v;renderOps();}
  function opsToggleRow(i){OPS_OPEN.has(i)?OPS_OPEN.delete(i):OPS_OPEN.add(i);renderOps();}
  function rowBtns(t,i){
    const B=(cls,label,h)=>`<button class="ot-btn ${cls}" onclick="event.stopPropagation();${h}">${label}</button>`;
    if(t.type==='msg') return B('done','טופל',`otHandle(${i},'טופל · ✓ ללקוח',1)`);
    if(t.type==='doc') return B('ghost','לא רלוונטי',`otHandle(${i},'לא רלוונטי')`)+B('done','טופל',`otHandle(${i},'טופל · ✓ ללקוח',1)`);
    if(t.type==='ai') return B('ghost','החלפת קטגוריה',`otHandle(${i},'קוטלג בקטגוריה אחרת')`)+B('done','אשר המלצה',`otHandle(${i},'אושר — קוטלג ב${t.rec}')`);
    return B('ghost','לא רלוונטי',`otHandle(${i},'לא רלוונטי')`)+B('','שלח הודעה',`otHandle(${i},'נשלחה הודעה ללקוח')`);
  }
  function taskBody(t,i){
    const rep=`<div class="ot-reply" style="display:flex"><input id="oti${i}" placeholder="הקלד תגובה ללקוח…" onkeydown="if(event.key==='Enter')otSend(${i})"><button onclick="otSend(${i})">שלח</button></div>`;
    if(t.type==='msg') return `<div class="ot-thread">${(t.thread||[]).map(m=>`<div class="ot-bub">${m}</div>`).join('')}</div>${rep}`;
    if(t.type==='doc') return `<div class="ot-doc"><div class="ot-docprev" onclick="toast('הגדלת מסמך')"><span class="ot-zoom">⤢ הגדלה</span><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>תצוגה מקדימה של המסמך</div></div>${rep}`;
    if(t.type==='ai') return `<div class="ot-ai"><div class="ot-airow"><span class="ot-ailbl">פעולה</span><span>${t.op}</span></div><div class="ot-airow"><span class="ot-ailbl">קטגוריה נוכחית</span><span>${t.cur}</span></div><div class="ot-airow"><span class="ot-ailbl">קטגוריה מומלצת</span><span class="ot-rec">${t.rec}</span></div><div class="ot-reason"><b>סיבה:</b> ${t.reason}</div><div class="ot-src">מקורות: ${t.src}</div></div>`;
    return `<div class="ot-text">${t.text}</div>`+(t.type==='unexpected'?`<div style="margin-top:10px"><button class="ot-btn ghost" onclick="toast('צפייה בתנועות קשורות')">צפייה בתנועות קשורות</button></div>`:'');
  }
  function opsRow(t,i){
    const tp=OPS_TYPES[t.type], op=OPS_OPEN.has(i);
    if(t.done) return `<div class="orow2item ${t.type} is-done"><div class="orow2"><span class="ochip ${t.type}">${tp.icon}</span><div class="orow2-body"><div class="orow2-title">${taskTitle(t)}</div><div class="orow2-sub">${tp.label} · טופל ${t.handledAt||''}</div></div><span class="orow2-doneflag">✓ ${t.result||'טופל'}</span></div></div>`;
    return `<div class="orow2item ${t.type} ${op?'open':''}">
      <div class="orow2">
        <span class="ochip ${t.type}" onclick="opsToggleRow(${i})">${tp.icon}</span>
        <div class="orow2-body" onclick="opsToggleRow(${i})"><div class="orow2-title">${taskTitle(t)}</div><div class="orow2-sub">${tp.label} · ${t.time||''}</div></div>
        <div class="orow2-act">${rowBtns(t,i)}</div>
        <svg class="orow2-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="opsToggleRow(${i})"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${op?`<div class="orow2-detail">${taskBody(t,i)}</div>`:''}
    </div>`;
  }
  function otHandle(i,result,toClient){const t=curTasks()[i];if(!t)return;
    t.done=true;t.result=result;t.handledAt='עכשיו';OPS_DONE++;
    CLIENTS[CUR].opsPending=curTasks().filter(x=>!x.done).length;
    OPS_OPEN.delete(i);renderOps();toast(toClient?'✓ נשלח אישור טיפול ללקוח':result);}
  function otSend(i){const inp=document.getElementById('oti'+i);if(!inp)return;const v=inp.value.trim();if(!v)return;inp.value='';toast('נשלחה תגובה ללקוח בוואטסאפ');}
  seedOps();

