/* HK Dashboard — metric alert engine, alerts focus (advisor/HK), health map */
  /* ===== מוקד התראות — reads each metric's own alert rule (defined in METRICS) ===== */
  const mVal=(c,key)=> key==='debt' ? (c.debt||0) : (c.metrics||{})[key];
  function evalMetric(m,c){
    const v=mVal(c,m.key); if(v==null) return null;
    const r=m.alert; if(!r||!r.on) return null;
    if(m.key==='budget'){ if(v>r.th) return {sev:'high',v}; if(v>=(r.near||r.th)) return {sev:'mid',v}; return null; }
    if(r.cmp==='withinDays') return (v>0 && v<=r.th) ? {sev:'high',v} : null;
    if(r.cmp==='over')       return (v>r.th)          ? {sev:'mid', v} : null;
    if(r.cmp==='belowPct')   return (v<r.th)          ? {sev:'mid', v} : null;
    return null;
  }
  function alertText(m,c,v){
    const n=c.name;
    switch(m.key){
      case 'budget': return v>100
        ? {ic:'⚠️',t:n+' — חריגת תקציב תוביל לחריגת מסגרת',d:'ההוצאות חרגו ב-'+(v-100)+'% מהתקציב. היתרה צפויה לרדת מתחת למסגרת האשראי.',meta:'צפי חריגה בעוד 6 ימים'}
        : {ic:'📉',t:n+' — קרוב לתקרת התקציב ('+v+'%)',d:'תשלום ספק מתוכנן צפוי להעלות את הביצוע מעל 100% מהתקציב.',meta:'לבדיקה השבוע'};
      case 'overdraft': return {ic:'🏦',t:n+' — חריגה צפויה בעו״ש',d:'התזרים הצפוי מצביע על חריגה ממסגרת האשראי בקרוב.',meta:'בעוד '+v+' ימים'};
      case 'debt': return {ic:'💰',t:n+' — חוב פתוח לגבייה',d:'חוב של '+(c.debt).toLocaleString('en-US')+' ₪ בפיגור — משפיע ישירות על התזרים.',meta:'בפיגור'};
      case 'liters': return {ic:'⛽',t:n+' — סך הליטרים מתחת ליעד ('+v+'%)',d:'המדד מתחת ליעד החודשי — מחליש את ההכנסות והתזרים הצפוי.',meta:'מדד חודשי'};
      case 'cfprofit': return {ic:'📈',t:n+' — רווח תזרימי מתחת ליעד ('+v+'%)',d:'שחיקת רווחיות מעמיקה את הלחץ התזרימי.',meta:'מדד חודשי'};
      default: return {ic:'🔔',t:n+' — '+m.name,d:'המדד חרג מהיעד שהוגדר.',meta:'מדד'};
    }
  }
  function buildAlerts(){
    const RANK={high:0,mid:1,low:2}, out=[];
    CLIENTS.forEach((c,i)=>METRICS.forEach(m=>{
      const r=evalMetric(m,c); if(!r) return;
      out.push({sev:r.sev, i, mkey:m.key, metric:m.name, ...alertText(m,c,r.v)});
    }));
    return out.sort((a,b)=>RANK[a.sev]-RANK[b.sev]);
  }
  function renderAlerts(){
    const alerts=buildAlerts();
    document.getElementById('alNote').textContent=alerts.length+' התראות · '+CLIENTS.length+' חברות במעקב';
    // portfolio health map — per-company card: budget bar + worst severity + alert count
    document.getElementById('alHealth').innerHTML=CLIENTS.map((c,i)=>{
      const mine=alerts.filter(a=>a.i===i);
      const sev=mine.some(a=>a.sev==='high')?'high':(mine.length?'mid':'ok');
      const pct=c.budgetPct||0;
      const barCls=pct>100?'over':(pct>=95?'near':'ok');
      const w=Math.min(pct/120*100,100);
      return `<div class="hcard ${sev}" onclick="alertOpen(${i})" title="פתיחת ${c.name}">
        <div class="hc-top"><span class="hc-name">${c.name}</span>${(isOperator&&c.product)?prodLogo(c.product,'sm'):''}</div>
        <div class="hc-bar"><div class="fill ${barCls}" style="width:${w}%"></div><div class="mk"></div></div>
        <div class="hc-foot"><span>${pct}% מהתקציב</span><span class="hc-al ${sev}">${mine.length?mine.length+' התראות':'✓ תקין'}</span></div>
      </div>`;
    }).join('');
    const board=document.getElementById('alBoard');
    // grouped into uniform widget cards by domain (same visual language as the widgets board)
    const THEMES=[
      {cls:'coral',title:'תקציב ומסגרת אשראי',keys:['budget','overdraft'],ic:'<path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/>'},
      {cls:'amber',title:'גבייה וחובות',keys:['debt'],ic:'<path d="M3 7h18v12H3zM3 11h18"/><path d="M7 15h4"/>'},
      {cls:'blue', title:'מדדים עסקיים',keys:['liters','cfprofit'],ic:'<path d="M3 15l5-5 4 3 6-7"/><path d="M3 20h18"/>'},
    ];
    let html=alerts.length?THEMES.map(th=>{
      const rows=alerts.filter(a=>th.keys.includes(a.mkey));
      if(!rows.length) return '';
      return `<div class="awdg awdg--${th.cls}">
        <div class="awdg-head"><div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${th.ic}</svg></div><div class="awdg-t">${th.title}</div><span class="awdg-n">${rows.length}</span></div>
        <div class="awdg-body">${rows.map(afeedRow).join('')}</div>
      </div>`;
    }).join('') : '<div class="al-empty">✅ אין התראות פתוחות — כל המדדים בתוך היעד</div>';
    // advisor: upcoming meetings widget completes the board
    if(ROLE==='advisor'){
      const up=MEETINGS.map((m,ix)=>({m,ix})).filter(x=>x.m.status==='upcoming'||x.m.status==='summary').slice(0,4);
      if(up.length) html+=`<div class="awdg awdg--navy">
        <div class="awdg-head"><div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div><div class="awdg-t">פגישות קרובות</div><span class="awdg-n">${up.length}</span></div>
        <div class="awdg-body">${up.map(({m,ix})=>`
          <div class="ameet">
            <div class="am-when"><b>${m.date.slice(0,5)}</b><span>${m.time.split('-')[0]}</span></div>
            <div class="am-b"><div class="am-n">${m.name}</div><div class="am-c">${m.client} · ${m.adv}</div></div>
            <button class="mt-btn view" onclick="openMeeting(${ix})">${m.status==='summary'?'אישור סיכום':'פרטים'}</button>
          </div>`).join('')}</div>
      </div>`;
    }
    board.innerHTML=html;
  }
  const SEV_LBL={high:'דחוף',mid:'לבדיקה',low:'מידע'};
  function afeedRow(a){
    return `<div class="afeed ${a.sev}">
      <div class="afeed-ic">${a.ic}</div>
      <div class="afeed-b">
        <div class="afeed-t">${a.t} <span class="afeed-sev ${a.sev}">${SEV_LBL[a.sev]}</span><span class="afeed-metric">${a.metric}</span>${(isOperator&&CLIENTS[a.i].product)?prodLogo(CLIENTS[a.i].product,'sm'):''}</div>
        <div class="afeed-d">${a.d}</div>
        <div class="afeed-m"><span class="afeed-meta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2.5"/></svg>${a.meta}</span><button class="afeed-act" onclick="alertOpen(${a.i})">פתח חברה ←</button></div>
      </div>
    </div>`;
  }
  function alertOpen(i){selectClient(i);}
  // alerts are defined ON each metric — jump to the metric editor to change them
  function goToMetrics(){
    selectClient(typeof CUR==='number'?CUR:0);
    const t=[...document.querySelectorAll('.tab')].find(x=>x.textContent.trim()==='מדדים');
    if(t) switchTab(t,'metrics');
  }

