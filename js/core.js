/* HK Dashboard — client rail, company switcher */
  /* ---- action safety: confirm dialog + undoable toast ---- */
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
  let _undoFn=null,_undoTimer=null;
  function toastUndo(msg,undoFn){
    _undoFn=undoFn;
    const t=document.getElementById('toast');
    t.innerHTML='✓ '+msg+' <button class="toast-undo" onclick="doUndo()">ביטול</button>';
    t.classList.add('show');
    clearTimeout(_undoTimer);
    _undoTimer=setTimeout(()=>{t.classList.remove('show');_undoFn=null;},5000);
  }
  function doUndo(){
    if(_undoFn)_undoFn();
    _undoFn=null;clearTimeout(_undoTimer);
    document.getElementById('toast').classList.remove('show');
  }
  // Esc סוגר כל חלונית פתוחה
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    [['cfOv','show'],['ctOv','show'],['mxOv','show'],['acOv','show'],['msOv','show'],['pkOv','show'],['pk','show'],['crOv','show'],['drawerOv','show'],['drawer','show'],['inboxOv','show'],['inbox','show'],['swDD','show'],['prodMenu','show'],['statMenu','show']]
      .forEach(([id,cls])=>{const el=document.getElementById(id);if(el)el.classList.remove(cls);});
  });

  /* ---- rail ---- */
  function renderRail(){
    // הסרגל הפך לניווט גלובלי — רשימת הלקוחות עברה לתצוגת "לקוחות"
    if(!document.getElementById('railQ')){if(typeof renderGlobalRail==='function')renderGlobalRail();return;}
    const q=document.getElementById('railQ').value.trim();
    let list=CLIENTS.map((c,i)=>({c,i}));
    if(typeof MGR_FILTER!=='undefined'&&MGR_FILTER) list=list.filter(x=>x.c.mgr===MGR_FILTER);
    if(q) list=list.filter(x=>x.c.name.includes(q)||x.c.hp.includes(q)||x.c.mgr.includes(q));
    document.getElementById('cliCount').textContent=list.length;
    document.getElementById('railList').innerHTML=list.map(({c,i})=>{
      const k='c'+i;
      const dot = opsAccum[k] ? 'prog' : (c.opsAlert ? 'warn' : (c.status==='active'?'active':'off'));
      const badge=c.unread>0?`<span class="cbadge">${c.unread}</span>`:'';
      return `<div class="cli ${i===CUR?'on':''}" onclick="selectClient(${i})" title="${c.name} · ${c.mgr}">
        <span class="dot ${dot}"></span>
        <div class="ci"><div class="cn">${c.name}</div><div class="cs">${c.mgr} · ${c.sync||''}</div></div>
        ${badge}</div>`;
    }).join('');
  }
  function selectClient(i){
    CUR=i; const c=CLIENTS[i];
    document.getElementById('curName').textContent=c.name;
    document.getElementById('curHp').textContent=c.hp;
    document.getElementById('headName').textContent=c.name;
    document.getElementById('headHp').textContent=c.hp;
    setScope('client');
    renderRail();
    toast('נטען הדשבורד של '+c.name);
  }
  function toggleRail(){document.getElementById('shell').classList.toggle('collapsed');}

  /* top client-switcher dropdown — with live search */
  function toggleSwitcher(e){
    e.stopPropagation();
    const dd=document.getElementById('swDD');
    if(dd.classList.contains('show')){dd.classList.remove('show');return;}
    dd.innerHTML=`
      <div class="sw-search" onclick="event.stopPropagation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>
        <input id="swQ" placeholder="חיפוש חברה / ח.פ / מנהל תזרים" oninput="swFilter(this.value)">
      </div>
      <div id="swList"></div>`;
    swFilter('');
    dd.classList.add('show');
    setTimeout(()=>{const q=document.getElementById('swQ');if(q)q.focus();},50);
  }
  function swFilter(q){
    q=(q||'').trim();
    const hits=CLIENTS.map((c,i)=>({c,i})).filter(x=>!q||x.c.name.includes(q)||x.c.hp.includes(q)||x.c.mgr.includes(q));
    document.getElementById('swList').innerHTML=
      (q?'':'<div class="sw-item pinned" onclick="pickSwitcher(\'p\')"><span class="sdot" style="background:var(--navy)"></span><div><div class="nm">כל החברות</div><div class="sb">תיק לקוחות · 12 חברות</div></div></div>')
      +(hits.length?hits.map(({c,i})=>`<div class="sw-item" onclick="pickSwitcher(${i})"><span class="sdot" style="background:${c.warn?'var(--coral)':'var(--green)'}"></span><div><div class="nm">${c.name}</div><div class="sb">${c.hp} · ${c.mgr}</div></div></div>`).join('')
        :'<div class="sw-empty">לא נמצאו חברות ל"'+q+'"</div>');
  }
  function pickSwitcher(v){document.getElementById('swDD').classList.remove('show');if(v==='p')selectPortfolio();else selectClient(v);}
  document.addEventListener('click',()=>document.getElementById('swDD').classList.remove('show'));

