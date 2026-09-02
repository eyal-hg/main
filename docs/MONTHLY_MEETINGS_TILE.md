# פגישות חודשיות ודוחות חודשיים — שתי קוביות במסך מנהל התזרים

**איפה בניווט:** תצוגת **מנהל תזרים** (בורר "תצוגה" בראש המסך) → המסך הראשי → פס "מצב
היום" למעלה (חמש קוביות). "פגישות חודשיות" היא הרביעית (במקום "הזנות ואוטומציה" שירדה),
"דוחות חודשיים" החמישית.

---

# א · פגישות חודשיות

## מה הקובייה מראה

- **המונה:** `N / M` — M = כל הלקוחות הפעילים שיש להם את מוצר **Money+**
  (`products.id = 4`); N = כמה מהם עם פגישה שנקבעה החודש.
- **שורת המשנה:** "לקוחות Money+ · (M−N) בלי פגישה החודש".
- **לחיצה** פותחת פירוט לפי חברה: מי נקבעה (✓ + המועד) ומי לא (כפתור "לתיאום" שפותח את
  פגישות החברה). מי שלא נקבעה — ראשונים.

## הכלל למונה N (למתכנת ול-AI שלו)

לקוח נספר כ"נקבעה פגישה החודש" אם קיימת לחברה שלו שורה ב-`meetings` בחודש הנוכחי
שעונה על:

```sql
status IN ('approve','processed')
OR (status = 'scheduled' AND scheduled_at >= CURRENT_DATE)
```

כלומר: פגישה שאושרה או עובדה נספרת גם אם כבר התקיימה; פגישה מתוכננת נספרת רק אם
המועד שלה עוד לפנינו. פגישה מתוכננת שמועדה עבר בלי לעבור לעיבוד — לא נספרת.

```
GET /manager/monthly-meetings?month=YYYY-MM
← { total: M, scheduled: N, clients:[{company_id, name, scheduled:bool, when?}] }
```

---

# ב · דוחות חודשיים

## מה הקובייה מראה

- **המונה:** `N / M` — M = כל הלקוחות הפעילים שיש להם **Money או Money+**
  (`products.id IN (3, 4)`); N = כמה מהם כבר קיבלו את הדוח החודשי של החודש.
- **שורת המשנה:** "לקוחות Money ו-Money+ · עד 10.7 · (M−N) נותרו".
- **לחיצה** פותחת פירוט לפי חברה: "✓ נשלח" או כפתור "שליחת דוח".

## איך יודעים שנשלח (למתכנת ול-AI שלו)

אין היום רישום. **כל שליחה של דוח חודשי מהמסך נשמרת בטבלה:**

```sql
CREATE TABLE monthly_report_sends (
  id          BIGSERIAL PRIMARY KEY,
  company_id  BIGINT NOT NULL REFERENCES companies(id),
  month       DATE   NOT NULL,          -- החודש שהדוח מכסה (היום הראשון בחודש)
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_by     BIGINT NOT NULL,          -- המשתמש שלחץ "שליחת דוח"
  channel     TEXT NOT NULL DEFAULT 'whatsapp'
);
CREATE INDEX ON monthly_report_sends (company_id, month);
```

לקוח נספר כ"נשלח" אם קיימת לו שורה ל-`month` הנוכחי. שליחה חוזרת מוסיפה שורה (היסטוריה),
המונה סופר חברות ולא שורות.

```
POST /companies/:id/monthly-report/send   {month}   ← שולח ורושם שורה
GET  /manager/monthly-reports?month=YYYY-MM
← { total: M, sent: N, clients:[{company_id, name, sent:bool, sent_at?}] }
```
