/* =====================================================================
   js/gate.js — סיסמה בכניסה לאתר (שכבת האתר החי בלבד; מקומית אין שער).
   הסיסמה נבדקת מול netlify/functions/save-board (action:check) — אותה
   BOARD_PASSWORD של הלוח — ונשמרת בדפדפן פעם אחת (hkBoardPass).
   זו הגנת ממשק: הקבצים עצמם נשארים נגישים בכתובת ישירה.
   ===================================================================== */
(function(){
  var ONLINE=/^https?:/.test(location.protocol)&&!/localhost|127\.0\.0\.1/.test(location.hostname);
  if(!ONLINE) return;
  try{ if(localStorage.getItem('hkBoardPass')) return; }catch(e){ return; }
  var css='#hkGate{position:fixed;inset:0;z-index:99999;background:#F6F8FB;display:grid;place-items:center;font-family:Heebo,Rubik,system-ui,sans-serif;direction:rtl}'
   +'#hkGate .box{width:360px;max-width:92vw;background:#fff;border:1px solid #E3EAF3;border-radius:14px;box-shadow:0 10px 28px -18px rgba(12,64,104,.18);padding:22px 22px 18px}'
   +'#hkGate h1{margin:0 0 4px;font-size:22px;font-weight:800;color:#0C4068;letter-spacing:-.4px}#hkGate p{margin:0 0 14px;color:#7A8898;font-size:13px}'
   +'#hkGate input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;border:1px solid #CBD6E2;border-radius:10px;padding:9px 12px;margin-bottom:10px}#hkGate input:focus{outline:none;border-color:#39ABE2}'
   +'#hkGate .err{color:#C43D30;font-size:12.5px;min-height:1.2em;margin-bottom:8px}'
   +'#hkGate button{width:100%;font:inherit;font-size:14px;font-weight:600;border-radius:999px;padding:9px;border:0;background:#E4826E;color:#fff;cursor:pointer}#hkGate button[disabled]{opacity:.5}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var g=document.createElement('div'); g.id='hkGate';
  g.innerHTML='<div class="box"><h1>HK · סביבת הפיתוח</h1><p>סיסמה, פעם אחת בדפדפן הזה.</p><input id="hkGateI" type="password" placeholder="סיסמה" autocomplete="current-password"><div class="err" id="hkGateE"></div><button id="hkGateB" type="button">כניסה</button></div>';
  (document.body||document.documentElement).appendChild(g);
  var i=g.querySelector('#hkGateI'), e=g.querySelector('#hkGateE'), b=g.querySelector('#hkGateB');
  setTimeout(function(){i.focus()},50);
  function tryIn(){var v=i.value.trim(); if(!v)return; b.disabled=true; e.textContent='';
    fetch('/api/save-board',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'check',password:v})})
     .then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})})
     .then(function(x){b.disabled=false; if(x.s===200){try{localStorage.setItem('hkBoardPass',v)}catch(_){} g.remove();} else if(x.s===401){e.textContent='סיסמה שגויה'} else {e.textContent=x.j.error||('שגיאה '+x.s)}})
     .catch(function(){b.disabled=false;e.textContent='אין חיבור לשרת'});}
  b.onclick=tryIn; i.onkeydown=function(ev){if(ev.key==='Enter')tryIn()};
})();
