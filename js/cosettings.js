/* ===== הגדרות חברה — מסך פר-חברה עם טאבים ===== */
let COSET_TAB='details';
const CO_TABS=[
  {k:'details', l:'פרטי לקוח'},
  {k:'contacts',l:'אנשי קשר'},
  {k:'ops',     l:'תפעולי'},
  {k:'finance', l:'פיננסים'},
  {k:'memory',  l:'זיכרון לקוח'},
];
/* דמו — נתוני החברה (בפרודקשן מהשרת פר חברה) */
const CO_DATA={};
function coData(i){
  if(CO_DATA[i]) return CO_DATA[i];
  const c=CLIENTS[i]||{};
  CO_DATA[i]={
    firstName:'חיים', company:c.name||'', phone:'054-5839787', kind:'company', taxId:c.hp||'',
    field:'שיווק', mgr:c.mgr||'לירון בן כליפא', advisorCo:'HK', notes:'פעיל',
    reason:'', access:'', goals:[{t:'מטרה 1', due:''}],
    contacts:[{first:'חיים', last:'.', role:'CFO', phone:'054-5839787', mail:'haim@easy2success.co.il',
      primary:true, voice:false, toAi:true, app:{flow:false,metrics:false,media:false},
      alerts:{supplier:false, customer:false, budget:true, incLow:false, expHigh:false, overdraft:true, opsDone:true, remind:true, meetSummary:true, tasks:true, monthly:true}}],
    products:{meeting:false, moneyPlus:false, money:true},
    payAccount:'העברה בנקאית', paySum:'1000', payType:'אשראי', trialEnd:'', payLast:'', payNext:'26.06.2026', ccDigits:''
  };
  return CO_DATA[i];
}
let COSET_CONTACT=0;

function renderCoSet(){
  const el=document.getElementById('viewCoSet'); if(!el) return;
  const c=CLIENTS[CUR]||{}; const d=coData(CUR);
  el.innerHTML=`
    <div class="cos-head">
      <div class="cos-ttl">הגדרות חברה — ${c.name||''} <span>${c.hp||''}</span></div>
      <div class="cos-acts">
        <button class="cos-link" onclick="toast('החברה הועברה לארכיון')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg> העברה לארכיון</button>
        <button class="cos-link danger" onclick="hkConfirm('מחיקת חברה','החברה תימחק לצמיתות. לא ניתן לשחזר.','מחיקה',()=>toast('החברה נמחקה'))"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> מחיקת חברה</button>
      </div>
    </div>
    <div class="cos-tabs">${CO_TABS.map(t=>`<button class="cos-tab ${COSET_TAB===t.k?'on':''}" onclick="coSetTab('${t.k}')">${t.l}</button>`).join('')}</div>
    <div class="cos-body" id="cosBody"></div>
    ${COSET_TAB==='memory'?'':`<div class="cos-foot"><button class="mx2-btn primary" onclick="coSetSave()">אישור</button><button class="mx2-btn" onclick="showTab('dash')">ביטול</button></div>`}`;
  renderCoBody();
}
function coSetTab(k){ COSET_TAB=k; renderCoSet(); }
function coSetSave(){ toast('הגדרות החברה נשמרו'); }

function renderCoBody(){
  const el=document.getElementById('cosBody'); if(!el) return;
  const d=coData(CUR);
  if(COSET_TAB==='details') el.innerHTML=coDetails(d);
  else if(COSET_TAB==='contacts') el.innerHTML=coContacts(d);
  else if(COSET_TAB==='ops') el.innerHTML=coOps(d);
  else if(COSET_TAB==='finance') el.innerHTML=coFinance(d);
  else if(COSET_TAB==='memory'){
    el.innerHTML=`<div class="cos-mem"><div class="mem-title" style="display:none"></div><div class="mem-body"></div></div>`;
    MEM_HOST=el.querySelector('.cos-mem'); MEM_CUR=CUR; MEM_USER=0; MEM_EDIT=null;
    renderMemCard();
  }
}
/* ---------- טאב פרטי לקוח ---------- */
function coF(label,inner){ return `<div class="cos-f"><label>${label}</label>${inner}</div>`; }
function coInput(v,ph=''){ return `<input class="mx2-inp" value="${(v||'').toString().replace(/"/g,'&quot;')}" placeholder="${ph}">`; }
function coDetails(d){
  return `<div class="cos-2col">
    <div class="cos-left">
      ${coF('שם פרטי', coInput(d.firstName))}
      ${coF('שם עסק / שם חברה', coInput(d.company))}
      ${coF('טלפון', coInput(d.phone))}
      ${coF('סוג לקוח', `<div class="cr-modes"><span class="mtk-chip ${d.kind==='company'?'on':''}" onclick="coData(CUR).kind='company';renderCoBody()">חברה</span><span class="mtk-chip ${d.kind==='solo'?'on':''}" onclick="coData(CUR).kind='solo';renderCoBody()">עצמאי/ת</span></div>`)}
      ${coF('ח.פ. / ת.ז.', coInput(d.taxId))}
      ${coF('תחום עיסוק', coInput(d.field))}
      ${coF('שם יועץ מתפעל', `<select class="mx2-inp">${[...new Set(CLIENTS.map(c=>c.mgr))].map(n=>`<option ${n===d.mgr?'selected':''}>${n}</option>`).join('')}</select>`)}
      ${coF('הערות', `<textarea class="mx2-inp" rows="3" style="resize:vertical">${d.notes||''}</textarea>`)}
    </div>
    <div class="cos-right">
      ${coF('סיבת הגעה לייעוץ', `<textarea class="mx2-inp" rows="8" style="resize:vertical" placeholder="איך הגיע הלקוח, מה הצורך…">${d.reason||''}</textarea>`)}
      ${coF('מטרות מרכזיות', `<div id="coGoals">${d.goals.map((g,ix)=>`<div class="cos-goal"><span class="cos-gn">${ix+1}</span><input class="mx2-inp" value="${g.t||''}" placeholder="מטרה"><input class="mx2-inp" type="date" style="width:150px" value="${g.due||''}"></div>`).join('')}</div>
        <button class="cos-add" onclick="coData(CUR).goals.push({t:'',due:''});renderCoBody()">+ הוסף מטרה</button>`)}
      ${coF('גישת ייעוץ', coInput(d.access))}
    </div>
  </div>`;
}
/* ---------- טאב אנשי קשר ---------- */
const CO_ALERTS=[
  ['supplier','הודעות על גבייה מספקים'],['customer','הודעות על גבייה מלקוחות'],
  ['budget','הודעות על חריגות בתקציב'],['incLow','הודעות על קצב נמוך בהכנסות'],
  ['expHigh','הודעות על קצב גבוה בהוצאות'],['overdraft','הודעה על חריגה בחשבון'],
  ['opsDone','הודעות על סיום תפעול'],['remind','הודעות על שליחת תזכורת ללקוח'],
  ['meetSummary','הודעות על סיכום פגישה'],['tasks','הודעות על משימות לאחר פגישה'],
  ['monthly','הודעות על דו״ח חודשי'],
];
function coContacts(d){
  const list=d.contacts.map((ct,ix)=>`<div class="cos-ct-item ${ix===COSET_CONTACT?'on':''}" onclick="COSET_CONTACT=${ix};renderCoBody()">
    <div><b>${ct.first} ${ct.last}</b>${ct.primary?'<span class="cos-primary">ראשי</span>':''}</div>
    <i>${ct.role||''} · ${ct.phone||''}</i></div>`).join('');
  const ct=d.contacts[COSET_CONTACT]||d.contacts[0]; const i=COSET_CONTACT;
  const ck=(k,label)=>`<label class="cos-ck"><input type="checkbox" ${ct.alerts[k]?'checked':''} onchange="coData(CUR).contacts[${i}].alerts.${k}=this.checked"><span>${label}</span></label>`;
  return `<div class="cos-ct-split">
    <aside class="cos-ct-list"><div class="cos-ct-h">אנשי קשר</div>${list}
      <button class="cos-ct-add" onclick="coData(CUR).contacts.push({first:'חדש',last:'',role:'',phone:'',mail:'',primary:false,voice:false,toAi:false,app:{flow:false,metrics:false,media:false},alerts:{}});COSET_CONTACT=coData(CUR).contacts.length-1;renderCoBody()">+ הוסף איש קשר</button>
    </aside>
    <div class="cos-ct-edit">
      <div class="cos-ct-title">עריכת איש קשר</div>
      <label class="cos-ck grp"><input type="checkbox"><span>איש קשר מסוג קבוצה</span></label>
      <div class="cos-2f">${coF('שם פרטי', coInput(ct.first))}${coF('שם משפחה', coInput(ct.last))}</div>
      <div class="cos-2f">${coF('תפקיד', coInput(ct.role))}${coF('טלפון', coInput(ct.phone))}</div>
      ${coF('מייל', coInput(ct.mail))}
      <div class="cos-ck-row">
        <label class="cos-ck"><input type="checkbox" ${ct.primary?'checked':''}><span>איש קשר ראשי</span></label>
        <label class="cos-ck"><input type="checkbox" ${ct.voice?'checked':''}><span>מקבל הודעות קוליות</span></label>
        <label class="cos-ck"><input type="checkbox" ${ct.toAi?'checked':''}><span>העברת הודעות ל-AI</span></label>
      </div>
      <div class="cos-sub-h">גישה לאפליקציה</div>
      <div class="cos-ck-row">
        <label class="cos-ck"><input type="checkbox" ${ct.app.flow?'checked':''}><span>התהליך שלי</span></label>
        <label class="cos-ck"><input type="checkbox" ${ct.app.metrics?'checked':''}><span>מדדים</span></label>
        <label class="cos-ck"><input type="checkbox" ${ct.app.media?'checked':''}><span>מדיה</span></label>
      </div>
      <div class="cos-sub-h">הגדרת הודעות</div>
      <div class="cos-alerts">${CO_ALERTS.map(a=>ck(a[0],a[1])).join('')}</div>
      <div class="cos-ct-del"><button class="cos-link danger" onclick="coData(CUR).contacts.splice(${i},1);COSET_CONTACT=0;renderCoBody()">מחק איש קשר</button></div>
    </div>
  </div>`;
}
/* ---------- טאב תפעולי ---------- */
function coOps(d){
  return `<div class="cos-narrow">
    ${coF('מנהל תזרים', `<select class="mx2-inp" style="width:100%">${[...new Set(CLIENTS.map(c=>c.mgr))].map(n=>`<option ${n===d.mgr?'selected':''}>${n}</option>`).join('')}</select>`)}
    ${coF('חברת ייעוץ', `<select class="mx2-inp" style="width:100%"><option>HK</option><option>אשכנזי ייעוץ עסקי</option><option>ברק ושות׳</option></select>`)}
  </div>`;
}
/* ---------- טאב פיננסים ---------- */
function coFinance(d){
  const prod=(k,logo)=>`<label class="cos-prod ${d.products[k]?'on':''}"><input type="checkbox" ${d.products[k]?'checked':''} onchange="coData(CUR).products.${k}=this.checked;renderCoBody()"><span class="cos-prod-logo">${logo}</span></label>`;
  return `<div class="cos-sub-h big">מוצרים</div>
    <div class="cos-prods">
      ${prod('meeting','HK <b>Meeting</b>')}
      ${prod('moneyPlus','HK <b>Money +</b>')}
      ${prod('money','HK <b>Money</b>')}
    </div>
    <div class="cos-sub-h big">תשלום</div>
    ${coF('חשבון משלם', `<select class="mx2-inp" style="width:100%"><option>העברה בנקאית</option><option>הוראת קבע אשראי</option><option>המחאה</option></select>`)}
    <div class="cos-3f">
      ${coF('סכום תשלום', coInput(d.paySum))}
      ${coF('סוג תשלום', `<select class="mx2-inp"><option ${d.payType==='אשראי'?'selected':''}>אשראי</option><option>העברה</option><option>מזומן</option></select>`)}
      ${coF('תאריך סיום חודש ניסיון', `<input class="mx2-inp" type="date" value="${d.trialEnd||''}">`)}
    </div>
    <div class="cos-3f">
      ${coF('ספרות אחרונות של כ.אשראי', coInput(d.ccDigits))}
      ${coF('תאריך תשלום אחרון', `<input class="mx2-inp" type="date" value="${d.payLast||''}">`)}
      ${coF('תאריך תשלום הבא', `<input class="mx2-inp" type="date" value="2026-06-26">`)}
    </div>`;
}
