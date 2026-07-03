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
      sub.textContent='תיק לקוחות · 12 חברות · 4 בחריגה היום · נכון ל-1.7.2026';
      document.getElementById('railPortfolio').classList.add('on');
      document.querySelectorAll('.cli.on').forEach(x=>x.classList.remove('on'));
    }else{
      hp.style.display=''; st.style.display=''; acts.style.display='flex'; acts.style.visibility='visible';
      if(kpi)kpi.style.display='';
      sub.textContent='חברת ייעוץ · '+CLIENTS[CUR].mgr+' · סונכרן אוטומטית 1.7.2026 10:54';
      document.getElementById('railPortfolio').classList.remove('on');
    }
    // force dashboard tab
    const tabs=document.querySelectorAll('.tab');
    tabs.forEach(x=>x.classList.remove('on')); tabs[0].classList.add('on');
    OPSMODE=false; document.body.classList.remove('ops-on');
    document.getElementById('opsView').style.display='none';
    ['viewDash','viewMetrics','viewChat','viewMeetings','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    document.getElementById('viewDash').style.display='';
    document.querySelector('.tabs').style.display = (s==='portfolio') ? 'none' : '';
    document.getElementById('wbActions').style.display='flex';
    // portfolio sub-view routing by persona:
    //  manager (HK) → תור תפעול / מוקד התראות (toggle)   advisor → מוקד התראות   clientN → מבט מאוחד
    const inPortfolio=(s==='portfolio');
    let pView='board';
    if(inPortfolio){
      if(isOperator) pView=(MGR_VIEW==='ops')?'queue':'alerts';
      else if(ROLE==='clientN') pView='board';
      else pView='alerts';
    }
    const showQueue=inPortfolio && pView==='queue';
    const showAlerts=inPortfolio && pView==='alerts';
    const showBoard = !inPortfolio || pView==='board';
    document.getElementById('mgrToggle').style.display=(inPortfolio && isOperator)?'':'none';
    document.querySelectorAll('#mgrToggle .mseg').forEach((el,ix)=>el.classList.toggle('on',(ix===0)===(MGR_VIEW==='ops')));
    document.getElementById('opsQueueView').style.display=showQueue?'':'none';
    document.getElementById('alertsView').style.display=showAlerts?'':'none';
    document.getElementById('wboard').style.display=showBoard?'':'none';
    document.getElementById('wbActions').style.display=showBoard?'flex':'none';
    document.getElementById('crBar').style.display=(inPortfolio && pView==='board')?'':'none';
    document.getElementById('opsqStatus').style.display=showQueue?'flex':'none';
    if(inPortfolio){
      document.querySelector('.sub-line').textContent=
        (pView==='queue'?'מבט-על תפעולי':pView==='alerts'?'מוקד התראות · חברות שדורשות טיפול':'מבט מאוחד')
        +' · '+CLIENTS.length+' חברות במעקב · נכון ל-2.7.2026';
    }
    updateOpsBtn();
    if(showQueue) renderOpsQueue(); else if(showAlerts) renderAlerts(); else renderBoard();
  }
  function selectPortfolio(){setScope('portfolio');}
  let MGR_VIEW='ops';
  function setMgrView(v){MGR_VIEW=v;setScope('portfolio');}

  /* ---- chat drawer ---- */
  function openChat(){
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

  /* ---- section tabs ---- */
  function switchTab(el,t){
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
    el.classList.add('on');
    ['viewDash','viewMetrics','viewChat','viewMeetings','viewOther'].forEach(v=>document.getElementById(v).style.display='none');
    if(t==='dash'){document.getElementById('viewDash').style.display='';}
    else if(t==='metrics'){document.getElementById('viewMetrics').style.display='';renderMetrics();}
    else if(t==='chat'){document.getElementById('viewChat').style.display='';renderChat();}
    else if(t==='meetings'){document.getElementById('viewMeetings').style.display='';renderMeetings();}
    else{document.getElementById('viewOther').style.display='';document.getElementById('otherName').textContent=el.textContent;}
    document.querySelector('.db-actions').style.visibility = t==='dash' ? 'visible' : 'hidden';
    document.getElementById('wbActions').style.display = t==='dash' ? 'flex' : 'none';
  }

  /* ---- metrics definition ---- */
  let WORKDAYS=22;
  // metrics carry their own alert rule — defined here, read by the alerts focus.
  // per-company values live on CLIENTS[i].metrics (+ c.debt). key maps a metric to its value.
  const METRICS=[
    {name:'עמידה בתקציב',        key:'budget',    unit:'%',    goal:'low',  type:'עצמאי', alert:{on:true, cmp:'over',       th:100, near:95}},
    {name:'חריגה צפויה בעו״ש',   key:'overdraft', unit:'ימים', goal:'low',  type:'עצמאי', alert:{on:true, cmp:'withinDays', th:14}},
    {name:'חוב פתוח לגבייה',     key:'debt',      unit:'₪',    goal:'low',  type:'עצמאי', alert:{on:true, cmp:'over',       th:0}},
    {name:'סך הליטרים מול יעד',  key:'liters',    unit:'%',    goal:'high', type:'מחובר', alert:{on:true, cmp:'belowPct',   th:85}},
    {name:'רווח תזרימי מול יעד', key:'cfprofit',  unit:'%',    goal:'high', type:'עצמאי', alert:{on:true, cmp:'belowPct',   th:80}},
  ];
  const fmt=n=>Math.round(n).toLocaleString('en-US');
  const CMP_TXT={over:'מעל',withinDays:'בתוך',belowPct:'מתחת ל-'};
  function metricCur(m,c){
    const v=mVal(c,m.key);
    if(m.key==='debt')      return (v||0)>0 ? (v).toLocaleString('en-US')+' ₪' : 'אין חוב פתוח';
    if(m.key==='overdraft') return v>0 ? v+' ימים לחריגה' : 'אין חריגה צפויה';
    if(v==null) return '—';
    return v+'% '+(m.key==='budget'?'מהתקציב':'מהיעד');
  }
  function renderMetrics(){
    const c=CLIENTS[typeof CUR==='number'?CUR:0]||{};
    document.getElementById('mcards').innerHTML=METRICS.map((m,i)=>{
      const a=m.alert||{on:false,cmp:'over',th:0};
      const suffix = a.cmp==='withinDays'?'ימים':(a.cmp==='belowPct'?'% מהיעד':m.unit);
      const breach = a.on && evalMetric(m,c);
      const opt=v=>`<option ${m.type===v?'selected':''}>${v}</option>`;
      return `<div class="mcard">
        <div class="mc-head">
          <div class="mc-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/></svg>
            <span class="mc-name" contenteditable="true" onblur="setName(${i},this.textContent)">${m.name}</span>
          </div>
          <div class="mc-cur ${breach?'bad':''}" title="ערך נוכחי · ${c.name||''}">${metricCur(m,c)}</div>
          <div class="mc-act">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="delMetric(${i})" title="מחיקה"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
          </div>
        </div>
        <div class="mc-alert ${a.on?'':'off'}">
          <label class="mc-tog" title="הפעלת התראה"><input type="checkbox" ${a.on?'checked':''} onchange="setMetricAlertOn(${i})"><span></span></label>
          <div class="mc-arow"><span class="mc-albl">התראה</span>התרע כאשר ${CMP_TXT[a.cmp]||''} <input class="mc-th" type="number" value="${a.th}" onchange="setMetricAlertTh(${i},this.value)"> ${suffix}
            <select class="mc-type" onchange="setType(${i},this.value)">${opt('עצמאי')}${opt('מחובר')}${opt('מצטבר')}</select></div>
        </div>
      </div>`;
    }).join('');
  }
  function setType(i,v){METRICS[i].type=v;}
  function setName(i,v){METRICS[i].name=v.trim()||'מדד ללא שם';}
  function setDays(v){WORKDAYS=parseInt(v)||22;renderMetrics();}
  function setMetricAlertOn(i){METRICS[i].alert.on=!METRICS[i].alert.on;renderMetrics();}
  function setMetricAlertTh(i,v){METRICS[i].alert.th=parseFloat(String(v).replace(/[^\d.-]/g,''))||0;renderMetrics();}
  function delMetric(i){METRICS.splice(i,1);renderMetrics();toast('המדד נמחק');}
  function addMetric(){METRICS.push({name:'מדד חדש',key:'m'+METRICS.length,unit:'%',goal:'high',type:'עצמאי',alert:{on:true,cmp:'belowPct',th:90}});renderMetrics();toast('נוסף מדד חדש');}

  /* ---- AI chat (assistant) ---- */
  const CHAT=[
    {role:'user', t:'כמה שילמתי על שכר דירה ברבעון האחרון?', time:'31/03/2026 15:33'},
    {role:'bot', think:'שלפתי את תנועות סעיף "שכר דירה" מ-1.1.2026 עד 31.3.2026 ממערכת הנהלת החשבונות, סיננתי לפי הספק וחיברתי את הסכומים.',
      t:'<span class="greet">עומרי,</span><br>לגבי חזות קריספין, בבדיקה שערכנו במערכות, לא נמצאו תשלומים שבוצעו אליה.<br>באשר לתשלומי השכירות בין יולי לאוקטובר 2025, הסכום הכולל ששולם בתקופה זו עומד על <b>46 ₪</b>.',
      time:'15:34 31/03/2026'},
    {role:'user', t:'כמה שילמתי על ביטוחים חודש שעבר?', time:'19/04/2026 13:33'},
    {role:'bot', think:'חיפשתי תנועות בסעיף "ביטוחים" לחודש מרץ 2026 בטווח 1.3–31.3 — לא נמצאו רשומות תואמות במקור הנתונים הזמין.',
      t:'<span class="greet">אייל,</span><br>לגבי שאלתך כמה שילמת על ביטוחים בחודש שעבר (מרץ 2026) – המידע הספציפי הזה אינו זמין כרגע במערכת.<br>אם תרצה, אוכל לבדוק זאת שוב בדרך אחרת.',
      time:'13:33 19/04/2026'},
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

