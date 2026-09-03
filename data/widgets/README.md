# data/widgets — קבצי JSON לווידג׳ט "טבלה מ-JSON"

מניחים כאן קובץ בפורמט של שרת הווידג׳טים (`types` + `rows`, ואפשר `received_at`), בנתיב
`data/widgets/<company>/<widget>.json`. למשל `data/widgets/haviv/payment_terms.json`.

**אחרי שמניחים קובץ — מריצים פעם אחת:**
```
python3 tools/widgets-json2js.py
```
זה יוצר ליד כל JSON קובץ `.js` זהה. הסיבה: הפרוטוטיפ נפתח מ-`file://`, ושם הדפדפן לא מרשה
לקרוא קובץ `.json` (fetch חסום), רק `<script>`. כשהמסך יוגש משרת (http) הווידג׳ט קורא את ה-JSON
ישירות וה-.js לא נחוץ.

הווידג׳ט בדשבורד בעל העסק: `widgets/widget-json-table.html?file=haviv/payment_terms`
(רשום ב-`js/board.js`, `BOARDS.client`). כדי להציג קובץ אחר — משנים את `file=`.
