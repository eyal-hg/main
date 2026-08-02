/* HK Dashboard — seed data: CLIENTS (בפרודקשן: שכבת API) */
  const CLIENTS = [
    { name:'אנרגי אינטרנשיונל', hp:'511327876', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:5, sync:'01.07 10:54', warn:true, opsPending:7, opsAlert:true, reqBy:'10:00', mReport:true, bankDown:true,
      thread:[
        {from:'hk', name:'HK', auto:true, t:'היי צחי, סיימתי כעת לעדכן ולנהל עבורך את תזרים המזומנים להיום. רוצה לראות מה חדש?', when:'02.06 13:05'},
        {from:'user', name:'צחי עובד', t:'צפייה בתזרים שלי', when:'02.06 13:11'},
        {from:'hk', name:'HK', auto:true, t:'תחזית תזרים שבועית · יתרה נוכחית 430,481 ₪. צפויה חריגה ב-13.7', when:'02.06 13:11'},
        {from:'user', name:'צחי עובד', t:'ראיתי את החריגה הצפויה — אפשר לדחות את התשלום לספק הגדול?', when:'היום 08:40'},
        {from:'user', name:'צחי עובד', t:'וגם צריך להוסיף את החשבונית של יולי מהמוסך', when:'היום 08:52'},
        {from:'user', name:'צחי עובד', t:'מתי נוח לך שיחה קצרה היום?', when:'היום 09:05'} ] },
    { name:'אנרגי גולני', hp:'511200341', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:0, sync:'01.07 10:27', opsPending:2, mReport:true },
    { name:'מטעי גבעון', hp:'514778220', mgr:'לירון בן כליפא', firm:'אשכנזי ייעוץ עסקי', status:'active', unread:0, sync:'01.07 10:26', opsPending:3, opsAlert:true, group:true,
      thread:[
        {from:'user', name:'יוסי גבעון', t:'היי, אפשר לקבל עדכון על מצב החשבון?', when:'היום 09:12'},
        {from:'user', name:'יוסי גבעון', t:'וגם — הגיע צ׳ק מלקוח חדש, לאן לשלוח צילום?', when:'היום 09:15'} ] },
    { name:'משה עובד', hp:'039112774', mgr:'שמרית טובול', firm:'ברק ושות׳', status:'active', unread:0, sync:'01.07 10:26', opsPending:0 },
    { name:'רימון יצחק', hp:'025664109', mgr:'שמרית טובול', firm:'ברק ושות׳', status:'active', unread:0, sync:'01.07 10:26', opsPending:1, advClient:true,
      thread:[
        {from:'user', name:'רימון יצחק', t:'היי, אפשר לקבל עדכון על מצב החשבון?', when:'היום 08:20'},
        {from:'user', name:'רימון יצחק', t:'ושאלה — ההעברה מהעירייה נכנסה?', when:'היום 08:31'} ] },
  ];
  let CUR = 0, RAIL_TAB='all';

