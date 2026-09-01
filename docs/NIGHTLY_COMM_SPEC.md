# הג׳וב הלילי של התקשורת — אפיון למימוש

הג׳וב שממלא את מסך **תקשורת** (`docs/adv3/meetings.html`) — רשימה אחת של
ארבעה ערוצים: פגישה · שיחת טלפון · קבוצת וואטסאפ · עוזר AI, ולכל פריט
זירה עם אותם תוצרים: סיכום, משימות, זיכרון, ולפי הערוץ גם משוב, תמלול
או ההודעות עצמן.

נקודת המוצא: לא כל התקשורת נוצרת בלילה. חלק מהערוצים מעובדים ברגע
שהאירוע נגמר, והג׳וב הלילי הוא זה שסוגר את היום — מסכם את מה שאין לו
"רגע סיום" טבעי, מעדכן את הזיכרון, ומשלים את מה שנפל.

---

## 1 · עקרונות שאינם ניתנים למשא ומתן

1. **אירוע עם סוף מעובד בסופו; יום מעובד בלילה.** פגישה ושיחה מסתיימות —
   העיבוד שלהן מיידי. לקבוצה ולעוזר אין סוף — היחידה שלהן היא יום, ואותו
   סוגר הג׳וב הלילי.
2. **בלי שיוך לחברה אין עיבוד.** שיחה שלא שויכה לא מתומללת ולא מסוכמת —
   ההקלטה נשמרת והשיחה ממתינה בתור הלא־מזוהות. השיוך (ידני של היועץ)
   הוא הטריגר, ואז העיבוד רץ מיד — לא מחכה ללילה.
3. **הזיכרון ניזון מסיכומים, לא מחומר גלם.** כל קטגוריית זיכרון
   (`MEM_CATS`) מקבלת את סיכום האינטראקציה + המסמך הנוכחי שלה, ומחזירה
   "אין עדכון" או מסמך מעודכן. המודל לא קורא תמלולים מלאים בלילה.
4. **דובר לא מזוהה לא נכנס לזיכרון אישי.** מספר זר בקבוצה מסוכם ברמת
   החברה בלבד, ומסומן: *"אינו מזוהה — מה שנאמר ממנו לא שויך לזיכרון
   אישי"*. אין ניחוש זהות.
5. **הג׳וב אידמפוטנטי.** ריצה חוזרת על אותו יום (אחרי כשל, או ידנית)
   מחליפה את התוצרים של אותו יום — לא מכפילה שורות, משימות או רשומות
   זיכרון.

---

## 2 · אחריות הג׳וב — מה רץ בלילה

רץ פר חברה, בחלון 02:00–03:00 (הפרוטוטיפ מציג `רץ ב-02:10`).

1. **מסכם את קבוצות הוואטסאפ שהיו פעילות באותו יום.**
   קבוצה בלי הודעות היום — אין שורה, אין "סיכום ריק". קבוצה עם הודעות
   מקבלת שורת `wa` אחת ליום עם: סיכום (מה עלה בקבוצה), תובנות, משימות
   מוצעות, שורות זיכרון, וההודעות עצמן. אם היו הודעות אך אין מה להוסיף
   לזיכרון — זה נאמר במפורש (*"לא נמצא מה להוסיף לזיכרון"*), כי שקט הוא
   מידע.
2. **מסכם את ההתכתבות של כל משתמש עם העוזר באותו יום.**
   שורת `ai` אחת ליום־משתמש: מה הוא שאל, מה זה מגלה (תובנות), משימות
   ליועץ אם עולה צורך, ושורות זיכרון. השאלות עצמן נשמרות כ"ההתכתבות".
3. **מריץ את מעבר הזיכרון** על כל הסיכומים החדשים של היום — כולל
   סיכומי פגישות ושיחות שנוצרו במהלך היום — קטגוריה־קטגוריה לפי
   הפרומפטים של `MEM_CATS`, בהפרדת scope (חברה / משתמש).
4. **משלים את מה שנפל.** שיחה ששויכה אך העיבוד שלה נכשל, פגישה שהוקלטה
   אך אין לה סיכום — הג׳וב מזהה ומריץ שוב. זו רשת הביטחון, לא המסלול
   הראשי.
5. **מעדכן את מוני התור.** ספירת הלא־מזוהות לרצועת "ממתין לשיוך"
   ולמסך היועץ (`UNID`), כולל התיישנות: שיחה לא משויכת מעל N ימים
   עולה בדוח התפעול היומי.
6. **מפרסם את שורות היום למסך.** כל התוצרים נכתבים בסטטוס
   **«סיכום נוצר»** — לערוצים האוטומטיים אין שלב אישור אנושי.

**מה לא רץ בלילה:** תמלול וסיכום פגישה (בסיום ההקלטה) · תמלול וסיכום
שיחה משויכת (מיידי עם השיוך) · המשוב על היועץ (נגזר מסיכום הפגישה,
בערוץ `meet` בלבד).

---

## 3 · צינור הריצה

```
02:00, פר חברה
──► [1] איסוף: הודעות הקבוצות של היום · שיחות היום עם העוזר
──► [2] סיכום פר קבוצה / פר משתמש (AI)
──► [3] חילוץ תוצרים: תובנות · משימות מוצעות · שורות זיכרון (AI)
──► [4] מעבר זיכרון על כל סיכומי היום, קטגוריה־קטגוריה (AI, MEM_CATS)
──► [5] השלמות: עיבודים שנכשלו במהלך היום (שיחות/פגישות)
──► [6] פרסום: שורות communications + עדכון מונים   (קוד, טרנזקציה)
```

- שלבים [2]–[4] הם קריאות מודל נפרדות עם קלט תחום — לא פרומפט אחד ענק.
- שלב [6] דטרמיניסטי: כתיבה אטומית פר יום־חברה (מחיקת תוצרי אותו יום
  אם קיימים, כתיבה מחדש — עקרון 5).
- כשל בקבוצה אחת לא מפיל את השאר; הפריט נרשם ל-[5] של הלילה הבא
  ולדוח התפעול.

---

## 4 · מודל הנתונים

```sql
-- שורה אחת בכל הרשימה = communication אחד
CREATE TABLE communications (
  id            BIGSERIAL PRIMARY KEY,
  company_id    BIGINT NOT NULL REFERENCES companies(id),
  channel       TEXT NOT NULL CHECK (channel IN ('meet','call','wa','ai')),
  title         TEXT NOT NULL,            -- «תפעול · נסגר החוזה עם מרכז הבנייה»
  happened_on   DATE NOT NULL,            -- לערוצי יום: היום המסוכם
  happened_at   TIMESTAMPTZ,              -- לפגישה/שיחה: מועד האירוע
  source_id     BIGINT,                   -- fk לפי ערוץ: meeting / call / group / user
  status        TEXT NOT NULL,            -- meet: recorded|summary_draft|approved|sent
                                          -- call|wa|ai: summary_created
  meta          JSONB NOT NULL DEFAULT '{}',  -- משך, כיוון, מוני הודעות/כותבים
  UNIQUE (company_id, channel, source_id, happened_on)   -- אידמפוטנטיות
);

CREATE TABLE comm_outputs (               -- התוצרים של הזירה
  comm_id       BIGINT REFERENCES communications(id) ON DELETE CASCADE,
  kind          TEXT CHECK (kind IN
                  ('summary','insights','tasks','memory_lines',
                   'feedback','transcript','messages')),
  payload       JSONB NOT NULL,
  PRIMARY KEY (comm_id, kind)
);

CREATE TABLE wa_groups (
  id BIGSERIAL PRIMARY KEY, company_id BIGINT NOT NULL,
  name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'ops'    -- תפעול / הנהלה
);

CREATE TABLE wa_messages (
  id BIGSERIAL PRIMARY KEY, group_id BIGINT REFERENCES wa_groups(id),
  sender_phone TEXT NOT NULL, sender_user BIGINT NULL,    -- NULL = לא מזוהה
  sent_at TIMESTAMPTZ NOT NULL, body TEXT, attachment JSONB
);

CREATE TABLE ai_turns (
  id BIGSERIAL PRIMARY KEY, company_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL, asked_at TIMESTAMPTZ NOT NULL,
  question TEXT NOT NULL, answer JSONB NOT NULL
);

CREATE TABLE calls (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL, direction TEXT, duration_s INT,
  recorded_at TIMESTAMPTZ NOT NULL, recording_url TEXT NOT NULL,
  company_id BIGINT NULL,                 -- NULL = בתור הלא־מזוהות
  assigned_by BIGINT NULL, assigned_at TIMESTAMPTZ NULL,
  deleted_at TIMESTAMPTZ NULL, deleted_by BIGINT NULL     -- ארכיון, לא DELETE
);

CREATE TABLE nightly_runs (               -- תצפית על הג׳וב עצמו
  id BIGSERIAL PRIMARY KEY, company_id BIGINT NOT NULL,
  ran_for DATE NOT NULL, started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ,
  ok BOOLEAN, stats JSONB, error TEXT,
  UNIQUE (company_id, ran_for)
);
```

שיוך מספרים קיים כבר במסך "מספרי טלפון" של ניהול HK
(`adminScreens/phones.html`): `phone → user → company`. שיחה נכנסת
מוצלבת מולו; מספר עם משתמש שמחזיק כמה חברות נכנס לתור עם
`why='two'`, מספר לא מוכר — `why='none'`.

---

## 5 · API (סקיצה)

```
GET  /companies/:id/communications?from&to&channel&q     ← הרשימה + הבורר
GET  /communications/:id                                 ← הזירה (עם outputs)
POST /calls/:id/assign        {company_id}               ← שיוך → מפעיל עיבוד מיידי
POST /calls/:id/archive       /restore                   ← מחיקה לארכיון ושחזור
GET  /companies/:id/unidentified?view=wait|deleted&q
POST /admin/nightly/run       {company_id?, date?}       ← הרצה ידנית (אידמפוטנטית)
GET  /admin/nightly/runs?date                            ← לדוח התפעול היומי
```

---

## 6 · מה הפרוטוטיפ כבר מממש (מפת התמצאות למתכנת)

| בפרוטוטיפ | מה זה מדגים |
|---|---|
| `docs/adv3/meetings.html · ARENA` | מבנה התוצרים המלא של כל ערוץ — זה ה-payload של `comm_outputs` |
| `KINDS / KCHIP / KSEG` שם | ארבעת הערוצים; הוספת ערוץ = נגיעה רק שם |
| `UNID / unidSet / unidDel` שם | תור הלא־מזוהות, שיוך, ארכיון ושחזור |
| `stripQ()` שם | רצועת "ממתין לשיוך N" — ניזונה מסעיף 2.5 |
| `js/ops.js · MSGS_THREADS` | הקבוצות, הקאסט, והסיכום הלילי (`ran:'02:10'`, `pending`) |
| `docs/cli/ai.html · WA_CHAT` | ההתכתבות עם העוזר — המקור לשורות `ai` |
| `js/memory.js · MEM_CATS` | הפרומפטים של מעבר הזיכרון, כולל scope ו-vis |
| `adminScreens/phones.html` | ניהול שיוך מספר → נציג → חברה |

---

## 7 · מקרי קצה שחובה לכסות

1. **יום בלי פעילות בערוץ** — אין שורה. לא יוצרים "סיכום ריק" (2.1).
2. **הודעות אחרי חצות** — הודעה מ-00:30 שייכת ליום החדש; הג׳וב של
   הלילה הבא יתפוס אותה. אין "יום כפול".
3. **שיוך שיחה בזמן ריצת הג׳וב** — העיבוד המיידי של השיוך גובר;
   שלב ההשלמות מדלג על מה שכבר בעיבוד (נעילה על `call_id`).
4. **מספר זר שהפך מזוהה** — שיוך המספר במסך הטלפונים חל מרגע השיוך
   והלאה. אין עיבוד רטרואקטיבי של סיכומי עבר, אבל שורות "אינו מזוהה"
   ישנות נשארות נכונות לזמנן.
5. **אותו משתמש בשתי חברות (why='two')** — השיוך ידני בלבד; בבורר כל
   שורה היא «שם הלקוח — חברה». הג׳וב לא מנחש.
6. **ריצה כפולה / הרצה ידנית אחרי תיקון** — `UNIQUE(company_id, ran_for)`
   + כתיבה אטומית פר יום: התוצרים מוחלפים, משימות שכבר אושרו ידנית
   לא נמחקות (מפתח לפי `source_line_hash`).
7. **קבוצה שנוספה באמצע יום** — נכנסת לסריקה מהלילה הראשון שלה; אין
   עיבוד היסטוריה אחורה אלא בהרצה ידנית עם `date`.
