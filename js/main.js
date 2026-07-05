/* HK Dashboard — bootstrap */
  if(location.hash==='#ops') history.replaceState(null,'',location.pathname+location.search);
  renderRail(); renderBoard(); updateOpsBtn(); refreshMsgBadge();
  setRole('manager');
