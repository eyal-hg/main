/* HK Dashboard — bootstrap */
  if(location.hash==='#ops') history.replaceState(null,'',location.pathname+location.search);
  renderRail(); renderBoard(); updateOpsBtn(); refreshMsgBadge();
  setRole('manager');
  /* כניסה ישירה לדשבורד חברה — ?hp=<ח.פ> (ממסך הלקוחות של היועץ) */
  (function(){
    const hp=new URLSearchParams(location.search).get('hp'); if(!hp) return;
    const ix=CLIENTS.findIndex(c=>c.hp===hp);
    if(ix>=0) selectClient(ix);
  })();
