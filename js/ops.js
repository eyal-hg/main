/* HK Dashboard — operations mode: timer, role, enter/exit, finish flow (Bizibox checks), task handling */
  /* ---- operations mode (מתפעל בלבד) ---- */
  let isOperator=true, OPSMODE=false;
  /* שלבי העבודה בתפעול — סדר קבוע, משותף למסך ולסרגל */
  const OPS_STAGES=[
    ['ai','קטגוריות','אישור המלצות הקיטלוג של ה-AI'],
    ['payee','מוטבים','שיקים יוצאים מ-Bizibox — הזנת מוטב וקטגוריה'],
    ['carry','נגררות ולא צפויות','פעולות שצפינו וטרם הופיעו · פעולות שהופיעו בלי צפי'],
    ['msg','הודעות לקוח','הודעות מלל וקבצים מהלקוח — מענה והזנה לתזרים'],
    ['sheet','גוגל שיט','עדכוני הכנסות והוצאות מהגיליונות'],
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
    // מסך עבודה נקי: שם החברה חי בבאנר — בלי כותרת כפולה ובלי סרגל
    document.querySelector('.client-head').style.display='none';
    document.querySelector('.sub-line').style.display='none';
    document.getElementById('shell').classList.add('no-rail');
    // re-entry after completed finish: keep counting from the recorded duration, button becomes refresh
    const wasDone=opsDoneSet.has(opsActiveKey);
    if(wasDone && opsAccum[opsActiveKey]==null) opsAccum[opsActiveKey]=opsDur[opsActiveKey]||0;
    document.getElementById('opsDoneTag').style.display=wasDone?'':'none';
    document.getElementById('opsFinBtn').innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6"/></svg> רענון נתונים';
    OPS_VIEW='open'; renderOps();
    // אין בכלל מה לתפעל? — עוברים אוטומטית לרענון ולבדיקות
    if(!finPaused&&!wasDone&&window._autoFin!==opsActiveKey&&stageTasksDone()){
      window._autoFin=opsActiveKey;
      setTimeout(()=>finishOps(),800);
    }
    // אם יצאנו באמצע הבדיקות — חוזרים ישר אליהן
    if(finPaused&&FIN_STATE&&FIN_STATE.key===opsActiveKey){
      document.getElementById('opsGrid').style.display='none';
      document.getElementById('finView').style.display='';
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
    'בדיקת דוח תקציבי',
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
    openRefresh('manual');
  }
  function finishOps(){
    if(finPaused){opsTotal=(opsAccum[opsActiveKey]||0)+opsSession();stopOpsTimer();finPaused=false;document.getElementById('opsGrid').style.display='none';document.getElementById('finView').style.display='';return;}
    if(window._refPassed===opsActiveKey){finishOps2();return;}
    openRefresh('gate');
  }
  /* רענון נתוני ה-raw data — זמין תמיד, וגם השער בין חלק 1 לחלק 2 */
  let _refMode='manual';
  function openRefresh(mode){
    _refMode=mode||'manual';
    document.getElementById('refOv').classList.add('show');
    document.getElementById('refBody').innerHTML='<div class="ref-spin"><div class="ref-spinner"></div><div>מרענן נתוני raw data מ-Bizibox · סורק כפילויות בתזרים ובאשראי…</div></div>';
    setTimeout(()=>{
      refDups=(CUR===0&&window._refPassed!==opsActiveKey)?REF_DUPS_DEMO.map(d=>({...d,res:null})):[];
      renderRefDups();
    },1100);
  }
  function renderRefDups(){
    const body=document.getElementById('refBody');
    if(!refDups.length){
      body.innerHTML='<div class="ref-clean">✓ הנתונים עודכנו — לא נמצאו כפילויות'+(_refMode==='gate'?' · ממשיכים לבדיקות':'')+'</div>';
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
    if(_refMode==='gate') finishOps2();
    else toast('נתוני ה-raw data עודכנו ✓');
  }
  function finishOps2(){
    opsTotal=(opsAccum[opsActiveKey]||0)+opsSession(); stopOpsTimer();
    if(window._stgIx!=null&&window._stgT0){const secs=Math.round((Date.now()-window._stgT0)/1000);
      OPS_STAGE_LOG.push({n:'שלב אחרון',s:secs});window._stgIx=null;}
    document.getElementById('opsGrid').style.display='none';
    document.getElementById('finView').style.display='';
    document.getElementById('finFoot').classList.remove('show');
    document.getElementById('finFoot').innerHTML='';
    document.getElementById('finFindings').innerHTML='';
    finOpen=FIN_FINDINGS.map((f,ix)=>ix); // all findings open at start of each run
    document.getElementById('finTitle').textContent=opsDoneSet.has(opsActiveKey)?'מרענן נתונים…':'מסיים תפעול…';
    document.getElementById('finSub').textContent='מרענן נתונים מ-Bizibox ובודק את תקינות התזרים מול התקציב';
    const ico=document.getElementById('finIco'); ico.className='fin-ico'; ico.innerHTML='<div class="spin"></div>';
    document.getElementById('finSteps').innerHTML=FIN_STEPS.map((s,i)=>
      `<div class="fin-step" id="fstep${i}"><span class="fs-num">${i+1}</span><span class="fs-ico"></span><span>${s}</span><span class="fs-tag" id="ftag${i}"></span></div>`).join('');
    finTimers.forEach(clearTimeout); finTimers=[];
    finCurStep=0; runFinStep(0);
  }
  /* מכונת שלבים: כל שלב רץ, ואם יש ממצאים — עוצרים בו עד שמטפלים, ואז ממשיכים */
  let finCurStep=0;
  function runFinStep(i){
    finCurStep=i;
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
        document.getElementById('ftag'+i).textContent=BL_OK.length+' שורות';
        document.getElementById('finTitle').textContent='שלב 1: שורות תקציביות';
        document.getElementById('finSub').textContent='סקירה — כל השורות של החברה · עברו ובדקו, ואז המשיכו';
        renderBLReview();
      },900));
      return;
    }
    if(i===2){
      // דוח תקציבי: חסרים בתזרימים מול חריגות בתקציב — רק קטגוריות מהותיות
      finTimers.push(setTimeout(()=>{
        const nOver=BR_DATA.filter(x=>x.kind==='over'&&x.ess).length, nMiss=BR_DATA.filter(x=>x.kind==='miss'&&x.ess).length;
        el.className='fin-step warn';el.querySelector('.fs-ico').innerHTML='!';
        document.getElementById('ftag'+i).textContent=nOver+' חריגות · '+nMiss+' חסרים';
        document.getElementById('finTitle').textContent='שלב 3: בדיקת דוח תקציבי';
        document.getElementById('finSub').textContent='קטגוריות מהותיות בלבד · בפועל מול חזוי מול תקציב';
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
    document.getElementById('finTitle').textContent='התפעול הסתיים ✓';
    document.getElementById('finSub').textContent='כל שלבי העבודה והבדיקה עברו · הושלם ב-'+fmtDur(opsTotal);
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
  /* ===== דוח תקציבי: חסרים בתזרימים / חריגות בתקציב — מהותיים בלבד ===== */
  const BR_DATA=[
    {kind:'miss', cat:'ביטוחים',        typical:24000, actual:8000,  future:0,     ess:true},
    {kind:'miss', cat:'מיסים ואגרות',   typical:42000, actual:14000, future:10000, ess:true},
    {kind:'over', cat:'שיווק ופרסום',   budget:15000,  actual:22400, fore:0, ess:true,
      tx:[{d:'03.07',t:'קמפיין גוגל — יולי',a:'6,200'},{d:'09.07',t:'פייסבוק אדס',a:'5,400'},{d:'15.07',t:'הדפסות ושילוט',a:'4,300'},{d:'22.07',t:'משרד יח"צ — ריטיינר',a:'6,500'}]},
    {kind:'over', cat:'רכב ודלק',       budget:8000,   actual:11300, fore:0, ess:true,
      tx:[{d:'05.07',t:'דלק — פזומט',a:'3,900'},{d:'12.07',t:'טיפול 30,000 למסחרית',a:'4,200'},{d:'20.07',t:'דלק — פזומט',a:'3,200'}]},
    {kind:'over', cat:'שכר עבודה',      budget:60000,  actual:62100, fore:0, ess:false,
      tx:[{d:'01.07',t:'משכורות יוני',a:'62,100'}]},
  ];
  function renderBReport(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const fmt=n=>n.toLocaleString();
    const ess=BR_DATA.filter(x=>x.ess);
    const missAll=ess.filter(x=>x.kind==='miss'&&!BL_OK.some(b=>b.cat===x.cat));
    const missRows=missAll.map(x=>{
      const gap=x.typical-x.actual-x.future;
      const stat=(l,v,cls)=>`<div class="fb-s ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
      return `<div class="br-row">
        <div class="br-h"><b>${x.cat}</b></div>
        <div class="fb-stats" style="margin:0 0 8px">
          ${stat('יעד (לפי היסטוריה)',fmt(x.typical))}
          ${stat('בפועל',fmt(x.actual))}
          ${stat('צבוע',x.future?fmt(x.future):'—')}
          ${stat('חסר',fmt(gap),gap>0?'neg':'')}
        </div>
        <div class="br-acts">
          <button class="ot-btn done sm" onclick="brOpenLine('${x.cat}')">פתיחת שורה תקציבית</button>
          <button class="ot-btn ghost sm" onclick="brMsg('${x.cat}','miss')">הלקוח ישלח חומר</button>
        </div>
      </div>`;}).join('');
    const overRows=ess.filter(x=>x.kind==='over').map(x=>{
      const pct=Math.round(x.actual/x.budget*100);
      return `<div class="br-row">
        <div class="br-h"><b>${x.cat}</b><span class="br-nums">בפועל ${fmt(x.actual)} · תקציב ${fmt(x.budget)}</span></div>
        <div class="br-bar over" onclick="brTx('${x.cat}')" title="לחיצה — התנועות של הקטגוריה">
          <i class="red" style="width:100%"></i><em style="inset-inline-start:${Math.round(x.budget/x.actual*100)}%" title="גבול התקציב"></em>
        </div>
        <div class="br-acts">
          <span class="br-pct neg">${pct}% מהתקציב</span>
          <button class="ot-btn ghost sm" onclick="brTx('${x.cat}')">תנועות</button>
          <button class="ot-btn ghost sm" onclick="brBudget('${x.cat}')">שינוי תקציב</button>
          <button class="ot-btn sm" onclick="brMsg('${x.cat}','over')">שליחת הודעה ללקוח</button>
        </div>
      </div>`;}).join('');
    box.innerHTML=`<div class="bl-top">
        <span>דוח תקציבי — קטגוריות מהותיות בלבד <button class="chk-ruleslink" style="border:none;background:none;cursor:pointer" onclick="brEssOpen()">⚙ תיוג מהותיים</button></span>
        <button class="ot-btn done" onclick="brGo()">הבדיקה הושלמה — סיום</button>
      </div>
      <div class="cu-split" style="border:none">
        <div><div class="pay-grp">🔵 חסרים בתזרימים <em>${missAll.length}</em></div>
          <div class="catm-sub" style="margin:2px 4px 8px">קטגוריה עם שורה תקציבית לא מופיעה כאן — הפער שלה כבר מנוהל בשלב 1.</div>
          ${missRows||'<div class="ops-empty" style="padding:14px">אין חסרים</div>'}</div>
        <div><div class="pay-grp">🔴 חריגות בתקציב <em>${ess.filter(x=>x.kind==='over').length}</em></div>${overRows||'<div class="ops-empty" style="padding:14px">אין חריגות</div>'}</div>
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
  function brGo(){
    const el=document.getElementById('fstep2');
    if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
    document.getElementById('ftag2').textContent='נבדק ✓';
    runFinStep(3);
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
    document.getElementById('smTo').textContent=contact+' · '+c.name+' · וואטסאפ';
    document.getElementById('smText').value=kind==='over'
      ?'היי '+contact+' 👋 בקטגוריית "'+cat+'" יש חריגה מהתקציב: בפועל '+fmt(x.actual)+' ₪ מול תקציב '+fmt(x.budget)+' ₪ ('+Math.round(x.actual/x.budget*100)+'%). רצינו לוודא שאתה מודע, ולבדוק אם לעדכן את התקציב או לבלום את ההוצאה.'
      :'היי '+contact+' 👋 בקטגוריית "'+cat+'" חסרים נתונים בתזרים: בפועל+חזוי '+fmt(x.actual+x.fore)+' ₪ מול תקציב '+fmt(x.budget)+' ₪. נשמח שתשלח חומר/אסמכתאות כדי שנשלים את התמונה.';
    window._smCustom=true;
    document.getElementById('smOv').classList.add('show');
  }
  /* שינוי תקציב */
  function brBudget(cat){
    const x=BR_DATA.find(v=>v.cat===cat); if(!x) return;
    const v=prompt('תקציב חדש ל"'+cat+'" (₪):',x.budget);
    if(v==null) return;
    const n=parseInt(String(v).replace(/\D/g,''),10);
    if(n){x.budget=n;renderBReport();toast('התקציב של "'+cat+'" עודכן ל-'+n.toLocaleString()+' ₪');}
  }
  /* תיוג קטגוריות מהותיות */
  function brEssOpen(){
    document.getElementById('essBody').innerHTML=BR_DATA.map((x,i)=>`
      <label class="cp-rule" style="padding:5px 0"><input type="checkbox" ${x.ess?'checked':''} onchange="BR_DATA[${i}].ess=this.checked;renderBReport()">
      <span>${x.cat} <i class="bl-hint">(${x.kind==='over'?'חריגה':'חסר'})</i></span></label>`).join('');
    document.getElementById('essOv').classList.add('show');
  }
  function essClose(){document.getElementById('essOv').classList.remove('show');}

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
  function renderBLReview(){
    const box=document.getElementById('finFindings');
    box.classList.add('bl-mode');
    const changed=BL_OK.filter(blChanged), pending=changed.filter(b=>!b.approved).length;
    const fmt=n=>n.toLocaleString();
    box.innerHTML=`<div class="bl-top">
        <span>השורות התקציביות — מצב לפני התפעול מול אחרי</span>
        <span class="bl-top-acts">
          <button class="ot-btn ghost sm" onclick="blOpenAdd()">+ שורה תקציבית לקטגוריה</button>
          <button class="ot-btn done" ${pending?'disabled':''} onclick="blReviewGo()">${pending?'בצעו את השינויים ('+pending+') כדי להמשיך':'המשך לשלב הבא'}</button>
        </span>
      </div>`+
      BL_OK.map(b=>{
        const rb=blRest(b,b.before), ra=blRest(b,b.after), ch=blChanged(b);
        const inst=blInstOf(b);
        const stat=(l,v,cls)=>`<div class="fb-s ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
        return `<div class="ffind bl-line ledger ${ch?(b.approved?'ba-ok':'ba-ch'):''}">
        <div class="bl-c-name">
          <b>${b.cat}</b>
          ${ch?(b.approved?'<span class="bl-okchip">✓ בוצע</span>':'<span class="ba-chip">שינוי — ממתין</span>'):'<span class="ba-same">אין שינוי</span>'}
          ${ch?`<i>לפני: ${fmt(rb)} · Δ ${fmt(Math.abs(ra-rb))}</i>`:''}
        </div>
        <div class="fb-stats ledger">
          ${stat('יעד חודשי',fmt(b.target))}
          ${stat('בפועל',fmt(b.after.actual))}
          ${stat('צבוע',b.after.future?fmt(b.after.future):'—')}
          ${stat('יתרה בשורה',fmt(ra),ra<0?'neg':'')}
          ${stat('המופע הקרוב',inst[0]?inst[0].d.slice(0,5):'—','first')}
        </div>
        ${blTimelineHtml(b,inst)}
        <div class="ffind-act">
          ${ch&&!b.approved?`<button class="ot-btn done sm" onclick="blApprove('${b.cat}')">בצע שינויים</button>`:''}
          <button class="ot-btn ghost sm" onclick="blInstOpenPop('${b.cat}')">⚙ ניהול השורה (${inst.length})</button>
        </div>
      </div>`;}).join('');
  }
  function blApprove(cat){
    const b=BL_OK.find(x=>x.cat===cat); if(!b) return;
    b.approved=true;
    const n=blInstOf(b).length;
    toast('השינויים בוצעו — '+(n?n+' שורות נבנו ב-Bizibox':'השורה אופסה ב-Bizibox'));
    renderBLReview();
  }
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
    foot.innerHTML=`
      <div class="fin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> אין חריגות — התזרים מוכן לשליחה</div>
      <button class="fin-wa" onclick="finSendCF()"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.14-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg> שליחת תזרים ללקוח</button>
      <button class="chip-btn" style="width:100%;justify-content:center" onclick="finishDone()">שמירה ללא שליחה</button>`;
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
    document.getElementById('finView').style.display='none';document.getElementById('opsGrid').style.display='';
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
      {type:'msg', who:'תומר לוי', thread:['האם עדכנת את כל התשלומים?','מה הצפי סה"כ בשלוש החשבונות?'], time:'לפני 12 דק׳'},
      {type:'doc', name:'אישור העברה — דיסקונט · 1,381 ₪', who:'צחי עובד', note:'העברתי עכשיו ללדובק, מצרף אישור 🙏', time:'לפני 10 דק׳', src:'הודעת לקוח', img:'m3.jpeg',
        file:{payee:'לדובק הפצה בע״מ', amount:'1,381', date:'28.07.2026', ref:'745851', desc:'העברה בנקאית — תשלום לספק'}},
      {type:'doc', name:'צילום שיק — הבינלאומי · 6,300 ₪', who:'צחי עובד', note:'', time:'לפני 25 דק׳', src:'הודעת לקוח', img:'m2.jpeg',
        file:{payee:'', amount:'6,300', date:'10.09.2026', ref:'3816543', desc:'שיק ידני'}},
      {type:'doc', name:'ספח שיק בכתב יד · 2,964 ₪', who:'צחי עובד', note:'רשמתי שיק ידני, מצרף את הספח', time:'לפני 40 דק׳', src:'הודעת לקוח', img:'m1.jpeg',
        file:{payee:'', amount:'2,964', date:'31.08.2026', ref:'21036', desc:''}},
      {type:'doc', name:'אקסל קופה קטנה — 3 שורות', who:'תומר לוי', note:'מצרף ריכוז הוצאות קופה קטנה של יולי', time:'לפני שעה', src:'הודעת לקוח',
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
      {type:'carry', text:'בחשבון מזרחי 295199 צפינו פעולת הוצאה "הראל (שילוח)" ע"ס 2,049 ₪. הפעולה טרם הופיעה — נגררת 11 ימים.', who:'הראל (שילוח)', amt:2049, time:'לפני שעה',
        related:[{d:'15.06.2026',t:'הוראת קבע — הראל שילוח · מזרחי 295199',amt:'2,049 ₪-',cat:'ביטוחים'},
                 {d:'15.05.2026',t:'הוראת קבע — הראל שילוח · מזרחי 295199',amt:'2,049 ₪-',cat:'ביטוחים'}]},
      {type:'carry', text:'צפינו תשלום ל"אלקטרה מיזוג" ע"ס 3,660 ₪ — טרם הופיע, נגרר 6 ימים.', who:'אלקטרה מיזוג', amt:3660, time:'לפני שעתיים',
        match:{t:'חיוב ויזה כ.א.ל — אלקטרה מיזוג', amt:'3,660 ₪-', d:'28.07 · אשראי'},
        related:[{d:'22.06.2026',t:'העברה — אלקטרה מיזוג',amt:'3,660 ₪-',cat:'ספקים'}]},
      {type:'carry', text:'הכנסה צפויה מ"מרכז הבנייה" ע"ס 18,600 ₪ — טרם הופיעה, נגררת 3 ימים.', who:'מרכז הבנייה', amt:18600, time:'היום 08:40',
        related:[{d:'25.06.2026',t:'תקבול — מרכז הבנייה',amt:'18,600 ₪+',cat:'הכנסות ממכירות'},
                 {d:'25.05.2026',t:'תקבול — מרכז הבנייה',amt:'17,200 ₪+',cat:'הכנסות ממכירות'},
                 {d:'26.04.2026',t:'תקבול — מרכז הבנייה',amt:'18,900 ₪+',cat:'הכנסות ממכירות'}]},
      {type:'unexpected', text:'בחשבון מזרחי 139287 הופיעה פעולה בשם "כהן טוב" ע"ס 238 ₪ שלא צפינו.', who:'כהן טוב', amt:238, time:'לפני שעה',
        related:[{d:'12.06.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'238 ₪-',cat:'שכר קבלני משנה'},
                 {d:'12.05.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'238 ₪-',cat:'שכר קבלני משנה'},
                 {d:'14.04.2026',t:'העברה — כהן טוב · מזרחי 139287',amt:'220 ₪-',cat:'שכר קבלני משנה'}]},
      {type:'unexpected', text:'חיוב לא מזוהה "PAYPAL *TX9915" ע"ס 1,120 ₪ בכרטיס האשראי.', who:'PAYPAL *TX9915', amt:1120, time:'היום 09:05', related:[]},
      {type:'unexpected', text:'בחשבון מזרחי 295199 הופיעה פעולה "הראל חב׳ לביטוח בע״מ" ע"ס 2,049 ₪ שלא צפינו.', who:'הראל חב׳ לביטוח בע״מ', amt:2049, time:'היום 09:20', related:[]},
      {type:'unexpected', text:'תקבול "מרכז הבנייה בע״מ — חלקי" ע"ס 10,000 ₪ שלא צפינו.', who:'מרכז הבנייה בע״מ — חלקי', amt:10000, time:'היום 10:02', related:[]},
      {type:'unexpected', text:'תקבול "מרכז הבנייה בע״מ" ע"ס 8,600 ₪ שלא צפינו.', who:'מרכז הבנייה בע״מ', amt:8600, time:'היום 10:03', related:[],
       match:{t:'הכנסה צפויה — מרכז הבנייה', amt:'8,600 ₪+', d:'12.08 · בתזרים'}},
      {type:'sheet', kind:'add', sheet:'הוצאות אוגוסט', who:'צחי עובד', time:'לפני 3 דק׳',
        rows:[{date:'02.08.2026', ref:'', desc:'ספק אריזות — הזמנה חדשה', amount:'5,200'},
              {date:'05.08.2026', ref:'', desc:'תשלום יועץ שיווק', amount:'3,000'}]},
      {type:'sheet', kind:'edit', sheet:'הכנסות אוגוסט', who:'צחי עובד', time:'לפני 20 דק׳',
        cell:'D14', desc:'תקבול מרכז הבנייה — אוגוסט', old:'17,500', new:'19,800'},
      {type:'sheet', kind:'edit', sheet:'הוצאות אוגוסט', who:'אוטומציה (Make)', time:'היום 08:55',
        cell:'C8', desc:'שכירות מחסן', old:'6,000', new:'6,450'},
      {type:'overdraft', text:'חשבון מרכנתיל 69855155 נמצא בחריגה ע"ס 42,445 ₪ ממסגרת האשראי. נא טיפול בהקדם.', time:'היום 09:14'},
      {type:'msg', who:'לירון', thread:['תודה על העדכון!'], time:'אתמול', done:true, result:'טופל · ✓ נשלח ללקוח', handledAt:'אתמול 16:20'},
      {type:'ai', op:'הוצאת ביטוח · 890 ₪-', cur:'כללי', rec:'ביטוחים', reason:'לפי תיאור הספק.', src:'HISTORY', time:'אתמול', done:true, result:'אושר — קוטלג בביטוחים', handledAt:'אתמול 15:05'},
    ];
    CLIENTS[1].tasks=[
      {type:'doc', name:'דף חשבון — מזרחי טפחות · יוני', time:'לפני 20 דק׳', src:'גוגל שיט'},
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
    if(t.type==='payee') return 'שיק יוצא מס׳ '+t.chk+' · '+t.amount+' ₪ · '+t.bank+(t.ocrName?'':' · המוטב לא זוהה');
    if(t.type==='ai'){
      const B={history:['היסטוריה','hist'],google:['גוגל','goog'],ai:['AI','aid']}[t.basis||'history'];
      return 'קיטלוג: '+t.op+` <span class="ai-basis ${B[1]}">לפי ${B[0]}</span>`;
    }
    return (t.text||'').replace(/\s+/g,' ').slice(0,70);
  }
  let OPS_OPEN=new Set();
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
    // פס הזרימה
    // פס הזרימה — עם מונה "כמה מחכה" בכל שלב, ולחיצה לתצוגה מקדימה
    const flow='<div class="ofl">'+STAGES.map((st,i)=>{
      const state=i<curIx?'done':i===curIx?'cur':'lock';
      const n=openBy(st[0]);
      const clk=(state==='lock'&&n>0);   // לחיץ רק אם באמת מחכה שם משהו
      return (i?'<span class="ofl-ln '+(i<=curIx?'done':'')+'"></span>':'')+
        `<span class="ofl-nd ${state} ${clk?'clk':''} ${window._opsPeek===i?'peek':''}" ${clk?`onclick="opsPeek(${i})"`:''} title="${st[1]}${clk?' — תצוגה מקדימה':''}">
          <b>${i<curIx?'✓':i+1}</b><i>${st[1]}</i>${n&&i>curIx?`<em>${n}</em>`:''}</span>`;
    }).join('')+'</div>';
    let cards='';
    if(OPS_VIEW==='open'){
      // מסך מלא לשלב אחד: הנוכחי — או שלב בתצוגה מקדימה (נעול למגע)
      const showIx=(window._opsPeek!=null&&window._opsPeek!==curIx)?window._opsPeek:curIx;
      if(showIx<STAGES.length){
        const [ty,label,sub]=STAGES[showIx];
        const rows=pool.filter(t=>stTypes(ty).includes(t.type));
        const isPeek=showIx!==curIx;
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
    document.getElementById('opsGrid').innerHTML =
      '<div class="ops-rows" style="margin-bottom:14px">'+head+flow+'</div>'+
      (cards?'<div class="ops-wgrid flow">'+cards+'</div>'
        :'<div class="ops-rows"><div class="ops-empty" style="padding:50px">'+(OPS_VIEW==='open'?'אין משימות תפעול פתוחות — כל הכבוד':'עדיין לא טופלו משימות')+'</div></div>');
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
    const _sc=document.getElementById('crScope'); if(_sc)_sc.style.display=isSel?'':'none';
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
    CAT_RULES.push({kind:CAT_TAB, match:m, to, scope:(CAT_TAB==='source'&&CR_SCOPE==='all')?'all':CUR, mode:CAT_TAB==='desc'?CR_MODE:null});
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
  function aiGrouped(rows,T){
    const groups=[];
    rows.forEach(t=>{
      let g=groups.find(x=>x.rec===t.rec);
      if(!g){g={rec:t.rec,items:[]};groups.push(g);}
      g.items.push(t);
    });
    return '<div class="ai-grid">'+groups.map(g=>`
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
  function matchApprovePair(ci,ui){
    const T=curTasks(), c=T[ci], u=T[ui]; if(!c||!u) return;
    c.done=true;c.result='הותאמה — הופיעה כ-"'+u.who+'"';c.handledAt='עכשיו';OPS_DONE++;
    u.done=true;u.result='הותאמה לצפי "'+c.who+'"';u.handledAt='עכשיו';OPS_DONE++;
    CLIENTS[CUR].opsPending=T.filter(x=>!x.done).length;
    renderOps();
    toast('ההתאמה אושרה — שתי הפעולות נסגרו');
  }
  function carryUnexpected(rows,T){
    const un=rows.filter(t=>t.type==='unexpected'), ca=rows.filter(t=>t.type==='carry');
    const recs=matchRecs(rows,T);
    const banner=recs.length?`<div class="mt-banner">
      ${recs.map(r=>`<div class="mt-row">
        <span class="mt-ic">🔗</span>
        <div class="mt-b">הפעולה שהופיעה <b>"${r.u.who}"</b> (${r.u.amt.toLocaleString()} ₪) היא כנראה הנגררת <b>"${r.c.who}"</b> (${r.c.amt.toLocaleString()} ₪)</div>
        <button class="ot-btn done sm" onclick="matchApprovePair(${r.ci},${r.ui})">אישור ההתאמה</button>
        <button class="ot-btn ghost sm" onclick="window._matchDismiss.add('${r.key}');renderOps()">לא אותה פעולה</button>
      </div>`).join('')}
    </div>`:'';

    // הגדרות פר-עמודה — נפתחות בגלגל השיניים שבכותרת
    window._cuSet=window._cuSet||{un:{on:true,min:1000},ca:{on:true,min:500,days:3,wait:4},open:null};
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
          <span>הודעות על פעולות לא צפויות בסכומים מעל</span>
          <span class="cu-amt"><input type="number" value="${st.min}" onchange="window._cuSet.un.min=+this.value"> ₪</span></label>
        <div class="cu-set-foot"><button class="ot-btn done" onclick="window._cuSet.open=null;renderOps();toast('ההגדרות נשמרו')">שמירה</button></div>
      </div>`;
      return `<div class="cu-set">
        <div class="cu-set-h">הגדרות ללקוח — ${CLIENTS[CUR].name}</div>
        <label class="cu-set-row"><input type="checkbox" ${st.on?'checked':''} onchange="window._cuSet.ca.on=this.checked">
          <span>הודעות על פעולות נגררות בסכומים מעל</span>
          <span class="cu-amt"><input type="number" value="${st.min}" onchange="window._cuSet.ca.min=+this.value"> ₪</span></label>
        <div class="cu-set-row sub"><span>נחשבת נגררת אחרי</span>
          <span class="cu-amt"><input type="number" value="${st.days}" onchange="window._cuSet.ca.days=+this.value"> ימים</span></div>
        <div class="cu-set-row sub"><span>הודעה נוספת ללקוח על אותה פעולה — רק בחלוף</span>
          <span class="cu-amt"><input type="number" value="${st.wait}" onchange="window._cuSet.ca.wait=+this.value"> ימים</span><span>מההודעה הקודמת</span></div>
        <div class="cu-set-foot"><button class="ot-btn done" onclick="window._cuSet.open=null;renderOps();toast('ההגדרות נשמרו')">שמירה</button></div>
      </div>`;
    };
    const col=(title,items,cls)=>`<div class="cu-col ${cls}">
      <div class="cu-h">${title} <span>${items.length}</span>${gear(cls)}</div>
      ${setPanel(cls)}
      ${items.length?items.map(t=>opsRow(t,T.indexOf(t))).join(''):'<div class="ops-empty" style="padding:14px">נקי ✓</div>'}
    </div>`;
    // פס התאמה ידנית — רבים מול רבים
    window._muSel=window._muSel||new Set();
    const selT=[...window._muSel].map(ix=>T[ix]).filter(Boolean);
    const sUn=selT.filter(t=>t.type==='unexpected'), sCa=selT.filter(t=>t.type==='carry');
    const fmtA=a=>a.reduce((s,t)=>s+(t.amt||0),0).toLocaleString('en-US');
    // הצ'קבוקסים תמיד גלויים — הפס מופיע ברגע שמסמנים
    const muBar=selT.length
      ?`<div class="mu-bar on"><span>התאמה ידנית: נבחרו <b>${sUn.length}</b> לא צפויות (${fmtA(sUn)} ₪) מול <b>${sCa.length}</b> נגררות (${fmtA(sCa)} ₪)</span>
         <button class="ot-btn done" onclick="muApply()">ביצוע ההתאמה</button>
         <button class="ot-btn ghost" onclick="muClear()">ניקוי בחירה</button></div>`
      :'';
    return banner+muBar+`<div class="cu-split">${col('לא צפויות',un,'un')}${col('נגררות',ca,'ca')}</div>`;
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
            <img src="${sel.img||'check.jpeg'}" class="chk-photo" alt="צילום השיק">
            <div class="chk-ocr-chips">📎 Bizibox · <span>תאריך ${sel.date}</span><span>סכום ${sel.amount} ₪</span>${sel.ocrName?`<span>מוטב: ${sel.ocrName}</span>`:'<span class="miss">מוטב לא זוהה</span>'}</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  function paySel(i){window._paySel=i;renderOps();}

  /* ===== שלב גוגל שיט: דיף שינויים — שורות חדשות ועדכוני סכום ===== */
  function sheetStage(rows,T){
    // שלב ראשון: לוג שינויים בלבד — העבודה נעשית ידנית ב-Bizibox, כאן רק מוודאים שכלום לא פוספס
    const logRow=t=>{
      const i=T.indexOf(t);
      if(t.done) return opsRow(t,i);
      const chip=t.kind==='add'?`<span class="sh-chip add">＋ ${t.rows.length} שורות</span>`:`<span class="sh-chip edit">✎ עדכון</span>`;
      const title=t.kind==='add'
        ?`גיליון "${t.sheet}" — נוספו ${t.rows.length} שורות`
        :`גיליון "${t.sheet}" — עודכן סכום: ${t.desc}`;
      const sub=t.kind==='add'
        ?`${t.rows.map(r=>r.desc+' · '+r.amount+' ₪').join('  ·  ')} — ${t.who} · ${t.time}`
        :`תא ${t.cell} · <s class="sh-old">${t.old} ₪</s> <span class="sh-arrow">←</span> <b class="sh-new">${t.new} ₪</b> — ${t.who} · ${t.time}`;
      return `<div class="orow2item sheet"><div class="orow2">
        ${chip}
        <div class="orow2-body"><div class="orow2-title">${title}</div><div class="orow2-sub">${sub}</div></div>
        <div class="orow2-act">
          <button class="ot-btn gsheet" onclick="event.stopPropagation();toast('נפתח הגיליון — ${t.sheet}${t.cell?' · תא ${t.cell}':''}')">📗 לגיליון ↗</button>
          <button class="ot-btn ghost" onclick="event.stopPropagation();toast('נפתח ב-Bizibox — ${t.sheet}')">פתיחה ב-Bizibox ↗</button>
          <button class="ot-btn done" onclick="otHandle(${i},'טופל ידנית ב-Bizibox · ✓ סומן בגיליון')">טיפלתי ✓</button>
        </div>
      </div></div>`;};
    const devNote=`<div class="dev-note">
      <div class="dev-note-h">🛠 הערה למתכנת — איך בונים את לוג השינויים</div>
      <ol>
        <li><b>זיהוי שינוי:</b> Drive API <code>files.watch</code> על כל spreadsheet — webhook נורה בכל שמירה (לחדש את ההרשמה כל 6 ימים, היא פגה). גיבוי: polling כל 5 דק׳. ה-webhook אומר רק "השתנה" — הוא מפעיל את הדיף.</li>
        <li><b>דיף:</b> Sheets API <code>values.get</code> על טווח הנתונים ← השוואה מול הסנפשוט האחרון ששמור אצלנו ← מפיקים: שורה חדשה / תא שעודכן (ערך ישן+חדש) / שורה שנמחקה. זיהוי שורה יציב גם אחרי מיון: עמודת ID נסתרת בגיליון או <code>DeveloperMetadata</code> מוצמד-שורה.</li>
        <li><b>שמירה:</b> טבלת <code>sheet_changes</code>: company_id, spreadsheet_id, sheet_name, change_type (add/edit/delete), row_key, cell, old_value, new_value, row_data (JSON), changed_by (מ-Apps Script onChange אם מותקן, אחרת null), detected_at, status (open/handled), handled_by, handled_at. הסנפשוט: <code>sheet_snapshots</code> — גרסה אחרונה בלבד פר גיליון + hash להשוואה מהירה.</li>
        <li><b>"טיפלתי":</b> status=handled + כתיבה חזרה לגיליון בעמודת סטטוס — <code>values.update</code>: "✓ טופל · 28.07 · אייל". זה מה שהלקוח רואה ומה שמונע טיפול כפול.</li>
        <li><b>המסך הזה:</b> כל הרשומות עם status=open של החברה הנוכחית, ממוינות לפי detected_at. הכפתור "לגיליון" פותח <code>spreadsheetUrl#gid=…&range=D14</code>.</li>
      </ol>
    </div>`;
    return `<div class="pay-grp" style="padding-inline:16px">יומן השינויים בגיליונות <em>${rows.filter(t=>!t.done).length}/${rows.length}</em></div>`+rows.map(logRow).join('')+devNote;
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
  function msgStage(rows,T){
    const txt=rows.filter(t=>t.type==='msg'), docs=rows.filter(t=>t.type==='doc');
    const docRow=t=>{
      const i=T.indexOf(t);
      if(t.done) return opsRow(t,i);
      const thumb=t.img?`<img src="${t.img}" alt="">`:'<span class="msg-thumb-x">📊</span>';
      return `<div class="orow2item doc"><div class="orow2">
        <span class="msg-thumb" onclick="openDocEntry(${i})" title="פתיחת ההזנה">${thumb}</span>
        <div class="orow2-body" onclick="openDocEntry(${i})"><div class="orow2-title">${taskTitle(t)}</div><div class="orow2-sub">${t.who||''} · ${t.time||''}${t.note?' · "'+t.note+'"':''}</div></div>
        <div class="orow2-act">${rowBtns(t,i)}</div>
      </div></div>`;};
    const grp=(label,arr,render)=>arr.length?`<div class="pay-grp" style="padding-inline:16px">${label} <em>${arr.filter(t=>!t.done).length}/${arr.length}</em></div>`+arr.map(render).join(''):'';
    return grp('💬 הודעות — מענה',txt,t=>opsRow(t,T.indexOf(t)))+grp('📎 מסמכים — הזנה למערכת',docs,docRow);
  }
  /* הודעת מלל — שיחה ומענה */
  function textMsgBody(t,i){
    return `<div class="msg-thread">
      ${(t.thread||[]).map(m=>`<div class="oqs-bub"><div class="oqs-bub-h">${t.who||'הלקוח'} · ${t.time||''}</div>${m}</div>`).join('')}
      <div class="oqs-reply" style="margin-top:12px">
        <input id="msgReply_${i}" placeholder="תגובה ללקוח בוואטסאפ…" onkeydown="if(event.key==='Enter')msgReplySend(${i})">
        <button class="oqs-send" onclick="msgReplySend(${i})">שליחה</button>
      </div>
      <div class="chk-actions"><button class="ot-btn done" onclick="otHandle(${i},'טופל · ✓ נענה ללקוח',1)">סימון כטופל</button>
      <button class="ot-btn ghost" onclick="openNR(${i})">לא רלוונטי</button></div>
    </div>`;
  }
  function msgReplySend(i){
    const inp=document.getElementById('msgReply_'+i); if(!inp||!inp.value.trim()) return;
    otHandle(i,'טופל · ✓ נשלחה תשובה: "'+inp.value.trim()+'"',1);
  }
  /* הודעת קובץ — המסמך מול טופס הזנה בסגנון Bizibox */
  function fileMsgBody(t,i){
    const f=t.file||{};
    const rows=f.rows||[{date:f.date||'', ref:f.ref||'', desc:f.desc||'', amount:f.amount||''}];
    const bizRow=r=>`<div class="biz-row">
        <input class="mx2-inp" value="${r.date||''}" placeholder="תאריך">
        <input class="mx2-inp" value="${r.ref||''}" placeholder="אסמכתא">
        <select class="mx2-inp"><option>ללא קטגוריה</option>${COMPANY_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        <input class="mx2-inp" value="${r.desc||''}" placeholder="תיאור">
        <input class="mx2-inp biz-amt" value="${r.amount||''}" placeholder="0" dir="ltr">
      </div>`;
    // צד המסמך: תמונה אמיתית / טבלת אקסל
    const docSide=t.changeCard
      ?t.changeCard
      :t.img
      ?`<img src="${t.img}" class="chk-photo doc-photo" alt="המסמך שהתקבל">`
      :f.rows
      ?`<div class="xls-paper"><div class="xls-top">📊 ${t.name}</div>
          <div class="xls-h"><span>תאריך</span><span>פירוט</span><span>סכום</span></div>
          ${f.rows.map(r=>`<div class="xls-r"><span>${r.date}</span><span>${r.desc}</span><b>${r.amount} ₪</b></div>`).join('')}
          <div class="xls-t"><span>סה״כ</span><b>${f.rows.reduce((s,r)=>s+(+String(r.amount).replace(/\D/g,'')||0),0).toLocaleString()} ₪</b></div>
        </div>`
      :'';
    const ocr=f.rows
      ?`<span>זוהו ${f.rows.length} שורות להזנה</span>`
      :`${f.payee?`<span>מוטב: ${f.payee}</span>`:'<span class="miss">מוטב לא זוהה — להזנה ידנית</span>'}<span>סכום ${f.amount||''} ₪</span><span>תאריך ${f.date||''}</span>`;
    return `<div class="pay-cols">
      <div class="biz-form">
        <div class="biz-selrow">
          <label>ח-ן <select class="mx2-inp"><option>מזרחי 295199</option><option>מרכנתיל 69855155</option></select></label>
          <label>סוג תשלום <select class="mx2-inp"><option>בחירה</option><option selected>העברה בנקאית</option><option>שיק</option><option>כרטיס אשראי</option><option>מזומן</option></select></label>
          <label>מוטב <input class="mx2-inp" id="bizPayee_${i}" value="${f.payee||''}" placeholder="${f.payee?'':'לא זוהה — להקליד מהמסמך'}"></label>
        </div>
        <div class="biz-thead"><span>תאריך</span><span>אסמכתא (אם קיים)</span><span>קטגוריה</span><span>תיאור</span><span>סכום</span></div>
        <div id="bizRows_${i}">${rows.map(bizRow).join('')}</div>
        <div class="biz-add" onclick="bizAddRow(${i})">＋ הוספת תשלומים</div>
        <div class="chk-actions">
          <button class="ot-btn done" onclick="bizSave(${i},false)">שמירה וסגירה</button>
          <button class="ot-btn ghost" onclick="bizSave(${i},true)">שמירה והוספת הוצאה חדשה</button>
          <span class="chk-ruleslink" onclick="openNR(${i})">לא רלוונטי</span>
        </div>
      </div>
      <div class="chk-imgwrap">
        ${t.note?`<div class="oqs-bub" style="margin-bottom:10px"><div class="oqs-bub-h">${t.who||'הלקוח'} · ${t.time||''}</div>${t.note}</div>`:''}
        ${docSide}
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
    d.innerHTML=`<input class="mx2-inp" placeholder="תאריך"><input class="mx2-inp" placeholder="אסמכתא"><select class="mx2-inp"><option>ללא קטגוריה</option>${COMPANY_CATS.map(c=>`<option>${c}</option>`).join('')}</select><input class="mx2-inp" placeholder="תיאור"><input class="mx2-inp biz-amt" placeholder="0" dir="ltr">`;
    w.appendChild(d);
  }
  function bizSave(i,another){
    const t=curTasks()[i]; if(!t) return;
    const payee=(document.getElementById('bizPayee_'+i)||{}).value||'';
    const rows=document.querySelectorAll('#bizRows_'+i+' .biz-row').length;
    docClose();
    otHandle(i,t.type==='sheet'
      ?(t.kind==='edit'?('עודכן בתזרים: '+t.old+' ← '+t.new+' ₪ · ✓ סומן בגיליון'):('הוזן לתזרים — '+rows+' שורות · ✓ סומן בגיליון'))
      :('הוזן לתזרים — '+payee+' · '+rows+' שורות'));
    if(another){
      // ממשיכים ישר למסמך הפתוח הבא — בלי לחזור לרשימה
      const T=curTasks(), nxt=T.findIndex(x=>x.type==='doc'&&!x.done);
      if(nxt>=0) openDocEntry(nxt); else toast('כל המסמכים הוזנו ✓');
    }
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
  function openSM(i){
    const t=curTasks()[i]; if(!t) return;
    _smIx=i;
    const c=CLIENTS[CUR], contact=(c.thread&&[...c.thread].reverse().find(m=>m.from==='user')||{}).name||'הלקוח';
    const draft=t.type==='carry'
      ?'היי '+contact+' 👋 בצפי התזרים מופיע תשלום ל"'+(t.who||'')+'" ע"ס '+(t.amt?t.amt.toLocaleString():'')+' ₪ שעדיין לא ירד בחשבון. יש עיכוב מולם, או שנעדכן את הצפי?'
      :'היי '+contact+' 👋 זיהינו בחשבון פעולה "'+(t.who||'')+'" ע"ס '+(t.amt?t.amt.toLocaleString():'')+' ₪ שלא הייתה בצפי. אפשר לדעת במה מדובר, כדי שנקטלג נכון בתזרים?';
    document.getElementById('smTo').textContent=contact+' · '+c.name+' · וואטסאפ';
    document.getElementById('smText').value=draft;
    document.getElementById('smOv').classList.add('show');
  }
  function smClose(){document.getElementById('smOv').classList.remove('show');_smIx=null;}
  function smGo(){
    const txt=document.getElementById('smText').value.trim();
    if(!txt){toast('ההודעה ריקה');return;}
    if(window._smCustom){window._smCustom=false;smClose();toast('נשלח ללקוח בוואטסאפ ✓');return;}
    const i=_smIx; smClose();
    otHandle(i,'נשלחה שאלה ללקוח · ✓ וואטסאפ');
  }
  /* לא רלוונטי — עם סיבה */
  let _nrIx=null;
  function openNR(i){
    if(typeof docClose==='function') docClose();
    _nrIx=i;
    document.getElementById('nrReason').value='';
    document.querySelectorAll('#nrChips .cp-chip').forEach(c=>c.classList.remove('on'));
    document.getElementById('nrOv').classList.add('show');
  }
  function nrChip(el){
    document.querySelectorAll('#nrChips .cp-chip').forEach(c=>c.classList.toggle('on',c===el));
    document.getElementById('nrReason').value=el.textContent;
  }
  function nrClose(){document.getElementById('nrOv').classList.remove('show');_nrIx=null;}
  function nrGo(){
    const r=document.getElementById('nrReason').value.trim();
    if(!r){toast('צריך סיבה — בחר או כתוב');return;}
    const i=_nrIx; nrClose();
    otHandle(i,'לא רלוונטי — '+r);
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
      return (nRel?B('ghost','היסטוריה ('+nRel+')',`opsToggleRow(${i})`):`<span class="ot-none">אין היסטוריה</span>`)
        +B('ghost','בדיקת התאמה',`matchCheck(${i})`)
        +(t.type==='carry'
          ?B('ghost','לא רלוונטי',`carrySnooze(${i})`)      // נגררת: מוסתרת להיום וחוזרת מחר
          :B('ghost','לא רלוונטי',`openNR(${i})`))          // לא צפויה: נמחקת עם סיבה
        +B('','שליחת הודעה',`openSM(${i})`);
    }
    return B('ghost','לא רלוונטי',`otHandle(${i},'לא רלוונטי')`)+B('','שליחת הודעה',`otHandle(${i},'נשלחה הודעה ללקוח')`);
  }
  function taskBody(t,i){
    const rep=`<div class="ot-reply" style="display:flex"><input id="oti${i}" placeholder="הקלד תגובה ללקוח…" onkeydown="if(event.key==='Enter')otSend(${i})"><button onclick="otSend(${i})">שלח</button></div>`;
    if(t.type==='unexpected'||t.type==='carry'){
      const isCa=t.type==='carry';
      const how=isCa?'נבדקו חיובי כרטיסי האשראי 30 יום אחורה לפי תיאור — ייתכן ששולם באשראי ואינו נגרר'
                    :'נבדקו תנועות הבנק 30 יום קדימה לפי תיאור וקטגוריה';
      const mb=t._matchChk?(t.match
        ?`<div class="mu-res found"><div><b>${isCa?'נמצא חיוב תואם באשראי':'נמצאה התאמה ב-Bizibox'}:</b> ${t.match.t} · <b>${t.match.amt}</b> · ${t.match.d}<span class="mu-how">${how}</span></div><button class="ot-btn done" onclick="otHandle(${i},'${isCa?'שולם באשראי — הותאם':'הותאם ב-Bizibox'}')">${isCa?'סימון כשולם באשראי':'ביצוע ההתאמה ב-Bizibox'}</button></div>`
        :`<div class="mu-res none">${how} — לא נמצאה התאמה.</div>`):'';
      const rel=(t.related&&t.related.length)?`<div class="rel-wrap">
      <div class="rel-h">היסטוריה — "${t.who}" <span>${t.related.length}</span></div>
      ${t.related.map(r=>`<div class="rel-row"><span class="rel-d">${r.d}</span><span class="rel-t">${r.t}</span><span class="rel-cat">${r.cat}</span><b class="rel-amt">${r.amt}</b></div>`).join('')}
      <div class="rel-note">נראה כמו תשלום חוזר — אפשר לקטלג לפי ההיסטוריה או לשלוח שאלה ללקוח.</div>
    </div>`:`<div class="rel-wrap"><div class="ops-empty" style="padding:14px">אין היסטוריה ל"${t.who||'המוטב'}" — מופע ראשון.</div></div>`;
      return mb+rel;
    }
    if(t.type==='msg') return `<div class="ot-thread">${(t.thread||[]).map(m=>`<div class="ot-bub">${m}</div>`).join('')}</div>${rep}`;
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
    if(t.done) return `<div class="orow2item ${t.type} is-done"><div class="orow2"><div class="orow2-body"><div class="orow2-title">${taskTitle(t)}</div></div><span class="orow2-doneflag">✓ ${t.result||'טופל'}</span></div></div>`;
    const muChk=(t.type==='unexpected'||t.type==='carry')
      ?`<label class="mu-chk side" onclick="event.stopPropagation()"><input type="checkbox" ${window._muSel&&window._muSel.has(i)?'checked':''} onchange="muSel(${i},this.checked)" title="בחירה להתאמה ידנית"></label>`:'';
    return `<div class="orow2item ${t.type} ${op?'open':''}">
      <div class="orow2">
        ${muChk}
        <div class="orow2-body" onclick="opsToggleRow(${i})"><div class="orow2-title">${taskTitle(t)}</div></div>
        <div class="orow2-act">${rowBtns(t,i)}</div>
        <svg class="orow2-chev" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="opsToggleRow(${i})"><path d="m6 9 6 6 6-6"/></svg>
      </div>
      ${op?`<div class="orow2-detail">${taskBody(t,i)}</div>`:''}
    </div>`;
  }
  /* נגררת לא רלוונטית — מוסתרת להיום בלבד, תוצג שוב מחר */
  function carrySnooze(i){
    const t=curTasks()[i]; if(!t) return;
    t.done=true; t.result='נדחה — יוצג שוב מחר'; t.handledAt='עכשיו';
    renderOps();
    toast('הפעולה הוסתרה להיום — תוצג שוב מחר בבוקר');
  }
  /* בדיקת התאמה מול Bizibox — 30 יום קדימה, לפי תיאור וקטגוריה */
  function matchCheck(i){
    const t=curTasks()[i]; if(!t) return;
    t._matchChk=true;
    OPS_OPEN.add(i);
    renderOps();
  }
  /* התאמה ידנית רבים-מול-רבים בין לא צפויות לנגררות */
  function muClear(){ window._muSel=new Set(); renderOps(); }
  function muSel(i,on){ window._muSel=window._muSel||new Set(); on?window._muSel.add(i):window._muSel.delete(i); renderOps(); }
  function muApply(){
    const T=curTasks();
    const sel=[...window._muSel];
    if(sel.length<2){toast('צריך לבחור פעולות משני הצדדים');return;}
    sel.forEach(i=>{const t=T[i];if(t){t.done=true;t.result='הותאם ידנית — קבוצה';t.handledAt='עכשיו';OPS_DONE++;}});
    toast('הותאמו '+sel.length+' פעולות — ההתאמה נרשמה ב-Bizibox');
    window._muSel=new Set();
    renderOps(); if(typeof renderOpsInfo==='function')renderOpsInfo();
  }
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

