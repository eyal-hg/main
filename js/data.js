/* HK Dashboard — seed data: CLIENTS (בפרודקשן: שכבת API) */
  const CLIENTS = [
    { name:'אנרגי אינטרנשיונל', hp:'511327876', price:1850, lastOps:'02.07', coopLast:'02.07', coopDays:0, spark:[242,268,255,300,307,301], hl:{sev:'high',t:'חריגה צפויה בעו״ש בעוד 9 ימים'}, advStatus:'פעיל', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:5, sync:'01.07 10:54', warn:true, opsPending:7, opsAlert:true, reqBy:'10:00', mReport:true, bankDown:true,
      thread:[
        {from:'hk', name:'HK', auto:true, t:'היי צחי, סיימתי כעת לעדכן ולנהל עבורך את תזרים המזומנים להיום. רוצה לראות מה חדש?', when:'02.06 13:05'},
        {from:'user', name:'צחי עובד', t:'צפייה בתזרים שלי', when:'02.06 13:11'},
        {from:'hk', name:'HK', auto:true, t:'תחזית תזרים שבועית · יתרה נוכחית 430,481 ₪. צפויה חריגה ב-13.7', when:'02.06 13:11'},
        {from:'user', name:'צחי עובד', t:'ראיתי את החריגה הצפויה — אפשר לדחות את התשלום לספק הגדול?', when:'היום 08:40'},
        {from:'user', name:'צחי עובד', t:'וגם צריך להוסיף את החשבונית של יולי מהמוסך', when:'היום 08:52'},
        {from:'user', name:'צחי עובד', t:'מתי נוח לך שיחה קצרה היום?', when:'היום 09:05'} ] },
    { name:'אנרגי גולני', hp:'511200341', price:950, lastOps:'01.07', coopLast:'12.06', coopDays:20, spark:[180,195,210,205,220,228], hl:{sev:'mid',t:'96% מתקרת התקציב — לבדיקה השבוע'}, advStatus:'פעיל', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:0, sync:'01.07 10:27', opsPending:2, mReport:true },
    { name:'מטעי גבעון', hp:'514778220', price:1450, lastOps:'02.07', coopLast:'30.06', coopDays:2, spark:[420,460,430,445,470,466], hl:{sev:'high',t:'חריגת תקציב — 114% מהיעד'}, advStatus:'פעיל', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:0, sync:'01.07 10:26', opsPending:3, opsAlert:true, group:true,
      thread:[
        {from:'user', name:'יוסי גבעון', t:'היי, אפשר לקבל עדכון על מצב החשבון?', when:'היום 09:12'},
        {from:'user', name:'יוסי גבעון', t:'וגם — הגיע צ׳ק מלקוח חדש, לאן לשלוח צילום?', when:'היום 09:15'} ] },
    { name:'משה עובד', hp:'039112774', price:850, lastOps:'—', coopLast:null, coopDays:null, spark:[0,0,0,0,120,174], hl:{sev:'setup',t:'בהקמה — ממתין להרשאות בנק'}, advStatus:'בהקמה', mgr:'שמרית טובול', firm:'ברק ושות׳', status:'active', unread:0, sync:'01.07 10:26', opsPending:0 },
    { name:'רימון יצחק', hp:'025664109', price:1050, lastOps:'01.07', coopLast:'15.06', coopDays:17, spark:[350,342,371,360,388,421], hl:null, advStatus:'פעיל', mgr:'שמרית טובול', firm:'ברק ושות׳', status:'active', unread:0, sync:'01.07 10:26', opsPending:1, advClient:true,
      thread:[
        {from:'user', name:'רימון יצחק', t:'היי, אפשר לקבל עדכון על מצב החשבון?', when:'היום 08:20'},
        {from:'user', name:'רימון יצחק', t:'ושאלה — ההעברה מהעירייה נכנסה?', when:'היום 08:31'} ] },
    /* ארכיון — חברות שיצאו. לא בתור, לא בחיוב, לא בהתראות.
       נשלפות רק כשבוחרים "ארכיון" במסך הלקוחות. */
    { name:'דלתא ריהוט', hp:'513994201', price:0, lastOps:'14.03', coopLast:'12.03', coopDays:null,
      spark:[210,198,176,150,120,0], hl:null, advStatus:'ארכיון', mgr:'לירון בן כליפא',
      firm:'אשכנזי ייעוץ עסקי', unread:0, sync:'—', opsPending:0,
      archOn:'20.03.2026', archWhy:'סיום התקשרות ביוזמת הלקוח' },
    { name:'שחר לוגיסטיקה', hp:'514003877', price:0, lastOps:'02.01', coopLast:'28.12', coopDays:null,
      spark:[95,102,88,74,60,0], hl:null, advStatus:'ארכיון', mgr:'שמרית טובול',
      firm:'ברק ושות׳', unread:0, sync:'—', opsPending:0,
      archOn:'08.01.2026', archWhy:'החברה נסגרה' },
  ];
  /* מצב החברה — שדה אחד, שלושה מצבים. status הישן היה שדה מת (הכל 'active'). */
  const coState=c=>c&&c.advStatus==='ארכיון'?'arch':c&&c.advStatus==='בהקמה'?'setup':'active';
  const coActive=c=>coState(c)==='active';

  /* ===== דמו בקנה מידה אמיתי — תיק של ~100 חברות =====
     נוצר דטרמיניסטית (בלי Math.random) כדי שהמסך ייראה אותו דבר בכל טעינה.
     החמש הראשונות + שתי הארכיון נשארות ידניות — הן נושאות את התוכן העשיר. */
  (function seedPortfolio(){
    const A=['אלפא','ברק','גל','דלתא','הדר','ורד','זוהר','חורש','טל','יובל','כרמל','לביא','מגן','נוף','סהר','עומר','פלג','צור','קדם','רימון','שחף','תמר','אביב','בזלת','גפן','דקל','הראל','ורדית','זית','חמדה'];
    const B=['תעשיות','שיווק','הנדסה','לוגיסטיקה','בנייה','אחזקות','מערכות','ייבוא','מזון','טכנולוגיות','אנרגיה','רהיטים','טקסטיל','דפוס','חשמל','פלסטיק','תקשורת','רכב','נדל״ן','מתכת','אריזות','כימיקלים','ספנות','תעופה','ביטחון'];
    const MGRS=['לירון בן כליפא','שמרית טובול','נועה ברששת','אבי מזרחי','דנה שקד','יוסי אלימלך'];
    const FIRMS=['אשכנזי ייעוץ עסקי','ברק ושות׳','מ.ג. פיננסים','רוזן ייעוץ'];
    const PRODS=['money','money+','meeting'];
    const WHY=['סיום התקשרות ביוזמת הלקוח','החברה נסגרה','מעבר למשרד אחר','אי-תשלום'];
    let s=97;                                   // LCG — רצף קבוע
    const rnd=()=>((s=(s*1103515245+12345)&0x7fffffff)/0x7fffffff);
    const pick=a=>a[Math.floor(rnd()*a.length)];
    const used=new Set(CLIENTS.map(c=>c.name));
    for(let n=0;n<95;n++){
      let name;
      do{ name=pick(A)+' '+pick(B); }while(used.has(name));
      used.add(name);
      const r=rnd();
      const st=r<0.13?'ארכיון':r<0.20?'בהקמה':'פעיל';
      const sp=[]; let v=60+Math.floor(rnd()*380);
      for(let k=0;k<6;k++){ v=Math.max(20,Math.round(v*(0.9+rnd()*0.25))); sp.push(st==='ארכיון'&&k===5?0:v); }
      const coop=st==='פעיל'?Math.floor(rnd()*26):null;
      const alert=st==='פעיל'&&rnd()<0.22;
      CLIENTS.push({
        name, hp:String(510000000+Math.floor(rnd()*4999999)),
        price:st==='ארכיון'?0:650+Math.floor(rnd()*18)*100,
        lastOps:st==='פעיל'?'02.07':'—',
        coopLast:st==='פעיל'?(coop>14?'12.06':'01.07'):null, coopDays:coop,
        spark:sp, hl:alert?{sev:rnd()<0.4?'high':'mid',t:rnd()<0.5?'חריגה צפויה בעו״ש':'חריגת תקציב — מעל היעד'}:null,
        advStatus:st, mgr:pick(MGRS), firm:pick(FIRMS), product:pick(PRODS),
        unread:st==='פעיל'&&rnd()<0.3?1+Math.floor(rnd()*4):0,
        sync:st==='פעיל'?'01.07 10:2'+Math.floor(rnd()*9):'—',
        opsPending:st==='פעיל'?Math.floor(rnd()*6):0, opsAlert:alert,
        mReport:st==='פעיל'&&rnd()<0.62,
        archOn:st==='ארכיון'?(1+Math.floor(rnd()*28))+'.0'+(1+Math.floor(rnd()*6))+'.2026':null,
        archWhy:st==='ארכיון'?pick(WHY):null });
    }
  })();
  /* קבוצת החברות של לקוח רב-חברות — 5 חברות, לא התיק של היועץ */
  const CLIENT_GROUP_N = 5;
  let CUR = 0, RAIL_TAB='all';

