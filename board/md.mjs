// המשימות מהלוח, בטרמינל, בלי להוריד קובץ. אותו MD שהלוח מוריד.
//   node board/md.mjs עידו        כל מה שעל עידו, מסך-מסך
//   node board/md.mjs 86          פריט אחד לפי המספר
//   node board/md.mjs owner-dash  מסך אחד (המפתח של המסך)
// קודם: git pull — הלוח נשמר לגיט בכל סימון.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "data.js"), "utf8");
const B = JSON.parse(src.match(/window\.HK_BOARD\s*=\s*(\{[\s\S]*\});?\s*$/)[1]);
const KINDS = [["spec","אפיון"],["todo","נשאר לפתח"],["fix","תיקונים"],["check","בדיקות"]];
const EV = {built:"נבנה",failed:"נכשל",passed:"נבדק",spec:"אופיין",question:"Reject",answer:"תשובה",reopened:"נפתח מחדש",reported:"דווח",moved:"הועבר",reply:"תשובה לתמיכה",closed:"נסגר"};
const open = it => it.status !== "done";
const arg = (process.argv[2] || "").trim();
if (!arg) { console.error("שימוש: node board/md.mjs <שם מתכנת | מספר פריט | מפתח מסך>"); process.exit(1); }
const L = [];
const item = it => {
  L.push(`### #${it.n || ""} · ${it.title}${it.sev ? `  \n*חומרה: ${it.sev}*` : ""}${it.dev ? `  \n*על: ${it.dev}*` : ""}`);
  if (it.what) L.push(`\n**${it.kind === "check" ? "מה בודקים ואיך" : it.kind === "fix" ? "היום בסטייג׳ינג" : "מה חסר"}:** ${it.what}`);
  if (it.need) L.push(`\n**${it.kind === "spec" ? "מה צריך להחליט" : "צריך להיות"}:** ${it.need}`);
  if (it.imgA) L.push(`\nצילום (סטייג׳ינג): board/${it.imgA}${it.capA ? " — " + it.capA : ""}`);
  if (it.imgB) L.push(`\nצילום (פרוטוטיפ): board/${it.imgB}${it.capB ? " — " + it.capB : ""}`);
  if (it.log?.length) L.push("\nהיסטוריה: " + it.log.map(l => `${l.when} ${l.who} ${EV[l.ev] || l.ev}${l.txt ? ": " + l.txt : ""}`).join(" | "));
  L.push("");
};
const screen = (s, items, lvl) => {
  if (!items.length) return;
  L.push(`${lvl} ${s.name} (${items.length})`, "");
  if (s.task) L.push("האפיון המלא: " + s.task);
  if (s.proto) L.push("הפרוטוטיפ: " + s.proto);
  L.push("");
  for (const [k, name] of KINDS) { const l = items.filter(it => it.kind === k); if (!l.length) continue; L.push(`${lvl}# ${name} (${l.length})`, ""); l.forEach(item); }
};
const head = t => L.push(`# ${t} (${B.updated || ""})`, "", "לפני שמתחילים: לקרוא את docs/AI-GUIDE.md — מה אייל רוצה, מה אסור, והכרעות שכבר נפלו.", "");
if (/^#?\d+$/.test(arg)) {
  const n = +arg.replace("#", "");
  for (const s of B.screens) for (const it of s.items) if (it.n === n) { head(`#${n} · ${it.title}`); L.push(`מסך: ${s.name}${s.task ? " · האפיון המלא: " + s.task : ""}${s.proto ? " · הפרוטוטיפ: " + s.proto : ""}`, ""); item(it); }
  if (!L.length) { console.error("אין פריט #" + n); process.exit(1); }
} else if (B.screens.some(s => s.key === arg)) {
  const s = B.screens.find(x => x.key === arg); head(`${s.name} — מה נשאר`); screen(s, s.items.filter(open), "#");
} else if ((B.devs || []).includes(arg)) {
  head(`מה על ${arg}`);
  const pinned = []; B.screens.forEach(s => s.items.forEach(it => { if (open(it) && it.dev === arg && it.pin) pinned.push(it); }));
  if (pinned.length) { L.push("## קודם כל", ""); pinned.forEach(item); }
  B.screens.forEach(s => screen(s, s.items.filter(it => open(it) && it.dev === arg && !it.pin), "##"));
} else { console.error("לא מכיר: " + arg + ". מתכנתים: " + (B.devs || []).join(", ") + ". מסכים: " + B.screens.map(s => s.key).join(", ")); process.exit(1); }
process.stdout.write(L.join("\n") + "\n");
