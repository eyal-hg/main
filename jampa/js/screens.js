/* Jampa — scope/persona routing, therapist home (attention focus), patient dashboard, prep brief */
function setRole(r){
  ROLE=r;
  if(RECMODE) exitRec();
  const patientView=(r==='patient');
  document.getElementById('shell').classList.toggle('no-rail',patientView);
  document.querySelector('.switcher').style.display=patientView?'none':'flex';
  document.querySelectorAll('.tab.pro-only').forEach(t=>t.style.display=patientView?'none':'');
  if(patientView) selectPatient(0); else selectHome();
}
function selectHome(){
  SCOPE='home';
  document.getElementById('curName').textContent='כל המטופלים';
  document.getElementById('curHp').textContent='מבט-על';
  document.getElementById('headName').textContent='כל המטופלים';
  document.getElementById('headSub').style.display='none';
  document.getElementById('headStage').style.display='none';
  document.querySelector('.sub-line').textContent='מוקד טיפולי · '+PATIENTS.length+' מטופלים במעקב · נכון להיום';
  document.querySelector('.tabs').style.display='none';
  document.getElementById('btnRec').style.display='none';
  ['viewHome','viewDash','viewMeet','viewChat','viewPrep','viewRec'].forEach(v=>document.getElementById(v).style.display='none');
  document.getElementById('viewHome').style.display='';
  renderRail(); renderHome();
}
function selectPatient(i){
  CUR=i; SCOPE='patient';
  const p=PATIENTS[i];
  document.getElementById('curName').textContent=p.name;
  document.getElementById('curHp').textContent=p.focus;
  document.getElementById('headName').textContent=p.name;
  const sub=document.getElementById('headSub'); sub.style.display=''; sub.textContent=p.focus+' · גיל '+p.age;
  const st=document.getElementById('headStage'); st.style.display=''; st.textContent=p.stage;
  document.querySelector('.sub-line').textContent='פגישה אחרונה '+p.lastSession+' · הבאה: '+p.nextSession;
  document.querySelector('.tabs').style.display=isTherapist()?'flex':'flex';
  document.getElementById('btnRec').style.display=isTherapist()?'flex':'none';
  const tabs=document.querySelectorAll('.tab'); tabs.forEach(x=>x.classList.remove('on')); tabs[0].classList.add('on');
  ['viewHome','viewDash','viewMeet','viewChat','viewPrep','viewRec'].forEach(v=>document.getElementById(v).style.display='none');
  document.getElementById('viewDash').style.display='';
  renderRail(); renderPatient();
}
function switchTab(el,t){
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on')); el.classList.add('on');
  ['viewDash','viewMeet','viewChat','viewPrep'].forEach(v=>document.getElementById(v).style.display='none');
  if(t==='dash'){document.getElementById('viewDash').style.display='';renderPatient();}
  else if(t==='meet'){document.getElementById('viewMeet').style.display='';renderMeetings();}
  else if(t==='chat'){document.getElementById('viewChat').style.display='';renderChat();}
  else{document.getElementById('viewPrep').style.display='';renderPrep();}
}

/* ---- therapist home: attention focus (אותו עיקרון כמו מוקד ההתראות ב-HK) ---- */
function renderHome(){
  const withAtt=PATIENTS.map((p,i)=>({p,i,att:patientAttention(p)}));
  const totAtt=withAtt.reduce((s,x)=>s+x.att.length,0);
  const today=J_MEETINGS.filter(m=>m.date==='היום');
  const pend=withAtt.filter(x=>x.p.pendingSummary).length;
  document.getElementById('homeStrip').innerHTML=
    `<div class="opsq-stat"><div class="n">${PATIENTS.length}</div><div class="l">מטופלים במעקב</div></div>`+
    `<div class="opsq-stat warn"><div class="n">${totAtt}</div><div class="l">דורשים תשומת לב</div></div>`+
    `<div class="opsq-stat"><div class="n">${today.length}</div><div class="l">פגישות היום</div></div>`+
    `<div class="opsq-stat"><div class="n">${pend}</div><div class="l">סיכומים ממתינים לאישור</div></div>`+
    `<div class="opsq-stat accent"><div class="n">${PATIENTS.reduce((s,p)=>s+p.tasksOpen,0)}</div><div class="l">משימות מטופלים פתוחות</div></div>`;
  // health map — כרטיס לכל מטופל
  document.getElementById('homeHealth').innerHTML=withAtt.map(({p,i,att})=>{
    const sev=att.some(a=>a.sev==='high')?'high':(att.length?'mid':'ok');
    return `<div class="hcard ${sev}" onclick="selectPatient(${i})" title="פתיחת ${p.name}">
      <div class="hc-top"><span class="hc-name">${p.name}</span><span class="hc-mood">${moodSpark(p.mood,56,20)}</span></div>
      <div class="hc-bar"><div class="fill ok" style="width:${p.progress}%;background:#7557E3"></div></div>
      <div class="hc-foot"><span>${p.stage}</span><span class="hc-al ${sev}">${att.length?att.length+' לטיפול':'✓ תקין'}</span></div>
    </div>`;}).join('');
  // widgets: attention feed + today meetings
  const feed=withAtt.flatMap(({p,i,att})=>att.map(a=>({...a,i,name:p.name})));
  const sevRank={high:0,mid:1}; feed.sort((a,b)=>sevRank[a.sev]-sevRank[b.sev]);
  const LBL={high:'דחוף',mid:'לבדיקה'};
  document.getElementById('homeBoard').innerHTML=`
    <div class="awdg awdg--coral">
      <div class="awdg-head"><div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l9 16H3l9-16z"/><path d="M12 10v4M12 17h.01"/></svg></div><div class="awdg-t">דורשים תשומת לב</div><span class="awdg-n">${feed.length}</span></div>
      <div class="awdg-body">${feed.map(a=>`
        <div class="afeed ${a.sev}">
          <div class="afeed-ic">${a.ic}</div>
          <div class="afeed-b">
            <div class="afeed-t">${a.name} — ${a.t} <span class="afeed-sev ${a.sev}">${LBL[a.sev]}</span></div>
            <div class="afeed-d">${a.d}</div>
            <div class="afeed-m"><button class="afeed-act" onclick="handleAttention(${a.i},'${a.key}','${a.act}')">${a.act} ←</button></div>
          </div>
        </div>`).join('')||'<div class="al-empty">✅ כל המטופלים במעקב תקין</div>'}</div>
    </div>
    <div class="awdg awdg--navy">
      <div class="awdg-head"><div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div><div class="awdg-t">הפגישות הקרובות</div><span class="awdg-n">${J_MEETINGS.filter(m=>m.status==='upcoming').length}</span></div>
      <div class="awdg-body">${J_MEETINGS.map((m,ix)=>({m,ix})).filter(x=>x.m.status==='upcoming').map(({m,ix})=>`
        <div class="ameet">
          <div class="am-when"><b>${m.date}</b><span>${m.time.split('-')[0]}</span></div>
          <div class="am-b"><div class="am-n">${PATIENTS[m.p].name}</div><div class="am-c">${m.name}</div></div>
          <button class="mt-btn view" onclick="selectPatient(${m.p});setTimeout(renderPrep,0);document.querySelectorAll('.tab').forEach((x,i)=>x.classList.toggle('on',x.textContent.trim()==='הכנה לפגישה'));['viewDash','viewMeet','viewChat'].forEach(v=>document.getElementById(v).style.display='none');document.getElementById('viewPrep').style.display=''">הכנה לפגישה</button>
        </div>`).join('')}</div>
    </div>`;
}
function handleAttention(i,key,act){
  const p=PATIENTS[i];
  if(key==='summary'){selectPatient(i);openSummary(J_MEETINGS.findIndex(m=>m.p===i&&m.status==='summary'));return;}
  if(key==='schedule'){p.needSchedule=false;toast('נשלחו למיכל 3 הצעות זמנים בוואטסאפ');}
  else if(key==='mood'){toast('נשלח צ׳ק-אין עדין בטון הטיפולי שלך');}
  else{toast('נשלחה תזכורת עדינה למשימות');}
  renderHome();renderRail();
}

/* ---- patient dashboard ---- */
function renderPatient(){
  const p=PATIENTS[CUR];
  document.getElementById('pKpis').innerHTML=`
    <div class="kpi"><div class="l">התקדמות במסע הטיפולי</div><div class="n">${p.progress}<span class="cur">%</span></div><div class="foot">${p.stage}</div></div>
    <div class="kpi"><div class="l">מדד מצב רוח · 7 דיווחים</div><div class="n" style="display:flex;align-items:center;gap:10px">${p.mood[p.mood.length-1]}<span class="cur">/8</span> ${moodSpark(p.mood,110,30)}</div><div class="foot">דיווח עצמי יומי בוואטסאפ</div></div>
    <div class="kpi ${p.tasksOpen>=3?'danger':''}"><div class="l">משימות בין-פגישות</div><div class="n">${p.tasksOpen}<span class="cur"> פתוחות</span></div><div class="foot">${p.tasksDone} הושלמו עד כה</div></div>
    <div class="kpi"><div class="l">פגישה הבאה</div><div class="n" style="font-size:20px">${p.nextSession}</div><div class="foot">אחרונה: ${p.lastSession} · לפני ${p.sinceDays} ימים</div></div>`;
  const att=patientAttention(p), LBL={high:'דחוף',mid:'לבדיקה'};
  // ווידג'ט ראשון: למטפל — "דורש תשומת לב"; למטופל — המשימות שלו
  const firstWidget=isTherapist()?`
    <div class="awdg awdg--coral">
      <div class="awdg-head"><div class="awdg-ic">🔔</div><div class="awdg-t">דורש תשומת לב</div><span class="awdg-n">${att.length}</span></div>
      <div class="awdg-body">${att.length?att.map(a=>`
        <div class="afeed ${a.sev}"><div class="afeed-ic">${a.ic}</div>
          <div class="afeed-b"><div class="afeed-t">${a.t} <span class="afeed-sev ${a.sev}">${LBL[a.sev]}</span></div>
          <div class="afeed-d">${a.d}</div>
          <div class="afeed-m"><button class="afeed-act" onclick="handleAttention(${CUR},'${a.key}','${a.act}')">${a.act} ←</button></div></div></div>`).join('')
        :'<div class="al-empty">✅ הכל במעקב תקין</div>'}</div>
    </div>`:`
    <div class="awdg awdg--coral">
      <div class="awdg-head"><div class="awdg-ic">📝</div><div class="awdg-t">המשימות שלי</div><span class="awdg-n">${REC_SUMMARY.tasks.length}</span></div>
      <div class="awdg-body">${REC_SUMMARY.tasks.map(t=>`
        <div class="afeed"><div class="afeed-ic">☑️</div>
          <div class="afeed-b"><div class="afeed-t">${t}</div>
          <div class="afeed-m"><button class="afeed-act" onclick="toast('כל הכבוד! סומן כבוצע')">סימון כבוצע ←</button></div></div></div>`).join('')}</div>
    </div>`;
  document.getElementById('pBoard').innerHTML=firstWidget+`
    <div class="awdg awdg--blue">
      <div class="awdg-head"><div class="awdg-ic">💬</div><div class="awdg-t">ליווי בין פגישות — אחרונים</div><span class="awdg-n">${p.chat.length}</span></div>
      <div class="awdg-body">${p.chat.length?p.chat.slice(-3).map(m=>`
        <div class="afeed"><div class="afeed-ic">${m.from==='jampa'?'🤖':'👤'}</div>
          <div class="afeed-b"><div class="afeed-t">${m.from==='jampa'?'Jampa (אוטומטי)':p.name}</div>
          <div class="afeed-d">${m.t}</div>
          <div class="afeed-m"><span class="afeed-meta">${m.when}</span></div></div></div>`).join('')
        :'<div class="al-empty">אין הודעות עדיין</div>'}</div>
    </div>`;
}

/* ---- prep brief (הכנה לפגישה — בריף 60 שניות) ---- */
function renderPrep(){
  const p=PATIENTS[CUR];
  const sec=(ic,t,items)=>`<div class="awdg" style="margin-bottom:16px">
    <div class="awdg-head"><div class="awdg-ic">${ic}</div><div class="awdg-t">${t}</div></div>
    <div class="awdg-body">${items.map(x=>`<div class="afeed"><div class="afeed-ic">·</div><div class="afeed-b"><div class="afeed-d" style="font-size:13px;color:var(--ink)">${x}</div></div></div>`).join('')}</div></div>`;
  document.getElementById('prepBody').innerHTML=
    `<div class="prep-head">בריף לפגישה עם ${p.name} · ${p.nextSession} <span class="prep-tag">⏱ קריאה של 60 שניות</span></div>`+
    sec('📸','תמונת מצב',J_BRIEF.snapshot)+
    sec('🔁','דפוסים שזוהו',J_BRIEF.patterns)+
    sec('💡','המלצות פתיחה',J_BRIEF.openers);
}
