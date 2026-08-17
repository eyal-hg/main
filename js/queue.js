/* HK Dashboard — cross-company operations queue, product logos */
  /* operator home — cross-company operations queue */
  const pendOf=i=>(CLIENTS[i].tasks||[]).filter(t=>!t.done).length;
  const totalOpsTime=()=>{let s=0;CLIENTS.forEach((c,i)=>{s+=(opsDur['c'+i]||0)+(opsAccum['c'+i]||0);});return s;};
  let OPSQ_FILTER='all', OPSQ_STATUS='all'; const opsqOpen=new Set();
  const OPS_STATMAP={active:['st-active','פעיל'],trial:['st-trial','ניסיון'],setup:['st-setup','בהקמה']};
  function opsqSetStatus(k){OPSQ_STATUS=k;renderOpsQueue();}
  function opsStatusOf(i){const k='c'+i;
    if(typeof FIN_STATE!=='undefined'&&FIN_STATE&&FIN_STATE.key===k)
      return{cls:'check',acc:'acc-blue',txt:'בבדיקות · שלב '+(FIN_STATE.step+1)+'/'+FIN_STEPS.length,btn:'המשך בדיקות',ghost:false};
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
  let MGR_FILTER='', FIRM_FILTER='';
  const firmOk=c=>!FIRM_FILTER||c.firm===FIRM_FILTER;
  function toggleFirm(e){
    e.stopPropagation();
    const m=document.getElementById('firmMenu');
    const firms=[...new Set(CLIENTS.map(c=>c.firm).filter(Boolean))];
    m.innerHTML=`<div class="prod-opt ${FIRM_FILTER===''?'on':''}" onclick="pickFirm('')">כל חברות הייעוץ</div>`+
      firms.map(f=>`<div class="prod-opt ${FIRM_FILTER===f?'on':''}" onclick="pickFirm('${f}')">${f} <span class="mgr-n">${CLIENTS.filter(c=>c.firm===f).length}</span></div>`).join('');
    m.classList.toggle('show');
  }
  function pickFirm(f){
    FIRM_FILTER=f;
    document.getElementById('firmMenu').classList.remove('show');
    document.getElementById('firmDdl').innerHTML=(f||'כל חברות הייעוץ')+' <span>▾</span>';
    if(typeof renderGlobalRail==='function')renderGlobalRail();
    if(document.getElementById('opsQueueView').style.display!=='none')renderOpsQueue();
    if(document.getElementById('clientsView').style.display!=='none'&&typeof renderClientsView==='function')renderClientsView();
  }
  document.addEventListener('click',function(e){const m=document.getElementById('firmMenu');if(m&&m.classList.contains('show')&&!m.contains(e.target)&&e.target.id!=='firmDdl')m.classList.remove('show');});
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
    if(!firmOk(CLIENTS[i]))return false;
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
  /* ===== סדר תור התפעול — חוקים שהאדמין מסדר בהגדרות =====
     החוק הראשון שתופס קובע את המיקום; "לקוחות של יועצים" דוחף לסוף; הושלמו תמיד אחרונים */
  let QUEUE_RULES=[
    {id:'req',      label:'בקשת לקוח — תפעול יומי עד שעה קבועה', on:true,  match:c=>!!c.reqBy,               why:c=>'עד '+c.reqBy},
    {id:'alert',    label:'לקוחות בחריגה בפועל',                  on:true,  match:c=>!!c.opsAlert,            why:()=>'חריגה בפועל'},
    {id:'forecast', label:'לקוחות בחריגה צפויה',                  on:true,  match:c=>((c.metrics||{}).overdraft||0)>0, why:c=>'חריגה צפויה'},
    {id:'group',    label:'קבוצות חברות גדולות',                  on:true,  match:c=>!!c.group,               why:()=>'קבוצת חברות'},
    {id:'advisor',  label:'לקוחות של יועצים — בסוף התור',         on:true,  match:c=>!!c.advClient, last:true, why:()=>'לקוח של יועץ'},
  ];
  function qRule(i){
    const c=CLIENTS[i];
    for(let r=0;r<QUEUE_RULES.length;r++){
      const rule=QUEUE_RULES[r];
      if(rule.on&&rule.match(c)) return {rank:rule.last?90:r, why:rule.why(c)};
    }
    return {rank:50, why:''};
  }
  function opsqRank(i){const k='c'+i;
    if(opsDoneSet.has(k))return 1000;                 // הושלמו — תמיד בסוף
    return qRule(i).rank*10+(opsAccum[k]?1:0);        // בתהליך מעט אחרי ממתין באותו חוק
  }
  function qrMove(ix,d){
    const j=ix+d; if(j<0||j>=QUEUE_RULES.length)return;
    const t=QUEUE_RULES[ix];QUEUE_RULES[ix]=QUEUE_RULES[j];QUEUE_RULES[j]=t;
    renderSettings();renderGlobalRail();
    if(document.getElementById('opsQueueView').style.display!=='none')renderOpsQueue();
    toast('סדר התור עודכן');
  }
  function qrToggle(ix){
    QUEUE_RULES[ix].on=!QUEUE_RULES[ix].on;
    renderSettings();renderGlobalRail();
    if(document.getElementById('opsQueueView').style.display!=='none')renderOpsQueue();
  }
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
    const msgs=CLIENTS.filter(firmOk).reduce((s,c)=>s+(c.unread||0),0);
    let docsN=0; const docsCos=new Set();
    CLIENTS.forEach((c,i)=>{if(!firmOk(c))return;const n=(c.tasks||[]).filter(t=>!t.done&&t.type==='doc').length;if(n){docsN+=n;docsCos.add(i);}});
    const OQS_IC={
      wait:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
      prog:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>',
      done:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>',
      msg:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>',
      doc:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
      sheet:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>',
      time:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14M5 2h14M7 22v-4.2a2 2 0 0 1 .6-1.4L12 12 7.6 7.6A2 2 0 0 1 7 6.2V2M17 22v-4.2a2 2 0 0 0-.6-1.4L12 12l4.4-4.4A2 2 0 0 0 17 6.2V2"/></svg>'};
    // פס "מצב היום" — משטח אחד, טיפוגרפיה במקום קוביות
    const FC=CLIENTS.filter(firmOk);
    const T=FC.length, msgCos=FC.filter(c=>c.unread>0).length;
    const doneN=CLIENTS.map((c,i)=>({c,i})).filter(o=>firmOk(o.c)&&opsDoneSet.has('c'+o.i)).length;
    const sec=(key,label,big,sub)=>{
      const open=OQS_OPEN===key;
      return `<div class="db-sec ${open?'open':''}" onclick="oqsToggle('${key}')">
        <div class="db-l">${label}</div><div class="db-big">${big}</div><div class="db-sub">${sub}</div>
        ${open?oqsPop(key):''}</div>`;};
    const mrepN=FC.filter(c=>c.mReport).length;
    document.getElementById('opsqStrip').innerHTML=`<div class="daybar">
      ${sec('time','זמני תפעול',fmtDur(totalOpsTime()),'היום · '+done+' הושלמו')}
      ${sec('status','סטטוס תפעול',doneN+'<i>/'+T+'</i>','תופעלו · '+(T-doneN)+' נותרו להיום')}
      ${sec('doc','מסמכים להזנה',docsN,'ב-'+docsCos.size+' חברות · לפי מקור')}
      ${sec('sheet','הזנות לקוח','<span class="db-ago">לפני 3 דק׳</span>','טבלאות הזנה · 3 שורות לאישור')}
      ${sec('mrep','דוחות חודשיים',mrepN+'<i>/'+T+'</i>','עד 10.7 · '+(T-mrepN)+' נותרו')}
    </div>`;
    renderOpsInfo();
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
    if(OQS_OPEN&&!e.target.closest('.opsq-stat, .db-sec')){OQS_OPEN=null;renderOpsQueue();}
  });
  function mrSend(i){CLIENTS[i].mReport=true;toast('הדוח החודשי נשלח ל'+CLIENTS[i].name+' בוואטסאפ');if(document.getElementById('opsQueueView').style.display!=='none')renderOpsQueue();if(typeof renderGlobalRail==='function')renderGlobalRail();if(typeof renderCoAlerts==='function')renderCoAlerts();}
  function chatFrom(i){OQS_OPEN=null;selectClient(i);showTab('msgs');} // מסך ההודעות המאוחד (הדראואר יצא לגמלאות)
  function qReply(inp,i){const v=inp.value.trim();if(!v)return;inp.value='';toast('התגובה נשלחה ל'+CLIENTS[i].name+' בוואטסאפ');}
  /* ההודעות שממתינות לטיפול בחברה — אחרי סינון מה שסומן כטופל */
  function msgPendOf(c,i){
    const users=(c.thread||[]).filter(m=>m.from==='user');
    const pend=users.slice(-Math.min(c.unread||1,users.length));
    const base=users.length-pend.length;
    const list=pend.length?pend.map((m,ix)=>({m,gi:base+ix})):[{m:{name:'הלקוח',when:'היום',t:'היי, אפשר לקבל עדכון על מצב החשבון?'},gi:-1}];
    window._msgHandled=window._msgHandled||new Set();
    return list.filter(p=>!window._msgHandled.has(i+':'+p.gi));
  }
  function msgDone(i,gi){
    window._msgHandled=window._msgHandled||new Set();
    window._msgHandled.add(i+':'+gi);
    renderOpsInfo();
    toastUndo('ההודעה סומנה כטופלה',()=>{window._msgHandled.delete(i+':'+gi);renderOpsInfo();});
  }
  /* תגובה על הודעה ספציפית — שליחה גם מסמנת כטופל */
  function qReplyMsg(inp,ci,gi){
    const v=inp.value.trim(); if(!v) return; inp.value='';
    const users=(CLIENTS[ci].thread||[]).filter(m=>m.from==='user');
    const m=users[gi];
    window._msgHandled=window._msgHandled||new Set();
    window._msgHandled.add(ci+':'+gi);
    toast('נשלחה תגובה על ״'+(m?m.t.slice(0,25):'')+'…״ — ההודעה טופלה');
    renderOpsInfo();
  }
  const OQS_CHEV='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg>';
  function oqsRow(act,name,sub){
    return `<div class="oqs-row" onclick="event.stopPropagation();OQS_OPEN=null;${act}"><b>${name}</b><span>${sub}</span>${OQS_CHEV}</div>`;
  }
  function oqsPop(key){
    const H={wait:'ממתינות לתפעול',prog:'בתהליך תפעול',done:'הושלמו היום',msg:'הודעות פתוחות מלקוחות',doc:'מסמכים שממתינים להזנה',sheet:'טבלאות ההזנה — שורות חדשות לאישור · לחיצה פותחת את הטבלה',time:'פירוט זמני תפעול — לפי חברה',status:'סטטוס תפעול — לפי חברה',mrep:'דוח חודשי — עד 10.7'};
    let rows='',foot='';
    if(key==='wait') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(!opsDoneSet.has(k)&&!opsAccum[k]&&pendOf(i)>0) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,pendOf(i)+' משימות'+(c.opsAlert?' · חריגה':''));});
    if(key==='prog') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(opsAccum[k]&&!opsDoneSet.has(k)) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,'נצבר '+fmtDur(opsAccum[k]));});
    if(key==='done') CLIENTS.forEach((c,i)=>{const k='c'+i;
      if(opsDoneSet.has(k)) rows+=oqsRow(`opsQueueEnter(${i})`,c.name,'הושלם · '+fmtDur(opsDur[k]||0));});
    if(key==='msg'){
      CLIENTS.forEach((c,i)=>{
        if(!firmOk(c)||!(c.unread>0)) return;
        const last=[...(c.thread||[])].reverse().find(m=>m.from==='user');
        const who=last?last.name:'הלקוח', when=last?last.when:'היום',
              txt=last?last.t:'היי, אפשר לקבל עדכון על מצב החשבון?';
        rows+=`<div class="oqs-chat" onclick="event.stopPropagation()">
          <div class="oqs-chat-h"><b>${c.name}</b><span>${c.unread} הודעות שלא נענו</span></div>
          <div class="oqs-bub"><div class="oqs-bub-h">${who} · ${when}</div>${txt}</div>
          <div class="oqs-reply"><input placeholder="תגובה מהירה בוואטסאפ…" onkeydown="if(event.key==='Enter')qReply(this,${i})"><button class="oqs-send" onclick="qReply(this.previousElementSibling,${i})">שליחה</button></div>
          <div class="oqs-openchat" onclick="chatFrom(${i})">לשיחה המלאה ←</div>
        </div>`;});
    }
    if(key==='doc'){
      CLIENTS.forEach((c,i)=>{
        if(!firmOk(c)) return;
        (c.tasks||[]).filter(t=>!t.done&&t.type==='doc').forEach(t=>{
          rows+=`<div class="oqs-row" onclick="event.stopPropagation();OQS_OPEN=null;selectClient(${i})">
            <b>${t.name}</b><span class="oqs-src ${t.src==='טבלת הזנה'?'gs':''}">${t.src||'הודעת לקוח'}</span></div>`;});
      });
    }
    if(key==='sheet') [
      [0,'אנרגי אינטרנשיונל','תשלומים לספקים · צפי — נוספו 2 שורות','לפני 3 דק׳',false,'תשלומים לספקים · צפי'],
      [0,'אנרגי אינטרנשיונל','תשלומים לספקים — שיק מהבוט בקבוצה','לפני 20 דק׳',false,'תשלומים לספקים · צפי'],
      [0,'אנרגי אינטרנשיונל','תקבולים מלקוחות · צפי — עודכן מרכז הבנייה','08:55',false,'תקבולים מלקוחות · צפי'],
      [1,'מטעי גבעון','תקבולים מלקוחות · צפי — נוספו 2 שורות','לפני 25 דק׳',false,'תקבולים מלקוחות · צפי'],
      [4,'משה עובד','תשלומים לספקים · צפי — שורה ראשונה!','08:40',true,'תשלומים לספקים · צפי'],
    ].forEach(x=>rows+=`<div class="oqs-row" onclick="event.stopPropagation();OQS_OPEN=null;openDataTable('${x[5]}',${x[0]})">
        <b>${x[1]}<i class="oqs-sub">${x[2]} · ${x[3]}</i></b><span class="oqs-src ${x[4]?'okk':'gs'}">${x[4]?'✓ אושר':'לאישור'}</span></div>`);
    if(key==='mrep') CLIENTS.forEach((c,i)=>{
      rows+=c.mReport
        ?oqsRow(`toast('הדוח של ${c.name} כבר נשלח')`,c.name,'✓ נשלח')
        :`<div class="oqs-row"><b>${c.name}</b><button class="mt-btn view" onclick="event.stopPropagation();mrSend(${i})">שליחת דוח</button></div>`;});
    if(key==='status') CLIENTS.forEach((c,i)=>{
      if(!firmOk(c)) return; const st=opsStatusOf(i);
      const tot=(c.tasks||[]).length, dn=(c.tasks||[]).filter(t=>t.done).length;
      const pct=opsDoneSet.has('c'+i)?100:(tot?Math.round(dn/tot*100):0);
      rows+=`<div class="oqs-row" onclick="event.stopPropagation();OQS_OPEN=null;selectClient(${i})">
        <div class="oi-rb"><b>${c.name}</b><div class="gn-qbar"><i class="${st.cls}" style="width:${pct}%"></i></div></div>
        <span class="oi-st ${st.cls}">${st.txt}</span></div>`;});
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
    {time:'13:00', dur:'45 דק׳', kind:'meet',   title:'פגישת צוות שבועית',          sub:'עם לירון בן כליפא · Zoom',  done:false, link:'Zoom'},
    {time:'15:00', dur:'45 דק׳', kind:'meet',   title:'פגישת תזרים — משה עובד',     sub:'מסונכרנת ללקוח · Google Meet', done:false, link:'Meet', client:'משה עובד'},
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
  let MC_DOFF=0;
  function mcDayNav(dir){MC_DOFF=Math.max(-4,Math.min(6,MC_DOFF+dir));renderMgrCal();}
  function mcDayToday(){MC_DOFF=0;renderMgrCal();}
  /* יום שאינו היום — אירועים מנתוני השבועות + סלוטים לשיבוץ */
  function renderMgrOtherDay(el,woff,dayIx){
    const evts=(woff===0?MC_WEEK:woff===1?MC_WEEK_NEXT:MC_WEEK_PAST).filter(e=>e.d===dayIx).sort((a,b)=>a.time.localeCompare(b.time));
    const slots=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
    let html='';
    slots.forEach((h,si)=>{
      const nxt=slots[si+1]||'17:00';
      const cell=evts.filter(e=>e.time>=h&&e.time<nxt);
      if(cell.length){
        cell.forEach(e=>{html+=`<div class="mc-item ${e.kind} ${e.done?'done':''}">
          <div class="mc-time" dir="ltr">${e.time}</div>
          <div class="mc-b"><div class="mc-t">${e.title}</div></div>
        </div>`;});
      }else if(woff>=0){
        html+=`<div class="mc-drop" onclick="evQuick('${h}',${dayIx})"><span dir="ltr">${h}–${mcEndOf(h)}</span><i class="add-t">+ הוספת אירוע</i></div>`;
      }
    });
    const foot=evts.length?evts.length+' אירועים ביום זה':'יום פנוי';
    el.innerHTML=`<div class="mcal-wrap"><aside class="mcal-side">${mgrTodoPanel()}</aside><div class="mcal-main">${html}<div class="mc-foot">${foot}</div></div></div>`;
  }
  function mcView(v){
    MC_VIEW=v;
    document.getElementById('mcSegDay').classList.toggle('on',v==='day');
    document.getElementById('mcSeg3d').classList.toggle('on',v==='3d');
    document.getElementById('mcSegWeek').classList.toggle('on',v==='week');
    renderMgrCal();
  }
  /* משימות פתוחות — בלי שעה, יושבות מעל היומן */
  let MGR_TODO=[
    {t:'עדכון שורה תקציבית — קניות מלאי',  pri:'mid',  done:false, due:'היום', client:'מטעי גבעון', rep:'monthly'},
    {t:'אישור דוח חודשי — מאי',            pri:'high', done:true,  due:'היום'},
    {t:'לתאם מול בנק הפועלים הגדלת מסגרת אשראי לרבעון האחרון, כולל עדכון מסמכי ביטחונות וחתימת ערבים', pri:'mid', done:false, due:'היום'},
    {t:'בדיקת התאמות בנקאיות',             pri:'high', done:false, due:'היום'},
    {t:'עדכון מחירון לקוחות 2026',         pri:'mid',  done:false, due:'12.07'},
    {t:'מענה לפניית מס הכנסה — משה עובד',  pri:'high', done:false, due:'15.07'},
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
          
        </div>`).join('')}
    </div>`;
  }
  function ctDone(i){
    CLIENT_TASKS[i].st=(CLIENT_TASKS[i].st==='done'?'prog':'done');
    renderMgrCal();
    toastUndo('המשימה של הלקוח הושלמה',()=>{CLIENT_TASKS[i].st='prog';renderMgrCal();});
  }
  function mcTodoToggle(i){
    MGR_TODO[i].done=!MGR_TODO[i].done;
    const ev=MGR_AGENDA.find(a=>a.todoRef===MGR_TODO[i]); if(ev)ev.done=MGR_TODO[i].done;
    renderMgrCal();
    if(typeof renderOpsInfo==='function')renderOpsInfo();
    if(MGR_TODO[i].done) toastUndo('המשימה הושלמה',()=>{MGR_TODO[i].done=false;const e2=MGR_AGENDA.find(a=>a.todoRef===MGR_TODO[i]);if(e2)e2.done=false;renderMgrCal();if(typeof renderOpsInfo==='function')renderOpsInfo();});
  }
  /* גרירת משימה פתוחה אל שעה ביומן */
  let MC_DRAG=-1;
  function mcEndOf(t){const p=t.split(':'),x=(+p[0])*60+(+p[1])+30;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0');}
  function mcDragStart(e,i){
    MC_DRAG=i;
    e.dataTransfer.effectAllowed='move';
    try{e.dataTransfer.setData('text/plain',String(i));}catch(_){}
  }
  function mcDragEnd(){MC_DRAG=-1;}
  function mcDrop(e,time){
    e.preventDefault();
    const x=MGR_TODO[MC_DRAG]; if(!x) return;
    MC_DRAG=-1;
    x.slot=time; // המשימה נשארת ברשימה — השיבוץ רק נותן לה שעה
    MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:x.t, sub:x.client?('משימת לקוח · '+x.client):'משימה שלי', done:false, todoRef:x});
    renderMgrCal(); if(typeof renderOpsInfo==='function')renderOpsInfo(); toast('שובץ ביומן ל-'+time+' — נשאר גם ברשימה');
  }
  function mcDropWeek(e,d,time){
    e.preventDefault();
    const x=MGR_TODO[MC_DRAG]; if(!x) return;
    if(MC_WOFF<0){toast('אי אפשר לשבץ לשבוע שעבר');return;}
    MC_DRAG=-1;
    x.slot=MC_DAYS[d]+' '+time; // נשארת ברשימה
    if(MC_WOFF===0&&d===MC_TODAY){
      MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:x.t, sub:'משימה שלי', done:false, todoRef:x});
    }else{
      (MC_WOFF===0?MC_WEEK:MC_WEEK_NEXT).push({d, time, kind:'task', title:x.t, todoRef:x});
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
    // ניווט יום: MC_DOFF=0 היום; אחרת מציגים את היום הנבחר מנתוני השבועות
    const D=MC_TODAY+MC_DOFF;
    const woff=D<0?-1:D>4?1:0, dayIx=((D%5)+5)%5;
    MC_WOFF=woff; // הוספות וגרירות ינחתו ביום המוצג
    const dLbl=document.getElementById('mcDayLbl');
    if(dLbl){
      const dt=new Date(2026,5,28+woff*7+dayIx);
      dLbl.innerHTML=(MC_DOFF===0?'היום · ':'')+'יום '+MC_DAYS[dayIx]+' '+dt.getDate()+'.'+String(dt.getMonth()+1).padStart(2,'0')+
        (MC_DOFF!==0?' <button class="mcw-todaybtn" onclick="mcDayToday()">חזרה להיום</button>':'');
    }
    if(MC_DOFF!==0){renderMgrOtherDay(el,woff,dayIx);return;}
    // תפעול שהושלם לא מוצג — אין צורך לראות ביומן את מה שכבר נעשה
    const items=MGR_AGENDA.filter(it=>!(it.kind==='ops'&&it.done)).sort((a,b)=>a.time.localeCompare(b.time));
    // סלוטים שעתיים לשחרור גרירה — נחשפים רק בזמן גרירת משימה פתוחה
    const slots=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
    // סלוט מוצג רק אם השעה פנויה — אין אירוע שמתחיל באותה שעה עגולה
    const taken=new Set(items.map(x=>x.time.slice(0,2)+':00'));
    const entries=[...slots.filter(t=>!taken.has(t)).map(t=>({slot:true,time:t})),...items.map(x=>({slot:false,time:x.time,x}))]
      .sort((a,b)=>a.time.localeCompare(b.time)||(a.slot?1:-1));
    let html='', nowDrawn=false;
    entries.forEach(en=>{
      if(!nowDrawn && en.time>MC_NOW){
        html+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${MC_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
        nowDrawn=true;
      }
      if(en.slot){
        html+=`<div class="mc-drop" onclick="mcSlotAdd('${en.time}')"><span dir="ltr">${en.time}–${mcEndOf(en.time)}</span><i class="add-t">+ הוספת אירוע</i></div>`;
        return;
      }
      const it=en.x;
      const ix=MGR_AGENDA.indexOf(it);
      const enter=(it.kind==='ops'&&!it.done)?` onclick="opsQueueEnter(${it.co})"`:'';
      html+=`<div class="mc-item ${it.kind} ${it.done?'done':''}"${enter}>
        <div class="mc-time" dir="ltr">${it.time}</div>
        <label class="mc-chk" onclick="event.stopPropagation()"><input type="checkbox" ${it.done?'checked':''} onchange="mcToggle(${ix})"><span></span></label>
        <div class="mc-b">
          <div class="mc-t">${it.title}${it.pri?` `:''}</div>
          <div class="mc-s flexed"><span class="mc-s-txt">${it.sub} · ${it.dur}</span>
            ${it.link&&!it.done?`<button class="mc-link" onclick="event.stopPropagation();toast('נפתח ${it.link} — ${it.title}')" title="פתיחת ${it.link}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> ${it.link} ↗</button>`:''}
            ${it.client&&it.kind==='meet'&&!it.done?`<button class="mc-link rec" onclick="event.stopPropagation();startMeetRec('${it.client}')" title="הקלטת הפגישה — מסונכרנת ללקוח"><span class="mrec-dot"></span> הקלטה</button>`:''}
          </div>
        </div>
        ${it.kind==='ops'?`<span class="mc-tag ops">${MC_ICO.ops} ${MC_KIND.ops}</span>`:''}
      </div>`;
    });
    if(!nowDrawn) html+=`<div class="mc-now"><span class="mc-now-t" dir="ltr">${MC_NOW}</span><span class="mc-now-line"></span><span class="mc-now-lbl">עכשיו</span></div>`;
    const left=MGR_AGENDA.filter(x=>!x.done).length;
    el.innerHTML=`<div class="mcal-wrap"><aside class="mcal-side">${mgrTodoPanel()}</aside><div class="mcal-main">${html}<div class="mc-foot">${left} משימות נותרו להיום</div></div></div>`;
  }
  /* תצוגת שבוע — גריד שעות × ימים, עם דפדוף בין שבועות */
  function renderMgrWeek(el,opt){
    const days=(opt&&opt.days)||[0,1,2,3,4];
    const withPanel=!opt||opt.panel!==false;
    const evts=MC_WOFF===0 ? MC_WEEK.concat(MGR_AGENDA.map(a=>({d:MC_TODAY,time:a.time,kind:a.kind,title:a.title,done:a.done})))
             : MC_WOFF===-1 ? MC_WEEK_PAST
             : MC_WOFF===1  ? MC_WEEK_NEXT : [];
    const dates=MC_DAYS.map((_,i)=>{const dt=new Date(2026,5,28+MC_WOFF*7+i);return dt.getDate()+'.'+String(dt.getMonth()+1).padStart(2,'0');});
    const hours=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'];
    const cols='46px repeat('+days.length+',1fr)';
    let html='';
    // חיצים ב-SVG — תווי ‹ › מתהפכים ב-RTL
    html+=`<div class="mcw-nav">
      <button class="mcw-arr" onclick="mcwNav(-1)" title="שבוע קודם"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
      <span class="mcw-range">${dates[days[0]]} – ${dates[days[days.length-1]]}${MC_WOFF!==0?` <button class="mcw-todaybtn" onclick="mcwToday()">חזרה להיום</button>`:''}</span>
      <button class="mcw-arr" onclick="mcwNav(1)" title="שבוע הבא"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg></button>
    </div>`;
    html+='<div class="mcw">';
    html+=`<div class="mcw-row mcw-hdr" style="grid-template-columns:${cols}"><div class="mcw-time"></div>`+
      days.map(i=>`<div class="mcw-day ${MC_WOFF===0&&i===MC_TODAY?'today':''}">${MC_DAYS[i]}<span>${dates[i]}</span></div>`).join('')+'</div>';
    hours.forEach(h=>{
      html+=`<div class="mcw-row" style="grid-template-columns:${cols}"><div class="mcw-time" dir="ltr">${h}</div>`;
      days.forEach(d=>{
        const cell=evts.filter(e=>e.d===d&&e.time>=h&&e.time<(hours[hours.indexOf(h)+1]||'17:00'));
        html+=`<div class="mcw-cell ${MC_WOFF===0&&d===MC_TODAY?'today':''} ${MC_WOFF>=0?'clickable':''}" title="הוספת משימה — ${MC_DAYS[d]} ${h}" onclick="mcCellAdd(${d},'${h}')" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="this.classList.remove('over');mcDropWeek(event,${d},'${h}')">${cell.map(e=>
          `<div class="mcw-ev ${e.kind} ${e.done?'done':''}" title="${e.title}"><b dir="ltr">${e.time}</b> ${e.title}</div>`).join('')}</div>`;
      });
      html+='</div>';
    });
    html+='</div>';
    const foot=evts.length?`${evts.length} אירועים בשבוע זה · הלחיצות והעריכה בתצוגת יום`:'אין אירועים מתוכננים בשבוע זה';
    const main=html+'<div class="mc-foot">'+foot+'</div>';
    el.innerHTML=withPanel
      ? `<div class="mcal-wrap"><aside class="mcal-side">${mgrTodoPanel()}</aside><div class="mcal-main">${main}</div></div>`
      : main;
  }
  function mcToggle(ix){
    MGR_AGENDA[ix].done=!MGR_AGENDA[ix].done;
    if(MGR_AGENDA[ix].todoRef){MGR_AGENDA[ix].todoRef.done=MGR_AGENDA[ix].done;}
    renderMgrCal();
    if(MGR_AGENDA[ix].done) toast('סומן כבוצע — כל הכבוד');
  }
  /* מודל משימה מלא: לקוח, חזרתיות, פירוט ותזכורת ללקוח */
  let MC_ADD_DAY=null, MTK_REP='once';
  function mcQuick(time){
    MTK_EDIT=null;
    const _tt=document.querySelector('#mtkOv .mx2-title'); if(_tt)_tt.textContent=time?('אירוע חדש · '+time):'משימה חדשה';
    const _db=document.getElementById('mtkDelBtn'); if(_db)_db.style.display='none';
    const _sb=document.querySelector('#mtkOv .mx2-btn.primary'); if(_sb)_sb.textContent=time?'הוספה ליומן':'הוספת המשימה';
    document.getElementById('mtkTitle').placeholder=time?'מה האירוע?':'מה צריך לעשות?';
    MC_ADD_DAY=null; MTK_REP='once';
    document.getElementById('mtkTitle').value='';
    document.getElementById('mtkTime').value=time||'';
    document.getElementById('mtkDetail').value='';
    document.getElementById('mtkRemind').checked=false;
    document.getElementById('mtkClient').value='';
    document.getElementById('mtkCliDd').classList.remove('show');
    const team=[...new Set(CLIENTS.map(c=>c.mgr))];
    document.getElementById('mtkOwner').innerHTML='<option value="">אחראי: אני</option>'+
      team.map(n=>`<option value="${n}">${n}</option>`).join('');
    document.querySelectorAll('#mtkRep .mtk-chip').forEach(c=>c.classList.toggle('on',c.dataset.r==='once'));
    mtkClientChange();
    document.getElementById('mtkOv').classList.add('show');
    setTimeout(()=>document.getElementById('mtkTitle').focus(),60);
  }
  function mcSlotAdd(time){ evQuick(time); }
  /* ===== מודל פגישה — שיקוף של הפופאפ מהיומן המלא ===== */
  const EV_TYPES=[['פגישה','#7557E3'],['תזרים','#1B6C9C'],['תפעול','#4CAF7D'],['אחר','#D9714E']];
  let EV_TYPE='פגישה', EV_DAY=null;
  function evMins(t){const p=t.split(':');return (+p[0])*60+(+p[1]);}
  function evHHMM(x){return String(Math.floor(x/60)%24).padStart(2,'0')+':'+String(x%60).padStart(2,'0');}
  function evQuick(time,dayIx){
    EV_DAY=(dayIx==null?null:dayIx); EV_TYPE='פגישה';
    const dIx=EV_DAY!=null?EV_DAY:MC_TODAY;
    const dt=new Date(2026,5,28+(typeof MC_WOFF!=='undefined'?MC_WOFF:0)*7+dIx);
    document.getElementById('evTitle').value='';
    document.getElementById('evDate').value=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    document.getElementById('evStart').value=time||'12:00';
    document.getElementById('evDur').value=50;
    evDurChange();
    document.getElementById('evClient').value='';
    document.getElementById('evCliDd').classList.remove('show');
    document.getElementById('evLocNote').value='';
    document.getElementById('evNotes').value='';
    document.getElementById('evLoc').selectedIndex=0;
    document.getElementById('evRemind').selectedIndex=0;
    document.getElementById('evRepeat').selectedIndex=0;
    evChipsRender();
    document.getElementById('evOv').classList.add('show');
    setTimeout(()=>document.getElementById('evTitle').focus(),60);
  }
  function evChipsRender(){
    document.getElementById('evChips').innerHTML=EV_TYPES.map(([n,c])=>
      `<span class="ev-chip ${EV_TYPE===n?'on':''}" style="--c:${c}" onclick="EV_TYPE='${n}';evChipsRender()"><i></i>${n}</span>`).join('');
  }
  function evDurChange(){
    const st=document.getElementById('evStart').value, d=+document.getElementById('evDur').value||50;
    if(st) document.getElementById('evEnd').value=evHHMM(evMins(st)+d);
  }
  function evEndChange(){
    const st=document.getElementById('evStart').value, en=document.getElementById('evEnd').value;
    if(!st||!en) return;
    const d=evMins(en)-evMins(st);
    if(d>0) document.getElementById('evDur').value=d;
  }
  /* דרופדאון לקוחות עם חיפוש */
  function evCliOpen(){document.getElementById('evCliDd').classList.add('show');evCliFilter();}
  function evCliFilter(){
    const q=document.getElementById('evClient').value.trim();
    const list=CLIENTS.filter(c=>firmOk(c)&&(!q||c.name.includes(q)));
    document.getElementById('evCliDd').innerHTML=list.length
      ?list.map(c=>`<div class="ev-dd-row" onmousedown="evCliPick('${c.name}')"><span class="ev-dd-av">${c.name.charAt(0)}</span><div><b>${c.name}</b><i>${c.mgr}</i></div></div>`).join('')
      :'<div class="ev-dd-empty">אין לקוח כזה — השם החופשי יישמר</div>';
  }
  function evCliPick(n){
    document.getElementById('evClient').value=n;
    document.getElementById('evCliDd').classList.remove('show');
  }
  function evClose(){document.getElementById('evOv').classList.remove('show');}
  function evSave(){
    const t=document.getElementById('evTitle').value.trim()||EV_TYPE;
    const st=document.getElementById('evStart').value||'12:00';
    const dur=+document.getElementById('evDur').value||50;
    const cli=document.getElementById('evClient').value.trim();
    const loc=document.getElementById('evLoc').value;
    const kind=EV_TYPE==='תפעול'?'ops':'meet';
    if(EV_DAY!=null && !(MC_WOFF===0&&EV_DAY===MC_TODAY)){
      (MC_WOFF===0?MC_WEEK:MC_WEEK_NEXT).push({d:EV_DAY, time:st, kind, title:t});
      toast('הפגישה נקבעה ליום '+MC_DAYS[EV_DAY]+' ב-'+st);
    }else{
      MGR_AGENDA.push({time:st, dur:dur+' דק׳', kind, title:t, sub:(cli?'עם '+cli+' · ':'')+loc+' · '+dur+' דק׳', done:false, client:cli||null});
      toast('הפגישה נקבעה ל-'+st);
    }
    if(document.getElementById('evRepeat').selectedIndex>0) toast('נקבעה חזרה '+document.getElementById('evRepeat').value);
    EV_DAY=null; evClose(); renderMgrCal();
  }
  function mcCellAdd(d,time){
    if(MC_WOFF<0){toast('אי אפשר להוסיף לשבוע שעבר');return;}
    mcQuick(time); MC_ADD_DAY=d;
  }
  function mtkClose(){document.getElementById('mtkOv').classList.remove('show');}
  function mtkRepSet(r){
    MTK_REP=r;
    document.querySelectorAll('#mtkRep .mtk-chip').forEach(c=>c.classList.toggle('on',c.dataset.r===r));
    mtkRepSubRender();
  }
  /* שדה משנה לפי סוג החזרה: תאריך / יום בשבוע / יום בחודש */
  function mtkRepSubRender(){
    const el=document.getElementById('mtkRepSub'); if(!el) return;
    if(MTK_REP==='once'){
      el.innerHTML='<i>לתאריך</i><input type="date" class="mx2-inp sub" id="mtkDate" value="2026-07-02">';
    }else if(MTK_REP==='weekly'){
      const wd=window._mtkWd??2;
      el.innerHTML='<i>בכל יום</i>'+['א׳','ב׳','ג׳','ד׳','ה׳'].map((d,ix)=>
        `<span class="mtk-chip day ${ix===wd?'on':''}" onclick="window._mtkWd=${ix};mtkRepSubRender()">${d}</span>`).join('');
    }else{
      const md=window._mtkMd??1;
      el.innerHTML='<i>בכל</i><select class="mx2-inp sub" id="mtkMd" onchange="window._mtkMd=+this.value">'+
        Array.from({length:28},(_,ix)=>`<option value="${ix+1}" ${ix+1===md?'selected':''}>${ix+1}</option>`).join('')+'</select><i>בחודש</i>';
    }
  }
  function mtkCliOpen(){document.getElementById('mtkCliDd').classList.add('show');mtkCliFilter();}
  function mtkCliFilter(){
    const q=document.getElementById('mtkClient').value.trim();
    const list=CLIENTS.filter(c=>firmOk(c)&&(!q||c.name.includes(q)));
    document.getElementById('mtkCliDd').innerHTML=list.length
      ?list.map(c=>`<div class="ev-dd-row" onmousedown="mtkCliPick('${c.name}')"><span class="ev-dd-av">${c.name.charAt(0)}</span><div><b>${c.name}</b><i>${c.mgr}</i></div></div>`).join('')
      :'<div class="ev-dd-empty">אין לקוח כזה</div>';
  }
  function mtkCliPick(n){
    document.getElementById('mtkClient').value=n;
    document.getElementById('mtkCliDd').classList.remove('show');
    mtkClientChange();
  }
  function mtkClientChange(){
    // תזכורת ללקוח — רלוונטית רק כשנבחר לקוח
    const has=document.getElementById('mtkClient').value!=='';
    const w=document.getElementById('mtkRemindWrap');
    w.style.opacity=has?'':'0.4'; w.style.pointerEvents=has?'':'none';
    if(!has) document.getElementById('mtkRemind').checked=false;
  }
  function mtkSave(){
    const t=document.getElementById('mtkTitle').value.trim();
    if(!t){toast('צריך שם למשימה');document.getElementById('mtkTitle').focus();return;}
    const time=document.getElementById('mtkTime').value, pri='mid';
    const client=document.getElementById('mtkClient').value.trim()||null;
    const detail=document.getElementById('mtkDetail').value.trim();
    const remind=document.getElementById('mtkRemind').checked;
    const owner=document.getElementById('mtkOwner').value||null;
    let due=null, repTxt=null;
    if(MTK_REP==='once'){
      const d=document.getElementById('mtkDate');
      if(d&&d.value){const p=d.value.split('-'); due=(d.value==='2026-07-02')?'היום':(+p[2])+'.'+p[1];}
    }else if(MTK_REP==='weekly'){
      repTxt='כל יום '+['א׳','ב׳','ג׳','ד׳','ה׳'][window._mtkWd??2];
    }else{
      repTxt='כל '+(window._mtkMd??1)+' בחודש';
    }
    const extra={pri, client, rep:MTK_REP, detail, remind, owner, due, repTxt};
    if(MTK_EDIT!=null){ // מצב עריכה — עדכון במקום
      Object.assign(MGR_TODO[MTK_EDIT],{t,...extra});
      MTK_EDIT=null; mtkClose(); renderMgrCal();
      if(typeof renderOpsInfo==='function')renderOpsInfo();
      toast('המשימה עודכנה'); return;
    }
    if(time && MC_ADD_DAY!=null && !(MC_WOFF===0&&MC_ADD_DAY===MC_TODAY)){
      (MC_WOFF===0?MC_WEEK:MC_WEEK_NEXT).push({d:MC_ADD_DAY, time, kind:'task', title:t, ...extra});
      toast('נוסף ליום '+MC_DAYS[MC_ADD_DAY]+' ב-'+time);
    }else if(time){
      MGR_AGENDA.push({time, dur:'30 דק׳', kind:'task', title:t, sub:client?('משימת לקוח · '+client):'משימה שלי', done:false, ...extra});
      toast('המשימה נוספה ליומן'+(client?' — '+client:''));
    }else if(window._mtkTarget==='adv'){
      ADV_TODO.push({t:t+(client?' · '+client:''), done:false, manual:true});
      window._mtkTarget=null;
      toast('נוספה למשימות שלך'+(client?' — '+client:''));
      mtkClose(); if(typeof renderAlerts==='function')renderAlerts(); return;
    }else{
      MGR_TODO.push({t, done:false, ...extra});
      toast('נוספה למשימות הפתוחות'+(client?' — '+client:''));
    }
    if(owner) toast('המשימה נפתחה ל'+owner+' — תופיע אצלו ביומן');
    if(remind&&client) toast('תיקבע תזכורת ללקוח בוואטסאפ');
    MC_ADD_DAY=null;
    mtkClose();
    renderMgrCal();
  }


  /* פאנל "המשימות שלי" — חי בתוך כרטיס היומן */
  function mgrTodoPanel(){
    const todo=MGR_TODO.map((x,i)=>({x,i,src:'my'}));
    // משימה עם שם לקוח = משימת לקוח; משימות שהלקוח פתח מצטרפות לאותה רשימה
    const fromClients=(typeof CLIENT_TASKS!=='undefined'?CLIENT_TASKS:[]).map((x,i)=>({x:{t:x.t,client:'אנרגי אינטרנשיונל',fromClient:true},i,src:'cli'}));
    const tToday=[...todo.filter(o=>!o.x.due||o.x.due==='היום'),...fromClients];
    const tFut=todo.filter(o=>o.x.due&&o.x.due!=='היום');
    const isDn=o=>o.src==='cli'?CLIENT_TASKS[o.i].st==='done':!!o.x.done;
    const opnT=tToday.filter(o=>!isDn(o)).length, opnF=tFut.filter(o=>!isDn(o)).length;
    const trow=o=>{
      const cli=o.x.client, dn=isDn(o);
      const chk=o.src==='cli'?`onchange="ctDone(${o.i})"`:`onchange="mcTodoToggle(${o.i})"`;
      const drag=(o.src==='my'&&!dn)?`draggable="true" ondragstart="mcDragStart(event,${o.i})" ondragend="mcDragEnd()" title="גררו למעלה/למטה כדי לשנות סדר"`:'';
      const rdrop=o.src==='my'?`ondragover="mcRowOver(event,this)" ondragleave="this.classList.remove('ins-top','ins-bottom')" ondrop="this.classList.remove('ins-top','ins-bottom');mcReorderDrop(event,this,${o.i})"`:'';
      const meta=[];
      if(cli)meta.push('<b class="m-cli">'+o.x.client+'</b>');
      if(o.x.owner)meta.push(o.x.owner);
      if(o.x.due&&o.x.due!=='היום')meta.push(o.x.due);
      if(o.x.repTxt)meta.push(o.x.repTxt);
      return `<div class="mc-todo-row two ${dn?'isdone':''}" ${drag} ${rdrop}>
        <label class="mc-chk"><input type="checkbox" ${dn?'checked':''} ${chk}><span></span></label>
        <div class="mc-todo-b">
          <div class="mc-todo-t full">${o.x.t}${o.x.rep&&o.x.rep!=='once'?' <i class="mc-rep" title="משימה חוזרת">↻</i>':''}</div>
          ${meta.length?`<div class="mc-meta">${meta.join(' · ')}</div>`:''}
        </div>
        ${o.src==='my'&&!dn?`<span class="mc-tools"><button class="mc-edit" onclick="mtkEditOpen(${o.i})" title="עריכת המשימה"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button><span class="mc-grip"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg></span></span>`:''}
      </div>`;};
    return `<div class="mcal-side-h">המשימות שלי <span>${opnT} להיום</span></div>
      <div class="mcal-side-hint">גררו משימה למעלה או למטה כדי לשנות את הסדר</div>
      ${tToday.length?tToday.map(trow).join(''):'<div class="advh-ok" style="padding:12px 16px">✓ אין משימות להיום</div>'}
      ${tFut.length?`<div class="mc-fut-toggle" onclick="window._mtFutOpen=!window._mtFutOpen;renderMgrCal()">${window._mtFutOpen?'▾':'◂'} עתידיות (${opnF})</div>`:''}
      ${window._mtFutOpen?tFut.map(trow).join(''):''}`;
  }
  let MTK_EDIT=null;
  function mtkEditOpen(i){
    const x=MGR_TODO[i];
    mcQuick('');
    MTK_EDIT=i;
    document.getElementById('mtkTitle').value=x.t;
    document.getElementById('mtkTime').value='';
    document.getElementById('mtkClient').value=x.client||'';
    if(typeof mtkClientChange==='function')mtkClientChange();
    const os=document.getElementById('mtkOwner'); if(os)os.value=x.owner||'';
    document.getElementById('mtkDetail').value=x.detail||'';
    document.getElementById('mtkRemind').checked=!!x.remind;
    if(typeof mtkRepSet==='function')mtkRepSet(x.rep||'once');
    document.querySelector('#mtkOv .mx2-title').textContent='עריכת משימה';
    const db=document.getElementById('mtkDelBtn'); if(db)db.style.display='';
    const sb=document.querySelector('#mtkOv .mx2-btn.primary'); if(sb)sb.textContent='שמירה';
  }
  function mtkDelete(){
    if(MTK_EDIT==null) return;
    const i=MTK_EDIT, x=MGR_TODO[i];
    MGR_TODO.splice(i,1);
    const ei=MGR_AGENDA.findIndex(a=>a.todoRef===x); if(ei>=0)MGR_AGENDA.splice(ei,1);
    MTK_EDIT=null; mtkClose(); renderMgrCal();
    if(typeof renderOpsInfo==='function')renderOpsInfo();
    toastUndo('המשימה נמחקה',()=>{MGR_TODO.splice(i,0,x);renderMgrCal();if(typeof renderOpsInfo==='function')renderOpsInfo();});
  }
  /* סידור ידני — גרירת משימה מעל משימה אחרת ברשימה */
  function mcRowOver(e,el){
    if(MC_DRAG<0)return;
    e.preventDefault();
    const r=el.getBoundingClientRect(), after=(e.clientY-r.top)>r.height/2;
    el.classList.toggle('ins-top',!after);
    el.classList.toggle('ins-bottom',after);
  }
  function mcReorderDrop(e,el,j){
    e.preventDefault(); e.stopPropagation();
    const i=MC_DRAG; MC_DRAG=-1;
    if(i<0||i===j) return;
    const r=el.getBoundingClientRect(), after=(e.clientY-r.top)>r.height/2;
    const x=MGR_TODO.splice(i,1)[0];
    let k=j+(after?1:0); if(i<k)k--;
    MGR_TODO.splice(k,0,x);
    renderMgrCal();
    if(typeof renderOpsInfo==='function')renderOpsInfo();
  }
  /* שורת מידע שנייה: התראות מערכת · סטטוס תפעול */
  function renderOpsInfo(){
    const el=document.getElementById('opsqInfo'); if(!el) return;
    // רק התראות תפעוליות: חיבורי בנק/אשראי/סליקה וחובות אלינו — לא מדדי לקוח
    const al=[];
    CLIENTS.forEach((c,i)=>{
      if(!firmOk(c)) return;
      if(c.bankDown) al.push({i, sev:'high', t:c.name+' — חשבונות בנק לא מעודכנים'});
      if(c.ccDown)   al.push({i, sev:'high', t:c.name+' — כ.אשראי לא מעודכן'});
      if(c.clearDown)al.push({i, sev:'mid',  t:c.name+' — חשבון סליקה לא מחובר'});
      if(c.debt)     al.push({i, sev:'mid',  t:c.name+' — חוב אלינו '+c.debt.toLocaleString()+' ₪'});
    });
    al.sort((a,b)=>(a.sev==='high'?0:1)-(b.sev==='high'?0:1));
    const hi=al.filter(a=>a.sev==='high').length;
    const CAPA=3, aopen=window._oiAlOpen||false, shownA=aopen?al:al.slice(0,CAPA);
    const c2=`<div class="coal ${hi?'hot':''} ${aopen?'open':''} oi-coal">
      <span class="coal-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>
      <span class="coal-t">${al.length} התראות${hi?' · '+hi+' דחופות':''}</span>
      ${shownA.map(a=>`<span class="coal-chip ${a.sev}" title="${a.t}" onclick="selectClient(${a.i})">${a.t}</span>`).join('')}
      ${al.length>CAPA?`<button class="coal-more" onclick="window._oiAlOpen=${!aopen};renderOpsInfo()">${aopen?'פחות ▴':'+ עוד '+(al.length-CAPA)}</button>`:''}
    </div>`;
    const list=CLIENTS.map((c,i)=>({c,i})).filter(o=>firmOk(o.c));
    const doneCnt=list.filter(o=>opsDoneSet.has('c'+o.i)).length;
    const pctAll=list.length?Math.round(doneCnt/list.length*100):0;
    const rows=list.map(o=>{const st=opsStatusOf(o.i);
      const tot=(o.c.tasks||[]).length, dn=(o.c.tasks||[]).filter(t=>t.done).length;
      const pct=opsDoneSet.has('c'+o.i)?100:(tot?Math.round(dn/tot*100):0);
      return `<div class="oqs-row" onclick="selectClient(${o.i})">
        <div class="oi-rb"><b>${o.c.name}</b><div class="gn-qbar"><i class="${st.cls}" style="width:${pct}%"></i></div></div>
        <span class="oi-st ${st.cls}">${st.txt}</span></div>`;}).join('');
    const c3=`<div class="advl oi"><div class="advl-head"><span class="advl-title">סטטוס תפעול</span><span class="advl-sub">${doneCnt} מתוך ${list.length} תופעלו</span></div>
      <div class="oi-prog"><div class="oi-track"><i style="width:${pctAll}%"></i></div><span>${list.length-doneCnt} נותרו לתפעול היום</span></div>
      ${rows}</div>`;
    const msgCos=list.filter(o=>o.c.unread>0);
    const withPend=msgCos.map(o=>({...o, pf:msgPendOf(o.c,o.i)})).filter(o=>o.pf.length);
    const totMsg=withPend.reduce((t,o)=>t+o.pf.length,0);
    const c1=`<div class="advl oi msgs"><div class="advl-head"><span class="advl-title">הודעות לקוח</span><span class="advl-sub">${totMsg} שלא נענו · מ-${withPend.length} חברות</span></div>
      <div class="oi-chats">${withPend.map(o=>{const c=o.c,i=o.i;
        // לכל הודעה תיבת תגובה + כפתור טופל משלה
        const bubs=o.pf.map(p=>`<div class="oqs-msgblock">
            <div class="oqs-bub"><div class="oqs-bub-h">${p.m.name} · ${p.m.when}</div>${p.m.t}</div>
            <div class="oqs-reply per"><input placeholder="תגובה…" onkeydown="if(event.key==='Enter')qReplyMsg(this,${i},${p.gi})"><button class="oqs-send sm" onclick="qReplyMsg(this.previousElementSibling,${i},${p.gi})">שליחה</button><button class="oqs-done" onclick="msgDone(${i},${p.gi})" title="סימון כטופל בלי תגובה">✓ טופל</button></div>
          </div>`).join('');
        return `<div class="oqs-chat">
          <div class="oqs-chat-h"><b class="oqs-name" onclick="chatFrom(${i})" title="פתיחת השיחה המלאה">${c.name}</b><span>${o.pf.length} שלא נענו</span></div>
          ${bubs}
        </div>`;}).join('')}</div>
      ${withPend.length?'':'<div class="oqs-empty">אין הודעות פתוחות ✓</div>'}
    </div>`;
    el.innerHTML=c2;
    /* רדאר נטישה — אותות שיתוף פעולה מהתפעול והזיכרון */
    const MGR_RADAR=[
      {ci:3, c:'משה עובד',    why:'לא הביא חומר לתזרים 21 יום · הפגישה האחרונה לא התקיימה', act:'תזכורת חומרים + עדכון היועץ'},
      {ci:1, c:'אנרגי גולני', why:'ירידה בקצב המענה בצ׳אט — 5 ימים ללא תגובה',              act:'שיחת טלפון קצרה מהמתפעל'},
    ];
    const cRad=`<div class="advl oi radm"><div class="advl-head"><span class="advl-title">רדאר נטישה</span><span class="advl-sub">אותות שיתוף פעולה — לפני שזה הופך ללקוח שעוזב</span></div>
      ${MGR_RADAR.map(r=>`<div class="mf-row">
        <span class="rad-tag churn">סיכון נטישה</span>
        <div class="mf-b"><div class="mf-l"><b>${r.c}</b> — ${r.why}</div><div class="mf-meta">מומלץ: ${r.act}</div></div>
        <button class="mt-btn view sm" onclick="selectClient(${r.ci})">פתיחה</button>
        <button class="mt-btn sm" onclick="toast('היועץ עודכן — ${r.c}')">עדכון היועץ</button>
      </div>`).join('')}</div>`;
    const mEl=document.getElementById('msgCol'); if(mEl) mEl.innerHTML=cRad+c1;
  }
