/* =====================================================================
   qa/shot-boot.js — צינור צילומי המסך
   נטען זמנית בסוף js/main.js, קורא ?shot=KEY מהכתובת ומנווט למסך.
   מוסר אחרי הריצה. הרישום כאן הוא המקור היחיד לשמות הצילומים.
   ===================================================================== */
(function(){
  var KEY=new URLSearchParams(location.search).get('shot'); if(!KEY) return;

  /* פונקציית עזר: מריצה שלב אחרי המתנה, ומסמנת סיום ב-title */
  function seq(steps){
    var i=0;
    (function next(){
      if(i>=steps.length){ document.title='SHOT-READY'; return; }
      var s=steps[i++];
      try{ s.fn(); }catch(e){ document.title='SHOT-ERR '+e.message; return; }
      setTimeout(next, s.wait||450);
    })();
  }
  var R=function(r){return {fn:function(){setRole(r)},wait:500}};
  var G=function(k){return {fn:function(){gnavGo(k)},wait:800}};
  var C=function(i){return {fn:function(){selectClient(i||0)},wait:900}};
  var T=function(k){return {fn:function(){showTab(k)},wait:1100}};
  var F=function(fn,w){return {fn:fn,wait:w||700}};

  var SHOTS={
    /* ---------- היועץ · גלובלי ---------- */
    'adv-today'   :[R('advisor'),G('today')],
    'adv-tasks'   :[R('advisor'),G('tasks')],
    'adv-cal'     :[R('advisor'),G('cal')],
    'adv-comm'    :[R('advisor'),G('meets')],
    'adv-comm-unid':[R('advisor'),G('meets'),F(function(){
        var f=document.getElementById('advMeetsFrame');
        f.contentWindow.mtView('unid');},900)],
    'adv-comm-wa' :[R('advisor'),G('meets'),F(function(){
        var f=document.getElementById('advMeetsFrame');
        f.contentWindow.arenaShow('w0207');},900)],
    'adv-comm-ai' :[R('advisor'),G('meets'),F(function(){
        var f=document.getElementById('advMeetsFrame');
        f.contentWindow.arenaShow('a0207');},900)],
    'adv-clients' :[R('advisor'),G('clients')],

    /* ---------- בתוך חברה · תצוגת יועץ ---------- */
    'co-dash'     :[R('advisor'),C(0),T('dash')],
    'co-msgs'     :[R('advisor'),C(0),T('msgs')],
    'co-calls'    :[R('advisor'),C(0),T('calls')],
    'co-meetings' :[R('advisor'),C(0),T('meetings')],
    'co-mem'      :[R('advisor'),C(0),T('mem')],
    'co-chat'     :[R('advisor'),C(0),T('chat')],
    'co-metrics'  :[R('advisor'),C(0),T('metrics')],
    'co-entries'  :[R('advisor'),C(0),T('entries')],
    'co-budget'   :[R('advisor'),C(0),T('budget')],
    'co-acct'     :[R('advisor'),C(0),T('acct')],
    'co-fcast'    :[R('advisor'),C(0),T('fcast')],
    'co-past'     :[R('advisor'),C(0),T('past')],
    'co-flow'     :[R('advisor'),C(0),T('flow')],
    'co-coset'    :[R('advisor'),C(0),T('coset')],

    /* ---------- מנהל התזרים ---------- */
    'mgr-ops'     :[R('manager'),G('ops')],
    'mgr-comm'    :[R('manager'),G('meets')],

    /* ---------- תצוגת הלקוח (white-label) ---------- */
    'cli-dash'    :[R('client1'),F(function(){selectClient(0)},900),T('dash')],
    'cli-chat'    :[R('client1'),F(function(){selectClient(0)},900),T('chat')],
    'cli-msgs'    :[R('client1'),F(function(){selectClient(0)},900),T('msgs')],
    'cli-meetings':[R('client1'),F(function(){selectClient(0)},900),T('meetings')],
    'cli-fcast'   :[R('client1'),F(function(){selectClient(0)},900),T('fcast')],
    'cli-entries' :[R('client1'),F(function(){selectClient(0)},900),T('entries')],

    /* ---------- אזור הניהול ---------- */
    'adm-meetings':[R('manager'),F(function(){openAdmin()},900)],
    'adm-dailyops':[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('dailyops')},1100)],
    'adm-leads'   :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('leads')},1100)],
    'adm-advisors':[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('advisors')},1100)],
    'adm-billing' :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('billing')},1100)],
    'adm-messages':[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('messages')},1100)],
    'adm-phones'  :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('phones')},1100)],
    'adm-tags'    :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('tags')},1100)],
    'adm-kb'      :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('kb')},1100)],
    'adm-aitests' :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('aitests')},1100)],
    'adm-calendar':[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('calendar')},1100)],
    'adm-memory'  :[R('manager'),F(function(){openAdmin()},700),F(function(){admGo('memory')},1100)]
  };

  var s=SHOTS[KEY];
  if(!s){ document.title='SHOT-MISS '+KEY; return; }
  setTimeout(function(){ seq(s); }, 450);
})();
