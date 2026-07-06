/* HK Dashboard — cross-company operations queue, product logos */
  /* operator home — cross-company operations queue */
  const pendOf=i=>(CLIENTS[i].tasks||[]).filter(t=>!t.done).length;
  const totalOpsTime=()=>{let s=0;CLIENTS.forEach((c,i)=>{s+=(opsDur['c'+i]||0)+(opsAccum['c'+i]||0);});return s;};
  let OPSQ_FILTER='all', OPSQ_STATUS='all'; const opsqOpen=new Set();
  const OPS_STATMAP={active:['st-active','פעיל'],trial:['st-trial','ניסיון'],setup:['st-setup','בהקמה']};
  function opsqSetStatus(k){OPSQ_STATUS=k;renderOpsQueue();}
  function opsStatusOf(i){const k='c'+i;
    if(opsDoneSet.has(k))return{cls:'done',acc:'acc-green',txt:'הושלם · '+fmtDur(opsDur[k]||0),btn:'פתח שוב',ghost:true};
    if(opsAccum[k])return{cls:'prog',acc:'acc-amber',txt:'בתהליך · '+fmtDur(opsAccum[k]),btn:'המשך תפעול',ghost:false};
    if(pendOf(i)>0)return{cls:'wait',acc:CLIENTS[i].opsAlert?'acc-coral':'acc-gray',txt:'ממתין · '+pendOf(i)+' משימות',btn:'תפעל',ghost:false};
    return{cls:'done',acc:'acc-gray',txt:'אין משימות',btn:'פתח',ghost:true};
  }
  const PRODUCTS={meeting:'HK Meeting', money:'HK Money', 'money+':'HK Money+'};
  const HKMARK='<svg class="hkm" viewBox="0 0 187.078 137.291" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M60.6393 86H31.0117C29.7449 86 28.6893 84.9561 28.6893 83.6513V46.0962C28.6893 44.8152 27.6571 43.7476 26.3669 43.7476H2.32236C1.05562 43.7476 0 44.7914 0 46.0962V134.919C0 136.2 1.03216 137.268 2.32236 137.268H26.3904C27.6571 137.268 28.7128 136.224 28.7128 134.919V97.1977C28.7128 95.9166 29.7449 94.849 31.0351 94.849H60.6627C61.9295 94.849 62.9851 93.8052 62.9851 92.5004V88.3249C62.9851 87.0438 61.9529 85.9763 60.6627 85.9763L60.6393 86Z" fill="#39ABE2"/><path d="M68.3108 20.1417H91.6282C92.895 20.1417 93.9506 21.1855 93.9506 22.4903V134.942C93.9506 136.223 92.9184 137.291 91.6282 137.291H68.3108C67.0441 137.291 65.9885 136.247 65.9885 134.942V22.4903C65.9885 21.2092 67.0206 20.1417 68.3108 20.1417ZM159.61 0H184.757C186.657 0 187.76 2.18261 186.61 3.72467L126.628 88.0634C126.018 88.8938 126.018 90.0088 126.628 90.8391L157.288 133.542C158.39 135.084 157.288 137.267 155.411 137.267H130.076C129.325 137.267 128.622 136.887 128.176 136.271L96.531 90.8154C95.968 90.0088 95.968 88.9175 96.531 88.1109L157.71 0.972683C158.155 0.35586 158.836 0 159.586 0H159.61Z" fill="#39ABE2"/></svg>';
  const PRODWORD={money:'Money','money+':'Money +',meeting:'Meeting'};
  const prodLogo=(p,cls)=>p?`<span dir="ltr" class="hklogo ${cls||''}">${HKMARK}<span class="hkw">${PRODWORD[p]}</span></span>`:'';
  let PROD_FILTER=new Set();
  /* פילטר מנהלי תזרים — הדרופדאון בסרגל העליון */
  let MGR_FILTER='';
  function toggleMgr(e){
    e.stopPropagation();
    const m=document.getElementById('mgrMenu');
    const mgrs=[...new Set(CLIENTS.map(c=>c.mgr))];
    m.innerHTML=`<div class="prod-opt ${MGR_FILTER===''?'on':''}" onclick="pickMgr('')">כל מנהלי התזרים</div>`+
      mgrs.map(g=>`<div class="prod-opt ${MGR_FILTER===g?'on':''}" onclick="pickMgr('${g}')">${g} <span class="mgr-n">${CLIENTS.filter(c=>c.mgr===g).length}</span></div>`).join('');
    m.classList.toggle('show');
  }
  function pickMgr(g){
    MGR_FILTER=g;
    document.getElementById('mgrMenu').classList.remove('show');
    document.getElementById('mgrDdl').innerHTML=(g||'כל מנהלי התזרים')+' <span>▾</span>';
    renderRail();
    if(document.getElementById('opsQueueView').style.display!=='none') renderOpsQueue();
  }
  document.addEventListener('click',function(e){const m=document.getElementById('mgrMenu');if(m&&m.classList.contains('show')&&!m.contains(e.target)&&e.target.id!=='mgrDdl')m.classList.remove('show');});
  function opsqMatch(i){
    if(MGR_FILTER && CLIENTS[i].mgr!==MGR_FILTER)return false;
    if(PROD_FILTER.size>0 && !PROD_FILTER.has(CLIENTS[i].product))return false;
    if(OPSQ_STATUS!=='all' && (CLIENTS[i].stat||'active')!==OPSQ_STATUS)return false;
    if(OPSQ_FILTER==='all')return true;
    if(OPSQ_FILTER==='alert')return !!CLIENTS[i].opsAlert;
    const T=(CLIENTS[i].tasks||[]).filter(x=>!x.done);
    if(OPSQ_FILTER==='doc')return T.some(x=>x.type==='doc');
    if(OPSQ_FILTER==='task')return T.some(x=>x.type==='ai'||x.type==='carry'||x.type==='unexpected'||x.type==='overdraft');
    if(OPSQ_FILTER==='msg')return (CLIENTS[i].unread>0)||T.some(x=>x.type==='msg');
    return true;}
  function opsqRank(i){const k='c'+i;
    if(CLIENTS[i].opsAlert&&!opsDoneSet.has(k))return 0;
    if(!opsDoneSet.has(k)&&!opsAccum[k]&&pendOf(i)>0)return 1;
    if(opsAccum[k]&&!opsDoneSet.has(k))return 2;
    if(opsDoneSet.has(k))return 4;
    return 3;}
  const OQ_MSGICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>';
  const OQ_COINICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M17 8.2a6 6 0 1 1-5.2 10.5"/></svg>';
  function opsqRow(i){
    const c=CLIENTS[i],st=opsStatusOf(i),sm=OPS_STATMAP[c.stat||'active'];
    const alert=c.opsAlert?'<span class="oq-alert"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>חריגה</span>':'';
    const msg=c.unread>0
      ? `<button class="oq-msg" title="הודעות מהלקוח" onclick="event.stopPropagation();opsQueueMsg(${i})">${OQ_MSGICO} ${c.unread}</button>`
      : `<span class="oq-msg zero">${OQ_MSGICO} 0</span>`;
    const debt=(c.debt>0)?`<span class="oq-debt" title="חוב לתשלום ב-Bizibox">${OQ_COINICO} חוב · ${c.debt.toLocaleString('en-US')} ₪</span>`:'';
    return `<div class="oqrow ${st.acc}" onclick="opsQueueEnter(${i})">
        <div class="oqc oqc-name">
          <div class="oq-id"><div class="oq-name">${c.name} <span class="oq-stat ${sm[0]} clickable" title="החלפת סטטוס" onclick="event.stopPropagation();opsStatMenu(${i},this)">${sm[1]}<svg class="stat-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg></span></div><div class="oq-sub">${c.mgr}</div></div>
        </div>
        <div class="oqc oqc-prod">${c.product?prodLogo(c.product,'sm'):'<span class="oq-none">—</span>'}</div>
        <div class="oqc oqc-alert">${alert}</div>
        <div class="oqc oqc-debt">${debt}</div>
        <div class="oqc oqc-msg">${msg}</div>
        <div class="oqc oqc-status"><span class="oq-status ${st.cls}"><span class="dot"></span>${st.txt}</span></div>
        <div class="oqc oqc-act"><button class="oq-btn ${st.ghost?'ghost':''}" onclick="event.stopPropagation();opsQueueEnter(${i})">${st.btn}</button></div>
      </div>`;
  }
  function renderOpsQueue(){
    let waiting=0,prog=0,done=0,total=0;
    CLIENTS.forEach((c,i)=>{const k='c'+i,p=pendOf(i);total+=p;
      if(opsDoneSet.has(k))done++; else if(opsAccum[k])prog++; else if(p>0)waiting++;});
    // תיבות עבודה לפי סוג — לחיצה מסננת את התור
    const msgs=CLIENTS.reduce((s,c)=>s+(c.unread||0),0);
    let docsN=0; const docsCos=new Set();
    CLIENTS.forEach((c,i)=>{const n=(c.tasks||[]).filter(t=>!t.done&&t.type==='doc').length;if(n){docsN+=n;docsCos.add(i);}});
    const OQS_IC={
      wait:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      prog:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>',
      done:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>',
      msg:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>',
      doc:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      sheet:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>',
      time:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14M5 2h14M7 22v-4.2a2 2 0 0 1 .6-1.4L12 12 7.6 7.6A2 2 0 0 1 7 6.2V2M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l4.4-4.4A2 2 0 0 0 17 6.2V2"/></svg>'};
    // כל קובייה: מספר "מתוך", פס התקדמות, ולחיצה שפותחת תצוגה מקדימה עם הפירוט
    const T=CLIENTS.length, msgCos=CLIENTS.filter(c=>c.unread>0).length;
    const stat=(key,cls,ic,icc,n,of,l,pct,bar)=>{
      const open=OQS_OPEN===key;
      return `<div class="opsq-stat click ${cls} ${open?'open':''}" onclick="oqsToggle('${key}')">
      <span class="oqs-ic ${icc}">${ic}</span>
      <div class="oqs-b">
        <div class="n">${n}${of?` <em>${of}</em>`:''}</div>
        <div class="l">${l}</div>
        ${bar?`<div class="oqs-bar"><i style="width:${Math.min(100,Math.round(pct))}%;background:${bar}"></i></div>`:''}
      </div>
      ${open?oqsPop(key):''}</div>`;};
    document.getElementById('opsqStrip').innerHTML=
      stat('wait','warn',OQS_IC.wait,'coral',waiting,'מתוך '+T,'חברות ממתינות',waiting/T*100,'var(--coral)')+
      stat('prog','',OQS_IC.prog,'amber',prog,'מתוך '+T,'בתהליך תפעול',prog/T*100,'var(--amber)')+
      stat('done','',OQS_IC.done,'green',done,'מתוך '+T,'הושלמו היום',done/T*100,'var(--green)')+
      stat('msg',(msgs?'warn':''),OQS_IC.msg,'blue',msgs,'ב-'+msgCos+' חברות','הודעות מלקוחות',msgCos/T*100,'var(--blue)')+
      stat('doc','',OQS_IC.doc,'purple',docsN,'ב-'+docsCos.size+' חברות','מסמכים להזין',docsCos.size/T*100,'#6b4fd6')+
      stat('sheet','',OQS_IC.sheet,'teal',6,'ב-4 מדדים','שינויים בגוגל שיט',50,'#0d9488')+
      stat('time','accent',OQS_IC.time,'navy',fmtDur(totalOpsTime()),'','זמן תפעול כולל',0,'');
    const SS=[['all','הכל'],['active','פעיל'],['trial','ניסיון'],['setup','בהקמה']];
    const statTot=s=>s==='all'?CLIENTS.length:CLIENTS.filter(c=>(c.stat||'active')===s).length;
    const statDone=s=>CLIENTS.filter((c,ix)=>(s==='all'||(c.stat||'active')===s)&&opsDoneSet.has('c'+ix)).length;
    document.getElementById('opsqStatus').innerHTML=SS.map(s=>{
      const tot=statTot(s[0]), dn=statDone(s[0]), pct=tot?Math.round(dn/tot*100):0;
      return `<div class="sseg ${OPSQ_STATUS===s[0]?'on':''}" onclick="opsqSetStatus('${s[0]}')">
        <div class="sseg-top">${s[1]}<span class="sseg-count">${tot}</span></div>
        <div class="sseg-bar"><div class="fill" style="width:${pct}%"></div></div>
        <div class="sseg-done">${dn} מתוך ${tot} סיימו תפעול</div>
      </div>`;}).join('')
      +`<div class="sarch" title="לקוחות בארכיון" onclick="toast('לקוחות בארכיון')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg></div>`;
    const F=[['all','הכל'],['alert','חריגות'],['doc','מסמכים'],['task','משימות'],['msg','הודעות']];
    document.getElementById('opsqFilters').innerHTML=F.map(f=>`<div class="ofilter ${OPSQ_FILTER===f[0]?'on':''}" onclick="opsqFilter('${f[0]}')">${f[1]}</div>`).join('');
    const order=CLIENTS.map((c,i)=>i).filter(opsqMatch)
      .sort((a,b)=>OPSQ_SORT==='name'?CLIENTS[a].name.localeCompare(CLIENTS[b].name,'he'):opsqRank(a)-opsqRank(b));
    const listEl=document.getElementById('opsqList');
    const HDR=`<div class="oqhead">
      <div class="oq-sort" onclick="opsqSortToggle()" title="מיון לפי שם / דחיפות">חברה ${OPSQ_SORT==='name'?'א-ת ▲':'· לפי דחיפות'}</div>
      <div class="oqc-prod">מוצר</div><div class="oqc-alert">חריגה</div><div class="oqc-debt">חוב</div><div class="oqc-msg">הודעות</div><div class="oqc-status">תפעול</div><div></div></div>`;
    listEl.innerHTML = order.length ? HDR+order.map(opsqRow).join('') : '<div class="ops-empty" style="padding:40px">אין חברות בסינון הזה</div>';
    renderMgrCal();
  }
  /* תצוגה מקדימה לקוביות הסטטיסטיקה */
  let OQS_OPEN=null;
  function oqsToggle(k){OQS_OPEN=OQS_OPEN===k?null:k;renderOpsQueue();}
  document.addEventListener('click',e=>{
    if(OQS_OPEN&&!e.target.closest('.opsq-stat')){OQS_OPEN=null;renderOpsQueue();}
  });
  const OQS_CHEV='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>';
  function oqsRow(act,name,sub){
    return `<div class="oqs-row" onclick="event.stopPropagation();OQS_OPEN=null;${act}"><b>${name}</b><span>${sub}</span>${OQS_CHEV}</div>`;
  }
  function oqsPop(key){
    const H={wait:'ממתינות לתפעול',prog:'בתהליך תפעול',done:'הושלמו היום',msg:'הודעות פתוחות מלקוחות',doc:'מסמכים שממתינים להזנה',sheet:'שינויים אחרונים בגיליונות',time:'פירוט זמן תפעול'};
    let rows='',foot='';
    if(key==='wait') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(!opsDoneSet.has(k)&&!opsAccum[k]&&pendOf(i)>0) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,pendOf(i)+' משימות'+(c.opsAlert?' · חריגה':''));});
    if(key==='prog') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(opsAccum[k]&&!opsDoneSet.has(k)) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,'נצבר '+fmtDur(opsAccum[k]));});
    if(key==='done') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(opsDoneSet.has(k)) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,'הושלם · '+fmtDur(opsDur[k]||0));});
    if(key==='msg'){
      CLIENTS.forEach((c,i)=>{if(c.unread>0) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,c.unread+' הודעות ממתינות');});
      foot=`<div class="oqs-foot" onclick="event.stopPropagation();OQS_OPEN=null;opsqFilter('msg')">סינון התור להודעות בלבד</div>`;
    }
    if(key==='doc'){
      CLIENTS.forEach((c,i)=>{const n=(c.tasks||[]).filter(t=>!t.done&&t.type==='doc').length;
        if(n) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,n+' מסמכים להזנה');});
      foot=`<div class="oqs-foot" onclick="event.stopPropagation();OQS_OPEN=null;opsqFilter('doc')">סינון התור למסמכים בלבד</div>`;
    }
    if(key==='sheet') [
      ['מחזור הכנסות — אנרגי אינטרנשיונל','B4 עודכן · 118,500 → 124,300'],
      ['ליטרים בחודש — מטעי גבעון','C7 עודכן · 3,180 → 3,240'],
      ['יעד מכירות — אנרגי גולני','B2 עודכן · 90,000 → 95,000'],
      ['מדד שירות — רימון יצחק','נוסף גיליון "יולי 2026"'],
      ['מחזור הכנסות — משה עובד','B5 עודכן · 61,200 → 63,900'],
      ['ליטרים בחודש — מטעי גבעון','C8 עודכן · 2,940 → 3,010'],
    ].forEach(x=>rows+=oqsRow(`toast('נפתח המדד — ${x[0]}')`,x[0],x[1]));
    if(key==='time') CLIENTS.forEach((c,i)=>{const k='c'+i,s=(opsDur[k]||0)+(opsAccum[k]||0);
      if(s) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,fmtDur(s)+(opsDoneSet.has(k)?' · הושלם':' · בתהליך'));});
    if(!rows) rows='<div class="oqs-empty">אין פריטים כרגע — הכל נקי ✓</div>';
    return `<div class="oqs-pop" onclick="event.stopPropagation()"><div class="oqs-pop-h">${H[key]}</div>${rows}${foot}</div>`;
  }

  let OPSQ_SORT='rank';
  function opsqSortToggle(){OPSQ_SORT=OPSQ_SORT==='rank'?'name':'rank';renderOpsQueue();}
  function opsqFilter(k){OPSQ_FILTER=k;renderOpsQueue();}

  /* ---- היומן של מנהל התזרים — תפעולים, פגישות ומשימות שהוא פותח לעצמו ---- */
  const MC_NOW='10:54';   // שעת הדמו — כמו בכותרת "סונכרן 10:54"
  let MGR_AGENDA=[
    {time:'09:00', dur:'40 דק׳', kind:'ops',    title:'תפעול — אנרגי אינטרנשיונל', sub:'הושלם · נשלח עדכון ללקוח', done:true,  co:0},
    {time:'09:45', dur:'35 דק׳', kind:'ops',    title:'תפעול — מטעי גבעון',        sub:'הושלם · 2 קיטלוגים אושרו',  done:true,  co:2},
    {time:'10:30', dur:'30 דק׳', kind:'task',   title:'בדיקת נגררות יוני — 5 חברות', sub:'משימה שלי',               done:false, pri:'high'},
    {time:'11:30', dur:'20 דק׳', kind:'client', title:'עדכון תקציב שיווק ליולי',    sub:'משימת לקוח · אנרגי אינטרנשיונל', done:false},
    {time:'13:00', dur:'45 דק׳', kind:'meet',   title:'פגישת צוות שבועית',          sub:'עם לירון בן כליפא · Zoom',  done:false},
    {time:'14:30', dur:'25 דק׳', kind:'task',   title:'מעקב חוב — רימון יצחק',      sub:'משימה שלי · 421,050 ₪',    done:false, pri:'high'},
    {time:'16:00', dur:'30 דק׳', kind:'task',   title:'שליחת עדכוני תזרים ללקוחות', sub:'משימה שלי · 4 חברות נותרו', done:false, pri:'mid'},
  ];
  /* שאר השבוע — לתצוגת שבוע (היום = חמישי, אינדקס 4) */
  const MC_TODAY=4, MC_DAYS=['ראשון','שני','שלישי','רביעי','חמישי'];
  let MC_WOFF=0;   // היסט שבועות מהשבוע הנוכחי
  function mcwNav(d){MC_WOFF+=d;renderMgrCal();}
  function mcwToday(){MC_WOFF=0;renderMgrCal();}
  /* שבוע שעבר — הכל בוצע */
  const MC_WEEK_PAST=[
    {d:0,time:'09:00',kind:'ops', title:'תפעול — אנרגי אינטרנשיונל',done:true},
    {d:0,time:'11:00',kind:'ops', title:'תפעול — משה עובד',done:true},
    {d:1,time:'09:30',kind:'ops', title:'תפעול — אנרגי גולני',done:true},
    {d:1,time:'14:00',kind:'meet',title:'פגישת צוות שבועית',done:true},
    {d:2,time:'10:00',kind:'ops', title:'תפעול — מטעי גבעון',done:true},
    {d:2,time:'13:00',kind:'task',title:'סגירת דוחות יוני',done:true},
    {d:3,time:'09:00',kind:'ops', title:'תפעול — רימון יצחק',done:true},
    {d:4,time:'11:00',kind:'task',title:'עדכוני תזרים ללקוחות',done:true},
    {d:4,time:'15:00',kind:'meet',title:'שיחת סיכום — לירון',done:true},
  ];
  /* שבוע הבא — מתוכנן */
  const MC_WEEK_NEXT=[
    {d:0,time:'09:00',kind:'ops', title:'תפעול — אנרגי אינטרנשיונל'},
    {d:0,time:'13:00',kind:'meet',title:'פגישה חודשית — אנרגי גולני'},
    {d:1,time:'09:30',kind:'ops', title:'תפעול — מטעי גבעון'},
    {d:2,time:'10:00',kind:'task',title:'הכנת דוח רבעון Q3'},
    {d:3,time:'09:00',kind:'ops', title:'תפעול — רימון יצחק'},
    {d:4,time:'12:00',kind:'meet',title:'סקירת רבעון — משה עובד'},
  ];
  const MC_WEEK=[
    {d:0,time:'09:00',kind:'ops', title:'תפעול — אנרגי גולני'},
    {d:0,time:'11:00',kind:'task',title:'דוחות שבועיים'},
    {d:0,time:'14:00',kind:'meet',title:'פגישת לקוח — משה עובד'},
    {d:1,time:'09:30',kind:'ops', title:'תפעול — מטעי גבעון'},
    {d:1,time:'13:00',kind:'task',title:'מעקב תקציבים'},
    {d:2,time:'10:00',kind:'ops', title:'תפעול — רימון יצחק'},
    {d:2,time:'15:00',kind:'meet',title:'הדרכת Bizibox'},
    {d:3,time:'09:00',kind:'ops', title:'תפעול — אנרגי אינטרנשיונל'},
    {d:3,time:'12:00',kind:'task',title:'אישור קיטלוגים'},
    {d:3,time:'16:00',kind:'task',title:'עדכוני תזרים ללקוחות'},
  ];
  let MC_VIEW='day';
  function mcView(v){
    MC_VIEW=v;
    document.getElementById('mcSegDay').classList.toggle('on',v==='day');
    document.getElementById('mcSegWeek').classList.toggle('on',v==='week');
    renderMgrCal();
  }
  /* משימות פתוחות — בלי שעה, יושבות מעל היומן */
  let MGR_TODO=[
    {t:'אישור דוח חודשי — מאי',            pri:'high', done:false},
    {t:'בדיקת התאמות בנקאיות',             pri:'high', done:false},
    {t:'עדכון מחירון לקוחות 2026',         pri:'mid',  done:false},
    {t:'מענה לפניית מס הכנסה — משה עובד',  pri:'high', done:false},
  ];
  function mcTodoHtml(){
    const open=MGR_TODO.filter(x=>!x.done).length;
    return `<div class="mc-todo">
      <div class="mc-todo-h">משימות פתוחות <span class="mc-todo-n">${open}</span><i>גררו ליומן כדי לשבץ שעה</i></div>
      ${MGR_TODO.map((x,i)=>`
        <div class="mc-todo-row ${x.done?'done':''}" draggable="${!x.done}" ondragstart="mcDragStart(event,${i})" ondragend="mcDragEnd()">
          <span class="mc-grip" aria-hidden="true"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg></span>
          <label class="mc-chk"><input type="checkbox" ${x.done?'checked':''} onchange="mcTodoToggle(${i})"><span></span></label>
          <span class="mc-todo-t">${x.t}</span>
          <span class="mc-pri ${x.pri}">${x.pri==='high'?'גבוהה':'בינונית'}</span>
        </div>`).join('')}
    </div>`;
  }
  function mcTodoToggle(i){
    MGR_TODO[i].done=!MGR_TODO[i].done;
    renderMgrCal();
    if(MGR_TODO[i].done) toast('סומן כבוצע');
  }
  /* גרירת משימה פתוחה אל שעה ביומן */
  let MC_DRAG=-1;
  function mcDragStart(e,i){
    MC_DRAG=i;
    e.dataTransfer.effectAllowed='move';
    try{e.dataTransfer.setData('text/plain',String(i));}catch(_){}
    setTimeout(()=>{const el=document.getElementById('mgrCal');if(el)el.classList.add('drag-on');},0);
  }
  function mcDragEnd(){
    MC_DRAG=-1;
    const el=document.getElementById('mgrCal');if(el)el.classList.remove('drag-on');
  }
  function mcDrop(e,time){
    e.preventDefault();
    const x=MGR_TODO[MC_DRAG]; if(!x) return;
    MGR_TODO.splice(MC_DRAG,1); MC_DRAG=-1;
    MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:x.t, sub:'משימה שלי', done:false, pri:x.pri});
    renderMgrCal(); toast('שובץ ביומן ל-'+time);
  }
  function mcDropWeek(e,d,time){
    e.preventDefault();
    const x=MGR_TODO[MC_DRAG]; if(!x) return;
    if(MC_WOFF<0){toast('אי אפשר לשבץ לשבוע שעבר');return;}
    MGR_TODO.splice(MC_DRAG,1); MC_DRAG=-1;
    if(MC_WOFF===0&&d===MC_TODAY){
      MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:x.t, sub:'משימה שלי', done:false, pri:x.pri});
    }else{
      (MC_WOFF===0?MC_WEEK:MC_WEEK_NEXT).push({d, time, kind:'task', title:x.t});
    }
    renderMgrCal(); toast('שובץ ליום '+MC_DAYS[d]+' ב-'+time);
  }
  const MC_KIND={ops:'תפעול',task:'משימה',client:'משימת לקוח',meet:'פגישה'};
  const MC_ICO={
    ops:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>',
    task:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/></svg>',
    client:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    meet:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'};
  function renderMgrCal(){
    const el=document.getElementById('mgrCal'); if(!el) return;
    if(MC_VIEW==='week'){renderMgrWeek(el);return;}
    const items=[...MGR_AGENDA].sort((a,b)=>a.time.localeCompare(b.time));
    // סלוטים שעתיים לשחרור גרירה — נחשפים רק בזמן גרירת משימה פתוחה
    const slots=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
    const entries=[...slots.map(t=>({slot:true,time:t})),...items.map(x=>({slot:false,time:x.time,x}))]
      .sort((a,b)=>a.time.localeCompare(b.time)||(a.slot?-1:1));
    let html=mcTodoHtml(), nowDrawn=false;
    entries.forEach(en=>{
      if(!nowDrawn && en.time>MC_NOW){
        html+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${MC_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
        nowDrawn=true;
      }
      if(en.slot){
        html+=`<div class="mc-drop" onclick="mcSlotAdd('${en.time}')" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="mcDrop(event,'${en.time}')"><span dir="ltr">${en.time}</span><i class="add-t">+ הוספת משימה</i><i class="drop-t">שחררו כאן לשיבוץ</i></div>`;
        return;
      }
      const it=en.x;
      const ix=MGR_AGENDA.indexOf(it);
      const enter=(it.kind==='ops'&&!it.done)?` onclick="opsQueueEnter(${it.co})"`:'';
      html+=`<div class="mc-item ${it.kind} ${it.done?'done':''}"${enter}>
        <div class="mc-time" dir="ltr">${it.time}</div>
        <label class="mc-chk" onclick="event.stopPropagation()"><input type="checkbox" ${it.done?'checked':''} onchange="mcToggle(${ix})"><span></span></label>
        <div class="mc-b">
          <div class="mc-t">${it.title}${it.pri?` <span class="mc-pri ${it.pri}">${it.pri==='high'?'גבוהה':'בינונית'}</span>`:''}</div>
          <div class="mc-s">${it.sub} · ${it.dur}</div>
        </div>
        <span class="mc-tag ${it.kind}">${MC_ICO[it.kind]} ${MC_KIND[it.kind]}</span>
      </div>`;
    });
    if(!nowDrawn) html+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${MC_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
    const left=MGR_AGENDA.filter(x=>!x.done).length;
    el.innerHTML=html+`<div class="mc-foot">${left} משימות נותרו להיום</div>`;
  }
  /* תצוגת שבוע — גריד שעות × ימים, עם דפדוף בין שבועות */
  function renderMgrWeek(el){
    const evts=MC_WOFF===0 ? MC_WEEK.concat(MGR_AGENDA.map(a=>({d:MC_TODAY,time:a.time,kind:a.kind,title:a.title,done:a.done})))
             : MC_WOFF===-1 ? MC_WEEK_PAST
             : MC_WOFF===1  ? MC_WEEK_NEXT : [];
    const dates=MC_DAYS.map((_,i)=>{const dt=new Date(2026,5,28+MC_WOFF*7+i);return dt.getDate()+'.'+String(dt.getMonth()+1).padStart(2,'0');});
    const hours=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
    let html=mcTodoHtml();
    // חיצים ב-SVG — תווי ‹ › מתהפכים ב-RTL
    html+=`<div class="mcw-nav">
      <button class="mcw-arr" onclick="mcwNav(-1)" title="שבוע קודם"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
      <span class="mcw-range">${dates[0]} – ${dates[4]}${MC_WOFF!==0?` <button class="mcw-todaybtn" onclick="mcwToday()">חזרה להיום</button>`:''}</span>
      <button class="mcw-arr" onclick="mcwNav(1)" title="שבוע הבא"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg></button>
    </div>`;
    html+='<div class="mcw">';
    html+='<div class="mcw-row mcw-hdr"><div class="mcw-time"></div>'+
      MC_DAYS.map((d,i)=>`<div class="mcw-day ${MC_WOFF===0&&i===MC_TODAY?'today':''}">${d}<span>${dates[i]}</span></div>`).join('')+'</div>';
    hours.forEach(h=>{
      html+=`<div class="mcw-row"><div class="mcw-time" dir="ltr">${h}</div>`;
      for(let d=0;d<5;d++){
        const cell=evts.filter(e=>e.d===d&&e.time>=h&&e.time<(hours[hours.indexOf(h)+1]||'17:00'));
        html+=`<div class="mcw-cell ${MC_WOFF===0&&d===MC_TODAY?'today':''} ${MC_WOFF>=0?'clickable':''}" title="הוספת משימה — ${MC_DAYS[d]} ${h}" onclick="mcCellAdd(${d},'${h}')" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="this.classList.remove('over');mcDropWeek(event,${d},'${h}')">${cell.map(e=>
          `<div class="mcw-ev ${e.kind} ${e.done?'done':''}" title="${e.title}"><b dir="ltr">${e.time}</b> ${e.title}</div>`).join('')}</div>`;
      }
      html+='</div>';
    });
    html+='</div>';
    const foot=evts.length?`${evts.length} אירועים בשבוע זה · הלחיצות והעריכה בתצוגת יום`:'אין אירועים מתוכננים בשבוע זה';
    el.innerHTML=html+`<div class="mc-foot">${foot}</div>`;
  }
  function mcToggle(ix){
    MGR_AGENDA[ix].done=!MGR_AGENDA[ix].done;
    renderMgrCal();
    if(MGR_AGENDA[ix].done) toast('סומן כבוצע — כל הכבוד');
  }
  function mcQuick(){
    const r=document.getElementById('mcQuickRow');
    const show=r.style.display==='none';
    r.style.display=show?'flex':'none';
    if(show) setTimeout(()=>document.getElementById('mcQTitle').focus(),60);
  }
  /* הוספה מתוך הלוח — לחיצה על שעה פותחת את ההוספה המהירה עם השעה מוכנה */
  let MC_ADD_DAY=null;
  function mcSlotAdd(time){
    MC_ADD_DAY=null;
    document.getElementById('mcQuickRow').style.display='flex';
    document.getElementById('mcQTime').value=time;
    document.getElementById('mcQTitle').focus();
  }
  function mcCellAdd(d,time){
    if(MC_WOFF<0){toast('אי אפשר להוסיף לשבוע שעבר');return;}
    MC_ADD_DAY=d;
    document.getElementById('mcQuickRow').style.display='flex';
    document.getElementById('mcQTime').value=time;
    document.getElementById('mcQTitle').focus();
  }
  function mcAdd(){
    const t=document.getElementById('mcQTitle').value.trim(); if(!t) return;
    const time=document.getElementById('mcQTime').value, pri=document.getElementById('mcQPri').value;
    if(time && MC_ADD_DAY!=null && MC_VIEW==='week' && !(MC_WOFF===0&&MC_ADD_DAY===MC_TODAY)){
      (MC_WOFF===0?MC_WEEK:MC_WEEK_NEXT).push({d:MC_ADD_DAY, time, kind:'task', title:t});
      toast('נוסף ליום '+MC_DAYS[MC_ADD_DAY]+' ב-'+time);
    }else if(time){ // עם שעה → ליומן; בלי שעה → למשימות הפתוחות
      MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:t, sub:'משימה שלי', done:false, pri});
      toast('המשימה נוספה ליומן');
    }else{
      MGR_TODO.push({t, pri, done:false});
      toast('נוספה למשימות הפתוחות');
    }
    MC_ADD_DAY=null;
    document.getElementById('mcQTitle').value='';document.getElementById('mcQTime').value='';
    document.getElementById('mcQuickRow').style.display='none';
    renderMgrCal();
  }

