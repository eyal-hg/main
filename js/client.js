/* HK Dashboard — client extras: AI chat orb, document uploads, operator activity feed */

  /* ---- operator activity (מה המתפעל עשה עבורך) ---- */
  const OPS_LOG=[
    {ic:'check', t:'הושלם תפעול מלא · 32 דק׳', d:'כל הבדיקות עברו — התזרים תקין ומעודכן', when:'אתמול · 09:40'},
    {ic:'ai',    t:'קוטלגו 4 תנועות חדשות', d:'המלצות ה-AI אושרו על ידי מנהל התזרים שלך', when:'אתמול · 09:12'},
    {ic:'doc',   t:'טופלה חשבונית ספק — סונול · 4,820 ₪', d:'שויכה להוצאות דלק ונרשמה בתזרים', when:'30.06'},
    {ic:'send',  t:'נשלח אליך עדכון תזרים שבועי', d:'בוואטסאפ — כולל צפי לסוף החודש', when:'28.06'},
    {ic:'fix',   t:'זוהתה וטופלה כפילות חיוב', d:'Payment טכנולוגיות · 3,540 ₪ — הוסרה מהתזרים', when:'28.06'},
  ];
  const LOG_ICO={
    check:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>',
    ai:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg>',
    doc:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    send:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    fix:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a5 5 0 0 0-6.6 6.6L3 18l3 3 5.1-5.1a5 5 0 0 0 6.6-6.6l-3 3-2-2 3-3z"/></svg>',
  };

  /* ---- client tasks → cashflow manager ---- */
  let CLIENT_TASKS=[
    {t:'עדכון תקציב שיווק ליולי',        st:'prog', when:'30.06', urgent:false},
    {t:'בירור חיוב כפול — Payment',      st:'done', when:'28.06', urgent:false},
    {t:'הוספת הרשאה לרו״ח בדוח החודשי', st:'done', when:'24.06', urgent:false},
  ];
  const CT_ST={new:'נשלחה',prog:'בטיפול',done:'✓ הושלמה'};
  function renderCxTasks(){
    const el=document.getElementById('cxTasks'); if(!el) return;
    el.innerHTML=CLIENT_TASKS.map(k=>`
      <div class="cxf">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3 8-8"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/></svg>
        <span class="cxf-n">${k.t}${k.urgent?' <span class="cxt-urg">דחוף</span>':''}</span>
        <span class="cxf-st ${k.st==='done'?'done':k.st==='prog'?'ops':'ai'}">${CT_ST[k.st]}</span>
        <span class="cxf-w">${k.when}</span>
      </div>`).join('');
  }
  function openCt(){
    const c=CLIENTS[CUR]||{};
    document.getElementById('ctMgr').textContent='המשימה תישלח ל'+(c.mgr||'מנהל התזרים')+' — מנהל התזרים של '+(c.name||'החברה');
    document.getElementById('ctSubj').value='';document.getElementById('ctBody').value='';
    document.querySelector('input[name="ctUrg"][value="reg"]').checked=true;
    document.getElementById('ctErr').style.display='none';
    document.getElementById('ctOv').classList.add('show');
    setTimeout(()=>document.getElementById('ctSubj').focus(),80);
  }
  function closeCt(){document.getElementById('ctOv').classList.remove('show');}
  function ctSend(){
    const subj=document.getElementById('ctSubj').value.trim();
    if(!subj){document.getElementById('ctErr').style.display='';return;}
    const urgent=document.querySelector('input[name="ctUrg"]:checked').value==='urgent';
    const k={t:subj, st:'new', when:'עכשיו', urgent};
    CLIENT_TASKS.unshift(k); renderCxTasks(); refreshHero(); closeCt();
    const c=CLIENTS[CUR]||{};
    toast('המשימה נשלחה ל'+(c.mgr||'מנהל התזרים'));
    setTimeout(()=>{k.st='prog';renderCxTasks();refreshHero();},3200);   // סימולציה: המנהל קיבל והתחיל לטפל
  }

  /* ---- client documents ---- */
  let CLIENT_DOCS=[
    {name:'חשבונית ספק — סונול 06.pdf', when:'30.06', st:'done'},
    {name:'דוח סליקה יוני.xlsx',         when:'28.06', st:'done'},
  ];
  /* כרטיסי שירות — ווидג'טים קבועים: שורה נמוכה (רבע/רבע/חצי) ושורה גבוהה (חצי/חצי).
     מסך חברה אחיד: היועץ רואה בדיוק את מה שהלקוח רואה; המתפעל במצב עבודה — בלעדיהם. */
  /* הפס של בעל העסק — פגישה אחת, שורה אחת. הוא מחליף את וידג'ט
     "הפגישה הבאה" ואת שורת ה-KPI שהייתה מעליו. */
  function renderCliMeetBar(){
    const el=document.getElementById('cliMeetBar'); if(!el) return;
    const isCli=(ROLE==='client1'||ROLE==='clientN');
    if(!isCli||SCOPE!=='client'||CUR_TAB!=='dash'){el.style.display='none';return;}
    el.style.display='';
    const c=CLIENTS[CUR]||{};
    el.innerHTML=`<div class="clibar">
      <span class="clibar-k">הפגישה הבאה</span>
      <b class="clibar-t">סקירת רבעון Q3</b>
      <span class="clibar-when"><b>10 ביולי · 14:00–15:00</b> · בעוד 4 ימים</span>
      <span class="clibar-s">עם ${c.adv||'אילון שחר'} · ${c.firm||'שחר ייעוץ עסקי'} · Zoom</span>
      <span class="clibar-sp"></span>
      <button class="clibar-btn" onclick="toast('נוספה ליומן שלך')">הוספה ליומן</button>
      <button class="clibar-btn gh" onclick="toast('נשלחה בקשה לתיאום מחדש')">תיאום מחדש</button>
    </div>`;
  }
  /* ===== הפס הקבוע של בעל העסק =====
     ארבעה דברים שהוא צריך בלי ללחוץ: כמה יש, מתי נגמר, מה ביקש ומה קורה
     איתו, ואיפה מעלים מסמך. המספרים הם אותם מספרים של הווידג'טים —
     היתרה מ-BAL לפי חברה, והחריגה מהתחזית המאוחדת. */
  const OD={amt:'-289,161', date:'13.7.2026', days:12};
  const CF_ST={ai:['ai','בקיטלוג AI'],ops:['ops','אצל המתפעל'],done:['done','✓ קוטלג']};
  const HICO={
    bal:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 11h20M6 15h4"/></svg>',
    od:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>'};
  let HERO_DONE=false;   /* המשימות שהושלמו מקופלות — בעל העסק רואה מה פתוח */
  function heroTasksHTML(){
    const list=CLIENT_TASKS.filter(k=>HERO_DONE||k.st!=='done');
    if(!list.length) return '<div class="ct-row"><span class="t2">אין משימות פתוחות</span></div>';
    return list.map(k=>`
      <div class="ct-row">
        <span class="ct-st ${k.st}">${CT_ST[k.st]}</span>
        <span class="t2">${k.t}</span>
        ${k.urgent&&k.st!=='done'?'<span class="ur">דחוף</span>':''}
        <span class="w2">${k.when}</span>
      </div>`).join('');
  }
  function heroFilesHTML(){
    return CLIENT_DOCS.map(f=>{
      const [c,l]=CF_ST[f.st]||CF_ST.ai;
      return `<div class="cf-row"><span class="fn">${f.name}</span>
        <span class="fs ${c}">${l}</span><span class="w2">${f.when}</span></div>`;}).join('');
  }
  /* רענון הרשימות בלבד — בלי לצייר מחדש את כל הפס ולאבד את מצב הגרירה */
  function refreshHero(){
    const a=document.getElementById('heroTasks'), b=document.getElementById('heroFiles'),
          n=document.getElementById('heroTaskN');
    if(a) a.innerHTML=heroTasksHTML();
    if(b) b.innerHTML=heroFilesHTML();
    if(n){const k=CLIENT_TASKS.filter(x=>x.st!=='done').length;
      n.textContent=k===0?'הכול סגור':k===1?'פתוחה אחת':k+' פתוחות';}
    const d=document.getElementById('heroDone');
    if(d){const k=CLIENT_TASKS.filter(x=>x.st==='done').length;
      d.style.display=k?'':'none'; d.textContent=(HERO_DONE?'הסתרת ':'')+k+' הושלמו';}
  }
  function heroToggleDone(){HERO_DONE=!HERO_DONE;refreshHero();}
  window.heroToggleDone=heroToggleDone;
  function renderCliHero(){
    const el=document.getElementById('cliHero'); if(!el) return;
    const isCli=(ROLE==='client1'||ROLE==='clientN');
    if(!isCli||SCOPE!=='client'||CUR_TAB!=='dash'){el.style.display='none';return;}
    el.style.display='';
    const c=CLIENTS[CUR]||{};
    const open=CLIENT_TASKS.filter(x=>x.st!=='done').length;
    const openTxt=n=>n===0?'הכול סגור':n===1?'פתוחה אחת':n+' פתוחות';
    el.innerHTML=`<div class="chero">
      <div class="chero-n">
        <div class="chero-f">
          <div class="chero-k">${HICO.bal}יתרה נוכחית</div>
          <div class="chero-mid">
            <div class="chero-v">${BAL[c.name]||'—'}<span class="cur">₪</span></div>
            <div class="chero-s">עו״ש · מסגרת <b>0 ₪</b> · עודכן היום 10:54</div>
          </div>
        </div>
        <div class="chero-f">
          <div class="chero-k">${HICO.od}חריגה צפויה</div>
          <div class="chero-mid">
            <div class="chero-v bad" dir="ltr">${OD.amt}<span class="cur">₪</span></div>
            <div class="chero-s">${OD.date} · עו״ש מאוחד</div>
            <span class="chero-pill">בעוד ${OD.days} ימים</span>
          </div>
        </div>
      </div>
      <div class="chero-a">
        <div class="chero-p">
          <div class="chero-h"><b>המשימות שלי</b>
            <span class="n2" id="heroTaskN">${openTxt(open)}</span>
            <button class="chero-done" id="heroDone" onclick="heroToggleDone()">${CLIENT_TASKS.filter(x=>x.st==='done').length} הושלמו</button><span class="sp"></span>
            <button class="chero-add" onclick="openCt()">＋ משימה חדשה</button></div>
          <div class="chero-list" id="heroTasks">${heroTasksHTML()}</div>
        </div>
        <div class="chero-p">
          <div class="chero-h"><b>העלאת מסמכים</b><span class="sp"></span></div>
          <div class="chero-drop" id="cxDrop"
               ondragover="event.preventDefault();this.classList.add('over')"
               ondragleave="this.classList.remove('over')"
               ondrop="cxDrop(event)" onclick="cxPick()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>
            <b>בחירת קובץ</b><span>או גררו לכאן</span></div>
          <div class="chero-files" id="heroFiles">${heroFilesHTML()}</div>
        </div>
      </div>
    </div>`;
  }
  function renderClientRow(){
    const el=document.getElementById('clientRow'); if(!el) return;
    /* כרטיסי השירות ירדו לבעל העסק — נשארים רק הווידג'טים הפיננסיים */
    if(ROLE==='client1'||ROLE==='clientN'){el.style.display='none';renderCliMeetBar();renderCliHero();return;}
    const show=(SCOPE==='client')&&(typeof ROLE==='undefined'||ROLE!=='manager');
    if(!show){el.style.display='none';return;}
    el.style.display='';
    const c=CLIENTS[CUR]||{};
    const CX_ICONS={
      meet:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
      rep:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',
      docs:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>',
      task:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3 8-8"/><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/></svg>',
      ops:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'};
    const cards=[
      {k:'meet', cls:'w25 h-low', icc:'meet', t:'הפגישה הבאה', sub:'עם אילון שחר · יועץ HK', badge:'10 יולי · 14:00', body:`
        <div class="cx-meet">
          <div class="cxm-date"><b>10</b><span>יולי</span></div>
          <div class="cxm-b">
            <div class="cxm-t">סקירת רבעון Q3</div>
            <div class="cxm-d">עם אילון שחר · יועץ HK</div>
            <div class="cxm-meta"><span dir="ltr">14:00–15:00</span><span class="cxm-zoom">Zoom</span><span>בעוד 4 ימים</span></div>
          </div>
        </div>
        <div class="cxm-actions">
          <button class="cxm-btn primary" onclick="toast('הפגישה נוספה ליומן שלך')">הוספה ליומן</button>
          <button class="cxm-btn" onclick="toast('בקשת תיאום מחדש נשלחה לאילון')">תיאום מחדש</button>
        </div>`},
      {k:'rep', cls:'w25 h-low', icc:'rep', t:'דוחות', sub:'מופקים מנתוני התזרים העדכניים', badge:'2 דוחות', body:`
        <div class="cx-files">
          <div class="cxf">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>
            <span class="cxf-n">תזרים חודשי</span><span class="cxf-w">יוני 2026</span>
            <button class="cx-dl" onclick="toast('תזרים חודשי — הופק ויורד כ-PDF')">הורדה</button>
          </div>
          <div class="cxf">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/><path d="M17 7h2v2"/></svg>
            <span class="cxf-n">תזרים חודשי עתידי</span><span class="cxf-w">6 חודשים קדימה</span>
            <button class="cx-dl" onclick="toast('תזרים עתידי — הופק ויורד כ-PDF')">הורדה</button>
          </div>
        </div>`},
      {k:'docs', cls:'w50 h-low', icc:'docs', t:'העלאת מסמכים', sub:(ROLE==='client1'||ROLE==='clientN')?'נשלחים לקיטלוג ב-HK':'נשלחים לקיטלוג אצל המתפעל', badge:CLIENT_DOCS.length+' קבצים', body:`
        <div class="cx-docrow">
          <div class="cx-drop" id="cxDrop"
               ondragover="event.preventDefault();this.classList.add('over')"
               ondragleave="this.classList.remove('over')"
               ondrop="cxDrop(event)"
               onclick="cxPick()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></svg>
            <b>גררו קובץ לכאן</b> או לחצו לבחירה
            <span>PDF · Excel · תמונות</span>
          </div>
          <div class="cx-files cx-scroll" id="cxFiles"></div>
        </div>`},
      {k:'task', cls:'w50 h-high', icc:'task',
       t:(ROLE==='client1'||ROLE==='clientN')?'מה ביקשתי מ-HK':'משימות למנהל התזרים', sub:c.mgr||'', badge:CLIENT_TASKS.filter(x=>x.st!=='done').length+' פתוחות', hbtn:'<button class="cx-add" onclick="openCt()">+ משימה חדשה</button>', body:`
        <div class="cx-files cx-scroll" id="cxTasks" style="padding:4px 16px 12px"></div>`},
      {k:'ops', cls:'w50 h-high', icc:'ops',
       t:(ROLE==='client1'||ROLE==='clientN')?'מה HK עשתה עבורך החודש':'מה המתפעל עשה עבורך', sub:c.mgr||'', badge:OPS_LOG.length+' פעולות', body:`
        <div class="cx-log cx-scroll">
          ${OPS_LOG.map(l=>`
            <div class="cxl">
              <span class="cxl-ic ${l.ic}">${LOG_ICO[l.ic]}</span>
              <div class="cxl-b"><div class="cxl-t">${l.t}</div><div class="cxl-d">${l.d}</div></div>
              <span class="cxl-w">${l.when}</span>
            </div>`).join('')}
        </div>`},
    ];
    el.innerHTML=cards.map(cd=>`<div class="cxcard ${cd.cls}">
        <div class="cx-head">
          <div class="cx-ic ${cd.icc}">${CX_ICONS[cd.k]}</div>
          <div class="awdg-tt"><div class="awdg-t">${cd.t}</div><div class="awdg-sub">${cd.sub}</div></div>
          ${cd.hbtn||''}
          <span class="cx-badge">${cd.badge}</span>
        </div>
        <div class="cx-body">${cd.body}</div>
      </div>`).join('');
    renderCxFiles();
    renderCxTasks();
  }
  function renderCxFiles(){
    const el=document.getElementById('cxFiles'); if(!el) return;
    el.innerHTML=CLIENT_DOCS.map(f=>`
      <div class="cxf">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
        <span class="cxf-n">${f.name}</span>
        <span class="cxf-st ${f.st}">${f.st==='ai'?'<span class="ai-spin"></span> בקיטלוג AI':f.st==='ops'?((ROLE==='client1'||ROLE==='clientN')?'אצל HK':'אצל המתפעל'):'✓ קוטלג'}</span>
        <span class="cxf-w">${f.when}</span>
      </div>`).join('');
  }
  function cxAdd(name){
    const f={name, when:'עכשיו', st:'ai'};
    CLIENT_DOCS.unshift(f); renderCxFiles(); refreshHero();
    toast('הקובץ הועלה — נשלח לקיטלוג AI');
    setTimeout(()=>{f.st='ops';renderCxFiles();refreshHero();},2600);   // סימולציה: AI סיים → עבר למתפעל
  }
  function cxDrop(e){
    e.preventDefault(); document.getElementById('cxDrop').classList.remove('over');
    const f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
    cxAdd(f?f.name:'מסמך חדש.pdf');
  }
  const CX_DEMO=['חשבונית ספק — יולי.pdf','אישור ניכוי מס.pdf','דוח מכירות שבועי.xlsx'];
  let cxDemoIx=0;
  function cxPick(){cxAdd(CX_DEMO[cxDemoIx++%CX_DEMO.length]);}

  /* ---- AI chat orb (הלקוח שואל על החברה הנוכחית) ---- */
  /* העוזר עובד פר-חברה — עונה רק על החברה שנבחרה למעלה */
  /* שאלות פיננסיות על המספרים — לא על המערכת. זה מה שבעל עסק באמת שואל. */
  const AI_CHIPS=['מה מגמת ההכנסות?','מתי צפויה חריגה?','מה תהיה היתרה בעוד שבועיים?','כמה קניתי מסונול החודש?'];
  const BAL={'אנרגי אינטרנשיונל':'1,029,208','אנרגי גולני':'312,400','מטעי גבעון':'568,900','משה עובד':'174,300','רימון יצחק':'421,050'};
  function aiAnswer(q){
    const c=CLIENTS[CUR];
    if(q.includes('מצב')){
      const bad=(c.budgetPct||0)>100;
      return {t:'הנה תמונת המצב של '+c.name+' — יתרה נוכחית וסטטוס תקציב:',
        cards:`<div class="aic ${bad?'bad':''}"><b>${c.name}</b><span dir="ltr">${BAL[c.name]||'—'} ₪</span><i>${bad?'חריגת תקציב':'תקין'}</i></div>
               <div class="aic"><b>ניצול תקציב חודשי</b><span dir="ltr">${c.budgetPct||0}%</span><i>${bad?'מעל היעד':'בתוך היעד'}</i></div>`};
    }
    if(q.includes('מגמת')||q.includes('הכנסות')){
      return {t:'ההכנסות עלו מ-1.96 מ׳ ₪ באפריל ל-3.58 מ׳ ₪ ביוני, וירדו ל-2.90 מ׳ ₪ ביולי. סה״כ בארבעת החודשים הסגורים 11.47 מ׳ ₪ — מגמה עולה עם חודש אחד חריג כלפי מטה.',
        cards:'<div class="aic"><b>הכנסות · 4 חודשים סגורים</b><span dir="ltr">11,467,390 ₪</span><i>שיא ביוני · 3.58 מ׳</i></div>'};
    }
    if(q.includes('יתרה')||q.includes('שבועיים')){
      return {t:'התחזית לעוד שבועיים: היתרה יורדת מ-1,029,208 ₪ ל-כ-740,000 ₪, בעיקר בגלל תשלום ספק גדול (210k) שמתוכנן ל-14.7 ומשכורות ב-10.7. אחרי זה היא מתאוששת עם גביית הסליקה.',
        cards:'<div class="aic"><b>יתרה צפויה · 16.07</b><span dir="ltr">~740,000 ₪</span><i>מ-1,029,208 ₪ היום</i></div>'};
    }
    if(q.includes('קניתי')||q.includes('ספק')||q.includes('סונול')){
      return {t:'מסונול נרשמה החודש חשבונית אחת — 4,820 ₪ ב-30.06, ששויכה להוצאות דלק. היא כבר בתזרים ובקיטלוג.',
        cards:'<div class="aic"><b>סונול · יוני</b><span dir="ltr">4,820 ₪</span><i>חשבונית אחת · הוצאות דלק</i></div>'};
    }
    if(q.includes('חריגה')||q.includes('יולי')){
      return {t:'צפויה חריגה של ‎-289,161 ₪ ב-13.7 בעו״ש המאוחד. הגורם המרכזי: הוצאות השכר חרגו ב-14% מהתקציב החודשי, ובמקביל תשלום ספק גדול (210k) מתוכנן ל-14.7. ב-HK כבר קיבלו התראה — מומלץ לתאם שיחה עם היועץ.',
        cards:'<div class="aic bad"><b>חריגה צפויה</b><span dir="ltr">-289,161 ₪</span><i>13.7.2026 · בעוד 12 ימים</i></div>'};
    }
    if(q.includes('מתפעל')||q.includes('HK')){
      return {t:'השבוע ב-HK הושלם תפעול מלא (32 דק׳), קוטלגו 4 תנועות חדשות, טופלה חשבונית סונול, נשלח אליך עדכון תזרים והוסר חיוב כפול של 3,540 ₪. הפירוט המלא בכרטיס "מה HK עשתה עבורך החודש".'};
    }
    if(q.includes('פגישה')){
      return {t:'הפגישה הבאה שלך: סקירת רבעון Q3 עם אילון שחר ב-10.07 בשעה 14:00. רוצה שאשלח תזכורת יום לפני?'};
    }
    return {t:'שאלה טובה. על בסיס נתוני התזרים של '+c.name+': היתרה הנוכחית '+(BAL[c.name]||'—')+' ₪, התקציב בניצול '+(c.budgetPct||0)+'%. אפשר לשאול אותי על יתרות, חריגות, תקציב, מסמכים או פגישות של החברה.'};
  }
  function aiToggle(){
    const p=document.getElementById('aiPanel');
    const open=p.classList.toggle('show');
    // שיחה חדשה בפתיחה ראשונה או אחרי מעבר חברה — ההקשר תמיד של החברה הנוכחית
    if(open&&p.dataset.co!==String(CUR)){p.dataset.co=String(CUR);aiGreet();}
  }
  function aiGreet(){
    const c=CLIENTS[CUR];
    const sub=document.getElementById('aiHeadSub'); if(sub) sub.textContent=c.name+' · נתוני אמת מ-Bizibox';
    document.getElementById('aiBody').innerHTML=`
      <div class="aim bot"><div class="aim-b">היי 👋 אני העוזר הפיננסי של ${c.name}. אני מכיר את התזרים, התקציב, המסמכים והפגישות של החברה. מה תרצה לדעת?</div></div>
      <div class="ai-chips">${AI_CHIPS.map(s=>`<button class="ai-chip" onclick="aiAsk('${s}')">${s}</button>`).join('')}</div>`;
  }
  function aiSend(){
    const inp=document.getElementById('aiInput'); const v=inp.value.trim(); if(!v) return;
    inp.value=''; aiAsk(v);
  }
  function aiAsk(q){
    const body=document.getElementById('aiBody');
    body.insertAdjacentHTML('beforeend',`<div class="aim user"><div class="aim-b">${q}</div></div>
      <div class="aim bot" id="aiTyping"><div class="aim-b"><span class="ai-dots"><i></i><i></i><i></i></span></div></div>`);
    body.scrollTop=body.scrollHeight;
    const ans=aiAnswer(q);
    setTimeout(()=>{
      const tEl=document.getElementById('aiTyping'); if(!tEl) return;
      tEl.removeAttribute('id');
      const bub=tEl.querySelector('.aim-b'); bub.innerHTML='';
      // הקלדה חיה — תו-תו, ואז כרטיסי הנתונים
      let i=0; const txt=ans.t;
      const tick=setInterval(()=>{
        bub.textContent=txt.slice(0,++i);
        body.scrollTop=body.scrollHeight;
        if(i>=txt.length){
          clearInterval(tick);
          if(ans.cards) bub.insertAdjacentHTML('afterend',`<div class="aic-row">${ans.cards}</div>`);
          body.scrollTop=body.scrollHeight;
        }
      },12);
    },900);
  }
