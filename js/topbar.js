/* HK Dashboard — status menu, products filter, messages inbox, consolidated report */
  const STAT_LIST=[['active','פעיל','#16a34a'],['trial','ניסיון','#e8a13a'],['setup','בהקמה','#39ABE2']];
  function opsStatMenu(i,el){
    const m=document.getElementById('statMenu'), cur=CLIENTS[i].stat||'active';
    m.innerHTML=STAT_LIST.map(s=>`<div class="stat-opt ${cur===s[0]?'on':''}" onclick="setCompanyStat(${i},'${s[0]}')"><span class="sdot" style="background:${s[2]}"></span>${s[1]}</div>`).join('');
    const r=el.getBoundingClientRect();
    m.style.top=(r.bottom+6)+'px';
    m.style.right=Math.max(8,(window.innerWidth-r.right))+'px';
    m.classList.add('show');
  }
  function setCompanyStat(i,s){CLIENTS[i].stat=s;document.getElementById('statMenu').classList.remove('show');renderOpsQueue();toast('סטטוס הלקוח עודכן');}
  function renderProdMenu(){document.getElementById('prodMenu').innerHTML=Object.keys(PRODUCTS).map(p=>`<label class="prod-opt">${prodLogo(p,'lg')}<input type="checkbox" ${PROD_FILTER.has(p)?'checked':''} onchange="toggleProdFilter('${p}')"></label>`).join('');}
  function toggleProd(e){e.stopPropagation();renderProdMenu();document.getElementById('prodMenu').classList.toggle('show');}
  function toggleProdFilter(p){PROD_FILTER.has(p)?PROD_FILTER.delete(p):PROD_FILTER.add(p);renderProdMenu();if(document.getElementById('opsQueueView').style.display!=='none')renderOpsQueue();}
  document.addEventListener('click',function(e){const m=document.getElementById('prodMenu');if(m&&m.classList.contains('show')&&!m.contains(e.target)&&e.target.id!=='prodDdl')m.classList.remove('show');});
  document.addEventListener('click',function(e){const m=document.getElementById('statMenu');if(m&&m.classList.contains('show')&&!m.contains(e.target))m.classList.remove('show');});
  function opsqToggle(i){opsqOpen.has(i)?opsqOpen.delete(i):opsqOpen.add(i);renderOpsQueue();}
  function opsQueueMsg(i){selectClient(i);showTab('msgs');}
  function opsQueueEnter(i){selectClient(i);enterOps();}

  /* ---- messages inbox (top bar) ---- */
  function totalUnread(){return CLIENTS.reduce((s,c)=>s+(c.unread||0),0);}
  function refreshMsgBadge(){const n=totalUnread();const b=document.getElementById('tbBadge');b.textContent=n;b.style.display=n?'flex':'none';}
  function toggleInbox(e){e.stopPropagation();const open=document.getElementById('inbox').classList.contains('show');closeInbox();
    if(!open){renderInbox();document.getElementById('inbox').classList.add('show');document.getElementById('inboxOv').classList.add('show');}}
  function closeInbox(){document.getElementById('inbox').classList.remove('show');document.getElementById('inboxOv').classList.remove('show');}
  function renderInbox(){
    const convos=CLIENTS.map((c,i)=>({c,i})).filter(x=>x.c.unread>0).sort((a,b)=>b.c.unread-a.c.unread);
    document.getElementById('inboxSub').textContent=totalUnread()+' חדשות';
    const el=document.getElementById('inboxList');
    if(!convos.length){el.innerHTML='<div class="inbox-empty">אין הודעות חדשות</div>';return;}
    el.innerHTML=convos.map(({c,i})=>`<div class="ibrow" onclick="openChatFor(${i})">
      <div class="ib-av">${c.name.trim().charAt(0)}</div>
      <div class="ib-body"><div class="ib-top"><span class="ib-name">${c.name}</span><span class="ib-time">${c.sync||''}</span></div>
      <div class="ib-prev">${c.preview||'הודעה חדשה מהלקוח'}</div></div>
      <span class="ib-badge">${c.unread}</span></div>`).join('');
  }
  function openChatFor(i){closeInbox();selectClient(i);showTab('msgs');}
  function markHandled(){CLIENTS[CUR].unread=0;refreshMsgBadge();closeChat();toast('הלקוח סומן כטופל');}

  /* consolidated cashflow report */
  function openCR(){const fr=document.getElementById('crFrame');if(!fr.getAttribute('src'))fr.setAttribute('src','widgets/widget-cashflow-portfolio.html#embed');document.getElementById('crOv').classList.add('show');}
  function closeCR(){document.getElementById('crOv').classList.remove('show');}

