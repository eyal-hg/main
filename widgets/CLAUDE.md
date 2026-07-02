# HK Widgets — Project Context

## מה הפרויקט
מערכת ווידגטים לדשבורד של יועץ עסקי (HK / חזות קריספין).
כל ווידגט בא בשני גרסאות: **פיקר קארד** (200px, גלריית בחירה) + **ווידגט מלא** (640px, דשבורד).

---

## Design Tokens
```css
--navy:   #0C4068   /* כותרות, טקסט ראשי */
--cyan:   #39ABE2   /* צבע ראשי, מילוי, גרפים */
--warm:   #E48375   /* CTA — לא להשתמש לנתונים (נראה כמו אדום/אזהרה) */
--white:  #FFFFFF
--dark:   #273736
--gray:   #818181
--gray2:  #a0a8b8
--green:  #1e8a4c   /* עלייה / חיובי */
--red:    #d93025   /* ירידה / שלילי */
--yellow: #f0b429   /* יציבות / בתהליך */
--shadow: 0px 1px 50px rgba(0,0,0,0.08)
--bg:     #e8eef4
```

## עקרונות עיצוב
- **RTL** — `dir="rtl"`, font: Rubik
- **Progress bar** — גובה 12px, border-radius 20px, רקע #deeef8, מתמלא **משמאל לימין** (`direction:ltr`)
- **Bubble** מעל הבר — `position:absolute; top:-24px; transform:translateX(-50%)`
- **Chips** — up=ירוק, dn=אדום, st=צהוב, tgt=אפור-נייבי
- **בר קנה מידה** — 0 מימין, יעד משמאל (RTL)
- **גרף sparkline** — SVG עם gradient fill, preserveAspectRatio ללא עיוות טקסט
- **צבעי עוגה** — ממומן=ציאן, אורגני=נייבי (לא להשתמש בחמים לנתונים)

---

## קבצים קיימים

| קובץ | תוכן |
|------|-------|
| `widget-metric-full.html` | מדד מגמות — מדד חודשי כללי (הכנסות, עסקאות וכו׳). פיקר + מלא. כולל גרף יומי לחודש, בר יעד, chips השוואה. |
| `widget-leads-full.html` | פירוט מדד מחובר — חלוקה בין שני מדדים (ממומן/אורגני). פיקר + מלא. כולל עוגות, פילטר, בר יעד. |
| `widget-process-full.html` | תהליך ליווי עסקי — רשימת שלבים עם done/active/pending, בר התקדמות, גלילה. |
| `widget-next-process.html` | השלב הבא בתהליך — שלב מורחב עם פירוט אג׳נדה. |
| `widget-picker.html` | מודל גלריית ווידגטים (Apple-style) עם טאבים וחיפוש. |
| `widgets-showcase.html` | תצוגת 16 ווידגטים — פיקרים + מלאים. |
| `index.html` | דף פתיחה עם קישורים לכל הקבצים. |

---

## מבנה פיקר קארד (200px)
```html
<div class="wcard">
  <div class="wcard-text">     <!-- כותרת + תיאור -->
  <div class="wcard-preview">  <!-- תצוגה מקדימה מיניאטורית, רקע #f7fafd -->
  <div class="wcard-foot">     <!-- קטגוריה + כפתור "+ הוספה" / counter ציאן -->
</div>
```
- Counter toggle: `+ הוספה` → `− N +` (cyan) ב-JS עם `classList.add('added')`

## מבנה ווידגט מלא (640px)
```html
<div class="widget">   <!-- width:640px, border-radius:12px, shadow -->
  <!-- header: כותרת + dropdown חודש -->
  <!-- metric: מספר גדול + chips השוואה -->
  <!-- progress bar + bubble -->
  <!-- גרף / עוגות / שלבים -->
  <!-- footer: עדכון אחרון -->
</div>
```

---

## Dropdown חודש (סגנון אחיד)
```html
<div class="w-month">
  <!-- SVG calendar icon -->
  <select>
    <option>ינואר 2026</option>
    ...12 חודשים...
  </select>
  <!-- SVG chevron -->
</div>
```

## Chips (סגנון אחיד)
```html
<div class="chip up">↑ 22% לעומת חודש קודם</div>
<div class="chip dn">↓ 5% לעומת שנה קודמת</div>
<div class="chip tgt">יעד: 400 · 88% עמידה</div>
```

---

## הערות חשובות
- אחוזי השוואה — **תמיד לפי אותה תקופה** (e.g. 1-14 בחודש הנוכחי vs 1-14 בחודש קודם)
- גרף יומי — מראה רק עד היום הנוכחי, ימים עתידיים = אזור אפור (#f0f4f8)
- ציר X של גרף — 0 **מימין**, יעד **משמאל** (RTL-consistent)
- "עדכון אחרון" — תאריך בלבד, ללא שעה
