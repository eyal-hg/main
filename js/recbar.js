/* ===== פס ההקלטה + תצוגת המגיש =====
   ההקלטה לא חוטפת את המסך. היועץ ממשיך לנווט בכל המערכת, מציג ללקוח
   מסכים בזום, ומסמן רגעים — והפס נשאר למעלה בכל מסך.
   כלל: מה שהלקוח רואה יושב בטאב נפרד (client-view.html). לכאן לא נכנס
   שום דבר פנימי — זיכרון, רגישויות ומשוב נשארים אצל היועץ בלבד. */
const REC={on:false, t0:0, sec:0, timer:null, marks:[], panel:false,
           who:'צחי עובד', what:'פגישה חודשית', co:'אנרגי אינטרנשיונל'};
const CV_KEY='hkLiveMeeting';
const CV_SCREENS=[['goal','מטרת הפגישה'],['flow','התזרים'],['budget','התקציב']];
let CV={screen:'goal', decisions:[]};
function cvPush(){ try{ localStorage.setItem(CV_KEY,JSON.stringify(CV)); }catch(e){} }
function cvScreen(k){ CV.screen=k; cvPush(); recRender();
  recMark('הוצג ללקוח · '+(CV_SCREENS.find(s=>s[0]===k)||[,k])[1], true); }
function cvOpen(){ window.open('client-view.html','hkClient'); toast('נפתח מסך ללקוח — שתפו את הטאב הזה בזום'); }

function recClock(s){
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), x=s%60;
  return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0');
}
function recStart(who,what){
  /* ההקלטה היא כלי של היועץ. בעל העסק לא מקליט את היועץ שלו. */
  if(typeof ROLE!=='undefined'&&(ROLE==='client1'||ROLE==='clientN')) return;
  if(REC.on) return;
  REC.on=true; REC.sec=0; REC.marks=[];
  if(who) REC.who=who; if(what) REC.what=what;
  if(typeof CLIENTS!=='undefined'&&typeof CUR!=='undefined'&&CLIENTS[CUR]) REC.co=CLIENTS[CUR].name;
  CV={screen:'goal',decisions:[]}; cvPush();
  REC.timer=setInterval(()=>{REC.sec++;recTick();},1000);
  recRender();
  toast('ההקלטה התחילה — אפשר להמשיך לעבוד במערכת');
}
function recStop(){
  if(!REC.on) return;
  clearInterval(REC.timer); REC.on=false; REC.panel=false;
  const n=REC.marks.length, d=recClock(REC.sec);
  recRender();
  toast('ההקלטה הסתיימה · '+d+' · '+(n?n+' רגעים מסומנים':'בלי רגעים מסומנים'));
}
function recMark(txt,quiet){
  if(!REC.on) return;
  REC.marks.push({t:recClock(REC.sec), txt:txt||'רגע חשוב'});
  recRender();
  if(!quiet) toast('רגע סומן · '+recClock(REC.sec));
}
function recPanel(){ REC.panel=!REC.panel; recRender(); }
function recDecAdd(){
  const i=document.getElementById('recDec'); if(!i) return;
  const v=(i.value||'').trim(); if(!v) return;
  CV.decisions.push({t:v, s:''}); cvPush(); i.value='';
  recMark('סוכם: '+v, true);
  recRender();
  toast('נוסף למה שסיכמנו — הלקוח רואה את זה עכשיו');
}
function recDecRm(ix){ CV.decisions.splice(ix,1); cvPush(); recRender(); }
function recTick(){ const c=document.getElementById('recClock'); if(c) c.textContent=recClock(REC.sec); }

function recRender(){
  let el=document.getElementById('recBar');
  if(!el){
    el=document.createElement('div'); el.id='recBar';
    document.body.insertBefore(el, document.body.firstChild);
  }
  if(!REC.on){ el.className=''; el.innerHTML=''; document.body.classList.remove('rec-on'); return; }
  document.body.classList.add('rec-on');
  el.className='on';
  const bars=Array.from({length:26},(_,i)=>
    `<i style="height:${20+Math.round(Math.abs(Math.sin((REC.sec+i)*0.7))*60)}%"></i>`).join('');
  el.innerHTML=`
    <div class="rb">
      <span class="rb-dot"></span>
      <span class="rb-clock" id="recClock">${recClock(REC.sec)}</span>
      <span class="rb-who">מקליט · <b>${REC.who}</b> · ${REC.what}</span>
      <span class="rb-wave">${bars}</span>
      <span class="rb-sp"></span>
      ${REC.marks.length?`<span class="rb-marks">${REC.marks.length} רגעים</span>`:''}
      <button class="rb-b mark" onclick="recMark()">סמן רגע <b>רווח</b></button>
      <button class="rb-b ${REC.panel?'on':''}" onclick="recPanel()">לוח המגיש</button>
      <button class="rb-b cv" onclick="cvOpen()">מסך ללקוח ↗</button>
      <button class="rb-b stop" onclick="recStop()">סיום ההקלטה</button>
    </div>
    ${REC.panel?`<div class="rp">
      <div class="rp-c">
        <div class="rp-h">מה הלקוח רואה עכשיו</div>
        <div class="rp-sc">${CV_SCREENS.map(([k,l])=>
          `<button class="rp-s ${CV.screen===k?'on':''}" onclick="cvScreen('${k}')">${l}</button>`).join('')}</div>
        <div class="rp-n">הלקוח רואה רק את המספרים ואת מה שסיכמתם. הזיכרון והרגישויות נשארים כאן.</div>
      </div>
      <div class="rp-c grow">
        <div class="rp-h">מה סיכמנו <span>${CV.decisions.length}</span></div>
        <div class="rp-add">
          <input id="recDec" placeholder="מה סוכם? — יופיע מיד אצל הלקוח" onkeydown="if(event.key==='Enter')recDecAdd()">
          <button onclick="recDecAdd()">הוספה</button>
        </div>
        <div class="rp-l">${CV.decisions.map((d,i)=>
          `<div class="rp-d"><span>✓</span>${d.t}<i onclick="recDecRm(${i})">✕</i></div>`).join('')
          ||'<div class="rp-e">מה שתסכמו יופיע כאן ואצל הלקוח בו-זמנית</div>'}</div>
      </div>
      <div class="rp-c">
        <div class="rp-h">רגעים שסימנת</div>
        <div class="rp-l">${REC.marks.slice().reverse().map(m=>
          `<div class="rp-m"><b>${m.t}</b>${m.txt}</div>`).join('')
          ||'<div class="rp-e">כל רגע שתסמן יהפוך לצ׳אפטר בתמלול</div>'}</div>
      </div>
    </div>`:''}`;
}
/* קיצור מקלדת: R להתחלה/סיום · רווח לסימון רגע (כשלא מקלידים) */
document.addEventListener('keydown',e=>{
  const tag=(e.target.tagName||'').toLowerCase();
  if(tag==='input'||tag==='textarea'||e.target.isContentEditable) return;
  if(e.key==='r'||e.key==='R'){ REC.on?recStop():recStart(); }
  if(e.code==='Space'&&REC.on){ e.preventDefault(); recMark(); }
});
