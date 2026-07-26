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

/* ---- therapist home: דיי-בר + באנר תשומת-לב + טור הודעות (הדפוסים מדשבורד HK) ---- */
function jChatFrom(i){
  selectPatient(i);
  const t=[...document.querySelectorAll('.tab')].find(x=>x.textContent.trim()==="צ'אט וליווי");
  if(t) switchTab(t,'chat');
}
function jQReply(inp,i){
  const v=inp.value.trim(); if(!v) return;
  PATIENTS[i].chat.push({from:'jampa',t:v,when:'עכשיו'});
  PATIENTS[i].unread=0; inp.value='';
  toast('נשלח ל'+PATIENTS[i].name+' בוואטסאפ');
  renderRail(); if(SCOPE==='home') renderHome();
}
function renderJMsgs(){
  const el=document.getElementById('jMsgCol'); if(!el) return;
  const withMsg=PATIENTS.map((p,i)=>({p,i})).filter(x=>x.p.unread>0);
  const tot=withMsg.reduce((s,x)=>s+x.p.unread,0);
  el.innerHTML=`<div class="jmsgs">
    <div class="jmsgs-h">הודעות מטופלים <span>${tot?tot+' שלא נענו · מ-'+withMsg.length+' מטופלים':'הכל נענה ✓'}</span></div>
    ${withMsg.map(({p,i})=>{
      const last=[...p.chat].reverse().find(m=>m.from==='user');
      return `<div class="oqs-chat">
        <div class="oqs-chat-h"><b>${p.name}</b><span>${p.unread} שלא נענו</span></div>
        <div class="oqs-bub"><div class="oqs-bub-h">${p.name} · ${last?last.when:'היום'}</div>${last?last.t:'שלום, רציתי לעדכן אותך…'}</div>
        <div class="oqs-reply"><input placeholder="תגובה בטון הטיפולי שלך — בוואטסאפ…" onkeydown="if(event.key==='Enter')jQReply(this,${i})"><button class="oqs-send" onclick="jQReply(this.previousElementSibling,${i})">שליחה</button></div>
        <div class="oqs-openchat" onclick="jChatFrom(${i})">לשיחה המלאה ←</div>
      </div>`;}).join('')||'<div class="jmsgs-empty">✅ אין הודעות שממתינות למענה</div>'}
  </div>`;
}
function renderHome(){
  const withAtt=PATIENTS.map((p,i)=>({p,i,att:patientAttention(p)}));
  const totAtt=withAtt.reduce((s,x)=>s+x.att.length,0);
  const today=J_MEETINGS.filter(m=>m.date==='היום');
  const pend=withAtt.filter(x=>x.p.pendingSummary).length;
  const tOpen=PATIENTS.reduce((s,p)=>s+p.tasksOpen,0), tDone=PATIENTS.reduce((s,p)=>s+p.tasksDone,0);
  const unread=PATIENTS.reduce((s,p)=>s+p.unread,0);
  const next=today[0];
  /* דיי-בר — אנטומיית KPI: תווית, מספר גדול בסגול, כיתוב משני */
  document.getElementById('homeStrip').innerHTML=`<div class="daybar">
    <div class="db-sec"><div class="db-l">פגישות היום</div><div class="db-big">${today.length}</div><div class="db-sub">${next?'הקרובה '+next.time.split('-')[0]+' · '+PATIENTS[next.p].name:'אין פגישות היום'}</div></div>
    <div class="db-sec"><div class="db-l">דורשים תשומת לב</div><div class="db-big">${totAtt?'<span class="db-no">'+totAtt+'</span>':'<span class="db-ok">0 ✓</span>'}</div><div class="db-sub">${withAtt.filter(x=>x.att.some(a=>a.sev==='high')).length} דחופים · מתוך ${PATIENTS.length} מטופלים</div></div>
    <div class="db-sec ${pend?'clk':''}" ${pend?`onclick="handleAttention(${withAtt.find(x=>x.p.pendingSummary).i},'summary','')"`:''}><div class="db-l">סיכומים לאישור</div><div class="db-big">${pend}</div><div class="db-sub">${pend?'מוכנים לאישור ושליחה בוואטסאפ':'הכל אושר ✓'}</div></div>
    <div class="db-sec"><div class="db-l">משימות מטופלים</div><div class="db-big">${tOpen}<i>/${tOpen+tDone}</i></div><div class="db-sub">פתוחות · Jampa מלווה אוטומטית</div></div>
    <div class="db-sec"><div class="db-l">ליווי בין פגישות</div><div class="db-big"><span class="db-ago">פעיל</span></div><div class="db-sub">${unread?unread+' הודעות ממתינות למענה':'צ׳ק-אין יומי · הכל נענה'}</div></div>
  </div>`;
  /* באנר תשומת-לב — צ'יפים בסגנון פס ההתראות */
  const feed=withAtt.flatMap(({p,i,att})=>att.map(a=>({...a,i,name:p.name})));
  const sevRank={high:0,mid:1}; feed.sort((a,b)=>sevRank[a.sev]-sevRank[b.sev]);
  const hi=feed.filter(a=>a.sev==='high').length;
  const CAP=3, open=window._jCoalOpen||false, shown=open?feed:feed.slice(0,CAP);
  document.getElementById('homeCoal').innerHTML=feed.length?`<div class="coal ${hi?'hot':''} ${open?'open':''}">
    <span class="coal-ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg></span>
    <span class="coal-t">${feed.length} לטיפול${hi?' · '+hi+' דחופים':''}</span>
    ${shown.map(a=>`<span class="coal-chip ${a.sev}" title="${a.d} · לחיצה: ${a.act}" onclick="handleAttention(${a.i},'${a.key}','${a.act}')">${a.ic} ${a.name} — ${a.t}</span>`).join('')}
    ${feed.length>CAP?`<button class="coal-more" onclick="window._jCoalOpen=${!open};renderHome()">${open?'פחות ▴':'+ עוד '+(feed.length-CAP)}</button>`:''}
  </div>`:'';
  /* מפת מטופלים — כמו שהיה */
  document.getElementById('homeHealth').innerHTML=withAtt.map(({p,i,att})=>{
    const sev=att.some(a=>a.sev==='high')?'high':(att.length?'mid':'ok');
    return `<div class="hcard ${sev}" onclick="selectPatient(${i})" title="פתיחת ${p.name}">
      <div class="hc-top"><span class="hc-name">${p.name}</span><span class="hc-mood">${moodSpark(p.mood,56,20)}</span></div>
      <div class="hc-bar"><div class="fill ok" style="width:${p.progress}%;background:#7557E3"></div></div>
      <div class="hc-foot"><span>${p.stage}</span><span class="hc-al ${sev}">${att.length?att.length+' לטיפול':'✓ תקין'}</span></div>
    </div>`;}).join('');
  /* הפגישות הקרובות — רוחב מלא */
  document.getElementById('homeBoard').innerHTML=`
    <div class="awdg awdg--navy" style="grid-column:1/-1">
      <div class="awdg-head"><div class="awdg-ic"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg></div><div class="awdg-t">הפגישות הקרובות</div><span class="awdg-n">${J_MEETINGS.filter(m=>m.status==='upcoming').length}</span></div>
      <div class="awdg-body">${J_MEETINGS.map((m,ix)=>({m,ix})).filter(x=>x.m.status==='upcoming').map(({m,ix})=>`
        <div class="ameet">
          <div class="am-when"><b>${m.date}</b><span>${m.time.split('-')[0]}</span></div>
          <div class="am-b"><div class="am-n">${PATIENTS[m.p].name}</div><div class="am-c">${m.name}</div></div>
          <button class="mt-btn view" onclick="selectPatient(${m.p});setTimeout(renderPrep,0);document.querySelectorAll('.tab').forEach((x,i)=>x.classList.toggle('on',x.textContent.trim()==='הכנה לפגישה'));['viewDash','viewMeet','viewChat'].forEach(v=>document.getElementById(v).style.display='none');document.getElementById('viewPrep').style.display=''">הכנה לפגישה</button>
        </div>`).join('')}</div>
    </div>`;
  renderJMsgs();
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
  const kp=document.getElementById('pKpis');
  if(!isTherapist()){
    kp.style.display='';
    kp.innerHTML=`
    <div class="kpi"><div class="l">התקדמות במסע הטיפולי</div><div class="n">${p.progress}<span class="cur">%</span></div><div class="foot">${p.stage}</div></div>
    <div class="kpi"><div class="l">מדד מצב רוח · 7 דיווחים</div><div class="n" style="display:flex;align-items:center;gap:10px">${p.mood[p.mood.length-1]}<span class="cur">/8</span> ${moodSpark(p.mood,110,30)}</div><div class="foot">דיווח עצמי יומי בוואטסאפ</div></div>
    <div class="kpi ${p.tasksOpen>=3?'danger':''}"><div class="l">משימות בין-פגישות</div><div class="n">${p.tasksOpen}<span class="cur"> פתוחות</span></div><div class="foot">${p.tasksDone} הושלמו עד כה</div></div>
    <div class="kpi"><div class="l">פגישה הבאה</div><div class="n" style="font-size:20px">${p.nextSession}</div><div class="foot">אחרונה: ${p.lastSession} · לפני ${p.sinceDays} ימים</div></div>`;
  }else{
    kp.style.display='block';
    const last=[...p.chat].reverse().find(m=>m.from==='user')||p.chat[p.chat.length-1];
    const bub=last?`<div class="cb-bub"><div class="cb-bub-h">${last.from==='user'?p.name:'Jampa · אוטומטי'} · ${last.when}</div>${last.t}</div>`
      :`<div class="cb-clean">עוד לא נשלחו הודעות ליווי</div>`;
    kp.innerHTML=`<div class="daybar rich">
      <div class="db-sec"><div class="db-l">המסע הטיפולי <span class="cb-big2">${p.progress}%</span></div>
        <div class="jbar-track"><i style="width:${p.progress}%"></i></div>
        <div class="db-sub">${p.stage}</div></div>
      <div class="db-sec"><div class="db-l">מצב רוח <span class="cb-big2">${p.mood[p.mood.length-1]}/8</span></div>
        <div class="jbar-mood">${moodSpark(p.mood,120,30)}</div>
        <div class="db-sub">7 דיווחים אחרונים · צ׳ק-אין יומי</div></div>
      <div class="db-sec clk" onclick="jChatFrom(${CUR})"><div class="db-l">הודעה אחרונה ${p.unread?`<span class="cb-n">${p.unread}</span>`:''}</div>
        ${bub}
        <div class="db-sub">${p.unread?'לצפייה ומענה ←':''}</div></div>
      <div class="db-sec"><div class="db-l">משימות בין-פגישות ${p.tasksOpen?`<span class="cb-n">${p.tasksOpen}</span>`:''}</div>
        <div class="db-big" style="font-size:21px">${p.tasksOpen?p.tasksOpen+'<i> פתוחות</i>':'<span class="db-ok">הכל הושלם ✓</span>'}</div>
        <div class="db-sub">${p.tasksDone} הושלמו · Jampa מלווה אוטומטית</div></div>
      <div class="db-sec"><div class="db-l">סיכום פגישה</div>
        ${p.pendingSummary?`<button class="cb-send" onclick="openSummary(J_MEETINGS.findIndex(m=>m.p===${CUR}&&m.status==='summary'))">אישור ושליחה למטופל</button><div class="db-sub">ההקלטה מ-${p.lastSession} נותחה</div>`
          :`<div class="cb-rep-ok"><span class="db-ok">✓</span><div><b>נשלח למטופל</b><span>פגישה אחרונה · ${p.lastSession}</span></div></div>`}</div>
    </div>`;
  }
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
