/* =====================================================================
   board/audit.js — מדידת מסך בסטייג׳ינג מול css/tokens.css.
   מריצים בקונסול של הדפדפן על המסך הפתוח (או דרך javascript_tool):
     (await import('https://dev.hak.co.il/board/audit.js')).default()
   או מדביקים את הקובץ כמו שהוא. מחזיר רשימת סטיות: מה נמדד, מה צריך,
   ואיפה (selector). זה מה שנכנס ללוח כתיקונים אחרי #90.
   מודד רק מה ש-tokens.css מגדיר: צבעים, גופן, סקאלת גדלים, מידות רכיבים.
   ===================================================================== */
export default function audit(opts = {}) {
  const T = {
    font: 'Heebo',
    fs: [28, 22, 19, 17, 14, 13, 12.5, 12, 11.5, 27],            // סקאלה סגורה (+27 למספר חי)
    colors: { navy: '#0c4068', navy2: '#104a76', coral: '#e4826e', coral2: '#d96a55', danger: '#c43d30', dangerText: '#dc4436',
      sky: '#39abe2', link: '#14618f', ok: '#13895b', okBg: '#e7f7ef', warn: '#c98404', warnBg: '#fff6e6', infoBg: '#e8f4fb',
      ink: '#12263a', ink2: '#44566a', ink3: '#7a8898', bg: '#f6f8fb', panel: '#ffffff', chip: '#f0f4f8', rowOn: '#eef6fc', line: '#e3eaf3', line2: '#cbd6e2',
      white: '#ffffff', black: '#000000', onNavy: '#dcebf5', onNavy2: '#9fc0da', tint: '#eaf3fa' },
    btnH: 37, btnSmH: 28, inputH: 45, rowH: 44, pillR: 999, panelR: [10, 14], ctlR: [6, 10], lineW: 1,
    purpleHue: [255, 300],                                          // אין סגול
  };
  const hex = c => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); if (!m) return null; if (m[4] !== undefined && +m[4] === 0) return 'transparent';
    return '#' + [m[1], m[2], m[3]].map(n => (+n).toString(16).padStart(2, '0')).join(''); };
  const hue = h => { if (!h || h.length !== 7) return null; const r = parseInt(h.slice(1, 3), 16) / 255, g = parseInt(h.slice(3, 5), 16) / 255, b = parseInt(h.slice(5, 7), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < .12) return null; let hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh = Math.round(hh * 60); return hh < 0 ? hh + 360 : hh; };
  const known = new Set(Object.values(T.colors));
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const sel = el => { let s = el.tagName.toLowerCase(); if (el.id) return s + '#' + el.id; const c = [...el.classList].slice(0, 2).join('.'); if (c) s += '.' + c; const p = el.parentElement; return p && p !== document.body ? sel(p).split(' > ').slice(-1)[0] + ' > ' + s : s; };
  const txt = el => (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const out = [];
  const add = (kind, el, got, want, note) => out.push({ kind, where: sel(el), text: txt(el), got, want, note: note || '' });
  const root = opts.root ? document.querySelector(opts.root) : document.body;
  const all = [...root.querySelectorAll('*')].filter(vis);

  /* 1. גופן */
  const bodyFont = getComputedStyle(document.body).fontFamily;
  if (!/heebo/i.test(bodyFont)) add('font', document.body, bodyFont, T.font, 'גופן ברירת המחדל');

  /* 2. גדלי גופן מחוץ לסקאלה (על אלמנטים עם טקסט ישיר) */
  const fsSeen = {};
  all.forEach(el => { if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const fs = parseFloat(getComputedStyle(el).fontSize); const ok = T.fs.some(v => Math.abs(v - fs) < .3);
    if (!ok) { fsSeen[fs] = (fsSeen[fs] || 0) + 1; if (fsSeen[fs] <= 3) add('font-size', el, fs + 'px', T.fs.join(' / '), 'מחוץ לסקאלה'); } });
  Object.keys(fsSeen).forEach(k => { if (fsSeen[k] > 3) out.push({ kind: 'font-size', where: '(' + fsSeen[k] + ' אלמנטים)', text: '', got: k + 'px', want: T.fs.join(' / '), note: 'מחוץ לסקאלה — חוזר על עצמו' }); });

  /* 3. צבעים לא מהפלטה + סגול */
  const colSeen = {};
  all.forEach(el => { const cs = getComputedStyle(el);
    [['color', cs.color], ['background', cs.backgroundColor], ['border', cs.borderTopColor]].forEach(([k, v]) => {
      const h = hex(v); if (!h || h === 'transparent') return; if (k === 'border' && parseFloat(cs.borderTopWidth) === 0) return;
      const hu = hue(h); if (hu !== null && hu >= T.purpleHue[0] && hu <= T.purpleHue[1]) { add('purple', el, h, '—', k + ': סגול. אין סגול'); return; }
      if (!known.has(h)) { const key = k + ':' + h; colSeen[key] = (colSeen[key] || 0) + 1; if (colSeen[key] <= 2) add('color', el, h, 'מהפלטה', k + ' לא מהפלטה'); } }); });
  Object.keys(colSeen).forEach(key => { if (colSeen[key] > 2) out.push({ kind: 'color', where: '(' + colSeen[key] + ' אלמנטים)', text: '', got: key.split(':')[1], want: 'מהפלטה', note: key.split(':')[0] + ' לא מהפלטה — חוזר על עצמו' }); });

  /* 4. כפתורים: גובה, גלולה, קורל אחד לפאנל */
  const btns = all.filter(el => el.matches('button, [role=button], a.btn, .btn, input[type=submit]'));
  const coralByPanel = new Map();
  btns.forEach(b => { const cs = getComputedStyle(b), r = b.getBoundingClientRect(); const h = Math.round(r.height); const bg = hex(cs.backgroundColor);
    const iconOnly = r.width <= 44 && !txt(b);
    if (!iconOnly && ![T.btnH, T.btnSmH].some(v => Math.abs(v - h) <= 2)) add('btn-h', b, h + 'px', T.btnH + ' / ' + T.btnSmH, 'גובה כפתור');
    if (!iconOnly && parseFloat(cs.borderTopLeftRadius) < 14 && r.width > 44) add('btn-r', b, cs.borderTopLeftRadius, 'גלולה (999)', 'רדיוס כפתור');
    if (bg === T.colors.coral || bg === T.colors.coral2) { const p = b.closest('section, article, .panel, [class*=panel], [class*=card]') || root; coralByPanel.set(p, (coralByPanel.get(p) || 0) + 1); } });
  coralByPanel.forEach((n, p) => { if (n > 1) add('coral-many', p, n + ' כפתורי קורל', '1', 'קורל = פעולה ראשית אחת לפאנל'); });

  /* 5. שדות קלט */
  all.filter(el => el.matches('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=file]), select, textarea')).forEach(i => {
    const h = Math.round(i.getBoundingClientRect().height); if (i.tagName === 'SELECT') add('native-select', i, 'select', 'בורר מותאם', 'אין select נייטיב');
    if (i.tagName !== 'TEXTAREA' && Math.abs(h - T.inputH) > 3 && Math.abs(h - 30) > 3) add('input-h', i, h + 'px', T.inputH + ' (או 30 לחיפוש קטן)', 'גובה שדה'); });

  /* 6. שורות טבלה ומספר עמודות */
  all.filter(el => el.matches('table')).forEach(t => { const cols = t.querySelector('tr') ? t.querySelector('tr').children.length : 0; if (cols > 6) add('table-cols', t, cols + ' עמודות', '≤ 6', 'לצמצם, לא לגלול');
    const tr = t.querySelector('tbody tr'); if (tr) { const h = Math.round(tr.getBoundingClientRect().height); if (Math.abs(h - T.rowH) > 4) add('row-h', tr, h + 'px', T.rowH + 'px', 'גובה שורה'); }
    if (t.scrollWidth > t.clientWidth + 2) add('table-scroll', t, 'גלילה אופקית', 'ללא', 'לא גוללים אופקית'); });

  /* 7. גבולות עבים, צללים כבדים, גרדיאנטים */
  all.forEach(el => { const cs = getComputedStyle(el); const bw = parseFloat(cs.borderTopWidth);
    if (bw > 1.6 && cs.borderTopStyle === 'solid' && !el.matches('input, button, [role=button]') && hex(cs.borderTopColor) !== T.colors.coral) add('border-w', el, bw + 'px', '1px', 'גבול עבה');
    if (/gradient/.test(cs.backgroundImage) && !/repeating/.test(cs.backgroundImage)) add('gradient', el, 'gradient', 'צבע אחיד', 'אין גרדיאנטים');
    const sh = cs.boxShadow; if (sh && sh !== 'none') { const m = sh.match(/rgba?\([^)]*,\s*([\d.]+)\)/); if (m && +m[1] > .3) add('shadow', el, sh.slice(0, 40), 'צל עדין', 'צל כבד'); } });

  /* 8. בלוקים נייבי בגוף הדף (מותר אחד) */
  const navyBlocks = all.filter(el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return hex(cs.backgroundColor) === T.colors.navy && r.width > 300 && r.height > 40 && !el.closest('header, nav, aside'); });
  const topNavy = navyBlocks.filter(el => !navyBlocks.some(o => o !== el && o.contains(el)));
  if (topNavy.length > 1) add('navy-many', root, topNavy.length + ' בלוקים', '1', 'בלוק נייבי אחד בגוף הדף: ' + topNavy.map(sel).join(' | '));

  /* 9. טקסט מערכת גולמי */
  all.forEach(el => { const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ');
    if (/[{}\[\]]\s*"|\*\*|^\s*\|.*\|\s*$|undefined|NaN|null|requires unrestricted/.test(t)) add('raw-text', el, t.trim().slice(0, 50), '—', 'טקסט מערכת גולמי'); });

  /* 10. חפיפות בין פקדים */
  const ctl = all.filter(el => el.matches('button, input, select, a.btn')).slice(0, 300);
  for (let i = 0; i < ctl.length; i++) for (let j = i + 1; j < ctl.length; j++) { if (ctl[i].contains(ctl[j]) || ctl[j].contains(ctl[i])) continue;
    const a = ctl[i].getBoundingClientRect(), b = ctl[j].getBoundingClientRect();
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ox > 6 && oy > 6) add('overlap', ctl[i], 'חופף ל-' + sel(ctl[j]), 'ללא חפיפה', 'אלמנט על אלמנט'); }

  /* סיכום */
  const byKind = {}; out.forEach(o => { byKind[o.kind] = (byKind[o.kind] || 0) + 1; });
  const md = ['# מדידה: ' + location.pathname + ' (' + new Date().toLocaleString('he-IL') + ')', '', ...Object.keys(byKind).map(k => '- ' + k + ': ' + byKind[k]), '',
    ...out.map(o => '- **' + o.kind + '** `' + o.where + '`' + (o.text ? ' "' + o.text + '"' : '') + ' — נמדד: ' + o.got + ' · צריך: ' + o.want + (o.note ? ' · ' + o.note : ''))].join('\n');
  try { console.table(out); } catch (e) {}
  return { count: out.length, byKind, items: out, md };
}
