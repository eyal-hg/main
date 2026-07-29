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
    const docRows=docs.length?docs.slice(0,2).map(t=>`<div class="cb-doc"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span class="nm">${t.name}</span><span class="oqs-src ${t.src==='גוגל שיט'?'gs':''}">${t.src||'הודעת לקוח'}</span></div>`).join('')+(docs.length>2?`<div class="cb-more">+ עוד ${docs.length-2}</div>`:'')
      :`<div class="cb-clean">הכל הוזן ✓</div>`;
    /* פיד שינויים בגיליון */
    const FEED={0:['נוספו 3 שורות הוצאה · ספקים יוני','לפני 3 דק׳'],1:['נוספו 2 שורות הכנסה · לקוחות מזומן','לפני 25 דק׳'],2:['עודכנה שורת הוצאה · שכירות מבנה','לפני שעה'],4:['נוספה שורת הכנסה · צ׳ק דחוי','08:40']};
    const fd=FEED[CUR];
    const feed=fd?`<div class="cb-feed"><span class="cb-pulse"></span><div class="cb-fb"><b>${fd[0]}</b><span>${fd[1]} · ממתין להזנה</span></div></div>`
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
      <div class="db-sec"><div class="db-l">גוגל שיט</div>
        ${feed}
        <div class="db-sub">הכנסות והוצאות · 4 גיליונות</div></div>
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
  function advInit(){
    if(ADV_AGENDA) return;
    const TODAY='02.07.2026';
    ADV_AGENDA=[];
    MEETINGS.forEach((m,ix)=>{
      if(m.date!==TODAY||m.time==='עכשיו') return;
      ADV_AGENDA.push({time:m.time.split('-')[0], kind:'meet', mix:ix, client:m.client,
        title:m.name, sub:m.client+' · '+m.time+(m.rec?' · 🎙 '+m.rec:''), st:m.status, done:false});
    });
    ADV_AGENDA.push(
      {time:'11:00', kind:'task',   title:'הכנה לפגישת משה עובד',      sub:'תקציר AI מוכן · 10 דק׳', done:false, act:'goPrep(3)', actLbl:'להכנה'},
      {time:'13:00', kind:'client', title:'שיחת מעקב — מטעי גבעון',     sub:'אחרי חריגת התקציב (114%)', done:false, act:'selectClient(2)', actLbl:'פתיחה'},
      {time:'17:30', kind:'task',   title:'עדכוני וואטסאפ ללקוחות',     sub:'סיכום יום · 4 חברות', done:false});
    ADV_AGENDA.sort((a,b)=>a.time.localeCompare(b.time));
    ADV_TODO=[];
    MEETINGS.forEach((m,ix)=>{
      const ci=CLIENTS.findIndex(c=>c.name===m.client);
      if(m.status==='summary') ADV_TODO.push({t:'אישור סיכום — '+m.name+' · '+m.client, act:`openMeetingFrom(${ci},${ix})`, lbl:'אישור', done:false});
      else if(m.status==='noshow') ADV_TODO.push({t:'תיאום מחדש — '+m.client+' (הפגישה לא התקיימה)', act:"toast('נשלחה ללקוח הצעה לתיאום מחדש בוואטסאפ')", lbl:'תיאום', done:false});
    });
    CLIENTS.forEach((c,i)=>{
      if(c.product==='money+'&&!hasUpcomingMeeting(c))
        ADV_TODO.push({t:'שליחת זמנים לפגישה חודשית — '+c.name+' (Money+)', act:"toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')", lbl:'שליחה', done:false});
    });
  }
  function advTgl(ix){ADV_AGENDA[ix].done=!ADV_AGENDA[ix].done;renderAlerts();if(ADV_AGENDA[ix].done)toast('סומן כבוצע');}
  function advTodoDone(ix){ADV_TODO[ix].done=!ADV_TODO[ix].done;renderAlerts();}

  function renderAdvisorHome(){
    const board=document.getElementById('alBoard');
    board.classList.add('advh');
    advInit();
    const alerts=buildAlerts();
    const AK={meet:['פגישה','meet'],task:['משימה','task'],client:['לקוח','client']};
    /* --- היומן: משימות פתוחות + ציר היום --- */
    const openTodo=ADV_TODO.filter(x=>!x.done).length;
    const todoHtml=`<div class="mc-todo">
      <div class="mc-todo-h">משימות פתוחות <span class="mc-todo-n">${openTodo}</span><i>אישורים, תיאומים ומעקבים</i></div>
      ${ADV_TODO.map((x,i)=>`
        <div class="mc-todo-row ${x.done?'done':''}">
          <label class="mc-chk"><input type="checkbox" ${x.done?'checked':''} onchange="advTodoDone(${i})"><span></span></label>
          <span class="mc-todo-t">${x.t}</span>
          ${x.done?'':`<button class="mt-btn ${x.lbl==='אישור'?'':'view'}" onclick="${x.act}">${x.lbl}</button>`}
        </div>`).join('')}
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
      tl+=`<div class="mc-item ${k[1]} ${it.done?'done':''}">
        <div class="mc-time" dir="ltr">${it.time}</div>
        <label class="mc-chk"><input type="checkbox" ${it.done?'checked':''} onchange="advTgl(${ix})"><span></span></label>
        <div class="mc-b"><div class="mc-t">${it.title}</div><div class="mc-s">${it.sub}</div></div>
        ${action}
        <span class="mc-tag ${k[1]}">${k[0]}</span>
      </div>`;
    });
    if(!nowDrawn) tl+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${ADV_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
    const leftCnt=ADV_AGENDA.filter(x=>!x.done).length;
    const calCard=`<div class="advl advcal">
      <div class="advl-head">
        <span class="advl-title">היומן שלי</span><span class="advl-sub">יום חמישי · 2.7.2026</span>
        <button class="mrec-btn on-card sm" style="margin-inline-start:auto" onclick="startMeetRec()"><span class="mrec-dot"></span> התחל פגישה</button>
        <button class="mt-btn view" onclick="gnavGo('cal')">היומן המלא</button>
      </div>
      ${todoHtml}${tl}
      <div class="mc-foot">${leftCnt} פריטים נותרו להיום</div>
    </div>`;
    /* --- התראות: חריגות צפויות (הכי חשוב), מדדים, ומה השתפר --- */
    const ovd=alerts.filter(a=>a.mkey==='overdraft');
    const ovdCard=`<div class="advl advov">
      <div class="advl-head"><span class="advl-title">חריגות צפויות</span><span class="advl-sub">תחזית עו״ש מול מסגרת האשראי</span></div>
      ${ovd.length?ovd.map(a=>`
        <div class="advl-row high">
          <span class="af-val high big"><b>${a.vTxt}</b><i>${a.vSub}</i></span>
          <div class="advl-b"><div class="advl-t">${a.t}</div><div class="advl-s">${a.meta||''}</div></div>
          <button class="mt-btn" onclick="selectClient(${a.i})">פתיחת החברה</button>
        </div>`).join(''):'<div class="advh-ok" style="padding:16px">✓ אין חריגות צפויות בעו״ש</div>'}
    </div>`;
    const ORD={budget:0,revenue:1,salesclr:1,liters:2,cfprofit:2,debt:3};
    const fin=alerts.filter(a=>a.mkey in ORD)
      .sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1)||ORD[a.mkey]-ORD[b.mkey]);
    const finCard=`<div class="advl">
      <div class="advl-head"><span class="advl-title">התראות מדדים</span><span class="advl-sub">תקציב · קצב הכנסות · מדדים אישיים · גבייה</span></div>
      ${fin.map((a,ix)=>`
        <div class="advl-row ${a.sev}">
          <span class="advl-rank">${ix+1}</span>
          <div class="advl-b"><div class="advl-t">${a.t}</div><div class="advl-s">${a.meta||''} · ${a.metric}</div></div>
          <span class="af-val ${a.sev}"><b>${a.vTxt}</b><i>${a.vSub}</i></span>
          <button class="mt-btn ${a.sev==='high'?'':'view'}" onclick="${a.click||('selectClient('+a.i+')')}">${a.btn||'פתיחת החברה'}</button>
        </div>`).join('')||'<div class="advh-ok" style="padding:16px">✓ כל המדדים בתוך היעד</div>'}
    </div>`;
    const wins=[
      ['אנרגי אינטרנשיונל','הכנסות יוני +12% מהחודש הקודם'],
      ['מטעי גבעון','3 שבועות רצופים בלי חריגת תקציב'],
      ['אנרגי גולני','סך הליטרים חצה את היעד החודשי'],
    ].map(w=>`<div class="advw-row"><span class="advw-ic">↑</span><b>${w[0]}</b><span>${w[1]}</span></div>`).join('');
    const winsCard=`<div class="advl"><div class="advl-head"><span class="advl-title">מה השתפר השבוע</span></div>${wins}</div>`;
    board.innerHTML=`<div class="advh2">
      <div class="advcal-col">${calCard}</div>
      <div class="advh-side">${ovdCard}${finCard}${winsCard}</div>
    </div>`;
  }
