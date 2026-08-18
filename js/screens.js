/* HK Dashboard — scope routing, chat drawer, toast, tabs, metrics+alert rules editor, AI chat, reports */
  function setScope(s){
    if(OPSMODE) exitOps();
    SCOPE=s;
    const hp=document.getElementById('headHp'), st=document.querySelector('.client-head .st');
    const acts=document.querySelector('.db-actions'), kpi=document.getElementById('kpiHero');
    const sub=document.querySelector('.sub-line');
    if(s==='portfolio'){
      document.getElementById('curName').textContent='כל החברות';
      document.getElementById('curHp').textContent='תיק לקוחות';
      document.getElementById('headName').textContent='כל החברות';
      hp.style.display='none'; st.style.display='none'; acts.style.display='none';
      if(kpi)kpi.style.display='none';
      sub.textContent='תיק לקוחות · '+CLIENTS.filter(c=>typeof coActive!=='function'||coActive(c)).length+' חברות · נכון ל-2.7.2026';
    }else{
      hp.style.display=''; st.style.display=''; acts.style.display='flex'; acts.style.visibility='visible';
      if(st&&typeof coState==='function'){                       /* התג משקף את המצב האמיתי */
        const k=coState(CLIENTS[CUR]);
        st.className='st '+(k==='active'?'active':k==='setup'?'setup':'arch');
        st.textContent=k==='active'?'פעיל':k==='setup'?'בהקמה':'ארכיון';
      }
      if(kpi)kpi.style.display='';
      sub.textContent='חברת ייעוץ · '+CLIENTS[CUR].mgr+' · סונכרן אוטומטית 2.7.2026 10:54';
    }
    // force dashboard tab
    CUR_TAB='dash';
    document.querySelector('.sub-line').style.display='';
    document.querySelector('.client-head').style.display='flex';   // חזרה מיעד גלובלי
    const tabs=document.querySelectorAll('.tab');
    tabs.forEach(x=>x.classList.remove('on')); tabs[0].classList.add('on');
    OPSMODE=false; document.body.classList.remove('ops-on');
    document.getElementById('opsView').style.display='none';
    ['viewDash','viewMetrics','viewChat','viewMeetings','viewCal','viewFcast','viewPast','viewBudget','viewCoSet','viewPrep','viewEntries','viewMsgs','viewFlowLog','viewFlow','viewSettings','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    document.getElementById('viewDash').style.display='';
    document.querySelector('.tabs').style.display='none';   // הסקציות חיות בסרגל — אין טאבים אופקיים
    // ניווט דו-רמתי: הסרגל גלובלי וקבוע; הסקציות של חברה הן טאבים בתוך עמוד הלקוח
    GNAV = (s==='client') ? 'client'
         : isOperator ? (MGR_VIEW==='meets'?'meets':'ops')
         : ROLE==='advisor' ? (ADV_PVIEW==='clients'?'clients':ADV_PVIEW==='meets'?'meets':'today')
         : 'home';
    renderGlobalRail();
    renderCrumb();
    // portfolio sub-view routing by persona:
    //  manager (HK) → תור תפעול / מוקד התראות (toggle)   advisor → מוקד התראות   clientN → מבט מאוחד
    const inPortfolio=(s==='portfolio');
    let pView='board';
    if(inPortfolio){
      if(isOperator) pView=(MGR_VIEW==='meets')?'meets':'queue';   // הבית של המנהל הוא התפעול; זירת פגישות בבחירה
      else if(ROLE==='clientN') pView='board';
      else pView=(ADV_PVIEW==='clients')?'clients':(ADV_PVIEW==='meets')?'meets':'alerts';
    }
    const showQueue=inPortfolio && pView==='queue';
    const showAlerts=inPortfolio && pView==='alerts';
    const showMeets=inPortfolio && pView==='meets';
    const showClients=inPortfolio && pView==='clients';
    const showBoard = !inPortfolio || pView==='board';
    document.getElementById('clientsView').style.display=showClients?'':'none';
    document.getElementById('mgrToggle').style.display='none';   // אין יותר טאבים במסך המנהל
    // מסך המנהל מתחיל ישר בקוביות — בלי כותרת ושורת משנה
    const slim=(inPortfolio&&isOperator);
    if(slim){
      document.querySelector('.client-head').style.display='none';
      document.querySelector('.sub-line').style.display='none';
    }
    document.getElementById('opsQueueView').style.display=showQueue?'':'none';
    document.getElementById('alertsView').style.display=showAlerts?'':'none';
    document.getElementById('meetsView').style.display=showMeets?'':'none';
    document.getElementById('wboard').style.display=showBoard?'':'none';
    // שורת ה-KPI העליונה שייכת למסך חברה — מוסתרת בכל תצוגת פורטפוליו אחרת
    const _wt=document.getElementById('wboardTop'); if(_wt&&!showBoard) _wt.style.display='none';
    // ללקוחות אין עריכת לוח — HK מגדירה את הלוח עבורם
    const canEdit=!(ROLE==='client1'||ROLE==='clientN');
    document.getElementById('wbActions').style.display=(showBoard&&canEdit)?'flex':'none';
    document.getElementById('crBar').style.display=(inPortfolio && pView==='board')?'':'none';
    document.getElementById('opsqStatus').style.display=showQueue?'flex':'none';
    if(inPortfolio){
      document.querySelector('.sub-line').textContent=
        (pView==='queue'?'מבט-על תפעולי':pView==='clients'?'תיק הלקוחות שלך':pView==='meets'?'זירת הפגישות · כל אינטראקציה מוקלטת הופכת לזיכרון':pView==='alerts'?(ROLE==='advisor'?'הבוקר שלך · מה היום, איפה בוער ומה המצב':'מוקד התראות · חברות שדורשות טיפול'):'מבט מאוחד')
        +' · '+CLIENTS.filter(c=>typeof coActive!=='function'||coActive(c)).length+' חברות במעקב · נכון ל-2.7.2026';
    }
    updateOpsBtn();
    renderMeetBtn();
    if(showQueue) renderOpsQueue(); else if(showAlerts) renderAlerts(); else if(showMeets){if(typeof renderMeetsArena==='function')renderMeetsArena();} else if(showClients) renderClientsView(); else renderBoard();
    renderCoAlerts();
    if(typeof renderCoBar==='function')renderCoBar();
    renderClientRow();
    // כדור ה-AI — ללקוחות בלבד, ורק כשנבחרה חברה ספציפית (הצ'אט הוא פר-חברה)
    const aiOn=(ROLE==='client1'||ROLE==='clientN')&&SCOPE==='client';
    const orb=document.getElementById('aiOrb');
    if(orb) orb.style.display=aiOn?'flex':'none';
    if(!aiOn){const p=document.getElementById('aiPanel');if(p)p.classList.remove('show');}
  }
  function selectPortfolio(){setScope('portfolio');}
  let MGR_VIEW='ops';
  function setMgrView(v){MGR_VIEW=v;setScope('portfolio');}

  /* ---- chat drawer ---- */
  function openChat(){
    // הדראואר הישן הוחלף במסך ההודעות — מפנים לשם
    if(typeof renderMsgsView==='function'&&SCOPE==='client'){ showTab('msgs'); return; }
    const c=CLIENTS[CUR];
    document.getElementById('dAv').textContent=c.name.charAt(0);
    document.getElementById('dName').textContent=c.name;
    document.getElementById('dStatus').textContent=(c.status==='active'?'פעיל':'לא פעיל')+' · '+c.mgr;
    const thread=c.thread||[];
    window._thread=thread.slice();
    const users=[...new Set(thread.filter(m=>m.from==='user').map(m=>m.name))];
    document.getElementById('dUser').innerHTML='<option value="">כל המשתמשים</option>'+users.map(u=>`<option>${u}</option>`).join('');
    renderBubbles();
    document.getElementById('drawerOv').classList.add('show');
    document.getElementById('drawer').classList.add('show');
  }
  function closeChat(){document.getElementById('drawerOv').classList.remove('show');document.getElementById('drawer').classList.remove('show');}
  function initials(n){return (n||'').split(' ').map(w=>w[0]).slice(0,2).join('');}
  function renderBubbles(){
    const f=document.getElementById('dUser').value;
    const body=document.getElementById('dBody');
    const list=(window._thread||[]).filter(m=>!f||m.from==='hk'||m.name===f);
    if(!list.length){
      body.innerHTML=`<div class="d-empty">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5a8.4 8.4 0 1 1 16.1-4z"/></svg>
        אין הודעות פתוחות מהלקוח הזה</div>`;
      return;
    }
    body.innerHTML=list.map(m=>{
      const av=`<div class="av ${m.from}">${m.from==='hk'?'HK':initials(m.name)}</div>`;
      const sender=`<div class="sender">${m.name}${m.auto?'<span class="auto">אוטומטי</span>':''}</div>`;
      const bubble=`<div class="b ${m.from}">${sender}<div class="txt">${m.t}</div><div class="when">${m.when}</div></div>`;
      return `<div class="msg ${m.from}">${av}${bubble}</div>`;
    }).join('');
    body.scrollTop=body.scrollHeight;
  }
  function drawerSend(){
    const inp=document.getElementById('dInput');const v=inp.value.trim();if(!v)return;
    window._thread.push({from:'hk',name:'שמרית טובול',auto:false,t:v,when:'עכשיו'});
    inp.value='';renderBubbles();toast('נשלחה הודעה ללקוח בוואטסאפ');
  }
  function toast(m){const t=document.getElementById('toast');t.textContent='✓ '+m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}

  /* ---- section tabs / rail nav ---- */
  const TAB_LABELS={dash:'דשבורד',chat:'עוזר AI',metrics:'מדדים',meetings:'פגישות',cal:'יומן',prep:'הכנה לפגישה',flow:'התהליך שלי',fcast:'תזרים עתידי',past:'תזרים עבר',budget:'מעקב ופערים',entries:'תשלומי ספקים ולקוחות',msgs:'הודעות',flowlog:'מה השתנה בתזרים',coset:'הגדרות חברה'};
  let CUR_TAB='dash';
  function showTab(t){
    CUR_TAB=t;
    document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
    ['viewDash','viewMetrics','viewChat','viewMeetings','viewCal','viewFcast','viewPast','viewBudget','viewCoSet','viewPrep','viewEntries','viewMsgs','viewFlowLog','viewFlow','viewSettings','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    const isGlobal=(t==='cal'||t==='settings');   // יעדים גלובליים — לא טאב של חברה
    if(t==='dash'){document.getElementById('viewDash').style.display='';}
    else if(t==='metrics'){document.getElementById('viewMetrics').style.display='';renderMetrics();}
    else if(t==='chat'){document.getElementById('viewChat').style.display='';renderChat();}
    else if(t==='meetings'){
      document.getElementById('viewMeetings').style.display='';
      const mf=document.getElementById('meetFrame');
      if(mf&&!mf.src) mf.src=mf.dataset.src;      // מסך הפגישות המעוצב — קובץ עצמאי
      renderMeetings();                            // הרשימה הישנה נשארת מוסתרת (בשימוש openMeeting)
    }
    else if(t==='cal'){
      document.getElementById('viewCal').style.display='';
      const f=document.getElementById('calFrame');
      if(!f.src) f.src=f.dataset.src;   // טעינה עצלה — היומן נטען רק בכניסה הראשונה
    }
    else if(t==='coset'){
      document.getElementById('viewCoSet').style.display='';
      if(typeof renderCoSet==='function')renderCoSet();
    }
    else if(t==='flow'){
      document.getElementById('viewFlow').style.display='';
      if(typeof renderFlowView==='function')renderFlowView();
    }
    else if(t==='prep'){
      document.getElementById('viewPrep').style.display='';
      if(typeof renderPrepView==='function')renderPrepView();
    }
    else if(t==='flowlog'){
      document.getElementById('viewFlowLog').style.display='';
      const ff=document.getElementById('flowLogFrame');
      if(ff&&!ff.src) ff.src=ff.dataset.src;
    }
    else if(t==='entries'){
      document.getElementById('viewEntries').style.display='';
      if(typeof renderEntriesView==='function')renderEntriesView();
    }
    else if(t==='msgs'){
      document.getElementById('viewMsgs').style.display='';
      if(typeof renderMsgsView==='function')renderMsgsView();
    }
    else if(t==='budget'){
      document.getElementById('viewBudget').style.display='';
      const bf=document.getElementById('budgetFrame');
      if(!bf.src) bf.src=bf.dataset.src;
    }
    else if(t==='past'){
      document.getElementById('viewPast').style.display='';
      const pf=document.getElementById('pastFrame');
      if(!pf.src) pf.src=pf.dataset.src;
    }
    else if(t==='fcast'){
      document.getElementById('viewFcast').style.display='';
      const ff=document.getElementById('fcastFrame');
      if(!ff.src) ff.src=ff.dataset.src;   // טעינה עצלה כמו היומן
    }
    else if(t==='settings'){document.getElementById('viewSettings').style.display='';renderSettings();}
    else{document.getElementById('viewOther').style.display='';document.getElementById('otherName').textContent=TAB_LABELS[t]||t;}
    document.querySelector('.db-actions').style.visibility = t==='dash' ? 'visible' : 'hidden';
    document.getElementById('wbActions').style.display = (t==='dash'&&ROLE!=='client1'&&ROLE!=='clientN') ? 'flex' : 'none';
    // שורת "סונכרן אוטומטית…" — שייכת לנתוני הדשבורד, לא עוקבת לשאר הסקציות
    document.querySelector('.sub-line').style.display = t==='dash' ? '' : 'none';
    // יעד גלובלי: בלי כותרת חברה ופירור — זה לא עמוד של חברה
    document.querySelector('.client-head').style.display = isGlobal ? 'none' : 'flex';
    if(isGlobal){GNAV=t;const c=document.getElementById('crumb');if(c)c.style.display='none';}
    else if(SCOPE==='client'){GNAV='client';renderCrumb();}
    renderGlobalRail();
  }
  function switchTab(el,t){showTab(t);}   // תאימות ל-onclick הקיימים

  /* כפתור "התחל פגישה" בראש דשבורד החברה — ליועץ; אם יש פגישה היום שממתינה להקלטה, הכפתור מכוון אליה */
  function renderMeetBtn(){
    const b=document.getElementById('btnMeet'); if(!b) return;
    const show=(typeof ROLE!=='undefined'&&ROLE==='advisor'&&SCOPE==='client');
    b.style.display=show?'inline-flex':'none';
    if(!show) return;
    const c=CLIENTS[CUR];
    const today=(typeof MEETINGS!=='undefined')&&MEETINGS.find(m=>m.client===c.name&&m.date==='02.07.2026'&&m.status==='upcoming');
    b.innerHTML='<span class="mrec-dot"></span> '+(today?'הקלטת הפגישה · '+today.time.split('-')[0]:'התחל פגישה');
    b.onclick=()=>startMeetRec(c.name);
  }

  /* ===== ניווט גלובלי — רמה 1: הסרגל קבוע וזהה בכל מסך ===== */
  let GNAV='today';        // today | clients | ops | client | cal | settings | home
  let ADV_PVIEW='home';    // תת-תצוגה של היועץ במבט-על: home (היום) | clients
  const GNAV_ICO={
    today:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
    ops:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/><circle cx="12" cy="12" r="3"/></svg>',
    clients:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    home:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/></svg>',
    cal:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    meets:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8"/></svg>',
    settings:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'};
  function gnavItems(){
    if(typeof ROLE==='undefined'||ROLE==='advisor') return [
      {k:'today',   l:'היום',    go:"gnavGo('today')"},
      {k:'cal',     l:'יומן',    go:"gnavGo('cal')"},
      {k:'meets',   l:'פגישות',  go:"gnavGo('meets')"},
      {k:'clients', l:'לקוחות',  go:"gnavGo('clients')"},
      {k:'settings',l:'הגדרות',  go:"gnavGo('settings')"}];
    if(ROLE==='manager') return [
      {k:'ops',     l:'לקוחות',  go:"gnavGo('ops')"},
      {k:'cal',     l:'יומן',    go:"gnavGo('cal')"},
      {k:'meets',   l:'פגישות ושיחות', go:"gnavGo('meets')"},
      {k:'settings',l:'הגדרות',  go:"gnavGo('settings')"}];
    if(ROLE==='clientN') return [
      {k:'home',    l:'הבית',    go:"gnavGo('home')"}];
    return [{k:'home', l:'הבית', go:"gnavGo('home')"}];   // client1
  }
  function gnavGo(k){
    if(k==='today'){ADV_PVIEW='home';selectPortfolio();return;}
    if(k==='clients'){ADV_PVIEW='clients';selectPortfolio();return;}
    if(k==='ops'){MGR_VIEW='ops';selectPortfolio();return;}
    if(k==='meets'){if(typeof isOperator!=='undefined'&&isOperator)MGR_VIEW='meets';else ADV_PVIEW='meets';selectPortfolio();return;}
    if(k==='home'){ROLE==='client1'?selectClient(CUR):selectPortfolio();return;}
    if(k==='cal'||k==='settings'){showTab(k);return;}
  }
  /* אייקוני הסקציות של חברה — השכבה הקונטקסטואלית בסרגל */
  const SEC_ICO={
    dash:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    chat:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg>',
    metrics:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    msgs:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>',
    meetings:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    prep:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13l2 2 4-4"/></svg>',
    flow:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.5 6H15a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h7.5"/></svg>',
    fcast:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 14 4-4 3 3 5-6"/></svg>'};
  function renderGlobalRail(){
    const list=document.getElementById('gnavList'); if(!list) return;
    let html;
    if(SCOPE==='client'&&GNAV==='client'){
      // סרגל מתחלף: בתוך חברה — כולו של החברה. חזרה למעלה, סקציות מתחת
      const isClientP=(ROLE==='client1'||ROLE==='clientN');
      const backGo=ROLE==='manager'?"gnavGo('ops')":ROLE==='advisor'?"gnavGo('clients')":"gnavGo('home')";
      const backLbl=ROLE==='manager'?'חזרה':ROLE==='advisor'?'כל הלקוחות':'הבית';
      const SEC=[['dash',0],['msgs',0],['chat',1],['metrics',1],['meetings',0],['prep',1]];
      html=(ROLE==='client1'?'':`<div class="gn-back" onclick="${backGo}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg> ${backLbl}</div>`)+
        `<div class="gn-co big">${(CLIENTS[CUR]||{}).name||''}</div>`+
        // במצב תפעול — בלי ניווט סקציות: מתרכזים בעבודה (החזרה למעלה יוצאת מהמצב)
        (typeof OPSMODE!=='undefined'&&OPSMODE?'<div class="gn-lock">מצב תפעול פעיל — הניווט נעול עד סיום או השהיה</div>':'')+
        (ROLE==='manager'&&!(typeof OPSMODE!=='undefined'&&OPSMODE)?(function(){
          const k='c'+CUR, done=opsDoneSet.has(k);
          if(typeof FIN_STATE!=='undefined'&&FIN_STATE&&FIN_STATE.key===k)
            return `<div class="gn-opsbtn check" onclick="enterOps()"><b>בבדיקות · שלב ${FIN_STATE.step+1}/${FIN_STEPS.length}</b><span>המשך בדיקות</span></div>`;
          return done
            ?`<div class="gn-opsbtn done" onclick="enterOps()"><b>✓ התפעול הסתיים</b><span>ארך ${fmtDur(opsDur[k]||0)} · רענון נתונים</span></div>`
            :`<div class="gn-opsbtn" onclick="enterOps()"><b>תפעול</b><span>כניסה למצב עבודה</span></div>`;
        })():'')+
        '';
      // הסרגל מסודר לנושאים — כותרות קבוצה קטנות, הכל גלוי
      if(!(typeof OPSMODE!=='undefined'&&OPSMODE)){
        const vis=k=>{const x=SEC.find(v=>v[0]===k);return x&&(!x[1]||!isClientP);};
        const item=k=>`<div class="gn-item sec ${CUR_TAB===k?'on':''}" onclick="showTab('${k}')">
            ${SEC_ICO[k]}<span>${TAB_LABELS[k]}</span>${k==='meetings'&&ROLE==='advisor'?'<i class="gn-dot" title="סיכום פגישה ממתין לאישור"></i>':''}
          </div>`;
        const seg=(title,keys)=>{
          const ks=keys.filter(vis);
          if(!ks.length) return '';
          return (title?`<div class="gn-sec-h">${title}</div>`:'')+ks.map(item).join('');
        };
        html+=seg('',['dash','msgs','meetings','chat','metrics']);   // ההכנה לפגישה — לא בסרגל; מגיעים אליה מהפגישות ומהיומן
      }
      // דוחות — שלושה פריטי סרגל עצמאיים, בלי אקורדיון (מוסתרים במצב תפעול)
      if(typeof OPSMODE==='undefined'||!OPSMODE){
      html+=`<div class="gn-sec-h">תזרים</div>`;
      html+=`<div class="gn-item sec ${CUR_TAB==='budget'?'on':''}" onclick="showTab('budget')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span>מעקב ופערים</span></div>`;
      html+=`<div class="gn-item sec ${CUR_TAB==='past'?'on':''}" onclick="showTab('past')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg>
          <span>תזרים עבר</span></div>`;
      html+=`<div class="gn-item sec ${CUR_TAB==='fcast'?'on':''}" onclick="showTab('fcast')">${SEC_ICO.fcast}<span>${TAB_LABELS.fcast}</span></div>`;
      html+=`<div class="gn-item sec ${CUR_TAB==='entries'?'on':''}" onclick="showTab('entries')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/></svg><span>${TAB_LABELS.entries}</span></div>`;
      // ליווי — פריט בודד, בלי כותרת קבוצה
      if(!(ROLE==='client1'||ROLE==='clientN')){
        html+=`<div class="gn-item sec ${CUR_TAB==='flow'?'on':''}" onclick="showTab('flow')">${SEC_ICO.flow}<span>${TAB_LABELS.flow}</span></div>`;
      }
      // הגדרות החברה — פר חברה, בתחתית, בלי כותרת
      if(ROLE==='manager'||ROLE==='advisor'){
        html+=`<div class="gn-item sec ${CUR_TAB==='coset'?'on':''}" onclick="showTab('coset')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span>הגדרות חברה</span></div>`;
      }
      }
    }else{
      // מחוץ לחברה — היעדים של בעל התפקיד
      html=gnavItems().map(it=>`
        <div class="gn-item ${GNAV===it.k?'on':''}" onclick="${it.go}">${GNAV_ICO[it.k]}<span>${it.l}</span></div>`).join('');
    }
    // מנהל תזרים: תור התפעול בסרגל — רק במסך הראשי (בתוך חברה הסרגל שייך לחברה)
    if(typeof ROLE!=='undefined'&&ROLE==='manager'&&GNAV==='ops'&&typeof qRule==='function'){
      /* תור התפעול — לא "רשימת לקוחות". רק חברות פעילות:
         בהקמה = אין עדיין הרשאות בנק, אין מה לתפעל · ארכיון = יצאה. */
      const order=CLIENTS.map((c,i)=>i)
        .filter(i=>typeof firmOk==='undefined'||firmOk(CLIENTS[i]))
        .filter(i=>typeof coActive!=='function'||coActive(CLIENTS[i]))
        .sort((a,b)=>opsqRank(a)-opsqRank(b));
      const doneIx=order.filter(i=>opsDoneSet.has('c'+i)), liveIx=order.filter(i=>!opsDoneSet.has('c'+i));
      /* מצבים אחרים — נשלפים רק בבחירה מפורשת, אף פעם לא מעורבבים בתור */
      const inSt=s=>CLIENTS.map((c,i)=>i).filter(i=>(typeof firmOk!=='function'||firmOk(CLIENTS[i]))&&coState(CLIENTS[i])===s);
      const setupIx=inSt('setup'), archIx=inSt('arch');
      const othr=[['active','תור התפעול',liveIx.length],['setup','בהקמה',setupIx.length],['arch','ארכיון',archIx.length]]
        .filter(x=>x[0]!==GN_QST&&x[2]>0);
      const stRow=i=>{const c=CLIENTS[i];
        return `<div class="gn-q flat" onclick="selectClient(${i})" title="${c.name}">
          <span class="dbq-dot ${GN_QST==='setup'?'setup':'off'}"></span>
          <div class="gn-qb"><div class="gn-qn"><span class="nm">${c.name}</span></div>
            <div class="gn-qm"><span class="nm">${GN_QST==='arch'?('בארכיון · '+(c.archOn||'')):(c.mgr||'')}</span></div></div>
        </div>`;};
      const qrow=i=>{
        const c=CLIENTS[i], k='c'+i, r=qRule(i);
        const tot=(c.tasks||[]).length, doneT=(c.tasks||[]).filter(t=>t.done).length;
        // באיזה שלב החברה — עבודה / בדיקות / הושלם
        let st='wait', line='ממתין', pct=tot?Math.round(doneT/tot*100):0;
        if(typeof FIN_STATE!=='undefined'&&FIN_STATE&&FIN_STATE.key===k){
          st='check'; line='בבדיקות · שלב '+(FIN_STATE.step+1)+'/'+FIN_STEPS.length; pct=85;
        }else if(opsDoneSet.has(k)){st='done';line='✓ הושלם · '+fmtDur(opsDur[k]||0);pct=100;}
        else if(opsAccum[k]||doneT>0){
          const cur=OPS_STAGES.find(sg=>(c.tasks||[]).some(t=>t.type===sg[0]&&!t.done));
          st='prog'; line=cur?'בשלב: '+cur[1]+' · '+(tot-doneT)+' נותרו':'בתהליך · '+fmtDur(opsAccum[k]||0);
        }else if(c.opsAlert){st='alert';}
        return `<div class="gn-q ${c.bankDown?'bank':opsDoneSet.has(k)?'opsdone':''}" onclick="selectClient(${i})" title="${c.name} — לדשבורד החברה">
          <span class="dbq-dot ${st}"></span>
          <div class="gn-qb">
            <div class="gn-qn"><span class="nm">${c.name}</span><i class="gn-mr ${c.mReport?'ok':'no'}">${c.mReport?'✓':'דוח'}</i></div>
            <div class="gn-qm"><span class="nm">${c.mgr}</span>${c.product?prodLogo(c.product,'sm'):''}</div>
          </div>
          <span class="gn-biz" title="פתיחה ב-Bizibox" onclick="event.stopPropagation();toast('נפתח ב-Bizibox — ${c.name}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/></svg></span>
        </div>`;};
      /* הסרגל מתקצר ככל שהיום מתקדם — מי שהושלם נאסף לשורה מקופלת */
      const stTtl={active:'תור התפעול',setup:'בהקמה',arch:'ארכיון'}[GN_QST];
      const stN={active:liveIx.length,setup:setupIx.length,arch:archIx.length}[GN_QST];
      html+=`<div class="gn-qwrap st-${GN_QST}">
        <div class="gn-qh"><span class="qh-t">${stTtl}</span><b class="qh-n">${stN}</b>
          ${GN_QST==='active'&&doneIx.length?`<span class="qh-done">${doneIx.length===1?'אחת הושלמה':doneIx.length+' הושלמו'}</span>`:''}
          ${GN_QST!=='active'?`<span class="qh-note">${GN_QST==='setup'?'לא בתפעול':'יצאו'}</span>`:''}</div>
        <div class="gn-qlist">
          ${GN_QST!=='active'?(GN_QST==='setup'?setupIx:archIx).map(stRow).join(''):
            (liveIx.map(qrow).join('')||'<div class="gn-qempty">✓ אין חברות בתור — סיימת להיום</div>')+
            (doneIx.length?`<button class="gn-qmore ${GN_QDONE?'on':''}" onclick="gnQDone()">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m6 9 6 6 6-6"/></svg>
              ${GN_QDONE?'הסתרה':'✓ '+(doneIx.length===1?'הושלמה אחת':'הושלמו '+doneIx.length)}</button>
            ${GN_QDONE?doneIx.map(qrow).join(''):''}`:'')}
        </div>
        ${othr.length?`<div class="gn-qst">${othr.map(([k,l,n])=>
          `<button class="qst ${GN_QST===k?'on':''} ${k}" onclick="gnQSt('${k}')">${l}<i>${n}</i></button>`).join('')}</div>`:''}
      </div>`;
    }
    list.innerHTML=html;
    // הכל למעלה, בתפריט אחד — אין אזור תחתון
    document.getElementById('gnavBottom').innerHTML='';
  }
  function renderRailNav(){renderGlobalRail();}   // תאימות לקריאות ישנות
  let GN_REP=false, GN_QDONE=false, GN_QST='active';
  function gnQDone(){GN_QDONE=!GN_QDONE;renderGlobalRail();}
  function gnQSt(k){GN_QST=k;renderGlobalRail();}
  function gnRepToggle(){GN_REP=!GN_REP;renderGlobalRail();}

  /* פירור לחם — מיותר כשהסרגל המתחלף נושא חזרה + שם חברה */
  function renderCrumb(){
    const el=document.getElementById('crumb'); if(el) el.style.display='none';
  }

  /* לקוחות — רשימת החברות כיעד גלובלי */
  let CLV_ST='active';
  function clvSt(k){ CLV_ST=k; if(GNAV!=='clients'&&GNAV!=='ops') gnavGo(ROLE==='manager'?'ops':'clients'); renderClientsView(); }
  function renderClientsView(){
    const grid=document.getElementById('clvGrid'); if(!grid) return;
    const q=(document.getElementById('clvQ').value||'').trim();
    let base=CLIENTS.map((c,i)=>({c,i}));
    if(typeof firmOk==='function') base=base.filter(x=>firmOk(x.c));
    /* מצב החברה קודם לכל פילטר אחר — ארכיון לא מופיע אלא אם בחרו אותו */
    const SEG=[['active','פעילים'],['setup','בהקמה'],['arch','ארכיון']];
    const seg=document.getElementById('clvSeg');
    if(seg) seg.innerHTML=SEG.map(([k,l])=>{
      const n=base.filter(x=>coState(x.c)===k).length;
      return `<button class="clvs ${CLV_ST===k?'on':''} ${k}" onclick="clvSt('${k}')">${l}<i>${n}</i></button>`;}).join('');
    let list=base.filter(x=>coState(x.c)===CLV_ST);
    if(q) list=list.filter(x=>x.c.name.includes(q)||x.c.hp.includes(q)||x.c.mgr.includes(q)||(x.c.firm||'').includes(q));
    grid.innerHTML=list.map(({c,i})=>{
      const p=(typeof advPulse==='function')?advPulse(c):'green';
      const fig=(typeof BAL!=='undefined'&&BAL[c.name])?BAL[c.name]:'—';
      const sp=c.spark||[]; const mx=Math.max(...sp,1);
      const bars=sp.map(v=>`<i style="height:${Math.max(3,Math.round(v/mx*26))}px"></i>`).join('');
      const trendUp=sp.length>1&&sp[sp.length-1]>=sp[sp.length-2];
      const stt=coState(c);
      const hl=stt==='arch'?`<div class="clv-hl arch">בארכיון מאז ${c.archOn||'—'} · ${c.archWhy||''}</div>`
        :stt==='setup'?`<div class="clv-hl setup">${(c.hl&&c.hl.t)||'בהקמה — ממתין להרשאות בנק'}</div>`
        :c.hl?`<div class="clv-hl ${c.hl.sev}">${c.hl.t}</div>`:`<div class="clv-hl ok">✓ תקין — עומד ביעדים</div>`;
      return `<div class="clv-card v2 st-${stt} pulse-${p}" onclick="selectClient(${i})">
        <div class="clv-top2">
          <span class="ap-av">${c.name.charAt(0)}</span>
          <div class="clv-tt"><div class="clv-n">${c.name}</div><div class="clv-meta2">${c.hp} · ${c.mgr}</div></div>
          ${c.product?prodLogo(c.product,'sm'):''}
        </div>
        <div class="clv-mid">
          <div class="clv-balance"><span>יתרה נוכחית</span><b dir="ltr">${fig} ₪</b><i class="clv-trend ${trendUp?'up':'dn'}">${trendUp?'↑':'↓'} הכנסות</i></div>
          <div class="clv-spark"><div class="clv-bars">${bars}</div><span>6 ח׳ אחרונים</span></div>
        </div>
        ${hl}
        ${stt==='arch'?'':c.coopDays!=null&&c.coopDays>=14?`<div class="clv-coop bad">⚠ לא הביא חומר לתזרים ${c.coopDays} ימים · לאחרונה ${c.coopLast}</div>`
          :c.coopLast?`<div class="clv-coop ok">חומר אחרון לתזרים · ${c.coopLast}</div>`
          :`<div class="clv-coop no">טרם התקבל חומר לתזרים</div>`}
        <div class="clv-foot">${stt==='arch'
          ?`<button class="mt-btn view" onclick="event.stopPropagation();openMemCard(${i})">כרטיס לקוח</button><button class="mt-btn" onclick="event.stopPropagation();coRestore(${i})">החזרה לפעילות</button>`
          :`<button class="mt-btn view" onclick="event.stopPropagation();selectClient(${i})">פתיחת החברה</button><button class="mt-btn" onclick="event.stopPropagation();openMemCard(${i})">כרטיס לקוח</button>`}</div>
      </div>`;}).join('')||`<div class="ops-empty" style="padding:40px">${CLV_ST==='arch'?'אין חברות בארכיון':CLV_ST==='setup'?'אין חברות בהקמה':'לא נמצאו לקוחות'}</div>`;
  }

  /* הגדרות — כרגע רק סדר תור התפעול; השאר בבנייה */
  /* הגדרות שורה תקציבית */
  let BL_SET={freq:'3', day:1, mark:true, show:'both', name:'תקציב: {קטגוריה} · {חודש}',
    excluded:['לא לקיטלוג','הלוואות'], advisors:false};
  const BL_CATS=['הכנסות ממכירות','הכנסות אחרות','קניות מלאי','ספקים','שכר עבודה','שכר קבלני משנה',
    'שכירות ותפעול משרד','עמלות וריביות בנק','תשלומי הלוואה','הלוואות','ביטוחים','מיסים ואגרות','רכב ודלק','שיווק ופרסום','לא לקיטלוג'];
  function blSet(k,v){BL_SET[k]=v;renderSettings();}
  function blExAdd(sel){if(sel.value&&!BL_SET.excluded.includes(sel.value)){BL_SET.excluded.push(sel.value);renderSettings();}}
  function blExDel(i){BL_SET.excluded.splice(i,1);renderSettings();}
  function renderSettings(){
    const el=document.getElementById('viewSettings'); if(!el) return;
    const rules=(typeof QUEUE_RULES!=='undefined')?QUEUE_RULES.map((r,ix)=>`
      <div class="qr-row ${r.on?'':'off'}">
        <span class="qr-num">${ix+1}</span>
        <span class="qr-t">${r.label}</span>
        <span class="qr-acts">
          <button class="qr-btn" ${ix===0?'disabled':''} onclick="qrMove(${ix},-1)" title="העלאה">▲</button>
          <button class="qr-btn" ${ix===QUEUE_RULES.length-1?'disabled':''} onclick="qrMove(${ix},1)" title="הורדה">▼</button>
          <label class="mc-tog qr-tog" title="הפעלה/כיבוי"><input type="checkbox" ${r.on?'checked':''} onchange="qrToggle(${ix})"><span></span></label>
        </span>
      </div>`).join(''):'';
    el.innerHTML=`
      <div class="set-title">הגדרות</div>
      <div class="set-card" style="max-width:640px;margin-bottom:14px">
        <div class="set-head">
          <span class="set-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h13M10 18h10"/></svg></span>
          <div class="awdg-tt"><div class="awdg-t">סדר תור התפעול</div><div class="awdg-sub">החוק הראשון שתופס קובע את מיקום החברה בתור — סדרו לפי העדיפות שלכם</div></div>
        </div>
        ${rules}
        <div class="qr-note">הושלמו — תמיד בסוף התור · חברות ללא חוק תואם — באמצע</div>
      </div>
      <div class="set-card" style="max-width:640px;margin-bottom:14px">
        <div class="set-head">
          <span class="set-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 13h3v5H7zM12 9h3v9h-3zM17 5h3v13h-3z"/></svg></span>
          <div class="awdg-tt"><div class="awdg-t">שורות תקציביות</div><div class="awdg-sub">היתרה בין היעד החודשי למה שצבוע בתזרים — איך היא נפתחת ומוצגת</div></div>
        </div>
        <div class="bl-row"><span class="bl-l">פריסת השורה</span>
          <span class="bl-c">
            <select class="mx2-inp" onchange="blSet('freq',this.value)">
              <option value="3" ${BL_SET.freq==='3'?'selected':''}>כל 3 ימים</option>
              <option value="7" ${BL_SET.freq==='7'?'selected':''}>כל שבוע</option>
              <option value="day" ${BL_SET.freq==='day'?'selected':''}>ביום קבוע בחודש</option>
            </select>
            ${BL_SET.freq==='day'?`<input class="mx2-inp bl-day" type="number" min="1" max="28" value="${BL_SET.day}" onchange="blSet('day',+this.value)" title="היום בחודש">`:''}
          </span></div>
        <div class="bl-row"><span class="bl-l">מה מוצג בשורה</span>
          <span class="bl-c">
            <select class="mx2-inp" onchange="blSet('show',this.value)">
              <option value="rest" ${BL_SET.show==='rest'?'selected':''}>היתרה שנותרה בלבד</option>
              <option value="both" ${BL_SET.show==='both'?'selected':''}>יעד חודשי + יתרה</option>
              <option value="pace" ${BL_SET.show==='pace'?'selected':''}>יתרה + קצב הפריסה</option>
            </select>
            <label class="mc-tog qr-tog" title="סימן קריאה על השורה בתזרים"><input type="checkbox" ${BL_SET.mark?'checked':''} onchange="blSet('mark',this.checked)"><span></span></label>
            <i class="bl-hint">סימן קריאה (!) על השורה בתזרים</i>
          </span></div>
        <div class="bl-row"><span class="bl-l">שם השורה</span>
          <span class="bl-c bl-name">
            <input class="mx2-inp" value="${BL_SET.name}" onchange="blSet('name',this.value)" style="flex:1">
            <i class="bl-hint">תבנית: {קטגוריה} · {חודש} — לדוגמה: "${BL_SET.name.replace('{קטגוריה}','הכנסות ממכירות').replace('{חודש}','יולי')}"</i>
          </span></div>
        <div class="bl-row"><span class="bl-l">קטגוריות מוחרגות<br><i class="bl-hint">לא תיפתח להן שורה תקציבית</i></span>
          <span class="bl-c bl-ex">
            ${BL_SET.excluded.map((c,i)=>`<span class="bl-chip">${c}<b onclick="blExDel(${i})">✕</b></span>`).join('')}
            <select class="mx2-inp bl-exadd" onchange="blExAdd(this)">
              <option value="">+ החרגה…</option>
              ${BL_CATS.filter(c=>!BL_SET.excluded.includes(c)).map(c=>`<option>${c}</option>`).join('')}
            </select>
          </span></div>
        <div class="bl-row"><span class="bl-l">הרשאת יועצים</span>
          <span class="bl-c">
            <label class="mc-tog qr-tog"><input type="checkbox" ${BL_SET.advisors?'checked':''} onchange="blSet('advisors',this.checked)"><span></span></label>
            <i class="bl-hint">יועצים יכולים לעדכן שורות תקציביות בחברות שלהם</i>
          </span></div>
      </div>
      <div class="set-empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <b>מסך ההגדרות בבנייה</b>
        <span>כאן ינוהלו תהליכים, מאגר ידע, תבניות הודעות, התראות ברירת מחדל, אינטגרציות וצוות</span>
      </div>`;
  }

  /* לקוחות — רשימת החברות כיעד גלובלי */
  function renderClientsView(){
    const grid=document.getElementById('clvGrid'); if(!grid) return;
    const q=(document.getElementById('clvQ').value||'').trim();
    let list=CLIENTS.map((c,i)=>({c,i}));
    if(typeof firmOk==='function') list=list.filter(x=>firmOk(x.c));
    if(q) list=list.filter(x=>x.c.name.includes(q)||x.c.hp.includes(q)||x.c.mgr.includes(q)||(x.c.firm||'').includes(q));
    grid.innerHTML=list.map(({c,i})=>{
      const p=(typeof advPulse==='function')?advPulse(c):'green';
      const fig=(typeof BAL!=='undefined'&&BAL[c.name])?BAL[c.name]:'—';
      const sp=c.spark||[]; const mx=Math.max(...sp,1);
      const bars=sp.map(v=>`<i style="height:${Math.max(3,Math.round(v/mx*26))}px"></i>`).join('');
      const trendUp=sp.length>1&&sp[sp.length-1]>=sp[sp.length-2];
      const hl=c.hl?`<div class="clv-hl ${c.hl.sev}">${c.hl.t}</div>`:`<div class="clv-hl ok">✓ תקין — עומד ביעדים</div>`;
      return `<div class="clv-card v2 pulse-${p}" onclick="selectClient(${i})">
        <div class="clv-top2">
          <span class="ap-av">${c.name.charAt(0)}</span>
          <div class="clv-tt"><div class="clv-n">${c.name}</div><div class="clv-meta2">${c.hp} · ${c.mgr}</div></div>
          ${c.product?prodLogo(c.product,'sm'):''}
        </div>
        <div class="clv-mid">
          <div class="clv-balance"><span>יתרה נוכחית</span><b dir="ltr">${fig} ₪</b><i class="clv-trend ${trendUp?'up':'dn'}">${trendUp?'↑':'↓'} הכנסות</i></div>
          <div class="clv-spark"><div class="clv-bars">${bars}</div><span>6 ח׳ אחרונים</span></div>
        </div>
        ${hl}
        ${c.coopDays!=null&&c.coopDays>=14?`<div class="clv-coop bad">⚠ לא הביא חומר לתזרים ${c.coopDays} ימים · לאחרונה ${c.coopLast}</div>`
          :c.coopLast?`<div class="clv-coop ok">חומר אחרון לתזרים · ${c.coopLast}</div>`
          :`<div class="clv-coop no">טרם התקבל חומר לתזרים</div>`}
        <div class="clv-foot"><button class="mt-btn view" onclick="event.stopPropagation();selectClient(${i})">פתיחת החברה</button><button class="mt-btn" onclick="event.stopPropagation();openMemCard(${i})">כרטיס לקוח</button></div>
      </div>`;}).join('')||'<div class="ops-empty" style="padding:40px">לא נמצאו לקוחות</div>';
  }

  /* ---- metrics definition ----
     שלושה סוגי מדדים:
       manual — מדד עצמאי: יעד ₪/מספר, בפועל ידני או Google Sheets (עם לוגיקת סנכרון)
       calc   — מדד מחושב: בין שני מדדים, הבפועל לא ניתן להגדרה
       cats   — מדד לפי קטגוריות: הבפועל מנתוני אמת מ-Bizibox
     ההתראות הן חלק מהמדד (m.alerts — רשימה) — נערכות מהפעמון שעל הכרטיס. */
  let WORKDAYS=22;
  const SHEET_LOGIC={
    none:'ללא לוגיקה — עדכן רק את החודש הנוכחי מהתא שנבחר',
    same:'אותו תא לכל החודשים — מלא את כל חודשי המדד מאותו תא',
    cols:'חודשים לפי עמודות — התא הוא החודש הנוכחי, עמודות סמוכות הן חודשים סמוכים',
    name:'לפי שם הגיליון — קרא את אותו תא מגיליון בשם חודש ושנה בעברית'};
  const SHEET_LOGIC_SHORT={none:'ללא לוגיקה',same:'אותו תא לכל החודשים',cols:'חודשים לפי עמודות',name:'לפי שם הגיליון'};
  const CF_CATS={'הכנסות':['הכנסות ממכירות - סליקה','הכנסות אחרות'],
                 'הוצאות':['אחזקת עסק','פרסום ושיווק','הוצאות פרטיות','הוצאות שכר','ספקים','שכירות','מסים ואגרות']};
  /* התראות גנריות — לכל מדד רשימת חוקים (אפשר יותר מהתראה אחת):
       mode: 'pct' (אחוז מהיעד) | 'abs' (הערך עצמו)
       dir : 'above' | 'below'   ·   th: סף   ·   sev: חומרה ('high'/'mid') */
  const METRICS=[
    {key:'revenue',  name:'מחזור הכנסות', kind:'manual', unit:'₪', target:150000, actual:142522,
     sheets:{on:true, logic:'name', cell:'B4', gid:'0'}, alerts:[{on:false, mode:'pct', dir:'below', th:80, sev:'mid'}]},
    {key:'liters',   name:'סך הליטרים - לפי סוג דלק', kind:'manual', unit:'num', target:120000, actual:93600,
     sheets:{on:true, logic:'cols', cell:'C7', gid:'1824'}, alerts:[{on:true, mode:'pct', dir:'below', th:85, sev:'mid'}]},
    {key:'collect',  name:'גבייה במזומן בשטח', kind:'manual', unit:'₪', target:25000, actual:17800,
     sheets:{on:false}, alerts:[{on:false, mode:'pct', dir:'below', th:70, sev:'mid'}]},
    {key:'inventory',name:'שווי מלאי נוכחי', kind:'manual', unit:'₪', target:0, actual:618400,
     sheets:{on:false}, alerts:[]},
    {key:'budget',   name:'עמידה בתקציב', kind:'cats', unit:'%', target:100, cats:['כל קטגוריות ההוצאות'],
     alerts:[{on:true, mode:'pct', dir:'above', th:100, sev:'high'},
             {on:true, mode:'pct', dir:'above', th:95,  sev:'mid'}]},
    {key:'salesclr', name:'הכנסות ממכירות - סליקה', kind:'cats', unit:'₪', target:90000, actual:99642,
     cats:['הכנסות ממכירות - סליקה'], alerts:[{on:false, mode:'pct', dir:'below', th:75, sev:'mid'}]},
    {key:'cfprofit', name:'רווח / הפסד תזרימי', kind:'calc', unit:'₪', target:30000,
     calc:{a:'מחזור הכנסות', op:'−', b:'כל קטגוריות ההוצאות',
           aSrc:{src:'metric',val:'מחזור הכנסות'}, bSrc:{src:'cats',val:'כל קטגוריות ההוצאות'}},
     alerts:[{on:true, mode:'pct', dir:'below', th:80, sev:'mid'}]},
    {key:'perday',  name:'הכנסה ליום עבודה', kind:'calc', unit:'₪', target:6800, actual:6478,
     calc:{a:'תא B4 (Sheets)', op:'÷', b:'22 קבוע',
           aSrc:{src:'sheet',val:'B4',logic:'name'}, bSrc:{src:'const',val:22}},
     alerts:[{on:false, mode:'pct', dir:'below', th:85, sev:'mid'}]},
    {key:'overdraft',name:'חריגה צפויה בעו״ש', kind:'calc', unit:'ימים',
     calc:{a:'תחזית תזרים', op:'מול', b:'מסגרת אשראי'}, alerts:[{on:true, mode:'abs', dir:'below', th:14, sev:'high'}]},
    {key:'debt',     name:'חוב פתוח לגבייה', kind:'cats', unit:'₪', target:0,
     cats:['גבייה מלקוחות'], alerts:[{on:true, mode:'abs', dir:'above', th:0, sev:'mid'}]},
    {key:'meeting',  name:'פגישה חודשית · Money+', kind:'auto', unit:'בחודש', alerts:[{on:true, mode:'abs', dir:'below', th:1, sev:'high'}]},
  ];
  const fmt=n=>Math.round(n).toLocaleString('en-US');
  // מה נמדד בפועל בכל מדד — מזין את משפט ההסבר בהגדרת ההתראה
  const MEASURE_TXT={overdraft:'ימים עד חריגה צפויה בעו״ש',debt:'חוב פתוח לגבייה בש״ח',meeting:'מספר פגישות שנקבעו לחודש הקרוב'};
  const hasUpcomingMeeting=c=>MEETINGS.some(x=>x.client===c.name&&x.status==='upcoming');
  // ניסוח חוק התראה — משמש גם את "למה קיבלתי התראה" במוקד
  function ruleSentence(r,m){
    const u=r.mode==='pct'?'% מהיעד':'';
    let s=`התרע ("${r.sev==='high'?'דחוף':'לבדיקה'}") כאשר הבפועל ${r.dir==='above'?'יעלה מעל':'ירד מתחת ל-'}${r.th}${u}`;
    if(m&&MEASURE_TXT[m.key]) s+=` · הערך הנמדד: ${MEASURE_TXT[m.key]}`;
    return s;
  }
  const KIND_META={
    manual:{lbl:'עצמאי', cls:'manual', ic:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'},
    calc:  {lbl:'מחושב', cls:'calc', ic:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h3M13 12h3M8 16h3M13 16h3"/></svg>'},
    cats:  {lbl:'לפי קטגוריות', cls:'cats', ic:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M7 12h10M10 18h4"/></svg>'},
    auto:  {lbl:'אוטומטי', cls:'auto', ic:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'},
  };
  const unitTxt=m=>m.unit==='₪'?'₪':(m.unit==='num'?'':m.unit);
  // display state per metric for the current company
  function mDisp(m,c){
    if(m.key==='meeting'){
      if(c.product!=='money+') return {txt:'רלוונטי ל-Money+ בלבד', muted:1};
      const up=MEETINGS.find(x=>x.client===c.name&&x.status==='upcoming');
      return up?{txt:'נקבעה · '+up.date.slice(0,5)}:{txt:'לא נקבעה החודש',bad:1};
    }
    if(m.key==='overdraft'){const v=mVal(c,m.key);return v>0?{txt:v+' ימים לחריגה צפויה',bad:1}:{txt:'אין חריגה צפויה'};}
    if(m.key==='debt'){const v=mVal(c,m.key)||0;return v>0?{txt:fmt(v)+' ₪ בפיגור',bad:1}:{txt:'אין חוב פתוח'};}
    if(m.key==='budget'){const v=mVal(c,m.key)||0;return {pct:v, big:v+'%', sub:'מהתקציב · יעד עד 100%', bad:v>100};}
    if(m.key==='cfprofit'){const v=mVal(c,m.key)||0;const act=Math.round((m.target||0)*v/100);
      return {pct:v, big:fmt(act)+' ₪', sub:'מתוך יעד '+fmt(m.target)+' ₪', bad:!!evalMetric(m,c)};}
    if(m.actual!=null&&m.target>0){const p=Math.round(m.actual/m.target*100);
      return {pct:p, big:fmt(m.actual)+(m.unit==='₪'?' ₪':''), sub:'מתוך יעד '+fmt(m.target)+(m.unit==='₪'?' ₪':''), bad:!!evalMetric(m,c)};}
    if(m.actual!=null) return {big:fmt(m.actual)+(m.unit==='₪'?' ₪':''), sub:''};   // גם בלי יעד — הבפועל נתון מלא
    return {txt:'—'};
  }
  function srcLine(m){
    if(m.kind==='manual') return m.sheets&&m.sheets.on
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e8a4c" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg> Google Sheets · ${SHEET_LOGIC_SHORT[m.sheets.logic]||''} · תא ${m.sheets.cell}`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> הזנה ידנית — מתעדכן כל חודש`;
    if(m.kind==='calc'){
      const tag=o=>{
        if(!o||!o.src) return `<span class="op-tag met">${o&&o.val||'?'}</span>`;
        if(o.src==='sheet') return `<span class="op-tag sheet">Sheets · תא ${o.val||'?'} · ${SHEET_LOGIC_SHORT[o.logic||'none']}</span>`;
        if(o.src==='cats')  return `<span class="op-tag bz">Bizibox · ${o.val}</span>`;
        if(o.src==='const') return `<span class="op-tag cst">קבוע · ${(+o.val||0).toLocaleString('en-US')}</span>`;
        return `<span class="op-tag met">מדד · ${o.val}</span>`;
      };
      const a=m.calc.aSrc||{src:'metric',val:m.calc.a}, b=m.calc.bSrc||{src:'metric',val:m.calc.b};
      return `<b>ƒ</b> ${tag(a)} <b class="op-op">${m.calc.op}</b> ${tag(b)}`;
    }
    if(m.kind==='cats') return `<span class="src-bz">Bizibox</span> נתוני אמת · ${(m.cats||[]).join(' + ')}`;
    return 'מתעדכן אוטומטית מיומן הפגישות';
  }
  const MONTH_LBL='יולי';
  function renderMetrics(){
    const c=CLIENTS[typeof CUR==='number'?CUR:0]||{};
    // מדד אמיתי = יש יעד חודשי; בלי יעד = מעקב שמזין התראות, לא מדד
    const isTracker=m=>['overdraft','debt','meeting'].includes(m.key);   // מדד רגיל יכול להיות גם ללא יעד
    const MGROUPS=[
      ['הזנה ידנית','יעד מול בפועל — מוזן כל חודש', m=>m.kind==='manual'&&!(m.sheets&&m.sheets.on)&&!isTracker(m)],
      ['Google Sheets','נמשך אוטומטית מהגיליון של הלקוח', m=>m.kind==='manual'&&m.sheets&&m.sheets.on&&!isTracker(m)],
      ['מדדים מחושבים','נוסחה בין מדדים — הבפועל מחושב אוטומטית', m=>m.kind==='calc'&&!isTracker(m)],
      ['מדדים לפי קטגוריות','הבפועל מנתוני אמת — Bizibox', m=>m.kind==='cats'&&!isTracker(m)],
    ];
    // בלי יעד = לא מדד — לא מוצג כאן (ההתראות שלו חיות במוקד ההתראות)
    const row=(m,i)=>{
      const k=KIND_META[m.kind]||KIND_META.auto, d=mDisp(m,c);
      const nAl=(m.alerts||[]).filter(r=>r.on).length;
      const daily=(m.target>0&&m.unit!=='%')?'יעד יומי '+fmt(m.target/WORKDAYS)+(m.unit==='₪'?' ₪':''):'';
      const tgt=m.target>0?fmt(m.target)+(m.unit==='₪'?' ₪':m.unit==='%'?'%':''):'—';
      const act=d.big!=null?d.big:(d.txt||'—');
      // תג אחוז-מהיעד — רק כשהמדד עצמו אינו נמדד באחוזים (אחרת זו כפילות)
      const pct=(d.pct!=null&&m.unit!=='%')?`<i class="mr-pct ${d.bad?'bad':''}">${d.pct}%</i>`:'';
      return `<div class="mrow">
        <div class="mr-main">
          <div class="mr-name" onclick="${m.kind==='auto'?'':`openMx(${i})`}"><b>${m.name}</b><span class="mkind ${k.cls}">${k.ic} ${k.lbl}</span></div>
          <div class="mr-src">${srcLine(m)}</div>
        </div>
        <div class="mr-col"><span>יעד</span><b>${tgt}</b><i>${daily}</i></div>
        <div class="mr-col"><span>בפועל · ${MONTH_LBL}</span><b class="${d.bad?'bad':''}">${act}</b>${pct}</div>
        <div class="mr-tools">
          <button class="mbell ${nAl?'on':''}" title="${nAl?nAl+' חוקי התראה מוגדרים — ההתראות עצמן במוקד ההתראות':'הגדרת התראות'}" onclick="openAlertCfg(${i})">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
          </button>
          ${m.kind==='auto'?'':`<button class="mbell rev" title="עריכת המדד" onclick="openMx(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>`}
        </div>
      </div>`;
    };
    document.getElementById('mcards').innerHTML=MGROUPS.map(([t,sub,fn])=>{
      const items=METRICS.map((m,i)=>({m,i})).filter(o=>fn(o.m));
      if(!items.length) return '';
      return `<div class="mgrp-card"><div class="mgrp-hh">${t}<span>${sub}</span><i>${items.length} מדדים</i></div>${items.map(o=>row(o.m,o.i)).join('')}</div>`;
    }).join('');
  }
  function setDays(v){WORKDAYS=parseInt(v)||22;renderMetrics();}
  // מדדי מערכת (מזינים את מוקד ההתראות) — מוגנים ממחיקה; אחרים דורשים אישור
  const SYS_METRIC=m=>['budget','overdraft','debt','liters','cfprofit','meeting'].includes(m.key);
  function delMetricFromMx(){
    if(MX_IX<0) return;
    const ix=MX_IX;
    closeMx();
    delMetric(ix);
  }
  function delMetric(i){
    const m=METRICS[i];
    hkConfirm('מחיקת מדד','המדד "'+m.name+'" יימחק יחד עם ההתראות שלו. לא ניתן לשחזר.','מחיקה',()=>{
      METRICS.splice(i,1);renderMetrics();toast('המדד נמחק');
    });
  }

  /* ---- alert config — רשימת חוקים למדד (אפשר יותר מהתראה אחת) ---- */
  let AL_IX=-1, AC_RULES=[];
  function openAlertCfg(i){
    AL_IX=i; const m=METRICS[i];
    AC_RULES=(m.alerts||[]).map(r=>({...r}));   // עותק עבודה — נשמר רק באישור
    document.getElementById('acName').textContent=m.name+(MEASURE_TXT[m.key]?' · הערך הנמדד: '+MEASURE_TXT[m.key]:'');
    renderAcRules();
    document.getElementById('acOv').classList.add('show');
  }
  function closeAlertCfg(){document.getElementById('acOv').classList.remove('show');}
  function renderAcRules(){
    document.getElementById('acRules').innerHTML=AC_RULES.length?AC_RULES.map((r,ri)=>`
      <div class="ac-rule ${r.on?'':'off'}">
        <label class="mc-tog sm"><input type="checkbox" ${r.on?'checked':''} onchange="acSet(${ri},'on',this.checked)"><span></span></label>
        <select class="mx2-inp s" onchange="acSet(${ri},'mode',this.value)">
          <option value="pct" ${r.mode==='pct'?'selected':''}>אחוז מהיעד</option>
          <option value="abs" ${r.mode==='abs'?'selected':''}>הערך עצמו</option>
        </select>
        <select class="mx2-inp s" onchange="acSet(${ri},'dir',this.value)">
          <option value="below" ${r.dir==='below'?'selected':''}>ירד מתחת ל-</option>
          <option value="above" ${r.dir==='above'?'selected':''}>יעלה מעל</option>
        </select>
        <input class="mx2-inp s th" type="number" value="${r.th}" onchange="acSet(${ri},'th',this.value)">
        <select class="mx2-inp s" onchange="acSet(${ri},'sev',this.value)">
          <option value="high" ${r.sev==='high'?'selected':''}>דחוף</option>
          <option value="mid" ${r.sev==='mid'?'selected':''}>לבדיקה</option>
        </select>
        <button class="mbell del" title="מחיקת התראה" onclick="acDel(${ri})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
      </div>`).join('')
      :'<div class="ac-empty">אין התראות למדד הזה — הוסיפו את הראשונה</div>';
  }
  function acSet(ri,f,v){AC_RULES[ri][f]=f==='th'?(parseFloat(v)||0):v;if(f==='on')renderAcRules();}
  function acDel(ri){AC_RULES.splice(ri,1);renderAcRules();}
  function acAdd(){AC_RULES.push({on:true,mode:'pct',dir:'below',th:80,sev:'mid'});renderAcRules();}
  function saveAlertCfg(){
    METRICS[AL_IX].alerts=AC_RULES.map(r=>({...r}));
    closeAlertCfg(); renderMetrics(); toast('ההתראות עודכנו');
  }

  /* ---- metric editor (new / edit) ---- */
  let MX_IX=-1;
  function mxNoTgtCh(){
    const off=document.getElementById('mxNoTgt').checked;
    const t=document.getElementById('mxTarget');
    t.disabled=off; if(off) t.value='';
    mxDaily();
  }
  /* אופרנד בנוסחה: מדד / קטגוריה / תא גיליון / מספר קבוע */
  let MX_OPS={A:{src:'metric',val:''},B:{src:'metric',val:''}};
  function mxOpSrc(side){
    MX_OPS[side]={src:document.getElementById('mxSrc'+side).value, val:''};
    mxOpRender(side);
  }
  function mxOpRender(side){
    const o=MX_OPS[side], el=document.getElementById('mxOp'+side);
    if(o.src==='metric'){
      const names=METRICS.filter(x=>x.kind!=='calc').map(x=>x.name).concat(['סך הוצאות (Bizibox)','תחזית תזרים']);
      el.innerHTML=`<select class="mx2-inp" style="width:100%" onchange="MX_OPS['${side}'].val=this.value">${[...new Set(names)].map(n=>`<option ${n===o.val?'selected':''}>${n}</option>`).join('')}</select>`;
      if(!o.val) o.val=names[0];
    }else if(o.src==='cats'){
      const cats=['כל קטגוריות ההוצאות','כל קטגוריות ההכנסות'].concat(Object.values(CF_CATS).flat());
      el.innerHTML=`<select class="mx2-inp" style="width:100%" onchange="MX_OPS['${side}'].val=this.value">${cats.map(c=>`<option ${c===o.val?'selected':''}>${c}</option>`).join('')}</select>`;
      if(!o.val) o.val=cats[0];
    }else if(o.src==='sheet'){
      el.innerHTML=`<input class="mx2-inp" style="width:100%;margin-bottom:6px" placeholder="תא בגיליון — למשל B4" value="${o.val||''}" oninput="MX_OPS['${side}'].val=this.value">
        <select class="mx2-inp" style="width:100%" onchange="MX_OPS['${side}'].logic=this.value" title="לוגיקת הסנכרון של הגיליון">${Object.keys(SHEET_LOGIC_SHORT).map(k=>`<option value="${k}" ${k===(o.logic||'none')?'selected':''}>${SHEET_LOGIC_SHORT[k]}</option>`).join('')}</select>`;
    }else{
      el.innerHTML=`<input class="mx2-inp" type="number" style="width:100%" placeholder="ערך קבוע — למשל 150000" value="${o.val||''}" oninput="MX_OPS['${side}'].val=this.value">`;
    }
  }
  /* תיאור קריא לאופרנד — מוצג בשורת המקור של המדד */
  function mxOpLabel(o){
    if(o.src==='sheet') return 'תא '+(o.val||'?')+' (Sheets · '+(SHEET_LOGIC_SHORT[o.logic||'none'])+')';
    if(o.src==='const') return (o.val?parseFloat(o.val).toLocaleString('en-US'):'?')+' קבוע';
    return o.val||'?';
  }
  function openMx(i){
    MX_IX=(i==null?-1:i);
    const m=MX_IX>=0?METRICS[MX_IX]:{kind:'manual',unit:'₪',target:'',actual:'',sheets:{on:false,logic:'none',cell:'',gid:''},calc:{a:'מחזור הכנסות',op:'−',b:'סך הוצאות (Bizibox)'},cats:[]};
    document.getElementById('mxTitle').textContent=MX_IX>=0?'עריכת מדד':'מדד חדש';
    const _db=document.getElementById('mxDelBtn');
    if(_db)_db.style.display=(MX_IX>=0&&!SYS_METRIC(METRICS[MX_IX]))?'':'none';
    document.getElementById('mxKind').value=m.kind==='auto'?'manual':m.kind;
    document.getElementById('mxName').value=MX_IX>=0?m.name:'';
    document.querySelector(`input[name=mxUnit][value="${m.unit==='num'?'num':'₪'}"]`).checked=true;
    document.getElementById('mxTarget').value=m.target||'';
    document.getElementById('mxNoTgt').checked=(MX_IX>=0&&!(m.target>0));
    document.getElementById('mxTarget').disabled=(MX_IX>=0&&!(m.target>0));
    document.getElementById('mxActual').value=m.actual!=null?m.actual:'';
    const sh=m.sheets||{on:false,logic:'none',cell:'',gid:''};
    document.getElementById('mxShOn').checked=!!sh.on;
    document.getElementById('mxShLogic').value=sh.logic||'none';
    document.getElementById('mxShCell').value=sh.cell||'';
    document.getElementById('mxShGid').value=sh.gid||'';
    const cc=m.calc||{a:'מחזור הכנסות',op:'−',b:'סך הוצאות (Bizibox)'};
    MX_OPS={A:cc.aSrc||{src:'metric',val:cc.a},B:cc.bSrc||{src:'metric',val:cc.b}};
    document.getElementById('mxSrcA').value=MX_OPS.A.src;
    document.getElementById('mxSrcB').value=MX_OPS.B.src;
    mxOpRender('A'); mxOpRender('B');
    document.getElementById('mxCalcOp').value=cc.op||'−';
    // categories tree
    const sel=new Set(m.cats||[]);
    document.getElementById('mxCats').innerHTML=Object.keys(CF_CATS).map(g=>`
      <div class="cat-grp">
        <label class="cat-row grp"><input type="checkbox" onchange="mxCatGrp(this,'${g}')"> ${g}</label>
        ${CF_CATS[g].map(x=>`<label class="cat-row"><input type="checkbox" data-cat="${x}" ${sel.has(x)?'checked':''} onchange="mxDaily()"> ${x}</label>`).join('')}
      </div>`).join('');
    mxSetKind(); mxDaily();
    document.getElementById('mxOv').classList.add('show');
  }
  function closeMx(){document.getElementById('mxOv').classList.remove('show');}
  function mxSetKind(){
    const k=document.getElementById('mxKind').value;
    document.getElementById('mxPaneManual').style.display=k==='manual'?'':'none';
    document.getElementById('mxPaneCalc').style.display=k==='calc'?'':'none';
    document.getElementById('mxPaneCats').style.display=k==='cats'?'':'none';
    mxSheets();
  }
  function mxSheets(){
    const on=document.getElementById('mxShOn').checked;
    document.getElementById('mxShFields').style.display=on?'':'none';
    document.getElementById('mxActualWrap').style.display=on?'none':'';
  }
  function mxCatGrp(el,g){
    document.querySelectorAll('#mxCats input[data-cat]').forEach(x=>{if(CF_CATS[g].includes(x.dataset.cat))x.checked=el.checked;});
  }
  function mxDaily(){
    const t=parseFloat(document.getElementById('mxTarget').value)||0;
    const cur=document.querySelector('input[name=mxUnit]:checked').value==='₪'?' ₪':'';
    document.getElementById('mxDaily').textContent='יעד יומי: '+fmt(t/WORKDAYS)+cur;
  }
  function mxSave(){
    const kind=document.getElementById('mxKind').value;
    const name=document.getElementById('mxName').value.trim()||'מדד ללא שם';
    const unit=document.querySelector('input[name=mxUnit]:checked').value==='₪'?'₪':'num';
    const noTgt=document.getElementById('mxNoTgt').checked;
    const target=noTgt?0:(parseFloat(document.getElementById('mxTarget').value)||0);
    if(!noTgt&&target<=0){document.getElementById('mxErr').style.display='';return;}
    document.getElementById('mxErr').style.display='none';
    const m=MX_IX>=0?METRICS[MX_IX]:{key:'m'+Date.now()%100000, alerts:[]};
    m.kind=kind; m.name=name; m.unit=unit; m.target=target;
    if(kind==='manual'){
      m.sheets={on:document.getElementById('mxShOn').checked, logic:document.getElementById('mxShLogic').value,
        cell:document.getElementById('mxShCell').value, gid:document.getElementById('mxShGid').value};
      m.actual=m.sheets.on?(m.actual!=null?m.actual:0):(parseFloat(document.getElementById('mxActual').value)||0);
      delete m.calc; delete m.cats;
    }else if(kind==='calc'){
      m.calc={a:mxOpLabel(MX_OPS.A), op:document.getElementById('mxCalcOp').value, b:mxOpLabel(MX_OPS.B),
              aSrc:{...MX_OPS.A}, bSrc:{...MX_OPS.B}};
      delete m.actual; delete m.sheets; delete m.cats;
    }else{
      m.cats=[...document.querySelectorAll('#mxCats input[data-cat]:checked')].map(x=>x.dataset.cat);
      delete m.sheets;
    }
    if(MX_IX<0) METRICS.push(m);
    closeMx(); renderMetrics(); toast(MX_IX>=0?'המדד עודכן':'נוסף מדד חדש');
  }

  /* ---- AI chat (assistant) ---- */
  /* ===== עוזר ה-AI של היועץ =====
     שאלה ותשובה. היועץ שואל על הלקוח, והעוזר עונה מתוך זיכרון הלקוח,
     קבוצת הוואטסאפ, הפגישות והתזרים — חלון החשיבה מראה מאיפה נשלף. */
  const CHAT=[
    {role:'user', t:'יש לי פגישה עם צחי מחר ב-9. מה הכי בוער?', time:'02/07/2026 16:12'},
    {role:'bot', think:'שלפתי "מצב תזרימי" ו"יעדים והסכמות" מזיכרון הלקוח והצלבתי מול יתרות התזרים להיום.',
      t:'<span class="greet">אייל,</span><br>החריגה בלאומי — 6 ימים בפועל, <b>161,198- ₪</b> מול מסגרת 150,000. בפועלים יש 312,400 ₪ חיובי, ובלי העברה ביניהם תהיה חריגה מלאה בעוד 9 ימים.<br>מעבר לזה הוא יבקש עדכון על המסגרת הנוספת של 100 א׳ ₪ בפועלים — יעד 15.7, עדיין בתהליך.',
      time:'16:12 02/07/2026'},

    {role:'user', t:'מה קרה בקבוצה מאז הפגישה האחרונה?', time:'02/07/2026 16:15'},
    {role:'bot', think:'קראתי את קבוצת הוואטסאפ מ-25.6 עד היום והשארתי רק מה שפתוח או משנה תמונה.',
      t:'<span class="greet">אייל,</span><br>34 הודעות, שתיים עדיין בלי מענה: צחי שאל ב-08:40 אם אפשר לדחות את התשלום לספק הגדול, וב-09:05 מתי נוח לך לשיחה.<br>רות העלתה ב-28.6 דפי בנק וחשבוניות יוני. הרשאת חשבון הסליקה עדיין תקועה בבנק שבועיים.',
      time:'16:15 02/07/2026'},

    {role:'user', t:'מה מצב המכרז של חברת האוטובוסים?', time:'02/07/2026 16:19'},
    {role:'bot', think:'שלפתי את האירוע מקטגוריית "אירועים מהותיים" ובדקתי אם הוא מגולם בתחזית התזרים.',
      t:'<span class="greet">אייל,</span><br>זכייה במכרז אספקה לחברת האוטובוסים ירושלים — צפי תוספת <b>1.5 מ׳ ₪</b> במחזור שנתי החל מאוגוסט (נרשם 20.6 משיחת טלפון).<br>ההכנסות האלה עדיין לא צבועות בתחזית, כך שהתמונה לאוגוסט–אוקטובר פסימית מהמציאות הצפויה.',
      time:'16:19 02/07/2026'},

    {role:'user', t:'ממה הוא היה מתוסכל בפעם שעברה?', time:'02/07/2026 16:24'},
    {role:'bot', think:'עברתי על קטגוריית שביעות הרצון וההיסטוריה שלה.',
      t:'<span class="greet">אייל,</span><br>שני דברים עדיין פתוחים: זמן ההמתנה לדוח החודשי, ותשובה כללית מדי שקיבל בצ׳אט על שאלת מע״מ (25.6).<br>טעות הקיטלוג מ-10.6 נסגרה לשביעות רצונו.',
      time:'16:24 02/07/2026'},

    {role:'user', t:'איך הכי נכון לדבר איתו על המסגרת?', time:'02/07/2026 16:31'},
    {role:'bot', think:'הצלבתי את "סגנון תקשורת" ו"מערכת יחסים" מזיכרון הלקוח.',
      t:'<span class="greet">אייל,</span><br>פתח במספרים בלי הקדמות והצג פתרון לצד הבעיה — הוא מאבד סבלנות מפתיחות. קצר, בלי ז׳רגון.<br>לפני הצעה על מימון כדאי לתאם עם רו״ח החיצוני (משרד ברק) — הוא משפיע על ההחלטות האלה.',
      time:'16:31 02/07/2026'},
  ];
  function renderChat(){
    const b=document.getElementById('chatBody');
    b.innerHTML=CHAT.map(m=>{
      const time=`<div class="cmsg-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${m.time}</div>`;
      if(m.role==='user') return `<div class="cmsg user"><div class="user-bubble">${m.t}</div>${time}</div>`;
      const think=m.think
        ? `<div class="think" onclick="this.classList.toggle('open')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 10h8M8 14h5M21 12a8 8 0 0 1-11.5 7.2L3 21l1.8-6.5A8 8 0 1 1 21 12z"/></svg> חלון חשיבה <svg class="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></div><div class="think-content">${m.think}</div>`
        : '';
      return `<div class="cmsg bot">${think}<div class="bot-text">${m.t}</div>${time}</div>`;
    }).join('');
    b.scrollTop=b.scrollHeight;
  }
  function chatSend(){
    const inp=document.getElementById('chatInput'); const v=inp.value.trim(); if(!v) return;
    CHAT.push({role:'user', t:v, time:'עכשיו'});
    CHAT.push({role:'bot', think:'מנתח את השאלה, שולף את הנתונים הרלוונטיים של הלקוח מהמערכות ומחשב את התשובה.',
      t:'<span class="greet">אייל,</span><br>קיבלתי את השאלה — אני בודק את נתוני הלקוח ואחזור עם תשובה מפורטת.', time:'עכשיו'});
    inp.value=''; renderChat();
  }

  /* ---- reports dropdown ---- */
  function toggleRep(e){e.stopPropagation();document.getElementById('repDd').classList.toggle('open');}
  function openReport(name){document.getElementById('repDd').classList.remove('open');toast('נפתח '+name);}
  document.addEventListener('click',function(){const r=document.getElementById('repDd');if(r)r.classList.remove('open');});

