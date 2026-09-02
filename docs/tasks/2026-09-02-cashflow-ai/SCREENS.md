# SCREENS.md — מפת המסכים החיים (מה index.html טוען)

**זה המקור היחיד.** מסך שלא מופיע כאן אינו חלק מהמערכת. גרסאות ישנות יושבות
ב-`legacy/` ואין לעבוד מהן. עודכן 02.09.2026.

## מעטפת
| קובץ | תפקיד |
|---|---|
| `index.html` | המעטפת: פס עליון, סרגל צד, בורר תפקידים, הטמעת כל המסכים |
| `js/screens.js` | ניתוב הטאבים (`showTab`, `CLI_TABS`, `gnavItems`) |
| `js/ops.js` · `js/queue.js` · `js/alerts.js` · `js/admin.js` · `js/memory.js` · `js/cosettings.js` · `js/board.js` · `js/recbar.js` · `js/help.js` | המסכים שמצוירים בתוך index.html עצמו |

## מסכי החברה (טאב בסרגל → קובץ)
| טאב | תווית | קובץ | הערה |
|---|---|---|---|
| `dash` | דשבורד | `docs/cli/dashboard.html` | לבעל העסק; ליועץ/מנהל — הדשבורד שב-index |
| `msgs` | קבוצת הוואטסאפ | `docs/cli/messages.html` | |
| `calls` | שיחות טלפון | `docs/cli/calls.html` | לא לבעל העסק |
| `meetings` | פגישות / תקשורת | `docs/cli/meetings.html` (לקוח) · `docs/adv3/meetings.html` (יועץ ומנהל) | |
| `chat` | עוזר AI | `docs/cli/ai.html` | |
| `metrics` | מדדים | `docs/cli/metrics.html` | |
| `past` | תמונת תזרים | `docs/cli/cashflow-past.html` | **לכל התפקידים** |
| `flow` | התהליך שלי | `docs/cli/process.html` | |
| `entries` | קליטת מסמכים | `docs/cli/intake.html` | |
| `budget` | מעקב ופערים | `budget-flow.html` | |
| `acct` | תכנון חשבונאי | `accounting-plan.html` | |
| `fcast` | תכנון תזרימי | `monthly-goal-index.html` | |
| `mem` | זיכרון החברה | `js/memory.js` (בתוך index) | |
| `coset` | הגדרות חברה | `js/cosettings.js` (בתוך index) | |
| `flowlog` | מה השתנה בתזרים | `flow-changes.html` | |
| `prep` | הכנה לפגישה | `meetings-arena.html` | |
| — | חדר פגישה | `meeting-room.html` · `client-view.html` (המסך ללקוח בטאב נפרד) | |

## מסכי היועץ / מנהל התזרים (גלובליים)
| מסך | קובץ |
|---|---|
| היום | `docs/adv3/today.html` |
| משימות | `docs/adv3/tasks.html` |
| לקוחות | `docs/adv3/clients.html` |
| זיכרון | `docs/adv3/memory.html` |
| תפעול (מנהל) | `js/ops.js` |
| יומן | `calendar.html` (נפתח מ"היומן המלא"; פותח `meeting.html`) |
| הזנה במובייל ללקוח | `entry-mobile.html` (מ"תצוגת הלקוח" בתפעול) |
| גלריית ווידג׳טים | `widgets/` (מ-`js/board.js`) |

## איך לבדוק שקובץ חי
```
grep -rn "<שם-הקובץ>" index.html js/ docs/cli docs/adv3
```
אין תוצאה — הקובץ לא בשימוש. ב-`legacy/` יש README עם מה החליף מה.
