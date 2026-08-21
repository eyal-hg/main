/* HK Dashboard — widgets CATALOG/BOARDS, board render, drag&drop, picker */
  /* ---- widgets board + picker ---- */
  const CATALOG={
    client:[
      {f:'widget-kpi-balance.html',         t:'יתרה נוכחית עו״ש',   d:'מספר בודד — יתרת עו״ש נוכחית',                 cat:'מספרים',  h:132, s:'sm'},
      {f:'widget-kpi-overdraft.html',       t:'חריגה צפויה',        d:'מספר בודד — סכום החריגה הצפויה',              cat:'מספרים',  h:132, s:'sm'},
      {f:'widget-kpi-profit.html',          t:'רווח גולמי',         d:'מספר בודד — רווח גולמי חודשי',                cat:'מספרים',  h:132, s:'sm'},
      {f:'widget-kpi-debt.html',            t:'חוב / יתרה מול ספק', d:'מספר בודד — חוב מול סונול',                   cat:'מספרים',  h:132, s:'sm'},
      {f:'widget-overdraft-full.html',      t:'חריגה צפויה',        d:'תחזית עו״ש מאוחד — חריגה בטווח 30 ימים',      cat:'תזרים',   h:470},
      {f:'widget-cashflow-full.html',       t:'תחזית תזרים',        d:'פירוט תנועות יומי עם יתרות ואינדיקציית סיכון',  cat:'תזרים',   h:600},
      {f:'widget-flow-changes.html',        t:'מה השתנה בתזרים',    d:'בוחרים נקודה על הציר ורואים מה שינה אותה',      cat:'תזרים',   h:470},
      {f:'widget-budget-gaps.html',         t:'פערי תקציב',        d:'כל החריגות מהיעד — מבוסס על מעקב ופערים',       cat:'תזרים',   h:470},
      {f:'widget-coverage-full.html',       t:'יחס כיסוי',          d:'כיסוי התחייבויות מול נכסים נזילים',            cat:'תזרים',   h:480},
      {f:'widget-profitability-full.html',  t:'רווחיות חודשית',     d:'גולמי, תפעולי ותזרימי עם מגמת 4 חודשים',       cat:'רווחיות', h:500},
      {f:'widget-revenue-trends.html',      t:'מגמות הכנסה',        d:'מגמת הכנסות רב-חודשית',                        cat:'רווחיות', h:470},
      {f:'widget-metric-full.html',         t:'מדד מגמות',          d:'מדד חודשי עם השוואה לחודשים קודמים',           cat:'מדדים',   h:520},
      {f:'widget-leads-full.html',          t:'פירוט מדד מחובר',    d:'חלוקה בין שני מדדים (ממומן / אורגני)',         cat:'מדדים',   h:540},
      {f:'widget-workdays-full.html',       t:'ימי עבודה',          d:'יעד יומי מול ימי עבודה בחודש',                 cat:'מדדים',   h:460},
      {f:'widget-budget-full.html',         t:'תקציב חודשי',        d:'ביצוע מול תקציב לפי סעיף',                     cat:'תקציב',   h:540},
      {f:'widget-budget-control.html',      t:'בקרת תקציב',         d:'חריגות תקציב לפי קטגוריה',                     cat:'תקציב',   h:470},
      {f:'widget-process-full.html',        t:'תהליך ליווי',        d:'שלבי ליווי עסקי עם התקדמות',                   cat:'ליווי',   h:540},
      {f:'widget-next-process.html',        t:'השלב הבא',           d:'השלב הבא בתהליך עם אג׳נדה',                    cat:'ליווי',   h:500},
    ],
    portfolio:[
      {f:'widget-pf-kpi-balance.html',       t:'יתרה מצרפית',            d:'סך יתרות עו״ש לכלל החברות',                    cat:'מספרים', h:160, s:'sm'},
      {f:'widget-pf-kpi-budget.html',        t:'עמידה בתקציב',           d:'כמה חברות בתוך מסגרת התקציב',                  cat:'תקציב',  h:160, s:'sm'},
      {f:'widget-pf-kpi-risk.html',          t:'חברות בסיכון',           d:'חברות שצפויות לחרוג מהתקציב',                  cat:'תקציב',  h:160, s:'sm'},
      {f:'widget-pf-kpi-overdraft.html',     t:'חריגה צפויה מצרפית',     d:'סכום החריגה הצפוי לכלל התיק',                  cat:'מספרים', h:160, s:'sm'},
      {f:'widget-pf-cashflow-budget.html',   t:'בקרת תזרים מול תקציב',   d:'יתרה צפויה מול רצפת התקציב — צבוע בחריגות',     cat:'תזרים',  h:430},
      {f:'widget-pf-alerts.html',            t:'התראות תזרים חכמות',     d:'קישור בין חריגות תקציב לתזרים הצפוי',           cat:'תיק',    h:470},
      {f:'widget-pf-budget-companies.html',  t:'עמידה בתקציב לפי חברה',  d:'ביצוע הוצאות מול התקציב לכל חברה',              cat:'תקציב',  h:400},
      {f:'widget-pf-budget-categories.html', t:'חריגות תקציב לפי קטגוריה',d:'ביצוע מול תקציב לפי סעיף הוצאה',               cat:'תקציב',  h:410},
      {f:'widget-pf-risk-list.html',         t:'חברות בסיכון תזרימי',    d:'צפי חריגה מרצפת התקציב עם מועד וסכום',          cat:'תזרים',  h:340},
      {f:'widget-pf-collections.html',       t:'סטטוס גבייה',            d:'חובות פתוחים לפי גיל — השפעה על התזרים',        cat:'תזרים',  h:440},
      {f:'widget-overdraft-today.html',      t:'לקוחות בחריגה היום',     d:'כל הלקוחות בחריגת מסגרת אשראי נכון להיום',       cat:'תיק',    h:640},
      {f:'widget-cashflow-portfolio.html',   t:'תזרים — תיק לקוחות',     d:'תחזית תזרים מצרפית לכלל החברות',                cat:'תיק',    h:560},
    ],
  };
  let SCOPE='client';
  const BOARDS={
    client:['widget-kpi-balance.html','widget-kpi-overdraft.html','widget-kpi-profit.html','widget-kpi-debt.html','widget-budget-gaps.html','widget-cashflow-full.html','widget-profitability-full.html','widget-metric-full.html'],
    portfolio:['widget-pf-kpi-balance.html','widget-pf-kpi-budget.html','widget-pf-kpi-risk.html','widget-pf-kpi-overdraft.html','widget-pf-cashflow-budget.html','widget-pf-alerts.html','widget-pf-budget-companies.html','widget-pf-risk-list.html','widget-pf-collections.html'],
  };
  const wmeta=f=>CATALOG.client.concat(CATALOG.portfolio).find(w=>w.f===f)||{h:480};
  const rowSpan=h=>Math.max(6,Math.ceil((h+18)/8));
  const SIZE={};  // per-widget width override chosen in edit mode: 'sm' | 'lg'
  const sizeOf=f=>SIZE[f]||(wmeta(f).s==='sm'?'sm':wmeta(f).s==='xl'?'xl':'lg');
  function toggleSize(f){SIZE[f]=sizeOf(f)==='sm'?'lg':'sm';renderBoard();}

  function renderBoard(){
    const active=BOARDS[SCOPE];
    const b=document.getElementById('wboard');
    // portfolio board = ordered rows (pairs), no masonry — keeps the layout tidy at full width
    const rows=(SCOPE==='portfolio');
    b.classList.toggle('rows',rows);
    const top=document.getElementById('wboardTop');
    if(!active.length){b.innerHTML='<div class="wb-empty">אין ווידג\'טים בלוח — לחצו "הוספת ווידג\'ט"</div>';if(top){top.style.display='none';top.innerHTML='';}return;}
    const frame=(f,i)=>{const w=wmeta(f);const sz=sizeOf(f);const sm=sz==='sm';
      return `<div class="wframe loading ${sm?'sm':''} ${sz==='xl'?'xl':''}" data-idx="${i}" draggable="false" ${rows?'':`style="grid-row-end:span ${rowSpan(w.h)}"`}>
        <div class="wf-tools">
          <button class="wf-btn wf-grip" title="גרירה לסידור" aria-label="גרירה"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.6"/><circle cx="15" cy="5" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="19" r="1.6"/><circle cx="15" cy="19" r="1.6"/></svg></button>
          <button class="wf-btn wf-size" title="${sm?'הרחבה לרוחב מלא':'צמצום לחצי רוחב'}" aria-label="רוחב" onclick="toggleSize('${f}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 7 4 12l4 5M16 7l4 5-4 5M4 12h16"/></svg></button>
          <button class="wf-btn wf-x" title="הסרה מהלוח" onclick="removeWidget('${f}')">✕</button>
        </div>
        <iframe loading="lazy" scrolling="no" data-file="${f}" src="widgets/${encodeURI(f)}#embed" style="height:${w.h}px" onload="this.parentElement.classList.remove('loading')"></iframe>
      </div>`;};
    if(SCOPE==='client'&&typeof ROLE!=='undefined'&&ROLE==='manager'){
      // המתפעל לא צריך את קוביות ה-KPI בחברה — נשארים רק הווидג'טים הגדולים
      if(top){top.style.display='none';top.innerHTML='';}
      const lgIx=active.map((f,i)=>i).filter(i=>sizeOf(active[i])!=='sm');
      b.innerHTML=lgIx.map(i=>frame(active[i],i)).join('');
    }else if(SCOPE==='client'&&top){
      // הקטנים (KPI) עולים לקונטיינר העליון — מעל כרטיסי הלקוח; הגדולים נשארים בלוח
      const smIx=active.map((f,i)=>i).filter(i=>sizeOf(active[i])==='sm');
      const lgIx=active.map((f,i)=>i).filter(i=>sizeOf(active[i])!=='sm');
      top.style.display=smIx.length?'grid':'none';
      top.innerHTML=smIx.map(i=>frame(active[i],i)).join('');
      b.innerHTML=lgIx.map(i=>frame(active[i],i)).join('');
    }else{
      if(top){top.style.display='none';top.innerHTML='';}
      b.innerHTML=active.map(frame).join('');
    }
    wireDnD();
  }

  /* edit mode */
  let EDIT=false;
  function toggleEdit(){
    EDIT=!EDIT;
    document.getElementById('wboard').classList.toggle('editing',EDIT);
    const _wt=document.getElementById('wboardTop'); if(_wt)_wt.classList.toggle('editing',EDIT);
    document.getElementById('btnAdd').style.display=EDIT?'flex':'none';
    const be=document.getElementById('btnEdit');
    be.classList.toggle('primary',EDIT);
    be.innerHTML=EDIT
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg> סיום עריכה'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> עריכת לוח';
  }

  /* drag-to-reorder (edit mode only; grip handle; iframes muted while dragging) */
  let dragIdx=null;
  function wireDnD(){
    document.querySelectorAll('#wboard .wframe, #wboardTop .wframe').forEach(el=>{
      const grip=el.querySelector('.wf-grip');
      grip.addEventListener('mousedown',()=>{if(EDIT)el.draggable=true;});
      grip.addEventListener('mouseup',()=>{el.draggable=false;});
      el.addEventListener('dragstart',e=>{
        if(!EDIT){e.preventDefault();return;}
        dragIdx=+el.dataset.idx; el.classList.add('drag-src');
        document.body.classList.add('dragging');
        e.dataTransfer.effectAllowed='move';
        try{e.dataTransfer.setData('text/plain',String(dragIdx));}catch(_){}
      });
      el.addEventListener('dragend',()=>{
        el.draggable=false; el.classList.remove('drag-src');
        document.body.classList.remove('dragging'); clearDrops();
      });
      el.addEventListener('dragover',e=>{
        if(dragIdx===null)return; e.preventDefault(); e.dataTransfer.dropEffect='move';
        if(+el.dataset.idx===dragIdx){clearDrops();return;}
        clearDrops(); el.classList.add(dropBefore(e,el)?'drop-before':'drop-after');
      });
      el.addEventListener('dragleave',()=>el.classList.remove('drop-before','drop-after'));
      el.addEventListener('drop',e=>{
        e.preventDefault();
        const over=+el.dataset.idx;
        if(dragIdx===null||over===dragIdx){clearDrops();return;}
        const arr=BOARDS[SCOPE];
        const item=arr.splice(dragIdx,1)[0];
        let target=over; if(dragIdx<over)target--;
        if(!dropBefore(e,el))target++;
        target=Math.max(0,Math.min(arr.length,target));
        arr.splice(target,0,item);
        dragIdx=null; clearDrops(); renderBoard();
        toast('סדר הווידג\'טים עודכן');
      });
    });
  }
  function dropBefore(e,el){const r=el.getBoundingClientRect();return e.clientY < r.top + r.height/2;}
  function clearDrops(){document.querySelectorAll('#wboard .wframe, #wboardTop .wframe').forEach(x=>x.classList.remove('drop-before','drop-after'));}
  // widgets report their exact height via postMessage (works across file:// sandbox)
  window.addEventListener('message',function(e){
    const d=e.data; if(!d) return;
    /* ווידג'ט מבקש לפתוח מסך — למשל "פתיחת מעקב ופערים" */
    if(d.hk==='tab'&&d.tab){ if(typeof showTab==='function') showTab(d.tab); return; }
    /* חדר הפגישה מדווח גובה — המסגרת נפתחת לכל התוכן */
    if(d.hkMeet&&d.h>200){ const f=document.getElementById('meetFrame'); if(f) f.style.minHeight=d.h+'px'; return; }
    if(d.hkArena&&d.h>200){ const f=document.getElementById('arenaFrame'); if(f) f.style.minHeight=d.h+'px'; return; }
    if(!d.hkEmbed) return;
    const fr=document.querySelector('.wboard iframe[data-file="'+d.src+'"]');
    if(fr&&d.h>60){fr.style.height=d.h+'px';
      const wf=fr.closest('.wframe'), wb=fr.closest('.wboard');
      if(wf&&wb&&!wb.classList.contains('rows')) wf.style.gridRowEnd='span '+rowSpan(d.h);
      fr.parentElement.classList.remove('loading');}
  });
  function removeWidget(f){const a=BOARDS[SCOPE];const i=a.indexOf(f);if(i>=0){a.splice(i,1);renderBoard();toast('הווידג\'ט הוסר');}}

  /* picker */
  function openPicker(){
    document.getElementById('pkScope').textContent = SCOPE==='portfolio' ? '· כלל החברות' : '· '+document.getElementById('headName').textContent;
    document.getElementById('pkQ').value='';
    renderPicker();
    document.getElementById('pkOv').classList.add('show');
    document.getElementById('pk').classList.add('show');
  }
  function closePicker(){document.getElementById('pkOv').classList.remove('show');document.getElementById('pk').classList.remove('show');}
  function renderPicker(){
    const q=(document.getElementById('pkQ').value||'').trim();
    const items=CATALOG[SCOPE].filter(w=>!q||w.t.includes(q)||w.d.includes(q)||w.cat.includes(q));
    const grid=document.getElementById('pkGrid');
    if(!items.length){grid.innerHTML='<div class="wb-empty" style="grid-column:1/-1">לא נמצא ווידג\'ט</div>';return;}
    grid.innerHTML=items.map(w=>{
      const on=BOARDS[SCOPE].includes(w.f);
      return `<div class="pkcard ${on?'added':''}">
        <div class="pkcard-cat">${w.cat}</div>
        <div class="pkcard-title">${w.t}</div>
        <div class="pkcard-desc">${w.d}</div>
        <button class="pkcard-btn" onclick="toggleWidget('${w.f}')">${on?'✓ נוסף ללוח':'+ הוספה'}</button>
      </div>`;
    }).join('');
  }
  function toggleWidget(f){
    const a=BOARDS[SCOPE];const i=a.indexOf(f);
    if(i>=0){a.splice(i,1);toast('הווידג\'ט הוסר');}else{a.push(f);toast('הווידג\'ט נוסף ללוח');}
    renderPicker();renderBoard();
  }

  /* scope: single client vs whole portfolio */
