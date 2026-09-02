/* ===== זיכרון לקוח — כרטיס לקוח ליועץ =====
   שני סוגי מסמכים: חברה (המצב העסקי) ויוזר (האדם).
   כל קטגוריה = מסמך חי שמתעדכן (לא נערם) אחרי כל אינטראקציה,
   לפי הפרומפט שלה. flow אחד פרמטרי מאחור. */

/* ---- הקטגוריות + הפרומפט המלא של כל אחת ---- */
const MEM_ROLES=[
  {k:'super',    label:'Super Admin', hk:true},
  {k:'hkcons',   label:'יועץ HK',     hk:true},
  {k:'hkrep',    label:'נציג HK',     hk:true},
  {k:'admin',    label:'אדמין יועץ'},
  {k:'rep',      label:'נציג יועץ'},
  {k:'customer', label:'לקוח'},
];
const HK_ROLES=['super','hkcons','hkrep'];
const ALL_ROLES=MEM_ROLES.map(r=>r.k);
const rolesOf=c=>c.scope==='company'?ALL_ROLES.slice():(c.roles||(c.vis==='client'?ALL_ROLES.slice():HK_ROLES.slice()));
function roleChips(roles){
  if(roles.length>=ALL_ROLES.length) return '<span class="rl-chip all">כל התפקידים</span>';
  // מציגים את התפקידים שנבחרו לפי הסדר הקבוע
  return ALL_ROLES.filter(k=>roles.includes(k)).map(k=>{const r=MEM_ROLES.find(x=>x.k===k);return `<span class="rl-chip ${r.hk?'hk':'cl'}">${r.label}</span>`;}).join('');
}
let MEM_CATS=[
  /* ===== חברה ===== */
  {key:'cashpos', desc:'יתרות, מסגרות אשראי, חריגות ופערי תזמון', scope:'company', name:'מצב תזרימי', internal:false, vis:'client', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "מצב תזרימי" בכרטיס החברה. קלט: סיכום האינטראקציה האחרונה (פגישה / שיחה / צ'אט) והמסמך הנוכחי של הקטגוריה.
בדוק אם עלה מידע שמשנה את תמונת התזרים: יתרות ומגמתן, מסגרות אשראי וניצולן, חריגות בפועל או צפויות, עונתיות, פערים בין גבייה לתשלומים.
אם לא עלה מידע כזה — החזר "אין עדכון" ואל תיגע במסמך.
אם עלה: עדכן את המסמך כתמונת מצב בזמן הווה, עד 8 שורות. החלף נתונים שהשתנו — אל תנהל יומן אירועים ואל תוסיף שורות מצטברות. לכל קביעה מהותית צרף (תאריך · מקור). עובדות תזרים בלבד — בלי פרשנות רגשית.`},
  {key:'bizprofile', desc:'תחומי פעילות, לקוחות וספקים, מבנה העסק', scope:'company', name:'פרופיל עסקי', internal:false, vis:'client', lastRun:'15.06',
   prompt:`אתה מתחזק את קטגוריית "פרופיל עסקי" בכרטיס החברה. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם עלתה עובדה מבנית על העסק: תחומי פעילות, מוצרים ושירותים, לקוחות וספקים מרכזיים, עונתיות, מבנה (סניפים, עובדים, בעלי תפקידים), תלות בגורם מפתח.
אם אין — החזר "אין עדכון". אם יש: עדכן את המסמך (עד 10 שורות) כתיאור עדכני של העסק. החלף עובדות שהשתנו. זה המסמך שממנו ה-AI מבין את העסק — כתוב יבש, מדויק וללא הערכות.`},
  {key:'pains', desc:'נקודות הכאב העסקיות ומגמתן', scope:'company', name:'כאבי לקוח', internal:false, vis:'hk', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "כאבי לקוח" — נקודות הכאב העסקיות. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם עלה כאב עסקי חדש (גבייה, מלאי, ריווחיות, עומס תפעולי, אשראי), אם כאב קיים החריף/נחלש, או אם כאב נפתר.
אם אין שינוי — החזר "אין עדכון". אם יש: עדכן את הרשימה — עד 6 כאבים ממוינים לפי חומרה, שורה לכאב: הכאב, מאז מתי, (תאריך · מקור). כאב שנפתר — הסר, או השאר שורה אחת "נפתר (תאריך)" למשך חודש.`},
  {key:'goals', desc:'יעדים והבטחות שסוכמו עם הלקוח', scope:'company', name:'יעדים והסכמות', internal:false, vis:'client', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "יעדים והסכמות" — מה סוכם בין הלקוח לבינינו. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם נקבעו יעדים חדשים, הבטחות שלנו או של הלקוח, מועדי יעד — או אם השתנה סטטוס של קיימים (הושג / בתהליך / נזנח).
אם אין — החזר "אין עדכון". אם יש: עדכן — שורה ליעד: היעד, בעל האחריות, מועד, סטטוס, (תאריך · מקור). יעד שהושלם לפני יותר מחודש — הסר.`},
  {key:'events', desc:'אירועים חד-פעמיים ששינו את התמונה', scope:'company', name:'אירועים מהותיים', internal:false, vis:'client', lastRun:'20.06',
   prompt:`אתה מתחזק את קטגוריית "אירועים מהותיים" — אירועים חד-פעמיים שמשנים את התמונה העסקית: השקעה, זכייה או אובדן של לקוח גדול, עזיבת עובד מפתח, רגולציה, תביעה, מעבר מבנה.
בדוק אם באינטראקציה עלה אירוע כזה, או אם אירוע קיים כבר לא רלוונטי להבנת המצב.
אם אין — החזר "אין עדכון". אם יש: עדכן — עד 5 אירועים, כל אחד עם תאריך והשפעה צפויה במשפט. הסר אירועים שמוצו.`},
  {key:'coop_co', desc:'האם הלקוח מביא חומר לתזרים ומתי', scope:'company', name:'שיתוף פעולה', internal:false, vis:'client', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "שיתוף פעולה" של החברה — במרכזה: האם הלקוח מביא חומר לתזרים. קלט: סיכום האינטראקציה, היסטוריית ההודעות והמסמכים, והמסמך הנוכחי.
בדוק: האם התקבל חומר לתזרים — צפי קדימה: תשלומים לספקים, תקבולים צפויים מלקוחות, שיקים ומועדי פירעון (בטבלאות ההזנה או בקבוצה) — מזוהה מקריאת ההיסטוריה או מאזכור בשיחת טלפון; וכן הרשאות בנק, יישום המלצות וזמינות אנשי הכספים.
השורה הראשונה של המסמך היא תמיד: "חומר אחרון לתזרים: (תאריך) · (מה התקבל ובאיזה ערוץ)" — עדכן אותה בכל פעם שמזוהה חומר חדש.
אם אין שום מידע חדש — החזר "אין עדכון". אחרת עדכן תמונת מצב: מה עובד, מה נתקע ומאז מתי, עם (תאריך · מקור). עד 6 שורות. מדד תפעולי — בלי שיפוטיות על אנשים.`},
  /* ===== יוזר ===== */
  {key:'commstyle', desc:'איך היוזר מעדיף לתקשר — הנחיות טון', scope:'user', name:'סגנון תקשורת', internal:false, vis:'hk', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "סגנון תקשורת" של היוזר. קלט: תמלול/סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם נלמד משהו על איך היוזר מעדיף לתקשר: קצר או מפורט, מספרים או תמונה גדולה, ערוץ מועדף, שעות נוחות, שפה וטון.
אם אין — החזר "אין עדכון". אם יש: עדכן — נסח כהנחיות פעולה לצ'אט ("פתח במספרים", "דבר קצר", "אל תציף בפרטים"), עד 6 הנחיות. המסמך הזה מוזן לצ'אט הלקוח — אסור לכלול בו תצפיות רגשיות או ציטוטים, רק הנחיות טון.`},
  {key:'csat', desc:'שביעות רצון מהשירות ומה-AI', scope:'user', name:'שביעות רצון מהשירות', internal:true, vis:'hk', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "שביעות רצון מהשירות" של היוזר — פנימי בלבד, לעיני הצוות. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם עלה אות לשביעות רצון או אי-שביעות רצון: מהמוצר, מהליווי, מהמחיר, מזמני תגובה — וגם מה-AI (לאקי והצ'אט): האם הוא סומך עליו, מתייעץ איתו, מתלונן על תשובות.
אם אין — החזר "אין עדכון". אם יש: עדכן את תמונת המצב + מגמה (השתפר / הידרדר, מאז מתי), עם (תאריך · מקור) לכל קביעה. עד 6 שורות.
המסמך עצמו לעולם לא נשלח לצ'אט. בסוף כל עדכון הפק גם שדה נפרד "הנחיות לצ'אט" — עד 2 הנחיות התנהגות מזוקקות בלי אף עובדה מהמסמך (למשל: "הקפד על מענה מהיר ומדויק — יש רגישות לאיכות השירות"). רק השדה הזה מוזן לצ'אט.`},
  {key:'mood', desc:'מצב אישי ולחץ — תצפיות בלבד', scope:'user', name:'מצב אישי ולחץ', internal:true, vis:'hk', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "מצב אישי ולחץ" של היוזר — פנימי בלבד. קלט: תמלול/סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם עלו תצפיות על מצבו: רגוע או לחוץ, ביטחון בעסק, עייפות, אירועים אישיים שמשפיעים על התנהלותו.
אם אין — החזר "אין עדכון". אם יש: עדכן בזהירות — תצפיות בלבד, בלי אבחנות ובלי שיפוטיות ("נשמע לחוץ סביב תשלומי המשכורות", לא "חרדתי"). עד 5 שורות עם (תאריך · מקור).
המסמך עצמו לעולם לא נשלח לצ'אט. בסוף כל עדכון הפק גם שדה נפרד "הנחיות לצ'אט" — עד 2 הנחיות טון מזוקקות בלי אף עובדה (למשל: "ענה ברוגע ובקצרה, הצג תמיד פתרון לצד בעיה"). רק השדה הזה מוזן לצ'אט; תשובת הצ'אט עוברת בדיקת guard שחוסמת אזכור תוכן רגיש.`},
  {key:'coop_user', desc:'שיתוף פעולה אישי — הגעה ויישום', scope:'user', name:'שיתוף פעולה אישי', internal:false, vis:'client', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "שיתוף פעולה אישי" של היוזר. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם עלה מידע על שיתוף הפעולה של היוזר עצמו: הגעה לפגישות, מענה להודעות, יישום מה שסוכם, שימוש במערכת ובצ'אט.
אם אין — החזר "אין עדכון". אם יש: עדכן — מה הוא מיישם, איפה נדרש חיזוק, ואיך הכי אפקטיבי להניע אותו. עד 5 שורות עם (תאריך · מקור).`},
  {key:'empfb', desc:'משוב ומחמאות על העובד', scope:'user', name:'משוב ומחמאות לעובד', internal:false, vis:'client', appliesTo:'employee', lastRun:'02.07',
   prompt:`אתה מתחזק את קטגוריית "משוב ומחמאות לעובד" — מופעלת רק על יוזרים המוגדרים כעובדים (לא בעלים/אדמין). קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם באינטראקציה עלה משוב על העובד: מחמאות מהמנהל או מאיתנו, תלונות, שיפור או ירידה בתפקוד מול המערכת.
אם אין — החזר "אין עדכון". אם יש: עדכן — תמונת משוב עדכנית עם (תאריך · מקור), עד 5 שורות. גלוי לאדמין הלקוח — נסח מקצועי ומאוזן, בלי ציטוטים רגישים.`},
  {key:'relation', desc:'מקבלי החלטות, אמון ורגישויות', scope:'user', name:'הקשר אישי ואמון', internal:false, vis:'hk', lastRun:'25.06',
   prompt:`אתה מתחזק את קטגוריית "הקשר אישי ואמון" של היוזר. קלט: סיכום האינטראקציה והמסמך הנוכחי.
בדוק אם נלמד משהו על: מי מקבל ההחלטות ומי משפיע, רמת האמון בנו, רגישויות שכדאי להיזהר בהן, ופרטים אישיים שהלקוח שיתף מרצונו ועוזרים לקשר (משפחה, תחביבים, אירועים).
אם אין — החזר "אין עדכון". אם יש: עדכן — עד 7 שורות. כלול רק מה שהלקוח שיתף בעצמו; אל תסיק ואל תוסיף מידע חיצוני.`},
];

/* ---- הזיכרון שנצבר — דמו מלא לאנרגי אינטרנשיונל ----
   המסמך הוא **רשימת שורות**, לא פסקה (docs/MEMORY_SPEC.md §2.4).
   שורה = {id, t, src, d, st} · st: live | solved | dropped | stale
   התאריך והמקור הם שדות — הם לא כתובים בתוך הטקסט. ---- */
const L=(id,t,src,d,ex)=>Object.assign({id,t,src,d,st:'live'},ex||{});
const MEM_DATA={
  0:{
    cashpos:{lines:[
      L('c1','העו״ש בלאומי חי על המסגרת — חריגה חוזרת בכל חודש, לא אירוע חד-פעמי','פגישה חודשית','02.07'),
      L('c2','מנהל שני חשבונות ולא מעביר ביניהם — הפתרון קיים ולא מבוצע','פגישה חודשית','02.07'),
      L('c3','מסרב להגדיל את המסגרת — רואה בהגדלה הודאה בכישלון','שיחת טלפון','25.06'),
      L('c4','קניות המלאי גדלו ולוחצות על התזרים, בלי גידול מקביל במחזור','פגישה חודשית','02.07'),
      L('c5','פער תזמון קבוע: הגבייה בשבוע הראשון מול תשלומי ספקים ב-10 לחודש','פגישה חודשית','02.07'),
      ],
      updated:'02.07', src:'פגישה חודשית'},

    bizprofile:{lines:[
      L('b1','יבוא ושיווק מוצרי אנרגיה ודלקים — בז״ן ופז כספקים מרכזיים','פגישה חודשית','15.06'),
      L('b2','לקוחות עיקריים: רימון מוצרי אנרגיה, חברת אוטובוסים ירושלים — כ-70% מהמחזור','פגישה חודשית','15.06'),
      L('b3','כ-25 עובדים · מטה בחיפה ומחסן לוגיסטי','פגישה חודשית','15.06'),
      L('b4','עונתיות: שיא בחורף','פגישה חודשית','15.06'),
      L('b5','שני חשבונות בנק פעילים (לאומי 604, פועלים 112) + סליקה בקארדקום','תפעול שוטף','15.06')],
      updated:'15.06', src:'פגישה חודשית'},

    pains:{lines:[
      L('p1','תלות בשני לקוחות גדולים — 70% מהמחזור, מדיר שינה','פגישה חודשית','02.07'),
      L('p2','פער תזמון קבוע: ספקים ב-10 לחודש מול גבייה בתחילת החודש','שיחת טלפון','25.06'),
      L('p3','עומס על מנהלת הכספים — אין גיבוי בתפקיד','פגישה חודשית','15.06'),
      L('p4','ריבית גבוהה על המסגרת','פגישה חודשית','15.06',{st:'solved',on:'25.06'})],
      updated:'02.07', src:'פגישה חודשית'},

    goals:{lines:[
      L('g1','פתיחת מסגרת נוספת 100 א׳ ₪ בפועלים — באחריותנו, יעד 15.7, בתהליך','פגישה חודשית','02.07'),
      L('g2','הקטנת תלות בלקוחות גדולים — בוחן שני מפיצים חדשים, עדכון בפגישה הבאה','פגישה חודשית','02.07'),
      L('g3','יעד ליטרים חודשי 120,000 — הוגדר במדדים, במעקב','פגישה חודשית','15.06')],
      updated:'02.07', src:'פגישה חודשית'},

    events:{lines:[
      L('e1','זכייה במכרז אספקה לחברת האוטובוסים ירושלים — צפי תוספת 1.5 מ׳ ₪ במחזור שנתי, מאוגוסט','שיחת טלפון','20.06'),
      L('e2','עזיבת סמנכ״ל התפעול — צחי לוקח את התחום זמנית, עומס ניהולי','פגישה חודשית','10.06')],
      updated:'20.06', src:'שיחת טלפון'},

    coop_co:{lines:[
      L('k1','טבלאות ההזנה מתעדכנות בזמן כל שבוע','תפעול שוטף','02.07'),
      L('k2','מסמכים מגיעים תוך יום-יומיים מבקשה','תפעול שוטף','02.07'),
      L('k3','הרשאת חשבון הסליקה נתקעה אצל הבנק שבועיים — דורש דחיפה','קבוצת הוואטסאפ','25.06')],
      updated:'02.07', src:'תפעול שוטף'},

    commstyle:{lines:[
      L('s1','פתח תמיד במספרים — צחי מאבד סבלנות מהקדמות','פגישה חודשית','02.07'),
      L('s2','תשובות קצרות, בלי ז׳רגון פיננסי','פגישה חודשית','02.07'),
      L('s3','מעדיף וואטסאפ על טלפון; זמין לשיחות רק אחרי 16:00','פגישה חודשית','02.07'),
      L('s4','כשמציגים בעיה — להציג ישר גם פתרון מוצע','פגישה חודשית','02.07'),
      L('s5','אוהב גרפים פשוטים, לא טבלאות','פגישה חודשית','02.07')],
      updated:'02.07', src:'פגישה חודשית'},

    csat:{lines:[
      L('t1','מרוצה מאוד מהליווי של טל — ציין יזום פעמיים','פגישה חודשית','02.07'),
      L('t2','על ה-AI: משתמש בצ׳אט כמעט יומיום ו״מופתע כמה זה מדויק״','פגישה חודשית','02.07'),
      L('t3','התלונן שקיבל תשובה כללית מדי על שאלת מע״מ','קבוצת הוואטסאפ','25.06'),
      L('t4','פחות מרוצה מזמן ההמתנה לדוח החודשי','פגישה חודשית','02.07'),
      L('t5','מגמה: יציב-חיובי · סיכון נטישה: נמוך','פגישה חודשית','02.07'),
      ],
      updated:'02.07', src:'פגישה חודשית'},

    coop_user:{lines:[
      L('u1','מגיע לכל הפגישות החודשיות, בזמן','פגישה חודשית','02.07'),
      L('u2','מיישם המלצות תזרים כמעט מיד','פגישה חודשית','02.07'),
      L('u3','המלצות ארגוניות (גיוס גיבוי לכספים) נדחות שוב ושוב','פגישה חודשית','02.07'),
      L('u4','הכי אפקטיבי: לסכם לו משימה אחת ממוקדת בוואטסאפ אחרי כל פגישה','פגישה חודשית','02.07')],
      updated:'02.07', src:'פגישה חודשית'},

    /* קטגוריה שהמסמך שלה לא נשלח ללקוח — נשלחת במקומו ההנחיה הזאת, בלי אף עובדה */
    pains_chat:'אל תציע הרחבת פעילות מול לקוח קיים · כשעולה גבייה, הצע פתרון תזמון',
    csat_chat:'אל תתנצל מראש · תשובות ממוקדות, בלי הכללות',
    mood_chat:'ענה ברוגע ובקצרה · הצג תמיד פתרון לצד בעיה',
    relation_chat:'אל תיזום נושאי מימון בלי הקשר · אל תזכיר עלות שירות',

    mood:{lines:[
      L('m1','נשמע לחוץ סביב החריגה בלאומי — חזר לנושא שלוש פעמים','פגישה חודשית','02.07'),
      L('m2','ביטחון גבוה בעסק עצמו — ״המכרז ישנה הכל״','פגישה חודשית','02.07'),
      L('m3','עייפות ניכרת מאז שלקח את תחום התפעול','פגישה חודשית','10.06'),
      L('m4','נרגע כשמציגים לו תוכנית מסודרת','פגישה חודשית','02.07')],
      updated:'02.07', src:'פגישה חודשית'},

    relation:{lines:[
      L('r1','צחי מקבל ההחלטות היחיד','שיחת טלפון','25.06'),
      L('r2','רו״ח חיצוני (משרד ברק) משפיע על החלטות מימון — לתאם איתו לפני הצעות גדולות','שיחת טלפון','25.06'),
      L('r3','אמון גבוה בנו אחרי מיחזור המסגרת','שיחת טלפון','25.06'),
      L('r4','רגישות: לא לדבר על עלות השירות בנוכחות השותף','שיחת טלפון','25.06'),
      L('r5','אישי: בת בכורה התחתנה ביוני; חובב ריצות בוקר','שיחת טלפון','25.06')],
      updated:'25.06', src:'שיחת טלפון'},
  },
};

/* ---- המספרים שלאקי מקבל — לצד הזיכרון הטקסטואלי ---- */
const MEM_NUMS={
  0:{
    kpi:[
      {k:'יתרה כוללת', v:'1,029,208 ₪'},
      {k:'מסגרת אשראי · ניצול', v:'150,000 ₪ · 107%', bad:1},
      {k:'יתרה צפויה · סוף החודש', v:'-495,490 ₪', bad:1},
      {k:'חריגה צפויה בתזרים', v:'בעוד 9 ימים', bad:1},
      {k:'עמידה בתקציב הוצאות', v:'82%'},
      {k:'עמידה ביעד הכנסות', v:'95%'},
    ],
    rev:{lbl:'הכנסות · 6 חודשים אחורה (א׳ ₪)', months:['פבר','מרץ','אפר','מאי','יוני','יולי'], vals:[242,268,255,300,307,301]},
    cats:{lbl:'קטגוריות מרכזיות · יוני (סיכומים)', rows:[['הכנסות ממכירות','307,039 ₪'],['קניות מלאי','-181,000 ₪'],['שכר עבודה','-99,000 ₪'],['הוצאות תפעול','-17,800 ₪']]},
    sup:{lbl:'ספקים גדולים · חלק מהרכש', rows:[['בז״ן — דלקים','45%'],['פז חברת נפט','28%'],['ספקי משנה','12%']]},
  },
};

/* ---- המשתמשים של כל חברה — זיכרון יוזר נפרד לכל אחד ---- */
const MEM_USERS={
  0:[{n:'צחי עובד', role:'בעלים', type:'admin'},{n:'רות אלמוג', role:'מנהלת כספים', type:'employee'}],
};
const MEM_UDATA={
  0:[
    null,   // יוזר 0 — הנתונים עברו מ-MEM_DATA (מוזרקים למטה)
    { commstyle:{lines:[
        L('rs1','מעדיפה מיילים מסודרים על וואטסאפ','שיחת טלפון','28.06'),
        L('rs2','נכנסת לפרטים — אפשר ומומלץ לשלוח טבלאות מפורטות','שיחת טלפון','28.06'),
        L('rs3','זמינה בבקרים בלבד','שיחת טלפון','28.06')], updated:'28.06', src:'שיחת טלפון'},
      coop_user:{lines:[
        L('ru1','מעבירה את דפי הבנק והחשבוניות בזמן, כל שבוע','תפעול שוטף','02.07'),
        L('ru2','עונה מהר בצ׳אט','תפעול שוטף','02.07'),
        L('ru3','היא הכתובת האפקטיבית לכל בקשת חומר — לא צחי','תפעול שוטף','02.07')], updated:'02.07', src:'תפעול שוטף'},
      empfb:{lines:[
        L('re1','צחי ציין בפגישה שהיא ״מנהלת את הכספים ביד רמה״','פגישה חודשית','02.07'),
        L('re2','הדיוק והזמינות שלה מקצרים לנו את התפעול — הועבר לה משוב חיובי בצ׳אט','תפעול שוטף','30.06'),
        L('re3','אין תלונות פתוחות','פגישה חודשית','02.07')], updated:'02.07', src:'פגישה חודשית'} },
  ],
};
/* ---- דלתאות: מה השתנה בזיכרון בריצות האחרונות (מוצג בדשבורד היועץ) ---- */
const MEM_UPDATES=[
  {ci:0, cat:'pains',   catName:'כאבי לקוח',    line:'נוסף כאב: תלות בלקוח מרכזי — רימון מוצרי אנרגיה כ-70% מהמחזור', sev:'high', src:'פגישה מוקלטת 09:00', when:'היום 10:02', pend:false},
  {ci:0, cat:'csat',    catName:'שביעות רצון',   line:'ירידה: תסכול מקצב התגובה בוואטסאפ — הנחיות הצ׳אט עודכנו בהתאם', sev:'high', src:'פגישה מוקלטת 09:00', when:'היום 10:03', pend:false},
  {ci:0, cat:'cashpos', catName:'מצב תזרימי',    line:'צפי החריגה עודכן ל-9 ימים (במקום 12) אחרי דחיית תשלום ספק',      sev:'info', src:'פגישה מוקלטת 09:00', when:'היום 10:02', pend:false},
  {ci:2, cat:'goals',   catName:'יעדים והסכמות', line:'יעד קניות מלאי סומן בסיכון — 114% מהתקציב החודשי',               sev:'info', src:'תפעול שוטף',        when:'אתמול 16:40', pend:false},
  {ci:1, cat:'coop_co', catName:'שיתוף פעולה',   line:'חומר אחרון לתזרים: 30.6 · דפי בנק התקבלו בוואטסאפ',              sev:'info', src:'שיחת טלפון מוקלטת · SIM', when:'אתמול 11:15', pend:false},
];
let MEM_CUR=0, MEM_USER=0, MEM_EDIT=null, MEM_HIST=new Set(); let MEM_HOST=null;
const _memBodyEl=()=>MEM_HOST?MEM_HOST.querySelector('.mem-body'):document.getElementById('memBody');
const _memTitleEl=()=>MEM_HOST?MEM_HOST.querySelector('.mem-title'):document.getElementById('memTitle');
function openMemCard(i){
  MEM_HOST=null; MEM_CUR=i; MEM_USER=0; MEM_EDIT=null; MEM_HIST=new Set();
  renderMemCard();
  document.getElementById('memOv').classList.add('show');
}
function closeMemCard(){document.getElementById('memOv').classList.remove('show');}
function memTgHist(k){ MEM_HIST.has(k)?MEM_HIST.delete(k):MEM_HIST.add(k); renderMemCard(); }
function memDel(k){
  const cat=MEM_CATS.find(c=>c.key===k);
  hkConfirm('מחיקת תוכן הקטגוריה','התוכן שנצבר ב"'+cat.name+'" יימחק. הקטגוריה עצמה תישאר ותתמלא מחדש באינטראקציות הבאות.','מחיקה',()=>{
    if(MEM_DATA[MEM_CUR]) delete MEM_DATA[MEM_CUR][k];
    renderMemCard(); toast('התוכן נמחק — הקטגוריה תתמלא מחדש');
  });
}
function memEntry(cat){
  if(cat.scope==='company') return (MEM_DATA[MEM_CUR]||{})[cat.key];
  const ud=(MEM_UDATA[MEM_CUR]||[])[MEM_USER];
  if(ud) return ud[cat.key];
  return MEM_USER===0?(MEM_DATA[MEM_CUR]||{})[cat.key]:null;   // יוזר ראשון — הדאטה הקיימת
}
function memCatBlock(cat){
  const d=memEntry(cat);
  const _lv=d&&d.lines?d.lines.filter(x=>x.st!=='dropped'):[];
  const body=_lv.length?`<div class="mem-txt">${_lv.map(x=>x.t).join(' · ')}</div>`:'<div class="mem-empty">טרם נצבר זיכרון — יתמלא מהאינטראקציה הבאה</div>';
  const hist=d&&d.hist&&d.hist.length&&MEM_HIST.has(cat.key)
    ?`<div class="mem-hist">${d.hist.map(h=>`<div class="mem-hist-row">${h}</div>`).join('')}</div>`:'';
  return `<div class="mem-cat ${cat.internal?'internal':''}">
    <div class="mem-cat-h">
      <b>${cat.name}</b>

      ${cat.internal?'<span class="mem-bg">לצ׳אט: הנחיות מזוקקות בלבד — המסמך לא נשלח</span>':''}
      <span class="mem-tools">
        ${d&&d.hist&&d.hist.length?`<button class="mem-ic" title="היסטוריית עדכונים" onclick="memTgHist('${cat.key}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 3"/></svg></button>`:''}
        <button class="mem-ic del" title="מחיקת התוכן" onclick="memDel('${cat.key}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>
      </span>
    </div>
    ${body}${hist}
    ${cat.internal&&d?`<div class="mem-chatline">לצ׳אט נשלח רק: ״${(MEM_DATA[MEM_CUR]||{})[cat.key+'_chat']||'ענה ברוגע · התאם את הטון'}״</div>`:''}
    ${d?`<div class="mem-src">עודכן ${d.updated} · מתוך ${d.src}</div>`:''}
  </div>`;
}
function renderMemCard(){
  const c=CLIENTS[MEM_CUR];
  (_memTitleEl()||{}).innerHTML=`<span class="ap-av" style="width:36px;height:36px;font-size:15px">${c.name.charAt(0)}</span>
    <div><b>${c.name}</b><i>כרטיס לקוח · זיכרון ומספרים · ${c.mgr}</i></div>`;
  const N=MEM_NUMS[MEM_CUR];
  let nums='<div class="mem-empty">אין עדיין נתונים מספריים</div>';
  if(N){
    const mx=Math.max(...N.rev.vals);
    nums=`<div class="mem-kpis">${N.kpi.map(n=>`<div class="mem-num ${n.bad?'bad':''}"><span>${n.k}</span><b>${n.v}</b></div>`).join('')}</div>
    <div class="mem-numgrid">
      <div class="mem-blk"><div class="mem-blk-h">${N.rev.lbl}</div>
        <div class="mem-revbars">${N.rev.vals.map((v,ix)=>`<div class="mem-rb"><i style="height:${Math.round(v/mx*46)}px"></i><b>${v}</b><span>${N.rev.months[ix]}</span></div>`).join('')}</div></div>
      <div class="mem-blk"><div class="mem-blk-h">${N.cats.lbl}</div>
        ${N.cats.rows.map(r=>`<div class="mem-cr"><span>${r[0]}</span><b class="${r[1].startsWith('-')?'neg':''}">${r[1]}</b></div>`).join('')}</div>
      <div class="mem-blk"><div class="mem-blk-h">${N.sup.lbl}</div>
        ${N.sup.rows.map(r=>`<div class="mem-cr"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>
    </div>`;
  }
  if(MEM_HOST){
    const nDocs=MEM_CATS.filter(x=>x.scope==='company').length;
    const nDist=MEM_CATS.filter(x=>x.internal).length;
    nums=`<div class="mem-feed"><b>מה נשלח לצ'אט:</b> ${nDocs} מסמכי חברה · מסמכי היוזר הפונה · ${nDist} קטגוריות פנימיות כהנחיות מזוקקות בלבד · snapshot מספרים חי (יתרה, מסגרת אשראי וניצול, הכנסות, עמידה ביעדים) — <i>המספרים נשלפים מהמערכת ברגע השליחה ולא נשמרים בזיכרון</i></div>`;
  }
  const uType=((MEM_USERS[MEM_CUR]||[])[MEM_USER]||{}).type||'admin';
  const comp=MEM_CATS.filter(x=>x.scope==='company').map(memCatBlock).join('');
  const uObj=(MEM_USERS[MEM_CUR]||[])[MEM_USER]||{};
  const user=MEM_CATS.filter(x=>x.scope==='user')
    .filter(x=>!x.appliesTo||x.appliesTo==='all'||x.appliesTo===uType)   // תחולה לפי סוג היוזר
    .filter(x=>!(uObj.off||[]).includes(x.key))                          // קטגוריות שכובו ליוזר הזה
    .map(memCatBlock).join('');
  _memBodyEl().innerHTML=`${nums}`;
    const users=MEM_USERS[MEM_CUR]||[{n:'המשתמש הראשי',role:''}];
  _memBodyEl().innerHTML+=`
    <div class="mem-cols">
      <div><div class="mem-sec-h">החברה <span>משותף לכל היוזרים ולצ׳אט</span></div>${comp}</div>
      <div>
        <div class="mem-sec-h">משתמשי החברה — ${users.length} <span>כל יוזר רואה בצ׳אט רק את עצמו</span></div>
        <div class="mem-users">${users.map((u,ix)=>`<span class="mem-uchip ${ix===MEM_USER?'on':''}" onclick="MEM_USER=${ix};MEM_EDIT=null;renderMemCard()">${u.n}<i>${u.role} · ${u.type==='admin'?'אדמין':'עובד'}</i>
          <button class="mem-uset" title="הגדרות היוזר" onclick="event.stopPropagation();openUserSet(${ix})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button></span>`).join('')}</div>
        ${user}
      </div>
    </div>`;
}

/* ---- הגדרות יוזר: תפקיד, סוג, ואילו קטגוריות פעילות עליו ---- */
let US_IX=0;
/* פתיחה ממסך זיכרון החברה — MEM_USERS ממופתח לפי החברה הנוכחית */
function comUserSet(ix){ MEM_CUR=CUR; MEM_USER=COM_USER; openUserSet(ix); }
function openUserSet(ix){
  US_IX=ix; renderUserSet();
  document.getElementById('userSetOv').classList.add('show');
}
function closeUserSet(){
  document.getElementById('userSetOv').classList.remove('show');
  const vm=document.getElementById('viewMem');
  if(vm&&vm.style.display!=='none'&&vm.innerHTML) renderCoMem(); else renderMemCard();
}
function renderUserSet(){
  const u=(MEM_USERS[MEM_CUR]||[])[US_IX]; if(!u) return;
  u.off=u.off||[];
  const cats=MEM_CATS.filter(c=>c.scope==='user').filter(c=>!c.appliesTo||c.appliesTo==='all'||c.appliesTo===u.type);
  document.getElementById('userSetBody').innerHTML=`
    <div class="us-row"><label>שם</label><input class="mx2-inp" value="${u.n}" oninput="MEM_USERS[MEM_CUR][${US_IX}].n=this.value" style="flex:1"></div>
    <div class="us-row"><label>תפקיד</label><input class="mx2-inp" value="${u.role}" oninput="MEM_USERS[MEM_CUR][${US_IX}].role=this.value" style="flex:1"></div>
    <div class="us-row"><label>סוג</label>
      <span class="cr-modes">
        <span class="mtk-chip ${u.type==='admin'?'on':''}" onclick="MEM_USERS[MEM_CUR][${US_IX}].type='admin';renderUserSet()">אדמין</span>
        <span class="mtk-chip ${u.type==='employee'?'on':''}" onclick="MEM_USERS[MEM_CUR][${US_IX}].type='employee';renderUserSet()">עובד</span>
      </span>
      <i class="us-hint">הסוג קובע אילו קטגוריות חלות עליו ומה יראה כשאדמין</i></div>
    <div class="us-cats-h">קטגוריות זיכרון פעילות על היוזר</div>
    ${cats.map(c=>`<label class="us-cat">
      <input type="checkbox" ${u.off.includes(c.key)?'':'checked'} onchange="usTgCat('${c.key}',this.checked)">
      <b>${c.name}</b><span class="us-roles">${roleChips(rolesOf(c))}</span>
    </label>`).join('')}`;
}
function usTgCat(k,on){
  const u=MEM_USERS[MEM_CUR][US_IX];
  u.off=u.off||[];
  if(on) u.off=u.off.filter(x=>x!==k); else if(!u.off.includes(k)) u.off.push(k);
}
/* ---- ניהול קטגוריות (אדמין) ---- */
let MEMADM_SEL=null;
/* מסך ניהול הקטגוריות — נטען לתוך איזור הניהול (לא פופאפ) */
function renderMemAdminScreen(el){
  MEMADM_SEL=null;
  el.innerHTML=`<div class="mem-screen">
    <div class="ma-head-row">
      <div><div class="mem-scr-title">זיכרון לקוח — קטגוריות ופרומפטים</div>
      <div class="mem-scr-sub"><b>הגדרה מערכתית — חלה על כל הלקוחות.</b> כל קטגוריה מתוחזקת ע״י flow אחד שמקבל את הפרומפט שלה. לחיצה על קטגוריה — עריכת התפקידים והפרומפט.</div></div>
      <button class="mx2-btn primary" onclick="openMemNew()">+ קטגוריה חדשה</button>
    </div>
    <div id="memAdmBody"></div>
  </div>`;
  renderMemAdmin();
}
function openMemAdmin(){ /* תאימות לאחור — אם נקרא, מפנה למסך הניהול */ if(typeof openAdmin==='function'){openAdmin();if(typeof admGo==='function')admGo('memory');} }
function renderMemAdmin(){
  const row=(c,i)=>`
    <div class="ma-row2 ${c.scope}col ${MEMADM_SEL===i?'on':''}" onclick="MEMADM_SEL=${MEMADM_SEL===i?null:i};renderMemAdmin()">
      <span class="ma-cv ${MEMADM_SEL===i?'open':''}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m6 9 6 6 6-6"/></svg></span>
      <div class="ma-nm2"><b>${c.name}</b><i>${c.desc||''}</i></div>
      ${c.scope==='user'?`<span class="ma-roles">${roleChips(rolesOf(c))}${c.appliesTo==='employee'?' <span class="ma-app">עובדים בלבד</span>':''}</span>`:''}
      <span class="ma-last"><i class="ap-dot ${c.lastRun==='02.07'?'ok':c.lastRun==='טרם'?'no':'mid'}"></i>${c.lastRun==='טרם'?'טרם הופעלה':'עודכנה '+c.lastRun}</span>
      <button class="ap-del" title="הסרת הקטגוריה" onclick="event.stopPropagation();memAdmDel(${i})">✕</button>
    </div>
    ${MEMADM_SEL===i?`<div class="ma-prompt">
      <div class="ma-plbl">תיאור — המשפט שמופיע מתחת לשם הקטגוריה</div>
      <input class="mx2-inp" id="maDesc_${i}" value="${(c.desc||'').replace(/"/g,'&quot;')}" placeholder="למשל: יתרות, מסגרות אשראי וחריגות" style="width:100%;box-sizing:border-box;margin-bottom:12px" oninput="MEM_CATS[${i}].desc=this.value">
      ${c.scope==='user'?`<div class="ma-plbl">מופעלת ומוצגת לתפקידים</div>
      <div class="rl-pick">${MEM_ROLES.map(r=>`<span class="rl-opt ${rolesOf(c).includes(r.k)?'on':''} ${r.hk?'hk':'cl'}" onclick="maRoleTg(${i},'${r.k}')">${r.label}</span>`).join('')}</div>`:'<div class="ma-co-hint">קטגוריית חברה — גלויה לכל מי שיש לו גישה לחברה. אין הגבלת תפקיד ברמת החברה.</div>'}
      <div class="ma-plbl" style="margin-top:12px">הפרומפט — נשלח ל-flow אחרי כל אינטראקציה יחד עם המסמך הנוכחי</div>
      <textarea class="mem-ta" id="maTa_${i}" rows="8">${c.prompt}</textarea>
      <div class="mem-editfoot"><button class="ot-btn done" onclick="MEM_CATS[${i}].prompt=document.getElementById('maTa_${i}').value;MEMADM_SEL=null;renderMemAdmin();toast('הקטגוריה עודכנה')">שמירה</button></div>
    </div>`:''}`;
  const grp=(title,scope)=>{
    const items=MEM_CATS.map((c,i)=>({c,i})).filter(x=>x.c.scope===scope);
    return `<div class="ma-grp">
      <div class="ma-grp-h">${title}<span>${items.length} קטגוריות</span></div>
      ${scope==='user'
        ?'<div class="ma-row2 usercol head"><span></span><b>קטגוריה</b><span>תפקידים</span><span>עדכון אחרון</span><span></span></div>'
        :'<div class="ma-row2 companycol head"><span></span><b>קטגוריה</b><span>עדכון אחרון</span><span></span></div>'}
      ${items.map(x=>row(x.c,x.i)).join('')}
    </div>`;
  };
  const rows=grp('קטגוריות החברה','company')+grp('קטגוריות היוזר','user');
  document.getElementById('memAdmBody').innerHTML=rows;
}
/* טופס קטגוריה חדשה — חלון נפרד, נפתח מהכפתור למעלה */
function openMemNew(){
  document.getElementById('memNewBody').innerHTML=`
    <input class="mx2-inp" id="maNewName" placeholder="שם הקטגוריה" style="width:100%;box-sizing:border-box;margin-bottom:12px">
    <div class="ma-opts">
      <div class="ma-opt">
        <label>סוג הקטגוריה</label>
        <span class="cr-modes" id="maNewScope"><span class="mtk-chip on" data-s="company" onclick="maNewScope2(this)">חברה</span><span class="mtk-chip" data-s="user" onclick="maNewScope2(this)">יוזר</span></span>
      </div>
      <div class="ma-opt" id="maNewAppWrap" style="display:none">
        <label>מופעלת על</label>
        <span class="cr-modes" id="maNewApp"><span class="mtk-chip on" data-a="all" onclick="maNewVisSet(this)">כל היוזרים</span><span class="mtk-chip" data-a="employee" onclick="maNewVisSet(this)">עובדים בלבד</span></span>
      </div>
      <div class="ma-opt col" id="maNewRolesWrap" style="display:none">
        <label>מופעלת לתפקידים</label>
        <div class="rl-pick" id="maNewRoles">${MEM_ROLES.map(r=>`<span class="rl-opt ${r.hk?'on hk':'cl'}" data-r="${r.k}" onclick="this.classList.toggle('on')">${r.label}</span>`).join('')}</div>
      </div>
    </div>
    <div class="ma-plbl">הפרומפט — מה לבדוק באינטראקציה, מתי לעדכן, כללי כתיבה וגבולות</div>
    <textarea class="mem-ta" id="maNewPrompt" rows="5" placeholder="אתה מתחזק את קטגוריית… בדוק אם… אם אין — החזר ״אין עדכון״. אם יש — עדכן…"></textarea>`;
  document.getElementById('memNewOv').classList.add('show');
  setTimeout(()=>document.getElementById('maNewName').focus(),60);
}
function closeMemNew(){document.getElementById('memNewOv').classList.remove('show');}
function maNewScope2(el){
  el.parentElement.querySelectorAll('.mtk-chip').forEach(c=>c.classList.remove('on')); el.classList.add('on');
  // "מופעלת על" רלוונטי רק לקטגוריות יוזר
  const isU=el.dataset.s==='user';
  document.getElementById('maNewAppWrap').style.display=isU?'':'none';
  const rw=document.getElementById('maNewRolesWrap'); if(rw)rw.style.display=isU?'':'none';
}
function maNewVisSet(el){ el.parentElement.querySelectorAll('.mtk-chip').forEach(c=>c.classList.remove('on')); el.classList.add('on'); }
function maRoleTg(i,k){
  const c=MEM_CATS[i]; c.roles=rolesOf(c).slice();
  c.roles.includes(k)?c.roles=c.roles.filter(x=>x!==k):c.roles.push(k);
  if(!c.roles.length) c.roles=['super'];
  renderMemAdmin();
}
function memAdmDel(i){
  hkConfirm('הסרת קטגוריה','"'+MEM_CATS[i].name+'" תוסר מכל כרטיסי הלקוחות. התוכן שנצבר יישמר בארכיון.','הסרה',()=>{
    MEM_CATS.splice(i,1); MEMADM_SEL=null; renderMemAdmin(); toast('הקטגוריה הוסרה');
  });
}
function memAdmAdd(){
  const name=(document.getElementById('maNewName').value||'').trim();
  const prompt=(document.getElementById('maNewPrompt').value||'').trim();
  if(!name){toast('צריך שם לקטגוריה');return;}
  if(!prompt){toast('צריך פרומפט — בלעדיו ה-flow לא יידע מה לעדכן');return;}
  const scope=document.querySelector('#maNewScope .mtk-chip.on').dataset.s;
  const vis=document.querySelector('#maNewVis .mtk-chip.on').dataset.v;
  const appliesTo=document.querySelector('#maNewApp .mtk-chip.on').dataset.a;
  MEM_CATS.push({key:'c'+Date.now()%100000, scope, name, internal:vis==='hk', vis, appliesTo, lastRun:'טרם', prompt});
  renderMemAdmin(); toast('"'+name+'" נוספה — תתחיל להתמלא מהאינטראקציה הבאה');
}

/* =====================================================================
   זיכרון החברה — המסך, לא ההגדרות.  docs/MEMORY_SPEC.md §2.4 · §5
   המסמך הוא רשימת שורות; השורה היא ישות עם מקור, תאריך וסטטוס.
   במנוחה זה נקרא כפסקאות — החותמת נדפסת רק כשהיא נושאת דלתא מול הכרטיס,
   והפעולות (✎ · ✕ · ↺) יושבות ברייל אחד שגולש לשורה שמתחת לעכבר.
   ===================================================================== */
let COM_USER=0, COM_Q='', COM_OFF=new Set(), COM_ME='אילון שחר', COM_TODAY='12.07';
let COM_UNDO=null;
const comEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const comUid=()=>'x'+(Math.abs(Date.now()%100000)+Math.floor(performance.now()%997)).toString(36);

function comBag(scope){
  if(scope==='company'||COM_USER===0) return (MEM_DATA[CUR]=MEM_DATA[CUR]||{});
  MEM_UDATA[CUR]=MEM_UDATA[CUR]||[];
  return (MEM_UDATA[CUR][COM_USER]=MEM_UDATA[CUR][COM_USER]||{});
}
const comDoc=(scope,key)=>comBag(scope)[key]||null;
function comChat(scope,key){ return comBag(scope)[key+'_chat']||''; }

/* ---- החותמת: רק מה ששונה מחותמת הכרטיס ---- */
/* לכל שורה מקור ותאריך משלה — הם לא מאפיין של הכרטיס */
/* המקור כתג צבעוני לפי ערוץ — אותם צבעים של מסך התקשורת */
function comSrcChip(src){
  if(!src) return '';
  const k=/וואטסאפ/.test(src)?'wa':/שיחת טלפון|שיחה/.test(src)?'call':/פגישה/.test(src)?'meet':/תפעול/.test(src)?'ops':'oth';
  return `<span class="com-sc ${k}">${comEsc(src)}</span>`;
}
function comStamp(l){
  const base=(l.d?`<span class="d">${comEsc(l.d)}</span>`:'')+comSrcChip(l.src);
  if(l.st==='dropped') return {cls:'off', t:'הוסר · '+comEsc(l.by||COM_ME)+' · '+comEsc(l.on||'')};
  if(l.st==='solved')  return {cls:'ok',  t:'נפתר '+comEsc(l.on||l.d||'')};
  if(l.st==='stale')   return {cls:'',    t:base+'<span class="d">לא הוזכר מאז</span>'};
  return {cls:'', t:base};
}

/* הפעולה היחידה במסך בשלב הזה: מחיקת שורה. עריכה והוספה ממתינות להכרעה. */
function comDel(btn){
  const card=btn.closest('.com-c'), p=btn.closest('.com-p');
  const doc=comDoc(card.dataset.scope,card.dataset.key); if(!doc) return;
  const i=(doc.lines||[]).findIndex(x=>x.id===p.dataset.id); if(i<0) return;
  const gone=doc.lines[i];
  hkConfirm('מחיקת שורה מהזיכרון',
    '״'+gone.t+'״\n\nהשורה תצא מההקשר שנשלח ל-AI, ולא תשפיע יותר על אף תשובה — שלכם או של הלקוח.',
    'מחיקה',()=>{
      doc.lines.splice(i,1); renderCoMem();
      toastUndo('השורה נמחקה מהזיכרון',()=>{ doc.lines.splice(i,0,gone); renderCoMem(); });
    });
}
function gdOpen(){ document.getElementById('gdOv').classList.add('show'); }
function gdClose(){ document.getElementById('gdOv').classList.remove('show'); }
function comUser(i){ COM_USER=i; renderCoMem(); }
function comSearch(v){ COM_Q=v.trim(); renderCoMem(true); }

function comCard(c){
  const doc=comDoc(c.scope,c.key), k=c.scope+'|'+c.key+'|'+COM_USER;
  /* יש הנחיה ⇔ המסמך לא נשלח ללקוח. אין הנחיה — המסמך כולו נכנס להקשר. */
  const gd=comChat(c.scope,c.key);
  /* שורה שהוסרה לא מוצגת — אין במסך פעולת מחיקה, אז אין מה לדווח עליו */
  const all=((doc&&doc.lines)||[]).filter(l=>l.st!=='dropped');
  const q=COM_Q, mark=s=>q?comEsc(s).split(comEsc(q)).join('<mark>'+comEsc(q)+'</mark>'):comEsc(s);
  const hit=!q||(c.name.indexOf(q)>-1)||all.some(l=>l.t.indexOf(q)>-1);
  if(!hit) return '';
  const rows=all.map(l=>{
    const s=comStamp(l);
    return `<p class="com-p ${l.st==='solved'?'solved':''} ${l.origin==='advisor'?'adv':''}"
      data-id="${l.id}">${mark(l.t)}<i class="com-st ${s.cls}">${s.t}${
      l.origin==='advisor'?'<span class="d">הוזן ידנית</span>':''}</i>
      <button class="com-x" title="מחיקת השורה מהזיכרון" onclick="comDel(this)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg></button></p>`;}).join('');
  const capN=(c.cap||6), full=all.filter(l=>l.st==='live').length>=capN;
  return `<section class="com-c ${all.length?'':'empty'}" data-scope="${c.scope}" data-key="${c.key}" data-k="${k}">
    <div class="com-h">
      <b>${comEsc(c.name)}${all.length?`<span class="com-n">${all.length}</span>`:''}</b>
      ${gd?`<button class="com-vis gd" onclick="gdOpen()" title="מה זה אומר?"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 3 4 6v6c0 4.4 3.4 7.9 8 9 4.6-1.1 8-4.6 8-9V6l-8-3z"/></svg>מסונן ללקוח</button>`:''}
      ${doc&&doc.hist&&doc.hist.length?`<button class="com-hb ${MEM_HIST.has(k)?'on':''}" onclick="comHistTg('${k}')">היסטוריה ${doc.hist.length}</button>`:''}
    </div>
    <div class="com-body">${rows||'<p class="com-none">טרם נלמד — יתמלא מהאינטראקציה הבאה</p>'}</div>
    ${full?`<div class="com-cap">התקרה מלאה (${capN}) — שורה חדשה תדחוק את החלשה ביותר</div>`:''}
    ${gd?`<div class="com-gd"><span class="gl">הלקוח לא מקבל את השורות שלמעלה — רק את זה</span>
      <div class="gt">${comEsc(gd)}</div></div>`:''}
    ${MEM_HIST.has(k)&&doc&&doc.hist&&doc.hist.length?`<ul class="com-hist">${doc.hist.map(h=>`<li>${comEsc(h)}</li>`).join('')}</ul>`:''}
  </section>`;
}

function renderCoMem(keepFocus){
  const host=document.getElementById('viewMem'); if(!host) return;
  const c=CLIENTS[CUR]||{};
  const users=MEM_USERS[CUR]||[{n:c.name||'בעל העסק',role:'איש קשר',type:'admin'}];
  if(COM_USER>=users.length) COM_USER=0;
  const u=users[COM_USER]||{}, uType=u.type||'admin';
  const co=MEM_CATS.filter(x=>x.scope==='company');
  const us=MEM_CATS.filter(x=>x.scope==='user')
    .filter(x=>!x.appliesTo||x.appliesTo==='all'||x.appliesTo===uType)
    .filter(x=>!(u.off||[]).includes(x.key));         /* קטגוריות שכובו ליוזר הזה */
  const nOff=(u.off||[]).filter(k=>MEM_CATS.some(c=>c.key===k)).length;
  const coH=co.map(comCard).join(''), usH=us.map(comCard).join('');
  const cnt=list=>list.reduce((n,x)=>{const d=comDoc(x.scope,x.key);return n+((d&&d.lines)||[]).filter(l=>l.st!=='dropped').length;},0);
  const coN=cnt(co), usN=cnt(us);
  const nHit=[...co,...us].filter(x=>comCard(x)).length;
  const nLines=COM_Q?[...co,...us].reduce((s,x)=>{const d=comDoc(x.scope,x.key);
    return s+((d&&d.lines)||[]).filter(l=>l.t.indexOf(COM_Q)>-1).length;},0):0;
  /* אדם שמחזיק כמה חברות — האזהרה היחידה שמונעת נזק אמיתי */
  const multi=(u.n==='רימון יצחק')?'רימון מוצרי אנרגיה':'';

  host.innerHTML=`
  <div class="com">
    <div class="com-bar">
      <div class="com-search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input id="comQ" value="${comEsc(COM_Q)}" placeholder="חיפוש בזיכרון" oninput="comSearch(this.value)"></div>
      ${COM_Q?`<span class="com-res"><b>${nLines}</b> שורות ב-${nHit} קטגוריות<button onclick="comSearch('')">ניקוי</button></span>`:''}
    </div>
    ${(coH||usH)?`<div class="com-cols">
      <section class="com-col">
        <h3 class="com-sh co"><span class="dot"></span>העסק<em>${comEsc(c.name||'')}</em><span class="com-tot">${coN} שורות · ${co.length} קטגוריות</span></h3>
        ${coH||'<div class="com-empty sm">אין התאמה בזיכרון החברה</div>'}
      </section>
      <section class="com-col">
        <h3 class="com-sh pr"><span class="dot"></span><div class="com-us">${users.map((x,i)=>`<button class="com-u ${i===COM_USER?'on':''}" onclick="comUser(${i})">${comEsc(x.n)}${x.role?`<small>${comEsc(x.role)}</small>`:''}</button>`).join('')}
          <button class="com-uset" title="הגדרות היוזר — קטגוריות, תפקיד וסוג" onclick="comUserSet(${COM_USER})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>הגדרות</button></div><span class="com-tot">${usN} שורות</span></h3>
        ${nOff?`<p class="com-off-n">${nOff===1?'קטגוריה אחת כבויה':nOff+' קטגוריות כבויות'} אצל ${comEsc(u.n)} — <button onclick="comUserSet(${COM_USER})">להגדרות</button></p>`:''}
        ${multi?`<p class="com-shared">הזיכרון האישי של ${comEsc(u.n)} משותף ל-2 חברות — תיקון כאן משפיע גם על ${comEsc(multi)}.</p>`:''}
        ${usH||'<div class="com-empty sm">אין התאמה בזיכרון האדם</div>'}
      </section>
    </div>`:`<div class="com-empty"><b>אין שורה שמכילה ״${comEsc(COM_Q)}״</b>
      <span>החיפוש רץ על שם הקטגוריה ועל כל שורה בזיכרון.</span>
      <button class="btn" onclick="comSearch('')">הצגת כל הזיכרון</button></div>`}
    <p class="com-note">כל שורה כאן נכנסת להקשר של ה-AI. ריחוף על שורה מציג את המקור והתאריך שלה.</p>
  </div>`;
  if(keepFocus){ const q=document.getElementById('comQ'); if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);} }
}
