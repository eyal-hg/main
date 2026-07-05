/* Jampa — seed data: PATIENTS + MEETINGS (בפרודקשן: שכבת API) */
const PATIENTS=[
  {name:'נועה ברק', age:34, focus:'חרדה חברתית', stage:'שלב 4 · עבודה על דפוסים', progress:62,
   mood:[3,4,3,5,4,5,6], nextSession:'היום · 16:00', lastSession:'26.06', sinceDays:7,
   pendingSummary:true, needSchedule:false, tasksOpen:2, tasksDone:5, unread:2,
   chat:[
     {from:'jampa', auto:true, t:'היי נועה 🌸 איך עבר עלייך התרגול של נשימות ה-4-7-8 השבוע?', when:'01.07 09:00'},
     {from:'user',  t:'עשיתי 4 פעמים. בפגישה עם המנהל שוב הרגשתי את הלחץ בחזה אבל הפעם זה עבר מהר יותר', when:'01.07 12:40'},
     {from:'jampa', auto:true, t:'זו התקדמות יפה מאוד — שמת לב שהלחץ עבר מהר יותר, וזה בדיוק השריר שאנחנו מאמנים 💪 נספר לענת בפגישה היום', when:'01.07 12:42'}]},
  {name:'יואב פרידמן', age:41, focus:'משבר זוגי', stage:'שלב 2 · מיפוי צרכים', progress:28,
   mood:[5,4,4,3,3,4,4], nextSession:'מחר · 10:00', lastSession:'29.06', sinceDays:4,
   pendingSummary:false, needSchedule:false, tasksOpen:1, tasksDone:2, unread:0,
   chat:[{from:'jampa', auto:true, t:'ערב טוב יואב, תזכורת עדינה למשימה שסיכמתם — שיחת 20 דקות בלי מסכים עם דנה 💬', when:'30.06 19:00'}]},
  {name:'מיכל אדרי', age:27, focus:'ביטחון עצמי בעבודה', stage:'שלב 5 · יישום והטמעה', progress:81,
   mood:[4,5,5,6,6,7,7], nextSession:'לא נקבעה', lastSession:'19.06', sinceDays:14,
   pendingSummary:false, needSchedule:true, tasksOpen:0, tasksDone:8, unread:1,
   chat:[{from:'user', t:'הצגתי היום בישיבת הצוות בלי להתכונן שבוע מראש 🎉', when:'02.07 15:20'},
         {from:'jampa', auto:true, t:'איזה רגע גדול מיכל! 🎉 בדיוק על זה עבדתן. שווה לקבוע פגישת סיכום — אשלח כמה זמנים?', when:'02.07 15:22'}]},
  {name:'דניאל כהן', age:16, focus:'ויסות רגשי · מתבגרים', stage:'שלב 3 · כלים להתמודדות', progress:45,
   mood:[4,3,5,4,2,3,4], nextSession:'חמישי · 17:30', lastSession:'27.06', sinceDays:6,
   pendingSummary:false, needSchedule:false, tasksOpen:3, tasksDone:1, unread:0, moodDrop:true,
   chat:[{from:'jampa', auto:true, t:'היי דניאל, ראיתי שסימנת יום קשה 🌧 רוצה לכתוב לי מה קרה, או שנשמור את זה לפגישה עם רונן?', when:'01.07 20:15'}]},
  {name:'שרה לוינסון', age:52, focus:'אבל ואובדן', stage:'שלב 1 · בניית קשר', progress:12,
   mood:[2,3,2,3,3,3,4], nextSession:'ראשון · 09:00', lastSession:'30.06', sinceDays:3,
   pendingSummary:true, needSchedule:false, tasksOpen:1, tasksDone:0, unread:0,
   chat:[]},
  {name:'עומר גל', age:29, focus:'דחיינות ומיקוד', stage:'שלב 4 · עבודה על דפוסים', progress:58,
   mood:[5,5,4,6,5,6,6], nextSession:'רביעי · 13:00', lastSession:'25.06', sinceDays:8,
   pendingSummary:false, needSchedule:false, tasksOpen:2, tasksDone:6, unread:0,
   chat:[]},
];

const J_MEETINGS=[
  {p:0, name:'פגישה שבועית — עבודה על דפוסי הימנעות', date:'היום',  time:'16:00-16:50', status:'upcoming'},
  {p:1, name:'פגישה זוגית — מיפוי צרכים',              date:'מחר',   time:'10:00-10:50', status:'upcoming'},
  {p:0, name:'פגישה שבועית — חשיפה הדרגתית',           date:'26.06', time:'16:00-16:50', status:'summary', rec:'52 דק׳'},
  {p:4, name:'פגישת היכרות והערכה',                    date:'30.06', time:'09:00-10:00', status:'summary', rec:'58 דק׳'},
  {p:3, name:'פגישה פרטנית — כלי ויסות',               date:'27.06', time:'17:30-18:15', status:'done', rec:'47 דק׳'},
  {p:2, name:'פגישת התקדמות — סימולציית פרזנטציה',      date:'19.06', time:'11:00-11:50', status:'done', rec:'50 דק׳'},
  {p:5, name:'פגישה שבועית — מבנה יום עבודה',           date:'25.06', time:'13:00-13:50', status:'done', rec:'49 דק׳'},
];

/* prep brief (הכנה לפגישה) — generated per patient */
const J_BRIEF={
  snapshot:['נועה בשלב 4 — עבודה על דפוסי הימנעות. מגמת מצב הרוח בעלייה עקבית (3→6 בחודש).',
    'תרגלה נשימות 4-7-8 ארבע פעמים השבוע; דיווחה שהלחץ בפגישה עם המנהל "עבר מהר יותר".',
    'משימה פתוחה: יזימת שיחה אחת עם קולגה לא מוכרת — טרם בוצעה.'],
  patterns:['דפוס נמנע: דוחה אינטראקציות לא מתוכננות, במיוחד מול דמויות סמכות.',
    'חוזקה חוזרת: כשמתכוננת מראש — רמת החרדה יורדת משמעותית. שווה לחזק.'],
  openers:['לפתוח ברגע ההצלחה מהפגישה עם המנהל — לתת לה לספר את זה בעצמה.',
    'לבדוק בעדינות מה עצר את משימת השיחה עם הקולגה — בלי שיפוטיות.'],
};

/* AI processing steps after recording ends (המקבילה של בדיקות Bizibox) */
const REC_STEPS=['העלאת ההקלטה המאובטחת','תמלול וזיהוי דוברים','ניתוח רגשי וזיהוי דפוסים','יצירת סיכום, משימות וסופרוויזיון'];

/* summary produced by the AI for the recorded session */
const REC_SUMMARY={
  points:['נועה שיתפה בהצלחה מהשבוע: הלחץ בשיחה עם המנהל התפוגג מהר מבעבר — עדות לחיזוק שריר הוויסות.',
    'זוהה טריגר חדש: ישיבות בהשתתפות יותר מ-5 אנשים מעלות הימנעות מדיבור.',
    'הוגדרה משימה חדשה: להרים יד פעם אחת בישיבת הצוות הקרובה, גם אם רק לשאלה קצרה.'],
  supervision:[
    {t:'קשר ואמפתיה', d:'חיבור חזק לאורך הפגישה. בדקה ה-32 נועה הנמיכה קול כשדיברה על אביה — עברת הלאה מהר. שווה לחזור לזה בפגישה הבאה.'},
    {t:'נקודת עיוורון', d:'שלוש פעמים נועה ניסחה הצלחות בלשון "סתם היה לי מזל" — מזעור עצמי שלא שיקפת.'},
    {t:'הזדמנות שחמקה', d:'כשהזכירה את הישיבות הגדולות, היה פתח לעבודת חשיפה מדורגת — נשמר כהצעה לפגישה הבאה.'}],
  tasks:['נשימות 4-7-8 — פעם ביום','להרים יד פעם אחת בישיבת צוות','יומן רגעי גאווה — 3 רישומים'],
};
