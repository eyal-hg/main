# extrnal_widget — קבצי JSON לווידג׳ט "טבלה מ-JSON"

מניחים כאן קובץ בפורמט של שרת הווידג׳טים (`types` + `rows`, אפשר גם `received_at`), בשם
`<company>__<widget>.json`. למשל `gviya__customer_balances.json`.

**אחרי שמניחים קובץ — מריצים פעם אחת:**
```
python3 tools/widgets-json2js.py
```
זה יוצר ליד כל JSON קובץ `.js` זהה. הסיבה: הפרוטוטיפ נפתח מ-`file://`, ושם הדפדפן לא מרשה
לקרוא קובץ `.json` (fetch חסום), רק `<script>`. כשהמסך יוגש משרת (http) הווידג׳ט קורא את ה-JSON
ישירות וה-.js לא נחוץ.

בדשבורד בעל העסק: `widgets/widget-json-table.html?file=<שם-הקובץ-בלי-json>&title=<כותרת>`,
רשום ב-`js/board.js` (`CATALOG.client` + `BOARDS.client`). קובץ חדש = שורה חדשה שם.
