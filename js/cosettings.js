/* ===== הגדרות חברה — מסך פר-חברה עם טאבים ===== */
let COSET_TAB='details';
const CO_TABS=[
  {k:'details', l:'פרטי לקוח'},
  {k:'contacts',l:'אנשי קשר'},
  {k:'ops',     l:'תפעולי'},
  /* "פיננסים" ו"זיכרון לקוח" ירדו: המוצרים והחיוב הם נתון מערכת ולא הגדרה
     פר-חברה, והזיכרון חי כרובד בתוך החברה ("זיכרון החברה") ולא כטאב הגדרות.
     הפונקציות coFinance ו-coMemory נשארו — הן עוד עשויות לחזור. */
];
/* דמו — נתוני החברה (בפרודקשן מהשרת פר חברה) */
const CO_DATA={};
function coData(i){
  if(CO_DATA[i]) return CO_DATA[i];
  const c=CLIENTS[i]||{};
  CO_DATA[i]={
    firstName:'חיים', company:c.name||'', phone:'054-5839787', kind:'company', taxId:c.hp||'',
    field:'שיווק', mgr:c.mgr||'טל מלקר', advisorCo:'HK', notes:'פעיל',
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

/* "תפעולי" הוא פנימי ל-HK — ליועצים אין אותו. ארכיון יושב בפרטי לקוח כדי שגם הם ישנו. */
const coHK=()=>typeof ROLE==='undefined'||ROLE==='manager';
function coTabs(){ return CO_TABS.filter(t=>t.k!=='ops'||coHK()); }
function renderCoSet(){
  if(COSET_TAB==='ops'&&!coHK()) COSET_TAB='details';
  const el=document.getElementById('viewCoSet'); if(!el) return;
  const c=CLIENTS[CUR]||{}; const d=coData(CUR);
  el.innerHTML=`
    <div class="cos-head">
      <div class="cos-ttl">הגדרות חברה — ${c.name||''} <span>${c.hp||''}</span></div>
      <div class="cos-acts">
        ${coState(c)==='arch'
          ?`<button class="cos-link back" onclick="coRestore(CUR)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> החזרה לפעילות</button>`
          :`<button class="cos-link" onclick="coArchAsk()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4"/></svg> העברה לארכיון</button>`}
        <button class="cos-link danger" onclick="hkConfirm('מחיקת חברה','החברה תימחק לצמיתות. לא ניתן לשחזר.','מחיקה',()=>toast('החברה נמחקה'))"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> מחיקת חברה</button>
      </div>
    </div>
    <div class="cos-tabs">${coTabs().map(t=>`<button class="cos-tab ${COSET_TAB===t.k?'on':''}" onclick="coSetTab('${t.k}')">${t.l}</button>`).join('')}</div>
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
/* סטטוס התקשרות — שייך לפרטי הלקוח, ולכן גם היועצים משנים אותו.
   זה לא המצב התפעולי (פעיל/בהקמה) שהוא פנימי ל-HK. */
function coArchHtml(){
  const c=CLIENTS[CUR]||{}, arch=coState(c)==='arch';
  return `<div class="cos-arch ${arch?'on':''}">
    <div class="ca-l">
      <div class="ca-t">${arch?'בארכיון':'בהתקשרות'}</div>
      <div class="ca-s">${arch
        ? (c.archOn?'מאז '+c.archOn:'')+(c.archWhy?' · '+c.archWhy:'')
        : 'החברה בתיק — מופיעה במחליף החברות, במסך הלקוחות ובחיוב.'}</div>
    </div>
    ${arch
      ? `<button class="ca-btn back" onclick="coRestore(CUR)">החזרה לפעילות</button>`
      : `<button class="ca-btn" onclick="coArchAsk()">העברה לארכיון</button>`}
  </div>
  ${arch?`${coF('סיבת היציאה', `<input class="mx2-inp" value="${(c.archWhy||'').replace(/"/g,'&quot;')}"
      onchange="CLIENTS[CUR].archWhy=this.value" placeholder="למה הלקוח יצא">`)}`:''}`;
}
function coDetails(d){
  return `<div class="cos-2col">
    <div class="cos-left">
      ${coF('סטטוס התקשרות', coArchHtml())}
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
/* ===== מצב החברה — השדה שקובע אם היא בתור, במחליף, במדדים ובחיוב =====
   חמישה מצבים תפעוליים. ארכיון הוא סטטוס התקשרות ונקבע בפרטי לקוח —
   הוא מוציא את החברה מכל מקום ולכן דורש אישור בתוך המסך. */
let COSET_ARCH=false;
const CO_ST=[
  ['active','פעיל',        'בתור התפעול היומי, במחליף החברות, במדדים ובחיוב.'],
  ['setup', 'בהקמה',       'ממתינה להרשאות בנק — לא נכנסת לתור ולא נספרת במדדי היום. נשארת במחליף כדי שאפשר יהיה להקים אותה.'],
  ['trial', 'חודש ניסיון', 'מתופעלת במלואה כמו חברה פעילה, אבל עדיין לא בחיוב. בסוף החודש מחליטים.'],
  ['off',   'לא פעיל',     'ההתקשרות הופסקה זמנית — לא בתור, לא במדדים ולא בחיוב. הנתונים נשמרים.'],
  ['new',   'חדש',         'נקלטה זה עתה — עוד לא הוגדרו לה מנהל תזרים, מוצר או הרשאות.']];
let CO_ST_OPEN=false;
function coStTg(k){ CO_ST_OPEN=false; coApplySt(k); }
function coStDd(e){ if(e)e.stopPropagation(); CO_ST_OPEN=!CO_ST_OPEN; renderCoSet(); }
/* העברה לארכיון — פעולה של סטטוס ההתקשרות, עם אישור בתוך המערכת */
function coArchAsk(i){
  const c=CLIENTS[i!=null?i:CUR]; if(!c) return;
  hkConfirm('העברת '+c.name+' לארכיון',
    'החברה תצא מתור התפעול, מהמחליף בטופבר, ממדדי היום ומהחיוב. אפשר להחזיר אותה לפעילות בכל רגע.',
    'העברה לארכיון', ()=>coArchGo(i));
}
function coArchGo(i){
  const ix=i!=null?i:CUR, c=CLIENTS[ix]; if(!c) return;
  c.advStatus='ארכיון'; c.archOn=c.archOn||'02.07.2026'; c.archWhy=c.archWhy||'הועברה לארכיון מהגדרות החברה';
  coAfterSt(c,'arch');
}
/* החזרה לפעילות מכל מקום (כרטיס במסך לקוחות, שורה בסרגל) — לפי אינדקס */
function coRestore(i){
  const c=CLIENTS[i!=null?i:CUR]; if(!c) return;
  c.advStatus='פעיל'; c.archOn=null; c.archWhy=null;
  coAfterSt(c,'active');
}
function coApplySt(k){
  const c=CLIENTS[CUR]; if(!c) return;
  c.advStatus=(CO_ST.find(x=>x[0]===k)||[])[1]||'פעיל'; c.archOn=null; c.archWhy=null;
  coAfterSt(c,k);
}
function coAfterSt(c,k){
  if(typeof renderCoSet==='function') renderCoSet();
  if(typeof renderGlobalRail==='function') renderGlobalRail();
  if(typeof renderClientsView==='function') renderClientsView();
  const st=document.querySelector('.client-head .st');
  if(st){ st.className='st '+(k==='active'?'active':k==='setup'?'setup':'arch');
    st.textContent=k==='active'?'פעיל':k==='setup'?'בהקמה':'ארכיון'; }
  toast(c.name+' — '+(k==='active'?'פעילה — בתור התפעול'
                     :k==='setup'?'סומנה בהקמה — יצאה מתור התפעול'
                     :'הועברה לארכיון'));
}
/* מצב תפעולי — פעיל / בהקמה. ארכיון הוא סטטוס התקשרות ויושב בפרטי לקוח. */
function coStHtml(){
  const c=CLIENTS[CUR]||{}, cur=coState(c);
  if(cur==='arch') return `<div class="cos-note arch">${c.name} בארכיון${c.archOn?` מאז ${c.archOn}`:''} — אין לה מצב תפעולי.
    סטטוס ההתקשרות נקבע ב<b>פרטי לקוח</b>.</div>`;
  const note=(CO_ST.find(x=>x[0]===cur)||[])[2]||'';
  const lbl=(CO_ST.find(x=>x[0]===cur)||[])[1]||'פעיל';
  return `<div class="cos-stdd">
      <button class="cos-stsel ${cur}" onclick="coStDd(event)">
        <span class="cos-stdot ${cur}"></span><b>${lbl}</b>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="cos-stmenu ${CO_ST_OPEN?'show':''}">
        ${CO_ST.map(([k,l,d])=>`<button class="cos-stopt ${cur===k?'on':''}" onclick="coStTg('${k}')">
          <span class="cos-stdot ${k}"></span><span><b>${l}</b><i>${d}</i></span></button>`).join('')}
      </div>
    </div>
    <div class="cos-note">${note}</div>`;
}
function coOps(d){
  const g=coGapTh();
  return `<div class="cos-narrow">
    <div class="cos-sub-h big" style="margin-top:0">מצב החברה</div>
    ${coStHtml()}
    ${coF('מנהל תזרים', `<select class="mx2-inp" style="width:100%">${[...new Set(CLIENTS.map(c=>c.mgr))].map(n=>`<option ${n===d.mgr?'selected':''}>${n}</option>`).join('')}</select>`)}
    ${coF('חברת ייעוץ', `<select class="mx2-inp" style="width:100%"><option>HK</option><option>שחר ייעוץ עסקי</option><option>ברק ושות׳</option></select>`)}

    <div class="cos-sub-h big">סף מהותיות לפער — מעקב ופערים</div>
    <div class="cos-note">פער מעל הסף חייב הגדרה לפני סיום שלב הבדיקה, ומוצג בכתום. מתחתיו — אפור ושקט.
      <b>סכום לבד ואחוז לבד שניהם מטעים</b>: 2,000 ₪ על יעד 100,000 זה רעש, ועל יעד 20,000 זה הרבה. לכן שלושה פרמטרים.</div>
    <div class="cos-3f">
      ${coF('רצפה — מתחתיה אף פעם לא', coNumInp('floor',g.floor,'₪'))}
      ${coF('אחוז מהיעד — ההכרעה באמצע', coNumInp('pct',g.pct,'%'))}
      ${coF('תקרה — מעליה תמיד', coNumInp('ceil',g.ceil,'₪'))}
    </div>
    <div class="cos-gap-ex" id="gapEx">${coGapEx(g)}</div>

    <div class="cos-sub-h big">ימי החומר בחודש</div>
    <div class="cos-note">הימים שבהם הלקוח אמור לשלוח חומר. הבוט מבקש אוטומטית באותם ימים, ופריט נחשב מאחר
      <b>רק ביחס ליום שלו</b> — לא ביחס למתי מישהו נזכר בו. בלי זה שלב "חומר מהלקוח" הופך לחותמת גומי.</div>
    <div class="cos-days" id="coDays">${coDaysHtml()}</div>
  </div>`;
}
/* ימי החומר בחודש — נקרא ע"י שלב 4 בבדיקות */
function coMatDays(){ try{ return JSON.parse(localStorage.getItem('hkMatDays')||'null')||[1,15]; }catch(e){ return [1,15]; } }
function coDaysHtml(){
  const on=coMatDays();
  const DAYS=[1,5,10,15,20,25,28];
  return DAYS.map(d=>`<button class="cos-day ${on.includes(d)?'on':''}" onclick="coDayTg(${d})">${d}</button>`).join('')
    + `<span class="cos-day-sum">${on.length?'נבחרו: '+on.join(' · ')+' בחודש':'לא נבחרו ימים — הבוט לא יבקש אוטומטית'}</span>`;
}
function coDayTg(d){
  const on=coMatDays(); const i=on.indexOf(d);
  if(i<0) on.push(d); else on.splice(i,1);
  on.sort((a,b)=>a-b);
  localStorage.setItem('hkMatDays',JSON.stringify(on));
  const el=document.getElementById('coDays'); if(el) el.innerHTML=coDaysHtml();
}
/* סף מהותיות פר חברה — נקרא גם ע"י budget-flow.html */
function coGapTh(){
  let g={floor:1000,pct:5,ceil:25000};
  try{ const s=JSON.parse(localStorage.getItem('hkGapTh')||'null'); if(s) g=Object.assign(g,s); }catch(e){}
  return g;
}
function coNumInp(k,v,unit){
  return `<div class="cos-num"><input class="mx2-inp" type="number" value="${v}" oninput="coGapSave('${k}',this.value)"><span>${unit}</span></div>`;
}
function coGapSave(k,v){
  const g=coGapTh(); g[k]=Math.max(0,+v||0);
  localStorage.setItem('hkGapTh',JSON.stringify(g));
  const ex=document.getElementById('gapEx'); if(ex) ex.innerHTML=coGapEx(g);
  const fr=document.getElementById('budgetFrame');
  if(fr&&fr.contentWindow) fr.contentWindow.postMessage({hk:'gapTh',th:g},'*');
}
/* דוגמאות חיות — שהמנהל יראה מיד מה הסף עושה */
function coGapEx(g){
  const nf=n=>n.toLocaleString('he-IL');
  const test=(t,gap)=> gap<g.floor?['מתחת לרצפה','sub']
                     : gap>=g.ceil?['מעל התקרה — דורש הגדרה','mat']
                     : (t>0&&gap/t*100>=g.pct)?['מעל '+g.pct+'% — דורש הגדרה','mat']
                     : ['מתחת ל-'+g.pct+'% — שקט','sub'];
  const CASES=[[1000,400],[100000,2000],[20000,2000],[1000000,30000]];
  return `<div class="cos-ex-h">איך זה מכריע</div>`+CASES.map(([t,gp])=>{
    const [txt,cls]=test(t,gp);
    return `<div class="cos-ex-r"><span>יעד ${nf(t)}</span><b>פער ${nf(gp)}</b>
      <em>${t>0?(gp/t*100).toFixed(1):0}%</em><i class="${cls}">${txt}</i></div>`;}).join('');
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
