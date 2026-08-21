/* ===== הפגישות שלי — המסך של בעל העסק =====
   חדר הפגישה הוא שולחן העבודה של היועץ: הקלטה, תמלול, הזיכרון,
   "איך לדבר איתו", ומשוב על היועץ. שום דבר מזה לא שייך לבעל העסק —
   הוא היה רואה את הפרופיל שכתבו עליו.
   כאן הוא רואה את מה ששלו: מתי נפגשים, מה סוכם, ומה נשאר פתוח. */

const CLM_ORD={upcoming:0, ai:1, summary:2, done:3, noshow:4};

function clmParse(d){ const p=(d||'').split('.'); return new Date(+p[2]||2026, (+p[1]||1)-1, +p[0]||1); }
function clmMine(){
  const nm=(CLIENTS[CUR]||{}).name;
  return MEETINGS.filter(m=>m.client===nm);
}
function clmDayLbl(d){
  const t=new Date(2026,6,2), x=clmParse(d);
  const diff=Math.round((x-t)/86400000);
  if(diff===0) return 'היום';
  if(diff===1) return 'מחר';
  if(diff>0) return 'בעוד '+diff+' ימים';
  if(diff===-1) return 'אתמול';
  return 'לפני '+Math.abs(diff)+' ימים';
}

function renderCliMeetings(){
  const host=document.getElementById('cliMeet'); if(!host) return;
  const all=clmMine();
  const up=all.filter(m=>m.status==='upcoming').sort((a,b)=>clmParse(a.date)-clmParse(b.date));
  const past=all.filter(m=>m.status!=='upcoming').sort((a,b)=>clmParse(b.date)-clmParse(a.date));
  const next=up[0];

  /* המשימות הפתוחות של בעל העסק — מה שהוא לוקח על עצמו, לא מה ש-HK לוקחת */
  const open=[];
  past.forEach(m=>(m.tasks||[]).forEach(t=>{ if(!t.done) open.push({t:t.t, from:m.name, date:m.date}); }));

  host.innerHTML=`
  <div class="clm">
    ${next?`
    <div class="clm-next">
      <div class="clm-nl">
        <div class="clm-badge">
          <b>${next.date.slice(0,2)}</b>
          <span>${['ינו׳','פבר׳','מרץ','אפר׳','מאי','יונ׳','יול׳','אוג׳','ספט׳','אוק׳','נוב׳','דצמ׳'][(+next.date.slice(3,5)||1)-1]}</span>
          <i>${clmDayLbl(next.date)}</i>
        </div>
        <div class="clm-nlt">
        <div class="clm-tag">הפגישה הבאה</div>
        <h2>${next.name}</h2>
        <div class="clm-meta">
          <span dir="ltr">${next.time}</span><span class="s">·</span>
          <span>זום</span><span class="s">·</span>
          <span>עם <b>${next.adv}</b>, היועץ שלך ב-HK</span>
        </div>
        <div class="clm-acts">
          <button class="clm-b p" onclick="cliToast('הקישור נפתח — נתראה בזום')">הצטרפות בזום</button>
          <button class="clm-b" onclick="cliToast('נשלחה בקשה לתיאום מחדש')">תיאום מחדש</button>
          <button class="clm-b" onclick="cliToast('הנושא נשלח ליועץ ויעלה בפגישה')">יש לי נושא לפגישה</button>
        </div>
        </div>
      </div>
      <div class="clm-nr">
        <div class="clm-nrh">מה מחכה ממני</div>
        ${open.length
          ? open.map(o=>`<div class="clm-ot"><i></i><div><b>${o.t}</b><span>מהפגישה ב-${o.date}</span></div></div>`).join('')
          : `<div class="clm-ok"><span>✓</span>אין משימות פתוחות מהפגישות הקודמות. הכול נסגר.</div>`}
        <div class="clm-nrn">הסיכום נשלח אליך בוואטסאפ בסיום כל פגישה.</div>
      </div>
    </div>`:''}

    ${up.length>1?`
    <div class="clm-more">
      <span class="l">גם ביומן:</span>
      ${up.slice(1).map(m=>`<span class="clm-chip"><b>${m.date}</b> ${m.name}</span>`).join('')}
    </div>`:''}

    <div class="clm-sec">
      <h3>הפגישות שקיימנו</h3>
      <span class="clm-sd">${past.length} פגישות · לחיצה פותחת את מה שסוכם</span>
    </div>

    <div class="clm-list">
      ${past.map((m,i)=>clmRow(m,i)).join('')||'<div class="clm-empty">עוד לא קיימנו פגישה. הראשונה כבר ביומן.</div>'}
    </div>
  </div>`;
}

function clmRow(m,i){
  const nos=(m.status==='noshow');
  const sum=m.sum||[], tasks=m.tasks||[];
  const done=tasks.filter(t=>t.done).length;
  return `
  <div class="clm-m ${nos?'no':''}" id="clmm${i}">
    <div class="clm-h" onclick="clmToggle(${i})">
      <div class="clm-d"><b>${m.date.slice(0,5)}</b><span>${m.date.slice(6)}</span></div>
      <div class="clm-t">
        <b>${m.name}</b>
        <span>${nos?'לא התקיימה':(m.rec?m.rec+' · עם '+m.adv:'עם '+m.adv)}</span>
      </div>
      ${nos?'<span class="clm-p no">לא התקיימה</span>'
        :sum.length?`<span class="clm-p ok">${sum.length} סעיפי סיכום</span>`
        :'<span class="clm-p wait">הסיכום בהכנה</span>'}
      ${tasks.length?`<span class="clm-p ${done===tasks.length?'ok':'open'}">${done}/${tasks.length} משימות</span>`:''}
      <svg class="clm-cv" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </div>
    <div class="clm-body">
      ${nos?`<div class="clm-nos">הפגישה לא התקיימה, ולכן אין ממנה סיכום ואין משימות. אפשר לתאם מועד חדש.
        <button class="clm-b sm" onclick="cliToast('נשלחה בקשה לתיאום מועד חדש')">תיאום מועד חדש</button></div>`
      : sum.length?`
        <div class="clm-cols">
          <div>
            <div class="clm-bh">מה סוכם</div>
            ${sum.map((s,n)=>`<div class="clm-sr"><span class="n">${n+1}</span><p>${s}</p></div>`).join('')}
          </div>
          ${tasks.length?`<div class="clm-tw">
            <div class="clm-bh">מה יצא מזה</div>
            ${tasks.map(t=>`<div class="clm-tk ${t.done?'d':''}"><span class="ck">${t.done?'✓':'◷'}</span>${t.t}</div>`).join('')}
            <div class="clm-tn">${done===tasks.length?'הכול נסגר.':(tasks.length-done)+' עדיין פתוחות.'}</div>
          </div>`:''}
        </div>
        <div class="clm-foot">
          <button class="clm-b sm" onclick="cliToast('הסיכום נשלח שוב לוואטסאפ שלך')">שלח לי את הסיכום שוב</button>
          <span class="clm-fn">הסיכום נשלח אליך ב-${m.date} בוואטסאפ.</span>
        </div>`
      :`<div class="clm-nos">הסיכום עדיין בהכנה. הוא יישלח אליך בוואטסאפ ברגע שיהיה מוכן.</div>`}
    </div>
  </div>`;
}

function clmToggle(i){
  const el=document.getElementById('clmm'+i); if(!el) return;
  el.classList.toggle('open');
}
function cliToast(t){ if(typeof toast==='function') toast(t); }
