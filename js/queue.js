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
  function opsqMatch(i){
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
        <div class="oqc">${alert}</div>
        <div class="oqc">${debt}</div>
        <div class="oqc">${msg}</div>
        <div class="oqc"><span class="oq-status ${st.cls}"><span class="dot"></span>${st.txt}</span></div>
        <div class="oqc oqc-act"><button class="oq-btn ${st.ghost?'ghost':''}" onclick="event.stopPropagation();opsQueueEnter(${i})">${st.btn}</button></div>
      </div>`;
  }
  function renderOpsQueue(){
    let waiting=0,prog=0,done=0,total=0;
    CLIENTS.forEach((c,i)=>{const k='c'+i,p=pendOf(i);total+=p;
      if(opsDoneSet.has(k))done++; else if(opsAccum[k])prog++; else if(p>0)waiting++;});
    document.getElementById('opsqStrip').innerHTML=
      `<div class="opsq-stat warn"><div class="n">${waiting}</div><div class="l">חברות ממתינות</div></div>`+
      `<div class="opsq-stat"><div class="n">${prog}</div><div class="l">בתהליך תפעול</div></div>`+
      `<div class="opsq-stat"><div class="n">${done}</div><div class="l">הושלמו היום</div></div>`+
      `<div class="opsq-stat"><div class="n">${total}</div><div class="l">משימות ממתינות</div></div>`+
      `<div class="opsq-stat accent"><div class="n">${fmtDur(totalOpsTime())}</div><div class="l">זמן תפעול כולל</div></div>`;
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
    const order=CLIENTS.map((c,i)=>i).filter(opsqMatch).sort((a,b)=>opsqRank(a)-opsqRank(b));
    const listEl=document.getElementById('opsqList');
    const HDR='<div class="oqhead"><div>חברה</div><div>מוצר</div><div>חריגה</div><div>חוב</div><div>הודעות</div><div>תפעול</div><div></div></div>';
    listEl.innerHTML = order.length ? HDR+order.map(opsqRow).join('') : '<div class="ops-empty" style="padding:40px">אין חברות בסינון הזה</div>';
  }
  function opsqFilter(k){OPSQ_FILTER=k;renderOpsQueue();}

