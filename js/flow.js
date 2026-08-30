/* ===== "התהליך שלי" — תוכנית ליווי עסקי =====
   שכפול המסך הקיים בשפת העיצוב שלנו: תוכנית (GOLD) = רצף מפגשים,
   כל מפגש נושא רשימת נושאים מתוכננים ונקשר לפגישה אמיתית שממתינה לאישור סיכום. */
const FLOW_PROG={ name:'GOLD', open:true };
const FLOW_STEPS=[
  {t:'בניית הזהות העסקית של העסק', topics:[
    'הגדרת האסטרטגיה העסקית',
    'בניית מודל עסקי רווחי וסקיילבילי',
    'הגדרת זהות עסקית מדויקת — קהל יעד, בידול, מתחרים',
    'בניית יעדים שנתיים מדידים וברורים'],
   meet:{who:'אסתי ביטון', date:'11.06.2026', time:'00:00-01:00', adv:'אופיר יועץ', st:'wait'}},
  {t:'בניית האסטרטגיה העסקית לשנה הקרובה', topics:[
    'קיבוע אסטרטגיה מותאמת אישית',
    'קביעת כיווני צמיחה',
    'סינון רעשים והחלטות עסקיות נכונות',
    'בניית תמונת עתיד עסקית ברורה']},
  {t:'בניית מוצרי הדגל של העסק', topics:[
    'מיפוי סל המוצרים הקיים',
    'זיהוי מוצר הדגל והמוצרים הנלווים',
    'תמחור לפי ערך ולא לפי עלות',
    'בניית מדרג מוצרים למכירה']},
  {t:'יסודות ההתנהלות הפיננסית בעסק', topics:[
    'הפרדה בין כספי העסק לכספים פרטיים',
    'הבנת מבנה ההוצאות הקבועות והמשתנות',
    'קריאת דוח רווח והפסד',
    'בניית שגרת בקרה חודשית']},
  {t:'בניית התחזית הפיננסית של העסק', topics:[
    'בניית תחזית הכנסות והוצאות',
    'הגדרת יעדי תזרים חודשיים',
    'זיהוי חודשי לחץ תזרימי מראש',
    'קביעת כרית ביטחון']},
  {t:'ניהול תזרים המזומנים בפועל', topics:[
    'קריאת התזרים השוטף',
    'ניהול גבייה מלקוחות',
    'ניהול תשלומים לספקים',
    'טיפול בפערים מול היעד']},
  {t:'תמחור נכון ורווחיות', topics:['חישוב עלות אמיתית','תמחור לפי ערך','ניתוח רווחיות פר מוצר','העלאת מחירים בלי לאבד לקוחות']},
  {t:'בניית תהליך מכירה מסודר', topics:['מיפוי מסע הלקוח','בניית שיחת מכירה','טיפול בהתנגדויות','מדידת יחסי המרה']},
  {t:'שיווק ממוקד קהל יעד', topics:['בחירת ערוצי שיווק','מסרים שיווקיים','תקציב שיווק ומדידתו','בניית תוכנית תוכן']},
  {t:'בניית תשתית לקוחות חוזרים', topics:['תוכנית שימור','מכירה חוזרת','המלצות והפניות','מדידת שביעות רצון']},
  {t:'ניהול ספקים והתקשרויות', topics:['מיפוי ספקים','תנאי תשלום','משא ומתן על מחירים','חוזים והתקשרויות']},
  {t:'בניית מבנה ארגוני', topics:['הגדרת תפקידים','חלוקת אחריות','גיוס נכון','בניית נהלים']},
  {t:'ניהול צוות ומוטיבציה', topics:['שגרות ניהול','משוב והערכה','תגמול ותמריצים','טיפול בעובד לא מתפקד']},
  {t:'ניהול זמן ותעדוף', topics:['מיפוי גוזלי זמן','סדר יום ניהולי','האצלת סמכויות','עבודה על העסק ולא בעסק']},
  {t:'בניית מדדי ביצוע (KPI)', topics:['בחירת המדדים הנכונים','הגדרת יעדים למדד','שגרת מדידה','תגובה לסטייה']},
  {t:'ניהול מלאי ורכש', topics:['רמות מלאי אופטימליות','ניהול הזמנות','מלאי מת','קשר בין מלאי לתזרים']},
  {t:'אשראי, מימון ובנקים', topics:['הבנת מסגרות אשראי','עלות המימון','הכנה לפגישה בבנק','מקורות מימון חלופיים']},
  {t:'מיסוי והתנהלות מול רשויות', topics:['מקדמות ומע״מ','תכנון מס בסיסי','עבודה נכונה מול רו״ח','חובות דיווח']},
  {t:'בניית תקציב שנתי', topics:['תקציב הכנסות','תקציב הוצאות','תקציב השקעות','מעקב תקציב מול ביצוע']},
  {t:'ניתוח נקודת האיזון', topics:['חישוב נקודת איזון','תרומה שולית','מכירות מינימום נדרשות','השפעת שינוי מחיר']},
  {t:'ייעול תהליכים בעסק', topics:['מיפוי תהליכים','זיהוי צווארי בקבוק','אוטומציה','מדידת שיפור']},
  {t:'דיגיטל ומערכות מידע', topics:['מערכות ניהול','אינטגרציות','דיגיטציה של תהליכים','אבטחת מידע בסיסית']},
  {t:'ניהול סיכונים בעסק', topics:['מיפוי סיכונים','ביטוחים','תלות בלקוח או ספק בודד','תוכנית המשכיות']},
  {t:'בניית תוכנית צמיחה', topics:['זיהוי הזדמנויות','הרחבת קווי מוצר','שווקים חדשים','גיוס משאבים לצמיחה']},
  {t:'הכנה לשנה הבאה', topics:['סיכום השנה','עדכון יעדים','תוכנית עבודה שנתית','לוח זמנים רבעוני']},
  {t:'מדידת התקדמות ותיקוני מסלול', topics:['השוואה ליעדים','ניתוח פערים','תיקוני מסלול','קיבוע הצלחות']},
  {t:'סיכום התהליך והמשך דרך', topics:['סיכום כלל המפגשים','מה הושג ומה נותר','תוכנית המשך','קביעת שגרת ליווי']},
];
let FLOW_OPEN=new Set([0,1]), FLOW_MENU=null;
function flowTgProg(){ FLOW_PROG.open=!FLOW_PROG.open; renderFlowView(); }
function flowTg(i){ FLOW_OPEN.has(i)?FLOW_OPEN.delete(i):FLOW_OPEN.add(i); renderFlowView(); }
function flowMenu(i){ FLOW_MENU=(FLOW_MENU===i?null:i); renderFlowView(); }
function flowAdd(){ toast('הוספת מפגש לתוכנית — נפתח בורר תבניות'); }
function flowDel(){ hkConfirm('הסרת התוכנית','התוכנית וכל 27 המפגשים יוסרו מהלקוח.','הסרה',()=>toast('התוכנית הוסרה')); }
function flowOkSum(i){ FLOW_STEPS[i].meet.st='ok'; renderFlowView(); toast('סיכום המפגש אושר'); }
function renderFlowView(){
  const el=document.getElementById('viewFlow'); if(!el) return;
  const c=CLIENTS[CUR]||{};
  const done=FLOW_STEPS.filter(s=>s.meet&&s.meet.st==='ok').length;
  const N=FLOW_STEPS.length;
  const stepH=(s,i)=>{
    const op=FLOW_OPEN.has(i), m=s.meet;
    const st=m?(m.st==='ok'?['הושלם','ok']:['ממתין לאישור','wait']):['טרם התחיל','none'];
    return `<div class="fl-step ${op?'open':''}">
      <div class="fl-h" onclick="flowTg(${i})">
        <span class="fl-n">${i+1}</span>
        <span class="fl-t">מפגש ${i+1} — ${s.t}</span>
        <span class="fl-st ${st[1]}">${st[0]}</span>
        <button class="fl-cv ${op?'on':''}" onclick="event.stopPropagation();flowTg(${i})" title="${op?'סגירה':'פתיחה'}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m6 9 6 6 6-6"/></svg></button>
        <span class="fl-grip" title="גרירה לשינוי סדר"></span>
        <button class="fl-kb" onclick="event.stopPropagation();flowMenu(${i})" title="עוד">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></button>
        ${FLOW_MENU===i?`<div class="fl-menu" onclick="event.stopPropagation()">
          <button onclick="toast('עריכת המפגש');flowMenu(null)">עריכת מפגש</button>
          <button onclick="toast('שכפול המפגש');flowMenu(null)">שכפול</button>
          <button class="dg" onclick="toast('המפגש הוסר');flowMenu(null)">הסרה</button></div>`:''}
      </div>
      ${op?`<div class="fl-body">
        <ul class="fl-topics">${s.topics.map(x=>`<li><i>✦</i>${x}</li>`).join('')}</ul>
        ${m?`<div class="fl-meet">
          <div class="fm-l">
            <div class="fm-t">${m.who}, ${m.date.split('.').reverse().join('-')}
              <span class="fm-st ${m.st==='ok'?'ok':''}">${m.st==='ok'?'אושר':'ממתין לאישור'}</span></div>
            <div class="fm-m">
              <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>${m.date}</span>
              <span dir="ltr"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>${m.time}</span>
              <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>${m.adv}</span>
            </div>
          </div>
          ${m.st==='ok'?'<span class="fm-done">✓ הסיכום אושר</span>'
            :`<button class="fm-btn" onclick="flowOkSum(${i})">אישור הסיכום</button>`}
        </div>`:''}
      </div>`:''}
    </div>`;};
  el.innerHTML=`<div class="flowv">
    <div class="fl-top">
      <div class="fl-ttl">תהליך ליווי עסקי</div>
      <button class="fl-add" onclick="flowAdd()" title="הוספת מפגש">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg></button>
    </div>
    <div class="fl-prog"><span class="fp-lbl">שלב ${done} מתוך ${N}</span>
      <div class="fp-bar"><i style="width:${Math.round(done/N*100)}%"></i></div></div>
    <div class="fl-plan">
      <div class="fl-ph" onclick="flowTgProg()">
        <span class="fp-name">${FLOW_PROG.name}</span>
        <span class="fp-n">${N}</span>
        <button class="fl-cv ${FLOW_PROG.open?'on':''}" onclick="event.stopPropagation();flowTgProg()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m6 9 6 6 6-6"/></svg></button>
        <button class="fl-del" onclick="event.stopPropagation();flowDel()" title="הסרת התוכנית">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
      </div>
      ${FLOW_PROG.open?`<div class="fl-steps">${FLOW_STEPS.map(stepH).join('')}</div>`:''}
    </div>
  </div>`;
}
