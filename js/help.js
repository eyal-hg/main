/* =====================================================================
   js/help.js — מנוע העזרה
   אייקון ? אחד בפס העליון. הוא יודע באיזה מסך המשתמש נמצא עכשיו,
   ופותח את ההסבר של אותו מסך. המנוע כאן; התוכן ב-js/help-content.js.

   למה אייקון אחד ולא אחד פר מסך: כדי שהמשתמש ילמד פעם אחת איפה העזרה,
   וכדי שהוספת מסך תדרוש נגיעה בקובץ תוכן אחד ולא בשלושים קבצי HTML.
   ===================================================================== */
(function(){

/* ---------- 1 · באיזה מסך אנחנו עכשיו ----------
   הרזולוציה נשענת על אותם משתני מצב שהניווט עצמו משתמש בהם, כדי שלא
   ייווצר מקור אמת שני שיכול להתנתק מהמסך שבאמת מוצג. */
function helpKey(){
  /* אזור הניהול פתוח — הוא מכסה הכל */
  var adm=document.getElementById('adminShell');
  if(adm&&adm.classList.contains('show'))
    return 'adm.'+(typeof ADM_CUR!=='undefined'?ADM_CUR:'meetings');

  /* מצב תפעול */
  if(typeof OPSMODE!=='undefined'&&OPSMODE) return 'mgr.opsmode';

  var role=(typeof ROLE!=='undefined')?ROLE:'advisor';
  var isCli=(role==='client1'||role==='clientN');

  /* בתוך חברה — הסקציה היא הטאב */
  var inCo=(typeof SCOPE!=='undefined')?(SCOPE==='client'):false;
  if(!inCo){
    var vc=document.getElementById('viewCli');
    inCo=!!(vc&&vc.style.display!=='none');
  }
  if(inCo) return (isCli?'cli.':'co.')+(typeof CUR_TAB!=='undefined'?CUR_TAB:'dash');

  /* התיק הגלובלי */
  if(role==='manager')
    return (typeof MGR_VIEW!=='undefined'&&MGR_VIEW==='meets')?'adv.comm':'mgr.ops';
  if(isCli) return 'cli.dash';

  var pv=(typeof ADV_PVIEW!=='undefined')?ADV_PVIEW:'home';
  var MAP={home:'adv.today',alerts:'adv.today',tasks:'adv.tasks',
           meets:'adv.comm',clients:'adv.clients',how:'adv.mem'};
  return MAP[pv]||'adv.today';
}

/* ---------- 2 · שליפת התוכן ----------
   לרשומה יכולה להיות גרסת לקוח (cli_lede/cli_secs) — white-label,
   בלי מונחים פנימיים. בתצוגת לקוח היא גוברת. */
function helpFor(key){
  var H=(typeof HELP_CONTENT!=='undefined')?HELP_CONTENT:{};
  var role=(typeof ROLE!=='undefined')?ROLE:'advisor';
  var isCli=(role==='client1'||role==='clientN');

  var e=H[key];
  /* מסך לקוח בלי רשומה משלו — נופל לרשומת החברה עם גרסת הלקוח שלה */
  if(!e&&key.indexOf('cli.')===0) e=H['co.'+key.slice(4)];
  if(!e) return null;

  if(isCli&&e.cli_secs&&e.cli_secs.length)
    return {t:e.t, lede:e.cli_lede||e.lede, secs:e.cli_secs, shots:e.shots||[]};
  return {t:e.t, lede:e.lede, secs:e.secs||[], shots:e.shots||[]};
}

/* ---------- 3 · הפופאפ ---------- */
var OPEN=false, LAST=null;

function esc(s){return String(s==null?'':s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* הדגשה קלה: **מודגש** ו«מונח» — בלי מנוע markdown שלם */
function rich(s){
  return esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');
}

function shotHtml(name){
  if(!name) return '';
  return '<figure class="hlp-shot"><img loading="lazy" src="docs/shots/'+esc(name)+
         '.png" alt=""></figure>';
}

function render(){
  var key=helpKey(), d=helpFor(key);
  var body=document.getElementById('hlpBody');
  var ttl=document.getElementById('hlpTitle');
  var nav=document.getElementById('hlpNav');
  if(!body) return;

  if(!d){
    ttl.textContent='עזרה';
    nav.innerHTML='';
    body.innerHTML='<div class="hlp-none">'+
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.7.6-.7 1.1v.5"/><path d="M12 17h.01"/></svg>'+
      '<b>עוד לא נכתב הסבר למסך הזה</b>'+
      '<span>המסך עצמו עובד — רק ההסבר טרם נכתב. אפשר להמשיך לעבוד כרגיל.</span>'+
      '<i class="hlp-key">'+esc(key)+'</i></div>';
    return;
  }

  ttl.textContent=d.t;
  nav.innerHTML=d.secs.map(function(s,i){
    return '<button type="button" onclick="hlpJump('+i+')">'+esc(s.h)+'</button>';
  }).join('');

  body.innerHTML=
    '<p class="hlp-lede">'+rich(d.lede)+'</p>'+
    (d.shots&&d.shots.length?shotHtml(d.shots[0]):'')+
    d.secs.map(function(s,i){
      return '<section class="hlp-sec" id="hlpSec'+i+'">'+
        '<h3>'+esc(s.h)+'</h3>'+
        '<p>'+rich(s.b)+'</p>'+
        (s.shot?shotHtml(s.shot):'')+
      '</section>';
    }).join('');
  body.scrollTop=0;
}

function open(){
  var w=document.getElementById('hlpWrap'); if(!w) return;
  LAST=document.activeElement;
  render();
  w.classList.add('on');
  document.body.classList.add('hlp-open');
  OPEN=true;
  var x=document.getElementById('hlpX'); if(x) x.focus();
}
function close(){
  var w=document.getElementById('hlpWrap'); if(!w) return;
  w.classList.remove('on');
  document.body.classList.remove('hlp-open');
  OPEN=false;
  if(LAST&&LAST.focus) LAST.focus();
}
function toggle(){ OPEN?close():open(); }

function jump(i){
  var el=document.getElementById('hlpSec'+i); if(!el) return;
  el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ---------- 4 · חיווט ---------- */
function boot(){
  if(document.getElementById('hlpWrap')) return;

  /* הכפתור בפס העליון — לפני תיבת ההודעות, כי עזרה היא פחות דחופה */
  var host=document.querySelector('.topbar .top-right');
  if(host){
    var b=document.createElement('button');
    b.className='tb-help'; b.id='tbHelp'; b.type='button';
    b.setAttribute('aria-label','עזרה על המסך הזה');
    b.title='עזרה על המסך הזה';
    b.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.2"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.1 2.4c-.55.18-.75.62-.75 1.15v.45"/><path d="M12 16.9h.01"/></svg>';
    b.onclick=toggle;
    var msg=document.getElementById('tbMsg');
    if(msg&&msg.parentNode===host) host.insertBefore(b,msg); else host.appendChild(b);
  }

  /* המעטפת */
  var w=document.createElement('div');
  w.id='hlpWrap'; w.className='hlp-wrap';
  w.innerHTML=
    '<div class="hlp-bd" id="hlpBd"></div>'+
    '<div class="hlp-panel" role="dialog" aria-modal="true" aria-labelledby="hlpTitle">'+
      '<header class="hlp-h">'+
        '<div class="hlp-h-t"><span class="hlp-cap">עזרה</span><h2 id="hlpTitle"></h2></div>'+
        '<button class="hlp-x" id="hlpX" type="button" aria-label="סגירה">'+
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'+
        '</button>'+
      '</header>'+
      '<div class="hlp-body-wrap">'+
        '<nav class="hlp-nav" id="hlpNav"></nav>'+
        '<div class="hlp-body" id="hlpBody"></div>'+
      '</div>'+
    '</div>';
  document.body.appendChild(w);

  document.getElementById('hlpX').onclick=close;
  document.getElementById('hlpBd').onclick=close;
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&OPEN) close();
    /* ? פותח עזרה — אלא אם מקלידים בשדה */
    if(e.key==='?'&&!OPEN){
      var t=e.target.tagName;
      if(t!=='INPUT'&&t!=='TEXTAREA'&&!e.target.isContentEditable){ e.preventDefault(); open(); }
    }
  });
}

window.hlpOpen=open; window.hlpClose=close; window.hlpToggle=toggle;
window.hlpJump=jump; window.hlpKey=helpKey;

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
})();
