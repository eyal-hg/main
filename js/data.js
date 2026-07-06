/* HK Dashboard — seed data: CLIENTS (בפרודקשן: שכבת API) */
  const CLIENTS = [
    { name:'אנרגי אינטרנשיונל', hp:'511327876', mgr:'לירון בן כליפא', status:'active', unread:5, sync:'01.07 10:54', warn:true, opsPending:7, opsAlert:true,
      thread:[
        {from:'hk', name:'HK', auto:true, t:'היי צחי, סיימתי כעת לעדכן ולנהל עבורך את תזרים המזומנים להיום. רוצה לראות מה חדש?', when:'02.06 13:05'},
        {from:'user', name:'צחי עובד', t:'צפייה בתזרים שלי', when:'02.06 13:11'},
        {from:'hk', name:'HK', auto:true, t:'תחזית תזרים שבועית · יתרה נוכחית 430,481 ₪. צפויה חריגה ב-13.7', when:'02.06 13:11'} ] },
    { name:'אנרגי גולני', hp:'511200341', mgr:'לירון בן כליפא', status:'active', unread:0, sync:'01.07 10:27', opsPending:2 },
    { name:'מטעי גבעון', hp:'514778220', mgr:'לירון בן כליפא', status:'active', unread:0, sync:'01.07 10:26', opsPending:3, opsAlert:true },
    { name:'משה עובד', hp:'039112774', mgr:'שמרית טובול', status:'active', unread:0, sync:'01.07 10:26', opsPending:0 },
    { name:'רימון יצחק', hp:'025664109', mgr:'שמרית טובול', status:'active', unread:0, sync:'01.07 10:26', opsPending:1 },
  ];
  let CUR = 0, RAIL_TAB='all';

