/* HK Dashboard — operations mode: timer, role, enter/exit, finish flow (Bizibox checks), task handling */
  /* ---- operations mode (מתפעל בלבד) ---- */
  let isOperator=true, OPSMODE=false;
  /* ===== דילוג דמו על שלבי התפעול =====
     true  = לחיצה על "תפעול" נוחתת ישר על שלבי הבדיקה (לעבודה על הבדיקות).
     false = הזרימה המלאה: 5 שלבי תפעול ← רענון וכפילויות ← בדיקות.
     כרגע false — נוחתים על שלב 1 "הודעות לקוח" (ראו OPS_PREDONE). */
  const OPS_SKIP_STAGES=false;
  /* דילוג נוסף: גם על חמשת שלבי הבדיקה — נוחתים ישר על מסך סיום התפעול */
  const OPS_SKIP_CHECKS=true;
  /* דמו: מסך הסיום עם חריגות. false ⇒ "אין חריגות — מוכן לשליחה" */
  const OPS_DEMO_EXC=true;
  /* בדיקת הכפילויות ברענון — כבויה כרגע. הרענון עצמו נשאר. */
  const OPS_REF_DUPS=false;
  /* ===== חריגות בסיום התפעול — ארבעה מצבים על שני צירים =====
     מתי: **בפועל** (החשבון כבר במינוס) מול **צפויה** (התחזית נכנסת למינוס).
     פתרון: **יש** (יתרה חיובית בחשבון אחר שמכסה) מול **אין** (הכסף לא קיים בשום מקום).
       בפועל + פתרון  → העברה בין חשבונות, נסגר עכשיו.
       בפועל + אין     → הכי חמור: אין מאיפה לכסות ⇒ התראה ליועץ וללקוח.
       צפויה + פתרון  → תזמון ההעברה למועד, לפני שזה קורה.
       צפויה + אין     → החלטה עסקית: דחיית תשלום / האצת גבייה / מסגרת.
     אי אפשר לשלוח תזרים ללקוח עם חריגה שלא הוכרעה. */
  let FIN_EXC=[];
  const EXC_WHEN={now:{lbl:'בפועל',cls:'now'}, soon:{lbl:'צפויה',cls:'soon'}};
  const FIN_EXC_DEF=()=>[
    {k:'e1', when:'now', t:'עו״ש לאומי 604 — 161,198- ₪',
     s:'בחריגה בפועל 6 ימים · מסגרת 150,000 ₪',
     fix:'העברה מעו״ש פועלים 112 — יתרה חיובית 312,400 ₪', done:false},
    {k:'e2', when:'now', t:'כרטיס אשראי מקס — חיוב נדחה 18,400 ₪',
     s:'החיוב לא כובד · אין יתרה פנויה בשום חשבון',
     fix:null, done:false},
    {k:'e3', when:'soon', t:'עו״ש מזרחי 295199 — חריגה צפויה ב-24.08',
     s:'32,400- ₪ בעוד 9 ימים',
     fix:'תזמון העברה מפועלים 112 ל-23.08', done:false},
    {k:'e4', when:'soon', t:'עו״ש לאומי 604 — חריגה צפויה ב-10.09',
     s:'47,900- ₪ · אין יתרה חיובית שתכסה במועד',
     fix:null, done:false},
  ];
  /* HK מדווחת — היא לא מבצעת העברות ולא מתזמנת אותן.
     הפעולה היחידה על חריגה היא להביא אותה לידיעת הלקוח. */
  function finExcMsg(k){
    const e=FIN_EXC.find(x=>x.k===k); if(!e) return;
    e.done=true; e.ign=false; renderFinFoot();
    toast('נשלחה הודעה ל'+(CLIENTS[CUR].name||'לקוח')+' — '+e.t);
  }
  function finExcIgn(k){
    const e=FIN_EXC.find(x=>x.k===k); if(!e) return;
    e.done=true; e.ign=true; renderFinFoot();
    toastUndo('החריגה סומנה כלא לדיווח',()=>{e.done=false;e.ign=false;renderFinFoot();});
  }
  /* שלבי תפעול שמסומנים כטופלו מראש בדמו — כדי לנחות על השלב שרוצים להציג.
     ריק ⇒ נוחתים על "הודעות לקוח" (השלב הראשון).
     'msg','doc' ⇒ קטגוריות · +'ai' ⇒ מוטבים · +'payee' ⇒ נגררות ·
     +'carry','unexpected' ⇒ הזנות · +'sheet' ⇒ ישר לסיום. */
  const OPS_PREDONE=[];
  /* שלבי העבודה בתפעול — סדר קבוע, משותף למסך ולסרגל */
  /* ההודעות ראשונות: הן השלב היחיד שבו מישהו מחכה, והן מזינות את השאר
     (אישור העברה ⇒ שורה בתזרים · צילום שיק ⇒ מוטב · אקסל ⇒ הזנות). */
  const OPS_STAGES=[
    ['msg','הודעות לקוח','הודעות מלל וקבצים מהלקוח — מענה והזנה לתזרים'],
    ['ai','קטגוריות','אישור המלצות הקיטלוג של ה-AI'],
    ['payee','מוטבים','שיקים יוצאים מ-Bizibox — הזנת מוטב וקטגוריה'],
    ['carry','נגררות ולא צפויות','פעולות שצפינו וטרם הופיעו · פעולות שהופיעו בלי צפי'],
    ['sheet','הזנות ואוטומציה','צפי קדימה: תשלומים לספקים ותקבולים מלקוחות — מהלקוח ומהאוטומציה, אישור וצביעה בתזרים'],
  ];
  let OPS_STAGE_LOG=[];
  const STAGE_TASK_TYPES=['ai','payee','carry','unexpected','msg','doc','sheet'];
  const stageTasksDone=()=>{const st=curTasks().filter(t=>STAGE_TASK_TYPES.includes(t.type));return st.length?st.every(t=>t.done):true;};
  function opsPeek(i){window._opsPeek=(i==null||window._opsPeek===i)?null:i;renderOps();}
  const opsDoneSet=new Set(), opsDur={}, opsAccum={};
  let opsStart=0, opsTimer=null, opsTotal=0, opsActiveKey=null;
  const opsKey=()=>SCOPE==='portfolio'?'portfolio':'c'+CUR;
  const OPS_ICO_GEAR='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>';
  const OPS_ICO_CHECK='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
  const OPS_ICO_CLOCK='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const fmtDur=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
  function startOpsTimer(){
    /* חברה שסיימה ואין לה עבודה חדשה — השעון עומד, אין מה לספור */
    if(window._opsDoneScreen){ stopOpsTimer(); const c=document.getElementById('opsClock');
      if(c) c.textContent=' '+fmtDur(opsDur[opsActiveKey]||opsAccum[opsActiveKey]||0); return; }
    opsStart=Date.now();const base=opsAccum[opsActiveKey]||0;const el=document.getElementById('opsClock');
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
    if(client){   /* משטחים של היועץ שנשארו פתוחים מהתפקיד הקודם — פס טרום-פגישה ופס הקלטה */
      const pb=document.getElementById('preMeetBar');
      if(pb){ pb.style.display='none'; document.body.classList.remove('bar-on'); }
      if(typeof REC!=='undefined'&&REC.on&&typeof recStop==='function') recStop();
    }
    document.querySelectorAll('.tab.advisor-only').forEach(t=>t.style.display=client?'none':'');
    document.querySelector('.top-mid').style.display = isOperator ? 'flex' : 'none';   /* מנהלי תזרים / מוצרים — כלי משרד בלבד */
    document.querySelector('.switcher').style.display = single ? 'none' : 'flex';   /* חברה אחת — אין מה להחליף */
    if(r==='manager'||r==='advisor') selectPortfolio();   /* הבית: יועץ = היום, מנהל = תפעול */
    else if(r==='clientN') selectPortfolio();              /* לקוח רב-חברות = מבט מאוחד */
    else selectClient(0);                                  /* לקוח יחיד = דשבורד החברה */
  }
  function enterOps(){
    OPSMODE=true; opsActiveKey=opsKey(); OPS_STAGE_LOG=[]; window._stgIx=null; window._opsPeek=null; document.body.classList.add('ops-on'); if(typeof renderGlobalRail==='function')renderGlobalRail();
    document.querySelector('.tabs').style.display='none';
    ['viewDash','viewMetrics','viewChat','viewCal','viewSettings','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    document.getElementById('opsScope').textContent = SCOPE==='portfolio' ? 'כל החברות' : document.getElementById('headName').textContent;
    document.getElementById('opsView').style.display='';
    /* דילוג דמו: ישר לשלבי הבדיקה — בלי 5 שלבי התפעול ובלי שער הכפילויות */
    if(OPS_SKIP_STAGES){
      /* גם בדילוג — עוברים דרך רענון הנתונים. הוא השער למסך הסיום. */
      setTimeout(()=>{ renderOps(); finishOps(); },0);
    }
    // מסך עבודה נקי: שם החברה חי בבאנר — בלי כותרת כפולה ובלי סרגל
    document.querySelector('.client-head').style.display='none';
    document.querySelector('.sub-line').style.display='none';
    document.getElementById('shell').classList.add('no-rail');
    // re-entry after completed finish: keep counting from the recorded duration, button becomes refresh
    window._opsDoneScreen=false; window._opsForce=null;
    const wasDone=opsDoneSet.has(opsActiveKey);
    if(wasDone && opsAccum[opsActiveKey]==null) opsAccum[opsActiveKey]=opsDur[opsActiveKey]||0;
    /* חברה שכבר סיימה את המחזור — אותו פס, עם התג "התפעול הושלם".
       השעון ממשיך מהזמן שנצבר; אין הפרדה בין הזמנים. */
    const dt=document.getElementById('opsDoneTag');
    dt.style.display=wasDone?'':'none';
    opsEndBtnMode();
    const _cls=document.querySelector('.ops-close');
    if(_cls){ _cls.innerHTML=wasDone
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg> סגירה · הזמן נשמר'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> השהיה · הזמן נשמר'; }
    document.getElementById('opsFinBtn').innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg> רענון נתונים';
    /* חברה שכבר סיימה: יש הודעות חדשות ⇒ נוחתים עליהן (השלבים בכל מקרה מטפלים בזה).
       אין הודעות ⇒ מסך "התפעול הושלם" — לא הסיכום מחדש. */
    if(wasDone){
      const openNow=curTasks().filter(x=>!x.done);
      const msgs=openNow.filter(x=>x.type==='msg'||x.type==='doc');
      if(msgs.length) window._opsForce=0;
      else if(!openNow.length){ window._opsDoneScreen=true; }
    }
    OPS_VIEW='open'; renderOps();
    // אין בכלל מה לתפעל? — עוברים אוטומטית לרענון ולבדיקות
    if(!finPaused&&!wasDone&&window._autoFin!==opsActiveKey&&stageTasksDone()){
      window._autoFin=opsActiveKey;
      setTimeout(()=>finishOps(),800);
    }
    // אם יצאנו באמצע הבדיקות — חוזרים ישר אליהן
    if(finPaused&&FIN_STATE&&FIN_STATE.key===opsActiveKey){
      document.getElementById('opsGrid').style.display='none';
      document.getElementById('finView').style.display=''; opsEndBtnMode();
      finPaused=false;
    }
    startOpsTimer();
    updateOpsBtn();
    if(location.hash!=='#ops') history.pushState({hkOps:1},'','#ops');
  }
  function restoreDash(){
    stopOpsTimer();
    OPSMODE=false; document.body.classList.remove('ops-on');
    document.getElementById('opsView').style.display='none';
    const t=document.querySelectorAll('.tab'); t.forEach(x=>x.classList.remove('on')); t[0].classList.add('on');
    document.getElementById('viewDash').style.display='';
    document.getElementById('shell').classList.remove('no-rail');
    document.querySelector('.client-head').style.display='flex';
    document.querySelector('.sub-line').style.display='';
    updateOpsBtn();
    if(typeof renderGlobalRail==='function')renderGlobalRail();
  }
  function closeOpsTeardown(){   /* סגירת מצב תפעול — שומר את הזמן שנצבר, בלי לגעת בהיסטוריה */
    // יציאה מכל נתיב בזמן שהבדיקות פתוחות — נשמר סטטוס "בבדיקות" והשלב
    const fv=document.getElementById('finView');
    if(fv&&fv.style.display!=='none'){
      FIN_STATE={key:opsActiveKey,step:finCurStep};
      finPaused=true;
      fv.style.display='none';
      document.getElementById('opsGrid').style.display='';
    }
    if(OPSMODE&&opsActiveKey!=null){
      opsAccum[opsActiveKey]=(opsAccum[opsActiveKey]||0)+opsSession();
      if(opsDoneSet.has(opsActiveKey)) opsDur[opsActiveKey]=opsAccum[opsActiveKey]; // חברה שהושלמה — הזמן ממשיך להיצבר
    }
    restoreDash();
    toast('מצב התפעול הושהה · הזמן נשמר');
  }
  /* הכפתור הראשי בפס: בשלבי העבודה — "סיום תפעול"; במסך הסיום — "שליחת הודעה",
     כי שם כבר סיימנו וכל מה שנשאר הוא לדבר עם הלקוח. */
  function opsEndBtnMode(){
    const b=document.getElementById('opsEndBtn'); if(!b) return;
    const inFin=document.getElementById('finView').style.display!=='none';
    const still=!inFin&&window._opsDoneScreen;
    b.style.display='';
    const WA='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg> ';
    b.onclick=(inFin||still)?ctsOpen:finishOps;
    b.classList.toggle('as-msg',inFin||still);
    b.innerHTML=still ? WA+'שלח הודעת תזרים'
      : inFin ? WA+'שליחת הודעה'
      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> סיום תפעול';
  }
  /* הסיכום נפתח רק בבקשה מפורשת */
  function opsShowRecap(){
    document.getElementById('opsGrid').style.display='none';
    document.getElementById('finView').style.display='';
    opsTotal=(opsAccum[opsActiveKey]||0);
    FIN_EXC=OPS_DEMO_EXC?FIN_EXC_DEF():[];
    document.getElementById('finSteps').innerHTML=FIN_STEPS.map((s,i)=>
      `<div class="fin-step done" id="fstep${i}"><span class="fs-num">${i+1}</span><span class="fs-ico"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span><span>${s}</span><span class="fs-tag" id="ftag${i}">נבדק</span></div>`).join('');
    finCurStep=FIN_STEPS.length; finOpen=[];
    finAllDone(); finChatFill(); opsEndBtnMode();
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
  /* סיום תפעול — שלבים בסדר קבוע; קל להוסיף בדיקות בהמשך */
  const FIN_STEPS=[
    'בדיקת שורה תקציבית',
    'בדיקת דוח חודשי',
    'דוח תקציבי וחומר מהלקוח',
    'בדיקת כפילויות',
    'שינויים מהותיים בתזרים',
  ];
  // findings from the Bizibox validation — each maps to the step that found it.
  // send:1 → פעולה ראשית "שלח הודעה" (כמו במצב תפעול); אחרת act ייעודי
  const FIN_FINDINGS=[];
  let finTimers=[], finOpen=[], finPaused=false, FIN_STATE=null;
  /* יציאה באמצע הסיום — הטיימר ממשיך, וחוזרים בדיוק לאותו שלב */
  function finClose(){
    document.getElementById('finView').style.display='none';
    document.getElementById('opsGrid').style.display='';
    finPaused=true;
    FIN_STATE={key:opsActiveKey,step:finCurStep};
    if(typeof renderGlobalRail==='function')renderGlobalRail();
    opsAccum[opsActiveKey]=opsTotal;
    startOpsTimer(); updateOpsBtn();
    toast('הסיום הושהה — לחיצה על "סיום תפעול" תחזיר אתכם לאותו שלב');
  }
  /* מעבר חלק 1 ← חלק 2: רענון נתונים + סריקת כפילויות (תזרים/אשראי/כיוון) */
  const REF_DUPS_DEMO=[
    {kind:'תזרים', why:'תיאור, סכום ותאריך זהים — כנראה הוזן פעמיים',
     a:{d:'21.07.2026', t:'העברה — י.אבידן עבודות גמר', amt:'9,800 ₪-'},
     b:{d:'21.07.2026', t:'העברה — י.אבידן עבודות גמר', amt:'9,800 ₪-'}},
    {kind:'אשראי', why:'אותה פעולה נקלטה גם כהכנסה — טעות בכיוון',
     a:{d:'19.07.2026', t:'חיוב ויזה כ.א.ל', amt:'4,110 ₪-'},
     b:{d:'19.07.2026', t:'חיוב ויזה כ.א.ל', amt:'4,110 ₪+'}},
  ];
  let refDups=[];
  function opsRefreshClick(){
    if(finPaused){finishOps();return;}
    /* הצ'יפ במצב "נכשל" — הרענון החוזר ממשיך את מה שנכשל (שער או ידני) */
    if(_refFailed[opsActiveKey]&&window._refPassed!==opsActiveKey){openRefresh(_refMode);return;}
    openRefresh('manual');
  }
  function finishOps(){
    if(finPaused){opsTotal=(opsAccum[opsActiveKey]||0)+opsSession();stopOpsTimer();finPaused=false;document.getElementById('opsGrid').style.display='none';document.getElementById('finView').style.display='';opsEndBtnMode();return;}
    if(window._refPassed===opsActiveKey){finishOps2();return;}
    openRefresh('gate');
  }
  /* רענון נתוני ה-raw data — זמין תמיד, וגם השער בין חלק 1 לחלק 2 */
  let _refMode='manual';
  /* דמו: הרענון הראשון לכל חברה נכשל (Bizibox לא החזיר נתונים) — הניסיון החוזר מצליח.
     OPS_REF_FAIL=false מבטל. */
  const OPS_REF_FAIL=false;
  const _refFailed={};
  let _refBusy=false;
  function openRefresh(mode){
    /* שתי קריאות מקבילות (דילוג הדמו + סיום אוטומטי) לא פותחות שני רענונים */
    if(_refBusy) return;
    _refBusy=true;
    _refMode=mode||'manual';
    document.getElementById('refOv').classList.add('show');
    document.getElementById('refBody').innerHTML='<div class="ref-spin"><div class="ref-spinner"></div><div>מרענן נתוני raw data מ-Bizibox'+(OPS_REF_DUPS?' · סורק כפילויות בתזרים ובאשראי':'')+'…</div></div>';
    refBarState('busy');
    setTimeout(()=>{
      _refBusy=false;
      if(OPS_REF_FAIL&&!_refFailed[opsActiveKey]&&window._refPassed!==opsActiveKey){
        _refFailed[opsActiveKey]=true; renderRefFail(); return;
      }
      refDups=(OPS_REF_DUPS&&CUR===0&&window._refPassed!==opsActiveKey)?REF_DUPS_DEMO.map(d=>({...d,res:null})):[];
      renderRefDups();
    },1100);
  }
  /* הרענון נכשל — המצב נשאר גם בפס התפעול עד שרענון חוזר מצליח */
  function renderRefFail(){
    refBarState('fail');
    document.getElementById('refBody').innerHTML=`
      <div class="ref-fail">
        <div class="ref-fail-ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg></div>
        <div class="ref-fail-b">
          <div class="ref-fail-t">הרענון נכשל</div>
          <div class="ref-fail-d">Bizibox לא החזיר נתונים. התזרים לא עודכן${_refMode==='gate'?' — אי אפשר לעבור לבדיקות בלי רענון תקין':''}.</div>
        </div>
      </div>
      <div class="ref-fail-acts">
        <button class="ref-retry" onclick="openRefresh(_refMode)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg> רענון חוזר</button>
        <button class="ref-later" onclick="refClose()">${_refMode==='gate'?'חזרה לתפעול':'סגירה'}</button>
      </div>`;
  }
  /* הצ'יפ בפס התפעול משקף את מצב הרענון: רגיל · מרענן · נכשל */
  function refBarState(s){
    const b=document.getElementById('opsFinBtn'); if(!b) return;
    b.classList.remove('busy','fail');
    const ico='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg>';
    if(s==='busy'){ b.classList.add('busy'); b.innerHTML=ico+' מרענן…'; }
    else if(s==='fail'){ b.classList.add('fail'); b.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6A2 2 0 0 0 22 18L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg> הרענון נכשל · רענון חוזר'; }
    else b.innerHTML=ico+' רענון נתונים';
  }
  function refClose(){ document.getElementById('refOv').classList.remove('show'); }
  function renderRefDups(){
    const body=document.getElementById('refBody');
    if(!refDups.length){
      body.innerHTML='<div class="ref-clean">✓ הנתונים עודכנו מ-Bizibox'+(OPS_REF_DUPS?' — לא נמצאו כפילויות':'')+(_refMode==='gate'?' · ממשיכים':'')+'</div>';
      setTimeout(refContinue,800);
      return;
    }
    const open=refDups.filter(d=>!d.res).length;
    body.innerHTML=`<div class="ref-h">נמצאו ${refDups.length} חשדות לכפילות — יש לטפל לפני המעבר לבדיקות</div>`+
      refDups.map((d,i)=>`<div class="ref-dup ${d.res?'res':''}">
        <div class="ref-dup-h"><span class="sh-chip ${d.kind==='תזרים'?'add':'edit'}">כפילות ב${d.kind}</span><span class="ref-why">${d.why}</span>${d.res?`<b class="ref-res">✓ ${d.res}</b>`:''}</div>
        <div class="ref-pair">
          <div class="ref-op"><span>${d.a.d}</span><b>${d.a.t}</b><i dir="ltr">${d.a.amt}</i></div>
          <div class="ref-op"><span>${d.b.d}</span><b>${d.b.t}</b><i dir="ltr">${d.b.amt}</i></div>
        </div>
        ${d.res?'':`<div class="chk-actions" style="margin-top:8px">
          <button class="ot-btn ghost sm" onclick="toast('נפתח ב-Bizibox — למחיקת הכפולה')">פתיחה ב-Bizibox ↗</button>
          <button class="ot-btn ghost sm" onclick="refResolve(${i},'סומן — לא כפילות')">לא כפילות — השארה</button>
          <button class="ot-btn done sm" onclick="refResolve(${i},'נמחק ידנית ב-Bizibox')">טיפלתי ✓</button>
        </div>`}
      </div>`).join('')+
      `<div class="mx2-foot"><button class="mx2-btn primary" ${open?'disabled':''} onclick="refContinue()">${open?'טפלו ב-'+open+' כפילויות כדי להמשיך':(_refMode==='gate'?'המשך לבדיקות (חלק 2) ←':'סיום — הנתונים עודכנו')}</button></div>`;
  }
  function refResolve(i,res){refDups[i].res=res;renderRefDups();toast(res);}
  function refContinue(){
    document.getElementById('refOv').classList.remove('show');
    window._refPassed=opsActiveKey;
    refBarState('ok');
    if(_refMode==='gate') finishOps2();
    else toast('נתוני ה-raw data עודכנו ✓');
  }
  function finishOps2(){
    opsTotal=(opsAccum[opsActiveKey]||0)+opsSession(); stopOpsTimer();
    if(window._stgIx!=null&&window._stgT0){const secs=Math.round((Date.now()-window._stgT0)/1000);
      OPS_STAGE_LOG.push({n:'שלב אחרון',s:secs});window._stgIx=null;}
    document.getElementById('opsGrid').style.display='none';
    document.getElementById('finView').style.display=''; opsEndBtnMode();
    document.getElementById('finFoot').classList.remove('show');
    document.getElementById('finFoot').innerHTML='';
    document.getElementById('finFindings').innerHTML='';
    finOpen=FIN_FINDINGS.map((f,ix)=>ix); // all findings open at start of each run
    const fc=document.getElementById('finChat'); if(fc)fc.innerHTML='';
    document.getElementById('finTitle').textContent=opsDoneSet.has(opsActiveKey)?'מרענן נתונים…':'מסיים תפעול…';
    document.getElementById('finSub').textContent='מרענן נתונים מ-Bizibox ובודק את תקינות התזרים מול התקציב';
    const ico=document.getElementById('finIco'); ico.className='fin-ico'; ico.innerHTML='<div class="spin"></div>';
    document.getElementById('finSteps').innerHTML=FIN_STEPS.map((s,i)=>
      `<div class="fin-step" id="fstep${i}"><span class="fs-num">${i+1}</span><span class="fs-ico"></span><span>${s}</span><span class="fs-tag" id="ftag${i}"></span></div>`).join('');
    finTimers.forEach(clearTimeout); finTimers=[];
    finCurStep=0;
    FIN_EXC=OPS_DEMO_EXC?FIN_EXC_DEF():[];
    if(OPS_SKIP_CHECKS){
      /* דילגנו על הכל — משך פלוסיבילי כדי שהסיכום לא יציג 0:00 */
      if(opsTotal<60) opsTotal=8*60+40;
      finCurStep=FIN_STEPS.length; finOpen=[]; return finAllDone();
    }
    runFinStep(0);
  }
  /* מכונת שלבים: כל שלב רץ, ואם יש ממצאים — עוצרים בו עד שמטפלים, ואז ממשיכים */
  let finCurStep=0;
  function finChatFill(){
    const el=document.getElementById('finChat');
    if(el) el.innerHTML=opsChatSide(curTasks());
  }
  function runFinStep(i){
    finCurStep=i; finChatFill();
    if(i>=FIN_STEPS.length){finAllDone();return;}
    const el=document.getElementById('fstep'+i);
    if(el){el.className='fin-step run';el.querySelector('.fs-ico').innerHTML='<span class="mini-spin"></span>';}
    document.getElementById('finFindings').innerHTML='';
    if(i===0){
      // שורות תקציביות: תצוגה בלבד — בלי שיפוט תקין/לא תקין
      finTimers.push(setTimeout(()=>{
        el.className='fin-step warn';el.querySelector('.fs-ico').innerHTML='👁';
        const ico=document.getElementById('finIco'); ico.className='fin-ico';
        ico.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
        document.getElementById('ftag'+i).textContent=BL_SIMPLE.filter(b=>!b.st).length+' לטיפול';
        document.getElementById('finTitle').textContent='שלב 1: שורה תקציבית';
        document.getElementById('finSub').textContent='תקציב מול ביצוע וצפי — מאשר, או מתאם שיחה עם הלקוח';
        renderBLReview();
      },900));
      return;
    }
    if(i===2){
      // דוח תקציבי: חסרים בתזרימים מול חריגות בתקציב — רק קטגוריות מהותיות
      finTimers.push(setTimeout(()=>{
        const nOver=BR_DATA.filter(x=>x.kind==='over'&&brMatOver(x)).length, nMiss=BR_DATA.filter(x=>x.kind==='miss'&&brMat(x)).length, due=matDue().length;
        el.className='fin-step warn';el.querySelector('.fs-ico').innerHTML='!';
        document.getElementById('ftag'+i).textContent=nOver+' חריגות · '+nMiss+' חסרים · '+due+' חומר';
        document.getElementById('finTitle').textContent='שלב 3: דוח תקציבי וחומר מהלקוח';
        document.getElementById('finSub').textContent='קטגוריות מהותיות · והחומר שעוד לא הגיע — באותו מקום';
        renderBReport();
      },900));
      return;
    }
    if(i===1){
      // דוח חודשי: התאמת בנקים — פתיחה/סגירה מול הרווח הנקי
      finTimers.push(setTimeout(()=>{
        const bad=MREP.filter(m=>Math.abs(m.gap)>MREP_TOL&&!m.ok).length;
        el.className='fin-step '+(bad?'warn':'done');
        el.querySelector('.fs-ico').innerHTML=bad?'!':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
        document.getElementById('ftag'+i).textContent=bad?bad+' פערים':'תקין';
        document.getElementById('finTitle').textContent='שלב 2: בדיקת דוח חודשי';
        document.getElementById('finSub').textContent='רווח נקי מול הפרש יתרות הבנקים · סבילות עד '+MREP_TOL.toLocaleString()+' ₪';
        renderMRep();
      },900));
      return;
    }
    if(i===4){
      // מה השתנה בתחזית היום — כולל בגלל העבודה של המתפעל עצמו
      finTimers.push(setTimeout(()=>{
        const bad=FCH.newOverdraft&&!FCH.ack;
        el.className='fin-step '+(bad?'warn':'done');
        el.querySelector('.fs-ico').innerHTML=bad?'!':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
        document.getElementById('ftag'+i).textContent=bad?'חריגה חדשה':FCH.evs.length+' שינויים';
        document.getElementById('finTitle').textContent='שלב 5: שינויים מהותיים בתזרים';
        document.getElementById('finSub').textContent='מה השתנה בתחזית מאתמול — כולל בעקבות העבודה של היום';
        renderFch();
      },900));
      return;
    }
    if(i===3){
      // כפילויות: אותו גורם בסבירות גבוהה — שם דומה, אותו כיוון, סכום ±100, תאריך עד 3 ימים
      finTimers.push(setTimeout(()=>{
        const open=DUPS.filter(d=>!d.st).length;
        el.className='fin-step '+(open?'warn':'done');
        el.querySelector('.fs-ico').innerHTML=open?'!':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
        document.getElementById('ftag'+i).textContent=open?open+' חשודות':'אין כפילויות';
        document.getElementById('finTitle').textContent='שלב 4: בדיקת כפילויות';
        document.getElementById('finSub').textContent='אותו גורם בסבירות גבוהה — לא רק שם זהה';
        renderDups();
      },900));
      return;
    }
    finTimers.push(setTimeout(()=>{
      const hits=FIN_FINDINGS.filter((f,ix)=>f.step===i&&finOpen.includes(ix)).length;
      if(hits){
        el.className='fin-step warn';el.querySelector('.fs-ico').innerHTML='!';
        document.getElementById('ftag'+i).textContent=hits+' ממצאים';
        const ico=document.getElementById('finIco');
        ico.className='fin-ico warn'; ico.innerHTML='<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>';
        document.getElementById('finTitle').textContent='שלב '+(i+1)+': נמצאו '+hits+' ממצאים';
        document.getElementById('finSub').textContent=FIN_STEPS[i]+' — טפלו בממצאים כדי להמשיך לשלב הבא';
        renderFinFindings();
      }else{
        el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
        finTimers.push(setTimeout(()=>runFinStep(i+1),350));
      }
    },900));
  }
  function finAllDone(){
    document.querySelectorAll('.fin-step').forEach(el=>{
      el.className='fin-step done';
      el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
    });
    const ico=document.getElementById('finIco'); ico.className='fin-ico ok';
    ico.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
    const nx=FIN_EXC.filter(e=>!e.done).length;
    if(nx){
      ico.className='fin-ico warn';
      ico.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>';
      document.getElementById('finTitle').textContent='התפעול הסתיים — '+(nx===1?'חריגה אחת לדיווח ללקוח':nx+' חריגות לדיווח ללקוח');
      document.getElementById('finSub').textContent='כל שלבי הבדיקה עברו · הושלם ב-'+fmtDur(opsTotal)+' · התזרים לא ייצא עד שהחריגות ידווחו';
    }else{
      document.getElementById('finTitle').textContent='התפעול הסתיים ✓';
      document.getElementById('finSub').textContent='כל שלבי העבודה והבדיקה עברו · הושלם ב-'+fmtDur(opsTotal);
    }
    document.getElementById('finFindings').innerHTML=finRecapHtml();
    document.getElementById('finFindings').classList.remove('bl-mode');
    renderFinFoot();
  }
  /* תמונה מלאה בסיום: שלבי העבודה (עם משך) + שלבי הבדיקה (הכל ✓) */
  function finRecapHtml(){
    const workDone=OPS_STAGES.map(st=>{
      const log=OPS_STAGE_LOG.find(l=>l.n===st[1]);
      return `<div class="frec-row"><span class="frec-ic">✓</span><b>${st[1]}</b><i>${log?fmtDur(log.s):'הושלם'}</i></div>`;
    }).join('');
    const checkDone=FIN_STEPS.map(s=>`<div class="frec-row"><span class="frec-ic">✓</span><b>${s}</b><i>נבדק</i></div>`).join('');
    return `<div class="frec-wrap">
      <div class="frec-col"><div class="frec-h">שלבי העבודה</div>${workDone}</div>
      <div class="frec-col"><div class="frec-h">שלבי הבדיקה</div>${checkDone}</div>
    </div>`;
  }
  /* כל השורות התקציביות — גם התקינות מוצגות תמיד בשלב הבדיקה */
  /* מצב לפני התפעול מול אחרי — השורות נבנות ב-Bizibox רק מהמסך הזה, באישור */
  const BL_OK=[
    {cat:'הכנסות ממכירות',      target:200000, before:{actual:152400, future:20000}, after:{actual:172400, future:40000}},
    {cat:'קניות מלאי',           target:80000,  before:{actual:14000,  future:5000},  after:{actual:26000,  future:5000}},
    {cat:'ספקים',                target:45000,  before:{actual:38200,  future:3000},  after:{actual:38200,  future:3000}},
    {cat:'שכר עבודה',            target:60000,  before:{actual:55000,  future:0},     after:{actual:55000,  future:0}},
    {cat:'שכירות ותפעול משרד',  target:12000,  before:{actual:12000,  future:0},     after:{actual:12000,  future:0}},
  ];
  const blRest=(b,st)=>b.target-st.actual-st.future;
  const blChanged=b=>blRest(b,b.before)!==blRest(b,b.after);
  function blStatsHtml(b,first){
    const covered=b.actual+b.future, rest=b.target-covered;   // צבוע = מה שהוזן קדימה; היתרה = יעד − בפועל − צבוע
    const pct=b.target?Math.min(100,Math.round(covered/b.target*100)):100;
    const fmt=n=>n.toLocaleString();
    return `<div class="fb-stats">
      <div class="fb-s"><span>יעד חודשי</span><b>${b.target?fmt(b.target):'—'}</b></div>
      <div class="fb-s"><span>בפועל</span><b>${fmt(b.actual)}</b></div>
      <div class="fb-s"><span>צבוע</span><b>${b.future?fmt(b.future):'—'}</b></div>
      <div class="fb-s ${rest<0?'neg':''}"><span>יתרה בשורה</span><b>${b.target?fmt(rest):'אין שורה'}</b></div>
      ${first!==undefined?`<div class="fb-s first"><span>המופע הקרוב</span><b>${first?first.d.slice(0,5):'—'}</b><i>${first?fmt(first.amt)+' ₪':'אין מופעים'}</i></div>`:''}
    </div>`;
  }
  /* ציר הזמן של החודש — נקודות במקומות שבהם יש מופעים */
  function blTimelineHtml(b,inst){
    const day=d=>parseInt(d.slice(0,2),10);
    const dots=inst.map(x=>`<span class="bl-tl-dot" style="inset-inline-start:${Math.round(day(x.d)/31*100)}%" title="${x.d} · ${x.amt.toLocaleString()} ₪"><i>${day(x.d)}</i></span>`).join('');
    return `<div class="bl-tl">
      <span class="bl-tl-m">יולי</span>
      <span class="bl-tl-axis"></span>
      <span class="bl-tl-elapsed" style="width:87%"></span>
      <span class="bl-tl-today" style="inset-inline-start:87%" title="היום · 27.07"></span>
      ${dots}
    </div>`;
  }
  /* הגדרות פר שורה תקציבית */
  const BL_CFG={};
  function blOpenAdd(){
    window._blCfgMode='add';
    document.getElementById('blCfgDropBtn').style.display='none';
    const used=BL_OK.map(b=>b.cat);
    const cats=(typeof BL_CATS!=='undefined'?BL_CATS:['הכנסות אחרות','שכר קבלני משנה','ביטוחים','מיסים ואגרות','רכב ודלק','שיווק ופרסום']).filter(c=>!used.includes(c));
    document.getElementById('blCfgTitle').textContent='שורה תקציבית חדשה';
    document.getElementById('blCfgCatRow').style.display='';
    document.getElementById('blCfgCat').innerHTML='<option value="">בחירת קטגוריה…</option>'+cats.map(c=>`<option>${c}</option>`).join('');
    document.getElementById('blCfgTarget').value='';
    document.getElementById('blCfgFreq').value='3';
    document.getElementById('blCfgName').value='תקציב: {קטגוריה} · {חודש}';
    document.getElementById('blCfgEx').checked=false;
    document.getElementById('blCfgOv').classList.add('show');
  }
  function blOpenCfg(cat){
    window._blCfgMode='edit';
    document.getElementById('blCfgDropBtn').style.display='';
    document.getElementById('blCfgCatRow').style.display='none';
    const c=blCfgOf(cat);
    document.getElementById('blCfgTitle').textContent='הגדרות שורה תקציבית — '+cat;
    document.getElementById('blCfgTarget').value=c.target;
    document.getElementById('blCfgFreq').value=c.freq;
    document.getElementById('blCfgName').value=c.name;
    document.getElementById('blCfgEx').checked=c.excluded;
    window._blCfgCat=cat;
    document.getElementById('blCfgOv').classList.add('show');
  }
  function blCfgClose(){document.getElementById('blCfgOv').classList.remove('show');}
  function blCfgDrop(){
    const cat=window._blCfgCat;
    hkConfirm('מחיקת שורה תקציבית','למחוק את השורה התקציבית של "'+cat+'"? הצפי החודשי של הקטגוריה יוצג לפי הצבוע בלבד.','מחיקה',()=>{
      const ix=BL_OK.findIndex(b=>b.cat===cat);
      if(ix>=0) BL_OK.splice(ix,1);

      (BL_CFG[cat]||(BL_CFG[cat]={})).excluded=true;
      blCfgClose();
      if(finCurStep===0) renderBLReview();
      toast('השורה התקציבית של "'+cat+'" נמחקה');
    });
  }
  function blCfgSave(){
    if(window._blCfgMode==='add'){
      const cat=document.getElementById('blCfgCat').value;
      const target=+document.getElementById('blCfgTarget').value||0;
      if(!cat){toast('צריך לבחור קטגוריה');return;}
      if(!target){toast('צריך יעד חודשי');return;}
      BL_OK.push({cat, target, actual:0, future:0, monthPct:87});
      BL_CFG[cat]={target, freq:document.getElementById('blCfgFreq').value, name:document.getElementById('blCfgName').value, excluded:false};
      blCfgClose();
      if(finCurStep===0) renderBLReview();
      toast('נפתחה שורה תקציבית ל"'+cat+'" — '+target.toLocaleString()+' ₪');
      return;
    }
    const c=BL_CFG[window._blCfgCat];
    c.target=document.getElementById('blCfgTarget').value;
    c.freq=document.getElementById('blCfgFreq').value;
    c.name=document.getElementById('blCfgName').value;
    c.excluded=document.getElementById('blCfgEx').checked;
    blCfgClose();
    toast('הגדרות השורה "'+window._blCfgCat+'" נשמרו');
  }
  /* המופעים של השורה בתזרים — הפריסה של היתרה על יתרת החודש */
  const BL_INST={};
  /* מנוע הפריסה: כל X ימים / פעם בשבוע ביום קבוע / תאריכים מוגדרים מראש */
  function blCfgOf(cat){ return BL_CFG[cat]||(BL_CFG[cat]={mode:'every', x:3, wday:0, dates:[1,10,20], name:'תקציב: '+cat+' · {חודש}'}); }
  function blGen(b,total,from,to,monthIx,monthName){
    const c=blCfgOf(b.cat);
    let days=[];
    if(c.mode==='weekly'){
      for(let d=from;d<=to;d++) if(new Date(2026,monthIx,d).getDay()===+c.wday) days.push(d);
    }else if(c.mode==='dates'){
      days=(c.dates||[]).filter(d=>d>=from&&d<=to);
    }else{
      for(let d=from;d<=to;d+=Math.max(1,+c.x||3)) days.push(d);
    }
    if(!days.length) return [];
    const per=Math.round(total/days.length/100)*100;
    return days.map((d,i)=>({
      d:String(d).padStart(2,'0')+'.'+String(monthIx+1).padStart(2,'0')+'.2026',
      amt:i===days.length-1?total-per*(days.length-1):per,
      name:'תקציב: '+b.cat+' · '+monthName
    }));
  }
  function blInstOf(b){
    if(BL_INST[b.cat]) return BL_INST[b.cat];
    const rest=blRest(b,b.after);
    const inst=rest>0?blGen(b,rest,28,31,6,'יולי'):[];
    return (BL_INST[b.cat]=inst);
  }
  function blNextMonth(b){
    if(BL_INST['next_'+b.cat]) return BL_INST['next_'+b.cat];
    return (BL_INST['next_'+b.cat]=blGen(b,b.target,1,31,7,'אוגוסט'));
  }
  function blSetLive(cat,k,v){
    const b=BL_OK.find(x=>x.cat===cat); if(!b) return;
    const c=blCfgOf(cat);
    if(k==='target'){const n=parseInt(String(v).replace(/\D/g,''),10)||b.target;b.target=n;}
    else if(k==='dates'){c.dates=String(v).split(/[,\s]+/).map(Number).filter(d=>d>=1&&d<=31).sort((a,b2)=>a-b2);}
    else c[k]=v;
    delete BL_INST[cat]; delete BL_INST['next_'+cat];
    renderBLReview();
    blInstOpenPop(cat);
  }
  function blInstOpenPop(cat){
    const b=BL_OK.find(x=>x.cat===cat); if(!b) return;
    _blPopCat=cat;
    const inst=blInstOf(b);
    document.getElementById('blInstTitle').textContent='ניהול השורה התקציבית — '+cat;
    const cfg=BL_CFG[cat]||{freq:'3',name:'תקציב: '+cat+' · {חודש}'};
    const nxt=blNextMonth(b);
    const mon=window._blMonSel||'cur';
    const cur=mon==='cur';
    const list=cur?inst:nxt, key=cur?cat:'next_'+cat;
    const row=(x,i)=>`<div class="bl-inst-r">
        <span class="bl-inst-d">${x.d}</span>
        <input class="mx2-inp bl-inst-name" value="${x.name}" onchange="blInstName('${key}',${i},this.value)" title="שם המופע — כפי שיופיע בתזרים">
        <input class="mx2-inp bl-inst-amt" value="${x.amt.toLocaleString()}" dir="ltr" onchange="blInstEdit('${key}',${i},this.value)">
        <span class="bl-inst-sub">₪</span>
      </div>`;
    document.getElementById('blInstBody').innerHTML=
      `<div class="bl-set-strip">
        <label>יעד חודשי (₪)<input class="mx2-inp" value="${b.target.toLocaleString()}" dir="ltr" onchange="blSetLive('${cat}','target',this.value)"></label>
        <label>פריסה<select class="mx2-inp" onchange="blSetLive('${cat}','mode',this.value)">
          <option value="every" ${cfg.mode==='every'?'selected':''}>כל X ימים</option>
          <option value="weekly" ${cfg.mode==='weekly'?'selected':''}>פעם בשבוע</option>
          <option value="dates" ${cfg.mode==='dates'?'selected':''}>תאריכים קבועים</option>
        </select></label>
        ${cfg.mode==='weekly'?`<label>באיזה יום<select class="mx2-inp" onchange="blSetLive('${cat}','wday',this.value)">
            ${['ראשון','שני','שלישי','רביעי','חמישי','שישי'].map((n,i)=>`<option value="${i}" ${+cfg.wday===i?'selected':''}>יום ${n}</option>`).join('')}
          </select></label>`
        :cfg.mode==='dates'?`<label>בתאריכים (בחודש)<input class="mx2-inp" value="${(cfg.dates||[]).join(', ')}" dir="ltr" placeholder="1, 10, 20" onchange="blSetLive('${cat}','dates',this.value)"></label>`
        :`<label>כל כמה ימים<input class="mx2-inp" type="number" min="1" max="15" value="${cfg.x||3}" onchange="blSetLive('${cat}','x',this.value)"></label>`}
        <label>שם השורה<input class="mx2-inp" value="${cfg.name}" onchange="blSetLive('${cat}','name',this.value)"></label>
      </div>
      <div class="bl-mon-seg">
        <span class="bl-mon-tab ${cur?'on':''}" onclick="window._blMonSel='cur';blInstOpenPop('${cat}')">יולי 2026</span>
        <span class="bl-mon-tab ${cur?'':'on'}" onclick="window._blMonSel='next';blInstOpenPop('${cat}')">אוגוסט 2026</span>
      </div>
      <div class="bl-mon-meta">יעד חודשי <b>${b.target.toLocaleString()} ₪</b> · ${list.length} מופעים</div>`+
      (list.length?list.map(row).join(''):'<div class="bl-inst-none">אין מופעים — השורה מוצתה (הצבוע כיסה את היעד)</div>');
    document.getElementById('blInstOv').classList.add('show');
  }
  function blInstClose(){document.getElementById('blInstOv').classList.remove('show');}
  let _blPopCat=null;
  function blCfgDropFromPop(){ if(_blPopCat){window._blCfgCat=_blPopCat; blCfgDrop();} }
  function blInstName(cat,i,val){
    BL_INST[cat][i].name=val.trim()||BL_INST[cat][i].name;
    toast('שם המופע עודכן');
  }
  function blInstEdit(cat,i,val){
    const n=parseInt(String(val).replace(/\D/g,''),10)||0;
    BL_INST[cat][i].amt=n;
    toast('המופע עודכן — '+n.toLocaleString()+' ₪');
  }
  /* ===== סיווג פערים — אותם ארבעה סוגים כמו במסך מעקב ופערים =====
     חסר בדוח התקציבי הוא פער לכל דבר, רק על קטגוריה שאין לה עדיין שורה תקציבית
     (היעד נגזר מההיסטוריה). אותה שאלה בדיוק: מי חייב לי פעולה? */
  /* הפער = יעד − בפועל − צבוע: כל מה שמאמינים בו כבר צבוע, ולכן "טרם הגיע
     הזמן" אינו סיבה. היעד לא מתוקן באמצע חודש — הפער מודד כמה דייקנו בבנייה. */
  const GAP_TYPES={
    wait:    {lbl:'מחכה לחומר מהלקוח', chip:'מחכה לחומר',      note:false,
              hint:'הידיעה קיימת אצל הלקוח — אי אפשר לצבוע עד שהחומר יגיע',
              act:'תזכורת הבוט בקבוצה · מטופל יום-יום'},
    changed: {lbl:'המציאות השתנתה',     chip:'המציאות השתנתה',  note:true,
              hint:'התוכנית הייתה נכונה כשנבנתה — העולם זז',
              act:'לפגישה עם היועץ ולזיכרון — היעד לא מתוקן'},
    shifted: {lbl:'התזמון זז',           chip:'התזמון זז',      note:true,
              hint:'הסכום יגיע — בחודש אחר ממה שתכננו. הפריסה טעתה, לא הסה״כ',
              act:'נרשם ללמידה על הפריסה — היעד לא מתוקן'},
    built:   {lbl:'טעינו בבנייה',        chip:'טעינו בבנייה',   note:false,
              hint:'ברירת המחדל כשאין הסבר אחר — ההערכה מהבנייה לא פגשה את המציאות',
              act:'נרשם ללמידה — מתוקן רק בבנייה הבאה'}
  };
  const gapTh=()=>{ try{ return Object.assign({floor:1000,pct:5,ceil:25000}, JSON.parse(localStorage.getItem('hkGapTh')||'null')||{}); }catch(e){ return {floor:1000,pct:5,ceil:25000}; } };
  function brGapOf(x){ return x.typical-x.actual-(x.future||0); }
  /* חריגה: אותו כלל בדיוק, על גודל החריגה מול התקציב */
  function brOverOf(x){ return x.actual-x.budget; }
  function brMatOver(x){
    const o=brOverOf(x), T=gapTh();
    if(o<=0) return false;
    if(o<T.floor) return false;
    if(o>=T.ceil) return true;
    return x.budget>0 && (o/x.budget*100)>=T.pct;
  }
  function brMat(x){
    const g=brGapOf(x), T=gapTh();
    if(g<=0) return false;
    if(g<T.floor) return false;
    if(g>=T.ceil) return true;
    return x.typical>0 && (g/x.typical*100)>=T.pct;
  }
  /* פערים בדוח התקציבי שעדיין ללא סוג — נספרים לאותו גייט של התקציב */
  function brUntyped(){
    return BR_DATA.filter(x=>(x.kind==='miss'&&!BL_OK.some(b=>b.cat===x.cat)&&brMat(x)&&!x.gt)
                        ||(x.kind==='over'&&brMatOver(x)&&!x.gt));
  }
  /* ===== דוח תקציבי: חסרים בתזרימים / חריגות בתקציב — מהותיים בלבד ===== */
  const BR_DATA=[
    {kind:'miss', cat:'ביטוחים',        typical:24000, actual:8000,  future:0,
     hist:[['08.06',8200],['15.06',7900],['28.06',7700]], tx:[['10.07',8000]]},
    {kind:'miss', cat:'מיסים ואגרות',   typical:42000, actual:14000, future:10000,
     hist:[['15.06',21000],['30.06',20500]], tx:[['15.07',14000],['30.07',10000,'צבוע']]},
    {kind:'over', cat:'שיווק ופרסום',   budget:15000,  actual:22400, fore:0,
      tx:[{d:'03.07',t:'קמפיין גוגל — יולי',a:'6,200'},{d:'09.07',t:'פייסבוק אדס',a:'5,400'},{d:'15.07',t:'הדפסות ושילוט',a:'4,300'},{d:'22.07',t:'משרד יח"צ — ריטיינר',a:'6,500'}]},
    {kind:'over', cat:'רכב ודלק',       budget:8000,   actual:11300, fore:0,
      tx:[{d:'05.07',t:'דלק — פזומט',a:'3,900'},{d:'12.07',t:'טיפול 30,000 למסחרית',a:'4,200'},{d:'20.07',t:'דלק — פזומט',a:'3,200'}]},
    {kind:'over', cat:'שכר עבודה',      budget:60000,  actual:62100, fore:0,
      tx:[{d:'01.07',t:'משכורות יוני',a:'62,100'}]},
  ];
  function renderBReport(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const fmt=n=>n.toLocaleString();
    const notLine=x=>!BL_OK.some(b=>b.cat===x.cat);
    const missAll=BR_DATA.filter(x=>x.kind==='miss'&&notLine(x)&&brMat(x));
    const missSub=BR_DATA.filter(x=>x.kind==='miss'&&notLine(x)&&!brMat(x)&&brGapOf(x)>0);
    const overAll=BR_DATA.filter(x=>x.kind==='over'&&brMatOver(x));
    const overSub=BR_DATA.filter(x=>x.kind==='over'&&!brMatOver(x)&&brOverOf(x)>0);
    const T=gapTh();
    const missRows=missAll.map(x=>{
      const gap=brGapOf(x), mat=brMat(x), G=x.gt?GAP_TYPES[x.gt]:null;
      const stat=(l,v,cls)=>`<div class="fb-s ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
      /* הפעולה נגזרת מהסוג — לא כפתורים חופשיים לצד המספר */
      const acts = !mat
        ? `<span class="br-sub">מתחת לסף המהותיות — לא דורש הגדרה</span>`
        : G
          ? `<button class="gt-chip2 gt-${x.gt}" onclick="brGtOpen('${x.cat}')">${G.chip} <i>✎</i></button>`
            + (x.gt==='wait'?`<button class="ot-btn ghost sm" onclick="brMsg('${x.cat}','miss')">תזכורת בקבוצה</button>`:'')

            + (x.gn?`<div class="br-gnote">${x.gn}</div>`:'')
          : `<button class="gt-chip2 gt-set2" onclick="brGtOpen('${x.cat}')">+ הגדרת הפער</button>`;
      /* אותה שפה כמו מסך הפערים: פס מוערם + חודש שעבר מול החודש */
      const bar=`<div class="blx wide" style="margin:2px 0 6px">
          <span class="blx-track">
            <i class="sg act" style="width:${(x.actual/x.typical*100).toFixed(1)}%"></i>
            ${x.future?`<i class="sg flow" style="width:${(x.future/x.typical*100).toFixed(1)}%"></i>`:''}
          </span>
          <div class="blx-nums">
            <span class="na">בפועל <b>${fmt(x.actual)}</b></span>
            ${x.future?`<span class="nf">בתזרים <b>${fmt(x.future)}</b></span>`:''}
            <span class="nr">פער <b>${fmt(gap)}</b></span>
            <span style="margin-inline-start:auto">יעד (לפי היסטוריה) <b>${fmt(x.typical)}</b></span>
          </div>
        </div>`;
      const rows2=Math.max((x.hist||[]).length,(x.tx||[]).length);
      let cmp='';
      for(let r=0;r<rows2;r++){const l=(x.hist||[])[r],c=(x.tx||[])[r];
        cmp+=`<div class="blc-r">
          <span class="c1">${l?`<i>${l[0]}</i><b>${fmt(l[1])}</b>`:''}</span>
          <span class="c2 ${c&&c[2]?'plan':''}">${c?`<i>${c[0]}</i><b>${fmt(c[1])}</b>${c[2]?`<em>${c[2]}</em>`:''}`:''}</span>
        </div>`;}
      const sumH=(x.hist||[]).reduce((s,y)=>s+y[1],0), sumT=(x.tx||[]).reduce((s,y)=>s+y[1],0);
      const table=`<div class="blc" style="margin-bottom:8px">
        <div class="blc-h"><span class="c1">חודש שעבר · יוני</span><span class="c2">החודש · יולי</span></div>
        ${cmp}
        <div class="blc-r sum"><span class="c1"><i>סה״כ</i><b>${fmt(sumH)}</b></span><span class="c2"><i>סה״כ</i><b>${fmt(sumT)}</b></span></div>
      </div>`;
      return `<div class="br-row${mat&&!x.gt?' need':''}">
        <div class="br-h"><b>${x.cat}</b></div>
        ${bar}${table}
        <div class="br-acts">${acts}</div>
      </div>`;}).join('');
    const overRows=overAll.map(x=>{
      const pct=Math.round(x.actual/x.budget*100);
      return `<div class="br-row${x.gt?'':' need'}">
        <div class="br-h"><b>${x.cat}</b><span class="br-nums">בפועל ${fmt(x.actual)} · תקציב ${fmt(x.budget)}</span></div>
        <div class="br-bar over" onclick="brTx('${x.cat}')" title="לחיצה — התנועות של הקטגוריה">
          <i class="red" style="width:100%"></i><em style="inset-inline-start:${Math.round(x.budget/x.actual*100)}%" title="גבול התקציב"></em>
        </div>
        <div class="br-acts">
          <span class="br-pct neg">${pct}% מהתקציב</span>
          ${x.gt?`<button class="gt-chip2 gt-${x.gt}" onclick="brGtOpen('${x.cat}')">${GAP_TYPES[x.gt].chip} <i>✎</i></button>`
               :`<button class="gt-chip2 gt-set2" onclick="brGtOpen('${x.cat}')">+ הגדרת הפער</button>`}
          <button class="ot-btn ghost sm" onclick="brTx('${x.cat}')">תנועות</button>
          <button class="ot-btn ghost sm" onclick="brBudget('${x.cat}')">שינוי תקציב</button>
          <button class="ot-btn sm" onclick="brMsg('${x.cat}','over')">שליחת הודעה ללקוח</button>
        </div>
      </div>`;}).join('');
    box.innerHTML=`<div class="bl-top">
        <span>דוח תקציבי — <b>המהותיות נקבעת מהסף</b>, לא ידנית
          <span class="br-rule">רצפה ${gapTh().floor.toLocaleString()} ₪ · ${gapTh().pct}% · תקרה ${gapTh().ceil.toLocaleString()} ₪
          <button class="chk-ruleslink" style="border:none;background:none;cursor:pointer" onclick="showTab('coset')">⚙ שינוי בהגדרות החברה</button></span></span>
        <button class="ot-btn done" onclick="brGo()">הבדיקה הושלמה — סיום</button>
      </div>
      <div class="cu-split" style="border:none">
        <div><div class="pay-grp">🔵 חסרים בתזרימים <em>${missAll.length}</em></div>
          <div class="catm-sub" style="margin:2px 4px 8px">קטגוריה עם שורה תקציבית לא מופיעה כאן — הפער שלה כבר מנוהל בשלב 1.</div>
          ${missRows||'<div class="ops-empty" style="padding:14px">אין חסרים מעל הסף</div>'}
          ${missSub.length?`<div class="br-sub-foot">${missSub.length} מתחת לסף · <b>${fmt(missSub.reduce((s,x)=>s+brGapOf(x),0))} ₪</b>
            <span>${missSub.map(x=>x.cat).join(' · ')}</span></div>`:''}
          ${matHtml()}</div>
        <div><div class="pay-grp">🔴 חריגות בתקציב <em>${overAll.length}</em></div>${overRows||'<div class="ops-empty" style="padding:14px">אין חריגות מעל הסף</div>'}
          ${overSub.length?`<div class="br-sub-foot">${overSub.length} מתחת לסף · <b>${fmt(overSub.reduce((s,x)=>s+brOverOf(x),0))} ₪</b>
            <span>${overSub.map(x=>x.cat).join(' · ')}</span></div>`:''}</div>
      </div>`;
  }
  function brOpenLine(cat){
    const x=BR_DATA.find(v=>v.cat===cat&&v.kind==='miss'); if(!x) return;
    if(BL_OK.some(b=>b.cat===cat)) return;
    BL_OK.push({cat, target:x.typical,
      before:{actual:x.actual, future:x.future}, after:{actual:x.actual, future:x.future}});
    renderBReport();
    toast('נפתחה שורה תקציבית ל"'+cat+'" — מעכשיו מנוהלת בשלב 1, ולא תופיע כאן שוב');
  }
  /* ===== גייט סיווג הפערים =====
     שלב ההזנות לעולם לא חוסם ("המתפעל מזין מה שיש"). שלב הבדיקה כן:
     פער מהותי בלי סוג = תמונה לא מובנת, ואי אפשר לסגור עליה תפעול.
     המצב מגיע מ-budget-flow.html דרך postMessage; ברירת המחדל = מצב הדמו ההתחלתי. */
  const gapGate=()=>window.HK_GAPGATE||{n:4,sum:29517,month:'יוני 2026'};
  function gapGateGo(){
    document.getElementById('finView').style.display='none';
    document.getElementById('opsGrid').style.display='';
    finPaused=true; FIN_STATE={key:opsActiveKey,step:finCurStep};
    opsAccum[opsActiveKey]=opsTotal; startOpsTimer(); updateOpsBtn();
    if(typeof showTab==='function') showTab('budget');
    toast('הגדירו את הפערים במעקב ופערים — ואז "סיום תפעול" יחזיר אתכם לשלב הבדיקה');
  }
  function brGo(){
    const due=matDue();
    if(due.length){ toast(due.length+' פריטי חומר עוד ללא התייחסות היום'); return; }
    const bu=brUntyped();
    if(bu.length){
      toast('נותרו '+bu.length+' חסרים ללא הגדרה');
      const el=document.querySelector('.br-row.need'); if(el) el.scrollIntoView({block:'center',behavior:'smooth'});
      return;
    }
    const el=document.getElementById('fstep2');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag2').textContent='נבדק ✓';
    runFinStep(3);
  }
  /* ===== שלב 4 — כפילויות =====
     המפתח: "אותו גורם בסבירות גבוהה" — שם מנורמל (בלי בע"מ, ניקוד, מקפים,
     רווחים, סדר מילים), אותו כיוון, סכום זהה עד ±100 ₪.
     אותו תאריך ⇒ חשד גבוה. עד 3 ימים ⇒ לבדיקה. */
  const DUPS=[
    {lvl:'high', why:'שם דומה · סכום זהה · אותו תאריך',
     a:{n:'לדובק הפצה בע״מ', d:'28.07', amt:1381, dir:'exp', src:'הזנה ידנית'},
     b:{n:'לדובק הפצה',       d:'28.07', amt:1381, dir:'exp', src:'Bizibox'}},
    {lvl:'high', why:'שם דומה (סדר מילים) · סכום זהה · אותו תאריך',
     a:{n:'א. ובניו בע״מ',    d:'25.07', amt:4800, dir:'exp', src:'Bizibox'},
     b:{n:'ובניו א׳',          d:'25.07', amt:4800, dir:'exp', src:'הזנה ידנית'}},
    {lvl:'maybe', why:'שם דומה · הפרש 60 ₪ · הפרש יומיים',
     a:{n:'א.מ קירור ומיזוג',      d:'15.07', amt:3660, dir:'exp', src:'Bizibox'},
     b:{n:'אמ קירור-מיזוג בע"מ',   d:'17.07', amt:3720, dir:'exp', src:'הזנה ידנית'}},
    {lvl:'maybe', why:'שם דומה · סכום זהה · הפרש יומיים',
     a:{n:'מרכז הבנייה',          d:'12.07', amt:18600, dir:'inc', src:'צפי'},
     b:{n:'מרכז הבניה בע"מ',      d:'14.07', amt:18600, dir:'inc', src:'Bizibox'}},
  ];
  function renderDups(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const fmt=n=>n.toLocaleString();
    const open=DUPS.filter(d=>!d.st).length;
    const tx=(x,drop)=>`<div class="dup-tx ${drop?'drop':''}">
        <b>${x.n}</b><span class="num">${x.d}</span>
        <span class="num ${x.dir==='inc'?'inc':''}">${fmt(x.amt)} ₪${x.dir==='inc'?'+':'-'}</span>
        <i>${x.src}</i>${drop?'<em>תימחק</em>':''}</div>`;
    box.innerHTML=`<div class="bl-top">
        <span>כפילויות — <b>אותו גורם בסבירות גבוהה</b>: שם דומה (בלי בע״מ, מקפים, סדר מילים) · אותו כיוון · סכום עד ±100 ₪ · תאריך עד 3 ימים</span>
        <button class="ot-btn done" ${open?'disabled':''} onclick="dupGo()">${open?'נותרו '+open+' חשודות':'הבדיקה הושלמה — סיום'}</button>
      </div>`+
      DUPS.map((d,i)=>`<div class="ffind bl-line simple ${d.st?'ba-ok':(d.lvl==='high'?'ba-ch':'')}">
        <div class="bls-head">
          <div class="bl-c-name"><b>${d.a.n}</b>
            ${d.st?`<span class="bl-okchip">✓ ${d.st}</span>`
                 :`<span class="${d.lvl==='high'?'ba-chip':'dup-maybe'}">${d.lvl==='high'?'חשד גבוה — אותו תאריך':'כפילות אפשרית'}</span>`}
          </div>
          <span class="dup-why">${d.why}</span>
          <div class="ffind-act">
            ${d.st?`<button class="ot-btn ghost sm" onclick="DUPS[${i}].st=null;renderDups()">ביטול</button>`
                 :`<button class="ot-btn done sm" onclick="dupDel(${i})">מחיקת הכפולה</button>
                   <button class="ot-btn ghost sm" onclick="dupKeep(${i})">לא כפילות</button>`}
          </div>
        </div>
        <div class="dup-pair">${tx(d.a)}${tx(d.b,!d.st)}</div>
      </div>`).join('');
  }
  function dupDel(i){ DUPS[i].st='הכפולה נמחקה'; toast('נמחקה: '+DUPS[i].b.n+' · '+DUPS[i].b.d); renderDups(); }
  function dupKeep(i){ DUPS[i].st='לא כפילות — שתי תנועות אמיתיות'; renderDups(); }
  function dupGo(){
    if(DUPS.some(d=>!d.st)) return;
    const el=document.getElementById('fstep3');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag3').textContent='נבדק ✓';
    runFinStep(4);
  }
  /* תנועות הקטגוריה — שינוי קטגוריה פר תנועה בתוך הפופאפ */
  function brTx(cat){
    const x=BR_DATA.find(v=>v.cat===cat); if(!x||!x.tx) return;
    document.getElementById('btxTitle').textContent='התנועות של "'+cat+'" — יולי · '+x.actual.toLocaleString()+' ₪';
    document.getElementById('btxBody').innerHTML=x.tx.map((t,i)=>`<div class="btx-r">
        <span class="btx-d">${t.d}</span>
        <span class="btx-t">${t.t}</span>
        <b class="btx-a">${t.a} ₪</b>
        <select class="mx2-inp btx-sel" onchange="toast('התנועה סווגה מחדש ל: '+this.value+' — תוסר מהקטגוריה')">
          <option>${cat}</option>${COMPANY_CATS.filter(c=>c!==cat).map(c=>`<option>${c}</option>`).join('')}
        </select>
      </div>`).join('')+
      '<div class="catm-sub" style="margin-top:8px">שינוי קטגוריה לתנועה מעדכן את הדוח — ככה מזהים טעויות סיווג שיצרו חריגה מדומה.</div>';
    document.getElementById('btxOv').classList.add('show');
  }
  function btxClose(){document.getElementById('btxOv').classList.remove('show');}
  /* הודעת טמפלייט ללקוח */
  function brMsg(cat,kind){
    const x=BR_DATA.find(v=>v.cat===cat); if(!x) return;
    const c=CLIENTS[CUR], contact=(c.thread&&[...c.thread].reverse().find(m=>m.from==='user')||{}).name||'הלקוח';
    const fmt=n=>n.toLocaleString();
    smOpenTpl(kind==='over'?'budgetOver':'budgetMiss',
      {name:contact, cat, actual:fmt(x.actual||0), budget:fmt(x.budget||0)},
      'קבוצת '+c.name+' · וואטסאפ', null);
  }
  /* שינוי תקציב */
  function brBudget(cat){
    const x=BR_DATA.find(v=>v.cat===cat); if(!x) return;
    BRTGT=cat;
    document.getElementById('brTgtTitle').textContent='תקציב חדש — '+cat;
    document.getElementById('brTgtSub').textContent='תקציב נוכחי '+x.budget.toLocaleString()+' ₪ · בפועל '+x.actual.toLocaleString()+' ₪';
    document.getElementById('brTgtInp').value=x.budget;
    document.getElementById('brTgtOv').classList.add('show');
  }
  /* ===== בורר סוג הפער בדוח התקציבי ===== */
  let BRGT=null;
  function brGtOpen(cat){
    const x=BR_DATA.find(v=>v.cat===cat); if(!x) return;
    BRGT={cat, k:x.gt||'built', n:x.gn||''};
    document.getElementById('brGtTitle').textContent=cat;
    document.getElementById('brGtSub').textContent=x.kind==='over'
    ?'הגדרת הפער · חריגה של '+brOverOf(x).toLocaleString()+' ₪ מעל תקציב '+x.budget.toLocaleString()+' ₪'
    :'הגדרת הפער · חסר '+brGapOf(x).toLocaleString()+' ₪ מתוך יעד '+x.typical.toLocaleString()+' ₪ (לפי היסטוריה)';
    brGtRender();
    document.getElementById('brGtOv').classList.add('show');
  }
  function brGtClose(){ document.getElementById('brGtOv').classList.remove('show'); BRGT=null; }
  function brGtPick(k){ BRGT.k=k; brGtRender(); }
  function brGtNote(v){ BRGT.n=v; const b=document.getElementById('brGtSaveBtn'); if(b) b.disabled=!brGtValid(); }
  function brGtValid(){ return BRGT&&BRGT.k&&(!GAP_TYPES[BRGT.k].note||BRGT.n.trim().length>2); }
  function brGtRender(){
    document.getElementById('brGtBody').innerHTML=
      Object.keys(GAP_TYPES).map(k=>{const G=GAP_TYPES[k];
        return `<div class="gt-opt2 ${BRGT.k===k?'on':''}" onclick="brGtPick('${k}')">
          <span class="rd"></span><span><b>${G.lbl}</b><small>${G.hint}</small>
          <span class="act-h">← ${G.act}</span></span></div>`;}).join('')
      + (BRGT.k&&GAP_TYPES[BRGT.k].note
         ? `<div class="gt-req2">הסבר בשורה אחת <i>· חובה</i></div>
            <textarea class="mx2-inp gt-txt2" oninput="brGtNote(this.value)" placeholder="${BRGT.k==='unlikely'?'למה זה לא יקרה החודש?':'למה היעד ההיסטורי לא מתאים?'}">${BRGT.n||''}</textarea>` : '');
    document.getElementById('brGtFoot').innerHTML=
      `<button class="mx2-btn" onclick="brGtClose()">ביטול</button>
       <button class="mx2-btn primary" id="brGtSaveBtn" ${brGtValid()?'':'disabled'} onclick="brGtSave()">שמירת הסיווג</button>`;
  }
  function brGtSave(){
    if(!brGtValid()) return;
    const x=BR_DATA.find(v=>v.cat===BRGT.cat); if(!x) return;
    x.gt=BRGT.k; x.gn=BRGT.n||'';
    toast('הפער סווג — '+GAP_TYPES[BRGT.k].lbl);
    brGtClose(); renderBReport();
  }
  /* עדכון תקציב — UI פנימי במקום prompt של הדפדפן */
  let BRTGT=null;
  function brTgtClose(){ document.getElementById('brTgtOv').classList.remove('show'); BRTGT=null; }
  function brTgtSave(){
    const x=BR_DATA.find(v=>v.cat===BRTGT); if(!x) return brTgtClose();
    const n=parseInt(String(document.getElementById('brTgtInp').value).replace(/\D/g,''),10);
    if(n){ x.budget=n; renderBReport(); toast('התקציב של "'+x.cat+'" עודכן ל-'+n.toLocaleString()+' ₪'); }
    brTgtClose();
  }

  /* ===== שלב 4: חומר מהלקוח — סגירת יום =====
     כל החברות מתופעלות כל יום, ולכן המונים כאן אמינים: "6 ימים · 4 תזכורות"
     הוא נתון ולא ארטיפקט של ימים שדולגו.
     הרשימה **נגזרת** מהפערים שסווגו "מחכה לחומר" (תקציב + דוח תקציבי) — לא מומצאת.
     ימי החומר פר חברה הם מה שמונע שהשלב יהפוך לחותמת גומי: פריט שטרם הגיע
     יום החומר שלו — שקט, לא דורש כלום. */
  const MAT_TODAY=12;                     // יום בחודש (דמו)
  const matDays=()=>{ try{ return JSON.parse(localStorage.getItem('hkMatDays')||'null')||[1,15]; }catch(e){ return [1,15]; } };
  /* יום החומר האחרון שעבר, וכמה ימים חלפו ממנו */
  function matLate(){ const d=matDays().filter(x=>x<=MAT_TODAY); return d.length?MAT_TODAY-Math.max(...d):null; }
  const MAT_ITEMS=[
    {cat:'קניות מלאי', src:'תקציב', amt:25000, days:6, pings:4, ans:0,
     hist:['11.08 · הוזכר בקבוצה — אין מענה','10.08 · הוזכר בקבוצה — אין מענה','08.08 · הוזכר — "אשלח מחר"','06.08 · בקשה ראשונה']},
    {cat:'הכנסות ממכירות - סליקה', src:'תקציב', amt:4010, days:3, pings:2, ans:1,
     hist:['11.08 · הוזכר — "רואה החשבון מכין"','09.08 · בקשה ראשונה']},
    {cat:'ביטוחים', src:'דוח תקציבי', amt:16000, days:1, pings:1, ans:0,
     hist:['11.08 · בקשה ראשונה']},
  ];
  /* פריטים שעברו את יום החומר — רק הם דורשים התייחסות היום */
  const matDue=()=>MAT_ITEMS.filter(m=>!m.st&&matLate()!=null);
  let MAT_OPEN=null;
  function matRender(){ renderMat(); }
  function renderMat(){ renderBReport2(); }
  function matHtml(){
    const late=matLate(), days=matDays().join(' · ');
    const done=MAT_ITEMS.filter(m=>m.st).length, due=matDue().length;
    const row=(m,ix)=>{
      const hot=m.pings>=3&&m.ans===0;
      const st=m.st;
      const badge=`<span class="mat-badge ${hot?'hot':''}">מחכה ${m.days} ימים · ${m.pings} תזכורות · ${m.ans?'ענה '+m.ans+'×':'לא ענה'}</span>`;
      const doneTag=st
        ? `<div class="mat-done">${st.icon} <b>${st.lbl}</b>${st.txt?' — '+st.txt:''}
             <button class="mat-undo" onclick="matUndo(${ix})">ביטול</button></div>`
        : `<div class="mat-acts">
             <button class="ot-btn done sm" onclick="matSet(${ix},'ping')">הזכרתי · אין מענה</button>
             <button class="ot-btn ghost sm" onclick="matOpen(${ix},'info')">יש מידע</button>
             <button class="ot-btn ghost sm" onclick="matOpen(${ix},'defer')">דחייה לתאריך</button>
           </div>`;
      const form=MAT_OPEN&&MAT_OPEN.ix===ix
        ? (MAT_OPEN.mode==='info'
          ? `<div class="mat-form"><input class="mx2-inp" id="matInp" placeholder="מה הלקוח אמר? למשל: אמר שישלח ביום ראשון">
               <button class="ot-btn done sm" onclick="matSave(${ix})">שמירה</button>
               <button class="ot-btn ghost sm" onclick="matCancel()">ביטול</button></div>`
          : `<div class="mat-form"><span class="mat-lbl">לנסות שוב ב־</span>
               <select class="mx2-inp" id="matInp" style="width:auto">${[15,18,20,25,28,1].map(d=>`<option value="${d}">${d} בחודש</option>`).join('')}</select>
               <button class="ot-btn done sm" onclick="matSave(${ix})">שמירה</button>
               <button class="ot-btn ghost sm" onclick="matCancel()">ביטול</button></div>`)
        : '';
      return `<div class="mat-row${st?' ok':(hot?' hot':'')}">
        <div class="mat-h"><b>${m.cat}</b><span class="mat-amt">${m.amt.toLocaleString()} ₪</span>
          <span class="gt-chip2 gt-wait" title="פער שהוגדר — הידיעה אצל הלקוח, נרדף עד שהחומר מגיע">פער מנוהל · מחכה לחומר</span>
          <span class="mat-src">${m.src}</span></div>
        ${badge}
        ${hot&&!st?`<div class="mat-esc">4 תזכורות בלי מענה אחד — כדאי להתקשר במקום להודיע, או להעלות ליועץ
          <button class="ot-btn ghost xs" onclick="matEsc(${ix})">העלאה ליועץ</button></div>`:''}
        ${doneTag}${form}
        <details class="mat-hist"><summary>היסטוריית הרדיפה</summary>${m.hist.map(h=>`<div>${h}</div>`).join('')}</details>
      </div>`;};
    return `<div class="pay-grp" style="margin-top:18px">🟠 חומר מהלקוח — פערים שהוגדרו "מחכה לחומר" <em>${matDue().length}</em>
        <span class="br-rule">ימי החומר: <b>${days}</b> בחודש
        <button class="chk-ruleslink" style="border:none;background:none;cursor:pointer" onclick="showTab('coset')">⚙ שינוי</button></span></div>
      ${late==null
        ? `<div class="mat-quiet">✓ יום החומר הבא עוד לא הגיע — אין מה לרדוף היום. הפריטים הפתוחים ממתינים בשקט.</div>`
        : `<div class="mat-note">עברו <b>${late} ימים</b> מיום החומר האחרון. ${due?`<b>${due}</b> פריטים עוד לא קיבלו התייחסות היום.`:'כל הפריטים קיבלו התייחסות היום ✓'}</div>`}
      <div class="mat-list">${MAT_ITEMS.map(row).join('')}</div>`;
  }
  function renderBReport2(){ renderBReport(); }
  function matOpen(ix,mode){ MAT_OPEN={ix,mode}; renderMat(); setTimeout(()=>{const e=document.getElementById('matInp'); if(e)e.focus();},0); }
  function matCancel(){ MAT_OPEN=null; renderMat(); }
  function matSet(ix,kind){
    const m=MAT_ITEMS[ix];
    m.pings++; m.st={icon:'↻',lbl:'הוזכר היום · אין מענה',txt:''};
    m.hist.unshift(MAT_TODAY+'.08 · הוזכר בקבוצה — אין מענה');
    MAT_OPEN=null; renderMat(); toast('נרשם — נשלחה תזכורת בקבוצה');
  }
  function matSave(ix){
    const el=document.getElementById('matInp'); if(!el) return;
    const v=(el.value||'').trim(); if(!v) return;
    const m=MAT_ITEMS[ix];
    if(MAT_OPEN.mode==='info'){ m.ans++; m.st={icon:'💬',lbl:'הלקוח מסר',txt:v}; m.hist.unshift(MAT_TODAY+'.08 · '+v); }
    else { m.st={icon:'⏰',lbl:'נדחה — לנסות ב-'+v+' בחודש',txt:''}; m.hist.unshift(MAT_TODAY+'.08 · נדחה ל-'+v+' בחודש'); }
    MAT_OPEN=null; renderMat(); toast('נרשם');
  }
  function matUndo(ix){ const m=MAT_ITEMS[ix]; if(m.st&&m.st.icon==='↻')m.pings--; m.st=null; renderMat(); }
  function matEsc(ix){ toast('"'+MAT_ITEMS[ix].cat+'" הועלה ליועץ — יופיע אצלו כחיכוך מול הלקוח'); }


  /* ===== שלב 5: שינויים מהותיים בתזרים =====
     נשען על לוג השינויים (docs/FLOW_CHANGE_LOG_SPEC.md): הדלתא היא עקומה,
     ולכן מציגים נקודה — התאריך שהכי הורע — ואת האירועים שמשפיעים עליו.
     השלב **מדווח**; הוא חוסם רק כשנוצרה חריגה שלא הייתה אתמול, כי זה
     הדבר היחיד כאן שדורש החלטה ולא רק ידיעה. */
  const FCH={
    date:'24.08', delta:-32400, was:12150, now:-20250,
    newOverdraft:true, ack:null,
    evs:[
      {t:'תאריך זז', d:-19800, txt:'תקבול מרכז הבנייה זז מ-12.08 ל-22.08', sub:'הכסף לא נעלם — הוא מאחר, ויוצר בור עד 22.08', me:false},
      {t:'הזנה חדשה', d:-7500, txt:'תשלום פלטס-גל (25.08)', sub:'אושר על ידך היום בשלב ההזנות', me:true},
      {t:'בפועל≠צפי', d:-5100, txt:'חיוב ויזה בפועל גבוה מהצפי (08.08)', sub:'4,110 ← 9,210', me:false},
    ]};
  function renderFch(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const mine=FCH.evs.filter(e=>e.me).length;
    box.innerHTML=`<div class="bl-top">
        <span>מה השתנה בתחזית מאתמול · הנקודה שהכי הורעה: <b>${FCH.date}</b>
          <button class="chk-ruleslink" style="border:none;background:none;cursor:pointer" onclick="showTab('flowlog')">הלוג המלא ←</button></span>
        <button class="ot-btn done" onclick="fchGo()">הבדיקה הושלמה — סיום</button>
      </div>
      <div class="fch-hd ${FCH.newOverdraft?'bad':''}">
        <div class="fch-amt">${FCH.delta.toLocaleString()} ₪</div>
        <div class="fch-was">${FCH.was.toLocaleString()} <span>←</span> <b>${FCH.now.toLocaleString()}</b>
          <small>היתרה הצפויה ל-${FCH.date}</small></div>
        ${FCH.newOverdraft?`<div class="fch-flag">נכנסת לחריגה בתאריך הזה — אתמול לא היית</div>`:''}
      </div>
      ${FCH.newOverdraft?(FCH.ack
        ? `<div class="fch-ack ok">✓ ${FCH.ack} <button class="mat-undo" onclick="FCH.ack=null;renderFch()">ביטול</button></div>`
        : `<div class="fch-ack">
             <span>חריגה חדשה מחייבת החלטה — לא מספיק לדעת עליה:</span>
             <button class="ot-btn done sm" onclick="fchAck('הועבר כסף מפועלים 112 — החריגה נסגרה')">העברה בין חשבונות</button>
             <button class="ot-btn ghost sm" onclick="fchAck('נשלחה התראה ללקוח וליועץ')">התראה ללקוח וליועץ</button>
             <button class="ot-btn ghost sm" onclick="fchAck('נבדק — התקבול צפוי להיכנס לפני התאריך')">נבדק · לא נדרשת פעולה</button>
           </div>`):''}
      ${mine?`<div class="fch-mine">${mine} מהשינויים נובעים מהעבודה שלך היום</div>`:''}
      <div class="fch-list">${FCH.evs.map(e=>`
        <div class="fch-r">
          <span class="fch-d">${e.d>0?'+':''}${e.d.toLocaleString()}</span>
          <span class="fch-t"><b>${e.txt}</b><small>${e.sub}</small></span>
          <span class="fch-tag${e.me?' me':''}">${e.me?'העבודה שלך':e.t}</span>
        </div>`).join('')}</div>`;
  }
  function fchAck(txt){ FCH.ack=txt; renderFch(); toast('נרשם — ' + txt); }
  function fchGo(){
    if(FCH.newOverdraft&&!FCH.ack){ toast('החריגה החדשה עוד ללא החלטה'); return; }
    const el=document.getElementById('fstep4');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag4').textContent='נבדק ✓';
    runFinStep(5);
  }

  /* דוח חודשי: רווח נקי צריך להתאים ל(סגירה − פתיחה) של הבנקים */
  const MREP_TOL=300;
  const MREP=[
    {m:'יוני 2026 — הדוח שנשלח', open:184300, close:209450,
     rep:{rev:212400, gross:61300, oper:31900, net:24970}},
    {m:'יולי 2026 — עד היום', open:209450, close:187200,
     rep:{rev:168900, gross:44100, oper:-9800, net:-17530}},
  ];
  MREP.forEach(m=>{m.diff=m.close-m.open; m.gap=m.rep.net-m.diff;});
  function renderMRep(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const fmt=n=>n.toLocaleString();
    const pending=MREP.filter(m=>Math.abs(m.gap)>MREP_TOL&&!m.ok).length;
    box.innerHTML=`<div class="bl-top">
        <span>התאמת הדוח ליתרות הבנקים — החודש הנוכחי וחודש שעבר</span>
        <button class="ot-btn done" ${pending?'disabled':''} onclick="mrepGo()">${pending?'טפלו ב-'+pending+' פערים כדי להמשיך':'הבדיקה הושלמה — המשך'}</button>
      </div>`+
      MREP.map((m,i)=>{
        const bad=Math.abs(m.gap)>MREP_TOL;
        const stat=(l,v,cls)=>`<div class="fb-s ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
        return `<div class="ffind bl-line ledger ${bad?(m.ok?'ba-ok':'ba-ch'):''}">
          <div class="bl-c-name"><b>${m.m}</b>
            ${bad?(m.ok?'<span class="bl-okchip">✓ טופל</span>':`<span class="ba-chip">פער ${fmt(Math.abs(m.gap))} ₪ — מעל הסבילות</span>`)
                 :`<span class="ba-same">✓ מתאים${m.gap?' · פער '+fmt(Math.abs(m.gap))+' ₪ בסבילות':''}</span>`}
            <i>הכנסות ${fmt(m.rep.rev)} · גולמי ${fmt(m.rep.gross)} · תפעולי ${fmt(m.rep.oper)}</i>
          </div>
          <div class="fb-stats ledger">
            ${stat('יתרת פתיחה',fmt(m.open))}
            ${stat('יתרת סגירה',fmt(m.close))}
            ${stat('הפרש',fmt(m.diff),m.diff<0?'neg':'')}
            ${stat('רווח נקי (מהדוח)',fmt(m.rep.net),m.rep.net<0?'neg':'')}
            ${stat('פער',fmt(Math.abs(m.gap)),bad?'neg':'')}
          </div>
          <span></span>
          <div class="ffind-act">
            ${bad&&!m.ok?`<button class="ot-btn ghost sm" onclick="toast('נפתח ב-Bizibox — התאמת בנקים')">פתיחה ב-Bizibox ↗</button>
            <button class="ot-btn done sm" onclick="MREP[${i}].ok=true;renderMRep();toast('הפער טופל')">טופל ✓</button>`:''}
          </div>
        </div>`;}).join('');
  }
  function mrepGo(){
    const el=document.getElementById('fstep1');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag1').textContent='נבדק ✓';
    runFinStep(2);
  }
  /* ===== שלב 1 — שורה תקציבית, פשוט =====
     קטגוריה שהוגדרה למעקב ונפתחה לטיפול מציגה חמישה מספרים:
     תקציב · ביצוע · נותר · צפי סוף חודש · חריגה צפויה.
     שתי פעולות בלבד: מאשר | מתאם שיחה עם הלקוח. אין הודעה ללקוח מכאן. */
  /* השפה של מסך הפערים: יעד · בפועל · בתזרים · שורה תקציבית · נותר.
     היעד חוסם — בפועל + בתזרים + שורה תקציבית ≤ יעד, נותר ≥ 0 תמיד.
     inst = שורות הדמה של השורה התקציבית (המופעים על הציר). */
  /* hist = מה קרה בפועל ביוני (חודש אחד אחורה) · pace = כמה מהיעד נכנס עד היום־בחודש, שעבר מול החודש */
  /* done = מה שקרה בפועל ביולי · inst = מה שמתוכנן בהמשך החודש */
  const BL_SIMPLE=[
    {cat:'הכנסות ממכירות',      budget:200000, actual:172400, flow:20000, done:[['05.07',52000],['15.07',68000],['24.07',52400]],
     inst:[['28.07',3000],['29.07',2600],['31.07',2000]], hist:[['12.06',48000],['25.06',96000],['30.06',51000]], pacePrev:74, paceNow:86},
    {cat:'קניות מלאי',           budget:80000,  actual:31000,  flow:18000, done:[['08.07',14000],['20.07',17000]],
     inst:[['28.07',12000],['31.07',8000]], hist:[['05.06',22000],['18.06',31000],['28.06',24000]], pacePrev:69, paceNow:61},
    {cat:'שכר עבודה',            budget:60000,  actual:55000,  flow:0,     done:[['01.07',55000]],
     inst:[['31.07',5000]], hist:[['01.06',58000]], pacePrev:100, paceNow:92},
    {cat:'ספקים',                budget:45000,  actual:38200,  flow:3000,  done:[['06.07',12000],['16.07',14000],['25.07',12200]],
     inst:[['29.07',1800],['31.07',2000]], hist:[['10.06',14000],['20.06',15500],['30.06',13000]], pacePrev:66, paceNow:92},
    {cat:'שכירות ותפעול משרד',  budget:12000,  actual:12000,  flow:0,     done:[['01.07',12000]], inst:[], hist:[['01.06',12000]], pacePrev:100, paceNow:100},
  ];
  /* טבלה: חודש שעבר מול החודש — הפעולות זו מול זו. המתוכנן לחיץ לעריכה. */
  function blSimpleTl(b,i){
    const fmt=n=>n.toLocaleString();
    const nextDay=b.inst.length?Math.min(...b.inst.map(x=>+x[0].slice(0,2))):null;
    const rows=Math.max((b.hist||[]).length,(b.done||[]).length+b.inst.length);
    const june=(b.hist||[]), july=(b.done||[]).map(x=>({d:x[0],a:x[1],k:'done'}))
      .concat(b.inst.map((x,j)=>({d:x[0],a:x[1],k:+x[0].slice(0,2)===nextDay?'next':'plan',j})));
    let body='';
    for(let r=0;r<rows;r++){
      const l=june[r], x=july[r];
      body+=`<div class="blc-r">
        <span class="c1">${l?`<i>${l[0]}</i><b>${fmt(l[1])}</b>`:''}</span>
        <span class="c2 ${x?x.k:''}">
          ${x?`<i>${x.d}</i><b>${fmt(x.a)}</b>${x.k==='done'?'':`<em>${x.k==='next'?'הקרוב · מתוכנן':'מתוכנן'}</em>`}`:''}</span>
      </div>`;
    }
    const sumJ=june.reduce((s,x)=>s+x[1],0), sumL=july.reduce((s,x)=>s+x.a,0);
    const slow=b.paceNow<b.pacePrev-5;
    return `<div class="blc">
      <div class="blc-h"><span class="c1">חודש שעבר · יוני</span><span class="c2">החודש · יולי</span></div>
      ${body}
      <div class="blc-r sum"><span class="c1"><i>סה״כ</i><b>${fmt(sumJ)}</b></span><span class="c2"><i>סה״כ</i><b>${fmt(sumL)}</b></span></div>
      <div class="bl-pace ${slow?'slow':''}">${slow?'⚠ ':''}עד היום־בחודש: שעבר <b>${b.pacePrev}%</b> מהיעד · החודש <b>${b.paceNow}%</b></div>
    </div>`;
  }
  function renderBLReview(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const fmt=n=>n.toLocaleString();
    const open=BL_SIMPLE.filter(b=>!b.st).length;
    box.innerHTML=`<div class="bl-top">
        <span><b>${BL_SIMPLE.length} שורות תקציביות</b> · ${open?open+' לטיפול':'כולן טופלו ✓'} — קטגוריות שהוגדרו למעקב</span>
        <button class="ot-btn done" ${open?'disabled':''} onclick="blReviewGo()">${open?'נותרו '+open+' שורות':'המשך לשלב הבא'}</button>
      </div>`+
      BL_SIMPLE.map((b,i)=>{
        const bl=b.inst.reduce((s,x)=>s+x[1],0);
        const remain=b.budget-b.actual-b.flow-bl;   /* היעד חוסם — לא יורד מתחת ל-0 */
        const full=remain===0;
        const stat=(l,v,cls)=>`<div class="fb-s ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
        return `<div class="ffind bl-line simple ${b.st?'ba-ok':(full?'':'ba-ch')}">
        <div class="bls-head">
          <div class="bl-c-name"><b>${b.cat}</b>
            ${b.st?`<span class="bl-okchip">✓ ${b.st}</span>`:(full?`<span class="ba-same">✓ הפער סגור</span>`:`<span class="ba-chip">פער חשוף — ${fmt(remain)} ₪</span>`)}
          </div>
          <span class="bls-tgt">יעד <b>${fmt(b.budget)}</b></span>
          <div class="ffind-act">
            ${b.st?`<button class="ot-btn ghost sm" onclick="blUndo(${i})">ביטול</button>`
                 :`<button class="ot-btn done sm" onclick="blOk(${i})">מאשר</button>
                   <button class="ot-btn ghost sm" onclick="blCall(${i})">מתאם שיחה עם הלקוח</button>`}
          </div>
        </div>
        <div class="blx wide">
          <span class="blx-track">
            <i class="sg act" style="width:${(b.actual/b.budget*100).toFixed(1)}%"></i>
            <i class="sg flow" style="width:${(b.flow/b.budget*100).toFixed(1)}%"></i>
            ${bl?`<i class="sg blrow" style="width:${(bl/b.budget*100).toFixed(1)}%"></i>`:''}
          </span>
          <div class="blx-nums">
            <span class="na">בפועל <b>${fmt(b.actual)}</b></span>
            ${b.flow?`<span class="nf">בתזרים <b>${fmt(b.flow)}</b></span>`:''}
            ${bl?`<span class="nb">שורה תקציבית <b>${fmt(bl)}</b></span>`:''}
            ${remain?`<span class="nr">פער <b>${fmt(remain)}</b></span>`:''}
          </div>
        </div>
        ${blSimpleTl(b,i)}
      </div>`;}).join('');
  }
  function blOk(i){ BL_SIMPLE[i].st='אושר'; toast('"'+BL_SIMPLE[i].cat+'" אושרה — השורה ממשיכה להתנהל'); renderBLReview(); }
  function blCall(i){ BL_SIMPLE[i].st='שיחה תואמה'; toast('נשלח לינק תיאום שיחה ללקוח — '+BL_SIMPLE[i].cat); renderBLReview(); }
  function blUndo(i){ BL_SIMPLE[i].st=null; renderBLReview(); }
    function blReviewGo(){
    const el=document.getElementById('fstep0');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag0').textContent='נסקר ✓';
    runFinStep(1);
  }
  function renderFinFindings(){
    const box=document.getElementById('finFindings');
    box.classList.remove('bl-mode');
    box.innerHTML=finOpen.filter(ix=>FIN_FINDINGS[ix].step===finCurStep).map(ix=>{const f=FIN_FINDINGS[ix];
      // same buttons as ops mode per task kind
      let btns;
      if(f.ai) btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'קוטלג בקטגוריה אחרת')">החלפת קטגוריה</button>
          <button class="ot-btn done" onclick="finResolve(${ix},'אושר — קוטלג ב${f.rec}')">אישור ההמלצה</button>`;
      else if(f.send) btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'לא רלוונטי')">לא רלוונטי</button>
          <button class="ot-btn" onclick="finResolve(${ix},'נשלחה הודעה ללקוח בוואטסאפ')">שליחת הודעה</button>`;
      else btns=`<button class="ot-btn ghost" onclick="finResolve(${ix},'לא רלוונטי')">לא רלוונטי</button>
          <button class="ot-btn done" onclick="finResolve(${ix},'${f.act}')">${f.act}</button>`;
      const blHtml=f.bl?blStatsHtml(f.bl):'';
      const cfgBtn=f.cat?`<button class="ot-btn ghost sm" onclick="blOpenCfg('${f.cat}')" title="הגדרות השורה">⚙ הגדרות</button>`:'';
      return `<div class="ffind ${f.sev}">
        <div class="ffind-b"><div class="ffind-t">${f.t}</div>${blHtml}${f.bl?'':`<div class="ffind-d">${f.d}</div>`}</div>
        <div class="ffind-act">${cfgBtn}${btns}</div>
      </div>`;}).join('');

    renderFinFoot();
  }
  function finResolve(ix,action){
    finOpen=finOpen.filter(x=>x!==ix);
    if(action==='לא רלוונטי') toastUndo('הממצא סומן כלא רלוונטי',()=>{finOpen.push(ix);finOpen.sort();renderFinFindings();});
    else toast(action+' ✓');
    const stillHere=finOpen.some(x=>FIN_FINDINGS[x].step===finCurStep);
    if(!stillHere&&finCurStep<FIN_STEPS.length){
      const el=document.getElementById('fstep'+finCurStep);
      if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';document.getElementById('ftag'+finCurStep).textContent='טופל';}
      renderFinFindings();
      setTimeout(()=>runFinStep(finCurStep+1),400);
      return;
    }
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
    const open=FIN_EXC.filter(e=>!e.done);
    const excHtml=FIN_EXC.length?`<div class="fexc">
      <div class="fexc-h ${open.length?'bad':'ok'}">${open.length
        ?`⚠ ${open.length===1?'חריגה אחת לדיווח ללקוח':open.length+' חריגות לדיווח ללקוח'}`
        :'✓ כל החריגות דווחו — התזרים מוכן לשליחה'}</div>
      ${FIN_EXC.map(e=>`<div class="fexc-r ${EXC_WHEN[e.when].cls} ${e.fix?'hasfix':'nofix'} ${e.done?'done':''}">
        <span class="fx-when">${EXC_WHEN[e.when].lbl}</span>
        <div class="fx-b"><div class="fx-t">${e.t}</div><div class="fx-s">${e.s}</div>
          <div class="fx-fix">${e.fix?'<b>פתרון:</b> '+e.fix:'<i>אין פתרון בחשבונות — דורש החלטה</i>'}</div></div>
        ${e.done
          ?`<span class="fx-ok ${e.ign?'ign':''}">${e.ign?'○ לא דווח':'✓ נשלחה הודעה'}</span>`
          :`<span class="fx-acts">
              <button class="fx-msg" onclick="finExcMsg('${e.k}')" title="שליחת הודעה ללקוח בוואטסאפ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg>
                הודעה ללקוח</button>
              <button class="fx-ign" onclick="finExcIgn('${e.k}')">התעלם</button>
            </span>`}
      </div>`).join('')}
    </div>`:'';
    foot.innerHTML=`<div class="fin-2col"><div class="fin-c-exc">`+excHtml+`</div><div class="fin-c-send">`+`
      ${open.length?`<div class="fin-block">⚠ ${open.length===1?'חריגה אחת טרם דווחה':open.length+' חריגות טרם דווחו'} — התזרים לא ייצא ללקוח</div>`:`<div class="fin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> ${FIN_EXC.length?'החריגות דווחו — התזרים מוכן לשליחה':'אין חריגות — התזרים מוכן לשליחה'}</div>`}
      <button class="fin-wa" onclick="finSendCF()"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.14-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg> שליחת תזרים ללקוח</button>`.replace('<button class="fin-wa"', open.length?'<button class="fin-wa" disabled title="יש חריגה שטרם דווחה ללקוח"':'<button class="fin-wa"')+`
      <button class="chip-btn" style="width:100%;justify-content:center" onclick="finishDone()">שמירה ללא שליחה</button>
      </div></div>`;
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
        <div class="fstat"><div class="fs-n">${FIN_STEPS.length}</div><div class="fs-l">שלבי בדיקה עברו</div></div>
        ${OPS_STAGE_LOG.length?`<div class="fstages">${OPS_STAGE_LOG.map(l=>`<span>${l.n} · <b>${fmtDur(l.s)}</b></span>`).join('')}</div>`:''}
      </div>`;
    document.getElementById('finFoot').innerHTML='<button class="chip-btn primary" style="width:100%;justify-content:center" onclick="finishDone()">חזרה לדשבורד</button>';
    document.getElementById('finFoot').classList.add('show');
  }
  function finishDone(){finPaused=false;FIN_STATE=null;
    opsDur[opsActiveKey]=opsTotal;opsDoneSet.add(opsActiveKey);delete opsAccum[opsActiveKey];
    document.getElementById('finView').style.display='none';document.getElementById('opsGrid').style.display='';opsEndBtnMode();
    restoreDash();
    if(location.hash==='#ops') history.back();
    // למה לחזור? — ישר ללקוח הבא לפי סדר התור
    const next=CLIENTS.map((c,i)=>i)
      .filter(i=>!opsDoneSet.has('c'+i)&&pendOf(i)>0)
      .sort((a,b)=>opsqRank(a)-opsqRank(b))[0];
    if(next!=null){selectClient(next);toast('התפעול הושלם ✓ עוברים ללקוח הבא: '+CLIENTS[next].name);}
    else{selectPortfolio();toast('התפעול הושלם ✓ התור נקי — כל הכבוד');}
  }

  /* ops console data + render */
  const OPS_TYPES={
    msg:       {label:'הודעות מלקוח', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>'},
    doc:       {label:'מסמכים', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>'},
    ai:        {label:'קיטלוג AI', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg>'},
    carry:     {label:'נגררות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>'},
    payee:{label:'שיק להזנה', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 14h6M16 14h2"/></svg>'},
    unexpected:{label:'לא צפויות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>'},
    overdraft: {label:'חריגות', icon:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l6 6 4-4 8 8M21 17v-4h-4"/></svg>'},
  };
  let OPS_FILTER='all', OPS_VIEW='open', OPS_DONE=14;
  function seedOps(){
    CLIENTS[0].tasks=[
      {type:'msg', who:'תומר לוי', thread:['האם עדכנת את כל התשלומים?'], time:'לפני 12 דק׳',
        ctx:['[יועץ] נדבר על זה בפגישה החודשית','[תומר] סבבה. ובנתיים —','[תומר] האם עדכנת את כל התשלומים?']},
      {type:'msg', who:'תומר לוי', thread:['מה הצפי סה"כ בשלוש החשבונות?'], time:'לפני 11 דק׳',
        ctx:['[תומר] האם עדכנת את כל התשלומים?','[תומר] מה הצפי סה"כ בשלוש החשבונות?']},
      {type:'msg', who:'תומר לוי', time:'לפני 9 דק׳', reply:true,
        orig:'מה עם ההעברה לאלקטרה מיזוג — יצאה?', ours:'תומר, ההעברה לאלקטרה מיזוג לא מופיעה בבנק. יצאה? מאיזה חשבון?',
        thread:['יצאה אתמול מפועלים, 3,660. אשלח אישור'],
        ctx:['[תומר] מה עם ההעברה לאלקטרה מיזוג — יצאה?','[מנהל תזרים] תומר, ההעברה לאלקטרה מיזוג לא מופיעה בבנק. יצאה? מאיזה חשבון?','[תומר] יצאה אתמול מפועלים, 3,660. אשלח אישור']},
      {type:'doc', name:'אישור העברה — דיסקונט · 1,381 ₪', who:'צחי עובד', note:'העברתי עכשיו ללדובק, מצרף אישור 🙏', time:'לפני 10 דק׳', src:'הודעת לקוח',
        ctx:['[מנהל תזרים] צחי, חסר לי אישור על ההעברה ללדובק','[צחי] שניה עליי','[צחי] העברתי עכשיו ללדובק, מצרף אישור 🙏 + קובץ'], img:'m3.jpeg',
        file:{payee:'לדובק הפצה בע״מ', amount:'1,381', date:'28.07.2026', ref:'745851', desc:'העברה בנקאית — תשלום לספק'}},
      {type:'doc', name:'צילום שיק — הבינלאומי · 6,300 ₪', who:'צחי עובד', note:'', time:'לפני 25 דק׳', src:'הודעת לקוח', img:'m2.jpeg',
        ctx:['[צחי] מצרף את השיק שנתתי היום לבינלאומי','[צחי] + תמונה','[מנהל תזרים] קיבלתי, מזין'],
        file:{payee:'', amount:'6,300', date:'10.09.2026', ref:'3816543', desc:'שיק ידני'}},
      {type:'doc', name:'ספח שיק בכתב יד · 2,964 ₪', who:'צחי עובד', note:'רשמתי שיק ידני, מצרף את הספח', time:'לפני 40 דק׳', src:'הודעת לקוח', img:'m1.jpeg',
        ctx:['[מנהל תזרים] צחי, יש שיק שיצא היום ולא ראיתי אותו בתזרים','[צחי] רשמתי שיק ידני, מצרף את הספח','[צחי] + תמונה'],
        file:{payee:'', amount:'2,964', date:'31.08.2026', ref:'21036', desc:''}},
      {type:'doc', name:'אקסל קופה קטנה — 3 שורות', who:'תומר לוי', note:'מצרף ריכוז הוצאות קופה קטנה של יולי', time:'לפני שעה', src:'הודעת לקוח',
        ctx:['[תומר] מצרף ריכוז הוצאות קופה קטנה של יולי','[תומר] + קובץ אקסל','[מנהל תזרים] מעולה, מזין את השורות'],
        file:{payee:'קופה קטנה', rows:[
          {date:'07.07.2026', ref:'', desc:'חניה ודלק', amount:'214'},
          {date:'15.07.2026', ref:'', desc:'כיבוד לפגישות', amount:'182'},
          {date:'22.07.2026', ref:'', desc:'שליחויות', amount:'96'}]}},
      {type:'ai', op:'חיוב ויזה כ.א.ל · 4,110 ₪-', cur:'חיובים באשראי', rec:'הוצאות אשראי', reason:'חיוב אשראי חודשי.', basis:'history',
       hist:'12 חיובים חודשיים זהים מכ.א.ל — כולם בהוצאות אשראי', goog:'לא נדרש חיפוש', aiDec:'דפוס חודשי מובהק — הוצאות אשראי (ביטחון 98%)', src:'HISTORY', time:'לפני 52 דק׳'},
      {type:'ai', op:'החזר הלוואה — לאומי · 6,500 ₪-', cur:'כללי', payType:'הלוואות', rec:'הלוואות', reason:'החזר חודשי קבוע.', basis:'history',
       hist:'6 החזרים קודמים באותו סכום ב-10 לחודש — כולם בהלוואות', goog:'לא נדרש חיפוש', aiDec:'החזר חודשי קבוע ללאומי — הלוואות (ביטחון 97%)', src:'HISTORY', time:'לפני 51 דק׳'},
      {type:'ai', op:'רכש חומרי גלם — "פלסט-גל" · 12,400 ₪-', cur:'כללי', rec:'קניות מלאי', reason:'ספק מוכר של חומרי גלם; כל העסקאות הקודמות ממנו קוטלגו כקניות מלאי.', basis:'history',
       hist:'9 עסקאות קודמות מפלסט-גל — כולן קניות מלאי', goog:'פלסט-גל — יצרן אריזות וחומרי גלם פלסטיים', aiDec:'ספק חוזר עם היסטוריה חד-משמעית — קניות מלאי', src:'HISTORY', time:'לפני 50 דק׳'},
      {type:'ai', op:'הזמנת אריזות — "קרטון פלוס" · 3,180 ₪-', cur:'כללי', rec:'קניות מלאי', reason:'רכישת אריזות שוטפת לפי דפוס חודשי קבוע.', basis:'history',
       hist:'הזמנה חודשית קבועה — 5 מופעים בקניות מלאי', goog:'לא נדרש חיפוש', aiDec:'דפוס רכש חודשי — קניות מלאי', src:'HISTORY', time:'לפני 48 דק׳'},
      {type:'ai', op:'יבוא רכיבים — "אלקטרו סחר" · 7,950 ₪-', cur:'כללי', rec:'קניות מלאי', reason:'ספק רכיבים ליבוא; זוהה לפי שם המוטב והיקף העסקה.', basis:'google',
       hist:'לא נמצאו פעולות קודמות מהמוטב', goog:'אלקטרו סחר בע״מ — יבואן רכיבים אלקטרוניים, ת״א', aiDec:'מוטב חדש; לפי החיפוש מדובר בספק רכיבים — קניות מלאי (ביטחון 88%)', src:'HISTORY, SEARCH', time:'לפני 45 דק׳'},
      {type:'ai', op:'השלמת מלאי חירום · 1,260 ₪-', cur:'בנקאיות', rec:'קניות מלאי', reason:'רכישה נקודתית מספק משני — תואמת דפוסי קניות מלאי.', src:'SEARCH', time:'לפני 44 דק׳'},
      {type:'ai', op:'תקבול לקוח — "מרכז הבנייה" · 18,600 ₪+', cur:'כללי', rec:'הכנסות ממכירות', reason:'תקבול מלקוח קבוע כנגד חשבונית פתוחה.', basis:'history',
       hist:'לקוח קבוע — 14 תקבולים קודמים בהכנסות ממכירות', goog:'לא נדרש חיפוש', aiDec:'תקבול מלקוח מוכר — הכנסות ממכירות', src:'HISTORY', time:'לפני 40 דק׳'},
      {type:'ai', op:'סליקת אשראי — יומית · 6,320 ₪+', cur:'כללי', rec:'הכנסות ממכירות', reason:'זיכוי סליקה יומי מקארדקום — דפוס קבוע.', basis:'history',
       hist:'זיכוי יומי קבוע מקארדקום — הכנסות ממכירות', goog:'לא נדרש חיפוש', aiDec:'סליקה יומית — הכנסות ממכירות', src:'HISTORY', time:'לפני 38 דק׳'},
      {type:'ai', op:'העברה ל"י. אבידן עבודות גמר" · 9,800 ₪-', cur:'כללי', rec:'שכר קבלני משנה', reason:'קבלן משנה מוכר; תשלום חודשי במועד קבוע.', basis:'ai',
       hist:'2 תשלומים קודמים — קוטלגו ידנית בקטגוריות שונות', goog:'י. אבידן — עבודות גמר ושיפוצים', aiDec:'ההיסטוריה לא עקבית; לפי אופי המוטב והסכום החודשי — שכר קבלני משנה (ביטחון 84%)', src:'HISTORY', time:'לפני 35 דק׳'},
      {type:'ai', op:'העברה ל"צוות חשמל א.מ" · 5,400 ₪-', cur:'כללי', rec:'שכר קבלני משנה', reason:'תשלום שני ברצף לאותו קבלן — תואם הסכם מסגרת.', basis:'history',
       hist:'תשלום קודם לאותו קבלן — שכר קבלני משנה', goog:'צוות חשמל א.מ — קבלן חשמל', aiDec:'רצף תשלומים לקבלן — שכר קבלני משנה', src:'HISTORY', time:'לפני 33 דק׳'},
      {type:'payee', chk:'0010814', bank:'הפועלים · סניף 736', amount:'216', date:'26.07.2026', ocrName:'ויקה רזניק', img:'check.jpeg', time:'לפני 25 דק׳'},
      {type:'payee', chk:'0010676', bank:'הפועלים · סניף 736', amount:'6,995', date:'31.05.2026', ocrName:'אי פרטס בע״מ', img:'c2.jpeg', time:'לפני 24 דק׳'},
      {type:'payee', chk:'0010795', bank:'הפועלים · סניף 736', amount:'4,800', date:'12.07.2026', ocrName:'', img:'c3.jpeg', time:'לפני 20 דק׳'},
      {type:'carry', dir:'exp', acct:'mz295', days:11, txd:'31.05', pay:'הו״ק', text:'צפינו פעולת הוצאה "הראל (שילוח)" ע"ס 2,049 ₪ — טרם הופיעה.', who:'הראל (שילוח)', amt:2049, time:'לפני שעה',
        related:[{d:'15.06.2026',t:'הוראת קבע — הראל שילוח · מזרחי 295199',amt:'2,049 ₪-',cat:'ביטוחים'},
                 {d:'15.05.2026',t:'הוראת קבע — הראל שילוח · מזרחי 295199',amt:'2,049 ₪-',cat:'ביטוחים'}]},
      {type:'carry', dir:'exp', acct:'pl112', days:6, txd:'06.06', pay:'העברה', text:'צפינו תשלום ל"אלקטרה מיזוג" ע"ס 3,660 ₪ — טרם הופיע.', who:'אלקטרה מיזוג', amt:3660, time:'לפני שעתיים',
        mCard:{t:'חיוב ויזה כ.א.ל — אלקטרה מיזוג', amt:'3,660 ₪-', d:'28.07'},
        related:[{d:'22.06.2026',t:'העברה — אלקטרה מיזוג',amt:'3,660 ₪-',cat:'ספקים'}]},
      {type:'carry', dir:'inc', acct:'mz295', days:3, txd:'09.06', pay:'שיק', ref:'21044', text:'הכנסה צפויה מ"מרכז הבנייה" ע"ס 18,600 ₪ — טרם הופיעה.', who:'מרכז הבנייה', amt:18600, time:'היום 08:40',
        related:[{d:'25.06.2026',t:'תקבול — מרכז הבנייה',amt:'18,600 ₪+',cat:'הכנסות ממכירות'},
                 {d:'25.05.2026',t:'תקבול — מרכז הבנייה',amt:'17,200 ₪+',cat:'הכנסות ממכירות'},
                 {d:'26.04.2026',t:'תקבול — מרכז הבנייה',amt:'18,900 ₪+',cat:'הכנסות ממכירות'}]},
      {type:'unexpected', acct:'mz139', txd:'10.06', text:'הופיעה פעולה בשם "כהן טוב" ע"ס 238 ₪ שלא צפינו.', who:'כהן טוב', amt:238, time:'לפני שעה',
        related:[{d:'12.06.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'238 ₪-',cat:'שכר קבלני משנה'},
                 {d:'12.05.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'238 ₪-',cat:'שכר קבלני משנה'},
                 {d:'14.04.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'220 ₪-',cat:'שכר קבלני משנה'}]},
      {type:'unexpected', acct:'mz295', txd:'11.06', text:'הופיעה פעולה "הראל חב׳ לביטוח בע״מ" ע"ס 2,049 ₪ שלא צפינו.', who:'הראל חב׳ לביטוח בע״מ', amt:2049, time:'היום 09:20', related:[]},
      {type:'unexpected', dir:'inc', acct:'mz295', txd:'12.06', text:'תקבול "מרכז הבנייה בע״מ — חלקי" ע"ס 10,000 ₪ שלא צפינו.', who:'מרכז הבנייה בע״מ — חלקי', amt:10000, time:'היום 10:02', related:[]},
      {type:'unexpected', dir:'inc', acct:'mz139', txd:'12.06', text:'תקבול "מרכז הבנייה בע״מ" ע"ס 8,600 ₪ שלא צפינו.', who:'מרכז הבנייה בע״מ', amt:8600, time:'היום 10:03', related:[],
       mFcast:{t:'הכנסה צפויה — מרכז הבנייה', amt:'8,600 ₪+', d:'12.08'}},
      {type:'sheet', kind:'add', sheet:'תשלומים לספקים · צפי', who:'צחי עובד', time:'לפני 3 דק׳',
        rows:[{date:'15.08.2026', ref:'', desc:'ספק אריזות — הזמנה חדשה', amount:'5,200'},
              {date:'20.08.2026', ref:'', desc:'יועץ שיווק — ריטיינר', amount:'3,000'}]},
      {type:'sheet', kind:'add', sheet:'תשלומים לספקים · צפי', who:'צחי עובד · דרך הבוט בקבוצה', time:'לפני 20 דק׳',
        rows:[{date:'25.08.2026', ref:'שיק 21045', desc:'פלסט-גל — חומרי גלם', amount:'7,500'}]},
      {type:'sheet', kind:'edit', sheet:'תקבולים מלקוחות · צפי', who:'רות אלמוג', time:'היום 08:55',
        field:'מרכז הבנייה · 12.08', desc:'תקבול מרכז הבנייה', old:'17,500', new:'19,800'},
      {type:'overdraft', text:'חשבון מרכנתיל 69855155 נמצא בחריגה ע"ס 42,445 ₪ ממסגרת האשראי. נא טיפול בהקדם.', time:'היום 09:14'},
      {type:'msg', who:'לירון', thread:['תודה על העדכון!'], time:'אתמול', done:true, result:'טופל · ✓ נשלח ללקוח', handledAt:'אתמול 16:20'},
      {type:'ai', op:'הוצאת ביטוח · 890 ₪-', cur:'כללי', rec:'ביטוחים', reason:'לפי תיאור הספק.', src:'HISTORY', time:'אתמול', done:true, result:'אושר — קוטלג בביטוחים', handledAt:'אתמול 15:05'},
    ];
    CLIENTS[1].tasks=[
      {type:'doc', name:'ריכוז הוצאות ידניות · יוני', time:'לפני 20 דק׳', src:'טבלת הזנה'},
      {type:'ai', op:'תשלום ספקים · 2,100 ₪-', cur:'כללי', rec:'ספקים', reason:'לפי היסטוריית התשלומים לספק זה.', src:'HISTORY', time:'לפני שעה'},
    ];
    CLIENTS[2].tasks=[
      {type:'overdraft', text:'חשבון בחריגה — נדרש טיפול בהקדם.', time:'לפני 30 דק׳'},
      {type:'ai', op:'6,773 ₪+ ← "קיר זי בע״מ"', cur:'כללי', rec:'הלוואות', reason:'לפי דפוסי ההכנסה מהמקור.', src:'HISTORY, SEARCH', time:'לפני 55 דק׳'},
      {type:'carry', text:'תשלום צפוי שטרם הופיע — נגררת 4 ימים.', time:'היום 09:14'},
    ];
    CLIENTS[3].tasks=[];
    CLIENTS[4].tasks=[];
    CLIENTS[2].unread=2; CLIENTS[4].unread=2;
    CLIENTS[1].debt=1200; CLIENTS[3].debt=480;
    CLIENTS[0].ccDown=true; CLIENTS[2].clearDown=true;
    opsDoneSet.add('c4'); opsDur['c4']=320;
    /* ===== דמו: שתי חברות שסיימו תפעול, שני מצבים =====
       מטעי גבעון (c2) — סיימה, אין הודעות חדשות ⇒ מסך "התפעול הושלם".
       אנרגי גולני (c1) — סיימה, ונכנסה הודעה חדשה ⇒ נוחתים על ההודעות. */
    opsDoneSet.add('c2'); opsDur['c2']=424; CLIENTS[2].tasks=[];
    opsDoneSet.add('c1'); opsDur['c1']=618;
    CLIENTS[1].tasks=[
      {type:'msg', who:'יעל גולני', time:'לפני 6 דק׳', thread:['שילמתי עכשיו 7,500 לפלסט-גל בשיק 21045'],
       ctx:['[יעל גולני] שילמתי עכשיו 7,500 לפלסט-גל בשיק 21045']},
      {type:'doc', name:'אישור העברה — לאומי · 3,660 ₪', who:'יעל גולני', note:'מצרפת אישור על ההעברה לאלקטרה',
       time:'לפני 3 דק׳', src:'הודעת לקוח', img:'m3.jpeg',
       ctx:['[יעל גולני] מצרפת אישור על ההעברה לאלקטרה','[יעל גולני] + קובץ'],
       file:{payee:'אלקטרה מיזוג', amount:'3,660', date:'28.07.2026', ref:'889231', desc:'העברה בנקאית'}},
    ];
    CLIENTS[0].preview='תחזרו אליי היום · צפייה בתזרים';
    CLIENTS[2].preview='האם היתרה שלי מספיקה?';
    CLIENTS[4].preview='אפשר דוח תזרים מעודכן?';
    CLIENTS[2].stat='trial'; CLIENTS[3].stat='setup';
    CLIENTS[0].product='money'; CLIENTS[1].product='meeting'; CLIENTS[2].product='money+'; CLIENTS[3].product='money'; CLIENTS[4].product='money+';
    /* דמו: חלק גדול מהתיק כבר תופעל היום — ככה רואים איך התור מתקצר */
    (function seedDone(){
      let s=7; const rnd=()=>((s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff);
      CLIENTS.forEach((c,i)=>{ if(i<5) return;
        if(typeof coActive==='function'&&!coActive(c)) return;
        if(rnd()<0.62){ opsDoneSet.add('c'+i); opsDur['c'+i]=180+Math.floor(rnd()*900); }
      });
    })();
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
    /* דמו: השלבים שכבר טופלו — הכניסה לתפעול נוחתת על השלב הראשון שאינו ברשימה.
       כרגע: קטגוריות · מוטבים · נגררות ולא צפויות ⇒ נוחתים על "הודעות לקוח".
       ואם OPS_SKIP_STAGES — כל שלבי התפעול מסומנים כטופלו ונכנסים ישר לבדיקות. */
    CLIENTS.forEach(c=>(c.tasks||[]).forEach(t=>{
      if(OPS_SKIP_STAGES ? STAGE_TASK_TYPES.includes(t.type) : OPS_PREDONE.includes(t.type)) t.done=true;}));
    CLIENTS.forEach(c=>{if(!c.stat)c.stat='active'; c.opsPending=(c.tasks||[]).filter(t=>!t.done).length;});
  }
  function curTasks(){return CLIENTS[CUR].tasks||(CLIENTS[CUR].tasks=[]);}
  const grpChip=t=>t.grp?'<span class="grp-tag">מהקבוצה</span> ':'';
  function taskTitle(t){
    if(t.type==='msg'&&t.reply) return (t.who||'הלקוח')+' ענה: '+((t.thread||[])[0]||'');
    if(t.type==='msg') return (t.who?t.who+': ':'')+(t.thread?t.thread[t.thread.length-1]:'הודעה');
    if(t.type==='doc') return t.name;
    if(t.type==='payee') return 'שיק יוצא מס׳ '+t.chk+' · '+t.amount+' ₪ · '+t.bank+(t.ocrName?'':' · המוטב לא זוהה');
    if(t.type==='ai'){
      const B={history:['היסטוריה','hist'],google:['גוגל','goog'],ai:['AI','aid']}[t.basis||'history'];
      return 'קיטלוג: '+t.op+` <span class="ai-basis ${B[1]}">לפי ${B[0]}</span>`;
    }
    /* נגררות/לא צפויות: העמודה כבר אומרת "לא צפויה"/"נגררת" —
       אז לא חוזרים על "הופיעה פעולה בשם…". נשאר מה שבאמת מזהה: שם וסכום.
       הסכום בולט כי הוא מפתח ההתאמה הידנית. */
    if(t.type==='unexpected'||t.type==='carry'){
      const sign=t.dir==='inc'?'+':'';
      return `<b class="cu-who">${t.who||''}</b><span class="cu-amt ${t.dir==='inc'?'inc':''}">${sign}${(t.amt||0).toLocaleString()} ₪</span>`
        + (t.txd?`<span class="cu-txd">${t.type==='carry'?'צפוי ל־'+t.txd:t.txd}</span>`:'')
        + (t.days?`<span class="cu-days ${t.days>=7?'hot':''}">${t.dir==='inc'?'באיחור':'נגררת'} ${t.days} ימים</span>`:'');
    }
    return (t.text||'').replace(/\s+/g,' ').slice(0,70);
  }
  let OPS_OPEN=new Set();
  /* ===== ההתכתבות עם הלקוח — פאנל קבוע לאורך כל התפעול =====
     אותה שיחה של שלב 4, לקריאה: מה הלקוח שלח, מה נענה, ומה עוד מחכה. */
  /* צפי התזרים לפאנל הצד — ימים קדימה עם יתרה רצה */
  window._opsSideTab=window._opsSideTab||'chat';
  if(window._opsSideOpen==null) window._opsSideOpen=true;
  function opsSideToggle(){ window._opsSideOpen=!window._opsSideOpen; window._opsSideUser=1; if(document.getElementById('finView').style.display!=='none'){finChatFill();}else{renderOps();} }
  function opsSideTab(v){ window._opsSideTab=v; if(document.getElementById('finView').style.display!=='none'){finChatFill();}else{renderOps();} }
  const SIDE_FLOW={
    accts:[['מזרחי 295199',41200],['מרכנתיל 69855155',-42445]],
    rows:[
      ['28.07','תקבול — מרכז הבנייה',18600],
      ['28.07','שיק 0010814 — ויקה רזניק',-216],
      ['29.07','הו״ק — הראל (שילוח)',-2049],
      ['30.07','משכורות יולי',-62100],
      ['31.07','חיוב ויזה כ.א.ל',-9210],
      ['01.08','שכירות אוגוסט',-12000],
      ['03.08','תקבול — רימון מוצרי אנרגיה',24000],
      ['05.08','מקדמות מס הכנסה',-8400],
      ['10.08','החזר הלוואה — לאומי',-6500],
      ['12.08','תקבול — מרכז הבנייה',19800],
    ]};
  function opsFlowHtml(){
    const fmt=n=>Math.abs(n).toLocaleString();
    let bal=SIDE_FLOW.accts.reduce((s,a)=>s+a[1],0);
    const rows=SIDE_FLOW.rows.map(r=>{ bal+=r[2];
      return `<div class="sf-r"><span class="sf-d num">${r[0]}</span>
        <span class="sf-t">${r[1]}</span>
        <b class="sf-a num ${r[2]<0?'neg':'pos'}">${r[2]<0?'-':'+'}${fmt(r[2])}</b>
        <span class="sf-b num ${bal<0?'neg':''}">${bal<0?'-':''}${fmt(bal)}</span></div>`;}).join('');
    return `<div class="sf-accts">${SIDE_FLOW.accts.map(a=>`<div class="sf-ac"><span>${a[0]}</span><b class="num ${a[1]<0?'neg':''}">${a[1]<0?'-':''}${Math.abs(a[1]).toLocaleString()} ₪</b></div>`).join('')}</div>
      <div class="sf-h"><span>מועד</span><span>תנועה</span><span>סכום</span><span>יתרה</span></div>${rows}`;
  }
  /* אנשי קשר בפאנל — אותה רשימה של הפופאפ, עם כתיבת וואטסאפ במקום */
  let _ctsSideWa=null;
  function opsCtsWa(i){ _ctsSideWa=(_ctsSideWa===i)?null:i; opsSideTab('cts'); }
  function opsCtsSend(i){
    const e=document.getElementById('ctsSideTxt'); const v=(e&&e.value.trim())||'';
    if(!v){e&&e.focus();return;}
    const u=ctsList()[i]; _ctsSideWa=null; opsSideTab('cts');
    toast('נשלח בוואטסאפ ל'+u.n+' — "'+(v.length>40?v.slice(0,40)+'…':v)+'"');
  }
  function opsCtsHtml(){
    return ctsList().map((u,i)=>`
      <div class="cts-row">
        <div class="cts-av">${u.n.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
        <div class="cts-info"><b>${u.n}</b><span>${u.role} · <bdo dir="ltr">${u.phone}</bdo></span></div>
        <button class="cts-wa ${_ctsSideWa===i?'on':''}" onclick="opsCtsWa(${i})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>
          וואטסאפ</button>
      </div>
      ${_ctsSideWa===i?`<div class="cts-comp">
        <textarea id="ctsSideTxt" placeholder="הודעה ל${u.n}…" rows="2"></textarea>
        <button class="cts-send" onclick="opsCtsSend(${i})">שליחה</button>
      </div>`:''}`).join('');
  }
  function opsFlowRefresh(btn){
    btn.classList.add('spin');
    const fr=btn.closest('.ops-chatside').querySelector('.ops-flow-frame');
    if(fr){ window._sfT=(window._sfT||0)+1; fr.setAttribute('src','widgets/widget-cashflow-full.html?t='+window._sfT+'#embed'); }
    setTimeout(()=>{ btn.classList.remove('spin'); toast('התזרים רוענן'); },900);
  }
  function opsChatSide(T){
    const items=T.filter(t=>t.type==='msg'||t.type==='doc');
    if(!items.length) return '';
    const openN=items.filter(t=>!t.done).length;
    const bub=(who,txt,me)=>`<div class="msgc-b ${me?'me':''}"><span class="msgc-w">${who}</span>${txt}</div>`;
    const body=items.map(t=>{
      const lines=(t.ctx&&t.ctx.length?t.ctx:(t.thread||[]).map(x=>'['+(t.who||'הלקוח')+'] '+x));
      const msgs=lines.map(l=>{
        const m=l.match(/^\[([^\]]+)\]\s*(.*)$/)||[null,t.who||'הלקוח',l];
        return bub(m[1],m[2],m[1].includes('מנהל תזרים')||m[1].includes('יועץ'));
      }).join('');
      const tag=t.type==='doc'?`<span class="msgc-att">${t.img?'📎':'📊'} ${t.name}</span>`:'';
      const st=t.done?(t.later?'<span class="msgc-ok later">◷ מאוחר יותר</span>':'<span class="msgc-ok">✓ טופל</span>')
                     :'<span class="msgc-ok await">◷ מחכה לשלב הודעות לקוח</span>';
      return `<div class="msgc-item chatside">
        <div class="msgc-time">${t.who||''} · ${t.time||''}</div>
        ${msgs}
        <div class="msgc-foot">${tag}${st}</div>
      </div>`;}).join('');
    const tab=window._opsSideTab;
    if(!window._opsSideOpen){
      return `<div class="ops-wdg ops-chatside closed" onclick="opsSideToggle()" title="פתיחת הפאנל">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 6 6 6-6 6"/></svg>
        <span class="cl-ic" title="הודעות">💬${openN?`<em>${openN}</em>`:''}</span>
        <span class="cl-lbl">הודעות · תזרים · אנשי קשר</span>
      </div>`;
    }
    return `<div class="ops-wdg ops-chatside">
      <div class="ost-head side-tabs">
        <button class="sf-hide" onclick="opsSideToggle()" title="כיווץ הפאנל"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 6-6 6 6 6"/></svg></button>
        <button class="stb ${tab==='chat'?'on':''}" onclick="opsSideTab('chat')">הודעות ${openN?`<em>${openN}</em>`:''}</button>
        <button class="stb ${tab==='flow'?'on':''}" onclick="opsSideTab('flow')">תזרים</button>
        <button class="stb ${tab==='cts'?'on':''}" onclick="opsSideTab('cts')">אנשי קשר</button>
      </div>
      ${tab==='chat'?`<div class="ops-chatbody">${body}</div>`
        :tab==='flow'?`<iframe class="ops-flow-frame" src="widgets/widget-cashflow-full.html?t=0#embed" title="תחזית תזרים"></iframe>`
        :`<div class="ops-chatbody">${opsCtsHtml()}</div>`}
    </div>`;
  }
  function renderOps(){
    if(OPSMODE&&typeof applyCatRules==="function") applyCatRules();
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
    const STAGES=OPS_STAGES;
    const stTypes=k=>k==='carry'?['carry','unexpected']:k==='msg'?['msg','doc']:[k];
    const openBy=ty=>T.filter(t=>stTypes(ty).includes(t.type)&&!t.done).length;
    let curIx=STAGES.findIndex(st=>openBy(st[0])>0); if(curIx<0)curIx=STAGES.length;
    // מדידת זמן פר שלב — נסגר במעבר שלב או בסיום תפעול
    if(OPSMODE){
      if(window._stgIx==null){window._stgIx=curIx;window._stgT0=Date.now();}
      else if(curIx!==window._stgIx){
        const secs=Math.round((Date.now()-window._stgT0)/1000);
        if(STAGES[window._stgIx]) OPS_STAGE_LOG.push({n:STAGES[window._stgIx][1],s:secs});
        window._stgIx=curIx;window._stgT0=Date.now();
      }
    }
    /* שלב כפוי (הודעה שנותבה מהדשבורד) — הוא הפעיל בציר, לא הנוכחי בזרימה */
    const forcedIx=(window._opsForce!=null&&STAGES[window._opsForce])?window._opsForce:null;
    const actIx=forcedIx!=null?forcedIx:curIx;
    // פס הזרימה — עם מונה "כמה מחכה" בכל שלב, ולחיצה לתצוגה מקדימה
    const flow='<div class="ofl">'+STAGES.map((st,i)=>{
      const state=i===actIx?'cur':(i<curIx?'done':'lock');
      const n=openBy(st[0]);
      const clk=(state==='lock'&&n>0);   // לחיץ רק אם באמת מחכה שם משהו
      return (i?'<span class="ofl-ln '+(i<=curIx?'done':'')+'"></span>':'')+
        `<span class="ofl-nd ${state} ${clk?'clk':''} ${window._opsPeek===i?'peek':''}" ${clk?`onclick="opsPeek(${i})"`:''} title="${st[1]}${clk?' — תצוגה מקדימה':''}">
          <b>${(i<curIx&&i!==actIx)?'✓':i+1}</b><i>${st[1]}</i>${n&&i!==actIx?`<em>${n}</em>`:''}</span>`;
    }).join('')+'</div>';
    let cards='';
    if(OPS_VIEW==='open'){
      // מסך מלא לשלב אחד: הנוכחי — או שלב בתצוגה מקדימה (נעול למגע)
      /* _opsForce — קפיצה לשלב מסוים (למשל הודעה שנותבה מהדשבורד): פעיל, לא נעול */
      const forced=forcedIx!=null;
      const showIx=forced?forcedIx:((window._opsPeek!=null&&window._opsPeek!==curIx)?window._opsPeek:curIx);
      if(showIx<STAGES.length){
        const [ty,label,sub]=STAGES[showIx];
        const rows=pool.filter(t=>stTypes(ty).includes(t.type));
        const isPeek=!forced&&showIx!==curIx;
        if(forced&&!rows.length){ window._opsForce=null; }
        window._opsChatTy=ty;
        cards=`<div class="ops-wdg st-${ty} ${isPeek?'wlock':''}" style="grid-column:1/-1">
          <div class="ost-head"><span class="ost-num">${showIx+1}</span>
            <div class="ost-b"><b>${label}</b><i>${sub}</i></div>
            ${isPeek?'<span class="ost-cnt">תצוגה מקדימה · נעול</span><button class="mt-btn view" style="pointer-events:auto" onclick="opsPeek(null)">חזרה לשלב הנוכחי</button>':`<span class="ost-cnt">${rows.length} לטיפול</span>`}
            ${ty==='ai'&&!isPeek?'<button class="mt-btn view" onclick="openCatRules()">⚙ כללי קיטלוג</button>':''}
          </div>

          ${rows.length?(ty==='ai'?aiGrouped(rows,T):ty==='payee'?payeeSplit(rows,T):ty==='carry'?carryUnexpected(rows,T):ty==='msg'?msgStage(rows,T):ty==='sheet'?sheetStage(rows,T):rows.map(t=>opsRow(t,T.indexOf(t))).join('')):'<div class="ops-empty" style="padding:18px">אין משימות בשלב זה</div>'}
        </div>`;
      }
    }else{
      cards=pool.length?`<div class="ops-wdg"><div class="ost-head"><div class="ost-b"><b>טופלו</b></div></div>`+pool.map(t=>opsRow(t,T.indexOf(t))).join('')+'</div>':'';
    }
    const chat=(OPS_VIEW==='open'&&cards)?opsChatSide(T):'';
    /* הפאנל מתחיל מראש המסך — לצד כותרת המשימות והציר, לאורך כל השלב */
    const main='<div class="ops-rows" style="margin-bottom:14px">'+head+flow+'</div>'+
      (cards?'<div class="ops-wgrid flow">'+cards+'</div>'
        :(window._opsDoneScreen&&OPS_VIEW==='open'
          ?`<div class="ops-rows"><div class="ops-fin-still">
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#3FAF4B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              <b>התפעול הושלם</b>
              <span>אין הודעות חדשות מאז התפעול האחרון · הושלם ב-${fmtDur(opsDur[opsActiveKey]||opsAccum[opsActiveKey]||0)}</span>
              <div class="ofs-acts"><button class="ot-btn done" onclick="opsShowRecap()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg> שלח הודעת תזרים</button></div>
            </div></div>`
          :'<div class="ops-rows"><div class="ops-empty" style="padding:50px">'+(OPS_VIEW==='open'?'אין משימות תפעול פתוחות — כל הכבוד':'עדיין לא טופלו משימות')+'</div></div>'));
    document.getElementById('opsGrid').innerHTML =
      '<div class="ops-split'+(chat?' with-chat':'')+'"><div class="ops-main">'+main+'</div>'+chat+'</div>';
    if(OPSMODE) opsEndBtnMode();
  }
  /* ===== כללי קיטלוג אוטומטי — פעולות שעונות על כלל מקוטלגות בלי אישור ===== */
  const CAT_KIND={source:'קטגוריית מקור (Bizibox)', desc:'תיאור מכיל'};
  let CR_MODE='contains';   // התאמת תיאור: מכיל / מדויק
  let CR_SCOPE='cur';       // תחולת כלל מקור: חברה נוכחית / כל החברות
  function crScopeSet(sc){
    CR_SCOPE=sc;
    document.querySelectorAll('#crScope .mtk-chip').forEach(c=>c.classList.toggle('on',c.dataset.s===sc));
  }
  function crModeSet(m){
    CR_MODE=m;
    document.querySelectorAll('#crModes .mtk-chip').forEach(c=>c.classList.toggle('on',c.dataset.m===m));
    document.getElementById('crMatch').placeholder=m==='exact'?'התיאור המלא — בדיוק כפי שמופיע':'למשל: ארנונה';
  }
  const SOURCE_CATS=['כללי','בנקאיות','חיובים באשראי'];
  let CAT_RULES=[
    {kind:'source', match:'חיובים באשראי', to:'לא לקיטלוג',    scope:'all'},
    {kind:'desc',   match:'ארנונה',        to:'מיסים ואגרות',  scope:0, mode:'contains'},
    {kind:'desc',   match:'חשמל חברת החשמל', to:'שכירות ותפעול משרד', scope:0, mode:'exact'},
    {kind:'desc',   match:'ביטוח לאומי',   to:'מיסים ואגרות',  scope:0, mode:'contains'},
    {kind:'desc',   match:'דלק פז',        to:'רכב ודלק',      scope:0, mode:'contains'},
    {kind:'desc',   match:'סלולר פלאפון',  to:'שכירות ותפעול משרד', scope:0, mode:'exact'},
    {kind:'desc',   match:'הראל ביטוח',    to:'ביטוחים',       scope:0, mode:'contains'},
    {kind:'desc',   match:'מקדמות מס הכנסה', to:'מיסים ואגרות', scope:0, mode:'exact'},
  ];
  function ruleMatches(r,t,ci){
    if(r.scope!=='all'&&r.scope!==ci) return false;
    if(r.kind==='source') return t.cur===r.match;
    return !!(t.op&&t.op.includes(r.match));
  }
  function applyCatRules(){
    const T=curTasks(); let n=0;
    T.forEach(t=>{
      if(t.type!=='ai'||t.done) return;
      const r=CAT_RULES.find(r=>ruleMatches(r,t,CUR));
      if(r){t.done=true;t.auto=true;t.autoTo=r.to;t.result='קוטלג אוטומטית ← '+r.to;t.handledAt='אוטומטי';n++;}
    });
    return n;
  }
  let CAT_TAB='desc';
  const CAT_HINT={
    desc:['כל פעולה שהתיאור שלה מכיל את הטקסט — תקוטלג אוטומטית.','למשל: ארנונה'],
    source:['כל פעולה שמגיעה מ-Bizibox בקטגוריית המקור הזו — תקוטלג אוטומטית.','בחירת קטגוריית מקור'],
  };
  function openCatRules(descPrefill){
    document.getElementById('catOv').classList.add('show');
    document.getElementById('catCoName').textContent='ב'+CLIENTS[CUR].name;
    document.getElementById('crTo').innerHTML='<option value="">בחירת קטגוריה…</option>'+COMPANY_CATS.map(c=>`<option>${c}</option>`).join('');
    catTab(descPrefill!=null?'desc':CAT_TAB);
    if(descPrefill!=null){
      document.getElementById('crMatch').value=descPrefill;
      document.getElementById('crTo').focus();
    }
  }
  function catTab(k){
    CAT_TAB=k;
    document.querySelectorAll('.cat-tab').forEach(t=>t.classList.toggle('on',t.dataset.k===k));
    document.getElementById('catHint').textContent=CAT_HINT[k][0];
    const isSel=k==='source';
    document.getElementById('crMatch').style.display=isSel?'none':'';
    const _mo=document.getElementById('crModes'); if(_mo)_mo.style.display=isSel?'none':'';
    const _sc=document.getElementById('crScope'); if(_sc)_sc.style.display='';   // תחולה — בשני סוגי הכללים
    document.getElementById('crMatchSel').style.display=isSel?'':'none';
    if(isSel) document.getElementById('crMatchSel').innerHTML='<option value="">'+CAT_HINT[k][1]+'</option>'+SOURCE_CATS.map(c=>`<option>${c}</option>`).join('');
    else document.getElementById('crMatch').placeholder=CAT_HINT[k][1];
    renderCatRules();
  }
  function catClose(){document.getElementById('catOv').classList.remove('show');}
  function renderCatRules(){
    // רק כללים גלובליים או של החברה הנוכחית — כללי חברות אחרות לא רלוונטיים כאן
    let rules=CAT_RULES.map((r,i)=>({r,i})).filter(x=>x.r.kind===CAT_TAB&&(x.r.scope==='all'||x.r.scope===CUR));
    // רשימה גדולה: חיפוש (מ-4 כללים) + חדשים למעלה + גלילה פנימית
    const fEl=document.getElementById('crFilter');
    if(fEl) fEl.style.display=rules.length>=4?'':'none';
    const q=(fEl&&fEl.value||'').trim();
    if(q) rules=rules.filter(x=>x.r.match.includes(q)||x.r.to.includes(q));
    rules.reverse();
    const cnt=document.getElementById('crCount'); if(cnt) cnt.textContent=rules.length;
    document.getElementById('catRuleList').innerHTML=rules.map(({r,i})=>`
      <div class="cr-row">
        <b>"${r.match}"</b>${r.kind==='desc'?`<span class="cr-mode ${r.mode==='exact'?'ex':''}">${r.mode==='exact'?'מדויק':'מכיל'}</span>`:''}<span class="cr-arrow">←</span><b class="cr-to">${r.to}</b>
        <span class="cr-scope">${r.scope==='all'?'כל החברות':CLIENTS[r.scope].name}</span>
        <button class="cr-del" onclick="CAT_RULES.splice(${i},1);renderCatRules();renderOps()" title="מחיקת הכלל">✕</button>
      </div>`).join('')||'<div class="qr-note" style="border:none">אין כללים מהסוג הזה עדיין</div>';
  }
  function crAdd(){
    const m=CAT_TAB==='source'?document.getElementById('crMatchSel').value:document.getElementById('crMatch').value.trim();
    const to=document.getElementById('crTo').value;
    if(!m||!to){toast('צריך גם ערך להתאמה וגם קטגוריית יעד');return;}
    CAT_RULES.push({kind:CAT_TAB, match:m, to, scope:CR_SCOPE==='all'?'all':CUR, mode:CAT_TAB==='desc'?CR_MODE:null});
    document.getElementById('crMatch').value='';document.getElementById('crMatchSel').value='';document.getElementById('crTo').value='';
    renderCatRules();renderOps();
    toast('הכלל נוסף ל"'+CLIENTS[CUR].name+'" — פעולות מתאימות יקוטלגו אוטומטית');
  }
  function descOf(t){ return (t.op||'').split('·')[0].trim(); }
  /* קטגוריות התזרים של החברה (דמו — בפרודקשן: מהשרת פר חברה) */
  const COMPANY_CATS=['הכנסות ממכירות','הכנסות אחרות','קניות מלאי','ספקים','שכר עבודה','שכר קבלני משנה',
    'שכירות ותפעול משרד','עמלות וריביות בנק','תשלומי הלוואה','הלוואות','ביטוחים','מיסים ואגרות',
    'רכב ודלק','שיווק ופרסום','לא לקיטלוג'];
  let _catPickIx=null;
  function openCatPick(i){
    _cpMode='switch'; cpReset();
    _catPickIx=i;
    const t=curTasks()[i]; if(!t) return;
    document.getElementById('cpTitle').textContent='החלפת קטגוריה — '+descOf(t);
    document.getElementById('cpSearch').value='';
    renderCatPick();
    document.getElementById('cpOv').classList.add('show');
    document.getElementById('cpSearch').focus();
  }
  function cpClose(){document.getElementById('cpOv').classList.remove('show');_catPickIx=null;}
  let _cpNew=false, _cpRoe='';
  const CAT_ROE={};   // קטגוריה → כותרת רו״ה
  function renderCatPick(){
    const q=document.getElementById('cpSearch').value.trim();
    const t=curTasks()[_catPickIx]||{};
    // בזמן יצירת קטגוריה חדשה החיפוש מיותר — מסתירים
    const _srch=document.getElementById('cpSearch');
    if(_srch) _srch.style.display=_cpNew?'none':'';
    if(_cpNew){
      // טופס קטגוריה חדשה — בתוך המודל, בלי דיאלוגים של הדפדפן
      const ROE=['הכנסות','עלות המכר','הוצאות','מימון, השקעות ובעלים'];
      document.getElementById('cpList').innerHTML=`<div class="cp-new">
        <input class="mx2-inp" id="cpNewName" placeholder="שם הקטגוריה החדשה" value="${q}" style="width:100%">
        <div class="cp-new-lbl">כותרת רו״ה — לאן הקטגוריה שייכת בדוח</div>
        <div class="cp-roe">${ROE.map((r,i)=>`
          <span class="cp-roe-b ${_cpRoe===r?'on':''}" onclick="_cpRoe='${r}';renderCatPick()"><i>${i+1}</i>${r}</span>`).join('')}</div>
        <div class="cp-new-foot">
          <button class="ot-btn done" onclick="cpNewSave()">פתיחת הקטגוריה</button>
          <button class="ot-btn ghost" onclick="_cpNew=false;_cpRoe='';renderCatPick()">ביטול</button>
        </div>
      </div>`;
      const inp=document.getElementById('cpNewName');
      setTimeout(()=>{inp.focus();},60);
      return;
    }
    const chips=COMPANY_CATS
      .filter(c=>!q||c.includes(q))
      .map(c=>`<span class="cp-chip ${c===t.rec?'rec':''}" onclick="cpPick('${c}')">${c}${c===t.rec?' · המלצת ה-AI':''}</span>`).join('');
    const add=`<span class="cp-chip newcat" onclick="_cpNew=true;_cpRoe='';renderCatPick()">+ קטגוריה חדשה${q&&!chips?` — "${q}"`:''}</span>`;
    document.getElementById('cpList').innerHTML=chips+add;
  }
  function cpNewSave(){
    const nm=(document.getElementById('cpNewName').value||'').trim();
    if(!nm){toast('צריך שם לקטגוריה');return;}
    if(!_cpRoe){toast('צריך לבחור כותרת רו״ה');return;}
    if(!COMPANY_CATS.includes(nm)) COMPANY_CATS.push(nm);
    CAT_ROE[nm]=_cpRoe;
    _cpNew=false;
    toast('"'+nm+'" נפתחה בתזרים תחת '+_cpRoe);
    _cpRoe='';
    cpPick(nm);
  }
  let _cpChosen=null,_cpMode='switch';
  function cpShowConfirm(title,sumHtml){
    document.getElementById('cpBackBtn').textContent=_cpMode==='switch'?'חזרה':'ביטול';
    document.getElementById('cpTitle').textContent=title;
    document.getElementById('cpStep1').style.display='none';
    document.getElementById('cpStep2').style.display='';
    document.getElementById('cpRuleChk').checked=false;
    document.getElementById('cpSum').innerHTML=sumHtml;
    document.getElementById('cpOv').classList.add('show');
  }
  function cpPick(cat){
    const t=curTasks()[_catPickIx]; if(!t) return;
    _cpMode='switch';_cpChosen=cat;
    cpShowConfirm('החלפת קטגוריה — אישור',
      '<b>"'+descOf(t)+'"</b><span class="cr-arrow">←</span><b class="cr-to">'+cat+'</b>');
  }
  /* אישור המלצה בודדת — עם הצעת כלל */
  function openApproveOne(i){
    const t=curTasks()[i]; if(!t) return;
    _cpMode='one';_catPickIx=i;_cpChosen=t.rec;
    cpShowConfirm('אישור הקיטלוג',
      '<b>"'+descOf(t)+'"</b><span class="cr-arrow">←</span><b class="cr-to">'+t.rec+'</b>');
  }
  /* אישור קבוצה — עם הצעת כללים לכל התיאורים */
  function openApproveGrp(rec){
    const items=curTasks().filter(t=>t.type==='ai'&&!t.done&&t.rec===rec);
    if(!items.length) return;
    _cpMode='grp';_cpChosen=rec;
    cpShowConfirm('אישור הקבוצה — '+rec,
      '<div><b>'+items.length+' פעולות</b><span class="cr-arrow">←</span><b class="cr-to">'+rec+'</b>'+
      '<div class="cp-mini">'+items.map(t=>'· '+descOf(t)).join('<br>')+'</div></div>');
  }
  function cpBack(){
    if(_cpMode!=='switch'){cpClose();cpReset();return;}  // באישורים אין בוחר מאחור — סוגרים
    cpReset();
  }
  function cpReset(){
    document.getElementById('cpStep2').style.display='none';
    document.getElementById('cpStep1').style.display='';
  }
  function cpConfirmGo(){
    const addRule=document.getElementById('cpRuleChk').checked, cat=_cpChosen;
    cpClose(); cpReset();
    if(_cpMode==='grp'){
      const descs=curTasks().filter(t=>t.type==='ai'&&!t.done&&t.rec===cat).map(descOf);
      opsApproveGroup(cat);
      if(addRule){
        descs.forEach(d=>{ if(!CAT_RULES.some(r=>r.kind==='desc'&&r.match===d&&r.scope===CUR)) CAT_RULES.push({kind:'desc',match:d,to:cat,scope:CUR}); });
        toast(descs.length+' כללים נוספו — התיאורים האלה יקוטלגו אוטומטית');
      }
      return;
    }
    const i=_catPickIx, t=curTasks()[i]; if(!t||!cat) return;
    otHandle(i,(_cpMode==='one'?'אושר — קוטלג ב':'קוטלג ב')+cat);
    if(addRule){
      CAT_RULES.push({kind:'desc', match:descOf(t), to:cat, scope:CUR});
      renderOps();
      toast('קוטלג ב"'+cat+'" + נוסף כלל אוטומטי');
    }
  }
  function catRuleFromRow(i){ const t=curTasks()[i]; if(t) openCatRules(descOf(t)); }

  /* קיטלוג מקובץ לפי הקטגוריה המומלצת — אישור פרטני או של קבוצה שלמה */
  /* קפיצה לניהול קטגוריות — הפופאפ יושב בתוך iframe התקציב */
  function openCatMgr(){
    if(typeof showTab==='function') showTab('budget');
    const tryOpen=n=>{
      const fr=document.getElementById('budgetFrame');
      if(fr&&fr.contentWindow&&fr.contentWindow.cmOpen){ fr.contentWindow.cmOpen(); }
      else if(n<25) setTimeout(()=>tryOpen(n+1),200);
    };
    setTimeout(()=>tryOpen(0),300);
  }
  function aiGrouped(rows,T){
    const groups=[];
    rows.forEach(t=>{
      let g=groups.find(x=>x.rec===t.rec);
      if(!g){g={rec:t.rec,items:[]};groups.push(g);}
      g.items.push(t);
    });
    /* ניהול הקטגוריות (מורשות/לא מורשות) חי במעקב ופערים — מכאן רק קופצים אליו */
    const cmLink=`<div class="ai-cmbar">
      <span>קטגוריה חדשה שלא ברשימת המורשות? מנהלים אותה במסך מעקב ופערים.</span>
      <button class="ot-btn ghost sm" onclick="openCatMgr()">ניהול קטגוריות ←</button>
    </div>`;
    return cmLink+'<div class="ai-grid">'+groups.map(g=>`
      <div class="ai-grp">
        <div class="ai-grp-h">
          <b>${g.rec}</b><span class="ai-grp-n">${g.items.length} פעולות</span>
          <button class="ot-btn done sm" onclick="event.stopPropagation();openApproveGrp('${g.rec.replace(/'/g,"\\'")}')">אישור הקבוצה (${g.items.length})</button>
        </div>
        ${g.items.map(t=>opsRow(t,T.indexOf(t))).join('')}
      </div>`).join('')+'</div>';
  }
  function opsApproveGroup(rec){
    const T=curTasks();
    let n=0;
    T.forEach((t,i)=>{
      if(t.type==='ai'&&!t.done&&t.rec===rec){
        t.done=true;t.result='אושר — קוטלג ב'+rec;t.handledAt='עכשיו';OPS_DONE++;n++;OPS_OPEN.delete(i);
      }
    });
    CLIENTS[CUR].opsPending=T.filter(x=>!x.done).length;
    renderOps();
    toast(n+' פעולות אושרו וקוטלגו ב"'+rec+'"');
  }
  /* ===== הזנת שיק — תמונה מול שדות, OCR ממלא מה שאפשר ===== */
  /* נגררות + לא צפויות — שתי עמודות: ימין לא צפויות, שמאל נגררות */
  /* התאמה רבים-לרבים: מכל פעולה בוחרים את הפעולות מהצד השני שמרכיבות אותה */





  /* המלצות התאמה — כולל צירוף של כמה פעולות שמסתכמות לצפי */
  window._matchDismiss=window._matchDismiss||new Set();
  function matchRecs(rows,T){
    const close=(a,b)=>a&&b&&Math.abs(a-b)<=a*0.02;
    const un=rows.filter(t=>t.type==='unexpected'&&!t.done&&t.amt);
    const ca=rows.filter(t=>t.type==='carry'&&!t.done&&t.amt);
    const recs=[];
    ca.forEach(c=>{
      const ci=T.indexOf(c);
      un.forEach(u=>{ if(close(c.amt,u.amt)){
        const key=ci+'-'+T.indexOf(u);
        if(!window._matchDismiss.has(key)) recs.push({ci,c,u,ui:T.indexOf(u),key});
      }});
    });
    return recs;
  }
  /* ===== חשבונות החברה =====
     **התאמה אפשרית רק בתוך אותו חשבון** (מגבלת ביזיבוקס). האכיפה היא
     ברגע הפעולה (muApply) ולא בפילטר: הפילטר נשאר כלי עזר לרשימות ארוכות,
     והצ'קבוקסים פתוחים תמיד. ברגע שמסמנים — שורות מחשבונות אחרים מעומעמות,
     כך שהכלל נלמד בדיוק כשהוא רלוונטי בלי להסתיר כלום. */
  /* **חשבונות בנק בלבד.** כרטיס אשראי אינו חשבון במסך הזה — עסקה בכרטיס
     אינה תנועה בבנק (רק החיוב המרוכז הוא). הכרטיס משמש כאן כ**מקור בדיקה**
     בהתאמה (סריקת 30 יום אחורה), לא כמקור שורות. */
  const ACCTS={
    mz295:{lbl:'מזרחי 295199', short:'מזרחי ‎295199'},
    mz139:{lbl:'מזרחי 139287', short:'מזרחי ‎139287'},
    pl112:{lbl:'פועלים 112',   short:'פועלים ‎112'},
  };
  const acctOf=t=>ACCTS[t.acct]||null;
  const acctChip=t=>{const a=acctOf(t); return a?`<span class="acct-chip">${a.short}</span>`:'';};

  /* ביזיבוקס — שם מתבצעות ההתאמות בפועל */
  function openBizibox(){ window.open('https://app.bizibox.biz/','_blank','noopener'); }
  function carryUnexpected(rows,T){
    const un=rows.filter(t=>t.type==='unexpected'), ca=rows.filter(t=>t.type==='carry');
    /* המלצות — מידע בלבד, בלי פעולה: מסמנות לאן להסתכל בביזיבוקס */
    window._recMap={};
    matchRecs(rows,T).forEach(r=>{ (window._recMap[r.ci]=window._recMap[r.ci]||[]).push(r.u);
                                   (window._recMap[r.ui]=window._recMap[r.ui]||[]).push(r.c); });

    /* אין פילטר חשבונות: הצ'יפ על השורה + עמעום השורות מחשבון אחר בזמן בחירה
       עושים את העבודה בלי להסתיר שורות ובלי לדרוש החלטה מראש. */

    /* המלצות ההתאמה האוטומטיות הוסרו — ההתאמה ידנית, דרך הצ'קבוקסים */

    // הגדרות פר-עמודה — נפתחות בגלגל השיניים שבכותרת
    window._cuSet=window._cuSet||{un:{on:true,min:1000},ca:{on:true,min:500,days:3,wait:4},cain:{on:true,min:1000,days:2,remind:3,esc:2},open:null};
    const CS=window._cuSet;
    const gear=cls=>`<button class="cu-gear ${CS.open===cls?'on':''}" title="הגדרות" onclick="event.stopPropagation();window._cuSet.open=window._cuSet.open==='${cls}'?null:'${cls}';renderOps()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    </button>`;
    const setPanel=cls=>{
      if(CS.open!==cls) return '';
      const st=CS[cls];
      if(cls==='un') return `<div class="cu-set">
        <div class="cu-set-h">הגדרות ללקוח — ${CLIENTS[CUR].name}</div>
        <label class="cu-set-row"><input type="checkbox" ${st.on?'checked':''} onchange="window._cuSet.un.on=this.checked">
          <span>אירועים על פעולות לא צפויות בסכומים מעל</span>
          <span class="cu-amt"><input type="number" value="${st.min}" onchange="window._cuSet.un.min=+this.value"> ₪</span></label>
        <div class="cu-set-note">אירועים בסכום מתחת לסף — יימחקו אוטומטית</div>
        <div class="cu-set-foot"><button class="ot-btn done" onclick="window._cuSet.open=null;renderOps();toast('ההגדרות נשמרו')">שמירה</button></div>
      </div>`;
      const ci=CS.cain;
      return `<div class="cu-set">
        <div class="cu-set-h">הגדרות ללקוח — ${CLIENTS[CUR].name}</div>
        <div class="cu-set-grp">הוצאות — תשלומים שצפינו וטרם ירדו</div>
        <label class="cu-set-row"><input type="checkbox" ${st.on?'checked':''} onchange="window._cuSet.ca.on=this.checked">
          <span>אירועים על פעולות נגררות בסכומים מעל</span>
          <span class="cu-amt"><input type="number" value="${st.min}" onchange="window._cuSet.ca.min=+this.value"> ₪</span></label>
        <div class="cu-set-row sub"><span>נחשבת נגררת אחרי</span>
          <span class="cu-amt"><input type="number" value="${st.days}" onchange="window._cuSet.ca.days=+this.value"> ימים</span></div>
        <div class="cu-set-row sub"><span>הודעה נוספת ללקוח על אותה פעולה — רק בחלוף</span>
          <span class="cu-amt"><input type="number" value="${st.wait}" onchange="window._cuSet.ca.wait=+this.value"> ימים</span><span>מההודעה הקודמת</span></div>
        <div class="cu-set-grp inc">הכנסות — גבייה מלקוחות</div>
        <label class="cu-set-row"><input type="checkbox" ${ci.on?'checked':''} onchange="window._cuSet.cain.on=this.checked">
          <span>אירועי גבייה על תקבולים צפויים בסכומים מעל</span>
          <span class="cu-amt"><input type="number" value="${ci.min}" onchange="window._cuSet.cain.min=+this.value"> ₪</span></label>
        <div class="cu-set-row sub"><span>נחשב באיחור אחרי</span>
          <span class="cu-amt"><input type="number" value="${ci.days}" onchange="window._cuSet.cain.days=+this.value"> ימים</span></div>
        <div class="cu-set-row sub"><span>תזכורת גבייה ללקוח כל</span>
          <span class="cu-amt"><input type="number" value="${ci.remind}" onchange="window._cuSet.cain.remind=+this.value"> ימים</span></div>
        <div class="cu-set-foot"><button class="ot-btn done" onclick="window._cuSet.open=null;renderOps();toast('ההגדרות נשמרו')">שמירה</button></div>
      </div>`;
    };
    const col=(title,items,cls)=>`<div class="cu-col ${cls}">
      <div class="cu-h">${title} <span>${items.length}</span>
        ${cls==='un'&&items.length?`<button class="cu-delall" onclick="nrAll()">מחק הכל</button>`:''}${gear(cls)}</div>
      ${setPanel(cls)}
      ${items.length?items.map(t=>opsRow(t,T.indexOf(t))).join(''):'<div class="ops-empty" style="padding:14px">נקי ✓</div>'}
    </div>`;
    /* ההתאמה עצמה נעשית בביזיבוקס — כאן רק המלצות ומידע. */
    const bzBar=`<div class="bz-bar">
      <span class="bz-txt">ההתאמות מתבצעות בביזיבוקס. כאן מוצג מה שמצאנו — ההמלצות, בדיקת האשראי והתנועות בבנק.</span>
      <button class="ot-btn done" onclick="openBizibox()">פתיחת ביזיבוקס בטאב חדש ↗</button>
    </div>`;
    return bzBar+`<div class="cu-split">${col('לא צפויות',un,'un')}${col('נגררות',ca,'ca')}</div>`;
  }
  function payeeSplit(rows,T){
    const openRows=rows.filter(t=>!t.done);
    if(!openRows.length) return '<div class="ops-empty" style="padding:18px">כל השיקים הוזנו ✓</div>';
    let sel=window._paySel!=null?T[window._paySel]:null;
    if(!sel||sel.done||sel.type!=='payee'){window._paySel=T.indexOf(openRows[0]);sel=openRows[0];}
    const i=window._paySel;
    const list=rows.map(t=>{
      const ti=T.indexOf(t);
      return `<div class="pay-item ${t.done?'done':''} ${ti===i?'on':''}" onclick="paySel(${ti})">
        <b>שיק ${t.chk}</b><span class="pay-amt">${t.amount} ₪</span>
        <i>${t.done?'✓ הוזן':t.ocrName?('מוטב: '+t.ocrName):'המוטב לא זוהה'}</i>
      </div>`;}).join('');
    return `<div class="pay-split">
      <aside class="pay-list">${list}</aside>
      <div class="pay-detail">
        <div class="pay-cols">
          <div class="chk-form">
            <label class="chk-lbl">שם המוטב ${sel.ocrName?'<span class="ocr-tag">זוהה ב-OCR — לאישור</span>':'<span class="ocr-tag miss">לא זוהה — להזנה</span>'}</label>
            <input class="mx2-inp" id="chkName_${i}" value="${sel.ocrName||''}" placeholder="כפי שמופיע על השיק">
            <label class="chk-lbl">קטגוריה</label>
            <span style="position:relative;display:block">
              <input class="mx2-inp" id="chkCat_${i}" placeholder="חיפוש קטגוריה…" autocomplete="off" style="width:100%;box-sizing:border-box"
                oninput="chkCatFilter(${i})" onfocus="chkCatOpen(${i})"
                onblur="setTimeout(()=>{const d=document.getElementById('chkCatDd_${i}');if(d)d.classList.remove('show');},180)">
              <div class="ev-dd" id="chkCatDd_${i}"></div>
            </span>
            <div class="chk-two">
              <div><label class="chk-lbl">סכום</label><input class="mx2-inp" value="${sel.amount} ₪" disabled></div>
              <div><label class="chk-lbl">תאריך פירעון</label><input class="mx2-inp" value="${sel.date}" disabled></div>
            </div>
            <label class="cp-rule" style="margin-top:12px">
              <input type="checkbox" id="chkRule_${i}">
              <span>להוסיף כלל — שיקים למוטב הזה יקוטלגו כך אוטומטית</span>
            </label>
            <div class="chk-actions">
              <button class="ot-btn done" onclick="chkSaveInline(${i})">הזנת השיק ומעבר לבא</button>
              <span class="chk-ruleslink" onclick="openCatRules()">⚙ כללים ←</span>
            </div>
          </div>
          <div class="chk-imgwrap">
            <img src="${sel.img||'check.jpeg'}" class="chk-photo doc-zoomable" alt="צילום השיק" onclick="dzoOpen(this.src,'צילום השיק')">
            <div class="chk-ocr-chips">📎 Bizibox · <span>תאריך ${sel.date}</span><span>סכום ${sel.amount} ₪</span>${sel.ocrName?`<span>מוטב: ${sel.ocrName}</span>`:'<span class="miss">מוטב לא זוהה</span>'}</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function paySel(i){window._paySel=i;renderOps();}

  /* ===== שלב גוגל שיט: דיף שינויים — שורות חדשות ועדכוני סכום ===== */
  /* פערים בסטטוס "מחכה לחומר" — מגיעים ממסך מעקב ופערים */
  const GAPWAIT_DEMO=[
    {cat:'הכנסות ממכירות - סליקה', gap:4010,  since:'3 ימים'},
    {cat:'קניות מלאי',             gap:25000, since:'6 ימים'},
  ];
  function gapwChase(cat){
    toast(cat?('נשלחה תזכורת בקבוצה על "'+cat+'"'):'נשלחה תזכורת בקבוצה על כל הקטגוריות החסרות');
  }
  function sheetStage(rows,T){
    // טבלאות הזנה מנוהלות (במקום גוגל שיט): הלקוח מזין — מהאפליקציה או דרך הבוט בקבוצה; כאן מאשרים לתזרים
    const logRow=t=>{
      const i=T.indexOf(t);
      if(t.done) return opsRow(t,i);
      const chip=t.kind==='add'?`<span class="sh-chip add">＋ ${t.rows.length} שורות</span>`:`<span class="sh-chip edit">✎ עדכון</span>`;
      const bot=(t.who||'').includes('בוט')?' <span class="grp-tag">מהקבוצה</span>':'';
      const title=t.kind==='add'
        ?`טבלת "${t.sheet}" — נוספו ${t.rows.length} שורות${bot}`
        :`טבלת "${t.sheet}" — עודכנה שורה: ${t.desc}`;
      const sub=t.kind==='add'
        ?`${t.rows.map(r=>r.desc+' · '+r.amount+' ₪').join('  ·  ')} — ${t.who} · ${t.time}`
        :`${t.field} · <s class="sh-old">${t.old} ₪</s> <span class="sh-arrow">←</span> <b class="sh-new">${t.new} ₪</b> — ${t.who} · ${t.time}`;
      /* הטבלה חכמה: מציגים את השורות עצמן — אישור פר שורה, בלי לפתוח כלום */
      const okBtn=`<button class="ot-btn done xs" onclick="event.stopPropagation();this.outerHTML='<span class=&quot;ent-ok&quot;>✓ בתזרים</span>'">אישור</button>`;
      const rows2=t.kind==='add'
        ?`<div class="ent-rows">
            <div class="ent-rh"><span>מועד</span><span>ספק / תיאור</span><span>סכום ₪</span><span>סוג · אסמכתא</span><span></span></div>
            ${t.rows.map(r=>`<div class="ent-r">
              <span>${r.date}</span><span class="ent-desc">${r.desc}</span><b>${r.amount}</b>
              <span class="ent-ty">${r.ref||'העברה'}</span>${okBtn}
            </div>`).join('')}
          </div>`
        :`<div class="ent-rows">
            <div class="ent-r edit">
              <span>${(t.field||'').split('·')[1]||''}</span><span class="ent-desc">${t.desc}</span>
              <b><s class="sh-old">${t.old}</s> <span class="sh-arrow">←</span> <span class="sh-new">${t.new}</span></b>
              <span class="ent-ty">עודכן ע״י ${t.who}</span>${okBtn}
            </div>
          </div>`;
      return `<div class="orow2item sheet"><div class="orow2">
        ${chip}
        <div class="orow2-body"><div class="orow2-title">${title}</div><div class="orow2-sub">${sub}</div></div>
        <div class="orow2-act">
          <button class="ot-btn ghost" onclick="event.stopPropagation();openDataTable('${t.sheet}')">פתיחת הטבלה</button>
          <button class="ot-btn done" onclick="otHandle(${i},'אושר — הוזן לתזרים ✓')">אישור הכל ✓</button>
        </div>
      </div>${rows2}</div>`;};
    const devNote=`<div class="dev-note">
      <div class="dev-note-h">🛠 הערה למתכנת — טבלאות הזנה מנוהלות (מחליף את גוגל שיט להזנה)</div>
      <ol>
        <li><b>תבנית:</b> טבלת <code>entry_templates</code> — עמודות, טיפוסים וולידציה; מנוהלת ע"י HK. התבניות הן <b>צפי קדימה</b> (תשלומים לספקים / תקבולים מלקוחות) — לא תיעוד עבר; העבר נשאב אוטומטית מהבנק. עמודות חובה: סוג תשלום; <b>שיק ← אסמכתא חובה</b> (ולידציה בתבנית — היא גם מפתח ההתאמה כשהשיק יורד). ללקוח: מסך הזנה באפליקציה + הדבקה מאקסל.</li>
        <li><b>שורות:</b> <code>entry_rows</code>: company_id, template_id, row_data (JSON), entered_by (user / bot / paste), entered_at, status (new/approved), approved_by/at. אין סנכרון ואין דיפים — ההזנה היא האירוע.</li>
        <li><b>ערוץ הבוט:</b> הודעה בקבוצה שמסווגת כהזנה ("מכירות היום 12,400") → שורה עם entered_by=bot + קישור להודעת המקור.</li>
        <li><b>גישת הלקוח במובייל:</b> קישור-קסם (token חתום פר טבלה+לקוח, תוקף מתחדש) שהבוט שולח לקבוצה — נפתח כדף הזנה רספונסיבי בלי התחברות (ראו <code>entry-mobile.html</code>). אותו דף חי גם באפליקציית הלקוח.</li>
        <li><b>המסך הזה:</b> כל השורות status=new של החברה; "אישור לתזרים" → approved + <b>צביעה בתזרים קדימה</b> (וזה מה שמזין את הנגררות: צפי שאושר ← מעקב אם ירד בפועל). עריכת שורה נרשמת כ-edit עם old/new.</li>
        <li><b>מדדים:</b> ללא שינוי — ממשיכים מגוגל שיט (הפניות תא+לוגיקה). ההחלפה היא רק בזרימת ההזנה.</li>
      </ol>
    </div>`;
    /* פערים שסווגו "מחכה לחומר" בתקציב — כאן הם הופכים לרדיפה, לא נשארים מספר */
    const waitGaps=(window.HK_GAPWAIT||GAPWAIT_DEMO);
    const wSum=waitGaps.reduce((s,x)=>s+x.gap,0);
    const gapPanel=waitGaps.length?`
      <div class="gapw">
        <div class="gapw-h">${waitGaps.length} קטגוריות מחכות לחומר מהלקוח · <b>${wSum.toLocaleString()} ₪</b>
          <button class="ot-btn done xs" onclick="gapwChase()">תזכורת בקבוצה לכולן</button></div>
        ${waitGaps.map(x=>`<div class="gapw-r"><span class="gapw-c">${x.cat}</span>
          <b>${x.gap.toLocaleString()} ₪</b><em>${x.since}</em>
          <button class="ot-btn ghost xs" onclick="gapwChase('${x.cat}')">תזכורת</button></div>`).join('')}
        <div class="gapw-f">סווג במעקב ופערים · מה שיוזן כאן סוגר את הפער אוטומטית</div>
      </div>`:'';
    return gapPanel+`<div class="pay-grp" style="padding-inline:16px">שורות חדשות בטבלאות ההזנה <em>${rows.filter(t=>!t.done).length}/${rows.length}</em></div>`+rows.map(logRow).join('')+devNote;
  }
  function openSheetEntry(i){
    const t=curTasks()[i]; if(!t||t.type!=='sheet') return;
    _docIx=i;
    if(t.kind==='edit'){
      // עדכון סכום = הזנה מלאה: כל השדות פתוחים, ההקשר של השינוי מוצג לצד הטופס
      const card=`<div class="xls-paper">
        <div class="xls-top">✎ גיליון "${t.sheet}" — הלקוח עדכן סכום</div>
        <div class="shc"><span>פירוט</span><b>${t.desc}</b></div>
        <div class="shc"><span>תא בגיליון</span><b dir="ltr">${t.cell}</b></div>
        <div class="shc"><span>סכום קודם (מה שהוזן בתזרים)</span><b class="sh-old">${t.old} ₪</b></div>
        <div class="shc"><span>סכום חדש בגיליון</span><b class="sh-new">${t.new} ₪</b></div>
        <div class="shc"><span>עודכן ע"י</span><b>${t.who} · ${t.time}</b></div>
        <div class="shc-note">בדקו את כל השדות — ייתכן שהשינוי דורש יותר מעדכון סכום (פיצול, תאריך, קטגוריה).</div>
      </div>`;
      document.getElementById('docTitle').textContent='עדכון בתזרים — '+t.desc;
      document.getElementById('docBody').innerHTML=fileMsgBody({...t, name:t.desc,
        file:{payee:'', rows:[{date:'', ref:t.cell, desc:t.desc, amount:t.new}]},
        note:'', img:null, changeCard:card}, i);
    }else{
      document.getElementById('docTitle').textContent='הזנה למערכת — גיליון "'+t.sheet+'"';
      document.getElementById('docBody').innerHTML=fileMsgBody({...t, name:'גיליון '+t.sheet, file:{payee:'', rows:t.rows}, note:'', img:null}, i);
    }
    document.getElementById('docOv').classList.add('show');
  }

  /* ===== שלב הודעות לקוח: מלל + קבצים, הזנה בסגנון Bizibox ===== */
  /* בקשות חומר פתוחות — נוצרות אוטומטית כשחסר מסמך; הבוט מפרסם בקבוצה ועוקב */
  let OPS_REQS=[
    {t:'קניות מלאי מספקים — מה נשאר לשלם החודש ומתי', d:'לפני 3 ימים', st:'open'},
    {t:'צפי תקבולים מלקוחות — אוגוסט (מי, כמה, מתי)',  d:'אתמול',       st:'open'},
    {t:'מועד פירעון לשיק ידני 21036 · 2,964 ₪',        d:'היום 10:20',  st:'done'},
  ];
  function reqRemind(i){toast('הבוט שלח תזכורת בקבוצה: '+OPS_REQS[i].t);}
  /* בקשות חומר — לא בתור. המתפעל מזין מה שיש; מה שחסר חי בטבלאות ההזנה והבוט מתזכר לבד. */
  /* ---- טבלת הזנה מנוהלת: התבנית נקבעת אצלנו, הלקוח מזין שורות ---- */
  /* הטבלה אינה חודשית: התאריך של השורה קובע את החודש — שיקים ותשלומים
     נמסרים חודשים קדימה, והרשימה נחתכת בכותרות-חודש ויזואליות בלבד.
     שורה בלי מועד = ידיעה שממתינה לתאריך: לא נצבעת עדיין, ומקבלת המלצת
     מועד אוטומטית מההיסטוריה של המוטב. */
  const DATA_TABLES={
    'תשלומים לספקים · צפי':{cols:['מועד','ספק / תיאור','סכום ₪','אמצעי','סטטוס'],rows:[
      {d:'22.07.2026', t:'לדובק הפצה — סחורה יוני', a:'8,400',  pay:'העברה', ref:'', by:'רות אלמוג', ch:'app',    st:'done', when:'הותאם 22.07'},
      {d:'10.08.2026', t:'לדובק הפצה — סחורה יולי', a:'8,400',  pay:'העברה', ref:'', by:'רות אלמוג', ch:'app',    st:'flow'},
      {d:'15.08.2026', t:'ספק אריזות — הזמנה חדשה', a:'5,200',  pay:'שיק',   ref:'21044', src:'ידני', by:'צחי עובד', ch:'link', st:'new'},
      {d:'20.08.2026', t:'יועץ שיווק — ריטיינר',    a:'3,000',  pay:'העברה', ref:'', by:'צחי עובד', ch:'link',   st:'new'},
      {d:'25.08.2026', t:'פלסט-גל — חומרי גלם',     a:'7,500',  pay:'שיק',   ref:'21045', src:'ידני', by:'צחי עובד', ch:'grp', st:'new'},
      {d:'28.08.2026', t:'שכירות מחסן',             a:'6,450',  pay:'העברה', ref:'', by:'רות אלמוג', ch:'app',   st:'new', edit:'6,000 ← 6,450'},
      {d:'05.08.2026', t:'הראל (שילוח) — הו״ק',     a:'2,049',  pay:'העברה', ref:'', by:'רות אלמוג', ch:'app',   st:'late'},
      {d:'10.09.2026', t:'פלסט-גל — שיק דחוי',       a:'7,500',  pay:'שיק',   ref:'21046', src:'אוטומציה', by:'—', ch:'grp', st:'flow'},
      {d:'10.10.2026', t:'פלסט-גל — שיק דחוי',       a:'7,500',  pay:'שיק',   ref:'21047', src:'אוטומציה', by:'—', ch:'grp', st:'flow'},
      {d:'', t:'פז חברת נפט — חשבונית פתוחה',        a:'12,000', pay:'העברה', ref:'', by:'צחי עובד', ch:'grp', st:'nodate', rec:'25.08.2026', recWhy:'תנאי תשלום פז: שוטף+30 · חשבונית 25.07'},
    ]},
    'תקבולים מלקוחות · צפי':{cols:['מועד','לקוח','סכום ₪','אמצעי','סטטוס'],rows:[
      {d:'12.08.2026', t:'מרכז הבנייה — יתרת פרויקט', a:'19,800', pay:'העברה', ref:'', by:'רות אלמוג', ch:'app',  st:'new', edit:'17,500 ← 19,800'},
      {d:'18.08.2026', t:'רימון מוצרי אנרגיה — הזמנה 122', a:'24,000', pay:'שיק', ref:'8734', src:'אוטומציה', by:'—', ch:'link', st:'flow'},
      {d:'25.08.2026', t:'פז חברת נפט — חודשי',      a:'11,500', pay:'העברה', ref:'', by:'—', ch:'link', st:'flow', anon:true},
      {d:'20.07.2026', t:'מרכז הבנייה — מקדמה',      a:'12,000', pay:'העברה', ref:'', by:'צחי עובד', ch:'grp',  st:'done', when:'הותאם 21.07'},
      {d:'28.07.2026', t:'אלקטרו סחר — חשבונית 4471', a:'14,300', pay:'העברה', ref:'', by:'רות אלמוג', ch:'app', st:'late', days:12},
      {d:'01.08.2026', t:'מרכז הבנייה — שלב ב׳',      a:'22,000', pay:'שיק',   ref:'8801', src:'ידני', by:'צחי עובד', ch:'link', st:'late', days:8},
      {d:'15.09.2026', t:'רימון מוצרי אנרגיה — הזמנה 123 · שיק דחוי', a:'24,000', pay:'שיק', ref:'8735', src:'ידני', by:'צחי עובד', ch:'link', st:'flow'},
      {d:'', t:'מרכז הבנייה — אבן דרך ג׳',            a:'30,000', pay:'העברה', ref:'', by:'רות אלמוג', ch:'app', st:'nodate', rec:'20.09.2026', recWhy:'תנאי תשלום מרכז הבנייה: שוטף+45 · חשבונית 05.08'},
    ]},
  };
  const ENT_ST={
    new :{t:'ממתין לאישור', c:'wait'},
    flow:{t:'✓ בתזרים',     c:'ok'},
    done:{t:'● בוצע',       c:'exec'},
    late:{t:'⚠ נגררת',      c:'late'},
    nodate:{t:'ללא מועד',   c:'nod'},
  };
  let ENT_TAB='live';   // live | done | all
  const ENT_PAYTYPES=['העברה','שיק'];
  let ENT_NEWTYPE='העברה';
  function entTypeCycle(){
    ENT_NEWTYPE=ENT_PAYTYPES[(ENT_PAYTYPES.indexOf(ENT_NEWTYPE)+1)%ENT_PAYTYPES.length];
    const b=document.getElementById('entType'); if(b)b.textContent=ENT_NEWTYPE+' ↺';
    const r=document.getElementById('entRef'); if(r)r.style.display=ENT_NEWTYPE==='שיק'?'':'none';
  }
  let ENTRIES_SEL=null;
  /* ===== ניהול חומר — הכנסות =====
     המסך הוא חלון על קטגוריות התזרים שנבחרו (בד"כ "הכנסה ממכירות"):
     סנכרון דו-כיווני — מה שצבוע נשלף לכאן, מה שמוזן כאן נצבע לתזרים.
     כל פריט = תנועה בביזיבוקס (trans_id) — עותק אחד של האמת.
     שינוי תאריך כאן = התנועה זזה בתזרים באותו רגע + "תאריך זז" בלוג. */
  let ENT_MODE='inc';   // inc | exp
  const MAT_CATS=['הכנסות ממכירות - מזומן','הכנסות ממכירות - סליקה'];
  const MAT_INC=[
    {id:'bz-4d97a', d:'05.08.2026', cust:'מרכז הבנייה', desc:'חשבונית 1041 — אבן דרך א׳', a:22000, src:'אוטומציה', st:'done'},
    {id:'bz-4d97b', d:'12.08.2026', cust:'מרכז הבנייה', desc:'חשבונית 1044 — אבן דרך ב׳', a:19800, src:'אוטומציה', st:'flow'},
    {id:'bz-4e221', d:'18.08.2026', cust:'רימון מוצרי אנרגיה', desc:'חשבונית 1045 — הזמנה 122', a:24000, src:'אוטומציה', st:'flow'},
    {id:'bz-4e222', d:'25.08.2026', cust:'פז חברת נפט', desc:'חיוב חודשי', a:11500, src:'ידני', st:'new'},
    {id:'bz-4e223', d:'15.09.2026', cust:'רימון מוצרי אנרגיה', desc:'חשבונית 1046 — הזמנה 123', a:24000, src:'אוטומציה', st:'flow'},
    {id:'bz-4d98c', d:'28.07.2026', cust:'אלקטרו סחר', desc:'חשבונית 4471', a:14300, src:'אוטומציה', st:'late', days:12},
    {id:'bz-4e9f1', d:'', cust:'מרכז הבנייה', desc:'חשבונית 1047 — אבן דרך ג׳', a:30000, src:'אוטומציה', st:'nodate', rec:'20.09.2026', recWhy:'תנאי תשלום מרכז הבנייה: שוטף+45 · חשבונית 05.08'},
    {id:'bz-4e9f2', d:'', cust:'וולט תקבולים', desc:'התחשבנות יולי', a:6200, src:'ידני', st:'nodate', rec:'10.09.2026', recWhy:'תנאי תשלום וולט: שוטף+30'},
  ];
  const HE_MONTHS={'01':'ינואר','02':'פברואר','03':'מרץ','04':'אפריל','05':'מאי','06':'יוני','07':'יולי','08':'אוגוסט','09':'ספטמבר','10':'אוקטובר','11':'נובמבר','12':'דצמבר'};
  let MAT_EDIT=null, MAT_ROWEDIT=null, MAT_WEEK=null, MAT_ADD=false;
  const MAT_MORE=new Set();   // תאריכים שבהם רשימת הצ'יפים פרושה במלואה
  function matMore(d){ MAT_MORE.has(d)?MAT_MORE.delete(d):MAT_MORE.add(d); renderEntriesView(); }
  function matAddTg(){ MAT_ADD=!MAT_ADD; renderEntriesView(); if(MAT_ADD) setTimeout(()=>{const e=document.getElementById('maC'); if(e)e.focus();},0); }
  function matAddGo(){
    const g=id=>{const e=document.getElementById(id); return e?e.value.trim():'';};
    const d=g('maD'), c=g('maC'), ds=g('maT'), a=+g('maA').replace(/,/g,'');
    if(!c||!a){toast('צריך לקוח וסכום');return;}
    MAT_INC.push({id:'mn-'+Math.round(a)+'-'+MAT_INC.length, d:d?(d.length===5?d+'.2026':d):'', cust:c, desc:ds||'הזנה ידנית',
      a, src:'ידני', st:d?'new':'nodate', rec:d?null:'25.08.2026', recWhy:'לפי תנאי התשלום של המוטב'});
    MAT_ADD=false; renderEntriesView(); toast(d?'נוסף — ממתין לאישור':'נוסף ללא מועד — גרור אותו לתאריך בציר');
  }
  /* ===== What-If: שכבת סימולציה =====
     כל שינוי נכנס ל-SIM ולא נוגע בביזיבוקס. הציר מתעדכן חי, ורק "שמירה"
     כותבת. ככה הלקוח משחק — מזיז תאריכים, בוחר ספקים — ורואה מה יוצא. */
  const SIM={inc:{}, exp:{}, pay:new Set()};   // inc/exp: id → תאריך חדש · pay: תשלומים שנבחרו
  const simCount=()=>Object.keys(SIM.inc).length+Object.keys(SIM.exp).length+SIM.pay.size;
  function simReset(){ SIM.inc={}; SIM.exp={}; SIM.pay=new Set(); MAT_PAYSEL=new Set(); toast('הסימולציה אופסה — חזרנו למצב הנוכחי'); renderEntriesView(); }
  function simSave(){
    const n=simCount(); if(!n) return;
    Object.entries(SIM.inc).forEach(([id,d])=>{ const r=MAT_INC.find(x=>x.id===id); if(r){ r.d=d+'.2026'; r.st='flow'; } });
    Object.entries(SIM.exp).forEach(([id,d])=>{ const r=MAT_EXP.find(x=>x.id===id); if(r) r.d=d+'.2026'; });
    MAT_EXP.forEach(r=>{ if(SIM.pay.has(r.id)) r.st='flow'; });
    SIM.inc={}; SIM.exp={}; SIM.pay=new Set(); MAT_PAYSEL=new Set();
    toast((n===1?'שינוי אחד נשמר ונכתב':n+' שינויים נשמרו ונכתבו')+' לביזיבוקס — התזרים עודכן');
    renderEntriesView();
  }
  /* התאריך האפקטיבי של פריט הכנסה — כולל סימולציה */
  const simD=r=>SIM.inc[r.id]||r.d.slice(0,5);
  const simSt=r=>SIM.inc[r.id]?'sim':r.st;
  function matToward(day){
    return MAT_INC.filter(r=>simSt(r)!=='nodate'&&simD(r)===day).reduce((s,r)=>s+r.a,0);
  }
  function simBar(){
    const n=simCount();
    return n?`<div class="simbar"><span class="sb-ic">⚗</span>
      <b>${n===1?'שינוי אחד':n+' שינויים'} בסימולציה</b><span class="sb-t">עוד לא נכתבו לביזיבוקס — אפשר להמשיך לשחק</span>
      <button class="ot-btn done sm" onclick="simSave()">שמירה לביזיבוקס</button>
      <button class="gb-clr" onclick="simReset()">איפוס</button></div>`:'';
  }
  /* הקטגוריות מגיעות מרשימת המורשות של החברה (ניהול קטגוריות) — לא הקלדה חופשית */
  const MAT_ALLCATS=['הכנסות ממכירות - מזומן','הכנסות ממכירות - סליקה','הכנסות מסליקה - דיירקט','הכנסות ממכירות - אלקטרה','הכנסות - חברות שילוח'];
  function matCatPop(){ const e=document.getElementById('mcPop'); if(e) e.classList.toggle('show'); }
  function matCatTg(c){
    const i=MAT_CATS.indexOf(c);
    i<0?MAT_CATS.push(c):(MAT_CATS.length>1&&MAT_CATS.splice(i,1));
    renderEntriesView();
  }
  /* ציר התזרים — יתרה צפויה לשבוע. חור = יתרה שלילית; שם צריך לגבות. */
  const MAT_WEEKS=[
    {w:'04.08', bal: 42000}, {w:'11.08', bal: 28000}, {w:'18.08', bal: 51000}, {w:'25.08', bal: 33000},
    {w:'01.09', bal: 12000}, {w:'08.09', bal:-22000}, {w:'15.09', bal:-8000},  {w:'22.09', bal: 16000},
    {w:'29.09', bal: 24000}, {w:'06.10', bal:-14000}, {w:'13.10', bal: 9000},  {w:'20.10', bal: 21000},
  ];
  /* ===== עוזרים משותפים לשני הצירים (הכנסות + הוצאות) ===== */
  const MAT_NOW='18.08';
  const MON_AB={'01':'ינו','02':'פבר','03':'מרץ','04':'אפר','05':'מאי','06':'יונ','07':'יול','08':'אוג','09':'ספט','10':'אוק','11':'נוב','12':'דצמ'};
  const dnum=d=>{const a=d.split('.'); return new Date(2026,+a[1]-1,+a[0]);};
  const dTo=d=>Math.round((dnum(d)-dnum(MAT_NOW))/864e5);
  const dkey=d=>d.slice(3,5)+d.slice(0,2);
  const DOW=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  /* יתרה צפויה בבנק ליום — מהתזרים השבועי, מוזזת לפי מה שהוזז בסימולציה */
  function balAt(d){
    let b=MAT_WEEKS[0].bal;
    MAT_WEEKS.forEach(w=>{ if(dkey(w.w.slice(0,5))<=dkey(d)) b=w.bal; });
    Object.entries(SIM.inc).forEach(([id,nd])=>{
      const r=MAT_INC.find(x=>x.id===id); if(!r) return;
      const inFlow=r.st==='flow'||r.st==='done';
      const od=inFlow&&r.d?r.d.slice(0,5):null;
      if(dkey(nd)<=dkey(d)) b+=r.a;
      if(od&&dkey(od)<=dkey(d)) b-=r.a;
    });
    return Math.round(b);
  }
  function matSim(id,day){ SIM.inc[id]=day; renderEntriesView(); }
  /* עמידה על תאריך בציר → השורות של אותו תאריך מוארות בטבלה (בלי רינדור מחדש) */
  function matHover(day){
    document.querySelectorAll('.mt-r.hl').forEach(e=>e.classList.remove('hl'));
    if(!day) return;
    document.querySelectorAll('.mt-r[data-d="'+day+'"]').forEach(e=>e.classList.add('hl'));
  }
  /* ===== גרירה: שורה מהטבלה ← תאריך על הציר =====
     זו התנועה שהופכת את המסך למשחק: גוררים, רואים את החור נסגר, ורק בסוף שומרים. */
  let DRAG=null;
  function matDragStart(ev,id){
    DRAG=id; document.body.classList.add('dragging'); document.body.classList.add('is-dragging');
    try{ ev.dataTransfer.setData('text/plain',id); ev.dataTransfer.effectAllowed='move'; }catch(e){}
  }
  function matDragEnd(){ DRAG=null; document.body.classList.remove('dragging'); document.body.classList.remove('is-dragging');
    document.querySelectorAll('.over,.is-over').forEach(e=>e.classList.remove('over','is-over')); }
  function matDragOver(ev,el){ ev.preventDefault(); el.classList.add('over'); el.classList.add('is-over'); }
  function matDragLeave(el){ el.classList.remove('over'); el.classList.remove('is-over'); }
  function matDrop(ev,day){
    ev.preventDefault();
    const id=DRAG||(ev.dataTransfer&&ev.dataTransfer.getData('text/plain'));
    matDragEnd();
    if(!id) return;
    if(ENT_MODE==='exp'){
      const r=MAT_EXP.find(x=>x.id===id); if(!r) return;
      SIM.exp[id]=day;
      toast(r.sup+' · '+r.a.toLocaleString()+' ₪ נדחה ל-'+day+' — בסימולציה');
      return renderEntriesView();
    }
    const r=MAT_INC.find(x=>x.id===id); if(!r) return;
    SIM.inc[id]=day;
    toast(r.cust+' · '+r.a.toLocaleString()+' ₪ הועבר ל-'+day+' — בסימולציה');
    renderEntriesView();
  }
  function matDropOff(ev){   // גרירה חזרה לרשימה = ביטול התזמון
    ev.preventDefault();
    const id=DRAG||(ev.dataTransfer&&ev.dataTransfer.getData('text/plain'));
    matDragEnd();
    if(id&&SIM.inc[id]){ delete SIM.inc[id]; renderEntriesView(); toast('התזמון בוטל'); }
  }
  function matSimUndo(id){ delete SIM.inc[id]; delete SIM.exp[id]; renderEntriesView(); }
  function matWeekPick(i){ MAT_WEEK=(MAT_WEEK===i?null:i); renderEntriesView(); }
  function matRowEdit(i){ MAT_ROWEDIT=i; renderEntriesView(); }
  function matRowCancel(){ MAT_ROWEDIT=null; renderEntriesView(); }
  function matRowSave(i){
    const g=id=>{const e=document.getElementById(id);return e?e.value.trim():'';};
    const r=MAT_INC[i], nd=g('mrD'), nc=g('mrC'), ndesc=g('mrT'), na=g('mrA').replace(/,/g,'');
    if(!nc||!na){toast('צריך לקוח וסכום');return;}
    if(nd&&nd!==r.d.slice(0,5)){ r.d=(nd.length===5?nd+'.2026':nd); if(r.st==='nodate') r.st='flow'; }
    r.cust=nc; r.desc=ndesc; r.a=+na||r.a;
    MAT_ROWEDIT=null; renderEntriesView();
    toast('עודכן — התנועה בתזרים עודכנה מיד · '+r.id);
  }
  function renderMatInc(){
    const sum=a=>a.reduce((s,r)=>s+r.a,0);
    const nod=MAT_INC.filter(r=>r.st==='nodate'&&!SIM.inc[r.id]);
    const holes=MAT_WEEKS.filter(w=>w.bal<0);
    const hole=MAT_WEEK!=null?MAT_WEEKS[MAT_WEEK]:null;
    /* ציר לצד הטבלה: הציר = יעדי הגבייה + מי כבר נחת עליהם (צ'יפ נגרר).
       הטבלה = כל החומר, וממנה גוררים אל הציר. */
    const map={};
    MAT_INC.forEach(r=>{ if(r.st==='nodate'&&!SIM.inc[r.id])return;
      const d=simD(r); (map[d]=map[d]||{d,in:[],need:0}).in.push(r); });
    holes.forEach(w=>{ const d=w.w.slice(0,5);
      (map[d]=map[d]||{d,in:[],need:0}).need=Math.abs(w.bal); map[d].wi=MAT_WEEKS.indexOf(w); });
    const key=d=>d.slice(3,5)+d.slice(0,2);
    const list=Object.values(map).sort((a,b)=>key(a.d)<key(b.d)?-1:1);
    /* ===== הציר (D4) — קו האפס: ימין = הפער שחסר, שמאל = מה שכבר משובץ.
       סקאלה ליניארית אחת לשני הצדדים, אפס כרטיסיות, הצל היחיד הוא על הצ'יפ. ===== */
    /* מה שכבר בתזרים כבר מגולם ביתרה הצפויה — ולכן לא "סוגר" את החור.
       את החור סוגר רק מה שהמשתמש שיבץ לכאן עכשיו (גרירה = שינוי בתזרים). */
    const isNew=r=>!!SIM.inc[r.id];
    const gotOf=x=>x.need>0?x.in.filter(isNew).reduce((s,r)=>s+r.a,0):sum(x.in);
    const MX=Math.max(1,...list.map(x=>Math.max(x.need,gotOf(x))));
    const W=v=>(Math.max(v,0)/MX).toFixed(4);
    /* מה שנותר לסגור ביום = היתרה המסומלצת אם היא עדיין שלילית.
       ככה עודף שנגבה מוקדם סוגר מעצמו חורים מאוחרים — בדיוק כמו בתזרים. */
    const leftOf=x=>Math.max(0,-balAt(x.d));
    const gapsL=list.filter(x=>x.need>0&&leftOf(x)>0);
    const lastD=list.length?list[list.length-1].d:'30.09';
    const perTxt='עד '+(+lastD.split('.')[0])+' ב'+(HE_MONTHS[lastD.split('.')[1]]||'');
    const missTot=gapsL.reduce((s,x)=>s+leftOf(x),0);
    const needTot=list.reduce((s,x)=>s+x.need,0);
    const gotTot=Math.max(0,needTot-missTot);
    const chipH=(r,dim)=>{const isSim=!!SIM.inc[r.id];
      return `<button class="chip ${r.st==='late'?'t-late':''} ${isSim?'is-sim':''} ${dim&&!isSim?'in-flow':''}" draggable="true"
        style="--w:${W(r.a)}" ondragstart="matDragStart(event,'${r.id}')" ondragend="matDragEnd()"
        onmouseenter="matHover('${simD(r)}')" onmouseleave="matHover(null)"
        title="${(r.desc||'').replace(/"/g,'')}${dim&&!isSim?' · כבר בתזרים — כבר מגולם ביתרה':''} · גרירה לתאריך אחר">
        <span class="grip"></span><span class="nm">${r.cust}</span><span class="am n">${r.a.toLocaleString()}</span>
        ${isSim?`<span class="ux" onclick="event.stopPropagation();event.preventDefault();matSimUndo('${r.id}')">✕</span>`:''}</button>`;};
    const nodeH=x=>{
      const got=gotOf(x), need=x.need, hasNeed=need>0;
      const left=hasNeed?leftOf(x):0;
      const cov=hasNeed&&left===0, gap=hasNeed&&left>0;
      const carry=cov?Math.max(0,need-got):0;   /* מה שנסגר מעודף של תאריך מוקדם יותר */
      const lateN=x.in.filter(r=>r.st==='late').length;
      const cls=gap?'is-gap':cov?'is-covered':'is-in';
      const open=MAT_MORE.has(x.d), many=x.in.length>5;
      const dt=dTo(x.d), a=x.d.split('.');
      const eta=dt<0?'':dt===0?'היום':dt===1?'מחר':'בעוד '+dt+' ימים';
      const pl=(n,one,many)=>n===1?one:n+' '+many;
      const bal=balAt(x.d);
      return `<article class="hkt-node ${cls} ${lateN?'is-late':''} ${gap&&!x.in.length?'is-empty':''} ${hasNeed&&MAT_WEEK===x.wi?'is-sel':''} ${dt<0&&!lateN?'is-past':''}"
        data-drop tabindex="0" style="--p:${hasNeed?Math.min(got/need,1).toFixed(3):0}"
        onmouseenter="matHover('${x.d}')" onmouseleave="matHover(null)"
        ondragover="matDragOver(event,this)" ondragleave="matDragLeave(this)" ondrop="matDrop(event,'${x.d}')"
        ${hasNeed?`onclick="matWeekPick(${x.wi})"`:''}>
        <div class="hkt-when">
          <div class="w-d">${+a[0]}<em>${MON_AB[a[1]]||''}׳</em></div>
          <div class="w-bal ${bal<0?'neg':''}">יתרה <span class="n">${bal.toLocaleString()}</span></div>
          ${gap&&eta?`<div class="w-eta ${dt<=3?'urgent':''}">${eta}</div>`:''}
        </div>
        <div class="hkt-neg">${gap?`<div class="w-gap" style="--w:${W(left)}"></div>`:''}</div>
        <div class="hkt-mark"><i></i></div>
        <div class="hkt-need">${gap?`<span class="miss">חסר <span class="n">${left.toLocaleString()}</span></span>`
                              :cov?`<span class="okm">מכוסה</span>`:''}</div>
        <div class="hkt-pos">
          <div class="hkt-trk" style="--need:${W(hasNeed?need:got)}">
            <div class="hkt-fill" style="--have:${W(hasNeed?Math.min(got+carry,need):got)}">${(hasNeed?x.in.filter(isNew):x.in).map(r=>`<i style="--w:${W(r.a)}"></i>`).join('')}${carry?`<i class="carry" style="--w:${W(carry)}"></i>`:''}</div>
          </div>
          ${hasNeed?`<span class="hkt-cap">נדרש <b class="n">${need.toLocaleString()}</b>${cov&&!got?' · נסגר מעודף קודם':''}</span>`:''}
        </div>
        <div class="hkt-body">
          ${x.in.length?`<div class="hkt-chips ${many&&!open?'is-clamped':''}">${x.in.map(r=>chipH(r,hasNeed)).join('')}</div>`:''}
          ${many?`<button class="hkt-more" onclick="event.stopPropagation();matMore('${x.d}')">${open?'הצגה מקוצרת':'עוד '+(x.in.length-5)+' תקבולים'}</button>`:''}
          <div class="hkt-pad"><span>${gap?'שחררו כאן — יסגור '+left.toLocaleString():'שחררו כאן'}</span></div>
        </div>
      </article>`;};
    let curMon='', shownNow=false, axis='';
    list.forEach(x=>{
      const mo=x.d.slice(3,5);
      if(mo!==curMon){ curMon=mo; axis+=`<div class="hkt-mon"><b>${HE_MONTHS[mo]||''}</b></div>`; }
      if(!shownNow&&dTo(x.d)>0){ shownNow=true; axis+=`<div class="hkt-now"><b>היום · ${MAT_NOW}</b></div>`; }
      axis+=nodeH(x);
    });
    const rowH=r=>{
      const i=MAT_INC.indexOf(r), isSim=!!SIM.inc[r.id];
      const st=isSim?'<span class="ent-st simst">⚗ מתוזמן</span>'
        :r.st==='nodate'?`<button class="ent-rec" onclick="matSim('${r.id}','${r.rec.slice(0,5)}')" title="${r.recWhy}">✦ ${r.rec.slice(0,5)}</button>`
        :r.st==='new'?`<button class="ot-btn done xs" onclick="matOkInc(${i})">אישור</button>`
        :r.st==='late'?`<span class="ent-late-btn">⚠ ${r.days} ימים</span>`
        :r.st==='done'?'<span class="ent-st exec">● בוצע</span>':'<span class="ent-st ok">✓ בתזרים</span>';
      const dd=isSim?SIM.inc[r.id]:(r.d?r.d.slice(0,5):'');
      return `<div class="mt-r drg" data-d="${dd}" draggable="true" ondragstart="matDragStart(event,'${r.id}')" ondragend="matDragEnd()" title="גרירה לתאריך בציר">
        <span class="mt-d ${r.st==='late'?'lateD':''} ${isSim?'sim':''}">${dd||'—'}</span>
        <span class="mt-c"><b>${r.cust}</b><small>${r.desc}</small></span>
        <span class="mt-a">${r.a.toLocaleString()}</span>
        <span class="mt-src"><i class="ent-src ${r.src==='אוטומציה'?'auto':''}">${r.src}</i></span>
        <span class="mt-s">${st}</span></div>`;};
    const ordered=[...MAT_INC].sort((a,b)=>{
      const ka=SIM.inc[a.id]||(a.st==='nodate'?'99.99':a.d.slice(0,5));
      const kb=SIM.inc[b.id]||(b.st==='nodate'?'99.99':b.d.slice(0,5));
      return key(ka)<key(kb)?-1:1;});
    return simBar()+`<div class="mat4">
      <div class="mat-tbl wide">
        <div class="mat-cats">
          ${MAT_CATS.map(c=>`<button class="mc-chip on" onclick="matCatTg('${c}')">✓ ${c}</button>`).join('')}
          <span class="mc-pickw"><button class="mc-more" onclick="matCatPop()">＋ קטגוריה</button>
            <div class="mc-pop" id="mcPop"><div class="mc-pop-h">קטגוריות מורשות של החברה</div>
              ${MAT_ALLCATS.filter(c=>!MAT_CATS.includes(c)).map(c=>`<button onclick="matCatTg('${c}');matCatPop()">${c}</button>`).join('')||'<div class="mc-pop-e">הכל מחובר</div>'}
              <div class="mc-pop-f">הרשימה נקבעת ב<b>ניהול קטגוריות</b></div></div></span>
          <button class="mt-add" onclick="matAddTg()">＋ הוספת תקבול</button>
          <span class="mat-status">גרירת שורה אל תאריך בציר ←</span>
        </div>
        ${MAT_ADD?`<div class="mt-addrow">
          <input class="ent-inp edd" id="maD" placeholder="dd.mm · ריק=ללא מועד">
          <input class="ent-inp" id="maC" placeholder="לקוח">
          <input class="ent-inp" id="maT" placeholder="חשבונית / תיאור">
          <input class="ent-inp num" id="maA" placeholder="סכום">
          <button class="ot-btn done xs" onclick="matAddGo()">הוספה</button>
          <button class="mt-btn view xs" onclick="matAddTg()">ביטול</button>
        </div>`:''}
        <div class="mt-list" ondragover="event.preventDefault()" ondrop="matDropOff(event)">
          ${ordered.map(rowH).join('')}
        </div>
      </div>
      <aside class="mat-axis2 v4"><section class="hkt" dir="rtl" aria-label="ציר התזרים">
        <header class="hkt-hd">
          <div class="hd-line">
            <span class="hd-lbl">חסר לכיסוי</span>
            <span class="hd-fig"><span class="n">${missTot.toLocaleString()}</span><span class="c">₪</span></span>
            ${gapsL.length?`<span class="hd-risk"><i></i>${gapsL.length} בסיכון · ${gapsL[0].d}</span>`:''}
          </div>
          <div class="hd-bar" style="--w:${needTot?(gotTot/needTot).toFixed(3):0}"><i></i></div>
          <div class="hd-lg"><span>שובץ <b class="n">${gotTot.toLocaleString()}</b></span><span>נדרש <b class="n">${needTot.toLocaleString()}</b></span></div>
        </header>
        <div class="hkt-pool ${nod.length?'':'is-empty'}" ondragover="matDragOver(event,this)" ondragleave="matDragLeave(this)" ondrop="matDropOff(event)">
          <span class="pool-t">ללא תאריך <b>${nod.length}</b></span>
          ${nod.length?`<div class="pool-rail">${nod.map(chipH).join('')}</div>`
                      :'<span class="pool-hint">הכל מתוזמן</span>'}
        </div>
        <div class="hkt-scroll"><div class="hkt-track">
          ${axis}
          <div class="hkt-end"><i></i><span>סוף התקופה · ${lastD}</span></div>
        </div></div>
      </section></aside>
    </div>`;
  }
  /* הוצאות = אותו מנגנון הפוך: כמה אפשר לשלם בכל תאריך, והלקוח בוחר ספקים.
     המסר: לא "שלם ואז תראה מה קרה" אלא "זו התקרה — תעדף בתוכה". */
  const MAT_EXP=[
    {id:'bz-5a11', d:'10.08.2026', sup:'לדובק הפצה', desc:'סחורה יולי',        a:8400,  pay:'העברה', st:'flow'},
    {id:'bz-5a12', d:'15.08.2026', sup:'ספק אריזות', desc:'הזמנה חדשה',        a:5200,  pay:'שיק · 21044', st:'new'},
    {id:'bz-5a13', d:'20.08.2026', sup:'יועץ שיווק',  desc:'ריטיינר',           a:3000,  pay:'העברה', st:'new'},
    {id:'bz-5a14', d:'25.08.2026', sup:'פלסט-גל',     desc:'חומרי גלם',         a:7500,  pay:'שיק · 21045', st:'new'},
    {id:'bz-5a15', d:'25.08.2026', sup:'מס הכנסה',    desc:'מקדמות',            a:11400, pay:'העברה', st:'new', must:true},
    {id:'bz-5a16', d:'25.08.2026', sup:'ביטוח לאומי', desc:'ניכויים',           a:9800,  pay:'העברה', st:'new', must:true},
    {id:'bz-5a17', d:'25.08.2026', sup:'ספק משנה ר.לוי', desc:'עבודות גמר',     a:12000, pay:'העברה', st:'new'},
    {id:'bz-5a18', d:'28.08.2026', sup:'שכירות מחסן', desc:'חודשי',             a:6450,  pay:'העברה', st:'new'},
    {id:'bz-5a19', d:'10.09.2026', sup:'פלסט-גל',     desc:'שיק דחוי',          a:7500,  pay:'שיק · 21046', st:'new', must:true},
    {id:'bz-5a20', d:'10.09.2026', sup:'לדובק הפצה',  desc:'סחורה אוגוסט',      a:8400,  pay:'העברה', st:'new'},
    {id:'bz-5a21', d:'10.09.2026', sup:'חשמל — חח״י', desc:'דו-חודשי',          a:5200,  pay:'הו״ק', st:'new', must:true},
    {id:'bz-5a22', d:'25.09.2026', sup:'מס הכנסה',    desc:'מקדמות',            a:11400, pay:'העברה', st:'new', must:true},
    {id:'bz-5a23', d:'25.09.2026', sup:'ספק אריזות',  desc:'הזמנה 88',          a:6100,  pay:'העברה', st:'new'},
  ];
  /* תקרת תשלום לכל תאריך — נגזרת מהתזרים: כמה אפשר לשלם בלי להיכנס למינוס */
  const MAT_CAPS=[{d:'25.08',cap:50000},{d:'10.09',cap:28000},{d:'25.09',cap:41000}];
  const MAT_CAP=Object.fromEntries(MAT_CAPS.map(c=>[c.d,c.cap]));
  let MAT_PAYSEL=new Set(), MAT_CAPDAY='25.08';
  function matCapPick(d){ MAT_CAPDAY=d; MAT_PAYSEL=new Set(); renderEntriesView(); }
  function matPayTg(id){ SIM.pay.has(id)?SIM.pay.delete(id):SIM.pay.add(id); MAT_PAYSEL=SIM.pay; renderEntriesView(); }
  function matPayGo(){
    const n=MAT_PAYSEL.size; if(!n) return;
    MAT_EXP.forEach(r=>{ if(MAT_PAYSEL.has(r.id)) r.st='flow'; });
    MAT_PAYSEL=new Set();
    toast(n+' תשלומים אושרו ל-'+MAT_CAPDAY+' — נצבעו בתזרים');
    renderEntriesView();
  }
  /* ===== הציר בהוצאות — התמונה הראית של ההכנסות =====
     בהכנסות הקו הוא האפס והפער יוצא ימינה. כאן הקו הוא **התקרה**:
     שמאלה ממנו נערם מה ששובצת לתשלום, וימינה יוצאת החריגה — מה שלא נכנס
     בתוך מה שהתזרים מרשה. אותה סקאלה, אותה גרירה, אותה סימולציה. */
  const simDE=r=>SIM.exp[r.id]||r.d.slice(0,5);
  function renderMatExp(){
    const sum=a=>a.reduce((s,r)=>s+r.a,0);
    const onOf=r=>r.must||SIM.pay.has(r.id);
    /* צמתים: כל תאריך שיש בו תקרה או תשלומים */
    const map={};
    MAT_EXP.forEach(r=>{ const d=simDE(r); (map[d]=map[d]||{d,in:[]}).in.push(r); });
    MAT_CAPS.forEach(c=>{ map[c.d]=map[c.d]||{d:c.d,in:[]}; });
    /* התקרה נגזרת מהתזרים: מה שאפשר לשלם ביום = היתרה הצפויה שם. אין יתרה — אין יכולת. */
    const list=Object.values(map).sort((a,b)=>dkey(a.d)<dkey(b.d)?-1:1);
    list.forEach(x=>{ x.cap=Math.max(0,balAt(x.d)); });
    const usedOf=x=>x.in.filter(onOf).reduce((s,r)=>s+r.a,0);
    const overOf=x=>Math.max(0,usedOf(x)-x.cap);
    const MX=Math.max(1,...list.map(x=>Math.max(x.cap,usedOf(x),sum(x.in))));
    const W=v=>(Math.max(v,0)/MX).toFixed(4);
    const overL=list.filter(x=>overOf(x)>0);
    const lastD=list.length?list[list.length-1].d:'30.09';
    const perTxt='עד '+(+lastD.split('.')[0])+' ב'+(HE_MONTHS[lastD.split('.')[1]]||'');
    const overTot=overL.reduce((s,x)=>s+overOf(x),0);
    const capTot=list.reduce((s,x)=>s+x.cap,0);
    const usedTot=list.reduce((s,x)=>s+Math.min(usedOf(x),x.cap||usedOf(x)),0);
    const leftTot=list.reduce((s,x)=>s+(x.cap>0?Math.max(0,x.cap-usedOf(x)):0),0);
    const waitTot=sum(MAT_EXP.filter(r=>!onOf(r)));

    const chipE=r=>{const on=onOf(r), moved=!!SIM.exp[r.id];
      return `<button class="chip pay ${on?'is-on':''} ${r.must?'is-must':''} ${moved?'is-sim':''}" draggable="true"
        style="--w:${W(r.a)}" ondragstart="matDragStart(event,'${r.id}')" ondragend="matDragEnd()"
        onclick="event.stopPropagation();${r.must?"toast('חיוב חובה — נעול, תופס מהתקרה אוטומטית')":`matPayTg('${r.id}')`}"
        onmouseenter="matHover('${simDE(r)}')" onmouseleave="matHover(null)"
        title="${r.desc} · ${r.pay}${r.must?' · חובה':''} · גרירה לתאריך אחר">
        <span class="pchk ${on?'on':''} ${r.must?'lock':''}"></span>
        <span class="nm">${r.sup}</span><span class="am n">${r.a.toLocaleString()}</span>
        ${moved?`<span class="ux" onclick="event.stopPropagation();event.preventDefault();matSimUndo('${r.id}')">✕</span>`:''}</button>`;};

    const nodeE=x=>{
      const used=usedOf(x), cap=x.cap, hasCap=cap>0, over=overOf(x);
      const cls=over>0?'is-gap':used>0?'is-covered':'is-in';
      const open=MAT_MORE.has(x.d), many=x.in.length>5;
      const dt=dTo(x.d), a=x.d.split('.'), bal=balAt(x.d);
      const eta=dt<0?'':dt===0?'היום':dt===1?'מחר':'בעוד '+dt+' ימים';
      const on=x.in.filter(onOf);
      return `<article class="hkt-node exp ${cls} ${hasCap&&!on.length?'is-empty':''} ${MAT_CAPDAY===x.d?'is-sel':''} ${dt<0?'is-past':''}"
        data-drop tabindex="0" style="--p:${hasCap?Math.min(used/cap,1).toFixed(3):0}"
        onmouseenter="matHover('${x.d}')" onmouseleave="matHover(null)"
        ondragover="matDragOver(event,this)" ondragleave="matDragLeave(this)" ondrop="matDrop(event,'${x.d}')"
        ${hasCap?`onclick="matCapPick('${x.d}')"`:''}>
        <div class="hkt-when">
          <div class="w-d">${+a[0]}<em>${MON_AB[a[1]]||''}׳</em></div>
          <div class="w-bal ${bal<0?'neg':''}">יתרה <span class="n">${bal.toLocaleString()}</span></div>
          ${over>0&&eta?`<div class="w-eta ${dt<=3?'urgent':''}">${eta}</div>`:''}
        </div>
        <div class="hkt-neg">${over>0?`<div class="w-gap" style="--w:${W(over)}"></div>`:''}</div>
        <div class="hkt-mark"><i></i></div>
        <div class="hkt-need">${over>0?`<span class="miss">חריגה <span class="n">${over.toLocaleString()}</span></span>`
          :used>0?`<span class="okm">נשאר <span class="n">${(cap-used).toLocaleString()}</span></span>`:''}</div>
        <div class="hkt-pos">
          <div class="hkt-trk" style="--need:${W(hasCap?cap:used)}">
            <div class="hkt-fill" style="--have:${W(hasCap?Math.min(used,cap):used)}">${on.map(r=>`<i class="${r.must?'must':''}" style="--w:${W(r.a)}"></i>`).join('')}</div>
          </div>
          <span class="hkt-cap">${hasCap?`תקרה <b class="n">${cap.toLocaleString()}</b>`:'אין יכולת תשלום ביום הזה'}</span>
        </div>
        <div class="hkt-body">
          ${x.in.length?`<div class="hkt-chips ${many&&!open?'is-clamped':''}">${x.in.map(chipE).join('')}</div>`:''}
          ${many?`<button class="hkt-more" onclick="event.stopPropagation();matMore('${x.d}')">${open?'הצגה מקוצרת':'עוד '+(x.in.length-5)+' תשלומים'}</button>`:''}
          <div class="hkt-pad"><span>${over>0?'שחררו כאן — עדיין חורג '+over.toLocaleString():'שחררו כאן — דחיית תשלום לתאריך הזה'}</span></div>
        </div>
      </article>`;};

    let curMon='', shownNow=false, axis='';
    list.forEach(x=>{
      const mo=x.d.slice(3,5);
      if(mo!==curMon){ curMon=mo; axis+=`<div class="hkt-mon"><b>${HE_MONTHS[mo]||''}</b></div>`; }
      if(!shownNow&&dTo(x.d)>0){ shownNow=true; axis+=`<div class="hkt-now"><b>היום · ${MAT_NOW}</b></div>`; }
      axis+=nodeE(x);
    });

    /* הטבלה — כל התשלומים, וממנה גוררים אל הציר */
    const rowE=r=>{
      const on=onOf(r), moved=!!SIM.exp[r.id], d=simDE(r);
      return `<div class="mt-r pay drg ${on?'on':''}" data-d="${d}" draggable="true"
        ondragstart="matDragStart(event,'${r.id}')" ondragend="matDragEnd()"
        onclick="${r.must?"toast('חיוב חובה — נעול')":`matPayTg('${r.id}')`}" title="גרירה לתאריך בציר">
        <span class="fchk ${on?'on':''} ${r.must?'lock':''}">${r.must?'🔒':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4"><path d="M20 6 9 17l-5-5"/></svg>'}</span>
        <span class="mt-d ${moved?'sim':''}">${d}</span>
        <span class="mt-c"><b>${r.sup}</b><small>${r.desc}</small></span>
        <span class="mt-a">${r.a.toLocaleString()}</span>
        <span class="mt-src"><i class="ent-src">${r.pay}</i></span>
        <span class="mt-s">${r.must?'<span class="pay-must">חובה</span>':on?'<span class="ent-st ok">✓ לתשלום</span>':'<span class="ent-st wait">לא שובץ</span>'}</span></div>`;};
    const ordered=[...MAT_EXP].sort((a,b)=>dkey(simDE(a))<dkey(simDE(b))?-1:1);

    return simBar()+`<div class="mat4">
      <div class="mat-tbl wide">
        <div class="mat-cats">
          <span class="mat-hd">בחרו מה משלמים — הציר מראה כמה התזרים מרשה בכל תאריך</span>
          <span class="mat-status">גרירת שורה אל תאריך בציר = דחיית תשלום ←</span>
        </div>
        <div class="mt-list">${ordered.map(rowE).join('')}</div>
      </div>
      <aside class="mat-axis2 v4"><section class="hkt exp" dir="rtl" aria-label="ציר התשלומים">
        <header class="hkt-hd">
          <div class="hd-line">
            <span class="hd-lbl">${overTot?'מעל היכולת':'נשאר לתשלום'}</span>
            <span class="hd-fig ${overTot?'bad':'good'}"><span class="n">${(overTot||leftTot).toLocaleString()}</span><span class="c">₪</span></span>
            ${overL.length?`<span class="hd-risk"><i></i>${overL.length} בחריגה · ${overL[0].d}</span>`
                          :`<span class="hd-ok">✓ ${perTxt}</span>`}
          </div>
          <div class="hd-bar" style="--w:${capTot?(usedTot/capTot).toFixed(3):0}"><i></i></div>
          <div class="hd-lg"><span>משובץ <b class="n">${usedTot.toLocaleString()}</b></span><span>תקרה <b class="n">${capTot.toLocaleString()}</b></span></div>
        </header>
        <div class="hkt-pool">
          <span class="pool-t">לא שובצו <b>${MAT_EXP.filter(r=>!onOf(r)).length}</b></span>
          <span class="pool-s"><span class="n">${waitTot.toLocaleString()}</span> ₪</span>
          <span class="pool-hint">לחיצה על תשלום בציר משבצת אותו</span>
        </div>
        <div class="hkt-scroll"><div class="hkt-track">
          ${axis}
          <div class="hkt-end"><i></i><span>סוף התקופה · ${lastD}</span></div>
        </div></div>
      </section></aside>
    </div>`;
  }
  function renderEntriesView(){
    const el=document.getElementById('viewEntries'); if(!el)return;
    const expNames=Object.keys(DATA_TABLES).filter(n=>!n.includes('תקבולים'));
    el.innerHTML=`<div class="ent">
      <div class="ent-head">
        <div><div class="ent-ttl">ניהול חומר — ${CLIENTS[CUR]?CLIENTS[CUR].name:''}</div>
          <div class="ent-sub">${ENT_MODE==='inc'?'חלון על קטגוריות ההכנסה — סנכרון דו-כיווני עם התזרים: שינוי כאן משנה את התזרים, ולהפך':'צפי תשלומים קדימה — התאריך של השורה קובע את החודש'}</div></div>
        <div class="ent-acts">
          <button class="mt-btn sm" onclick="toast('הבוט שלח לקבוצה קישור — נפתח במובייל')">📱 שליחת קישור</button>
          <button class="mt-btn view sm" onclick="window.open('entry-mobile.html','_blank')">תצוגת הלקוח</button>
        </div>
      </div>
      <div class="ent-mode">
        <button class="${ENT_MODE==='inc'?'on':''}" onclick="ENT_MODE='inc';renderEntriesView()">הכנסות</button>
        <button class="${ENT_MODE==='exp'?'on':''}" onclick="ENT_MODE='exp';renderEntriesView()">הוצאות</button>
      </div>
      ${ENT_MODE==='inc'?renderMatInc():ENT_MODE==='exp'?renderMatExp():`
      <div class="ent-filters" style="margin:0 2px 12px">
        <button class="ent-f appr ${ENT_TAB==='new'?'on':''}" onclick="ENT_TAB='new';renderEntriesView()">לאישור <i>${expNames.reduce((s,n)=>s+DATA_TABLES[n].rows.filter(r=>r.st==='new').length,0)}</i></button>
        <button class="ent-f ${ENT_TAB==='live'?'on':''}" onclick="ENT_TAB='live';renderEntriesView()">פעילות</button>
        <button class="ent-f ${ENT_TAB==='nodate'?'on':''}" onclick="ENT_TAB='nodate';renderEntriesView()">ללא מועד <i>${expNames.reduce((s,n)=>s+DATA_TABLES[n].rows.filter(r=>r.st==='nodate').length,0)}</i></button>
        <button class="ent-f ${ENT_TAB==='done'?'on':''}" onclick="ENT_TAB='done';renderEntriesView()">בוצעו</button>
        <button class="ent-f ${ENT_TAB==='all'?'on':''}" onclick="ENT_TAB='all';renderEntriesView()">הכל</button>
      </div>
      <div class="ent-2cols" style="grid-template-columns:1fr">${expNames.map(entColHtml).join('')}</div>`}
    </div>`;
  }
  const ENT_TYPE2={in:'העברה',out:'העברה'};
  function entTypeCycle2(key,btn){
    ENT_TYPE2[key]=ENT_TYPE2[key]==='העברה'?'שיק':'העברה';
    btn.textContent=ENT_TYPE2[key]+' ↺';
    const r=document.getElementById('entRef_'+key); if(r)r.style.display=ENT_TYPE2[key]==='שיק'?'':'none';
  }
  /* עריכת שורה קיימת: לחיצה על ✎ הופכת את השורה לטופס במקומה.
     עריכת מנהל נצבעת מיד מחדש (הוא הסמכות) — עם תיעוד "עודכן ישן ← חדש". */
  let ENT_EDIT=null;
  function entEditStart(name,ix){ ENT_EDIT={name,ix}; renderEntriesView(); }
  function entEditCancel(){ ENT_EDIT=null; renderEntriesView(); }
  function entEditSave(){
    if(!ENT_EDIT) return;
    const r=DATA_TABLES[ENT_EDIT.name].rows[ENT_EDIT.ix];
    const gv=id=>{const e=document.getElementById(id);return e?e.value.trim():'';};
    const nd=gv('entEdD'), nt=gv('entEdT'), na=gv('entEdA'), nr=gv('entEdR');
    if(!nt||!na){toast('צריך תיאור וסכום');return;}
    if(r.pay==='שיק'&&!nr){toast('שיק חייב אסמכתא');return;}
    if(na!==r.a) r.edit=r.a+' ← '+na;
    if(nd) r.d=(nd.length===5?nd+'.'+r.d.slice(6):nd);   // עורכים יום.חודש, השנה נשמרת
    r.t=nt; r.a=na; if(r.pay==='שיק') r.ref=nr;
    ENT_EDIT=null; renderEntriesView();
    toast('עודכן — נצבע מחדש בתזרים');
  }
  function entAdopt(name,ix){
    const r=DATA_TABLES[name].rows[ix]; if(!r)return;
    r.d=r.rec; r.st='new';
    toast('נקבע מועד '+r.rec.slice(0,5)+' — ממתין לאישור ואז ייצבע בתזרים');
    renderEntriesView();
  }
  function entAddRow2(name,key){
    const d=document.getElementById('entDesc_'+key), a=document.getElementById('entAmt_'+key),
          rf=document.getElementById('entRef_'+key), dt=document.getElementById('entDate_'+key);
    if(!d||!d.value.trim()||!a.value){toast('צריך תיאור וסכום');return;}
    if(ENT_TYPE2[key]==='שיק'&&!(rf&&rf.value.trim())){toast('שיק חייב אסמכתא — מספר השיק');rf&&rf.focus();return;}
    const dv=(dt&&dt.value.trim())||'';
    DATA_TABLES[name].rows.push(dv
      ?{d:dv, t:d.value.trim(), a:a.value, pay:ENT_TYPE2[key], ref:ENT_TYPE2[key]==='שיק'?rf.value.trim():'', src:ENT_TYPE2[key]==='שיק'?'ידני':'', by:'לירון בן כליפא', ch:'mgr', st:'flow'}
      :{d:'', t:d.value.trim(), a:a.value, pay:ENT_TYPE2[key], ref:ENT_TYPE2[key]==='שיק'?rf.value.trim():'', by:'לירון בן כליפא', ch:'mgr', st:'nodate', rec:'25.08.2026', recWhy:'לפי תנאי התשלום של המוטב'});
    renderEntriesView(); toast(dv?'נוסף ונצבע בתזרים':'נוסף ללא מועד — קיבל המלצת תאריך');
  }
  function entOk(b){ b.outerHTML='<span class="ent-st ok">✓ בתזרים</span>'; toast('אושר ונצבע בתזרים קדימה'); }
  function entAddRow(){
    const d=document.getElementById('entDesc'), a=document.getElementById('entAmt'), r=document.getElementById('entRef');
    if(!d||!d.value.trim()||!a.value){toast('צריך תיאור וסכום');return;}
    if(ENT_NEWTYPE==='שיק'&&!(r&&r.value.trim())){toast('שיק חייב אסמכתא — מספר השיק');r&&r.focus();return;}
    DATA_TABLES[ENTRIES_SEL].rows.push({d:'25.08.2026', t:d.value.trim(), a:a.value, pay:ENT_NEWTYPE, ref:ENT_NEWTYPE==='שיק'?r.value.trim():'', by:'לירון בן כליפא', ch:'mgr', st:'flow'});
    renderEntriesView(); toast('נוסף ונצבע בתזרים');
  }
  function openDataTable(name,ci){
    ENTRIES_SEL=name;
    ENT_MODE=name&&name.includes('תקבולים')?'inc':'exp';
    if(typeof OPSMODE!=='undefined'&&OPSMODE){ openDataTableModal(name); return; }   // בתוך תפעול — מודל מהיר, לא עוזבים את התור
    // המסך הוא פר-חברה — נכנסים לחברה לפני שמציגים אותו (שלא יאבד ההקשר)
    if(SCOPE!=='client') selectClient(ci!=null?ci:CUR||0);
    else if(ci!=null&&ci!==CUR) selectClient(ci);
    showTab('entries');
  }
  function openDataTableModal(name){
    const t=DATA_TABLES[name]||Object.values(DATA_TABLES)[0];
    document.getElementById('dtTitle').textContent='טבלת הזנה — '+name;
    document.getElementById('dtBody').innerHTML=`
      <div class="dt-note">טבלה מנוהלת של HK · ממתין לאישור ← בתזרים ← בוצע (התאמה מהבנק)</div>
      <div class="dt-grid" style="grid-template-columns:95px 1.4fr 80px 90px 110px 110px">
        ${t.cols.map(c=>`<div class="dt-h">${c}</div>`).join('')}
        ${t.rows.map(r=>{const st=ENT_ST[r.st];return `<div class="dt-c">${r.d}</div><div class="dt-c">${r.t}</div><div class="dt-c num">${r.a}</div>
          <div class="dt-c">${r.pay}${r.ref?' '+r.ref:''}</div><div class="dt-c">${r.anon?'לא זוהה':r.by}</div>
          <div class="dt-c"><span class="ent-st ${st.c}">${st.t}</span></div>`;}).join('')}
      </div>`;
    document.getElementById('dataTblOv').classList.add('show');
  }
  function closeDataTable(){document.getElementById('dataTblOv').classList.remove('show');}
  /* ===== שלב "הודעות לקוח" — שיחה קבועה משמאל, חלון עבודה מתחלף מימין =====
     ההתכתבות עם הלקוח לא נעלמת בין פריט לפריט: היא עומדת במקומה, ומצד ימין
     מתחלף החלון של הפריט הנבחר — טופס הזנה למסמך, מענה להודעה. */
  let _msgSel=null;
  function msgPick(i){ _msgSel=i; renderOps(); }
  function msgNext(){
    const T=curTasks();
    const open=T.map((t,k)=>k).filter(k=>(T[k].type==='doc'||T[k].type==='msg')&&!T[k].done);
    if(!open.length){ _msgSel=null; return renderOps(); }
    const cur=open.indexOf(_msgSel);
    _msgSel=open[(cur+1)%open.length]; renderOps(); msgFlash(_msgSel);
  }
  function msgStage(rows,T){
    const items=rows.filter(t=>t.type==='msg'||t.type==='doc');
    /* המונה סופר התקדמות בשלב כולו, כולל מה שכבר טופל */
    const allItems=T.filter(t=>t.type==='msg'||t.type==='doc');
    const openIx=items.filter(t=>!t.done).map(t=>T.indexOf(t));
    if(_msgSel==null||!items.some(t=>T.indexOf(t)===_msgSel)) _msgSel=openIx[0];
    const sel=_msgSel!=null?T[_msgSel]:null;

    /* ---- שמאל: ההתכתבות, קבועה ---- */
    const bub=(who,txt,me)=>`<div class="msgc-b ${me?'me':''}"><span class="msgc-w">${who}</span>${txt}</div>`;
    const chat=items.map(t=>{
      const i=T.indexOf(t), on=(i===_msgSel);
      const lines=(t.ctx&&t.ctx.length?t.ctx:(t.thread||[]).map(x=>'['+(t.who||'הלקוח')+'] '+x));
      const body=lines.map(l=>{
        const m=l.match(/^\[([^\]]+)\]\s*(.*)$/)||[null,t.who||'הלקוח',l];
        return bub(m[1],m[2],m[1].includes('מנהל תזרים')||m[1].includes('יועץ'));
      }).join('');
      const tag=t.type==='doc'
        ?`<span class="msgc-att">${t.img?'📎':'📊'} ${t.name}</span>`
        :(t.reply?'<span class="msgc-att r">↩ הלקוח ענה לשאלה שלנו</span>':'<span class="msgc-att q">שאלה — דורשת מענה</span>');
      const st=t.done?(t.later?'<span class="msgc-ok later">◷ מאוחר יותר</span>'
                              :'<span class="msgc-ok">✓ טופל</span>')
                     :(t.await?'<span class="msgc-ok await">◷ ממתין למענה</span>':'');
      return `<div class="msgc-item ${on?'on':''} ${t.done?'done':''}" id="msgc_${i}" onclick="msgPick(${i})">
        ${on?'<span class="msgc-cur">מטופל עכשיו</span>':''}
        <div class="msgc-time">${t.who||''} · ${t.time||''}</div>
        ${body}
        <div class="msgc-foot">${tag}${st}</div>
      </div>`;}).join('');

    /* ---- ימין: חלון העבודה של הפריט הנבחר ---- */
    let work;
    if(!sel){
      work='<div class="ops-empty" style="padding:40px">כל ההודעות טופלו ✓</div>';
    }else{
      const i=_msgSel;
      const head=`<div class="mw-h">
        <div class="mw-t">${grpChip(sel)}${sel.type==='doc'?taskTitle(sel):(sel.reply?'הלקוח ענה לשאלה שלנו':'הודעה מ'+(sel.who||'הלקוח'))}</div>
        <div class="mw-s">${sel.who||''} · ${sel.time||''}${sel.src?' · '+sel.src:''}</div>
        <div class="mw-nav">
          ${(sel.type==='msg'&&sel.entry)?`<button class="mt-btn view sm" onclick="msgEntryBack(${i})">→ חזרה למענה</button>`:''}
          <span class="mw-n"><b>${allItems.length-openIx.length+1}</b> מתוך ${allItems.length}</span>
        </div>
      </div>`;
      /* "הזנה לתזרים" בהודעת מלל — אותה פריסה בדיוק כמו מסמך:
         טופס מימין, ובמקום תצוגת המסמך — ההודעה עצמה משמאל. */
      const asEntry=(sel.type==='msg'&&sel.entry);
      work=head+`<div class="mw-body">${(sel.type==='doc'||asEntry)?fileMsgBody(sel,i,sel.type==='doc'?1:0):textMsgBody(sel,i)}</div>`;
    }
    /* ההודעה שמטופלת עכשיו נגללת לתצוגה בצד שמאל */
    if(_msgSel!=null) setTimeout(()=>{
      const el=document.getElementById('msgc_'+_msgSel);
      if(el&&el.scrollIntoView) el.scrollIntoView({block:'nearest',behavior:'smooth'});
    },60);
    /* ההתכתבות חיה בפאנל הצד המשותף — כאן רק חלון העבודה */
    return `<div class="ms-split solo"><div class="ms-work">${work}</div></div>`;
  }
  /* הודעת מלל — שיחה ומענה */
  function textMsgBody(t,i){
    /* הלקוח ענה לשאלה שלנו: ההודעה המקורית, מה ששלחנו, והתשובה — התשובה מודגשת */
    const exch=t.reply?`
      <div class="oqs-bub dim"><div class="oqs-bub-h">${t.who||'הלקוח'} · ההודעה המקורית</div>${t.orig||''}</div>
      <div class="oqs-bub me"><div class="oqs-bub-h">מנהל תזרים · מה ששלחנו</div>${t.ours||''}</div>`:'';
    return `<div class="msg-thread">
      ${exch}
      ${(t.thread||[]).map(m=>`<div class="oqs-bub ${t.reply?'ans':''}"><div class="oqs-bub-h">${t.who||'הלקוח'} · ${t.time||''}${t.reply?' · <b>התשובה</b>':''}</div>${m}</div>`).join('')}
      <div class="oqs-reply" style="margin-top:12px">
        <input id="msgReply_${i}" placeholder="תגובה ללקוח בוואטסאפ…" onkeydown="if(event.key==='Enter')msgReplySend(${i})">
        <button class="oqs-send" onclick="msgReplySend(${i})">שליחה</button>
      </div>
      <div class="chk-actions"><button class="ot-btn done" onclick="otHandle(${i},'טופל · ✓ נענה ללקוח',1)">סימון כטופל</button>
      <button class="ot-btn ghost" onclick="msgEntryOpen(${i})">הזנה לתזרים</button>
      ${skipBtn(i)}</div>
    </div>`;
  }
  function msgReplySend(i){
    const inp=document.getElementById('msgReply_'+i); if(!inp||!inp.value.trim()) return;
    const txt=inp.value.trim();
    /* התשובה נשלחה ⇒ האירוע נסגר והמערכת עוברת לבא. אחרת המונה לא זז
       והמתפעל לא מבין שהוא התקדם. */
    otHandle(i,'טופל · ✓ נשלחה תשובה: "'+txt+'"',1);
    msgAdvance(i,'התשובה נשלחה ללקוח בוואטסאפ');
  }
  /* הדגשה קצרה על האירוע החדש — כדי שיהיה ברור שעברנו */
  function msgFlash(i){
    setTimeout(()=>{
      const el=document.getElementById('msgc_'+i); if(!el) return;
      el.classList.add('flash'); setTimeout(()=>el.classList.remove('flash'),900);
      const w=document.querySelector('.mw-h'); if(w){ w.classList.add('flash'); setTimeout(()=>w.classList.remove('flash'),900); }
    },80);
  }
  /* ===== מעבר לאירוע הבא =====
     כרטיס אישור מכסה את חלון העבודה למשך רגע ואומר מה נסגר ומה הבא —
     אחרת המתפעל לא מבחין שהוא התקדם. */
  function msgAdvance(i,what){
    const T=curTasks();
    const nxtIx=T.map((x,k)=>k).filter(k=>(T[k].type==='msg'||T[k].type==='doc')&&!T[k].done&&k!==i)[0];
    const nxt=nxtIx!=null?T[nxtIx]:null;
    const done=T.filter(x=>(x.type==='msg'||x.type==='doc')&&x.done).length+1;
    const all=T.filter(x=>x.type==='msg'||x.type==='doc').length;
    const nxtName=nxt?(nxt.type==='doc'?nxt.name:((nxt.who?nxt.who+': ':'')+((nxt.thread||[])[0]||'הודעה'))):'';
    const host=document.querySelector('.ms-work'); if(!host) return advNow();
    const c=document.createElement('div'); c.className='adv-card';
    c.innerHTML=`<div class="adv-in">
        <div class="adv-ck">✓</div>
        <div class="adv-what">${what}</div>
        ${nxt?`<div class="adv-next"><span class="adv-lbl">עובר לאירוע הבא</span><b>${nxtName}</b></div>
               <div class="adv-prog"><i style="width:${Math.round(done/all*100)}%"></i></div>
               <div class="adv-cnt">${done} מתוך ${all} בשלב הזה</div>`
             :`<div class="adv-next"><b>זה היה האחרון — כל ההודעות טופלו</b></div>`}
      </div>`;
    host.appendChild(c);
    requestAnimationFrame(()=>c.classList.add('on'));
    setTimeout(()=>{ c.classList.remove('on'); setTimeout(()=>c.remove(),200); advNow(); },1150);
    function advNow(){ if(nxtIx!=null){ _msgSel=nxtIx; } renderOps(); if(nxtIx!=null) msgFlash(nxtIx); }
  }
  /* הודעת קובץ — המסמך מול טופס הזנה בסגנון Bizibox */
  function fileMsgBody(t,i,noCtx){
    const f=t.file||{};
    const rows=f.rows||[{date:f.date||'', ref:f.ref||'', desc:f.desc||'', amount:f.amount||''}];
    const bizRow=r=>`<div class="biz-row" oninput="event.target.classList.remove('req-miss')" onchange="event.target.classList.remove('req-miss')">
        <input class="mx2-inp" value="${r.date||''}" placeholder="תאריך">
        <input class="mx2-inp" value="${r.ref||''}" placeholder="אסמכתא">
        <select class="mx2-inp"><option>ללא קטגוריה</option>${COMPANY_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        <input class="mx2-inp" value="${r.desc||''}" placeholder="תיאור">
        <input class="mx2-inp biz-amt" value="${r.amount||''}" placeholder="0" dir="ltr">
        <button type="button" class="biz-del" onclick="bizDelRow(this)" title="הורדת השורה">✕</button>
      </div>`;
    /* תצוגה מקדימה של ההתכתבות עם הלקוח — ההקשר שממנו הגיע המסמך */
    const ctx=(t.ctx||[]).map(l=>{
      const m=l.match(/^\[([^\]]+)\]\s*(.*)$/)||[null,'',l];
      const me=m[1].includes('מנהל תזרים')||m[1].includes('יועץ');
      return `<div class="mp-b ${me?'me':''}"><span class="mp-w">${m[1]}</span>${m[2]}</div>`;}).join('');
    const ctxSide=(ctx&&!noCtx)?`<div class="msg-prev">
        <div class="mp-h">${t.grp?'קבוצת וואטסאפ':'הודעה מהלקוח'} · ${t.who||''} · ${t.time||''}</div>
        ${ctx}</div>`:'';
    // צד המסמך: תמונה אמיתית / טבלת אקסל
    const docSide=t.changeCard
      ?t.changeCard
      :t.img
      ?`<img src="${t.img}" class="chk-photo doc-photo doc-zoomable" alt="המסמך שהתקבל" onclick="dzoOpen(this.src,'${(t.name||'').replace(/'/g,"")}')">`
      :f.rows
      ?`<div class="xls-paper"><div class="xls-top">📊 ${t.name}</div>
          <div class="xls-h"><span>תאריך</span><span>פירוט</span><span>סכום</span></div>
          ${f.rows.map(r=>`<div class="xls-r"><span>${r.date}</span><span>${r.desc}</span><b>${r.amount} ₪</b></div>`).join('')}
          <div class="xls-t"><span>סה״כ</span><b>${f.rows.reduce((s,r)=>s+(+String(r.amount).replace(/\D/g,'')||0),0).toLocaleString()} ₪</b></div>
        </div>`
      :'';
    const ocr=f.rows
      ?`<span>זוהו ${f.rows.length} שורות להזנה</span>`
      :(t.type==='msg'
        ?'<span>אין מסמך — הזנה ידנית מתוך ההודעה</span>'
        :`${f.payee?`<span>מוטב: ${f.payee}</span>`:'<span class="miss">מוטב לא זוהה — להזנה ידנית</span>'}<span>סכום ${f.amount||''} ₪</span><span>תאריך ${f.date||''}</span>`);
    const dir=_bizDir[i]||(_bizDir[i]='exp');   /* ברירת מחדל: הוצאה */
    return `<div class="pay-cols">
      <div class="biz-form dir-${dir}" id="bizForm_${i}">
        <div class="biz-selrow">
          <label>סוג תנועה
            <span class="biz-dir" role="group" aria-label="הוצאה או הכנסה">
              <button type="button" class="bd exp ${dir==='exp'?'on':''}" onclick="bizDir(${i},'exp')">הוצאה</button>
              <button type="button" class="bd inc ${dir==='inc'?'on':''}" onclick="bizDir(${i},'inc')">הכנסה</button>
            </span>
          </label>
          <label>ח-ן <select class="mx2-inp"><option>מזרחי 295199</option><option>מרכנתיל 69855155</option></select></label>
          <label>סוג תשלום <select class="mx2-inp"><option selected>העברה</option><option>שיק</option><option>אחר</option></select></label>
        </div>
        <div class="biz-thead"><span>תאריך</span><span>אסמכתא (אם קיים)</span><span>קטגוריה</span><span>תיאור</span><span>סכום</span></div>
        <div id="bizRows_${i}">${rows.map(bizRow).join('')}</div>
        <div class="biz-addrow"><button type="button" class="biz-add" onclick="bizAddRow(${i})">＋ הוספת תשלומים</button></div>
        <div class="chk-actions">
          <button class="ot-btn done" onclick="bizSave(${i})">שמירה והמשך</button>
          <button class="ot-btn ghost" onclick="docReplyOpen(${i})">שלח תגובה ללקוח</button>
          ${skipBtn(i)}
        </div>
        <div class="doc-reply" id="docReply_${i}">
          <input placeholder="מה לא ברור במסמך? — התגובה תישלח ללקוח בוואטסאפ"
                 onkeydown="if(event.key==='Enter')docReplySend(${i})">
          <button class="oqs-send" onclick="docReplySend(${i})">שליחה</button>
        </div>
      </div>
      <div class="chk-imgwrap">
        ${t.note&&!(t.ctx||[]).length?`<div class="oqs-bub" style="margin-bottom:10px"><div class="oqs-bub-h">${t.who||'הלקוח'} · ${t.time||''}</div>${t.note}</div>`:''}
        ${ctxSide}${docSide}
        <div class="chk-ocr-chips">📎 התקבל בוואטסאפ · ${ocr}</div>
      </div>
    </div>`;
  }
  let _docIx=null;
  function openDocEntry(i){
    const t=curTasks()[i]; if(!t||t.type!=='doc') return;
    _docIx=i;
    document.getElementById('docTitle').textContent='הזנה למערכת — '+t.name;
    document.getElementById('docBody').innerHTML=fileMsgBody(t,i);
    document.getElementById('docOv').classList.add('show');
  }
  function docClose(){document.getElementById('docOv').classList.remove('show');_docIx=null;}
  function bizAddRow(i){
    const w=document.getElementById('bizRows_'+i); if(!w) return;
    const d=document.createElement('div'); d.className='biz-row';
    d.innerHTML=`<input class="mx2-inp" placeholder="תאריך"><input class="mx2-inp" placeholder="אסמכתא"><select class="mx2-inp"><option>ללא קטגוריה</option>${COMPANY_CATS.map(c=>`<option>${c}</option>`).join('')}</select><input class="mx2-inp" placeholder="תיאור"><input class="mx2-inp biz-amt" placeholder="0" dir="ltr"><button type="button" class="biz-del" onclick="bizDelRow(this)" title="הורדת השורה">✕</button>`;
    w.appendChild(d);
  }
  /* הורדת שורה — תמיד נשארת אחת */
  function bizDelRow(btn){
    const row=btn.closest('.biz-row'), w=row.parentNode;
    if(w.querySelector('.biz-row')===row) return;   /* השורה הראשונה לא נמחקת */
    row.remove(); toast('השורה הוסרה');
  }
  /* ===== זום על מסמך — פתיחה במסך מלא עם הגדלה/הקטנה ===== */
  let _dzo=1;
  function dzoOpen(src,alt){
    let ov=document.getElementById('dzoOv');
    if(!ov){
      ov=document.createElement('div'); ov.id='dzoOv'; ov.className='dzo';
      ov.innerHTML='<div class="dzo-in"><img id="dzoImg" alt=""></div>';
      ov.addEventListener('click',e=>{ if(e.target===ov||e.target.className==='dzo-in') dzoClose(); });
      const bar=document.createElement('div'); bar.className='dzo-bar'; bar.id='dzoBar';
      bar.innerHTML='<button onclick="dzoStep(-1)" title="הקטנה">−</button>'+
        '<span class="lvl" id="dzoLvl">100%</span>'+
        '<button onclick="dzoStep(1)" title="הגדלה">+</button>'+
        '<button onclick="dzoStep(0)">התאמה</button>'+
        '<button class="dl" id="dzoDl" onclick="dzoDownload()" title="הורדת התמונה"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>הורדה</button>'+
        '<button class="x" onclick="dzoClose()">✕ סגירה</button>';
      document.body.appendChild(ov); document.body.appendChild(bar);
    }
    const img=document.getElementById('dzoImg'); img.src=src; img.alt=alt||'';
    _dzoSrc=src; _dzoName=(alt||'מסמך').replace(/[\/:*?"<>|]/g,'-')+'.'+(src.split('.').pop()||'jpg');
    _dzo=1; dzoApply(); ov.classList.add('show');
    document.getElementById('dzoBar').style.display='flex';
  }
  let _dzoSrc='', _dzoName='';
  /* ב-file:// ניווט לקישור עם download רק פותח את התמונה — לכן מורידים דרך blob */
  function dzoDownload(){
    const go=url=>{ const a=document.createElement('a'); a.href=url; a.download=_dzoName; document.body.appendChild(a); a.click(); a.remove();
      toast('הורד: '+_dzoName); };
    /* בדמו (file://) הדפדפן לא מאפשר הורדה — לא fetch ולא canvas — ופשוט מנווט לתמונה.
       לכן בדמו רק מאשרים; כשהמערכת מוגשת משרת, ה-download עובד באמת. */
    if(location.protocol==='file:'){ toast('הורד: '+_dzoName); return; }
    go(_dzoSrc);
  }
  function dzoStep(d){ _dzo=d===0?1:Math.min(4,Math.max(.5,+(_dzo+d*.25).toFixed(2))); dzoApply(); }
  function dzoApply(){
    const img=document.getElementById('dzoImg'), l=document.getElementById('dzoLvl');
    if(img) img.style.transform='scale('+_dzo+')';
    if(l) l.textContent=Math.round(_dzo*100)+'%';
  }
  function dzoClose(){
    const ov=document.getElementById('dzoOv'), bar=document.getElementById('dzoBar');
    if(ov) ov.classList.remove('show'); if(bar) bar.style.display='none';
  }
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('dzoOv')||!document.getElementById('dzoOv').classList.contains('show')) return;
    if(e.key==='Escape') dzoClose();
    if(e.key==='+'||e.key==='=') dzoStep(1);
    if(e.key==='-') dzoStep(-1);
  });

  /* הודעת מלל שדורשת הזנה — המערכת לא זיהתה מסמך, אבל יש מה להזין.
     נפתח אותו טופס, בלי תצוגת מסמך. */
  function msgEntryOpen(i){
    const t=curTasks()[i]; if(!t) return;
    if(!t.file) t.file={date:'',ref:'',desc:'',amount:''};   /* שורה ריקה להזנה ידנית */
    if(!t.ctx||!t.ctx.length)                                 /* ההודעה עצמה תוצג בצד */
      t.ctx=(t.thread||[]).map(x=>'['+(t.who||'הלקוח')+'] '+x);
    t.entry=true; renderOps();
  }
  /* חזרה מהטופס למענה */
  function msgEntryBack(i){ const t=curTasks()[i]; if(!t) return; t.entry=false; renderOps(); }
  /* הוצאה או הכנסה — קובע את צבע הרקע של הטופס ואת מה שנרשם בתזרים */
  const _bizDir={};
  function bizDir(i,d){
    _bizDir[i]=d;
    const f=document.getElementById('bizForm_'+i); if(!f) return;
    f.classList.toggle('dir-exp',d==='exp'); f.classList.toggle('dir-inc',d==='inc');
    f.querySelectorAll('.biz-dir .bd').forEach(b=>b.classList.toggle('on',b.classList.contains(d==='exp'?'exp':'inc')));
  }
  /* שמירה וסגירה — מזין לתזרים ומודיע ללקוח שטופל */
  /* כל השדות חובה (חוץ מאסמכתא — "אם קיים"). שדה ריק נצבע, ולא שומרים. */
  function bizValidate(i){
    const bad=[];
    document.querySelectorAll('#bizRows_'+i+' .biz-row').forEach(r=>{
      const [date,ref,cat,desc,amt]=r.children;
      const chk=(el,ok)=>{ el.classList.toggle('req-miss',!ok); if(!ok) bad.push(el); };
      chk(date,!!date.value.trim());
      chk(cat,cat.selectedIndex>0);
      chk(desc,!!desc.value.trim());
      chk(amt,(+String(amt.value).replace(/[^\d]/g,''))>0);
    });
    if(bad.length){ bad[0].focus(); toast('חסרים '+bad.length+' שדות — כל השדות חובה (אסמכתא רק אם קיימת)'); }
    return !bad.length;
  }
  function bizSave(i){
    const t=curTasks()[i]; if(!t) return;
    if(t.type!=='sheet'&&!bizValidate(i)) return;
    const payee=((t.file||{}).payee)||'';
    const rows=document.querySelectorAll('#bizRows_'+i+' .biz-row').length;
    docClose();
    const dirLbl=(_bizDir[i]||'exp')==='inc'?'הכנסה':'הוצאה';
    otHandle(i,t.type==='sheet'
      ?(t.kind==='edit'?('עודכן בתזרים: '+t.old+' ← '+t.new+' ₪ · ✓ סומן בגיליון'):('הוזן לתזרים — '+rows+' שורות · ✓ סומן בגיליון'))
      :('הוזן לתזרים כ'+dirLbl+' — '+payee+' · '+rows+' שורות · ✓ נשלח ללקוח "טופל"'), t.type!=='sheet');
    if(t.type!=='sheet') msgAdvance(i,'הוזן לתזרים כ'+dirLbl+' · '+rows+' שורות · נשלח ללקוח "טופל"');
  }

  /* ===== התעלם — תפריט קטן, לא פופאפ ===== */
  let _skipIx=null;
  const skipBtn=i=>`<button class="ot-btn ghost skip-btn" onclick="event.stopPropagation();skipOpen(${i},this)">התעלם</button>`;
  /* התפריט חי על ה-body ומקבל מיקום מחושב — אחרת הוא נחתך בתחתית הפאנל */
  function skipOpen(i,btn){
    skipClose(); _skipIx=i;
    const d=document.createElement('div'); d.className='skip-dd show'; d.id='skipDd';
    d.innerHTML=`<button onclick="skipPick(${i},'later')">אטפל מאוחר יותר<small>נשאר ברשימה, יורד מהתור של היום</small></button>
      <button onclick="skipPick(${i},'nr')">לא רלוונטי<small>יורד מהרשימה</small></button>`;
    document.body.appendChild(d);
    const r=btn.getBoundingClientRect(), h=d.offsetHeight, gap=6;
    const below=window.innerHeight-r.bottom;
    d.style.top=(below>h+gap ? r.bottom+gap : Math.max(gap,r.top-h-gap))+'px';
    /* יישור RTL לקצה הימני של הכפתור, בלי לגלוש מהמסך */
    d.style.left=Math.max(gap,Math.min(r.right-d.offsetWidth,window.innerWidth-d.offsetWidth-gap))+'px';
    btn.classList.add('on');
  }
  function skipClose(){
    const d=document.getElementById('skipDd'); if(d) d.remove();
    document.querySelectorAll('.skip-btn.on').forEach(b=>b.classList.remove('on'));
    _skipIx=null;
  }
  function skipPick(i,kind){
    skipClose();
    if(kind==='nr'){ otHandle(i,'לא רלוונטי — ירד מהרשימה'); msgAdvance(i,'סומן כלא רלוונטי'); return; }
    const t=curTasks()[i]; if(!t) return;
    if(typeof docClose==='function') docClose();
    t.later=true;
    otHandle(i,'נדחה — אטפל מאוחר יותר');
    msgAdvance(i,'נדחה לטיפול מאוחר יותר');
  }
  document.addEventListener('click',e=>{ if(!e.target.closest('.skip-dd,.skip-btn')) skipClose(); });
  window.addEventListener('scroll',()=>skipClose(),true);

  /* ===== תגובה ללקוח מתוך טופס המסמך — כשמשהו לא ברור ===== */
  function docReplyOpen(i){
    const w=document.getElementById('docReply_'+i);
    if(w){ w.classList.toggle('show'); const inp=w.querySelector('input'); if(inp) inp.focus(); }
  }
  function docReplySend(i){
    const w=document.getElementById('docReply_'+i); if(!w) return;
    const inp=w.querySelector('input'); const v=(inp.value||'').trim(); if(!v) return;
    inp.value=''; w.classList.remove('show');
    const t=curTasks()[i];
    if(t){ (t.ctx=t.ctx||[]).push('[מנהל תזרים] '+v); t.await=true; renderOps(); }
    toast('נשלחה תגובה ללקוח בוואטסאפ — הפריט ממתין למענה');
  }
  /* דרופדאון קטגוריות עם חיפוש — טופס השיק */
  function chkCatOpen(i){document.getElementById('chkCatDd_'+i).classList.add('show');chkCatFilter(i);}
  function chkCatFilter(i){
    const q=(document.getElementById('chkCat_'+i).value||'').trim();
    const list=COMPANY_CATS.filter(c=>!q||c.includes(q));
    document.getElementById('chkCatDd_'+i).innerHTML=list.length
      ?list.map(c=>`<div class="ev-dd-row" onmousedown="chkCatPick(${i},'${c}')"><div><b>${c}</b></div></div>`).join('')
      :'<div class="ev-dd-empty">אין קטגוריה כזו</div>';
  }
  function chkCatPick(i,c){
    document.getElementById('chkCat_'+i).value=c;
    document.getElementById('chkCatDd_'+i).classList.remove('show');
  }
  function chkSaveInline(i){
    const t=curTasks()[i]; if(!t) return;
    const nm=(document.getElementById('chkName_'+i).value||'').trim();
    const cat=document.getElementById('chkCat_'+i).value;
    if(!nm){toast('חסר שם מוטב');document.getElementById('chkName_'+i).focus();return;}
    if(!cat){toast('צריך לבחור קטגוריה');return;}
    const addRule=document.getElementById('chkRule_'+i).checked;
    window._paySel=null;
    otHandle(i,'הוזן — '+nm+' · '+cat);
    if(addRule){
      if(!CAT_RULES.some(r=>r.kind==='desc'&&r.match===nm&&r.scope===CUR))
        CAT_RULES.push({kind:'desc', match:nm, to:cat, scope:CUR});
      toast('השיק הוזן + נוסף כלל: "'+nm+'" ← '+cat);
    }
  }
  let _chkIx=null;
  function openChk(i){
    const t=curTasks()[i]; if(!t||t.type!=='payee') return;
    _chkIx=i;
    document.getElementById('chkTitle').textContent='הזנת שיק מס׳ '+t.chk+' — '+t.bank;
    // ציור השיק + הדגשות OCR
    document.getElementById('chkImg').innerHTML=`
      <div class="chk-paper">
        <div class="chk-top"><b>בנק ${t.bank.split(' ·')[0]}</b><span class="chk-date ocr-hl" data-l="תאריך">${t.date}</span></div>
        <div class="chk-line">שלמו לפקודת <span class="chk-payee ${t.ocrName?'ocr-hl':'ocr-miss'}" data-l="${t.ocrName?'מוטב · OCR':'לא זוהה'}">${t.ocrName||'________________'}</span></div>
        <div class="chk-line">סך של <span class="chk-words">${t.ocrName?'שמונת אלפים ארבע מאות':'—'} ₪</span>
          <span class="chk-amt ocr-hl" data-l="סכום">₪ ${t.amount}</span></div>
        <div class="chk-micr" dir="ltr">⑆${t.chk}⑆ ${t.bank.includes('לאומי')?'10-902':'20-431'}⑆ 331992⑆</div>
      </div>
      <div class="chk-note">📎 התמונה נמשכה מ-Bizibox · שדות מודגשים זוהו אוטומטית</div>`;
    document.getElementById('chkName').value=t.ocrName||'';
    document.getElementById('chkNameOcr').style.display=t.ocrName?'':'none';
    document.getElementById('chkCat').innerHTML='<option value="">בחירת קטגוריה…</option>'+COMPANY_CATS.map(c=>`<option>${c}</option>`).join('');
    document.getElementById('chkAmt').value=t.amount+' ₪';
    document.getElementById('chkDate').value=t.date;
    document.getElementById('chkRuleChk').checked=false;
    document.getElementById('chkOv').classList.add('show');
    if(!t.ocrName) document.getElementById('chkName').focus();
  }
  function chkClose(){document.getElementById('chkOv').classList.remove('show');_chkIx=null;}
  function chkSave(){
    const t=curTasks()[_chkIx]; if(!t) return;
    const nm=document.getElementById('chkName').value.trim();
    const cat=document.getElementById('chkCat').value;
    if(!nm){toast('חסר שם מוטב');document.getElementById('chkName').focus();return;}
    if(!cat){toast('צריך לבחור קטגוריה');return;}
    const addRule=document.getElementById('chkRuleChk').checked;
    const i=_chkIx; chkClose();
    otHandle(i,'הוזן — '+nm+' · '+cat);
    if(addRule){
      if(!CAT_RULES.some(r=>r.kind==='desc'&&r.match===nm&&r.scope===CUR))
        CAT_RULES.push({kind:'desc', match:nm, to:cat, scope:CUR});
      toast('השיק הוזן + נוסף כלל: "'+nm+'" ← '+cat);
    }
  }
  /* שליחת הודעה ללקוח — תצוגה מקדימה ואישור */
  let _smIx=null;
  /* ===== הודעות ללקוח = תבניות WhatsApp Business =====
     הטקסט **אינו ניתן לעריכה**: תבנית מאושרת מראש מול Meta, עם משתנים
     שממולאים אוטומטית ושני כפתורי תשובה מהירה. תשובת הלקוח חוזרת דרך
     הבוט אל תור התפעול (הבוט הוא ראוטר). */
  const WA_TPL={
    collect:{id:'collection_reminder_he', cat:'שירות · תזכורת גבייה',
      body:v=>`היי ${v.name} 👋\nבצפי התזרים מופיע תקבול מ־<b>${v.who}</b> ע״ס <b>${v.amt} ₪</b> שטרם נכנס לחשבון.\nנשמח לדעת מה הסטטוס, כדי שהתזרים יישאר מדויק.`,
      btns:['שולם — אשלח אסמכתא','יש עיכוב']},
    budgetOver:{id:'budget_over_he', cat:'שירות · חריגה מהתקציב',
      body:v=>`היי ${v.name} 👋\nבקטגוריית <b>${v.cat}</b> נרשמה חריגה מהתקציב: <b>${v.actual} ₪</b> מול תקציב <b>${v.budget} ₪</b>.\nרצינו לוודא שאתה מודע.`,
      btns:['מודע — זה בסדר','בוא נעדכן תקציב']},
    budgetMiss:{id:'material_request_he', cat:'שירות · בקשת חומר',
      body:v=>`היי ${v.name} 👋\nחסרים לנו נתונים בקטגוריית <b>${v.cat}</b> כדי להשלים את תמונת התזרים.\nאפשר לשלוח את החומר הרלוונטי?`,
      btns:['שולח עכשיו','אין לי את זה']}
  };
  let _smTpl=null, _smVars=null;
  function smOpenTpl(key,vars,to,ix){
    _smTpl=WA_TPL[key]; _smVars=vars; _smIx=(ix==null?null:ix);
    const T=_smTpl;
    document.getElementById('smTo').textContent=to;
    document.getElementById('smPrev').innerHTML=
      `<div class="wa-bub">${T.body(vars).replace(/\n/g,'<br>')}
         <div class="wa-btns">${T.btns.map(b=>`<span>${b}</span>`).join('')}</div></div>`;
    document.getElementById('smOv').classList.add('show');
  }
  function openSM(i){
    const t=curTasks()[i]; if(!t) return;
    const c=CLIENTS[CUR], contact=(c.thread&&[...c.thread].reverse().find(m=>m.from==='user')||{}).name||'הלקוח';
    smOpenTpl('collect',{name:contact,who:t.who||'',amt:(t.amt||0).toLocaleString()},
      'קבוצת '+c.name+' · וואטסאפ', i);
  }
  function smClose(){document.getElementById('smOv').classList.remove('show');_smIx=null;_smTpl=null;}
  function smGo(){
    const i=_smIx; smClose();
    if(i==null){toast('התבנית נשלחה בוואטסאפ ✓');return;}
    otHandle(i,'נשלחה תזכורת ללקוח · ✓ וואטסאפ');
  }
  /* מחיקת צפי (נגררת) — אזהרה: זה מוריד את הצפי מהעקומה, לא רק מהרשימה */
  let _cdIx=null;
  function cdOpen(i){
    const t2=curTasks()[i]; if(!t2) return;
    _cdIx=i;
    document.getElementById('cdName').textContent=t2.who||'';
    document.getElementById('cdSum').textContent=(t2.dir==='inc'?'+':'')+(t2.amt||0).toLocaleString()+' ₪'+(t2.txd?' · צפוי ל־'+t2.txd:'');
    document.getElementById('cdOv').classList.add('show');
  }
  function cdClose(){ document.getElementById('cdOv').classList.remove('show'); _cdIx=null; }
  function cdGo(){
    const i=_cdIx; cdClose();
    otHandle(i,'הצפי נמחק מהתזרים');
  }

  /* ===== התעלמות מפעולה — סיבה מתויגת =====
     השורה יורדת מהרשימה של HK; היא לא נמחקת בביזיבוקס. בלי טקסט חופשי —
     סיבה חופשית לא ניתנת לניתוח. התגים מנוהלים, כדי שאפשר יהיה לשאול
     בהמשך "ממה מתעלמים אצל הלקוח הזה, ולמה". */
  const NR_TAGS_DEF=['פעולה פנימית בין חשבונות','כבר הוזן ידנית בתזרים','טעות בנק — בבירור','סכום זניח','כפילות'];
  function nrTags(){ try{ return JSON.parse(localStorage.getItem('hkNrTags')||'null')||NR_TAGS_DEF.slice(); }catch(e){ return NR_TAGS_DEF.slice(); } }
  function nrTagsSave(a){ localStorage.setItem('hkNrTags',JSON.stringify(a)); }
  let _nrIx=null, _nrPick=null, _nrAdd=false, _nrMode='del';
  function openNR(i){
    if(typeof docClose==='function') docClose();
    _nrIx=i; _nrPick=null; _nrAdd=false;
    const t=curTasks()[i];
    const isCa=t&&t.type==='carry';
    _nrMode=isCa?'ignore':'del';
    document.getElementById('nrTitle').textContent=(isCa?'התעלמות מנגררת':'מחיקת פעולה')+(t&&t.who?' — '+t.who:'');
    document.getElementById('nrSub').textContent=isCa
      ? 'הנגררת תרד מהרשימה כאן — הצפי עצמו לא משתנה בביזיבוקס. בחרו סיבה; התגים ניתנים לניהול.'
      : 'הפעולה תימחק מהתזרים. בחרו סיבה; התגים ניתנים לניהול.';
    nrRender();
    document.getElementById('nrOv').classList.add('show');
  }
  function nrRender(){
    const list=nrTags();
    document.getElementById('nrChips').innerHTML=
      list.map((x,ix)=>`<span class="nr-tag ${_nrPick===x?'on':''}" onclick="nrPick('${x.replace(/'/g,"\\'")}')">${x}
        <button class="nr-x" title="הסרת התג מהרשימה" onclick="event.stopPropagation();nrTagRm(${ix})">✕</button></span>`).join('')
      + (_nrAdd
        ? `<span class="nr-new"><input id="nrNew" placeholder="שם התג…" onkeydown="if(event.key==='Enter')nrTagAdd()">
             <button onclick="nrTagAdd()">הוספה</button><button class="g" onclick="_nrAdd=false;nrRender()">ביטול</button></span>`
        : `<button class="nr-addbtn" onclick="_nrAdd=true;nrRender();setTimeout(()=>{const e=document.getElementById('nrNew');if(e)e.focus();},0)">+ תג חדש</button>`);
    const b=document.getElementById('nrGoBtn');
    if(b){ b.disabled=!_nrPick;
      const n=_nrBulk?curTasks().filter(x=>x.type==='unexpected'&&!x.done).length:0;
      b.textContent=_nrBulk?('מחיקת '+n+' פעולות'):(_nrMode==='ignore'?'התעלם':'מחיקה'); }
  }
  /* מחיקה מרוכזת של הלא-צפויות — אותה דיסציפלינה כמו מחיקה בודדת:
     גם כאן חייבים לבחור תג סיבה, והוא נרשם על כל השורות. */
  let _nrBulk=false;
  function nrAll(){
    const open=curTasks().filter(t=>t.type==='unexpected'&&!t.done);
    if(!open.length) return;
    _nrBulk=true; _nrIx=null; _nrPick=null; _nrAdd=false; _nrMode='del';
    document.getElementById('nrTitle').textContent='מחיקת '+open.length+' פעולות לא צפויות';
    document.getElementById('nrSub').textContent=
      'כל '+open.length+' הפעולות יימחקו מהתזרים ויקבלו את אותה סיבה. בחרו תג; התגים ניתנים לניהול.';
    nrRender();
    document.getElementById('nrOv').classList.add('show');
  }
  function nrPick(x){ _nrPick=(_nrPick===x)?null:x; nrRender(); }
  function nrTagAdd(){
    const e=document.getElementById('nrNew'); if(!e) return;
    const v=(e.value||'').trim(); if(!v) return;
    const list=nrTags(); if(!list.includes(v)) list.push(v);
    nrTagsSave(list); _nrAdd=false; _nrPick=v; nrRender();
  }
  function nrTagRm(ix){
    const list=nrTags(); const gone=list[ix];
    list.splice(ix,1); nrTagsSave(list);
    if(_nrPick===gone) _nrPick=null;
    nrRender();
  }
  function nrClose(){document.getElementById('nrOv').classList.remove('show');_nrIx=null;_nrPick=null;_nrAdd=false;_nrBulk=false;}
  function nrGo(){
    if(!_nrPick){toast('צריך לבחור תג סיבה');return;}
    const r=_nrPick;
    if(_nrBulk){
      const T=curTasks();
      const ix=T.map((t,k)=>k).filter(k=>T[k].type==='unexpected'&&!T[k].done);
      nrClose();
      ix.forEach(k=>otHandle(k,'נמחקה — '+r));
      toast(ix.length+' פעולות לא צפויות נמחקו — '+r);
      return;
    }
    const i=_nrIx; nrClose();
    otHandle(i,(_nrMode==='ignore'?'הוסרה מהרשימה — ':'נמחקה — ')+r);
  }
  function opsSetView(v){OPS_VIEW=v;renderOps();}
  function opsToggleRow(i){OPS_OPEN.has(i)?OPS_OPEN.delete(i):OPS_OPEN.add(i);renderOps();}
  function rowBtns(t,i){
    const B=(cls,label,h)=>`<button class="ot-btn ${cls}" onclick="event.stopPropagation();${h}">${label}</button>`;
    if(t.type==='msg') return B('done','טופל',`otHandle(${i},'טופל · ✓ ללקוח',1)`);
    if(t.type==='doc') return B('ghost','לא רלוונטי',`openNR(${i})`)+B('done','הזנה למערכת',`openDocEntry(${i})`);
    if(t.type==='ai') return B('ghost','החלפת קטגוריה',`openCatPick(${i})`)+B('done','אישור ההמלצה',`openApproveOne(${i})`);

    if(t.type==='unexpected'||t.type==='carry'){
      const nRel=(t.related||[]).length;
      const isInc=t.type==='carry'&&t.dir==='inc';
      /* לא צפויה = תנועה שקיימת בבנק ואפשר להוציא אותה מהתזרים → **מחיקה**.
         נגררת = צפי שממתין; אין מה למחוק בו, רק להוריד אותו מהרשימה → **התעלם**.
         שניהם עוברים באותו פופאפ תגים, עם פועל שונה. */
      return (isInc?'<span class="ct-coll">גבייה מלקוחות</span>':'')
        +B('ghost','היסטוריה'+(nRel?' ('+nRel+')':''),`histMatch(${i})`)
        +B('ghost del',t.type==='carry'?'התעלם':'מחיקה',`openNR(${i})`)
        +(t.type==='carry'?B('ghost del','מחיקה',`cdOpen(${i})`):'')
        +(isInc?B('','תזכורת גבייה',`openSM(${i})`):'');
    }
    return B('ghost','לא רלוונטי',`otHandle(${i},'לא רלוונטי')`)+B('','שליחת הודעה',`otHandle(${i},'נשלחה הודעה ללקוח')`);
  }
  const grpCtx=t=>t.ctx?`<div class="grp-ctx"><div class="grp-ctx-h">הקשר מהקבוצה <span class="grp-tag">בוט · סווג תפעולי</span></div>
    ${t.ctx.map(c=>`<div class="grp-ctx-m ${c.startsWith('[מנהל')?'me':''}">${c}</div>`).join('')}</div>`:'';
  function taskBody(t,i){
    const rep=`<div class="ot-reply" style="display:flex"><input id="oti${i}" placeholder="הקלד תגובה ללקוח…" onkeydown="if(event.key==='Enter')otSend(${i})"><button onclick="otSend(${i})">שלח</button></div>`;
    if(t.type==='unexpected'||t.type==='carry'){
      const isCa=t.type==='carry';
      /* בדיקת ההתאמה — מופרדת לפי מקור, שורה למקור. לנגררת מחפשים אם הפעולה
         כן קרתה: בבנק או באשראי. ללא-צפויה מחפשים אם היא כן נצפתה בתזרים. */
      /* הבנק לא מקבל שורת בדיקה משלו — ההיסטוריה למטה **היא** תנועות הבנק,
         ושתי תצוגות לאותו מקור רק סותרות זו את זו. נשאר מה שבאמת מקור נוסף. */
      const SRC = isCa ? [['אשראי', t.mCard]] : [['הצפי בתזרים', t.mFcast]];
      const line=([lbl,m])=>m
        ? `<div class="ms-row hit"><span class="ms-src">${lbl}</span>
             <span class="ms-txt">${m.t} · <b>${m.amt}</b> · ${m.d}</span>
             <span class="ms-tag">להתאים בביזיבוקס</span></div>`
        : `<div class="ms-row"><span class="ms-src">${lbl}</span><span class="ms-none">לא נמצאה תנועה תואמת</span></div>`;
      const mb2=`<div class="ms-wrap"><div class="ms-h">${isCa?'נבדק גם בכרטיסי האשראי · 30 יום אחורה':'נבדק מול הצפי בתזרים · 30 יום קדימה'}</div>
        ${SRC.map(line).join('')}</div>`;
      const rel=(t.related&&t.related.length)?`<div class="rel-wrap">
      <div class="rel-h">תנועות בבנק — "${t.who}" <span>${t.related.length}</span></div>
      ${t.related.map(r=>`<div class="rel-row"><span class="rel-d">${r.d}</span><span class="rel-t">${r.t}</span><span class="rel-cat">${r.cat}</span><b class="rel-amt">${r.amt}</b></div>`).join('')}
    </div>`:`<div class="rel-wrap"><div class="ops-empty" style="padding:14px">אין תנועות בבנק ל"${t.who||'המוטב'}" — מופע ראשון.</div></div>`;
      return mb2+rel;
    }
    if(t.type==='msg') return `${grpCtx(t)}<div class="ot-thread">${(t.thread||[]).map(m=>`<div class="ot-bub">${m}</div>`).join('')}</div>${rep}`;
    if(t.type==='doc') return `<div class="ot-doc"><div class="ot-docprev" onclick="toast('הגדלת מסמך')"><span class="ot-zoom">⤢ הגדלה</span><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>תצוגה מקדימה של המסמך</div></div>${rep}`;
    if(t.type==='ai') return `<div class="ot-ai"><div class="ot-airow"><span class="ot-ailbl">פעולה</span><span>${t.op}</span></div><div class="ot-airow"><span class="ot-ailbl">קטגוריה נוכחית</span><span>${t.cur}</span></div><div class="ot-airow"><span class="ot-ailbl">קטגוריה מומלצת</span><span class="ot-rec">${t.rec}</span></div><div class="ot-reason"><b>סיבה:</b> ${t.reason}</div>
      <div class="ot-srcs">
        <div class="ot-srcrow"><span class="src-b hist">היסטוריה</span><span>${t.hist||'לא נמצאו פעולות דומות בעבר'}</span></div>
        <div class="ot-srcrow"><span class="src-b goog">גוגל</span><span>${t.goog||'לא נדרש חיפוש'}</span></div>
        <div class="ot-srcrow"><span class="src-b aid">החלטת ה-AI</span><span>${t.aiDec||t.reason}</span></div>
      </div></div>`;
    return `<div class="ot-text">${t.text}</div>`+(t.type==='unexpected'?`<div style="margin-top:10px"><button class="ot-btn ghost" onclick="toast('צפייה בתנועות קשורות')">צפייה בתנועות קשורות</button></div>`:'');
  }
  function opsRow(t,i){
    const tp=OPS_TYPES[t.type], op=OPS_OPEN.has(i);
    if(t.done) return `<div class="orow2item ${t.type} is-done"><div class="orow2"><div class="orow2-body"><div class="orow2-title">${grpChip(t)}${taskTitle(t)}</div></div><span class="orow2-doneflag">✓ ${t.result||'טופל'}</span></div></div>`;
    /* בחירה להתאמה ידנית — זה המנגנון היחיד מאז שהמלצות ההתאמה ירדו,
       ולכן הוא חייב להיראות כפקד ולא כריבוע דק ליד טקסט. */
    /* ההתאמה בביזיבוקס; ההמלצות ירדו גם מהשורות — נשארו רק בבדיקת ההתאמה שבפתיחה. */
    const muOff=false, muChk='', recNote='';
    return `<div class="orow2item ${t.type} ${op?'open':''} ${muOff?'acct-dim':''}">
      <div class="orow2">
        ${muChk}
        <div class="orow2-body" onclick="opsToggleRow(${i})"><div class="orow2-title">${grpChip(t)}${taskTitle(t)}</div><span class="cu-chips">${acctChip(t)}${t.pay?`<span class="pay-chip">${t.pay}${t.ref?' · אסמ׳ '+t.ref:''}</span>`:''}</span>${recNote}</div>
        <div class="orow2-act">${rowBtns(t,i)}</div>
        <svg class="orow2-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="opsToggleRow(${i})"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${op?`<div class="orow2-detail">${taskBody(t,i)}</div>`:''}
    </div>`;
  }
  /* בדיקת התאמה מול Bizibox — 30 יום קדימה, לפי תיאור וקטגוריה */
  function matchCheck(i){
    const t=curTasks()[i]; if(!t) return;
    t._matchChk=true;
    OPS_OPEN.add(i);
    renderOps();
  }
  /* כפתור מאוחד: פותח יחד את ההיסטוריה ואת בדיקת ההתאמה; לחיצה נוספת סוגרת */
  function histMatch(i){
    if(OPS_OPEN.has(i)){OPS_OPEN.delete(i);renderOps();return;}
    matchCheck(i);
  }
  /* התאמה ידנית רבים-מול-רבים בין לא צפויות לנגררות */
  function otHandle(i,result,toClient){const t=curTasks()[i];if(!t)return;
    t.done=true;t.result=result;t.handledAt='עכשיו';OPS_DONE++;
    CLIENTS[CUR].opsPending=curTasks().filter(x=>!x.done).length;
    OPS_OPEN.delete(i);renderOps();
    // כל המשימות טופלו ← שלב הבדיקות נפתח מעצמו
    if(OPSMODE&&!finPaused&&window._autoFin!==opsActiveKey&&curTasks().length&&stageTasksDone()){
      window._autoFin=opsActiveKey;
      setTimeout(()=>finishOps(),700);
    }
    if(result==='לא רלוונטי'){
      // פעולה "שקטה" ובלתי הפיכה — נותנים חלון ביטול
      toastUndo('המשימה סומנה כלא רלוונטית',()=>{
        t.done=false;delete t.result;delete t.handledAt;OPS_DONE--;
        CLIENTS[CUR].opsPending=curTasks().filter(x=>!x.done).length;renderOps();
      });
    } else toast(toClient?'✓ נשלח אישור טיפול ללקוח':result);}
  function otSend(i){const inp=document.getElementById('oti'+i);if(!inp)return;const v=inp.value.trim();if(!v)return;inp.value='';toast('נשלחה תגובה ללקוח בוואטסאפ');}
  seedOps();


/* ===== מסך הודעות — הקבוצה + שיחות פרטיות של המנהל (בלי צ'אטי AI) =====
   הסים של HK: גם הפרטי עובר בצינור — ראוטינג זהה לקבוצה. */
let MSGS_SEL='group', MSGS_Q='';
const MSGS_THREADS={
  group:{name:'הקבוצה', sub:'לקוח · יועץ · מנהל תזרים · בוט', icon:'📱', unread:2, msgs:[
    {day:'אתמול'},
    {who:'צחי עובד', role:'cl', t:'מצרף את אישור ההעברה ללדובק 🙏 [קובץ]', time:'10:12', tag:'→ משימת הזנה'},
    {who:'לירון (מנהל תזרים)', role:'me', t:'תודה! חסר לי עוד מועד פירעון לשיק 21036', time:'10:20', tag:'בקשה פתוחה'},
    {who:'אילון (יועץ)', role:'adv', t:'צחי, מחר ב-16:00 עוברים על התקציב לקראת הרבעון', time:'12:40'},
    {who:'צחי עובד', role:'cl', t:'סגור. דרך אגב — סגרנו את החוזה עם מרכז הבנייה 🎉', time:'12:44', tag:'→ זיכרון · אירועים'},
    {who:'בוט HK', role:'bot', t:'📋 סיכום פגישת 09:00 נשלח · נפתחו 3 משימות', time:'13:05'},
    {day:'היום'},
    {who:'רות אלמוג', role:'cl', t:'מעבירה את צפי התשלומים לאוגוסט [טבלה]', time:'08:55', tag:'→ טבלת הזנה'},
    {who:'צחי עובד', role:'cl', t:'ההוראה להראל יורדת מחר', time:'11:40', tag:'→ נגררת'},
    {who:'אילון (יועץ)', role:'adv', t:'בוא נדבר גם על התמחור מול רימון בפגישה', time:'12:10', tag:'→ זיכרון'},
  ]},
  u0:{name:'צחי עובד · פרטי', sub:'שיחה ישירה שלך · דרך הסים של HK', icon:'👤', unread:0, msgs:[
    {day:'אתמול'},
    {who:'לירון (מנהל תזרים)', role:'me', t:'צחי, ראיתי חיוב PAYPAL 1,120 ₪ בכרטיס — של מה זה?', time:'14:02'},
    {who:'צחי עובד', role:'cl', t:'זה כלי ניהול המלאי החדש, מנוי שנתי', time:'14:15', tag:'→ קיטלוג'},
    {who:'לירון (מנהל תזרים)', role:'me', t:'מעולה, מקטלג ככה. תודה!', time:'14:16'},
  ]},
  u1:{name:'רות אלמוג · פרטי', sub:'שיחה ישירה שלך · דרך הסים של HK', icon:'👤', unread:1, msgs:[
    {day:'היום'},
    {who:'לירון (מנהל תזרים)', role:'me', t:'רות, מה מועד הפירעון של השיק לפלסט-גל?', time:'09:30'},
    {who:'רות אלמוג', role:'cl', t:'25.8, שיק 21045. מעדכנת גם בטבלה', time:'09:44', tag:'→ טבלת הזנה'},
    {who:'רות אלמוג', role:'cl', t:'ותגיד — אפשר לדחות את ההו״ק של הליסינג לסוף חודש?', time:'11:52'},
  ]},
};
function renderMsgsView(){
  const el=document.getElementById('viewMsgs'); if(!el)return;
  const isAdv=(typeof ROLE!=='undefined'&&ROLE==='advisor');
  /* בעל העסק רואה את הקבוצה בלבד: השיחות ה"פרטיות" הן של מנהל התזרים
     מול כל עובד בנפרד — לא שלו, ובוודאי לא של עובד אחר. */
  const isCli=(typeof ROLE!=='undefined'&&(ROLE==='client1'||ROLE==='clientN'));
  const keys=Object.keys(MSGS_THREADS).filter(k=>(!isAdv&&!isCli)||k==='group');
  if(!keys.includes(MSGS_SEL))MSGS_SEL=keys[0];
  const T=MSGS_THREADS[MSGS_SEL];
  const q=MSGS_Q.trim();
  const list=keys.map(k=>{const t=MSGS_THREADS[k];const last=[...t.msgs].reverse().find(m=>!m.day);
    return `<div class="mg-th ${k===MSGS_SEL?'on':''}" onclick="MSGS_SEL='${k}';MSGS_Q='';renderMsgsView()">
      <span class="mg-ico">${t.icon}</span>
      <div class="mg-tb"><b>${t.name}</b><span>${last?last.t.slice(0,34):''}${last&&last.t.length>34?'…':''}</span></div>
      ${t.unread?`<i class="mg-n">${t.unread}</i>`:''}
    </div>`;}).join('');
  const msgs=T.msgs.filter(m=>m.day||!q||m.t.includes(q)||m.who.includes(q)).map(m=>m.day
    ?`<div class="mg-day"><span>${m.day}</span></div>`
    :`<div class="mg-m ${m.role}">
        <div class="mg-bub">
          ${MSGS_SEL==='group'?`<b class="mg-who ${m.role}">${m.who}</b>`:''}
          <span class="mg-t">${m.t}</span>
          <span class="mg-meta">${m.time}${(m.tag&&!isCli)?` <i class="mg-tag">${m.tag}</i>`:''}</span>
        </div>
      </div>`).join('');
  el.innerHTML=`<div class="mg">
    <aside class="mg-side">
      <div class="mg-side-h">שיחות · ${(CLIENTS[CUR]||{}).name||''}</div>
      ${list}
      <div class="mg-note">${isCli
        ? 'כל מה שנכתב כאן מגיע ליועץ ולמנהל התזרים שלך ב-HK. אין צורך לחזור על זה במייל.'
        : 'הכל דרך הסים של HK — כל שיחה עוברת את אותו ראוטינג: משימות, זיכרון, נגררות.'+(isAdv?'':' הפרטי שלך גלוי רק לך ולאדמין.')}</div>
    </aside>
    <div class="mg-main">
      <div class="mg-head">
        <div><b>${T.name}</b><span>${T.sub}</span></div>
        <input class="mg-search" placeholder="חיפוש בשיחה…" value="${q}" oninput="MSGS_Q=this.value;renderMsgsView();this.focus();this.setSelectionRange(this.value.length,this.value.length)">
      </div>
      <div class="mg-scroll" id="mgScroll">${msgs||'<div class="ops-empty" style="padding:30px">אין תוצאות</div>'}</div>
      <div class="mg-comp">
        <input class="mx2-inp" id="mgInp" placeholder="${MSGS_SEL==='group'?'כתיבה לקבוצה — בשמך…':'הודעה ל'+T.name.replace(' · פרטי','')+'…'}" onkeydown="if(event.key==='Enter')mgSend()">
        <button class="oqs-send" onclick="mgSend()">שליחה</button>
      </div>
    </div>
  </div>`;
  const sc=document.getElementById('mgScroll'); if(sc)sc.scrollTop=sc.scrollHeight;
}
function mgSend(){
  const i=document.getElementById('mgInp'); if(!i||!i.value.trim())return;
  MSGS_THREADS[MSGS_SEL].msgs.push({who:'לירון (מנהל תזרים)', role:'me', t:i.value.trim(), time:'עכשיו'});
  renderMsgsView();
}
