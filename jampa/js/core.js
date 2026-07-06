/* Jampa — patients rail + switcher + shared helpers */
let CUR=0, SCOPE='home', ROLE='therapist';
/* confirm dialog לפעולות הרסניות */
let _confirmYes=null;
function hkConfirm(title,msg,yesLabel,onYes){
  _confirmYes=onYes;
  document.getElementById('cfTitle').textContent=title;
  document.getElementById('cfMsg').textContent=msg;
  document.getElementById('cfYes').textContent=yesLabel||'אישור';
  document.getElementById('cfOv').classList.add('show');
}
function cfClose(ok){
  document.getElementById('cfOv').classList.remove('show');
  if(ok&&_confirmYes)_confirmYes();
  _confirmYes=null;
}
const isTherapist=()=>ROLE==='therapist';
function toast(m){const t=document.getElementById('toast');t.textContent='✓ '+m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
const moodSpark=(mood,w,h)=>{
  const max=8, pts=mood.map((v,i)=>[(i/(mood.length-1))*w, h-(v/max)*h]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${line}" fill="none" stroke="#7557E3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="2.6" fill="#7557E3"/></svg>`;
};
function patientAttention(p){
  const out=[];
  if(p.pendingSummary) out.push({sev:'high',ic:'🎙',key:'summary',t:'סיכום פגישה ממתין לאישור',d:'ההקלטה מ-'+p.lastSession+' תומללה ונותחה — הסיכום מוכן לאישור ושליחה.',act:'אישור הסיכום'});
  if(p.needSchedule)  out.push({sev:'high',ic:'📅',key:'schedule',t:'ממתינה לתיאום פגישה',d:p.sinceDays+' ימים מאז הפגישה האחרונה ואין פגישה קבועה.',act:'שליחת זמנים'});
  if(p.moodDrop)      out.push({sev:'mid', ic:'📉',key:'mood',t:'ירידה במדד מצב הרוח',d:'דיווח עצמי נמוך ברצף בשלושת הימים האחרונים.',act:'שליחת צ׳ק-אין'});
  if(p.tasksOpen>=3)  out.push({sev:'mid', ic:'📝',key:'tasks',t:p.tasksOpen+' משימות פתוחות',d:'המשימות מהפגישה האחרונה טרם הושלמו.',act:'תזכורת עדינה'});
  return out;
}
function renderRail(){
  const q=(document.getElementById('railQ').value||'').trim();
  const el=document.getElementById('railList');
  el.innerHTML=PATIENTS.map((p,i)=>({p,i})).filter(x=>!q||x.p.name.includes(q)||x.p.focus.includes(q))
    .map(({p,i})=>{
      const att=patientAttention(p).length;
      return `<div class="cli ${i===CUR&&SCOPE==='patient'?'on':''}" onclick="selectPatient(${i})" title="${p.name} · ${p.focus}">
        <span class="dot" style="background:${att?'#E48375':'#989EF5'}"></span>
        <div class="ci"><div class="cn">${p.name}</div><div class="cs">${p.focus}</div></div>
        ${p.unread?`<span class="cbadge">${p.unread}</span>`:''}
      </div>`;}).join('');
  document.getElementById('cliCount').textContent=PATIENTS.length;
}
function toggleRail(){document.getElementById('shell').classList.toggle('collapsed');}
function toggleSwitcher(e){
  e.stopPropagation();
  const dd=document.getElementById('swDD');
  dd.innerHTML=`<div class="sw-item" onclick="selectHome()"><b>כל המטופלים</b><span>מבט-על טיפולי</span></div>`+
    PATIENTS.map((p,i)=>`<div class="sw-item" onclick="selectPatient(${i})"><b>${p.name}</b><span>${p.focus}</span></div>`).join('');
  dd.classList.toggle('show');
}
document.addEventListener('click',()=>{const d=document.getElementById('swDD');if(d)d.classList.remove('show');});
