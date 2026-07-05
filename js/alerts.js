/* HK Dashboard — metric alert engine, alerts focus (advisor/HK), health map */
  /* ===== מוקד התראות — reads each metric's own alert rule (defined in METRICS) ===== */
  const mVal=(c,key)=> key==='debt' ? (c.debt||0) : (c.metrics||{})[key];
  // generic rule evaluation — one law for every metric:
  //   value = הערך הנמדד לחברה; breach אם חצה את th בכיוון dir; warn (סף מוקדם) מייצר "לבדיקה"
  function alertVal(m,c){
    if(m.key==='meeting'){ if(c.product!=='money+') return null; return hasUpcomingMeeting(c)?1:0; }
    if(m.key==='overdraft'){ const d=mVal(c,'overdraft'); return (d>0)?d:null; }   // אין תחזית חריגה — אין ערך
    if(m.key==='debt') return c.debt||0;
    return mVal(c,m.key);   // budget/liters/cfprofit — אחוז מהיעד לחברה
  }
  function evalMetric(m,c){
    const rules=(m.alerts||[]).filter(r=>r.on); if(!rules.length) return null;
    const v=alertVal(m,c); if(v==null) return null;
    // כל החוקים נבדקים — מוחזרת החריגה החמורה ביותר (חברה לא מוצפת בכמה התראות על אותו מדד)
    let hit=null;
    rules.forEach(r=>{
      const past=r.dir==='above' ? v>r.th : v<r.th;
      if(!past) return;
      if(!hit || (r.sev==='high' && hit.rule.sev!=='high')) hit={sev:r.sev, v, rule:r};
    });
    return hit;
  }
  // כותרת + מטא קצר בלבד — בלי טקסט הסבר (בעשרות חברות זה רעש); ההסבר המלא ב"למה קיבלתי"
  function alertText(m,c,v){
    const n=c.name;
    switch(m.key){
      case 'budget': return v>100
        ? {t:n+' — חריגת תקציב תוביל לחריגת מסגרת',meta:'צפי חריגה בעוד 6 ימים'}
        : {t:n+' — קרוב לתקרת התקציב',meta:'לבדיקה השבוע'};
      case 'overdraft': return {t:n+' — חריגה צפויה בעו״ש',meta:'בעוד '+v+' ימים'};
      case 'debt': return {t:n+' — חוב פתוח לגבייה',meta:'בפיגור'};
      case 'liters': return {t:n+' — סך הליטרים מתחת ליעד',meta:'מדד חודשי'};
      case 'cfprofit': return {t:n+' — רווח תזרימי מתחת ליעד',meta:'מדד חודשי'};
      case 'meeting': return {t:n+' — לא נקבעה פגישה חודשית (Money+)',meta:'חובה החודש',btn:'שליחת זמנים ללקוח',click:"toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')"};
      default: return {t:n+' — '+m.name,meta:'מדד'};
    }
  }
  // value badge — הערך שנמדד, מוצג לצד ההתראה
  function alertVis(m,v){
    let vTxt=v, vSub='';
    if(m.key==='overdraft'){vTxt=v;vSub='ימים';}
    else if(m.key==='debt'){vTxt=Math.round(v).toLocaleString('en-US');vSub='₪';}
    else if(m.key==='meeting'){vTxt='0';vSub='נקבעו';}
    else {vTxt=v+'%';vSub='מהיעד';}
    return {vTxt,vSub};
  }
  function buildAlerts(){
    const RANK={high:0,mid:1,low:2}, out=[];
    CLIENTS.forEach((c,i)=>METRICS.forEach((m,mi)=>{
      const r=evalMetric(m,c); if(!r) return;
      out.push({sev:r.sev, i, mi, mkey:m.key, metric:m.name, rule:r.rule, ...alertVis(m,r.v), ...alertText(m,c,r.v)});
    }));
    // ליועץ: סיכומי פגישות שה-AI סיים לעבד וממתינים לאישורו
    if(ROLE==='advisor'){
      MEETINGS.forEach((mt,ix)=>{
        if(mt.status!=='summary') return;
        const i=CLIENTS.findIndex(c=>c.name===mt.client); if(i<0) return;
        out.push({sev:'mid', i, mkey:'summary', metric:'פגישות',
          t:mt.client+' — סיכום פגישה ממתין לאישור',
          meta:'הוקלטה '+mt.date.slice(0,5)+(mt.rec?' · '+mt.rec:''), btn:'אישור הסיכום', click:'openMeeting('+ix+')',
          why:'כל פגישה מוקלטת ומתועדת אוטומטית: ההקלטה ('+(mt.rec||'')+' מ-'+mt.date.slice(0,5)+') תומללה ונותחה על ידי ה-AI, והסיכום ממתין לאישורך לפני שליחה ללקוח.'});
      });
    }
    return out.sort((a,b)=>RANK[a.sev]-RANK[b.sev]);
  }
  function renderAlerts(){
    const alerts=buildAlerts();
    const board=document.getElementById('alBoard');
    /* בית היועץ = בדיוק 4 ווидג'טים קבועים:
       1 מדדים עסקיים · 2 חריגות צפויות · 3 פגישות · 4 חריגות תקציב (הוצאות + קצב הכנסות) */
    const FIXED=['overdraft','budget','meeting','summary','revenue','salesclr'];
    const WIDGETS=[
      {cls:'blue', title:'מדדים עסקיים', sub:'ליטרים · רווח תזרימי · גבייה · מדדים אישיים',
       ic:'<path d="M3 15l5-5 4 3 6-7"/><path d="M3 20h18"/>',
       pick:a=>!FIXED.includes(a.mkey), empty:'כל המדדים העסקיים בתוך היעד'},
      {cls:'coral', title:'חריגות צפויות', sub:'תחזית עו״ש מול מסגרת האשראי',
       ic:'<path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9 21v-6h6v6"/>',
       pick:a=>a.mkey==='overdraft', empty:'אין חריגות צפויות בעו״ש'},
      {cls:'navy', title:'פגישות', sub:'פגישה חודשית Money+ · סיכומי AI · קרובות',
       ic:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
       pick:a=>a.mkey==='meeting'||a.mkey==='summary', empty:'אין פגישות שדורשות טיפול', meetings:true},
      {cls:'amber', title:'חריגות תקציב', sub:'הוצאות מעל התקציב · אי-עמידה בקצב ההכנסות',
       ic:'<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>',
       pick:a=>['budget','revenue','salesclr'].includes(a.mkey), empty:'התקציב וההכנסות בקצב תקין'},
    ];
    board.innerHTML=WIDGETS.map(wd=>{
      const rows=alerts.filter(wd.pick);
      let body=rows.length?rows.map(afeedRow).join(''):`<div class="awdg-ok"><span>✓</span>${wd.empty}</div>`;
      // ווидג'ט הפגישות: אחרי ההתראות — הפגישות הקרובות והמתועדות
      if(wd.meetings){
        const up=MEETINGS.map((m,ix)=>({m,ix})).filter(x=>['upcoming','ai'].includes(x.m.status)).slice(0,4);
        if(up.length) body+=`<div class="aw-sec">הפגישות הקרובות · מתועדות אוטומטית</div>`+up.map(({m,ix})=>{
          const btn=m.status==='ai'
            ? `<button class="mt-btn view" disabled style="opacity:.55;cursor:default">בעיבוד AI…</button>`
            : `<button class="mt-btn view" onclick="toast('פרטי הפגישה')">פרטים</button>`;
          return `<div class="ameet">
            <div class="am-when"><b>${m.date.slice(0,5)}</b><span>${m.time.split('-')[0]}</span></div>
            <div class="am-b"><div class="am-n">${m.name} ${m.rec?`<span class="rec-badge">🎙 ${m.rec}</span>`:''}</div>
              <div class="am-c">${m.client} · ${m.status==='ai'?'ה-AI מעבד את ההקלטה':m.adv}</div></div>
            ${btn}
          </div>`;}).join('');
      }
      const worst=rows.some(a=>a.sev==='high');
      return `<div class="awdg awdg--${wd.cls}">
        <div class="awdg-head">
          <div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${wd.ic}</svg></div>
          <div class="awdg-tt"><div class="awdg-t">${wd.title}</div><div class="awdg-sub">${wd.sub}</div></div>
          ${rows.length
            ?`<div class="awdg-count ${worst?'hot':''}"><b>${rows.length}</b><i>התראות</i></div>`
            :`<div class="awdg-count ok"><b>✓</b><i>תקין</i></div>`}
        </div>
        <div class="awdg-body">${body}</div>
      </div>`;
    }).join('');
  }
  const SEV_LBL={high:'דחוף',mid:'לבדיקה',low:'מידע'};
  // "למה קיבלתי התראה" — expanded rule explanation per alert row
  const AF_OPEN=new Set();
  function afToggle(id){AF_OPEN.has(id)?AF_OPEN.delete(id):AF_OPEN.add(id);renderAlerts();}
  function afeedRow(a){
    const id=a.i+'_'+a.mkey, open=AF_OPEN.has(id), hasRule=a.mi!=null, hasWhy=hasRule||!!a.why;
    const why=hasWhy?`<button class="afeed-act why" onclick="afToggle('${id}')">למה קיבלתי? ${open?'▴':'▾'}</button>`:'';
    const expl=!open?'':hasRule?`
      <div class="af-why">
        <div class="afw-row"><span class="afw-l">החוק</span>${ruleSentence(a.rule,METRICS[a.mi])}</div>
        <div class="afw-row"><span class="afw-l">נמדד עכשיו</span><b>${a.vTxt} ${a.vSub}</b> ← חצה את הסף (${a.rule.th}${a.rule.mode==='pct'?'%':''})</div>
        <button class="afeed-act" onclick="openAlertCfg(${a.mi})">עריכת התראות המדד ←</button>
      </div>`:(a.why?`
      <div class="af-why">
        <div class="afw-row"><span class="afw-l">למה</span>${a.why}</div>
      </div>`:'');
    return `<div class="afeed ${a.sev}">
      <div class="afeed-b">
        <div class="afeed-t">${a.t} <span class="afeed-sev ${a.sev}">${SEV_LBL[a.sev]}</span><span class="afeed-metric">${a.metric}</span>${(isOperator&&CLIENTS[a.i].product)?prodLogo(CLIENTS[a.i].product,'sm'):''}</div>
        <div class="afeed-m"><span class="afeed-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2.5"/></svg>${a.meta}</span>${why}<button class="afeed-act" onclick="${a.click||`alertOpen(${a.i})`}">${a.btn||'פתח חברה'} ←</button></div>
        ${expl}
      </div>
      ${a.vTxt?`<div class="af-val ${a.sev}"><b>${a.vTxt}</b><span>${a.vSub}</span></div>`:''}
    </div>`;
  }
  function alertOpen(i){selectClient(i);}
  /* company-dashboard alert banner — מוצג מעל הווידג'טים כשלחברה יש התראות פעילות */
  function renderCoAlerts(){
    const el=document.getElementById('coAlerts'); if(!el) return;
    if(SCOPE!=='client'){el.style.display='none';return;}
    const mine=buildAlerts().filter(a=>a.i===CUR);
    if(!mine.length){el.style.display='none';el.innerHTML='';return;}
    const high=mine.filter(a=>a.sev==='high').length;
    el.style.display='';
    el.innerHTML=`<div class="coal ${high?'hot':''}">
      <span class="coal-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>
      <span class="coal-t">${mine.length} התראות פעילות${high?' · '+high+' דחופות':''}</span>
      ${mine.map(a=>{
        const canEdit=!(ROLE==='client1'||ROLE==='clientN');
        return `<span class="coal-chip ${a.sev}" title="${a.t}" ${canEdit&&a.mi!=null?`onclick="openAlertCfg(${a.mi})"`:'style="cursor:default"'}>${a.metric}${a.vTxt?' · '+a.vTxt:''}</span>`;}).join('')}
      ${(ROLE==='client1'||ROLE==='clientN')?'':'<button class="coal-btn" onclick="goToMetrics()">להגדרות המדדים ←</button>'}
    </div>`;
  }
  // alerts are defined ON each metric — jump to the metric editor to change them
  function goToMetrics(){
    selectClient(typeof CUR==='number'?CUR:0);
    const t=[...document.querySelectorAll('.tab')].find(x=>x.textContent.trim()==='מדדים');
    if(t) switchTab(t,'metrics');
  }

