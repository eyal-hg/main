/* HK Dashboard — client rail, company switcher */
  /* ---- rail ---- */
  function renderRail(){
    const q=document.getElementById('railQ').value.trim();
    let list=CLIENTS.map((c,i)=>({c,i}));
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

