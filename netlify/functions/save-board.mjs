// שמירת לוח המשימות (board/data.js) מהדפדפן ישירות ל-GitHub — commit אחד.
// אימות: סיסמת הלוח (BOARD_PASSWORD). כתיבה: GITHUB_TOKEN (Fine-grained, Contents: write, לריפו הזה בלבד).
// שני המשתנים ב-Netlify → Site configuration → Environment variables. אותו דפוס כמו save-registry במונדיי.
import { createHash, timingSafeEqual } from "node:crypto";

const REPO   = process.env.GITHUB_REPO   || "eyal-hg/main";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const MAX    = 2 * 1024 * 1024;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
const sha  = s => createHash("sha256").update(String(s)).digest();
const same = (a, b) => { const x = sha(a), y = sha(b); return x.length === y.length && timingSafeEqual(x, y); };

function clean(board) {
  if (!board || typeof board !== "object") throw new Error("board חסר");
  const screens = Array.isArray(board.screens) ? board.screens : [];
  if (!screens.length || screens.length > 100) throw new Error("screens: ריק או גדול מדי");
  const S = s => String(s == null ? "" : s).slice(0, 4000);
  const item = it => ({ id: S(it.id).slice(0, 40), kind: ["spec","todo","fix","check"].includes(it.kind) ? it.kind : "fix",
    title: S(it.title).slice(0, 300), what: S(it.what), need: S(it.need), sev: S(it.sev).slice(0, 20), dev: S(it.dev).slice(0, 40),
    who: S(it.who).slice(0, 60), status: it.status === "done" ? "done" : "open", imgA: S(it.imgA).slice(0, 200), capA: S(it.capA).slice(0, 300),
    imgB: S(it.imgB).slice(0, 200), capB: S(it.capB).slice(0, 300), created: S(it.created).slice(0, 30), updated: S(it.updated).slice(0, 30),
    log: (Array.isArray(it.log) ? it.log : []).slice(0, 50).map(l => ({ when: S(l.when).slice(0, 30), who: S(l.who).slice(0, 40), ev: S(l.ev).slice(0, 20), txt: S(l.txt).slice(0, 1000), ...(l.via ? { via: S(l.via).slice(0, 80) } : {}) })),
    ask: it.ask && typeof it.ask === "object" ? { who: S(it.ask.who).slice(0, 40), txt: S(it.ask.txt).slice(0, 1000), when: S(it.ask.when).slice(0, 30) } : null,
    back: it.back && typeof it.back === "object" ? { kind: S(it.back.kind).slice(0, 10), dev: S(it.back.dev).slice(0, 40), sev: S(it.back.sev).slice(0, 20), what: S(it.back.what), need: S(it.back.need) } : undefined });
  return { version: Number(board.version) || 1, updated: S(board.updated).slice(0, 40), devs: (Array.isArray(board.devs) ? board.devs : []).map(d => S(d).slice(0, 40)).slice(0, 10),
    screens: screens.map(sc => ({ key: S(sc.key).slice(0, 40), name: S(sc.name).slice(0, 120), task: S(sc.task).slice(0, 200), asana: S(sc.asana).slice(0, 300),
      proto: S(sc.proto).slice(0, 200), items: (Array.isArray(sc.items) ? sc.items : []).slice(0, 300).map(item) })) };
}

async function gh(token, path, init = {}, raw = false) {
  const r = await fetch(`https://api.github.com${path}`, { ...init,
    headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28",
               "content-type": "application/json", ...(init.headers || {}) } });
  if (raw) { if (!r.ok) throw new Error(`GitHub ${r.status} ב-${path}`); return await r.text(); }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`GitHub ${r.status} ב-${path}: ${body.message || ""}`);
  return body;
}
async function commitFiles(token, files, message) {
  const ref  = await gh(token, `/repos/${REPO}/git/ref/heads/${BRANCH}`);
  const head = ref.object.sha;
  const base = await gh(token, `/repos/${REPO}/git/commits/${head}`);
  const tree = [];
  for (const [path, content] of Object.entries(files)) {
    const b = await gh(token, `/repos/${REPO}/git/blobs`, { method: "POST", body: JSON.stringify({ content, encoding: "utf-8" }) });
    tree.push({ path, mode: "100644", type: "blob", sha: b.sha });
  }
  const t = await gh(token, `/repos/${REPO}/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: base.tree.sha, tree }) });
  const c = await gh(token, `/repos/${REPO}/git/commits`, { method: "POST",
    body: JSON.stringify({ message, tree: t.sha, parents: [head], author: { name: "hk-board", email: "info@hak.co.il" } }) });
  await gh(token, `/repos/${REPO}/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: c.sha, force: false }) });
  return c.sha;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST בלבד" });
  const token = process.env.GITHUB_TOKEN, pass = process.env.BOARD_PASSWORD;
  if (!token || !pass) return json(501, { error: "השמירה לא מוגדרת עדיין: חסר GITHUB_TOKEN או BOARD_PASSWORD ב-Netlify" });
  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX) return json(413, { error: "גדול מדי" });
  let body; try { body = await req.json(); } catch { return json(400, { error: "JSON לא תקין" }); }
  if (!same(body.password || "", pass)) return json(401, { error: "סיסמה שגויה" });
  if (body.action === "check") return json(200, { ok: true });   // כניסה לממשק — בדיקת סיסמה בלבד
  if (body.action === "load") {   // הלוח קורא את הגרסה האחרונה מגיט — בלי לחכות לפריסה, ובלי לבנות בכלל
    try {
      const f = await gh(token, `/repos/${REPO}/contents/board/data.js?ref=${BRANCH}`, { headers: { accept: "application/vnd.github.raw+json" } }, true);
      const m = String(f).match(/window\.HK_BOARD\s*=\s*(\{[\s\S]*\});?\s*$/);
      if (!m) throw new Error("data.js לא בפורמט הצפוי");
      return json(200, { ok: true, board: JSON.parse(m[1]) });
    } catch (e) { return json(502, { error: e.message }); }
  }
  let board; try { board = clean(body.board); } catch (e) { return json(422, { error: e.message }); }
  const when = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  board.updated = when;
  const content = "/* לוח המשימות — נשמר מהמסך " + when + " */\nwindow.HK_BOARD = " + JSON.stringify(board, null, 1) + ";\n";
  try {
    const sha = await commitFiles(token, { "board/data.js": content }, `לוח המשימות — נשמר מהמסך ${when}${body.who ? " · " + String(body.who).slice(0, 40) : ""}`);
    return json(200, { ok: true, commit: sha.slice(0, 7), when });
  } catch (e) { return json(502, { error: e.message }); }
};
export const config = { path: "/api/save-board" };
