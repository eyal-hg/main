# קו עיצובי אחיד — מסכי היועץ

## חלק א — הערות עיצוב

### טבלת ערכים קנוניים

| רכיב | ערך קנוני | מי חורג |
|---|---|---|
| ניווט + רצועה | `.nav` 52px + `.strip` 68px = 120px כרום | אף אחד (נעול) |
| מרווח הרצועה | `padding:0 32px` (24px ≤1450), `gap:28px` | meetings (`gap:16px`) |
| תוכן הרצועה | כותרת · תאריך · מפריד · הדבר החי · spacer · שעון — חמישה סלוטים, לא יותר | memory (כפתור «איך הזיכרון נבנה»), clients (שני מונים שמשכפלים עמודה בטבלה) |
| `.wrap` | `padding:18px 32px 20px; gap:18px; grid:minmax(0,1fr) 470px; align-items:stretch; min-height:calc(100vh - 120px)` | clients (16/32/16, gap 14, 480px, `align-items:start`), tasks (380px, start), meetings (620px — חריגה מאושרת אחת) |
| `.wrap` ב-≤1450 | `padding:14px 24px 16px; gap:14px; grid:minmax(0,1fr) 430px; min-height:calc(100vh - 120px)` | tasks (340px), meetings (`100vh - 112px` — שגוי ב-8px) |
| עמודה צדדית | נמתחת בגריד. אסור `position:sticky` יחד עם `height:calc(100vh - N)` | clients (חורג ב-108px), meetings (130px), today, memory |
| `.panel` | `background:#fff; border:1px solid var(--bd); border-radius:10px; box-shadow:0 1px 2px rgba(12,64,104,.04)` | clients (מוסיף `overflow-x:auto` ומסתיר עמודה) |
| `.ph` (כותרת פאנל) | `display:flex; align-items:baseline; gap:12px; padding:14px 20px 10px` (11px 18px 8px ≤1450) | clients (`8px 20px 8px`, `align-items:center`) |
| `.ph h2` | `17px/600/var(--navy)` — 16px ב-≤1450 | meetings (`.ar-sky` 15px/700/#2E9BD6 עם !important) |
| ריפוד אופקי | 20px בכל פאנל ובכל מודאל | clients ו-memory (22px במודאל) |
| רדיוסים | 4 · 6 · 7 · 10 · 12 · 50% בלבד | today (10 ערכים), tasks (12), clients (13), meetings (11) |
| סקאלת טיפוגרפיה | 28 · 22 · 19 · 17 · 14 · 13 · 12.5 · 12 · 11.5 | כולם (13.5 ו-15 בכל הקבצים; meetings גם 10.5/14.5/21/24) |
| צ׳יפ סינון | `#F0F4F8` · `radius:7px` · `padding:5px 10px` · 12px/500 · פעיל = מילוי נייבי | clients (3 סגנונות), tasks (3), memory (מסגרת לבנה), meetings (שורה סגולה) |
| כפתור ראשי | `.btn.pri` נייבי על לבן; `.dark .btn.pri` תכלת על נייבי | tasks (`.btn.sky` על לבן), meetings (קורל inline + !important), today (4 מילויים במסך אחד) |
| שורת טבלה | 44px (`td padding:11px 14px`) → 38px ב-≤1450 (`8px 14px`); עד 6 עמודות | meetings (62.7px, 4 עמודות בלי סטטוס), clients (7 עמודות, גלישה אופקית) |
| התראה | טקסט צבעוני + נקודה 6px. אין רקע צבעוני | today (`.warn` גלולה בז׳), tasks (`.sent` גלולה ירוקה), meetings (`.ar-st` שתי שיטות) |
| בלוק נייבי בגוף | בדיוק אחד, radius 10px, `padding:16px 20px 14px`, ומכיל פעולה | memory (הבלוק לקריאה בלבד ומשכפל את הפיד), today (מספר הבלוקים תלוי בנתונים), meetings (הבלוק נמחק מה-HTML) |
| מצב ריק | `.empty` אחיד עם שם הסינון וכפתור איפוס | clients, memory, tasks, meetings — כולם נוסח חופשי בלי איפוס |
| כיווניות | תכונות לוגיות בלבד | כולם (tasks: 32 פיזיות מול 1 לוגית) |

### 1. שלד המסך והכרום

```css
.nav{height:52px}                       /* נעול */
.strip{height:68px;padding:0 32px;gap:28px}
@media (max-width:1450px){.strip{padding-inline:24px}}
.wrap{padding:18px 32px 20px;gap:18px;display:grid;
      grid-template-columns:minmax(0,1fr) 470px;
      align-items:stretch;min-height:calc(100vh - 120px)}
.wrap>*{min-width:0;min-height:0}
@media (max-width:1450px){.wrap{padding:14px 24px 16px;gap:14px;
      grid-template-columns:minmax(0,1fr) 430px;min-height:calc(100vh - 120px)}}
```
- `meetings` בלבד רשאי ל-620px בעמודה הצדדית (הזירה היא חדר עבודה), וב-≤1450 יורד ל-430px כמו כולם.
- ב-`meetings` לתקן `100vh - 112px` ל-`100vh - 120px`; ב-`clients`/`tasks` `align-items:start`→`stretch`; ב-`today` להוסיף `min-height` ל-`.wrap`.

### 2. עמודה צדדית שלא גולשת (חוק 5)

אסור: `position:sticky` + `height:calc(100vh - N)` על ילד של הגריד — זה מה שדוחף את כפתורי הכרטיס ב-clients 108px מתחת לקיפול ואת `אישור ושליחה` ב-meetings 130px מתחתיו.

```css
aside.left{display:flex;flex-direction:column;gap:14px;min-height:0}
aside.left .panel{display:flex;flex-direction:column;min-height:0}
.panel .body{flex:1;overflow-y:auto;min-height:0}
.panel .ft{margin-top:auto;padding:12px 20px 14px;border-top:1px solid var(--bd)}
```
- `clients`: למחוק `.left{height:calc(100vh - 28px)}`.
- `meetings`: למחוק `.arena{height:calc(100vh - 28px);position:sticky;top:14px}`; `.ar-acts` כבר עם `margin-top:auto`.
- `memory`: `ul.cols{max-height:calc(100vh - 640px);overflow-y:auto}` כדי שהעמודה הצדדית לא תכתיב את גובה הדף.

### 3. פאנל, כותרת פאנל, מרווחים

```css
.panel{background:#fff;border:1px solid var(--bd);border-radius:10px;
       box-shadow:0 1px 2px rgba(12,64,104,.04)}
.ph{display:flex;align-items:baseline;gap:12px;padding:14px 20px 10px;
    border-bottom:1px solid var(--bd)}
.ph h2{font-size:17px;font-weight:600;color:var(--navy)}
.ph .hint{font-size:12.5px;color:var(--ink3)}
.ph .more{font-size:12.5px;font-weight:500;color:var(--sky);margin-inline-start:auto}
@media (max-width:1450px){.ph{padding:11px 18px 8px}.ph h2{font-size:16px}}
```
- סולם מרווחים: 4 · 6 · 8 · 10 · 12 · 14 · 18 · 20 · 24 · 32. אין ערכים אחרים.
- ריפוד אופקי 20px גם במודאלים — ב-`clients` וב-`memory` להחליף 22px ל-20px.
- `.panel{overflow-x:auto}` נאסר: גלילה פנימית מסתירה נתונים (מנהל תזרים נעלם ב-1440) — להוריד עמודות במקום. ב-`clients` להשוות ריפוד `th` ל-`td` (פער 6px בכל עמודה).

### 4. צ׳יפים (חוק 9) — מחלקה אחת לכל המסכים

```css
.chip{font:inherit;font-size:12px;font-weight:500;background:#F0F4F8;border:0;
      border-radius:7px;padding:5px 10px;color:var(--ink2);cursor:pointer}
.chip:hover{background:#E2EBF2;color:var(--navy)}
.chip.on{background:var(--navy);color:#fff}
.dark .chip{background:rgba(255,255,255,.08);color:var(--on-navy)}
.dark .chip.on{background:var(--sky);color:#fff}
```
להחליף בה: `clients .stages .st` + `.stage-ed button` + `.st-set` · `tasks .byc li` + `.seg button` + `.panel.det .chips button` + `.rec .mode/.days/.grid button` · `memory .cats button` · `meetings .topics button` + `.topics.fbt button` (למחוק את שכבת הסגול). למחוק כל `border-radius:14px/16px/20px` על צ׳יפ.
מונה על צ׳יפ מחושב מהנתונים בזמן רינדור; צ׳יפ עם 0 תוצאות לא מוצג (ב-meetings שלושה צ׳יפים מבטיחים מונה ומחזירים טבלה ריקה).

### 5. היררכיית כפתורים

```css
.btn{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:6px;
     font-size:13px;font-weight:500;border:1px solid var(--bd);background:#fff;
     color:var(--navy);white-space:nowrap;cursor:pointer}
.btn:hover{background:var(--bg)}
.btn.sm{padding:4px 10px;font-size:12.5px}
.btn.pri{background:var(--navy);border-color:var(--navy);color:#fff}
.btn.pri:hover{background:var(--navy2)}
.btn.danger{background:var(--coral);border-color:var(--coral);color:#fff}
.dark .btn{background:transparent;border-color:rgba(255,255,255,.3);color:#fff}
.dark .btn.pri{background:var(--sky);border-color:var(--sky);color:#fff}
```
- `.btn.pri` אחד לכל פאנל, ועל הפריט החי — לא על הרחוק ביותר בזמן (ב-today הפגישה הבאה היא היחידה בלי כפתור).
- למחוק: `.btn.sky` על רקע לבן (tasks), `style="background:var(--coral)"` ושלושת ה-`!important` ב-`meetings .ar-acts`, `.btn.rec i` המת ב-today.
- ניגודיות: לבן על `--sky` הוא 2.6:1 — אסור לטקסט. על נייבי הכפתור הראשי הוא לבן עם טקסט נייבי או `--sky` מוכהה ל-`#1E86BC`.
- כפתור הרסני לא צמוד לכפתור שליחה: מפריד `margin-inline-start:auto` ביניהם, ואישור דו-שלבי לשניהם.

### 6. טבלאות

```css
.tb{width:100%;border-collapse:collapse}
.tb th{font-size:12px;font-weight:500;color:var(--ink3);background:#FAFCFE;
       padding:7px 14px;text-align:start;border-bottom:1px solid var(--bd)}
.tb td{font-size:14px;color:var(--ink2);padding:11px 14px;border-top:1px solid var(--bd)}
.tb th:first-child,.tb td:first-child{padding-inline-start:20px}
.tb th:last-child,.tb td:last-child{padding-inline-end:20px}
.tb tr:hover td{background:#F8FBFD}
.tb tr.hl td{background:#EEF6FC}
@media (max-width:1450px){.tb td{padding:8px 14px}}
```
- עד 6 עמודות. עמודה ראשונה = זהות, אחרונה = פעולה. עמודה עם פחות מ-4 ערכים שונים על פני הטבלה הופכת לצ׳יפ סינון (clients: חבילה, מנהל תזרים; meetings: משך).
- meetings: להחזיר עמודת «מה חסר» במקום «משך», ולהחזיר את בלוק המונים `.miss` (ה-CSS שלו כבר בקובץ).
- בחירת שורה מסונכרנת בכיוון אחד: הפונקציה שמציגה את הפריט היא זו שמסמנת את השורה (`.hl`), לא ה-click handler.

### 7. התראות ומצבים (חוק 10)

```css
.al{display:inline-flex;align-items:center;gap:6px;font-weight:500}
.al::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.al.bad{color:var(--red)} .al.warn{color:var(--orange)}
.al.ok{color:var(--green)} .al.info{color:var(--ink3)}
.dark .st{border-radius:7px;padding:2px 9px;font-size:12px;background:rgba(255,255,255,.12);color:#fff}
.dark .st.wait{background:rgba(201,132,4,.3);color:#FFDFA0}
.dark .st.ok{background:rgba(19,137,91,.3);color:#9FE8C5}
.dark .st.bad{background:rgba(232,99,90,.3);color:#FFD3CF}
```
גלולה צבעונית מותרת רק על רקע נייבי (שבב סטטוס בכותרת כהה). למחוק: `today .mt .meta .warn` (רקע `#FFF6E5`), `tasks .tk .sent` ו-`.tk .rep` (רקעים), `meetings .ar-st.wait` האטום.
מצב ומקור לא חולקים ערוץ: פס בקצה הפנימי = מקור, טקסט+נקודה = איחור — ב-tasks למחוק `.tk.late{background;border-right}`, `.tk.late.m` ושני ה-gradients.

### 8. שימוש בנייבי (חוק 3)

- בגוף הדף בלוק נייבי אחד בלבד, `border-radius:10px`, `padding:16px 20px 14px`, והוא מסמן **איפה פועלים**.
- מספר הבלוקים לא יהיה תלוי בנתונים: ב-`today` הבלוק `.born` מוטמע בכל פגישה שהסתיימה — לפתוח רק את האחרונה, `.mt.done ~ .mt.done .born{display:none}`, והשאר שורה לבנה אחת.
- ב-`memory` הבלוק קורא בלבד ומדפיס מילה במילה ארבע שורות שכבר בפיד — או שמחליפים את תוכנו בפעולה, או שמוחקים אותו והרצועה נשארת הנייבי היחיד.
- בלוק נייבי מת ב-CSS הוא מוקש: למחוק את `.dark{}` ב-`tasks` (22 כללים ללא markup), ולהחזיר את `.miss` ב-`meetings` ל-markup במקום להשאירו יתום.
- טקסט על נייבי: `--on-navy` ראשי, `--on-navy2` משני, `--on-navy3` כותרות משנה, `--on-navy4` שקט.

### 9. מצב ריק

```css
.empty{padding:40px 20px;text-align:center;color:var(--ink3);font-size:13px}
.empty b{display:block;font-size:14px;color:var(--ink2);font-weight:600;margin-bottom:6px}
.empty .btn{margin-top:12px}
```
הנוסח נבנה במקום אחד ומבחין בין «אין נתונים ללקוח הזה» לבין «אין תוצאה לסינון», לא מזכיר את שם הלקוח פעמיים, ותמיד מציג כפתור איפוס בתוך המצב הריק עצמו (היום האיפוס היחיד ב-memory נמצא 400px משם).

### 10. סקאלות

```
font-size: 28 (h1) · 22 (מספר חי ברצועה) · 19 (כותרת כרטיס/מודאל) · 17 (h2 פאנל, 16 ב-≤1450)
           14 (גוף, טבלה) · 13 (גוף משני, כפתורים) · 12.5 (מטא) · 12 (צ׳יפ, מיקרו) · 11.5 (caps)
מיפוי: 10.5→11.5 · 11→11.5 · 13.5→13 · 14.5→14 · 15→14 · 18→17 · 20/21→19 · 24/26→22
border-radius: 4 (תיבת סימון, mark) · 6 (פקדים) · 7 (צ׳יפ) · 10 (פאנל, בלוק נייבי) · 12 (מודאל) · 50%
מיפוי: 2/3→4 · 5→6 · 8/9→10 · 11/14/16/20/22→7 בצ׳יפ, 6 בפקד, 10 במשטח
```

### 11. טוקנים — להוסיף ל-`:root` בחמשת הקבצים, זהה מילה במילה

```css
--on-navy:#DCEBF5; --on-navy2:#B9D3E6; --on-navy3:#9FC0DA; --on-navy4:#7FA6C2;
--chip:#F0F4F8; --chip-hover:#E2EBF2; --tint:#EAF3FA; --surface2:#FAFCFE;
--row-hover:#F8FBFD; --row-sel:#EEF6FC; --bd2:#B7C3CF; --line:#C4CED8; --mark:#FFF1C2;
--warn-bg:#FFF9F0; --warn-ink:#9A6300; --bad-bg:#FDEDEB; --bad-ink:#C43D30;
--good-bg:#F1FAF5; --good-ink:#13895b;
```
- `#2E9BD6` ב-meetings (7 מופעים) → `var(--sky)`. כל hex ששווה לטוקן → הטוקן. `--purple` מוגדר ולא בשימוש: `--purple:#6B4FA0` ולהשתמש, או למחוק.
- אחרי ההחלפה אסור hex מחוץ ל-`:root` (meetings היום: 43 שונים).

### 12. כיווניות (RTL)

```
margin-right:auto  → margin-inline-start:auto
margin-right:N     → margin-inline-end:N   (או -start לפי הכוונה)
padding-right/left → padding-inline-start/end
border-right       → border-inline-start
text-align:left    → text-align:end
right:12px         → inset-inline-start:12px
linear-gradient(270deg,…) → linear-gradient(to left,…) או מחיקה
```
`inset 3px 0 0` ב-`tasks .tk.open` צובע את הקצה השגוי — להחליף ב-`border-inline-start:3px solid var(--sky)`.

### 13. נגישות ומקלדת

- אין `<span class="cb">` כתיבת סימון: `<input type="checkbox">` עם `appearance:none` ואותו עיצוב.
- שורה שנבחרת בלחיצה מקבלת `tabindex="0" role="button"` ומטפל Enter/Space שקורא לאותה פונקציה.
- מודאל: מיקוד לכפתור הראשון, Escape סוגר את העליון בלבד (ב-`clients` Escape מחליף לקוח מתחת למודאל פתוח). `:focus-visible{outline:2px solid var(--sky);outline-offset:2px}` בכל פקד.

### 14. היגיינה שחוזרת בכל הקבצים

- CSS מת: today ~35 שורות מ-clients · tasks ~55 שורות + 5 פונקציות · clients 8 בלוקים · meetings 36 בלוקים (~40% מהגיליון) · memory `.cl li.all`.
- פונקציות שנקראות מ-`onclick` חייבות להיות ב-`window` — `meetings.apply()` ו-`toast()` זורקות ReferenceError בכל שימוש.
- שאילתת חיפוש נכנסת ל-`innerHTML` בלי escaping ב-`memory` וב-`meetings`, וגם דרך `?q=`. לעטוף ב-esc ולהחליף כל מופע, לא רק הראשון.
- אין `style=` ב-markup ואין `!important` ב-CSS. מונה שמוצג למשתמש נגזר מהנתונים, לא נכתב ביד.
- חוזה פרמטרים אחיד: כל מסך קורא `?c=` (לקוח), `?q=` (טקסט), `?f=` (סינון), `?m=` (פגישה). היום `today` בולע `?prep=`, `meetings` מתעלם מ-`?m=`, ו-`memory #cMeet` מאבד את הלקוח.

## חלק ב — הערות ושיפורים

### today — היום
1. **אין מצב «אני בפגישה עכשיו».** אין `.mt.live`, אין זמן שחלף, ואין לכידת הערה. זה המצב הנפוץ ביותר של יועץ עם 4–5 פגישות ביום, והמסך לא יודע לצייר אותו. כפתור ההקלטה ברצועה יכול להתחיל להקליט כלום.
2. **סיכומים לא מאושרים מימים קודמים אינם קיימים כאן.** `.born` נולד רק מתחת לפגישה שהסתיימה היום. התור האמיתי מצטבר ונעלם — צריך שורה ברצועה: «3 סיכומים ממתינים — 2 מאתמול ←».
3. **מסך ייעוץ פיננסי בלי מספר אחד.** «אחרי חריגת התקציב» מופיע פעמיים בלי שקל אחד. השורה של 13:00 צריכה «חריגה ₪48K (12%) מול התקציב».
4. **השעתיים הפנויות מצוירות כרווח לבן.** לחבר אותן לעבודה שממתינה: «2:06 פנויות · 2 באיחור · סיכום אחד לאישור · ההכנה ל-16:00 לא נפתחה», כל חלק קישור.
5. **`approve()` מוחק את המשימה הלא נכונה** (`#tl li` הראשון = משימת האיחור). באג הרסני, לא הערת עיצוב.

### tasks — משימות
1. **אין חיפוש בכלל.** עם 20 לקוחות זה 60+ משימות. שורת הסינון היא 1100px ריקים בדיוק במקום שבו החיפוש צריך לשבת.
2. **«היום» הוא ערימה בלי סדר וללא קשר לפגישות.** הקוד כבר מחלץ «לפני 13:00» מהטקסט וזורק את זה. השאלה היחידה ב-10:54 היא מה חייב להיסגר לפני הפגישה הבאה.
3. **אין דחיפות ואין הזדקנות** — רק תאריך. «באיחור 3 ימים» ודגל חשיבות חסרים, והרצועה מכתירה את השורה הישנה ביותר כ«הבאה בתור».
4. **«ביקשתי מ-HK» לא עונה על שום שאלה** מלבד תאריך יעד: אין גיל בקשה, אין תזכורת, אין בקשות שנסגרו, אין סינון.
5. **שליחה ללקוח היא ירייה באפילה** — אין תצוגה של «ממתין ללקוח». ה-badge `נשלח` הוא התחלה של פיצ׳ר שנעצר.

### clients — לקוחות
1. **המסך מחשב את שני המספרים הנכונים וזורק אותם.** `nom` (13 לקוחות בלי פגישה הבאה) ו-`lt` (3 עברו יעד שלב) מחושבים ולא נקראים אף פעם, בזמן שהרצועה מציגה ספירה של עמודה שנמצאת סנטימטר מתחתיה.
2. **22 שורות, אפס מיון.** הסדר קשיח, ושלושת הלקוחות שעברו יעד יושבים במקומות 3, 4 ו-15. «את מי לרדוף ראשון» הוא מיון לפי ימים מעבר ליעד.
3. **תאריכים גולמיים בלי זמן שחלף.** «17.03» ו«לפני 3.5 חודשים» זה אותו נתון, ורק השני אומר משהו. להוסיף «לפני X ימים» ו«X ימים בסטטוס».
4. **13 קישורי «שליחת לינק» זהים** — צ׳יפ «בלי פגישה הבאה (13)» ופעולה קבוצתית מחליפים 13 קליקים בשניים.
5. **הכרטיס הצדדי משכפל שלושה מסכים אחרים ואז מקשר אליהם.** התפקיד שלו לא נתפס: מה חוסם את הלקוח מלהתקדם — איזה חומר חסר, ממי, כמה זמן. הנתון כבר קיים ב-`lastSub`.

### meetings — פגישות
1. **התפקיד המוצהר של המסך חסר משטח.** «מה חסר» ניתן לגילוי רק בלחיצה על שורה, אחת בכל פעם. הטבלה נותנת תאריך/לקוח/משך/כפתור. today עונה על זה טוב יותר מפגישות.
2. **שום דבר לא מדורג לפי דחיפות ושום דבר לא מזדקן.** סיכום שלא נשלח מ-01.06 נראה כמו אחד מאתמול, ויושב למטה.
3. **החיפוש מכסה 5 מתוך 9 פגישות בשקט** (רק שורות עם `data-items`), ומחזיר ספירה בטוחה. תוצאה שלילית שגויה שהיועץ יפעל לפיה.
4. **חיפוש עברית הוא substring מדויק** — «לגבות», «נגבה», «האשראי» מחזירים אפס על תוכן שקיים.
5. **נושאים חוזרים הוא הרעיון הכי חזק בסט ולא מוביל לשום מקום** — «מסגרת אשראי · 4» על פני 3 לקוחות הוא תובנה עסקית, לא סינון טבלה.
6. **משוב על היועץ יושב במסלול העבודה היומי.** זו סקירה חודשית, לא החלטה בין פגישות — למטה או למסך אחר.

### memory — זיכרון
1. **זיכרון שאי אפשר לתקן מפסיקים להאמין לו.** כל שורה כאן היא פרשנות מכונה. «נכון / לא מדויק» בשורה הוא ההבדל בין מערכת זיכרון לתמליל.
2. **אין שרשרת ראיות** — אין ציטוט, אין חותמת בתמליל, אין קישור להקלטה. בלי זה היועץ מאזין להקלטה שוב, כלומר לעבודה שהמסך אמור היה למחוק.
3. **חצי מהעמודה הצדדית היא 17 שמות בלי שום סימן.** ממוין לפי ימים מאז עדכון אחרון עם מונה — «נוף טקסטיל · אין עדכון 74 יום» — זה הופך למידע היחיד שרק המסך הזה יודע.
4. **«הזיכרון עדיין ריק» בפגישה ראשונה** — דווקא שם יש שיחת מכירה, מקור הפניה וטופס קליטה. ריק מלמד שאי אפשר לסמוך על הבלוק.
5. **אין «מה השתנה מאז שהסתכלתי»** — אין נקרא/לא נקרא ואין מונה מאז אתמול.

## מה נשאר פתוח

1. **גובה העמודה הצדדית מול sticky** — הפתרון כאן מוותר על sticky לגמרי. אם רוצים שהכרטיס יישאר גלוי בזמן גלילת טבלה, צריך קודם להפוך את `.nav` ו-`.strip` ל-sticky ואז `top:120px` — החלטה שלא נלקחה.
2. **רוחב העמודה הצדדית ב-meetings** — 620px מאושר כחריגה יחידה. אם הזירה מצטמצמת ל-470px, צריך להחליט מה יורד ממנה.
3. **מקור אמת לשעה** — `today` מקודד 10:54 בשלושה מקומות. שעון חי אחד משנה את הרצועה, את קו העכשיו ואת הספירה לאחור — לא הוחלט אם הפרוטוטייפ צריך אותו.
4. **קטגוריית «מערכת יחסים»** ב-memory מוכרזת בשלושה מקומות ואין לה אף שורה — לאכלס או להסיר משלושתם.
5. **מספרים** — אין שקל אחד בחמשת המסכים; מקור נתוני החריגה והפורמט לא הוחלטו. וכן: האם `?c=` נשמר במעבר בין מסכים.
