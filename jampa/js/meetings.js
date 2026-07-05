/* Jampa — meetings list (with recording states) + summary modal (סיכום/סופרוויזיון/משימות) */
let J_FILTER='all';
function renderMeetings(){
  const F=[['all','הכל'],['upcoming','קרובות'],['summary','סיכום ממתין לאישור'],['done','הושלמו']];
  document.getElementById('mtFilters').innerHTML=F.map(f=>{
    const n=f[0]==='all'?0:J_MEETINGS.filter(m=>m.p===CUR&&m.status===f[0]).length;
    return `<div class="ofilter ${J_FILTER===f[0]?'on':''}" onclick="jFilter('${f[0]}')">${f[1]}${n?`<span class="cnt">${n}</span>`:''}</div>`;}).join('');
  let list=J_MEETINGS.map((m,ix)=>({m,ix})).filter(x=>x.m.p===CUR);
  if(J_FILTER!=='all') list=list.filter(x=>x.m.status===J_FILTER);
  const el=document.getElementById('mtList');
  if(!list.length){el.innerHTML='<div class="al-empty">אין פגישות בסינון הזה</div>';return;}
  el.innerHTML=list.map(({m,ix})=>{
    const badge = m.rec?`<span class="rec-badge">🎙 ${m.rec}</span>`:'';
    let btn;
    if(m.status==='summary') btn=`<button class="mt-btn" onclick="openSummary(${ix})">אישור הסיכום</button>`;
    else if(m.status==='done') btn=`<button class="mt-btn view" onclick="openSummary(${ix})">צפייה בסיכום</button>`;
    else btn=`<button class="mt-btn view" onclick="toast('נפתחה ההכנה לפגישה')">הכנה לפגישה</button>`;
    return `<div class="mtcard">
      <div class="mt-info"><div class="mt-name">${m.name} ${badge}</div>
        <div class="mt-meta"><span>📅 ${m.date}</span><span>🕐 ${m.time}</span><span>${m.status==='summary'?'⏳ סיכום ממתין לאישור':m.status==='upcoming'?'🔜 פגישה קרובה':'✓ תועדה ונשלחה'}</span></div></div>
      ${btn}</div>`;}).join('');
}
function jFilter(k){J_FILTER=k;renderMeetings();}
function openSummary(ix){
  const m=J_MEETINGS[ix]; if(!m) return;
  const p=PATIENTS[m.p];
  document.getElementById('msTitle').textContent=m.name;
  document.getElementById('msMeta').textContent=p.name+' · '+m.date+' · '+m.time+(m.rec?' · הקלטה '+m.rec:'');
  msFill('sum');
  document.getElementById('msOv').classList.add('show');
}
function msFill(t){
  document.querySelectorAll('.ms-tab').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  const b=document.getElementById('msBody');
  if(t==='sum') b.innerHTML='<div class="ms-sec">📋 עיקרי הפגישה</div>'+
    REC_SUMMARY.points.map((x,i)=>`<div class="ms-point"><span class="num">${i+1}.</span><span>${x}</span></div>`).join('');
  else if(t==='sup') b.innerHTML='<div class="ms-sec t2">🧭 סופרוויזיון AI · ניתוח 360°</div>'+
    REC_SUMMARY.supervision.map(s=>`<div class="ms-insight"><div class="ms-ititle">${s.t}</div><div class="ms-itext">${s.d}</div></div>`).join('');
  else b.innerHTML='<div class="ms-sec">📝 משימות בין-פגישות</div>'+
    REC_SUMMARY.tasks.map((x,i)=>`<div class="ms-point"><span class="num">${i+1}.</span><span>${x} — מעקב אוטומטי בוואטסאפ</span></div>`).join('');
}
function closeSummary(){document.getElementById('msOv').classList.remove('show');}
function approveSummary(){
  const p=PATIENTS[CUR]; p.pendingSummary=false;
  closeSummary(); toast('הסיכום אושר ונשלח למטופל בוואטסאפ');
  if(SCOPE==='home') renderHome(); else renderMeetings();
  renderRail();
}
