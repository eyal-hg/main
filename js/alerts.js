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
      case 'meeting': return {t:n+' — לא נקבעה פגישה חודשית (Money+)',meta:'חובה החודש',chip:'לא נקבעה פגישה חודשית',btn:'שליחת זמנים ללקוח',click:"toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')"};
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
    // ליועץ: אירועי פגישות — סיכומים לאישור + פגישות שלא התקיימו
    if(ROLE==='advisor'){
      MEETINGS.forEach((mt,ix)=>{
        const i=CLIENTS.findIndex(c=>c.name===mt.client); if(i<0) return;
        if(mt.status==='summary'){
          out.push({sev:'mid', i, mkey:'summary', metric:'פגישות',
            t:mt.client+' — סיכום פגישה ממתין לאישור',
            chip:'סיכום פגישה ממתין לאישור',
            meta:'הוקלטה '+mt.date.slice(0,5)+(mt.rec?' · '+mt.rec:''), btn:'אישור הסיכום', click:'openMeetingFrom('+i+','+ix+')',
            why:'כל פגישה מוקלטת ומתועדת אוטומטית: ההקלטה ('+(mt.rec||'')+' מ-'+mt.date.slice(0,5)+') תומללה ונותחה על ידי ה-AI, והסיכום ממתין לאישורך לפני שליחה ללקוח.'});
        }else if(mt.status==='noshow'){
          out.push({sev:'high', i, mkey:'noshow', metric:'פגישות',
            t:mt.client+' — הפגישה לא התקיימה',
            chip:'פגישה לא התקיימה',
            meta:mt.date.slice(0,5)+' · '+mt.name, btn:'תיאום מחדש', click:"toast('נשלחה ללקוח הצעה לתיאום מחדש בוואטסאפ')",
            why:'הפגישה "'+mt.name+'" מ-'+mt.date.slice(0,5)+' סומנה כלא התקיימה — וטרם תואמה פגישה חלופית.'});
        }
      });
    }
    return out.sort((a,b)=>RANK[a.sev]-RANK[b.sev]);
  }
  function renderAlerts(){
    if(ROLE==='advisor'){renderAdvisorHome();return;}   // ליועץ — "הבוקר של היועץ"; למנהל נשאר מוקד ההתראות
    const alerts=buildAlerts();
    const board=document.getElementById('alBoard');
    board.classList.remove('advh');
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
       pick:a=>['meeting','summary','noshow'].includes(a.mkey), empty:'אין פגישות שדורשות טיפול', meetings:true},
      {cls:'amber', title:'חריגות תקציב', sub:'הוצאות מעל התקציב · אי-עמידה בקצב ההכנסות',
       ic:'<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>',
       pick:a=>['budget','revenue','salesclr'].includes(a.mkey), empty:'התקציב וההכנסות בקצב תקין'},
    ];
    board.innerHTML=WIDGETS.map((wd,wi)=>{
      const rows=alerts.filter(wd.pick);
      // תקרת תצוגה — בעשרות חברות הווидג'ט לא מתנפח; "הצגת הכול" פורש
      const CAP=5, expanded=AW_EXPAND.has(wi);
      const shown=expanded?rows:rows.slice(0,CAP);
      let body=rows.length?shown.map(afeedRow).join(''):`<div class="awdg-ok"><span>✓</span>${wd.empty}</div>`;
      if(rows.length>CAP) body+=`<button class="awdg-more" onclick="awToggle(${wi})">${expanded?'הצגת פחות ▴':'הצגת כל '+rows.length+' ההתראות ▾'}</button>`;
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
  const AW_EXPAND=new Set();
  function awToggle(wi){AW_EXPAND.has(wi)?AW_EXPAND.delete(wi):AW_EXPAND.add(wi);renderAlerts();}
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
        <div class="afeed-m"><span class="afeed-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2.5"/></svg>${a.meta}</span>${why}<button class="afeed-act" onclick="${a.click||`alertOpen(${a.i})`}">${a.btn||'פתיחת החברה'} ←</button></div>
        ${expl}
      </div>
      ${a.vTxt?`<div class="af-val ${a.sev}"><b>${a.vTxt}</b><span>${a.vSub}</span></div>`:''}
    </div>`;
  }
  function alertOpen(i){selectClient(i);}
  /* company-dashboard alert banner — מוצג מעל הווידג'טים כשלחברה יש התראות פעילות */
  function renderCoAlerts(){
    const el=document.getElementById('coAlerts'); if(!el) return;
    // ללקוחות אין באנר התראות — הוא כלי עבודה של היועץ ומנהל התזרים
    if(SCOPE!=='client'||ROLE==='client1'||ROLE==='clientN'){el.style.display='none';return;}
    // התראות תפעוליות של החברה — חיבורים ועדכניות נתונים (יתווספו עוד בהמשך)
    const sys=(CLIENTS[CUR].name==='אנרגי אינטרנשיונל')?[
      {sev:'high', chip:'2 חשבונות בנק לא מעודכנים',  t:'חשבון לאומי ופועלים לא נמשכו מ-28.06'},
      {sev:'high', chip:'כ.אשראי מקס לא מעודכן',       t:'הכרטיס אינו מחובר ל-Bizibox'},
      {sev:'mid',  chip:'חשבון סליקה לא מחובר',        t:'קארדקום — נדרש חיבור מחדש'},
    ]:[];
    // דוח חודשי — חובה עד ה-10: מודגש בפס אם טרם נשלח
    if(!CLIENTS[CUR].mReport) sys.unshift({sev:'high', cls:'mrep', click:'mrSend('+CUR+')',
      chip:'📄 דוח חודשי טרם נשלח · עד 10.7 — שליחה', t:'לחיצה שולחת את הדוח החודשי ללקוח בוואטסאפ'});
    const mine=sys.concat(buildAlerts().filter(a=>a.i===CUR));
    if(!mine.length){el.style.display='none';el.innerHTML='';return;}
    mine.sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1));
    const high=mine.filter(a=>a.sev==='high').length;
    // כשיש הרבה התראות: שלוש הדחופות + "עוד N" שנפתח לשורה מלאה
    const CAP=3, open=window._coalOpen||false, shown=open?mine:mine.slice(0,CAP);
    el.style.display='';
    el.innerHTML=`<div class="coal ${high?'hot':''} ${open?'open':''}">
      <span class="coal-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>
      <span class="coal-t">${mine.length} התראות${high?' · '+high+' דחופות':''}</span>
      ${shown.map(a=>{
        const canEdit=!(ROLE==='client1'||ROLE==='clientN');
        return `<span class="coal-chip ${a.sev} ${a.cls||''}" title="${a.t}" ${a.click?`onclick="${a.click}"`:canEdit&&a.mi!=null?`onclick="openAlertCfg(${a.mi})"`:'style="cursor:default"'}>${a.chip||(a.metric+(a.vTxt?' · '+a.vTxt:''))}</span>`;}).join('')}
      ${mine.length>CAP?`<button class="coal-more" onclick="window._coalOpen=${!open};renderCoAlerts()">${open?'פחות ▴':'+ עוד '+(mine.length-CAP)}</button>`:''}
      <button class="coal-btn" onclick="goToMetrics()">להגדרות המדדים ←</button>
    </div>`;
  }
  /* דיי-בר פר-חברה — כלי של מנהל התזרים בכניסה לחברה */
  function renderCoBar(){
    const el=document.getElementById('coBar'); if(!el) return;
    if(SCOPE!=='client'||ROLE!=='manager'||(typeof OPSMODE!=='undefined'&&OPSMODE)){el.style.display='none';el.innerHTML='';return;}
    const c=CLIENTS[CUR]||{}, T=c.tasks||[];
    const st=(typeof opsStatusOf==='function')?opsStatusOf(CUR):{cls:'wait',txt:'ממתין'};
    /* שלבי התפעול כנקודות — כמה פתוח בכל שלב */
    const stages=(typeof OPS_STAGES!=='undefined')?OPS_STAGES:[];
    let curHit=false;
    const dots=stages.map(sg=>{
      const types=sg[0]==='carry'?['carry','unexpected']:[sg[0]];
      const n=T.filter(t=>types.includes(t.type)&&!t.done).length;
      const isCur=!curHit&&n>0&&st.cls!=='done'; if(isCur)curHit=true;
      return `<span class="cb-dot ${st.cls==='done'?'ok':n?(isCur?'cur':'has'):'off'}" title="${sg[1]}${n?' · '+n+' פתוחות':' · נקי'}">${st.cls==='done'?'✓':(n||'')}</span>`;
    }).join('<i class="cb-lnk"></i>');
    const open=T.filter(t=>!t.done).length;
    const stLine=st.cls==='done'?`<span class="db-ok">תופעל ✓</span>`:st.cls==='check'?`<span class="db-ago">${st.txt}</span>`:`<span class="db-ago">${open} משימות פתוחות</span>`;
    /* ההודעה האחרונה — תצוגה מקדימה אמיתית */
    const last=[...(c.thread||[])].reverse().find(m=>m.from==='user');
    const bub=c.unread?`<div class="cb-bub"><div class="cb-bub-h">${last?last.name:'הלקוח'} · ${last?last.when:'היום'}</div>${last?last.t:'היי, אפשר לקבל עדכון על מצב החשבון?'}</div>`
      :`<div class="cb-clean">אין הודעות פתוחות ✓</div>`;
    /* המסמכים עצמם */
    const docs=T.filter(t=>!t.done&&t.type==='doc');
    const docRows=docs.length?docs.slice(0,2).map(t=>`<div class="cb-doc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span class="nm">${t.name}</span><span class="oqs-src ${t.src==='טבלת הזנה'?'gs':''}">${t.src||'הודעת לקוח'}</span></div>`).join('')+(docs.length>2?`<div class="cb-more">+ עוד ${docs.length-2}</div>`:'')
      :`<div class="cb-clean">הכל הוזן ✓</div>`;
    /* פיד שינויים בטבלאות ההזנה */
    const FEED={0:['נוספו 3 שורות הוצאה · ספקים יוני','לפני 3 דק׳'],1:['נוספו 2 שורות הכנסה · לקוחות מזומן','לפני 25 דק׳'],2:['עודכנה שורת הוצאה · שכירות מבנה','לפני שעה'],4:['נוספה שורת הכנסה · צ׳ק דחוי','08:40']};
    const fd=FEED[CUR];
    const feed=fd?`<div class="cb-feed"><span class="cb-pulse"></span><div class="cb-fb"><b>${fd[0]}</b><span>${fd[1]} · ממתין לאישור לתזרים</span></div></div>`
      :`<div class="cb-clean">אין שינויים חדשים ✓</div>`;
    el.style.display='';
    el.innerHTML=`<div class="daybar cobar rich">
      <div class="db-sec"><div class="db-l">סטטוס תפעול <span class="cb-big2">${stLine}</span></div>
        <div class="cb-dots">${dots}</div>
        <div class="db-sub">${st.cls==='done'?st.txt:'לפי סדר שלבי העבודה'}</div></div>
      <div class="db-sec clk" onclick="chatFrom(${CUR})"><div class="db-l">הודעות לקוח ${c.unread?`<span class="cb-n">${c.unread}</span>`:''}</div>
        ${bub}
        <div class="db-sub">${c.unread?'לצפייה ומענה ←':''}</div></div>
      <div class="db-sec"><div class="db-l">מסמכים להזנה ${docs.length?`<span class="cb-n">${docs.length}</span>`:''}</div>
        ${docRows}</div>
      <div class="db-sec clk" onclick="openDataTable('תשלומים לספקים · צפי')"><div class="db-l">הזנות ואוטומציה</div>
        ${feed}
        <div class="db-sub">טבלאות הזנה מנוהלות · לחיצה לפתיחת הטבלה ←</div></div>
      <div class="db-sec"><div class="db-l">דוח חודשי</div>
        ${c.mReport?`<div class="cb-rep ok"><span class="db-ok">✓</span><div class="cb-fb"><b>נשלח ללקוח</b><span>יוני 2026 · בוואטסאפ</span></div></div>`
                   :`<button class="cb-send" onclick="mrSend(${CUR})">שליחת הדוח עכשיו</button><div class="db-sub">חובה עד 10.7</div>`}</div>
    </div>`;
  }
  // alerts are defined ON each metric — jump to the metric editor to change them
  function goToMetrics(){
    selectClient(typeof CUR==='number'?CUR:0);
    const t=[...document.querySelectorAll('.tab')].find(x=>x.textContent.trim()==='מדדים');
    if(t) switchTab(t,'metrics');
  }


  /* ===== הבוקר של היועץ — הבית של "כל החברות" ליועץ =====
     שלוש שאלות לפי הסדר: מה היום שלי → איפה בוער → מה המצב הכללי (+ מה השתפר) */
  function goPrep(i){selectClient(i);showTab('prep');}
  function advPulse(c){
    // דופק פר חברה: אדום = חריגה צפויה/תקציב פרוץ · ענבר = חוב/מדד מתחת ליעד/בלי פגישה · ירוק = תקין
    const m=c.metrics||{};
    if((m.overdraft>0)||(m.budget>100)) return 'red';
    if((c.debt>0)||(m.liters&&m.liters<100)||(c.product==='money+'&&!hasUpcomingMeeting(c))) return 'amber';
    return 'green';
  }
  /* היומן של היועץ להיום — פגישות + משימות, נבנה פעם אחת מהנתונים */
  let ADV_AGENDA=null, ADV_TODO=null;
  const ADV_NOW='10:54';
  /* ניווט ימים ביומן היועץ */
  let ADV_DOFF=0;
  function advDayNav(d){ADV_DOFF=Math.max(-3,Math.min(6,ADV_DOFF+d));renderAlerts();}
  function advDayToday(){ADV_DOFF=0;renderAlerts();}
  const ADV_OTHER={
    1:[{time:'10:00',kind:'meet',title:'פ.ע חודשית — רימון יצחק',sub:'רימון יצחק · 10:00-11:00 · Money+'}],
    3:[{time:'09:30',kind:'meet',title:'פגישת הקמה — לביא הובלות',sub:'לביא הובלות · 09:30-10:30'},
       {time:'14:30',kind:'task',title:'הכנה לפגישת אנרגי גולני',sub:'תקציר AI יוכן אוטומטית'}],
    '-1':[{time:'09:00',kind:'meet',title:'פ.ע חודשית — אנרגי גולני',sub:'אנרגי גולני · הוקלטה · הסיכום אושר',done:true},
       {time:'13:00',kind:'client',title:'שיחת גבייה — משה עובד',sub:'הוקלטה בסים · הזיכרון עודכן',done:true}],
  };
  function advSlotAdd(t){
    if(typeof evQuick==='function'){
      evQuick(t,null);
      const dt=new Date(2026,6,2+ADV_DOFF);
      const el=document.getElementById('evDate');
      if(el) el.value=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    }
  }
  /* רדאר שימור והרחבה — אותות מהזיכרון ומהתפעול */
  const ADV_RADAR=[
    {c:'אנרגי אינטרנשיונל', ci:0, kind:'churn',  why:'שביעות הרצון בירידה — תסכול מקצב התגובה (מהזיכרון · פגישת היום)', act:'שיחה אישית של היועץ השבוע'},
    {c:'משה עובד',           ci:3, kind:'churn',  why:'לא הביא חומר לתזרים 21 יום · הפגישה האחרונה לא התקיימה',          act:'תיאום פגישת חידוש קשר'},
    {c:'מטעי גבעון',         ci:2, kind:'upsell', why:'שימוש גבוה במדדים + ביקש פעמיים תחזית מפורטת (מהזיכרון)',          act:'להציע Money+ בפגישה הבאה'},
  ];
  function advInit(){
    if(ADV_AGENDA) return;
    const TODAY='02.07.2026';
    ADV_AGENDA=[];
    MEETINGS.forEach((m,ix)=>{
      if(m.date!==TODAY||m.time==='עכשיו') return;
      ADV_AGENDA.push({time:m.time.split('-')[0], kind:'meet', mix:ix, client:m.client,
        title:m.name, sub:m.client+' · '+m.time+(m.rec?' · 🎙 '+m.rec:''), st:m.status, done:false});
    });
    /* ביומן — רק פגישות ושיחות. משימות חיות בפאנל המשימות */
    ADV_AGENDA.push(
      {time:'13:00', kind:'client', title:'שיחת מעקב — מטעי גבעון',     sub:'אחרי חריגת התקציב (114%)', done:false, act:'selectClient(2)', actLbl:'פתיחה'});
    ADV_AGENDA.sort((a,b)=>a.time.localeCompare(b.time));
    ADV_TODO=[];
    MEETINGS.forEach((m,ix)=>{
      const ci=CLIENTS.findIndex(c=>c.name===m.client);
      if(ci>=0&&!coActive(CLIENTS[ci])) return;
      if(m.status==='summary') ADV_TODO.push({t:'אישור סיכום — '+m.name+' · '+m.client, act:`openMeetingFrom(${ci},${ix})`, lbl:'אישור', done:false});
      else if(m.status==='noshow') ADV_TODO.push({t:'תיאום מחדש — '+m.client+' (הפגישה לא התקיימה)', act:"toast('נשלחה ללקוח הצעה לתיאום מחדש בוואטסאפ')", lbl:'תיאום', done:false});
    });
    /* בתיק של 100 חברות משימה חוזרת היא לא 30 שורות — היא שורה אחת עם מספר.
       ארכיון ובהקמה לא מייצרים משימות בכלל. */
    const needTimes=CLIENTS.map((c,i)=>({c,i}))
      .filter(x=>coActive(x.c)&&x.c.product==='money+'&&!hasUpcomingMeeting(x.c));
    if(needTimes.length===1)
      ADV_TODO.push({t:'שליחת זמנים לפגישה חודשית — '+needTimes[0].c.name+' (Money+)',
        act:"toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')", lbl:'שליחה', done:false});
    else if(needTimes.length>1)
      ADV_TODO.push({t:'שליחת זמנים לפגישה חודשית', n:needTimes.length, sub:'Money+ · אין פגישה קרובה',
        group:'times', items:needTimes.map(x=>({name:x.c.name, i:x.i})),
        act:"toast('נשלחו הצעות זמנים ל-'+"+needTimes.length+"+' לקוחות בוואטסאפ')", lbl:'שליחה לכולם', done:false});
    ADV_TODO.push(
      {t:'עדכוני וואטסאפ ללקוחות — סיכום יום · 4 חברות', done:false, manual:true},
      {t:'לחזור לרו״ח של מטעי גבעון על המע״מ', done:false, manual:true});
  }
  function advTaskNew(){ window._mtkTarget='adv'; if(typeof mcQuick==='function') mcQuick(); }
  function advTgl(ix){ADV_AGENDA[ix].done=!ADV_AGENDA[ix].done;renderAlerts();if(ADV_AGENDA[ix].done)toast('סומן כבוצע');}
  const ADV_TG_OPEN=new Set();
  function advTgOpen(k){ ADV_TG_OPEN.has(k)?ADV_TG_OPEN.delete(k):ADV_TG_OPEN.add(k); renderAlerts(); }
  function advTodoDone(ix){ADV_TODO[ix].done=!ADV_TODO[ix].done;renderAlerts();}

  /* ===== מבט-על ליועץ: שלוש קוביות עליונות ===== */
  const ADV_RISK=[
    {c:'אנרגי אינטרנשיונל', days:6, amt:161198, bank:'עו״ש לאומי 604', fix:'העברה מעו״ש פועלים 112 — יתרה חיובית 312,400 ₪'},
    {c:'מטעי גבעון', days:3, amt:42300, bank:'עו״ש מזרחי 295199', fix:null},
  ];
  let ADV_MGR_TASKS=[
    {d:'28.07', mgr:'לירון בן כליפא', client:'מטעי גבעון', t:'עדכון שורה תקציבית — קניות מלאי', detail:'היעד החודשי חצה 114% — לעדכן את השורה מול הלקוח ולצבוע מחדש בתזרים.', open:true},
    {d:'30.07', mgr:'שמרית טובול', client:'רימון יצחק', t:'חיבור חשבון סליקה', detail:'חשבון הסליקה לא מחובר — נדרשת הרשאה מהלקוח מול קארדקום.', open:true},
    {d:'01.08', mgr:'לירון בן כליפא', client:'אנרגי אינטרנשיונל', t:'צביעת יתרת קניות מלאי בתזרים', detail:'נותרו 25,000 ₪ שלא נצבעו — להזין לתזרים קדימה.', open:true},
    {d:'25.07', mgr:'שמרית טובול', client:'משה עובד', t:'השלמת הקמה — הרשאות בנק', detail:'הועברו ההרשאות, ההקמה הושלמה.', open:false},
  ];
  function advTopCards(){
    /* ארכיון לא נספר בתיק — לא בכותרת, לא בסיכון ולא בהכנסה. */
    const list=CLIENTS.filter(c=>firmOk(c)&&coState(c)!=='arch');
    const nAct=list.filter(c=>coState(c)==='active').length, nSetup=list.length-nAct;
    const nArch=CLIENTS.filter(c=>firmOk(c)&&coState(c)==='arch').length;
    const openT=ADV_MGR_TASKS.filter(t=>t.open).length;
    const bars=list.map((c,ix)=>`<i class="ar-bar ${ix<ADV_RISK.length?'bad':''}"></i>`).join('');
    return `<div class="advtop">
      <div class="advt-card" onclick="advPop('status')">
        <div class="advt-k">סטטוס לקוחות</div>
        <div class="advt-v">${list.length}<span>לקוחות</span></div>
        <div class="advt-s">${nAct} פעילים · ${nSetup} בהקמה${nArch?' · '+nArch+' בארכיון':''}</div>
      </div>
      <div class="advt-card risk" onclick="advPop('risk')">
        <div class="advt-k"><span class="advt-warn">⚠</span> חברות בסיכון תזרימי</div>
        <div class="advt-v">${ADV_RISK.length}<span>מתוך ${list.length}</span></div>
        <div class="ar-bars">${bars}</div>
        <div class="advt-s">בחריגה בפועל בתזרים — כל החשבונות</div>
      </div>
      <div class="advt-card" onclick="advPop('tasks')">
        <div class="advt-k">משימות פתוחות למנהל תזרים</div>
        <div class="advt-v">${openT}<span>פתוחות</span></div>
        <div class="advt-s">מעקב אחרי מה שביקשת מהתפעול</div>
      </div>
      <div class="advt-card radar" onclick="advPop('radar')">
        <div class="advt-k">רדאר שימור והרחבה</div>
        <div class="advt-v">${ADV_RADAR.filter(r=>r.kind==='churn').length}<span>לקוחות לא מרוצים</span></div>
        <div class="advt-s">${ADV_RADAR.filter(r=>r.kind==='upsell').length} מועמד לשדרוג Money+ · מבוסס זיכרון לקוח</div>
      </div>
    </div>`;
  }
  window._advTaskOpen=null;
  function advPop(kind){
    const ov=document.getElementById('advPopOv'); if(!ov) return;
    const list=CLIENTS.filter(c=>firmOk(c)&&coState(c)!=='arch');
    let title='', body='';
    if(kind==='status'){
      title='סטטוס לקוחות';
      const rows=list.map(c=>`<div class="ap-row st">
        <div class="ap-cli"><span class="ap-av">${c.name.charAt(0)}</span><div><b>${c.name}</b><i>${c.hp}</i></div></div>
        <span class="ap-prod">${c.product?prodLogo(c.product,'sm'):'—'}</span>
        <span class="ap-st ${coState(c)==='setup'?'setup':'ok'}">${c.advStatus||'פעיל'}</span>
        <span class="ap-mgr">${c.mgr}</span>
        <span class="ap-num">${(c.price||0).toLocaleString('en-US')} ₪</span>
        <span class="ap-last">${c.lastOps&&c.lastOps!=='—'?`<i class="ap-dot ${c.lastOps==='02.07'?'ok':'mid'}"></i>${c.lastOps}`:'<i class="ap-dot no"></i>טרם'}</span>
      </div>`).join('');
      const tot=list.reduce((s,c)=>s+(c.price||0),0);
      body=`<div class="ap-row st head"><span>לקוח</span><span>מוצר</span><span>סטטוס</span><span>מנהל תזרים</span><span>מחיר · חודשי</span><span>תפעול אחרון</span></div>
        ${rows}
        <div class="ap-row st total"><span>סה״כ · ${list.length} לקוחות</span><span></span><span></span><span></span><span class="ap-num big">${tot.toLocaleString('en-US')} ₪</span><span></span></div>`;
    }else if(kind==='risk'){
      title='לקוחות בחריגה בפועל בתזרים — כל החשבונות';
      body=`<div class="ap-row rk head"><b>לקוח</b><span>ימי חריגה</span><span>סכום בפועל</span><span>חשבון</span><span>פתרון</span></div>`+
        ADV_RISK.map(r=>`<div class="ap-row rk">
          <b>${r.c}</b><span>${r.days} ימים</span><span class="ap-num neg">-${r.amt.toLocaleString('en-US')} ₪</span><span>${r.bank}</span>
          ${r.fix?`<span class="ap-fix ok">✓ ${r.fix}</span>`:'<span class="ap-fix no">אין פתרון בין חשבונות — נדרש טיפול</span>'}
        </div>`).join('');
    }else if(kind==='mem'){
      title='עדכוני זיכרון — פגישת 09:00 · אנרגי אינטרנשיונל';
      const ups=MEM_UPDATES.map((u,gi)=>({u,gi})).filter(x=>x.u.ci===0&&x.u.src.includes('09:00'));
      body=`<div class="apm-sub">ה-AI עדכן את כרטיס הלקוח מתוך תמלול הפגישה — אוטומטית, לפי הפרומפט של כל קטגוריה.</div>`+
        ups.map(({u})=>`<div class="apm-row">
          <span class="mf-cat">${u.catName}</span>
          <div class="apm-b"><div class="mf-l">${u.line}</div><div class="mf-meta">${u.when}</div></div>
          <span class="apm-ok">✓ עודכן</span>
        </div>`).join('');
    }else if(kind==='radar'){
      title='רדאר שימור והרחבה — מבוסס זיכרון לקוח ותפעול';
      body=`<div class="apm-sub">אותות שה-AI מזהה מהזיכרון, מהשימוש ומהתפעול — לפני שחוסר שביעות הרצון הופך לעזיבה.</div>`+
        ADV_RADAR.map(r=>`<div class="apm-row">
          <span class="rad-tag ${r.kind}">${r.kind==='churn'?'חוסר שביעות רצון':'הזדמנות שדרוג'}</span>
          <div class="apm-b"><div class="mf-l"><b>${r.c}</b> — ${r.why}</div><div class="mf-meta">מומלץ: ${r.act}</div></div>
          <button class="mt-btn" onclick="toast('נפתח תיאום ביומן — ${r.c}')">תיאום</button>
          <button class="mt-btn view" onclick="advPopClose();openMemCard(${r.ci})">כרטיס לקוח</button>
        </div>`).join('');
    }else{
      title='משימות פתוחות למנהל תזרים';
      body=`<div class="ap-row tk head"><b>נפתחה</b><span>מנהל תזרים</span><span>לקוח</span><span>המשימה</span><span></span><span></span></div>`+
        ADV_MGR_TASKS.map((t,i)=>`<div class="ap-row tk ${t.open?'':'closed'}">
          <b>${t.d}</b><span>${t.mgr}</span><span>${t.client}</span>
          <span class="ap-task" onclick="window._advTaskOpen=window._advTaskOpen===${i}?null:${i};advPop('tasks')">${t.t}</span>
          <span class="ap-st ${t.open?'setup':'ok'}">${t.open?'פתוח':'סגור'}</span>
          <button class="ap-del" title="מחיקת המשימה" onclick="ADV_MGR_TASKS.splice(${i},1);advPop('tasks');toast('המשימה נמחקה')">✕</button>
        </div>`+(window._advTaskOpen===i?`<div class="ap-detail">${t.detail}</div>`:'')).join('');
    }
    document.getElementById('advPopTitle').textContent=title;
    document.getElementById('advPopBody').innerHTML=body;
    ov.classList.add('show');
  }
  function advPopClose(){document.getElementById('advPopOv').classList.remove('show');window._advTaskOpen=null;}
  function advSchedCall(i){
    toast('נפתח תיאום שיחה עם '+CLIENTS[i].name+' — הוצעו 3 חלונות ביומן');
  }
  /* הכנה לפגישה — מוצמדת לפגישה ביומן, לא פאנל נפרד */
  const ADV_PREPS={
    /* שתי הנקודות האחרונות נולדו מסיווג הפער במעקב ופערים — "המציאות השתנתה" ו"טעינו בבנייה"
       דורשות הסבר בשורה אחת, ובדיוק ההסבר הזה עולה לכאן. */
    'אנרגי אינטרנשיונל':{pts:['ההכנסות +12% מהחודש הקודם — כדאי לפתוח בזה','חריגה צפויה בעו״ש בעוד 9 ימים — להציע העברה מפועלים 112','המציאות השתנתה בחברות שילוח (2,553 ₪) — הלקוח איבד את מוסך רם, ההסכם לא יחודש','טעינו בבנייה בפרסום ושיווק — ההערכה התבססה על רבעון חזק; לתקן בבניית שלושת החודשים הבאים'],
      mem:['פתח במספרים — צחי מאבד סבלנות מהקדמות','רגישות סביב התלות ברימון — לגעת בזה בעדינות, בלי לחץ']},
    'משה עובד':{pts:['ההקמה כמעט הושלמה — נשארו הרשאות בנק','אין עדיין נתוני תפעול — לתאם ציפיות לחודש הראשון','להציג את דוח התזרים הראשון בפגישה'],
      mem:['לקוח בהקמה — טון מלווה ומרגיע, בלי ז׳רגון מקצועי']},
    'רימון יצחק':{pts:['המחזור יציב — 3 חודשים סביב 95 א׳ ₪','חוב פתוח לגבייה 1,200 ₪ — לוודא לפני הפגישה','יעד הליטרים חצה את הרף החודשי — לציין לטובה'],
      mem:['מעדיף שיחה תכל׳ס — בלי סמול טוק','מגיב טוב לגרפים — להביא את מגמת המחזור']},
    'לביא הובלות':{pts:['פגישת הקמה — לעבור על חיבורי הבנק והאשראי','להגדיר יחד את קטגוריות התזרים הראשונות','לתאם ציפיות: מה HK עושה ומה באחריותו'],
      mem:['לקוח חדש — אין עדיין זיכרון · ההיכרות הזו תתחיל אותו']},
  };
  const ADV_PREP_OPEN=new Set();
  function advPrepTg(ix){ ADV_PREP_OPEN.has(ix)?ADV_PREP_OPEN.delete(ix):ADV_PREP_OPEN.add(ix); renderAlerts(); }
  function renderAdvisorHome(){
    /* דמו: בר טרום-פגישה קופץ לבד לקראת פגישת היום */
    if(!window._preBarShown&&typeof showPreMeetBar==='function'&&typeof MEETINGS!=='undefined'){
      const mi=MEETINGS.findIndex(x=>x.date==='02.07.2026'&&x.status==='upcoming');
      if(mi>=0){window._preBarShown=true;showPreMeetBar(mi);}
    }
    const board=document.getElementById('alBoard');
    board.classList.add('advh');
    advInit();
    const alerts=buildAlerts();
    const AK={meet:['פגישה','meet'],task:['משימה','task'],client:['לקוח','client']};
    /* --- היומן: משימות פתוחות + ציר היום --- */
    const openTodo=ADV_TODO.filter(x=>!x.done).length;
    const todoHtml=`<div class="mc-todo">
      <div class="mc-todo-h">המשימות שלי <span class="mc-todo-n">${openTodo}</span><i>אישורים, מעקבים ומשימות אישיות</i>
        <button class="mt-btn sm" style="margin-inline-start:auto" onclick="advTaskNew()">+ משימה</button></div>
      ${ADV_TODO.map((x,i)=>{
        if(!x.group) return `
        <div class="mc-todo-row ${x.done?'done':''}">
          <label class="mc-chk"><input type="checkbox" ${x.done?'checked':''} onchange="advTodoDone(${i})"><span></span></label>
          <span class="mc-todo-t ${x.act&&!x.done?'link':''}" ${x.act&&!x.done?`onclick="${x.act}"`:''}>${x.t}</span>
        </div>`;
        const op=ADV_TG_OPEN.has(x.group);
        return `
        <div class="mc-todo-row grp ${x.done?'done':''}">
          <label class="mc-chk"><input type="checkbox" ${x.done?'checked':''} onchange="advTodoDone(${i})"><span></span></label>
          <span class="mc-todo-t">${x.t}<i class="tg-n">${x.n}</i><small>${x.sub||''}</small></span>
          <button class="tg-more ${op?'on':''}" onclick="advTgOpen('${x.group}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg></button>
          ${x.act&&!x.done?`<button class="tg-do" onclick="${x.act}">${x.lbl}</button>`:''}
        </div>
        ${op?`<div class="tg-list">${x.items.map(it=>
          `<button class="tg-i" onclick="selectClient(${it.i})">${it.name}</button>`).join('')}</div>`:''}`;
      }).join('')}
    </div>`;
    let nowDrawn=false, tl='';
    ADV_AGENDA.forEach((it,ix)=>{
      if(!nowDrawn && it.time>ADV_NOW){
        tl+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${ADV_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
        nowDrawn=true;
      }
      const k=AK[it.kind]||AK.task;
      let action='';
      if(it.kind==='meet'&&it.st==='upcoming'&&!it.done) action=`<button class="mrec-btn on-card sm" onclick="startMeetRec('${it.client}')"><span class="mrec-dot"></span> הקלטה</button>`;
      else if(it.kind==='meet'&&it.st==='ai') action=`<span class="msp-chip purple">בעיבוד AI</span>`;
      else if(it.act&&!it.done) action=`<button class="mt-btn view" onclick="${it.act}">${it.actLbl}</button>`;
      const prep=it.kind==='meet'?ADV_PREPS[it.client]:null;
      const pOpen=ADV_PREP_OPEN.has(ix);
      tl+=`<div class="mc-item ${k[1]} ${it.done?'done':''}">
        <div class="mc-time" dir="ltr">${it.time}</div>
        <label class="mc-chk"><input type="checkbox" ${it.done?'checked':''} onchange="advTgl(${ix})"><span></span></label>
        <div class="mc-b"><div class="mc-t">${it.title}</div><div class="mc-s">${it.sub}</div></div>
        ${prep?`<button class="mt-btn view sm ${pOpen?'on':''}" onclick="advPrepTg(${ix})">הכנה ${pOpen?'▴':'▾'}</button>`:''}
        ${action}
        <span class="mc-tag ${k[1]}">${k[0]}</span>
      </div>`;
      if(prep&&pOpen) tl+=`<div class="adv-prep">
        ${prep.pts.map(pt=>`<div class="prep-pt">${pt}</div>`).join('')}
        ${(prep.mem||[]).map(pt=>`<div class="prep-pt mem"><span class="pm-tag">מהזיכרון</span>${pt}</div>`).join('')}
        <button class="mt-btn view sm" onclick="goPrep(0)">להכנה המלאה</button>
      </div>`;
    });
    if(!nowDrawn) tl+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${ADV_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
    const leftCnt=ADV_AGENDA.filter(x=>!x.done).length;
    /* ניווט ימים: היום = יומן חי; ימים אחרים מ-ADV_OTHER */
    const DAYN=['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
    const dvt=new Date(2026,6,2+ADV_DOFF);
    const dLbl=(ADV_DOFF===0?'היום · ':'')+'יום '+DAYN[dvt.getDay()]+' '+dvt.getDate()+'.'+String(dvt.getMonth()+1).padStart(2,'0');
    let calBody;
    if(ADV_DOFF===0){ calBody=todoHtml+tl+`<div class="mc-foot">${leftCnt} פריטים נותרו להיום</div>`; }
    else{
      const evs=(ADV_OTHER[ADV_DOFF]||[]).slice().sort((a,b)=>a.time.localeCompare(b.time));
      const slots=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
      const taken=new Set(evs.map(e=>e.time.slice(0,2)+':00'));
      let oh='';
      [...slots.filter(t=>!taken.has(t)).map(t=>({slot:true,time:t})),...evs.map(e=>({slot:false,time:e.time,e}))]
        .sort((a,b)=>a.time.localeCompare(b.time)||(a.slot?1:-1))
        .forEach(en=>{
          if(en.slot){ if(ADV_DOFF>0) oh+=`<div class="mc-drop" onclick="advSlotAdd('${en.time}')"><span dir="ltr">${en.time}</span><i class="add-t">+ הוספת אירוע</i></div>`; return; }
          const e=en.e, k=AK[e.kind]||AK.task;
          oh+=`<div class="mc-item ${k[1]} ${e.done?'done':''}">
            <div class="mc-time" dir="ltr">${e.time}</div>
            <div class="mc-b"><div class="mc-t">${e.title}</div><div class="mc-s">${e.sub}</div></div>
            <span class="mc-tag ${k[1]}">${k[0]}</span></div>`;
        });
      calBody=oh+`<div class="mc-foot">${evs.length?evs.length+' אירועים ביום זה':'יום פנוי'}</div>`;
    }
    const calCard=`<div class="advl advcal">
      <div class="advl-head">
        <span class="advl-title">היומן שלי</span><span class="advl-sub">${dLbl}</span>
        <span class="adv-dnav">
          <button class="mcw-arr" onclick="advDayNav(-1)" title="יום קודם"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
          ${ADV_DOFF!==0?`<button class="mcw-todaybtn" onclick="advDayToday()">חזרה להיום</button>`:''}
          <button class="mcw-arr" onclick="advDayNav(1)" title="יום הבא"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg></button>
        </span>
        <button class="mt-btn view" style="margin-inline-start:auto" onclick="gnavGo('cal')">היומן המלא</button>
      </div>
      ${calBody}
    </div>`;
    /* --- התראות: חריגות צפויות (הכי חשוב), מדדים, ומה השתפר --- */
    const ovd=alerts.filter(a=>a.mkey==='overdraft');
    /* "דורש את תשומת הלב שלך" — פריטים מנוסחים כפעולה, ממוינים לפי דחיפות */
    const ATT=[
      {sev:'high', i:0, c:'אנרגי אינטרנשיונל', what:'חריגה צפויה בעו״ש בעוד 9 ימים — <b>לא הייתה אתמול</b>', act:'3 שינויים הורידו את התחזית ב-32,400 ₪ · לחיצה מציגה בדיוק מה השתנה',
       btn:'למה?', go:`selectClient(0);showTab('flowlog')`, why:true},
      {sev:'high', i:2, c:'מטעי גבעון', what:'חריגת תקציב — 114% מהיעד', act:'מומלץ שיחת מעקב על קניות המלאי לפני חריגת המסגרת',
       btn:'תיאום שיחה', go:`advSchedCall(2)`},
      {sev:'mid', i:1, c:'אנרגי גולני', what:'חוב פתוח לגבייה — 1,200 ₪ בפיגור', act:'לשלוח תזכורת גבייה בוואטסאפ',
       btn:'תזכורת בוואטסאפ', go:`toast('תזכורת גבייה נשלחה לאנרגי גולני בוואטסאפ')`},
      {sev:'mid', i:3, c:'משה עובד', what:'חוב פתוח לגבייה — 480 ₪ בפיגור', act:'לשלוח תזכורת גבייה בוואטסאפ',
       btn:'תזכורת בוואטסאפ', go:`toast('תזכורת גבייה נשלחה למשה עובד בוואטסאפ')`},
    ];
    /* פיד אחד: התראות מהמספרים + עדכוני זיכרון — ממוין לפי דחיפות */
    const FEED=[
      ...ATT.map(x=>({t:'att', sev:x.sev, i:x.i, c:x.c, what:x.what, act:x.act})),
      ...MEM_UPDATES.map(u=>({t:'mem', sev:u.sev==='high'?'high':'info', ci:u.ci, cat:u.catName, line:u.line, src:u.src, when:u.when})),
    ];
    const _ord={high:0, mid:1, info:2};
    FEED.sort((x,y)=>(_ord[x.sev]??2)-(_ord[y.sev]??2));
    const feedCard=`<div class="advl memfeed">
      <div class="advl-head"><span class="advl-title">דורש את תשומת הלב שלך</span><span class="advl-sub">מהמספרים ומהזיכרון — פיד אחד, ממוין לפי דחיפות</span></div>
      <div class="mf-pipe">
        <span class="mrec-dot"></span>
        <div class="mf-pipe-t">פגישת 09:00 · אנרגי אינטרנשיונל<span>הוקלטה 46 דק׳ ← תומללה ← 3 עדכוני זיכרון נכנסו לכרטיס</span></div>
        <button class="mt-btn" onclick="advPop('mem')">סקירה</button>
      </div>
      ${FEED.map(f=>f.t==='att'
        ?`<div class="mf-row clickable" onclick="selectClient(${f.i})">
            <span class="mf-dot ${f.sev==='high'?'high':'mid'}"></span>
            <div class="mf-b"><div class="mf-t"><b>${f.c}</b> — ${f.what}</div><div class="mf-l">${f.act}</div></div>
            <span class="att-go">›</span></div>`
        :`<div class="mf-row clickable" onclick="openMemCard(${f.ci})">
            <span class="mf-dot ${f.sev==='high'?'high':'mem'}"></span>
            <div class="mf-b"><div class="mf-t"><b>${CLIENTS[f.ci].name}</b><span class="mf-cat">${f.cat}</span><span class="pm-tag">מהזיכרון</span></div>
              <div class="mf-l">${f.line}</div><div class="mf-meta">${f.src} · ${f.when}</div></div>
            <span class="att-go">›</span></div>`).join('')}
    </div>`;
    board.innerHTML=advTopCards()+`<div class="advh2">
      <div class="advcal-col">${calCard}</div>
      <div class="advh-side">${feedCard}</div>
    </div>`;
  }
