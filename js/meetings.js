/* HK Dashboard — meetings list + summary modal */
  /* ---- meetings + summary ---- */
  // status: upcoming | ai (הוקלטה, ה-AI מעבד) | summary (סיכום ממתין לאישור) | done | noshow
  // rec = משך ההקלטה — כל פגישה מוקלטת ומתועדת אוטומטית
  const MEETINGS=[
    {name:'פגישה שוטפת - סקירת תזרים', client:'אנרגי אינטרנשיונל', who:'צחי עובד', date:'02.07.2026', time:'09:00-10:00', adv:'אילון שחר', status:'ai', rec:'46 דק׳'},
    {name:'פגישה חודשית - יולי (Money+)', client:'משה עובד', who:'משה עובד', date:'02.07.2026', time:'16:00-17:00', adv:'אילון שחר', status:'upcoming', link:'zoom'},
    {name:'פ.ע - חודש יוני', client:'אנרגי אינטרנשיונל', who:null, date:'01.06.2026', time:'11:00-12:00', adv:'אילון שחר', status:'summary', rec:'58 דק׳'},
    {name:'פגישת עבודה - קורס מנחות', client:'מטעי גבעון', who:'יעל גבעון', date:'12.05.2026', time:'10:00-11:00', adv:'אילון שחר', status:'summary', rec:'52 דק׳'},
    {name:'פגישה חודשית - יולי (Money+)', client:'מטעי גבעון', who:'יעל גבעון', date:'15.07.2026', time:'10:00-11:00', adv:'אילון שחר', status:'upcoming'},
    {name:'סקירת רבעון Q3', client:'משה עובד', who:'משה עובד', date:'10.07.2026', time:'14:00-15:00', adv:'אילון שחר', status:'upcoming'},
    {name:'לימוד בנדל - לחיות בתשוקה', client:'אנרגי גולני', who:'דורון גולני', date:'05.05.2026', time:'09:00-10:00', adv:'אילון שחר', status:'done', rec:'55 דק׳'},
    {name:'פגישה חודשית - מרץ', client:'רימון יצחק', who:'רימון יצחק', date:'17.03.2026', time:'12:00-13:00', adv:'אילון שחר', status:'done', rec:'61 דק׳'},
    {name:'פ.ע - חודש יוני', client:'אנרגי גולני', who:'דורון גולני', date:'24.06.2026', time:'10:30-11:30', adv:'אילון שחר', status:'noshow'},
    {name:'המשך סקירה — החלטות תקציב', client:'אנרגי אינטרנשיונל', who:'צחי עובד', date:'02.07.2026', time:'17:00-17:30', adv:'אילון שחר', status:'upcoming'},
    {name:'פגישה חודשית - אוגוסט', client:'אנרגי אינטרנשיונל', who:'צחי עובד', date:'05.08.2026', time:'10:00-11:00', adv:'אילון שחר', status:'upcoming'},
    {name:'פ.ע - חודש מאי', client:'אנרגי אינטרנשיונל', who:'צחי עובד', date:'05.05.2026', time:'11:00-12:00', adv:'אילון שחר', status:'done', rec:'49 דק׳',
      sum:['ניתוח רבעון מרץ-מאי: הכנסות 116/140/120 אש״ח — יציבות תזרימית מלאה חרף גידול של 40% בהכנסות',
           'זוהה פער: כרטיס האשראי החדש של ״מקס״ אינו מחובר ל-Bizibox — מקשה על מעקב הוצאות השיווק',
           'הוחלט: החלפת פונקציית שירות הלקוחות — חיסכון של כ-2,880 ₪ לחודש',
           'הוגדר יעד: פתיחת מסגרת אשראי נוספת של 100 א׳ ₪ עד 15.7 — באחריות HK'],
      tasks:[{t:'חיבור כרטיס מקס ל-Bizibox', done:true},{t:'גיוס מחליפה לשירות לקוחות', done:true},{t:'פנייה לבנק — מסגרת נוספת', done:true},{t:'עדכון תקציב יוני', done:true}],
      memUpd:[{c:'מצב תזרימי', t:'מסגרת 150K בניצול מלא — הוגדר יעד מסגרת נוספת'},
              {c:'כאבי לקוח', t:'נוסף: עומס תפעולי על צחי — מגייסים מחליפה'},
              {c:'יעדים והסכמות', t:'מסגרת 100 א׳ ₪ עד 15.7 · באחריות HK'}]},
    {name:'פגישה חודשית - אפריל', client:'אנרגי אינטרנשיונל', who:'צחי עובד + רות אלמוג', date:'03.04.2026', time:'10:00-11:00', adv:'אילון שחר', status:'done', rec:'57 דק׳',
      sum:['עודכן תקציב אפריל עם הוצאות חד-פעמיות לריטריט (ירוק עז 7,500 ₪, קייטרינג 5,000 ₪)',
           'זוהה חיוב כפול מ-Payment טכנולוגיות — נפתח לבדיקה מול הספק',
           'רות הציגה את טבלת מעקב המכירות — הוחלט על עדכון שבועי קבוע'],
      tasks:[{t:'בדיקת החיוב הכפול מול Payment', done:true},{t:'קביעת תזכורת שבועית לטבלת המכירות', done:true},{t:'עדכון קטגוריות הריטריט בתזרים', done:false}],
      memUpd:[{c:'יעדים והסכמות', t:'עדכון שבועי של טבלת המכירות — סוכם עם רות'},
              {c:'שיתוף פעולה', t:'רות — הכתובת האפקטיבית לחומרים; מגיבה תוך יום'}]},
  ];
  let MEET_FILTER='all';
  const CAL_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>';
  const CLK_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const USR_ICO='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';
  function renderMeetings(){
    closeMeeting();   // כניסה לסקציה תמיד מתחילה ברשימה
    const isClient=(ROLE==='client1'||ROLE==='clientN');
    document.getElementById('mtFilters').style.display='none';   // הפיצול לשתי עמודות מייתר את הפילטרים
    let list=MEETINGS.map((m,i)=>({m,i}));
    if(isClient) list=list.filter(x=>x.m.client===CLIENTS[CUR].name&&x.m.status==='done');   // הלקוח רואה רק פגישות שאושרו
    const el=document.getElementById('mtList');
    if(!list.length){el.innerHTML='<div class="ms-placeholder">אין פגישות</div>';return;}
    /* ===== שולחן עבודה למעלה, ארכיון למטה =====
       הפגישה = מיכל: לפני — ההכנה בפנים; אחרי אישור — סיכום, משימות ומה נכנס לזיכרון. */
    const TODAY='02.07.2026';
    const MON=['','ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    const ymd=d=>d.split('.').reverse().join('');
    const dayDiff=d=>{const p=d.split('.'),q=TODAY.split('.');return Math.round((new Date(+p[2],p[1]-1,+p[0])-new Date(+q[2],q[1]-1,+q[0]))/864e5);};
    const NAME=(CLIENTS[CUR]||{}).name;
    list=list.filter(x=>x.m.client===NAME);           // המסך הוא של החברה — הזירה היא חוצת-לקוחות
    if(isClient) list=list.filter(x=>x.m.status==='done');
    const whoTxt=mm=>{const w=mm.who?(Array.isArray(mm.who)?mm.who.join(' + '):mm.who):null;
      return w?`<span>${USR_ICO}עם ${w}</span>`:((mm.status==='summary'||mm.status==='ai')?'<span class="ms-nowho">⚠ ללא משתתף</span>':'');};
    const dBadge=(mm,cls)=>{const p=mm.date.split('.');return `<span class="tl-d ${cls||''}"><b>${p[0]}</b><i>${MON[+p[1]]}</i></span>`;};
    /* קבוצות לפי תפקיד הפריט, לא לפי תאריך */
    const todayUp=list.filter(x=>x.m.status==='upcoming'&&dayDiff(x.m.date)===0).sort((a,b)=>a.m.time<b.m.time?-1:1);
    const fut=list.filter(x=>x.m.status==='upcoming'&&dayDiff(x.m.date)>0).sort((a,b)=>ymd(a.m.date)<ymd(b.m.date)?-1:1);
    const desk=[...todayUp, ...list.filter(x=>['summary','noshow','ai'].includes(x.m.status)).sort((a,b)=>ymd(a.m.date)>ymd(b.m.date)?-1:1)];
    const doneL=list.filter(x=>x.m.status==='done').sort((a,b)=>ymd(a.m.date)>ymd(b.m.date)?-1:1);
    /* שורת המקצב — האנטי-פספוס של הלקוח הזה */
    const lastDone=doneL[0], nextUp=todayUp[0]||fut[0];
    const cad=isClient?'':`<div class="mt-cad">
      <span class="mt-cad-t">מקצב הפגישות:</span>
      <span>אחרונה — ${lastDone?lastDone.m.date+' · לפני '+Math.abs(dayDiff(lastDone.m.date))+' יום':'—'}</span>
      <span class="${nextUp?'ok':'bad'}">הבאה — ${nextUp?(dayDiff(nextUp.m.date)===0?'היום '+nextUp.m.time.split('-')[0]:nextUp.m.date)+' ✓':'לא מתואמת'}</span>
      ${nextUp?'':'<button class="mt-btn sm vis" onclick="toast(\'נשלחו ללקוח 3 הצעות זמנים בוואטסאפ\')">שליחת זמנים</button>'}
    </div>`;
    /* ההכנה — בתוך הפגישה, פרושה לרוחב: נקודות במרכז, הנחיות אישיות בצד */
    const prepInner=mm=>{const p=(typeof ADV_PREPS!=='undefined')?ADV_PREPS[mm.client]:null; if(!p)return '';
      return `<div class="mt-x prep grid">
        <div class="mtx-main">
          <div class="mt-x-h">נקודות פתיחה — נגזרות עכשיו מהזיכרון ומהמספרים</div>
          ${p.pts.map(t=>`<div class="prep-pt">${t}</div>`).join('')}
          <div class="mt-x-acts"><button class="mt-btn view sm vis" onclick="showTab('prep')">להכנה המלאה — עם המספרים והמטרה</button></div>
        </div>
        <aside class="mtx-side prep">
          <div class="mt-x-h"><span class="pm-tag">מהזיכרון — איך לדבר איתו</span></div>
          ${(p.mem||[]).map(t=>`<div class="mtx-mem-r">${t}</div>`).join('')}
        </aside>
      </div>`;};
    /* פגישה שהסתיימה — התוצרים בפריסה מלאה: סיכום ומשימות במרכז, הזיכרון בצד */
    const doneInner=(mm,i)=>{
      return `<div class="mt-x grid">
        <div class="mtx-main">
          <div class="mt-x-h">סיכום הפגישה</div>
          ${(mm.sum||[]).map((t,ix)=>`<div class="ms-point"><span class="num">${ix+1}.</span><span>${t}</span></div>`).join('')}
          <div class="mt-x-h" style="margin-top:12px">משימות מהפגישה</div>
          ${(mm.tasks||[]).map(t=>`<div class="mtx-task ${t.done?'ok':''}">${t.done?'✓':'○'} ${t.t}</div>`).join('')}
          <div class="mt-x-acts">
            <button class="mt-btn view sm vis" onclick="openMeeting(${i})">הסיכום המלא, התמלול והמשוב</button>
          </div>
        </div>
        <aside class="mtx-side">
          <div class="mt-x-h"><span class="pm-tag">נכנס לזיכרון מהפגישה</span></div>
          ${(mm.memUpd||[]).map(u=>`<div class="mtx-mem-r"><span class="mf-cat">${u.c}</span>${u.t}</div>`).join('')||'<div class="mtx-mem-r">אין עדכוני זיכרון</div>'}
          <button class="mt-btn sm vis" style="margin-top:10px" onclick="openMemCard(CUR)">לכרטיס הזיכרון המלא</button>
        </aside>
      </div>`;};
    window.MT_OPEN=window.MT_OPEN||new Set();
    const xTg=i=>`MT_OPEN.has(${i})?MT_OPEN.delete(${i}):MT_OPEN.add(${i});renderMeetings()`;
    /* כרטיס "על השולחן" — מונע סטטוס */
    const deskCard=({m,i})=>{
      const isToday=m.status==='upcoming';
      const open=MT_OPEN.has(i);
      let tag='', acts='', xtra='';
      if(isToday){ tag=`<span class="msp-chip coral">היום · ${m.time.split('-')[0]}</span>`;
        acts=`<button class="mrec-btn on-card sm" onclick="MS_CUR=${i};msRecOpen()"><span class="mrec-dot"></span> הקלטת הפגישה</button>
              <button class="mt-btn view sm vis ${open?'on':''}" onclick="${xTg(i)}">הכנה ${open?'▴':'▾'}</button>`;
        xtra=open?prepInner(m):''; }
      else if(m.status==='summary'){ tag='<span class="msp-chip amber">סיכום ממתין לאישורך</span>';
        acts=`<button class="ms-send sm" onclick="openMeeting(${i})">אישור הסיכום</button>`; }
      else if(m.status==='noshow'){ tag='<span class="msp-chip coral">לא התקיימה</span>';
        acts=`<button class="mt-btn view sm vis" onclick="toast('נשלחה הצעה לתיאום מחדש')">תיאום מחדש</button>`; }
      else { tag='<span class="msp-chip purple">בעיבוד AI — סיכום בהכנה</span>'; acts=m.rec?`<span class="rec-badge">${m.rec}</span>`:''; }
      return `<div class="mt-desk st-${m.status}">
        <div class="mt-desk-b"><div class="mt-desk-t"><b>${m.name}</b> ${tag}</div>
          <div class="tl-sub"><span>${CAL_ICO}${m.date}</span><span>${CLK_ICO}${m.time}</span>${whoTxt(m)}</div></div>
        <div class="mt-desk-acts">${acts}</div>
      </div>${xtra}`;};
    /* שורת "הבאות" — קומפקטית עם הכנה נפתחת */
    const futRow=({m,i})=>{const open=MT_OPEN.has(i);const df=dayDiff(m.date);
      return `<div class="mt-fut">
        ${dBadge(m)}
        <div class="mt-desk-b"><div class="mt-desk-t"><b>${m.name}</b> <em class="tl-when">בעוד ${df} ימים</em></div>
          <div class="tl-sub"><span>${CLK_ICO}${m.time}</span>${whoTxt(m)}</div></div>
        <button class="mt-btn view sm vis ${open?'on':''}" onclick="${xTg(i)}">הכנה ${open?'▴':'▾'}</button>
      </div>${open?prepInner(m):''}`;};
    /* היסטוריה — ארכיון שקט לפי חודשים */
    let hist='', lastMon='';
    doneL.forEach(({m,i})=>{
      const mo=MON[+m.date.split('.')[1]]+' '+m.date.split('.')[2];
      if(mo!==lastMon){lastMon=mo;hist+=`<div class="tl-mon">${mo}</div>`;}
      const open=MT_OPEN.has(i);
      hist+=`<div class="tl-it st-done">
        ${dBadge(m,'muted')}
        <div class="tl-card clickable" onclick="${xTg(i)}">
          <div class="tl-top"><b>${m.name}</b> <span class="msp-chip green">הושלם</span> ${m.rec?`<span class="rec-badge">${m.rec}</span>`:''} ${m.memUpd?`<span class="pm-tag">זיכרון (${m.memUpd.length})</span>`:''}<span class="tl-cv">${open?'▴':'▾'}</span></div>
          <div class="tl-sub"><span>${CLK_ICO}${m.time}</span>${whoTxt(m)}</div>
          ${open?doneInner(m,i):''}
        </div>
      </div>`;});
    el.innerHTML=cad+
      (desk.length&&!isClient?`<div class="mt-sec">על השולחן <span>${desk.length}</span></div>`+desk.map(deskCard).join(''):'')+
      (fut.length&&!isClient?`<div class="mt-sec">הפגישות הבאות</div>`+fut.map(futRow).join(''):'')+
      (doneL.length?`<div class="mt-sec hist">היסטוריית הפגישות <i>הסתיימו ואושרו — מה שגם הלקוח רואה</i></div><div class="tl">${hist}</div>`:'<div class="ms-placeholder">אין עדיין פגישות שהושלמו</div>');
  }
  function meetFilter(k){MEET_FILTER=k;renderMeetings();}
  const MS_SUMMARY=`
    <div class="ms-sec"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h8M8 13h5"/></svg> תמונת מצב ונתוני יסוד</div>
    <div class="ms-point"><span class="num">1.</span><span>בוצע ניתוח תזרים לרבעון מרץ-מאי (הכנסות 116 אש"ח, תוצאה מאוזנת), אפריל (הכנסות 140 אש"ח, עודף 22 אש"ח), מאי (הכנסות 120 אש"ח, גירעון 22.7 אש"ח).</span></div>
    <div class="ms-point"><span class="num">2.</span><span>אומת כי העסק שמר על יציבות תזרימית לאורך הרבעון, עם יתרת סיום כמעט זהה ליתרת הפתיחה (סיום מאי: מינוס 66,178 ₪).</span></div>
    <div class="ms-point"><span class="num">3.</span><span>זוהה פער בנתונים: כרטיס האשראי החדש של 'מקס' אינו מחובר למערכת ה-Bizibox, מה שמקשה על מעקב שוטף אחר הוצאות השיווק.</span></div>
    <div class="ms-point"><span class="num">4.</span><span>זוהתה תקלה אפשרית במערכת: חיוב כפול מחברת 'Payment' טכנולוגיות בחודש אפריל, הנושא דורש בדיקה.</span></div>
    <div class="ms-point"><span class="num">5.</span><span>עודכן תקציב יוני עם הוצאות חד-פעמיות הקשורות לריטריט (ספק 'ירוק עז' 7,500 ₪, ספקית אוכל 5,000 ₪).</span></div>
    <div class="ms-point"><span class="num">6.</span><span>זוהה חוסר עדכון בטבלת מעקב המכירות היומית מאז ה-8 במאי.</span></div>
    <div class="ms-sec t2"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.6L18.5 9l-3.5 3 1 4.6L12 14.7 8 16.6l1-4.6L5.5 9l4.6-1.4z"/></svg> תובנות מרכזיות</div>
    <div class="ms-insight"><div class="ms-ititle">1. שמירה על יציבות תזרימית ברבעון האחרון חרף גידול בהכנסות</div><div class="ms-itext">למרות גידול של כ-40% בהכנסות ומהלכים עסקיים שלא צלחו, העסק שמר על איזון תזרימי מלא ברבעון מרץ-מאי, מה שמעיד על חוסן פיננסי ויכולת לספוג אתגרים. <span class="ms-more">קרא עוד</span></div></div>
    <div class="ms-insight"><div class="ms-ititle">2. אופטימיזציה של מבנה כוח האדם: החלפת פונקציית שירות לקוחות</div><div class="ms-itext">הוחלט על סיום העסקה של מיכל וגיוס מחליפה בתפקיד שירות לקוחות ותפעול, בעלות חודשית נמוכה יותר של כ-2,880 ₪. <span class="ms-more">קרא עוד</span></div></div>
  `;
  /* ---- תמלול + נגן ---- */
  const MS_TRANS=[
    ['יועץ','בוא נפתח עם המספרים — ההכנסות עלו 12% מהחודש הקודם, 307 אלף מול 274.'],
    ['לקוח','כן, ראיתי. זה בעיקר ההזמנה הגדולה של רימון.'],
    ['יועץ','בדיוק, וזה מחזק את מה שדיברנו — רימון זה כבר 70% מהמחזור. צריך לדבר על זה רגע.'],
    ['לקוח','אני יודע שזה מסוכן, אבל קשה להגיד לא להזמנות שלהם.'],
    ['יועץ','ברור. לא נעצור אותן — נבנה לידן עוד רגל. יש לך שני לידים מהתערוכה, נתקדם איתם החודש?'],
    ['לקוח','אוקיי. תכין לי מה צריך בשביל הצעת מחיר.'],
    ['יועץ','סגור. עכשיו — קניות המלאי. 25 אלף עוד לא נצבעו בתזרים, וזה מה שמייצר את החריגה הצפויה בעוד 9 ימים.'],
    ['לקוח','נדבר עם רות שתעביר את החשבוניות היום.'],
  ];
  let MS_PLAYING=false;
  function msPlayTg(){MS_PLAYING=!MS_PLAYING;const p=document.getElementById('msAudio');if(p)p.classList.toggle('playing',MS_PLAYING);const b=document.getElementById('msPlayBtn');if(b)b.innerHTML=MS_PLAYING?'⏸':'▶';}
  const msTranscript=m=>`
    <div class="ms-audio" id="msAudio">
      <button class="ms-play" id="msPlayBtn" onclick="msPlayTg()">▶</button>
      <div class="msa-bar"><i></i></div>
      <span class="msa-time" dir="ltr">${m.rec||'46:12'}</span>
      <button class="mt-btn view sm" onclick="toast('התמלול הורד כקובץ')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></svg> הורדת התמלול</button>
    </div>
    ${MS_TRANS.map(t=>`<div class="ms-tr ${t[0]==='יועץ'?'adv':''}"><b>${t[0]}:</b><span>${t[1]}</span></div>`).join('')}`;
  /* ---- משימות מוצעות — אישור פר משימה ---- */
  let MS_TASKS=[
    {t:'העברת דוח עלויות שכר מעביד (דוח תמחיר) מרואה החשבון עבור כל החודשים', owner:'לקוח', ok:false},
    {t:'העברת חשבוניות קניות המלאי הפתוחות לצביעה בתזרים — 25,000 ₪', owner:'לקוח', ok:false},
    {t:'הכנת חומר להצעת מחיר לשני הלידים מהתערוכה', owner:'יועץ', ok:false},
    {t:'בדיקת החיוב הכפול מ-Payment טכנולוגיות באפריל', owner:'מנהל תזרים', ok:false},
  ];
  function msTaskOk(i){MS_TASKS[i].ok=!MS_TASKS[i].ok;msRerender();}
  function msTaskDel(i){MS_TASKS.splice(i,1);msRerender();toast('המשימה הוסרה');}
  function msTaskAdd(){
    const inp=document.getElementById('msNewTask'); if(!inp||!inp.value.trim())return;
    MS_TASKS.push({t:inp.value.trim(), owner:'לקוח', ok:false}); msRerender();
  }
  const msTasksRO=()=>`
    ${MS_TASKS.map(t=>`<div class="ms-task ok">
      <span class="apm-ok">✓</span>
      <div class="ms-task-b"><div>${t.t}</div><span>באחריות: ${t.owner}</span></div>
    </div>`).join('')}`;
  const msTasks=()=>`
    <div class="ms-tasknote">להלן המשימות המוצעות מהפגישה — יש לאשר אותן, ורק לאחר מכן הן ייווצרו ויישלחו.</div>
    ${MS_TASKS.map((t,i)=>`<div class="ms-task ${t.ok?'ok':''}">
      <button class="mt-btn sm ${t.ok?'':'view'}" onclick="msTaskOk(${i})">${t.ok?'✓ אושרה':'אישור'}</button>
      <button class="mem-ic del" title="הסרה" onclick="msTaskDel(${i})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
      <div class="ms-task-b"><div>${t.t}</div><span>באחריות: ${t.owner}</span></div>
    </div>`).join('')}
    <div class="ms-taskadd"><input class="mx2-inp" id="msNewTask" placeholder="משימה חדשה…" onkeydown="if(event.key==='Enter')msTaskAdd()"><button class="mt-btn view" onclick="msTaskAdd()">+ הוספת משימה</button></div>`;
  /* ---- משוב ליועץ — נפתח סעיף סעיף ---- */
  const MS_FB=[
    ['מיקוד, תכליתיות וחיבור ללמה','הפגישה נפתחה ישר במספרים — מצוין מול הלקוח הזה. שים לב שהמעבר בין נושאים היה מהיר; שווה לסכם כל נושא במשפט לפני שממשיכים.'],
    ['קשר אישי, הקשבה ומרחב','נתת ללקוח מקום כשדיבר על התלות ברימון ולא מיהרת לפתרון — זה בנה אמון. בהמשך הפגישה קטעת פעמיים באמצע משפט.'],
    ['עבודת עומק ברובד הסמוי','זיהית את החשש מאובדן ההזמנות מאחורי ההתנגדות. אפשר היה להעמיק: מה עוד מפחיד אותו בגיוס לקוח חדש?'],
    ['הובלה סמכותית, העצמה והנעה לפעולה','המשימות הוגדרו ברורות עם בעלים. חסר תאריך יעד מוסכם לחשבוניות המלאי — קבעתם "היום" בלי לוודא היתכנות.'],
    ['נקודת מבט מגישה אחרת','שקול בפגישה הבאה להביא גרף מגמת התלות ברימון — ויזואליזציה תעזור לו לקבל את החלטת הגיוון.'],
  ];
  let MS_FB_OPEN=new Set();
  function msFbTg(i){MS_FB_OPEN.has(i)?MS_FB_OPEN.delete(i):MS_FB_OPEN.add(i);msRerender();}
  const msFeedback=()=>`
    <div class="ms-tasknote">משוב AI על ניהול הפגישה — לעיניך בלבד, לא נשלח ללקוח.</div>
    ${MS_FB.map((f,i)=>`<div class="ms-fb ${MS_FB_OPEN.has(i)?'open':''}" onclick="msFbTg(${i})">
      <div class="ms-fb-h"><span class="cv">▾</span><b>${i+1}. ${f[0]}</b></div>
      ${MS_FB_OPEN.has(i)?`<div class="ms-fb-t">${f[1]}</div>`:''}
    </div>`).join('')}`;
  /* ---- עדכוני זיכרון מהפגישה ---- */
  const msMemUpd=()=>{
    const ups=(typeof MEM_UPDATES!=='undefined')?MEM_UPDATES.filter(u=>u.src.includes('09:00')):[];
    return `<div class="ms-tasknote">מה ה-AI עדכן בכרטיס הלקוח מתוך תמלול הפגישה — אוטומטית, לפי הפרומפט של כל קטגוריה.</div>`+
      (ups.length?ups.map(u=>`<div class="apm-row">
        <span class="mf-cat">${u.catName}</span>
        <div class="apm-b"><div class="mf-l">${u.line}</div><div class="mf-meta">${u.when}</div></div>
        <span class="apm-ok">✓ עודכן</span>
      </div>`).join(''):'<div class="ms-placeholder">אין עדכוני זיכרון מהפגישה</div>')+
      `<button class="mt-btn view sm" style="margin-top:10px" onclick="openMemCard(CUR)">לכרטיס הלקוח המלא</button>`;
  };
  /* עמוד פגישה — נפתח בתוך סקציית הפגישות במקום פופאפ */
  let MS_CUR=-1, MS_TAB='summary';
  function msRerender(){const b=document.getElementById('msBody');if(b)b.innerHTML=msBodyOf(MS_TAB);}
  function msBodyOf(t){
    const m=MEETINGS[MS_CUR]||{};
    const isClient=(typeof ROLE!=='undefined'&&(ROLE==='client1'||ROLE==='clientN'));
    if(t==='summary')return (m.status==='ai')?'<div class="ms-tasknote"><span class="msp-chip purple">בעיבוד AI</span> התמלול הסתיים — הסיכום, המשימות ועדכוני הזיכרון ייווצרו בדקות הקרובות.</div>':MS_SUMMARY;
    if(t==='tasks')return isClient?msTasksRO():msTasks();
    if(isClient)return '';   // תמלול, משוב ועדכוני זיכרון — לא ללקוח
    if(t==='transcript')return msTranscript(m);
    if(t==='feedback')return msFeedback();
    if(t==='memupd')return msMemUpd();
    return '';
  }
  const MS_STATCHIP={summary:['ממתין לאישור','amber'],done:['הושלם','green'],ai:['בעיבוד AI','purple'],upcoming:['מתוכננת','blue'],noshow:['לא התקיימה','coral']};
  const msPreStart=m=>`
    <div class="msps">
      <div class="msps-prep"><span class="ms-prep ok">ההכנה לפגישה מוכנה — מהזיכרון והמספרים</span><button class="mt-btn view sm" onclick="showTab('prep')">פתיחת ההכנה</button></div>
      <div class="msps-mic">🎙</div>
      <div class="msps-t">להקלטת הפגישה והפעלת התמלול</div>
      <div class="msps-acts">
        <button class="msps-btn main" onclick="msRecOpen()"><span class="mrec-dot"></span> הקלטת פגישה</button>
        <button class="msps-btn" onclick="toast('העלאת קובץ אודיו — הקובץ יתומלל ויעבור את אותו צינור')">⬆ העלה קובץ אודיו</button>
        <button class="msps-btn" onclick="toast('העלאת קבצי תמלול')">📄 העלאת קבצי תמלול</button>
      </div>
    </div>`;
  /* ---- הקלטה: בחירת מקור ← בר גלובלי צף; ממשיכים לעבוד בממשק ---- */
  function msRecOpen(){ document.getElementById('recSrcOv').classList.add('show'); }
  function msRecSrcClose(){ document.getElementById('recSrcOv').classList.remove('show'); }
  function msRecBegin(){
    msRecSrcClose();
    const mm=MEETINGS[MS_CUR];
    startMeetRec(mm?mm.client:null, MS_CUR);
    closeMeeting(); renderMeetings();   // חוזרים לרשימה — הבר מלווה בכל מסך
  }

  const whoArrOf=m=>m&&m.who?(Array.isArray(m.who)?m.who:[m.who]):[];
  function msAddWho(v){
    if(MS_CUR<0||!v)return;
    const m=MEETINGS[MS_CUR], arr=whoArrOf(m);
    if(arr.includes(v)){toast('המשתתף כבר משויך');return;}
    m.who=[...arr,v];
    toast('המשתתף שויך — הזיכרון יתעדכן עבורו');
    openMeeting(MS_CUR);
  }
  function msWhoRm(v){
    if(MS_CUR<0)return;
    const m=MEETINGS[MS_CUR];
    m.who=whoArrOf(m).filter(x=>x!==v);
    if(!m.who.length)m.who=null;
    openMeeting(MS_CUR);
  }
  /* בורר משתתף מערכתי — עם הוספת איש קשר חדש מהמקום */
  function whoUsers(){ return (typeof MEM_USERS!=='undefined'&&MEM_USERS[CUR])?MEM_USERS[CUR].map(u=>u.n):['בעל העסק']; }
  function whoPicker(pfx,label){
    return `<span class="ms-whodd" id="${pfx}WhoWrap">
      <button class="mx2-inp ms-whobtn" id="${pfx}WhoBtn" onclick="event.stopPropagation();whoDdTg('${pfx}')">${label||'בחירת משתתף… ▾'}</button>
      <div class="ev-dd" id="${pfx}WhoDd">
        ${whoUsers().map(u=>`<div class="ev-dd-row" onclick="whoPick('${pfx}','${u}')"><span class="ev-dd-av">${u.charAt(0)}</span><div><b>${u}</b></div></div>`).join('')}
        <div class="ev-dd-row ms-addrow" onclick="event.stopPropagation();whoAddTg('${pfx}')"><span class="ev-dd-av">+</span><div><b>הוספת איש קשר חדש</b></div></div>
        <div class="ms-whoadd" id="${pfx}WhoAdd" onclick="event.stopPropagation()">
          <input class="mx2-inp" id="${pfx}WhoNew" placeholder="שם איש הקשר…" onkeydown="if(event.key==='Enter')whoAddSave('${pfx}')">
          <button class="mt-btn view sm" onclick="whoAddSave('${pfx}')">הוספה</button>
        </div>
      </div>
    </span>`;
  }
  function whoDdTg(pfx){ document.getElementById(pfx+'WhoDd').classList.toggle('show'); }
  function whoAddTg(pfx){ const a=document.getElementById(pfx+'WhoAdd'); a.classList.toggle('show'); const i=document.getElementById(pfx+'WhoNew'); if(a.classList.contains('show'))setTimeout(()=>i.focus(),50); }
  function whoAddSave(pfx){
    const i=document.getElementById(pfx+'WhoNew'); const n=(i.value||'').trim(); if(!n)return;
    if(typeof MEM_USERS!=='undefined'){ (MEM_USERS[CUR]=MEM_USERS[CUR]||[]).push({n, role:'איש קשר', type:'employee', off:[]}); }
    toast('איש הקשר נוסף לחברה');
    whoPick(pfx,n);
  }
  function whoPick(pfx,n){
    document.getElementById(pfx+'WhoDd').classList.remove('show');
    if(pfx==='ms'){ msAddWho(n); return; }
    window._mnWho=n; const b=document.getElementById('mnWhoBtn'); if(b)b.textContent=n+' ▾';
  }
  function openMeeting(i){
    MS_CUR=i; const m=MEETINGS[i];
    const isClient=(ROLE==='client1'||ROLE==='clientN');
    const chip=MS_STATCHIP[m.status]||['',''];
    const preStart=(m.status==='upcoming'||m.status==='noshow');
    /* חובה: שיוך משתתף מהחברה (עד שניים) לפני אישור הסיכום — הזיכרון מתעדכן פר משתמש */
    const whoArr=whoArrOf(m);
    const whoReq=(!isClient&&m.status==='summary')?`
      <div class="ms-whoreq ${whoArr.length?'ok':''}">
        <b>${whoArr.length?'משתתפים מהחברה:':'מי השתתף בפגישה מהחברה?'}</b>
        ${whoArr.length?'':'חובה לשייך משתתף לפני אישור הסיכום — הזיכרון מתעדכן פר משתמש.'}
        ${whoArr.map(w=>`<span class="ms-whochip">${w}<i title="הסרה" onclick="msWhoRm('${w}')">✕</i></span>`).join('')}
        ${whoArr.length<2?whoPicker('ms',whoArr.length?'+ משתתף נוסף ▾':'בחירת משתתף… ▾'):''}
      </div>`:'';
    let foot='';
    if(!isClient&&m.status==='summary') foot=whoReq+`
      <div class="ms-foot ${whoArr.length?'':'blocked'}">
        <button class="ms-nosend" ${whoArr.length?'':'disabled'} onclick="approveSummary(false)">אישור ללא שליחה</button>
        <button class="ms-send" ${whoArr.length?'':'disabled'} onclick="approveSummary(true)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> אישור ושליחת סיכום בוואטסאפ</button>
      </div>`;
    else if(!isClient&&m.status==='done') foot=`
      <div class="ms-foot">
        <span class="ms-sentnote">הסיכום אושר${m.sent?' ונשלח ללקוח':''}</span>
        <div class="ms-exp-wrap">
          <button class="ms-nosend" onclick="document.getElementById('msExpDd').classList.toggle('show')">ייצוא ▾</button>
          <div class="ms-exp-dd" id="msExpDd">
            <div class="ms-exp-o" onclick="this.parentElement.classList.remove('show');toast('הסיכום והמשימות נשמרו כ-PDF')"><b>ייצוא ל-PDF</b><span>שמירת הסיכום והמשימות בקובץ</span></div>
            <div class="ms-exp-o" onclick="this.parentElement.classList.remove('show');toast('הסיכום נשלח מחדש ללקוח')"><b>שליחה חוזרת</b><span>שליחה מחדש של הסיכום</span></div>
          </div>
        </div>
      </div>`;
    document.getElementById('mtDetail').innerHTML=`
      <div class="ms-back" onclick="closeMeeting()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg> כל הפגישות</div>
      <div class="ms msp">
        <div class="ms-head">
          <div class="ms-title">${m.name} <span class="msp-chip ${chip[1]}">${chip[0]}</span></div>
          <div class="ms-meta">
            <span>${m.client} · ${m.adv}</span>
            ${whoArr.length?`<span>${USR_ICO}<span>עם ${whoArr.join(' + ')}</span></span>`:''}
            <span>${CAL_ICO}<span>${m.date}</span></span>
            <span>${CLK_ICO}<span>${m.time}</span></span>
            ${m.rec?`<span>${m.rec}</span>`:''}
          </div>
        </div>
        ${preStart?msPreStart(m):`<div class="ms-tabs">${isClient?`
          <div class="ms-tab on" onclick="msTab(this,'summary')">סיכום פגישה</div>
          <div class="ms-tab" onclick="msTab(this,'tasks')">משימות</div>`:`
          <div class="ms-tab" onclick="msTab(this,'transcript')">תמלול</div>
          <div class="ms-tab on" onclick="msTab(this,'summary')">סיכום פגישה</div>
          <div class="ms-tab" onclick="msTab(this,'tasks')">משימות</div>
          <div class="ms-tab" onclick="msTab(this,'feedback')">משוב</div>
          <div class="ms-tab" onclick="msTab(this,'memupd')">עדכוני זיכרון</div>`}
        </div>
        <div class="ms-body" id="msBody">${MS_SUMMARY}</div>`}
        ${foot}
      </div>`;
    document.querySelector('#viewMeetings .mt-wrap').style.display='none';
    document.getElementById('mtDetail').style.display='';
    document.querySelector('.main').scrollTop=0; window.scrollTo(0,0);
  }
  function closeMeeting(){
    document.getElementById('mtDetail').style.display='none';
    const w=document.querySelector('#viewMeetings .mt-wrap'); if(w)w.style.display='';
  }
  function msTab(el,t){document.querySelectorAll('.ms-tab').forEach(x=>x.classList.remove('on'));el.classList.add('on');
    MS_TAB=t; MS_PLAYING=false;
    document.getElementById('msBody').innerHTML=msBodyOf(t);}
  function approveSummary(send){
    if(MS_CUR>=0){MEETINGS[MS_CUR].status='done';MEETINGS[MS_CUR].sent=!!send;}
    const nOk=MS_TASKS.filter(t=>t.ok).length;
    toast(send?'הסיכום נשלח ללקוח בוואטסאפ'+(nOk?' · נוצרו '+nOk+' משימות':''):'הסיכום אושר — לא נשלח ללקוח');
    openMeeting(MS_CUR);   // נשארים בפגישה — הפוטר מתחלף לייצוא ושליחה חוזרת
  }
  function sendSummary(){approveSummary(true);}   // תאימות
  /* ---- קביעת פגישה ---- */
  function meetNew(){
    const c=CLIENTS[CUR]||{};
    document.getElementById('mnTitle').value='פגישה חודשית — '+(c.name||'');
    window._mnWho=whoUsers()[0]||'';
    document.getElementById('mnWhoWrap').innerHTML=whoPicker('mn');
    const _b=document.getElementById('mnWhoBtn'); if(_b&&window._mnWho)_b.textContent=window._mnWho+' ▾';
    document.getElementById('mnDate').value='2026-07-09';
    document.getElementById('mnFrom').value='15:00';
    document.getElementById('mnTo').value='16:00';
    document.getElementById('meetNewOv').classList.add('show');
  }
  function meetNewClose(){document.getElementById('meetNewOv').classList.remove('show');}
  function meetNewSave(rec){
    const c=CLIENTS[CUR]||{};
    const d=document.getElementById('mnDate').value.split('-');
    MEETINGS.unshift({name:document.getElementById('mnTitle').value||'פגישה', client:c.name,
      who:window._mnWho||whoUsers()[0],
      date:d[2]+'.'+d[1]+'.'+d[0], time:document.getElementById('mnFrom').value+'-'+document.getElementById('mnTo').value,
      adv:'אילון שחר', status:'upcoming'});
    meetNewClose(); renderMeetings();
    toast('הפגישה נקבעה'+(document.getElementById('mnRemind').checked?' · נשלח אזכור ללקוח':'')+(document.getElementById('mnSync').checked?' · סונכרנה ליומן':''));
    if(rec) startMeetRec(c.name);
  }
  /* פתיחת עמוד פגישה מהבית של היועץ — נכנס לחברה, לסקציית הפגישות, ולפגישה */
  function openMeetingFrom(ci,ix){selectClient(ci);showTab('meetings');openMeeting(ix);}

  /* ===== הקלטת פגישה — מכל מקום בדשבורד ===== */
  let MREC=null;
  /* הגנה: סגירת הטאב באמצע הקלטה מציגה אזהרת דפדפן */
  window.addEventListener('beforeunload',e=>{ if(MREC){ e.preventDefault(); e.returnValue='מתבצעת הקלטת פגישה — סגירת הטאב תקטע אותה'; } });
  const fmtRec=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  /* ---- בר טרום-פגישה: קופץ לבד 5 דק׳ לפני — הקלטה / זום / לא תתקיים ---- */
  let PREBAR_MI=null;
  function showPreMeetBar(mi){
    /* הבר הזה שייך ליועץ: הוא מציג את הפגישה הבאה שלו — עם לקוח אחר — וכפתור הקלטה.
       לבעל העסק אין לו מה לחפש כאן. */
    if(ROLE==='client1'||ROLE==='clientN') return;
    const mm=MEETINGS[mi]; if(!mm||mm.status!=='upcoming')return;
    PREBAR_MI=mi;
    document.getElementById('pmbTxt').innerHTML=`הפגישה הבאה בעוד <b>5 דק׳</b> — ${mm.name} · ${mm.client} · <span dir="ltr">${(mm.time||'').split('-')[0]}</span>`;
    document.getElementById('pmbJoin').style.display=mm.link?'inline-flex':'none';
    document.getElementById('preMeetBar').style.display='flex';
    document.body.classList.add('bar-on');
  }
  function hidePreMeetBar(){
    document.getElementById('preMeetBar').style.display='none';
    if(document.getElementById('mrecBar').style.display==='none')document.body.classList.remove('bar-on');
  }
  function pmbJoin(){toast('נפתח חלון הזום — ההקלטה דרך "טאב / מסך" תתפוס את האודיו');}
  function pmbRec(){
    const ci=ciOf(MEETINGS[PREBAR_MI].client); if(ci>=0){CUR=ci;}
    MS_CUR=PREBAR_MI;
    hidePreMeetBar();
    msRecOpen();
  }
  function pmbNoShow(){
    hkConfirm('הפגישה לא תתקיים?','הפגישה תסומן כ"לא התקיימה" ותופיע בזירת הפגישות לתיאום מחדש.','סימון',()=>{
      if(PREBAR_MI!=null&&MEETINGS[PREBAR_MI])MEETINGS[PREBAR_MI].status='noshow';
      hidePreMeetBar();
      toast('סומן — הפגישה תופיע לתיאום מחדש');
      if(document.getElementById('viewMeetings').style.display!=='none') renderMeetings();
    });
  }
  function startMeetRec(name,mi){
    if(MREC){toast('כבר מתבצעת הקלטה');return;}
    const client=name||(SCOPE==='client'?CLIENTS[CUR].name:'פגישה כללית');
    MREC={sec:0,client,mi:(mi!=null?mi:null),paused:false,marks:0,lines:0};
    document.getElementById('mrecWho').textContent='מקליט פגישה · '+client;
    document.getElementById('mrecClock').textContent='00:00';
    const mk=document.getElementById('mrecMarks'); if(mk)mk.textContent='';
    const pb=document.getElementById('mrecPause'); if(pb)pb.innerHTML='⏸';
    document.getElementById('mrecBar').style.display='flex';
    document.body.classList.add('bar-on');
    hidePreMeetBar();
    MREC.iv=setInterval(()=>{
      if(!MREC||MREC.paused)return;
      MREC.sec++;
      const el=document.getElementById('mrecClock');if(el)el.textContent=fmtRec(MREC.sec);
      /* התמלול נצבר ברקע — נחשף בפאנל לפי דרישה */
      if(MREC.sec%5===0&&MREC.lines<MS_TRANS.length){MREC.lines++;mrecTrRender();}
    },1000);
    toast('ההקלטה החלה — '+client+' · אפשר להמשיך לעבוד בממשק');
  }
  function pauseMeetRec(){
    if(!MREC)return;
    MREC.paused=!MREC.paused;
    const pb=document.getElementById('mrecPause'); if(pb)pb.innerHTML=MREC.paused?'▶':'⏸';
    toast(MREC.paused?'ההקלטה מושהית':'ההקלטה ממשיכה');
  }
  function markMeetRec(){
    if(!MREC)return;
    MREC.marks++;
    const mk=document.getElementById('mrecMarks'); if(mk)mk.textContent=MREC.marks;
    toast('סומן רגע חשוב ('+fmtRec(MREC.sec)+') — ה-AI יתייחס אליו בסיכום ובמשימות');
  }
  function mrecTrTg(){
    const p=document.getElementById('mrecTrPop');
    p.classList.toggle('show');
    if(p.classList.contains('show'))mrecTrRender();
  }
  function mrecTrRender(){
    const p=document.getElementById('mrecTrPop');
    if(!p||!p.classList.contains('show')||!MREC)return;
    p.innerHTML=`<div class="mrtp-h">תמלול חי · ${MREC.client}</div>`+
      (MREC.lines?MS_TRANS.slice(0,MREC.lines).map(t=>`<div class="ms-tr ${t[0]==='יועץ'?'adv':''}"><b>${t[0]}:</b><span>${t[1]}</span></div>`).join(''):'<div class="ms-ldwrap">התמלול יתחיל להופיע בעוד רגע…</div>')+
      '<div class="ms-ldbars"><i></i><i></i><i></i><i></i><i></i></div>';
    p.scrollTop=p.scrollHeight;
  }
  function stopMeetRec(){
    if(!MREC) return;
    hkConfirm('סיום ההקלטה יסגור את הפגישה',
      'לאחר הסיום לא ניתן להמשיך להקליט, וההקלטה תישלח אוטומטית לתמלול, לסיכום ולעדכון הזיכרון.',
      'סיום הקלטה', ()=>{
      clearInterval(MREC.iv);
      const mins=Math.max(1,Math.round(MREC.sec/60));
      if(MREC.mi!=null&&MEETINGS[MREC.mi]){ MEETINGS[MREC.mi].status='ai'; MEETINGS[MREC.mi].rec=mins+' דק׳'; }
      else MEETINGS.unshift({name:'פגישה מוקלטת', client:MREC.client, date:'02.07.2026', time:'עכשיו', adv:'אילון שחר', status:'ai', rec:mins+' דק׳'});
      MREC=null;
      document.getElementById('mrecBar').style.display='none';
      document.body.classList.remove('bar-on');
      document.getElementById('mrecTrPop').classList.remove('show');
      toast('ההקלטה נשלחה לעיבוד — סיכום, משימות ועדכוני זיכרון בדרך');
      if(document.getElementById('viewMeetings').style.display!=='none') renderMeetings();
      if(typeof renderAdvisorHome==='function'&&ROLE==='advisor'&&SCOPE==='portfolio') renderAlerts();
    });
  }


/* ===== הכנה לפגישה — נגזרת מהזיכרון בזמן אמת, לא נשמרת =====
   מקורות: מסמכי הזיכרון + snapshot מספרים + משימות מהפגישה הקודמת.
   נוצרת בפתיחת המסך (ובפרודקשן: אוטומטית 24ש׳ לפני + רענון 30 דק׳ לפני). */
let PREP_TASKS=[
  {t:'העברת הרשאות צפייה בפועלים 112', done:true},
  {t:'עדכון שורה תקציבית — קניות מלאי', done:false},
  {t:'שליחת דוח גבייה מרוכז לצחי', done:true},
];
function prepTaskTg(i){PREP_TASKS[i].done=!PREP_TASKS[i].done;renderPrepView();}
function renderPrepView(){
  const el=document.getElementById('viewPrep'); if(!el) return;
  const c=CLIENTS[CUR]||{};
  const now=new Date();
  const stamp='היום '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const N=(typeof MEM_NUMS!=='undefined'&&MEM_NUMS[CUR])?MEM_NUMS[CUR]:null;
  const kpis=N?N.kpi.slice(0,4).map(n=>`<div class="mem-num ${n.bad?'bad':''}"><span>${n.k}</span><b>${n.v}</b></div>`).join(''):'';
  const openTasks=PREP_TASKS.filter(t=>!t.done).length;
  el.innerHTML=`
  <div class="prp">
    <div class="prp-head">
      <div>
        <div class="prp-ttl">הכנה לפגישה — פגישה חודשית · יולי</div>
        <div class="prp-sub">${c.name||''} · היום 16:00 · <b>נוצרה מהזיכרון והמספרים ${stamp}</b></div>
      </div>
      <div class="prp-acts">
        <button class="mt-btn view" onclick="toast('ההכנה נוצרה מחדש מהזיכרון והמספרים העדכניים');renderPrepView()">↻ רענון</button>
        <button class="mt-btn" onclick="toast('ההכנה נשלחה אליך בוואטסאפ')">שליחה אליי בוואטסאפ</button>
      </div>
    </div>

    <div class="prp-grid">
      <div class="prp-main">
        <div class="prp-card ai">
          <div class="prp-card-h"><span class="prp-spark">✦</span> סיכום AI לפגישה</div>
          <p>הפגישה מגיעה אחרי חודש חזק (הכנסות +12%) אבל עם חריגה צפויה בעו״ש בעוד 9 ימים. הנושא המרכזי: קניות המלאי — גם חרגו מהתקציב (114%) וגם 25,000 ₪ מהן טרם נצבעו בתזרים. צחי ביקש בפגישה הקודמת לרדת לרזולוציית ספקים — להגיע עם הפירוט מוכן.</p>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">נקודות פתיחה</div>
          <div class="prep-pt">ההכנסות +12% מהחודש הקודם — כדאי לפתוח בזה <span class="prp-src">מדדים</span></div>
          <div class="prep-pt">חריגה צפויה בעו״ש בעוד 9 ימים — להציע העברה מפועלים 112 <span class="prp-src">תזרים</span></div>
          <div class="prep-pt">25,000 ₪ קניות מלאי עוד לא נצבעו בתזרים <span class="prp-src">תפעול</span></div>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">מטרה מוצעת לפגישה</div>
          <div class="prp-goal">סגירת תוכנית מלאי לרבעון — תקציב חדש לשורת הקניות + צביעת ה-25,000 ₪ הפתוחים</div>
          <div class="prp-goal-why">למה: זה החוט שמחבר את חריגת התקציב, החריגה הצפויה בעו״ש והכאב שעלה בפגישה הקודמת</div>
        </div>

        <div class="prp-card">
          <div class="prp-card-h">משימות מהפגישה הקודמת <span class="prp-cnt">${openTasks} פתוחות</span></div>
          ${PREP_TASKS.map((t,i)=>`<div class="prp-task ${t.done?'done':''}">
            <label class="mc-chk"><input type="checkbox" ${t.done?'checked':''} onchange="prepTaskTg(${i})"><span></span></label>
            <span>${t.t}</span></div>`).join('')}
        </div>
      </div>

      <aside class="prp-side">
        <div class="prp-card mem">
          <div class="prp-card-h"><span class="pm-tag">מהזיכרון</span> הנחיות אישיות</div>
          <div class="prep-pt mem">פתח במספרים — צחי מאבד סבלנות מהקדמות</div>
          <div class="prep-pt mem">רגישות סביב התלות ברימון — לגעת בזה בעדינות, בלי לחץ</div>
          <div class="prep-pt mem">לצ׳אט נשלח רק: ״ענה ברוגע ובקצרה — הצג תמיד פתרון לצד בעיה״</div>
        </div>
        <div class="prp-card">
          <div class="prp-card-h">מהזיכרון — רלוונטי לפגישה</div>
          <div class="prp-memrow"><span class="mf-cat">מצב תזרימי</span>חריגה בפועל 6 ימים בלאומי · מסגרת 150K בניצול 107%</div>
          <div class="prp-memrow"><span class="mf-cat">כאבי לקוח</span>תלות בשני לקוחות גדולים — 70% מהמחזור</div>
          <div class="prp-memrow"><span class="mf-cat">יעדים והסכמות</span>פתיחת מסגרת נוספת 100 א׳ ₪ — באחריותנו, יעד 15.7</div>
          <button class="mt-btn view sm" style="margin-top:8px" onclick="openMemCard(${CUR})">לכרטיס הלקוח המלא</button>
        </div>
        ${N?`<div class="prp-card"><div class="prp-card-h">מספרים · עכשיו</div><div class="mem-kpis prp-kpis">${kpis}</div></div>`:''}
      </aside>
    </div>
  </div>`;
}

/* ===== זירת הפגישות — גלובלי ליועץ ולמנהל תזרים =====
   כל אינטראקציה מוקלטת (פגישה / שיחה) עוברת צינור אחד:
   הקלטה ← תמלול ← סיכום ← עדכוני זיכרון. המסך שומר שלא מפספסים. */
let MEETS_TAB='meet';   // meet | call
const MEETS_OPEN=new Set();
function msUpTg(ix){MEETS_OPEN.has(ix)?MEETS_OPEN.delete(ix):MEETS_OPEN.add(ix);renderMeetsArena();}
const MEETS_UP=[
  {day:'היום',   date:'יום חמישי · 2.7', time:'16:00', c:'משה עובד',    t:'פגישה חודשית — יולי', prod:'money+', mi:1},
  {day:'מחר',    date:'יום שישי · 3.7',  time:'10:00', c:'רימון יצחק',   t:'פגישה חודשית',        prod:'money+', hkClient:true},
  {day:'יום א׳', date:'5.7',             time:'09:30', c:'לביא הובלות',  t:'פגישת הקמה'},
];
const MEETS_PAST=[
  {d:'היום 09:00',  c:'אנרגי אינטרנשיונל',  t:'פגישה שוטפת — סקירת תזרים', rec:true,  dur:'46 דק׳', sum:'pend', mem:3, mi:0},
  {d:'אתמול 14:00', c:'מטעי גבעון',          t:'שיחת מעקב — חריגת תקציב',   rec:true,  dur:'22 דק׳', sum:'ok',   mem:1},
  {d:'28.06 11:00', c:'אנרגי גולני',         t:'פגישה חודשית — יוני',        rec:true, dur:'51 דק׳', sum:'ok', mem:2, hkClient:true},
  {d:'25.06 13:00', c:'משה עובד',            t:'שיחת היכרות',                rec:false, sum:null,  mem:0},
];
const MEETS_CAD=[
  {ci:0, c:'אנרגי אינטרנשיונל', prod:'money+', last:'היום',   next:'02.08 · מתואמת', ok:true},
  {ci:2, c:'מטעי גבעון',        prod:'money',  last:'אתמול',  next:'לא נדרשת בחוזה',  ok:true, none:true},
  {ci:1, c:'אנרגי גולני',       prod:'money+', last:'28.06',  next:'29.07 · מתואמת', ok:true},
  {ci:3, c:'משה עובד',          prod:'money+', last:'25.06',  next:'לא מתואמת',       ok:false, gap:'41 יום מהאחרונה'},
  {ci:4, c:'רימון יצחק',        prod:'money+', last:'15.06',  next:'מחר 10:00',       ok:true},
];
const MEETS_CALLS=[
  {d:'היום 11:15',  c:'אנרגי גולני',  who:'טל מלקר', t:'עדכון חומרים לתזרים', dur:'6 דק׳',  mem:1, st:'ok'},
  {d:'היום 09:40',  c:'משה עובד',     who:'שמרית טובול',    t:'השלמת הרשאות בנק',    dur:'9 דק׳',  mem:0, st:'proc'},
  {d:'אתמול 15:20', c:'מטעי גבעון',   who:'טל מלקר', t:'בירור חריגת תקציב',   dur:'11 דק׳', mem:2, st:'ok'},
];
/* שיחות היועץ — מהסים של HK: כל שיחה מוקלטת, מתומללת ומעדכנת זיכרון */
const MEETS_CALLS_ADV=[
  {d:'היום 12:30',  c:'אנרגי אינטרנשיונל', who:'', t:'המשך לפגישת הבוקר — סוגרים על המסגרת', dur:'8 דק׳',  mem:1, st:'ok'},
  {d:'היום 10:10',  c:'מטעי גבעון',         who:'', t:'שיחת מעקב — חריגת התקציב',            dur:'12 דק׳', mem:0, st:'proc'},
  {d:'אתמול 16:45', c:'רימון יצחק',          who:'', t:'הכנה לפ.ע — תיאום ציפיות',            dur:'5 דק׳',  mem:1, st:'ok'},
];
function meetsTab(t){MEETS_TAB=t;renderMeetsArena();}
const ciOf=n=>CLIENTS.findIndex(x=>x.name===n);

function renderMeetsArena(){
  const el=document.getElementById('meetsView'); if(!el) return;
  /* בר טרום-פגישה — מלווה גם את הכניסה לזירה */
  if(!window._preBarShown&&typeof showPreMeetBar==='function'){
    const mi=MEETINGS.findIndex(x=>x.date==='02.07.2026'&&x.status==='upcoming');
    if(mi>=0){window._preBarShown=true;showPreMeetBar(mi);}
  }
  const isMgr=(typeof ROLE!=='undefined'&&ROLE==='manager');
  const pendSum=MEETS_PAST.filter(x=>x.sum==='pend').length;
  /* טאבים — פגישות / שיחות */
  const tabs=`<div class="ms-tabs">
    <button class="ms-tab ${MEETS_TAB==='meet'?'on':''}" onclick="meetsTab('meet')">פגישות</button>
    <button class="ms-tab ${MEETS_TAB==='call'?'on':''}" onclick="meetsTab('call')">שיחות טלפון <i class="ms-soon">SIM</i></button>
  </div>`;
  let body='';
  if(MEETS_TAB==='call'&&!isMgr){
    body=`<div class="advl">
      <div class="advl-head"><span class="advl-title">השיחות שלך · הסים של HK</span><span class="advl-sub">דבר עם הלקוחות מהסים — כל שיחה מוקלטת, מתומללת ומעדכנת את זיכרון הלקוח</span></div>
      ${MEETS_CALLS_ADV.map(cl=>`<div class="ms-row">
        <div class="ms-when">${cl.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${cl.c}</b> — ${cl.t}</div>
          <div class="ms-meta">${cl.dur} · ${cl.st==='proc'?'<span class="msp-chip purple">בעיבוד AI</span>':`הזיכרון עודכן${cl.mem?' ('+cl.mem+')':''}`}</div></div>
        ${cl.st==='ok'&&cl.mem?`<button class="mt-btn view sm" onclick="advPop&&advPop('mem')">עדכוני זיכרון</button>`:''}
      </div>`).join('')}
    </div>`;
  }else if(MEETS_TAB==='call'){
    body=`<div class="advl">
      <div class="advl-head"><span class="advl-title">שיחות מוקלטות · SIM</span><span class="advl-sub">כל שיחה מתומללת ומעדכנת את זיכרון הלקוח</span></div>
      ${MEETS_CALLS.map(cl=>`<div class="ms-row">
        <div class="ms-when">${cl.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${cl.c}</b> — ${cl.t}</div>
          <div class="ms-meta">${cl.who} · ${cl.dur} · ${cl.st==='proc'?'<span class="msp-chip purple">בעיבוד AI</span>':`הזיכרון עודכן${cl.mem?' ('+cl.mem+')':''}`}</div></div>
        ${cl.st==='ok'&&cl.mem?`<button class="mt-btn view sm" onclick="advPop&&advPop('mem')">עדכוני זיכרון</button>`:''}
      </div>`).join('')}
    </div>`;
  }else{
    /* לוח הפגישות — העמוד הראשי */
    let lastDay=null;
    const sched=MEETS_UP.map((m,ix)=>{
      const prep=(typeof ADV_PREPS!=='undefined')?ADV_PREPS[m.c]:null;
      const open=MEETS_OPEN.has(ix);
      const dayH=m.day!==lastDay?`<div class="ms-day">${m.day} <span>${m.date}</span></div>`:'';
      lastDay=m.day;
      return `${dayH}<div class="mc-item meet">
        <div class="mc-time" dir="ltr">${m.time}</div>
        <div class="mc-b"><div class="mc-t">${m.c} — ${m.t}${m.hkClient?' <span class="ms-by hk">לקוח HK · הכל הוכן עבורך</span>':''}${isMgr&&m.prod?' <i class="ms-prodtag">Money+</i>':''}</div>
          <div class="mc-s"><span class="ms-prep ok">הכנה מוכנה · מהזיכרון והמספרים</span></div></div>
        ${prep?`<button class="mt-btn view sm ${open?'on':''}" onclick="msUpTg(${ix})">תקציר ${open?'▴':'▾'}</button>`:''}
        ${m.day==='היום'?`<button class="mrec-btn on-card sm" onclick="startMeetRec('${m.c}'${m.mi!=null?','+m.mi:''})"><span class="mrec-dot"></span> הקלטה</button>`:''}
      </div>${prep&&open?`<div class="adv-prep">
        ${prep.pts.map(pt=>`<div class="prep-pt">${pt}</div>`).join('')}
        ${(prep.mem||[]).map(pt=>`<div class="prep-pt mem"><span class="pm-tag">מהזיכרון</span>${pt}</div>`).join('')}
        <button class="mt-btn view sm" onclick="selectClient(${CLIENTS.findIndex(x=>x.name===m.c)});showTab('prep')">להכנה המלאה</button>
      </div>`:''}`;}).join('');
    const schedCard=`<div class="advl">
      <div class="advl-head"><span class="advl-title">לוח הפגישות</span><span class="advl-sub">הלקוחות שלך + פגישות של לקוחות HK שהוקצו לך</span>
        <button class="mt-btn view sm" style="margin-inline-start:auto" onclick="typeof evQuick==='function'?evQuick():toast('קביעת פגישה')">+ קביעת פגישה</button></div>
      ${sched}</div>`;
    /* דורש פעולה — קומפקטי בעמודה הצדדית */
    const act=`<div class="advl">
      <div class="advl-head"><span class="advl-title">דורש פעולה</span></div>
      ${pendSum?`<div class="ms-row act"><span class="ms-dot warn"></span><div class="ms-b"><div class="ms-t"><b>אנרגי אינטרנשיונל</b> — סיכום פגישת 09:00 ממתין לאישורך</div><div class="ms-meta">הסיכום מוכן מהתמלול — לעריכה ואישור לפני שליחה ללקוח</div></div><button class="mt-btn sm" onclick="openMeetingFrom(ciOf('אנרגי אינטרנשיונל'),2)">לאישור</button></div>`:''}
      <div class="ms-row act"><span class="ms-dot bad"></span><div class="ms-b"><div class="ms-t"><b>משה עובד</b> — בלי פגישה מתואמת · 41 יום מהפגישה האחרונה</div><div class="ms-meta">מומלץ לתאם את הפגישה הבאה</div></div><button class="mt-btn sm" onclick="toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')">שליחת זמנים</button></div>
      <div class="ms-row act"><span class="ms-dot warn"></span><div class="ms-b"><div class="ms-t"><b>אנרגי גולני</b> — הפגישה לא התקיימה · לתאם מחדש</div><div class="ms-meta">בוטלה אתמול ע״י הלקוח</div></div><button class="mt-btn sm" onclick="toast('נשלחה הצעה לתיאום מחדש')">תיאום מחדש</button></div>
    </div>`;
    /* התקיימו — צינור עיבוד */
    const pipe=x=>{
      if(!x.rec) return `<span class="ms-pipe warn">לא הוקלטה — הזיכרון לא התעדכן</span>`;
      const sum=x.sum==='pend'?'<i class="msp warn">סיכום · לאישורך</i>':'<i class="msp ok">סיכום ✓</i>';
      const mem=x.mem?`<i class="msp mem">זיכרון עודכן (${x.mem})</i>`:'<i class="msp">—</i>';
      return `<span class="ms-pipe"><i class="msp ok">הוקלטה · ${x.dur}</i>${sum}${mem}</span>`;
    };
    const past=`<div class="advl">
      <div class="advl-head"><span class="advl-title">התקיימו לאחרונה</span></div>
      ${MEETS_PAST.map(x=>`<div class="ms-row">
        <div class="ms-when">${x.d}</div>
        <div class="ms-b"><div class="ms-t"><b>${x.c}</b> — ${x.t}${x.hkClient?' <span class="ms-by hk">לקוח HK</span>':''}</div><div class="ms-meta">${pipe(x)}</div></div>
        ${x.mi!=null?`<button class="mt-btn sm" onclick="openMeetingFrom(ciOf('${x.c}'),${x.mi})">לפגישה</button>`:''}
        ${x.mem?`<button class="mt-btn view sm" onclick="advPop&&advPop('mem')">זיכרון</button>`:''}
      </div>`).join('')}
    </div>`;
    body=`<div class="ms-grid"><div>${schedCard}</div><div>${act}${past}</div></div>${isMgr?(()=>{
      const cad=`<div class="advl">
      <div class="advl-head"><span class="advl-title">מקצב פגישות — לפי לקוח</span><span class="advl-sub">לפי המוצר של כל לקוח · שאף אחד לא יתפספס</span></div>
      <div class="ms-cad-h"><span>לקוח</span><span>מוצר</span><span>אחרונה</span><span>הבאה</span><span></span></div>
      ${MEETS_CAD.map(r=>`<div class="ms-cad ${r.ok?'':'bad'}">
        <b>${r.c}</b>
        <span>${typeof prodLogo==='function'&&r.prod?prodLogo(r.prod,'sm'):r.prod}</span>
        <span>${r.last}</span>
        <span class="${r.ok?(r.none?'mut':''):'neg'}">${r.next}${r.gap?` · ${r.gap}`:''}</span>
        <span>${r.ok?'':`<button class="mt-btn sm" onclick="toast('נשלחו ללקוח 3 הצעות זמנים בוואטסאפ')">שליחת זמנים</button>`}</span>
      </div>`).join('')}
    </div>`;return cad;})():''}`;
  }
  el.innerHTML=`<div class="ms-arena">${tabs}${body}</div>`;
}
