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
  ];
  let CUR = 0, RAIL_TAB='all';

