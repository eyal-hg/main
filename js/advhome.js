/* ===== מסך היועץ — "הבוקר שלך" =====
   נבחר מתוך שלושה עיצובים עצמאיים + שופט. הרעיון: המסך הוא **תדריך**, לא דשבורד —
   כותרת ראשית אחת (הדבר שנולד היום), גרף המסלול שמראה כמה החריגה התקרבה,
   ושרשרת סיבתיות שמחברת את ההתראה לפגישה שממנה נולדה וליומן שבו היא נסגרת.
   הפס החי הוסר — האפליקציה כבר מציגה באנר טרום-פגישה משלה. */
function advHomeHtml(N){
  return `

  <!-- ══ 2 · כותרת + מדדים ══ -->
  <div class="top">
    <div class="pad">
      <div class="mast">
        <div class="mark">HK</div>
        <div>
          <h1>הבוקר שלך</h1>
          <div class="dt">יום חמישי, <span class="num">20</span> באוגוסט · עודכן <span class="num">15:55</span></div>
        </div>
      </div>

      <div class="ix wide">
        <div class="ixin">
          <div class="ixtxt">
            <div class="lbl">סטטוס לקוחות</div>
            <div class="row"><span class="big num">${N.tot}</span><span class="of">לקוחות בתיק</span></div>
            <div class="sub">
              <span><i class="dot d-green"></i> <span class="num">${N.act}</span> פעילים</span>
              <span><i class="dot d-sky"></i> <span class="num">${N.setup}</span> בהקמה</span>
              <span><i class="dot d-grey"></i> <span class="num">${N.arch}</span> בארכיון</span>
            </div>
          </div>
          <div class="map" id="map88" aria-label="מפת 88 הלקוחות, שניים בסיכון"></div>
        </div>
      </div>

      <div class="ix risk">
        <div class="lbl">חברות בסיכון תזרימי</div>
        <div class="row"><span class="big num">${N.risk}</span><span class="of">מתוך <span class="num">${N.tot}</span></span></div>
        <div class="sub"><span><i class="dot d-red"></i> אחת מהן נכנסה לרשימה היום</span></div>
      </div>

      <div class="ix ops">
        <div class="lbl">משימות פתוחות למנהל תזרים</div>
        <div class="row"><span class="big num">${N.ops}</span><span class="of">ממתינות לטיפול</span></div>
        <div class="sub"><span><i class="dot d-sky"></i> באחריות צוות התזרים</span></div>
      </div>

      <div class="ix rad">
        <div class="lbl">רדאר שימור והרחבה</div>
        <div class="row">
          <span class="duo"><b class="num">${N.churn}</b><span class="t">לא מרוצים</span></span>
          <span class="slash">/</span>
          <span class="duo"><b class="num">${N.up}</b><span class="t">מועמד לשדרוג</span></span>
        </div>
        <div class="sub"><span><i class="dot d-purple"></i> שינוי אחד נרשם היום</span></div>
      </div>
    </div>
  </div>

  <!-- ══ 3 · הכותרת הראשית ══ -->
  <div class="hero-wrap">
    <div class="pad">
      <section class="hero">

        <div class="h-main">
          <div class="kick">
            <span class="eyebrow"><i class="dot d-red"></i> הדבר החשוב ביותר עכשיו</span>
            <span class="tag new">חדש — לא היה אתמול</span>
            <span class="tag red">בסיכון תזרימי</span>
            <span class="kt">מהתזרים · לפני <span class="num">20</span> דק׳</span>
          </div>

          <h2>אנרגי אינטרנשיונל תיכנס לחריגה בעו״ש <em>בעוד <span class="num">9</span> ימים</em></h2>

          <p class="deck">
            שלושה שינויים בתזרים הורידו את תחזית היתרה ב־<b><span class="num">32,400 ₪</span></b>
            והקדימו את מועד החריגה מ־<span class="num">12</span> ימים ל־<span class="num">9</span>.
            אתמול הלקוח הזה עוד לא הופיע ברשימת הסיכון.
          </p>

          <div class="facts">
            <div class="fact">
              <div class="fl">השינוי מאתמול</div>
              <div class="fv neg num">-32,400 ₪</div>
            </div>
            <div class="fact">
              <div class="fl">מועד החריגה</div>
              <div class="fv"><span class="num">29.8</span><small>בעוד <span class="num">9</span> ימים</small></div>
            </div>
            <div class="fact">
              <div class="fl">מה הזיז את התאריך</div>
              <div class="fv"><span class="num">3</span> שינויים<small>דחיית תשלום לספק</small></div>
            </div>
          </div>

          <div class="h-acts">
            <button class="btn pri">פתיחת התזרים</button>
            <button class="btn out">מה השתנה (<span class="num">3</span>)</button>
            <button class="btn gh">עדכון ללקוח בוואטסאפ</button>
          </div>
        </div>

        <!-- גרף המסלול -->
        <div class="runway">
          <div class="rt">יתרת העו״ש — <span class="num">14</span> הימים הקרובים</div>
          <svg viewBox="0 0 420 176" role="img" aria-label="תחזית יתרת עובר ושב לארבעה עשר ימים. החריגה ביום התשיעי, לעומת יום שנים עשר בתחזית של אתמול.">
            <defs>
              <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#39ABE2" stop-opacity=".20"/>
                <stop offset="100%" stop-color="#39ABE2" stop-opacity="0"/>
              </linearGradient>
              <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#dc4436" stop-opacity="0"/>
                <stop offset="100%" stop-color="#dc4436" stop-opacity=".26"/>
              </linearGradient>
            </defs>
            <path d="M382,44 C312,56 226,80 152,108 L382,108 Z" fill="url(#gp)"/>
            <path d="M152,108 C108,126 66,140 26,150 L26,108 Z" fill="url(#gn)"/>
            <line x1="20" y1="108" x2="390" y2="108" stroke="#C6D5E2" stroke-width="1" stroke-dasharray="3 4"/>
            <text x="398" y="112" font-size="10.5" fill="#8FA3B6" font-family="Rubik,Arial">0</text>
            <!-- אתמול -->
            <path d="M382,38 C316,45 190,64 76,108 C60,114 43,120 26,125" fill="none" stroke="#B9C7D4"
                  stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round"/>
            <circle cx="76" cy="108" r="3.5" fill="#fff" stroke="#B9C7D4" stroke-width="2"/>
            <text x="70" y="90" font-size="10.5" fill="#8FA3B6" text-anchor="middle" font-family="Rubik,Arial">‏אתמול · יום 12</text>
            <!-- היום -->
            <path d="M382,44 C312,56 226,80 152,108 C108,126 66,140 26,150" fill="none" stroke="#dc4436"
                  stroke-width="2.6" stroke-linecap="round"/>
            <line x1="152" y1="108" x2="152" y2="36" stroke="#dc4436" stroke-width="1" stroke-dasharray="3 4" opacity=".5"/>
            <circle cx="152" cy="108" r="5.5" fill="#fff" stroke="#dc4436" stroke-width="3"/>
            <rect x="107" y="20" width="90" height="21" rx="10.5" fill="#dc4436"/>
            <text x="152" y="34.5" font-size="11.5" fill="#fff" text-anchor="middle" font-family="Rubik,Arial">‏היום · יום 9</text>
            <!-- ציר -->
            <text x="382" y="168" font-size="10.5" fill="#8FA3B6" text-anchor="end" font-family="Rubik,Arial">‏היום</text>
            <text x="204" y="168" font-size="10.5" fill="#8FA3B6" text-anchor="middle" font-family="Rubik,Arial">‏+7 ימים</text>
            <text x="26" y="168" font-size="10.5" fill="#8FA3B6" text-anchor="start" font-family="Rubik,Arial">‏+14</text>
          </svg>
          <div class="rleg">
            <span><i></i>התחזית היום</span>
            <span class="y"><i></i>התחזית אתמול</span>
          </div>
        </div>

        <!-- שרשרת הסיפור -->
        <div class="chain">
          <div class="ct">איך זה נולד · ואיפה זה נסגר</div>

          <div class="cl">
            <span class="cd"></span>
            <div class="c1"><span class="num">09:00</span> · פגישה שוטפת</div>
            <div class="c2">הוקלטה <span class="num">46</span> דק׳</div>
            <div class="aichip">בעיבוד AI <span class="ds"><i></i><i></i><i></i></span></div>
          </div>

          <div class="cl hot">
            <span class="cd"></span>
            <div class="c1"><span class="num">11:05</span> · נולדה ההתראה</div>
            <div class="c2"><span class="tag purple">מהזיכרון</span></div>
            <div class="c2" style="margin-top:5px">מצב תזרימי — צפי החריגה עודכן ל־<span class="num">9</span> ימים במקום <span class="num">12</span>, אחרי דחיית תשלום ספק</div>
          </div>

          <div class="cl">
            <span class="cd"></span>
            <div class="c1"><span class="num">17:00</span> · המשך סקירה</div>
            <div class="c2">כבר ביומן היום — שם נסגור את זה</div>
          </div>
        </div>

      </section>
    </div>
  </div>

  <!-- ══ 4 · שלוש עמודות ══ -->
  <div class="floor">
    <div class="pad">

      <!-- פיד -->
      <div class="col">
        <div class="panel grow hasfoot">
          <div class="ph">
            <h3>דורש את תשומת הלב שלך</h3>
            <span class="c">· עוד <span class="num">6</span> עדכונים אצל <span class="num">3</span> לקוחות</span>
            <div class="filters">
              <button class="fch on" data-f="all">הכל<b class="num">6</b></button>
              <button class="fch" data-f="mem">מהזיכרון<b class="num">4</b></button>
              <button class="fch" data-f="flow">מהתזרים<b class="num">1</b></button>
              <button class="fch" data-f="grp">מהקבוצה<b class="num">1</b></button>
            </div>
          </div>

          <div class="pb" id="feed">

            <article class="th">
              <div class="thh">
                <span class="av g">מג</span>
                <span class="cn">מטעי גבעון</span>
                <span class="meta">· <span class="thc"><span class="num">2</span> עדכונים</span> · חריגת תקציב</span>
                <button class="go">כרטיס הלקוח ←</button>
              </div>
              <div class="it hi" data-f="flow">
                <i class="dot d-amber"></i>
                <div class="body">
                  <div class="l1">חריגת תקציב <span class="hl num">114%</span> מהיעד. מומלץ לשוחח <b>לפני קניות המלאי הבאות</b>.</div>
                  <div class="l2">
                    <span class="cat">תקציב</span>
                    <span class="src flow">מהתזרים</span>
                    <span class="link-cal">שיחת מעקב היום <span class="num">13:00</span></span>
                  </div>
                </div>
                <div class="end"><span class="when">היום <span class="num">09:40</span></span><button class="mini">פתיחת התקציב</button></div>
              </div>
              <div class="it" data-f="mem">
                <i class="dot d-purple"></i>
                <div class="body">
                  <div class="l1">יעד קניות מלאי סומן <span class="hl num">114%</span> מהתקציב החודשי.</div>
                  <div class="l2"><span class="cat">יעדים והסכמות</span><span class="src mem">מהזיכרון</span></div>
                </div>
                <div class="end"><span class="when">היום <span class="num">09:41</span></span><button class="mini">היעדים שלו</button></div>
              </div>
            </article>

            <article class="th">
              <div class="thh">
                <span class="av a">אא</span>
                <span class="cn">אנרגי אינטרנשיונל</span>
                <span class="meta">· <span class="thc"><span class="num">2</span> עדכונים</span> · התמונה הרכה מאחורי הכותרת</span>
                <button class="go">כרטיס הלקוח ←</button>
              </div>
              <div class="it" data-f="mem">
                <i class="dot d-red"></i>
                <div class="body">
                  <div class="l1">נוסף כאב: <b>תלות בלקוח מרכזי</b> — כ־<span class="hlr num">70%</span> מהמחזור.</div>
                  <div class="l2"><span class="cat">כאבי לקוח</span><span class="src mem">מהזיכרון</span></div>
                </div>
                <div class="end"><span class="when">היום <span class="num">11:07</span></span><button class="mini">הכאבים שלו</button></div>
              </div>
              <div class="it" data-f="mem">
                <i class="dot d-amber"></i>
                <div class="body">
                  <div class="l1">ירידה בשביעות הרצון: <b>תסכול מקצב התגובה בוואטסאפ</b>.</div>
                  <div class="l2"><span class="cat">שביעות רצון</span><span class="src mem">מהזיכרון</span><span class="tag purple">רדאר שימור</span></div>
                </div>
                <div class="end"><span class="when">היום <span class="num">11:07</span></span><button class="mini">מענה בוואטסאפ</button></div>
              </div>
            </article>

            <article class="th">
              <div class="thh">
                <span class="av o">אג</span>
                <span class="cn">אנרגי גולני</span>
                <span class="meta">· <span class="thc"><span class="num">2</span> עדכונים</span> · גבייה ושיתוף פעולה</span>
                <button class="go">כרטיס הלקוח ←</button>
              </div>
              <div class="it" data-f="grp">
                <i class="dot d-red"></i>
                <div class="body">
                  <div class="l1">חוב פתוח לגבייה — <b class="num">1,200 ₪</b>.</div>
                  <div class="l2"><span class="cat">גבייה</span><span class="src grp">מהקבוצה</span></div>
                </div>
                <div class="end"><span class="when">אתמול <span class="num">16:30</span></span><button class="mini">פתיחת הגבייה</button></div>
              </div>
              <div class="it" data-f="mem">
                <i class="dot d-green"></i>
                <div class="body">
                  <div class="l1">חומר אחרון לתזרים <b class="num">30.6</b> — דפי בנק התקבלו בוואטסאפ.</div>
                  <div class="l2"><span class="cat">שיתוף פעולה</span><span class="src mem">מהזיכרון</span></div>
                </div>
                <div class="end"><span class="when">אתמול <span class="num">14:12</span></span><button class="mini">פתיחת החומרים</button></div>
              </div>
            </article>

            <div class="empty" id="empty">אין עדכונים בסינון הזה.</div>
          </div>

          <div class="foot">
            <i class="dot d-grey"></i>
            <span>שאר <b><span class="num">85</span> הלקוחות</b> — בלי התראות פתוחות היום.</span>
          </div>
        </div>
      </div>

      <!-- סרגל צד -->
      <div class="side">
        <div class="panel">
          <div class="ph">
            <h3>היומן שלי</h3>
            <span class="c">· <span class="num">4</span> פגישות</span>
            <button class="all">היומן המלא ←</button>
          </div>
          <div class="pb nos">
            <div class="tl">
              <div class="ev past">
                <span class="hr num">09:00</span><span class="pt"></span>
                <div class="bd">
                  <div class="t1">פגישה שוטפת</div>
                  <div class="aichip">הוקלטה <span class="num">46</span> דק׳ · בעיבוד AI <span class="ds"><i></i><i></i><i></i></span></div>
                </div>
              </div>
              <div class="ev past">
                <span class="hr num">13:00</span><span class="pt"></span>
                <div class="bd">
                  <div class="t1">שיחת מעקב · מטעי גבעון</div>
                  <div class="t2">אחרי חריגת התקציב</div>
                </div>
              </div>

              <div class="nowline"><span class="nt num">עכשיו 15:55</span><span class="nl"></span></div>

              <div class="ev next">
                <span class="hr num">16:00</span><span class="pt"></span>
                <div class="bd">
                  <div class="t1">פגישה חודשית Money+</div>
                  <div class="t2">משה עובד · בעוד <span class="num">5</span> דק׳</div>
                </div>
              </div>
              <div class="ev link">
                <span class="hr num">17:00</span><span class="pt"></span>
                <div class="bd">
                  <div class="t1">המשך סקירה</div>
                  <div class="t2"><i class="dot d-red" style="width:6px;height:6px"></i> כאן נסגרת החריגה של אנרגי אינטרנשיונל</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel grow">
          <div class="ph">
            <h3>המשימות שלי</h3>
            <span class="c">· <span class="num" id="tkOpen">6</span> פתוחות</span>
            <button class="all">כל המשימות ←</button>
          </div>
          <div class="pb">
            <div class="tsec">סוגר הכי הרבה במכה אחת</div>
            <div class="tk batch">
              <span class="ck"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <div class="tw">
                <div class="tt">שליחת זמנים לפגישה חודשית</div>
                <div class="ts">משימה אחת שסוגרת <span class="num">37</span> לקוחות</div>
              </div>
              <span class="badge"><span class="bignum num">37</span>לקוחות</span>
            </div>

            <div class="tsec">אישורים</div>
            <div class="tk">
              <span class="ck"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <div class="tw">
                <div class="tt">אישור סיכום פגישה</div>
                <div class="ts">שני סיכומים ממתינים לאישור שלך</div>
              </div>
              <span class="badge num" data-w="2">×2</span>
            </div>
            <div class="tk">
              <span class="ck"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <div class="tw">
                <div class="tt">תיאום מחדש</div>
                <div class="ts">פגישה שנדחתה וממתינה למועד</div>
              </div>
            </div>

            <div class="tsec">מעקבים</div>
            <div class="tk">
              <span class="ck"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <div class="tw">
                <div class="tt">עדכוני וואטסאפ ללקוחות</div>
                <div class="ts">כולל המענה לאנרגי אינטרנשיונל</div>
              </div>
            </div>
            <div class="tk">
              <span class="ck"><svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
              <div class="tw">
                <div class="tt">לחזור לרו״ח</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
`;
}
/* מפת הלקוחות: כל תא = לקוח. אפור = בהקמה/ארכיון, אדום פועם = בסיכון. */
function advHomeInit(N){
  const m=document.getElementById('map88');
  if(m&&!m.childElementCount){
    const cols=22, rows=Math.ceil(N.tot/cols);
    let i=0;
    for(let r=0;r<rows;r++){
      const row=document.createElement('div'); row.className='mr';
      for(let c=0;c<cols&&i<N.tot;c++,i++){
        const el=document.createElement('i');
        if(i>=N.act) el.className='s';
        if(N.riskIx.includes(i)) el.className='r';
        row.appendChild(el);
      }
      m.appendChild(row);
    }
  }
  document.querySelectorAll('.advx .fch').forEach(ch=>{
    ch.addEventListener('click',()=>{
      document.querySelectorAll('.advx .fch').forEach(x=>x.classList.remove('on'));
      ch.classList.add('on');
      const f=ch.dataset.f; let any=false;
      document.querySelectorAll('.advx #feed .th').forEach(th=>{
        let shown=0;
        th.querySelectorAll('.it').forEach(it=>{
          const ok=(f==='all'||it.dataset.f===f);
          it.style.display=ok?'':'none'; if(ok)shown++;
        });
        th.style.display=shown?'':'none';
        const c=th.querySelector('.thc');
        if(c) c.innerHTML = shown===1?'עדכון אחד':'<span class="num">'+shown+'</span> עדכונים';
        if(shown)any=true;
      });
      const e=document.getElementById('empty'); if(e) e.style.display=any?'none':'block';
    });
  });
  const TK=document.querySelectorAll('.advx .tk').length;
  document.querySelectorAll('.advx .tk').forEach(tk=>{
    tk.addEventListener('click',()=>{
      tk.classList.toggle('done');
      let closed=0;
      document.querySelectorAll('.advx .tk.done').forEach(x=>{
        const b=x.querySelector('.badge[data-w]');
        closed += b ? parseInt(b.dataset.w,10) : 1;
      });
      const o=document.getElementById('tkOpen'); if(o) o.textContent=Math.max(0,TK+1-closed);
    });
  });
}
