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


/* ===== אנשי קשר — פופאפ עם שליחת וואטסאפ חופשית ===== */
let _ctsWa=null;
function ctsList(){
  const base=(typeof MEM_USERS!=='undefined'&&MEM_USERS[CUR])?MEM_USERS[CUR].map(u=>({n:u.n,role:u.role||'איש קשר'})):[];
  if(!base.length) base.push({n:'בעל העסק',role:'איש קשר ראשי'});
  return base.map((u,i)=>Object.assign({phone:'05'+(2+i)+'-'+(2340000+CUR*7+i*111).toString().slice(0,3)+'-'+(4520+i*17)},u));
}
function ctsOpen(){
  _ctsWa=null;
  document.getElementById('ctsCo').textContent=(CLIENTS[CUR]||{}).name||'';
  ctsRender();
  document.getElementById('ctsOv').classList.add('show');
}
function ctsClose(){document.getElementById('ctsOv').classList.remove('show');}
function ctsRender(){
  document.getElementById('ctsBody').innerHTML=ctsList().map((u,i)=>`
    <div class="cts-row">
      <div class="cts-av">${u.n.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
      <div class="cts-info"><b>${u.n}</b><span>${u.role} · <bdo dir="ltr">${u.phone}</bdo></span></div>
      <button class="cts-wa ${_ctsWa===i?'on':''}" onclick="ctsWa(${i})">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/></svg>
        וואטסאפ</button>
    </div>
    ${_ctsWa===i?`<div class="cts-comp">
      <textarea id="ctsTxt" placeholder="הודעה ל${u.n}…" rows="2"></textarea>
      <button class="cts-send" onclick="ctsSend(${i})">שליחה</button>
    </div>`:''}`).join('');
  if(_ctsWa!=null){const e=document.getElementById('ctsTxt'); if(e)e.focus();}
}
function ctsWa(i){_ctsWa=(_ctsWa===i)?null:i; ctsRender();}
function ctsSend(i){
  const e=document.getElementById('ctsTxt'); const v=(e&&e.value.trim())||'';
  if(!v){e&&e.focus();return;}
  const u=ctsList()[i];
  _ctsWa=null; ctsRender();
  toast('נשלח בוואטסאפ ל'+u.n+' — "'+(v.length>40?v.slice(0,40)+'…':v)+'"');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')ctsClose();});
