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
    // ללקוחות אין עריכת לוח — HK מגדירה את הלוח עבורם
    const canEdit=!(ROLE==='client1'||ROLE==='clientN');
    document.getElementById('wbActions').style.display=(showBoard&&canEdit)?'flex':'none';
    document.getElementById('crBar').style.display=(inPortfolio && pView==='board')?'':'none';
    document.getElementById('opsqStatus').style.display=showQueue?'flex':'none';
    if(inPortfolio){
      document.querySelector('.sub-line').textContent=
        (pView==='queue'?'מבט-על תפעולי':pView==='alerts'?'מוקד התראות · חברות שדורשות טיפול':'מבט מאוחד')
        +' · '+CLIENTS.length+' חברות במעקב · נכון ל-2.7.2026';
    }
    updateOpsBtn();
    if(showQueue) renderOpsQueue(); else if(showAlerts) renderAlerts(); else renderBoard();
    renderCoAlerts();
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
    document.getElementById('wbActions').style.display = (t==='dash'&&ROLE!=='client1'&&ROLE!=='clientN') ? 'flex' : 'none';
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
    {key:'budget',   name:'עמידה בתקציב', kind:'cats', unit:'%', target:100, cats:['כל קטגוריות ההוצאות'],
     alerts:[{on:true, mode:'pct', dir:'above', th:100, sev:'high'},
             {on:true, mode:'pct', dir:'above', th:95,  sev:'mid'}]},
    {key:'salesclr', name:'הכנסות ממכירות - סליקה', kind:'cats', unit:'₪', target:90000, actual:99642,
     cats:['הכנסות ממכירות - סליקה'], alerts:[{on:false, mode:'pct', dir:'below', th:75, sev:'mid'}]},
    {key:'cfprofit', name:'רווח / הפסד תזרימי', kind:'calc', unit:'₪', target:30000,
     calc:{a:'מחזור הכנסות', op:'−', b:'סך הוצאות (Bizibox)'}, alerts:[{on:true, mode:'pct', dir:'below', th:80, sev:'mid'}]},
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
    return {txt:'—'};
  }
  function srcLine(m){
    if(m.kind==='manual') return m.sheets&&m.sheets.on
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e8a4c" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg> Google Sheets · ${SHEET_LOGIC_SHORT[m.sheets.logic]||''} · תא ${m.sheets.cell}`
      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> הזנה ידנית — מתעדכן כל חודש`;
    if(m.kind==='calc') return `<b>ƒ</b> ${m.calc.a} <b>${m.calc.op}</b> ${m.calc.b} · מחושב אוטומטית`;
    if(m.kind==='cats') return `<span class="src-bz">Bizibox</span> נתוני אמת · ${(m.cats||[]).join(' + ')}`;
    return 'מתעדכן אוטומטית מיומן הפגישות';
  }
  function renderMetrics(){
    const c=CLIENTS[typeof CUR==='number'?CUR:0]||{};
    document.getElementById('mcards').innerHTML=METRICS.map((m,i)=>{
      const k=KIND_META[m.kind]||KIND_META.auto, d=mDisp(m,c);
      const nAl=(m.alerts||[]).filter(r=>r.on).length;
      const daily=(m.target>0&&m.unit!=='%')?`יעד יומי: <b>${fmt(m.target/WORKDAYS)}${m.unit==='₪'?' ₪':''}</b>`:'';
      const bar=d.pct!=null?`
        <div class="mc-bar"><div class="mc-fill ${d.bad?'bad':''}" style="width:${Math.min(100,Math.max(0,d.pct))}%"></div>
          <div class="mc-bubble" style="left:${Math.min(97,Math.max(3,d.pct))}%">${d.pct}%</div></div>`:'';
      const val=d.big!=null
        ? `<div class="mc2-val ${d.bad?'bad':''}">${d.big}<span class="mc2-sub">${d.sub||''}</span></div>`
        : `<div class="mc2-val ${d.bad?'bad':''} ${d.muted?'mut':''}" style="font-size:17px">${d.txt}</div>`;
      return `<div class="mcard mcard2">
        <div class="mc2-top">
          <span class="mkind ${k.cls}">${k.ic} ${k.lbl}</span>
          <div class="mc-act">
            <button class="mbell ${nAl?'on':''}" title="${nAl?nAl+' התראות פעילות — לחצו לעריכה':'הגדרת התראות'}" onclick="openAlertCfg(${i})">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
              ${nAl?`<span class="mbell-dot n">${nAl}</span>`:''}
            </button>
            ${m.kind==='auto'?'':`<button class="mbell" title="עריכת המדד" onclick="openMx(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg></button>`}
            <button class="mbell del" title="מחיקה" onclick="delMetric(${i})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
          </div>
        </div>
        <div class="mc2-name" onclick="${m.kind==='auto'?'':`openMx(${i})`}">${m.name}</div>
        ${val}${bar}
        <div class="mc2-foot"><span class="mc2-src">${srcLine(m)}</span><span>${daily}</span></div>
      </div>`;
    }).join('');
  }
  function setDays(v){WORKDAYS=parseInt(v)||22;renderMetrics();}
  function delMetric(i){METRICS.splice(i,1);renderMetrics();toast('המדד נמחק');}

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
  function openMx(i){
    MX_IX=(i==null?-1:i);
    const m=MX_IX>=0?METRICS[MX_IX]:{kind:'manual',unit:'₪',target:'',actual:'',sheets:{on:false,logic:'none',cell:'',gid:''},calc:{a:'מחזור הכנסות',op:'−',b:'סך הוצאות (Bizibox)'},cats:[]};
    document.getElementById('mxTitle').textContent=MX_IX>=0?'עריכת מדד':'מדד חדש';
    document.getElementById('mxKind').value=m.kind==='auto'?'manual':m.kind;
    document.getElementById('mxName').value=MX_IX>=0?m.name:'';
    document.querySelector(`input[name=mxUnit][value="${m.unit==='num'?'num':'₪'}"]`).checked=true;
    document.getElementById('mxTarget').value=m.target||'';
    document.getElementById('mxActual').value=m.actual!=null?m.actual:'';
    const sh=m.sheets||{on:false,logic:'none',cell:'',gid:''};
    document.getElementById('mxShOn').checked=!!sh.on;
    document.getElementById('mxShLogic').value=sh.logic||'none';
    document.getElementById('mxShCell').value=sh.cell||'';
    document.getElementById('mxShGid').value=sh.gid||'';
    const cc=m.calc||{a:'מחזור הכנסות',op:'−',b:'סך הוצאות (Bizibox)'};
    const opts=['מחזור הכנסות','סך הוצאות (Bizibox)','סך הליטרים','תחזית תזרים','מסגרת אשראי','עמידה בתקציב'];
    document.getElementById('mxCalcA').innerHTML=opts.map(o=>`<option ${o===cc.a?'selected':''}>${o}</option>`).join('');
    document.getElementById('mxCalcB').innerHTML=opts.map(o=>`<option ${o===cc.b?'selected':''}>${o}</option>`).join('');
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
    const target=parseFloat(document.getElementById('mxTarget').value)||0;
    if(target<=0){document.getElementById('mxErr').style.display='';return;}
    document.getElementById('mxErr').style.display='none';
    const m=MX_IX>=0?METRICS[MX_IX]:{key:'m'+Date.now()%100000, alerts:[]};
    m.kind=kind; m.name=name; m.unit=unit; m.target=target;
    if(kind==='manual'){
      m.sheets={on:document.getElementById('mxShOn').checked, logic:document.getElementById('mxShLogic').value,
        cell:document.getElementById('mxShCell').value, gid:document.getElementById('mxShGid').value};
      m.actual=m.sheets.on?(m.actual!=null?m.actual:0):(parseFloat(document.getElementById('mxActual').value)||0);
      delete m.calc; delete m.cats;
    }else if(kind==='calc'){
      m.calc={a:document.getElementById('mxCalcA').value, op:document.getElementById('mxCalcOp').value, b:document.getElementById('mxCalcB').value};
      delete m.actual; delete m.sheets; delete m.cats;
    }else{
      m.cats=[...document.querySelectorAll('#mxCats input[data-cat]:checked')].map(x=>x.dataset.cat);
      delete m.sheets;
    }
    if(MX_IX<0) METRICS.push(m);
    closeMx(); renderMetrics(); toast(MX_IX>=0?'המדד עודכן':'נוסף מדד חדש');
  }

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

