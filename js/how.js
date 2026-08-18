/* ===== "איך זה עובד" — התרשים שמציגים ליועצים =====
   כל ערוץ מזין זיכרון אחד חי: פגישות, שיחות, קבוצה, תזרים, הצ'אט של
   הלקוח והמתפעל. במרכז — המסך שממנו היועץ עובד. */
const HOW_NODES=[
  {k:'meet', l:'פגישות',              x:20, y:9,  ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 11a7 7 0 0 1-14 0M12 18v4M8.5 22h7"/></svg>'},
  {k:'call', l:'שיחות טלפון',          x:80, y:9,  ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3h4l2 5-2.5 1.5a13 13 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3z"/></svg>'},
  {k:'grp',  l:'קבוצת<br>הוואטסאפ',    x:9,  y:50, ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.9-.9L3 21l1.9-5.5A8.4 8.4 0 1 1 21 11.5z"/><circle cx="9" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="12.5" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="11.5" r=".9" fill="currentColor" stroke="none"/></svg>'},
  {k:'flow', l:'התזרים',              x:91, y:50, ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V9M10 20V4M16 20v-7M22 20H2"/></svg>'},
  {k:'ai',   l:'הצ׳אט של<br>הלקוח עם ה-AI', x:20, y:91, ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M8 2.5h8"/><circle cx="9" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1.1" fill="currentColor" stroke="none"/></svg>'},
  {k:'mgr',  l:'מנהל התזרים',          x:80, y:91, ic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/></svg>'},
];
const HOW_CHECKS=[
  'מקליט ומתמלל כל פגישה — סיכום נשלח ללקוח אחרי אישור שלך',
  'הכנה כתובה לפני כל פגישה: מה קרה, מה כואב, ובמה לפתוח',
  '<b>סים ייעודי של HK שאפשר לתת ליועצים</b> — כל שיחה שמתנהלת ממנו מוקלטת ונכנסת לזיכרון הלקוח, בלי שתצטרך לעשות כלום',
];
function renderHowView(){
  const el=document.getElementById('howView'); if(!el) return;
  const lines=HOW_NODES.map(n=>`<line x1="${n.x}" y1="${n.y}" x2="50" y2="50" stroke="#E8A8A0" stroke-width=".35"
      stroke-dasharray="1.6 1.4" stroke-linecap="round"/>`).join('');
  const nodes=HOW_NODES.map(n=>`<div class="how-node" style="inset-inline-start:${100-n.x}%;top:${n.y}%">
      <span class="hn-ic">${n.ic}</span><span class="hn-l">${n.l}</span></div>`).join('');
  el.innerHTML=`<div class="howv">
    <div class="how-copy">
      <h1 class="how-ttl">מתעד, זוכר,<br><em>ומכין אותך.</em></h1>
      <p class="how-p">כל פגישה, שיחת טלפון, הודעה בקבוצה ותנועה בתזרים — נאספים לזיכרון אחד חי של הלקוח.
        לפני כל פגישה ה-AI כותב לך הכנה, ואתה יכול לשאול אותו כל שאלה — הוא עונה מתוך הזיכרון והמספרים.</p>
      <ul class="how-ck">${HOW_CHECKS.map(c=>`<li><i>✓</i><span>${c}</span></li>`).join('')}</ul>
      <div class="how-box">
        <div class="hb-t">שותף בכיר, זמין 24/7</div>
        <div class="hb-s">״מה מגמת ההכנסות שלו מול הרווח הגולמי?״, ״מה הסיכון אצל דני?״, ״על מה לשים דגש בפגישה?״
          — וה-AI עונה לך מתוך כל הזיכרון והמספרים. כאילו יש לך CFO צמוד לכל תיק.</div>
      </div>
    </div>
    <div class="how-diagram">
      <svg class="how-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>
      <div class="how-hub">
        <div class="hh-screen">
          <div class="hh-bar"><i></i><i></i><i></i></div>
          <div class="hh-body">
            <div class="hh-kpis">${[1,2,3,4].map(()=>'<span></span>').join('')}</div>
            <div class="hh-chart">${[38,62,48,74,56,88].map(h=>`<i style="height:${h}%"></i>`).join('')}</div>
            <div class="hh-cols">
              <div class="hh-col">${[100,86,92,70,80,60].map(w=>`<i style="width:${w}%"></i>`).join('')}</div>
              <div class="hh-col">${[92,74,88,64,78].map(w=>`<i style="width:${w}%"></i>`).join('')}</div>
            </div>
          </div>
        </div>
      </div>
      ${nodes}
    </div>
  </div>`;
}
