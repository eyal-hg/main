/* Jampa — recording mode (המקבילה של מצב התפעול ב-HK): טיימר, סיום → עיבוד AI → שליחת סיכום */
let RECMODE=false, recStart=0, recTimer=null, recTotal=0;
const fmtDur=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function enterRec(){
  RECMODE=true; recStart=Date.now(); document.body.classList.add('ops-on');
  document.querySelector('.tabs').style.display='none';
  ['viewHome','viewDash','viewMeet','viewChat','viewPrep'].forEach(v=>document.getElementById(v).style.display='none');
  document.getElementById('recScope').textContent=PATIENTS[CUR].name;
  document.getElementById('viewRec').style.display='';
  const el=document.getElementById('recClock');
  const tick=()=>{el.innerHTML='⏺ '+fmtDur(Math.floor((Date.now()-recStart)/1000));};
  tick(); clearInterval(recTimer); recTimer=setInterval(tick,1000);
  if(location.hash!=='#rec') history.pushState({jRec:1},'','#rec');
}
function restoreView(){
  clearInterval(recTimer); recTimer=null;
  RECMODE=false; document.body.classList.remove('ops-on');
  document.getElementById('viewRec').style.display='none';
  selectPatient(CUR);
}
function exitRec(){
  const mins=fmtDur(Math.floor((Date.now()-recStart)/1000));
  hkConfirm('ביטול ההקלטה','ההקלטה של '+mins+' דקות תימחק ולא ניתן יהיה לשחזר אותה. לבטל?','מחיקת ההקלטה',()=>{
    restoreView(); toast('ההקלטה בוטלה — לא נשמר דבר');
    if(location.hash==='#rec') history.back();
  });
}
window.addEventListener('popstate',function(){ if(RECMODE && location.hash!=='#rec'){restoreView();toast('ההקלטה בוטלה');} });

/* ---- finish recording → AI processing (אותו שלד כמו זרימת ה-Bizibox) ---- */
let recTimers=[];
function finishRec(){
  recTotal=Math.floor((Date.now()-recStart)/1000); clearInterval(recTimer);
  const ov=document.getElementById('finOv'); ov.classList.add('show');
  document.getElementById('finFoot').classList.remove('show'); document.getElementById('finFoot').innerHTML='';
  document.getElementById('finFindings').innerHTML='';
  document.getElementById('finTitle').textContent='מעבדת את הפגישה…';
  document.getElementById('finSub').textContent='Jampa מתמללת, מנתחת ומכינה סיכום וסופרוויזיון';
  const ico=document.getElementById('finIco'); ico.className='fin-ico'; ico.innerHTML='<div class="spin"></div>';
  document.getElementById('finSteps').innerHTML=REC_STEPS.map((s,i)=>
    `<div class="fin-step" id="fstep${i}"><span class="fs-ico"></span><span>${s}</span></div>`).join('');
  recTimers.forEach(clearTimeout); recTimers=[];
  let d=400;
  REC_STEPS.forEach((s,i)=>{
    recTimers.push(setTimeout(()=>{const el=document.getElementById('fstep'+i);
      if(el){el.className='fin-step run';el.querySelector('.fs-ico').innerHTML='<span class="mini-spin"></span>';}},d));
    d+=850;
    recTimers.push(setTimeout(()=>{const el=document.getElementById('fstep'+i);
      if(el){el.className='fin-step done';el.querySelector('.fs-ico').innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';}
      if(i===REC_STEPS.length-1) recReady();},d));
    d+=250;
  });
}
function recReady(){
  const ico=document.getElementById('finIco'); ico.className='fin-ico ok';
  ico.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>';
  document.getElementById('finTitle').textContent='הסיכום מוכן';
  document.getElementById('finSub').textContent='פגישה של '+fmtDur(recTotal)+' · '+REC_SUMMARY.points.length+' נקודות · '+REC_SUMMARY.supervision.length+' תובנות סופרוויזיון · '+REC_SUMMARY.tasks.length+' משימות';
  document.getElementById('finFindings').innerHTML=
    REC_SUMMARY.points.map((x,n)=>`<div class="ffind"><div class="ffind-b"><div class="ffind-t">נקודה ${n+1}</div><div class="ffind-d">${x}</div></div></div>`).join('')+
    `<div class="ffind high"><div class="ffind-b"><div class="ffind-t">🧭 סופרוויזיון — ${REC_SUMMARY.supervision[0].t}</div><div class="ffind-d">${REC_SUMMARY.supervision[0].d}</div></div>
      <div class="ffind-act"><button class="ot-btn ghost" onclick="toast('נפתח הסופרוויזיון המלא')">לכל התובנות</button></div></div>`;
  const foot=document.getElementById('finFoot');
  foot.innerHTML=`
    <div class="fin-badge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg> הסיכום האישי למטופל מוכן לשליחה</div>
    <button class="fin-wa" onclick="recSend()"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.75-.86-2-.96-.27-.1-.47-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.64.07-.3-.14-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.04-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.75-.72 2-1.4.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.34z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.3a8.3 8.3 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg> שליחת סיכום אישי למטופל</button>
    <button class="chip-btn" style="width:100%;justify-content:center" onclick="recClose()">שמירה ללא שליחה</button>`;
  foot.classList.add('show');
}
function recSend(){
  const p=PATIENTS[CUR];
  document.getElementById('finIco').className='fin-ico wa';
  document.getElementById('finTitle').textContent='הסיכום נשלח למטופל ✓';
  document.getElementById('finSub').textContent='נשלח בוואטסאפ ל'+p.name+' בטון הטיפולי שלך';
  document.getElementById('finSteps').innerHTML='';
  document.getElementById('finFindings').innerHTML=`
    <div class="fin-msg"><div class="fin-msg-b">היי ${p.name.split(' ')[0]} 💜 היה לנו היום צעד משמעותי. שלוש נקודות ששווה לזכור מהפגישה, והמשימות שסיכמנו — מחכות לך כאן. גאה בך!<span class="fin-msg-t">16:52 ✓✓</span></div></div>
    <div class="fin-stats">
      <div class="fstat"><div class="fs-n">${fmtDur(recTotal)}</div><div class="fs-l">משך הפגישה</div></div>
      <div class="fstat"><div class="fs-n">${REC_SUMMARY.supervision.length}</div><div class="fs-l">תובנות סופרוויזיון</div></div>
      <div class="fstat"><div class="fs-n">${REC_SUMMARY.tasks.length}</div><div class="fs-l">משימות למעקב</div></div>
    </div>`;
  document.getElementById('finFoot').innerHTML='<button class="chip-btn primary" style="width:100%;justify-content:center" onclick="recClose()">חזרה לתיק המטופל</button>';
}
function recClose(){
  document.getElementById('finOv').classList.remove('show');
  PATIENTS[CUR].pendingSummary=false;
  restoreView(); toast('הפגישה תועדה ונשמרה בתיק');
  if(location.hash==='#rec') history.back();
}
