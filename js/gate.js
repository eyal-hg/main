/* =====================================================================
   js/gate.js — כניסה לאתר (שכבת האתר החי בלבד; מקומית אין שער).
   כניסה עם Google: הדפדפן מקבל credential מגוגל → הפונקציה מאמתת מול גוגל,
   בודקת שהמייל ב-ALLOWED_EMAILS ומחזירה session חתום (hkSession, 30 יום).
   סיסמת הלוח (BOARD_PASSWORD → hkBoardPass) נשארת כגיבוי, בקישור קטן.
   זו הגנת ממשק: הקבצים עצמם נשארים נגישים בכתובת ישירה.
   מי שנכנס: window.hkUser = {email, name}.
   ===================================================================== */
(function(){
  var ONLINE=/^https?:/.test(location.protocol)&&!/localhost|127\.0\.0\.1/.test(location.hostname);
  window.hkUser=null;
  function readUser(){try{var u=JSON.parse(localStorage.getItem('hkUser')||'null');if(u&&u.email)window.hkUser=u}catch(e){}}
  readUser();
  if(!ONLINE) return;
  try{ if(localStorage.getItem('hkSession')||localStorage.getItem('hkBoardPass')) return; }catch(e){ return; }
  var css='#hkGate{position:fixed;inset:0;z-index:99999;background:#F6F8FB;display:grid;place-items:center;font-family:Rubik,Rubik,Heebo,system-ui,sans-serif;direction:rtl}'
   +'#hkGate .box{width:360px;max-width:92vw;background:#fff;border:1px solid #E3EAF3;border-radius:10px;padding:32px;text-align:center}'
   +'#hkGate .logo{height:40px;margin:0 auto 22px;display:block}'
   +'#hkGate h1{margin:0 0 4px;font-size:17px;font-weight:600;color:#0C4068}#hkGate p{margin:0 0 18px;color:#5B7186;font-size:12.5px}'
   +'#hkGate .g{display:flex;justify-content:center;min-height:44px;margin-bottom:8px}'
   +'#hkGate .err{color:#C43D30;font-size:12.5px;min-height:1.2em;margin:4px 0 6px}'
   +'#hkGate .alt{border:0;background:none;font:inherit;font-size:12px;color:#7A8898;cursor:pointer;text-decoration:underline;padding:6px}'
   +'#hkGate .pw{display:none}#hkGate.pw .pw{display:block}#hkGate.pw .g,#hkGate.pw .alt{display:none}'
   +'#hkGate input{width:100%;box-sizing:border-box;font:inherit;font-size:17px;text-align:center;letter-spacing:3px;border:1px solid #E3EAF3;border-radius:7px;padding:9px 12px;margin-bottom:10px;color:#12263A}#hkGate input:focus{outline:none;border-color:#39ABE2}'
   +'#hkGate button.in{width:100%;font:inherit;font-size:13px;font-weight:500;border-radius:6px;padding:8px;border:1px solid #0C4068;background:#0C4068;color:#fff;cursor:pointer}#hkGate button.in:hover{background:#0A3557}#hkGate button[disabled]{opacity:.5}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  var g=document.createElement('div'); g.id='hkGate';
  g.innerHTML='<div class="box"><img class="logo" src="/logo.b96db34a449db8db7eaea328a06ad8e2.svg" alt="חזות קריספין"><h1>פיתוח</h1><p id="hkGateP">כניסה עם חשבון Google</p>'
   +'<div class="g" id="hkGateG"></div><div class="err" id="hkGateE"></div><button class="alt" id="hkGateAlt" type="button">כניסה עם סיסמה</button>'
   +'<div class="pw"><input id="hkGateI" type="password" autocomplete="current-password" placeholder=""><button class="in" id="hkGateB" type="button">כניסה</button></div></div>';
  (document.body||document.documentElement).appendChild(g);
  var e=g.querySelector('#hkGateE'), i=g.querySelector('#hkGateI'), b=g.querySelector('#hkGateB');
  function post(o){return fetch('/api/save-board',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})})}
  function done(u){try{if(u){localStorage.setItem('hkUser',JSON.stringify(u));localStorage.setItem('hkBoardWho',u.name||'')}}catch(_){} readUser(); g.remove(); try{document.dispatchEvent(new CustomEvent('hk:login',{detail:window.hkUser}))}catch(_){}}
  /* Google */
  post({action:'config'}).then(function(x){
    var cid=x.j&&x.j.googleClientId;
    if(!cid){g.classList.add('pw');g.querySelector('#hkGateP').textContent='הזן סיסמה';setTimeout(function(){i.focus()},50);return}
    var sc=document.createElement('script'); sc.src='https://accounts.google.com/gsi/client'; sc.async=true; sc.defer=true;
    sc.onload=function(){
      google.accounts.id.initialize({client_id:cid,callback:function(resp){
        e.textContent='';
        post({action:'google',credential:resp.credential}).then(function(y){
          if(y.s===200){try{localStorage.setItem('hkSession',y.j.session)}catch(_){} done({email:y.j.email,name:y.j.name})}
          else e.textContent=y.j.error||('שגיאה '+y.s);
        }).catch(function(){e.textContent='אין חיבור לשרת'});
      },auto_select:true,itp_support:true});
      google.accounts.id.renderButton(g.querySelector('#hkGateG'),{theme:'outline',size:'large',shape:'pill',text:'signin_with',locale:'he',width:296});
      google.accounts.id.prompt();
    };
    sc.onerror=function(){e.textContent='לא ניתן לטעון את הכניסה של Google';};
    document.head.appendChild(sc);
  }).catch(function(){g.classList.add('pw');g.querySelector('#hkGateP').textContent='הזן סיסמה'});
  /* סיסמה (גיבוי) */
  g.querySelector('#hkGateAlt').onclick=function(){g.classList.add('pw');g.querySelector('#hkGateP').textContent='הזן סיסמה';setTimeout(function(){i.focus()},50)};
  function tryIn(){var v=i.value.trim(); if(!v)return; b.disabled=true; e.textContent='';
    post({action:'check',password:v}).then(function(x){b.disabled=false; if(x.s===200){try{localStorage.setItem('hkBoardPass',v)}catch(_){} done(null);} else if(x.s===401){e.textContent='סיסמה שגויה'} else {e.textContent=x.j.error||('שגיאה '+x.s)}})
     .catch(function(){b.disabled=false;e.textContent='אין חיבור לשרת'});}
  b.onclick=tryIn; i.onkeydown=function(ev){if(ev.key==='Enter')tryIn()};
})();
