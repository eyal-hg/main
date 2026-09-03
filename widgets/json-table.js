/* =====================================================================
   hkJsonTable — ספריית הרינדור של "טבלה מ-JSON". קובץ אחד, בלי תלויות.
   קלט: JSON בפורמט שרת הווידג׳טים (types + rows [+ received_at] [+ view]) — docs/WIDGET_JSON_CONTRACT.md
   שימוש:   hkJsonTable.render(containerElement, json, {title:'…'})
            hkJsonTable.render(el, jsonString)           // גם מחרוזת
   מחזיר:   {reload(json), destroy()}
   הספרייה מזריקה <style> אחד (id="hk-json-table-css") לעמוד; אפשר להביא את ה-CSS מ-hkJsonTable.css.
   הווידג׳ט הוא חצי מסך — הריווח מכוון לזה. גופן: Rubik (או fallback של העמוד).
   ===================================================================== */
(function(root){
  var CSS = "  .w,.w *{box-sizing:border-box;margin:0;padding:0}\n  .w{font-family:'Rubik',sans-serif;color:var(--ink)}\n\n  :root{--navy:#0C4068;--cyan:#39ABE2;--warm:#E48375;--ink:#28425C;--ink2:#51677A;--gray:#818181;--faint:#9AA7BB;\n    --line:#E6ECF2;--tint:#EEF5FB;--tint2:#F7FAFD;--bad:#C43D30;--shadow:0px 1px 50px rgba(0,0,0,0.08)}\n  .w{background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);overflow:hidden}\n  /* ראש: כותרת + \"עודכן\" מימין, חיפוש ו-CSV משמאל */\n  .hd{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--line)}\n  .hd h2{font-size:16px;font-weight:600;color:var(--navy);letter-spacing:-.2px;display:flex;align-items:center;gap:9px;white-space:nowrap;flex:none}\n  .hd h2::before{content:\"\";width:4px;height:18px;border-radius:99px;background:var(--cyan)}\n  .hd .sub{font-size:12px;color:var(--gray)}\n  .hd .at{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;color:var(--ink2);background:var(--tint2);\n    border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-variant-numeric:tabular-nums}\n  .hd .at svg{color:var(--faint)}\n  .hd .sp{flex:1}\n  .hd .q{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:#fff;transition:.15s}\n  .hd .q:focus-within{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(57,171,226,.15)}\n  .hd .q svg{color:var(--faint);flex:none}\n  .hd .q input{border:0;background:none;font:inherit;font-size:12.5px;width:160px;outline:none;color:var(--ink)}\n  .hd .q input::placeholder{color:var(--faint)}\n  .csv{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:#fff;color:var(--ink2);font:inherit;\n    font-size:12px;font-weight:600;border-radius:999px;padding:6px 13px;cursor:pointer;transition:.15s}\n  .csv svg{color:var(--faint)}\n  .csv:hover{border-color:var(--navy);color:var(--navy)}\n  .csv:hover svg{color:var(--navy)}\n  /* הטבלה: העמודה הראשונה נושאת את הרוחב, המספרים צמודים לתוכן שלהם */\n  .tw{overflow:auto;max-height:440px;scrollbar-width:thin;scrollbar-color:transparent transparent}\n  .tw:hover{scrollbar-color:#CBD6E2 transparent}\n  .tw::-webkit-scrollbar{width:7px;height:7px}\n  .tw::-webkit-scrollbar-track{background:transparent}\n  .tw::-webkit-scrollbar-thumb{background:transparent;border-radius:99px}\n  .tw:hover::-webkit-scrollbar-thumb{background:#CBD6E2}\n  table{width:100%;border-collapse:separate;border-spacing:0;font-size:13.5px}\n  th{position:sticky;top:0;z-index:1;background:var(--tint);color:var(--navy);font-weight:600;font-size:12px;letter-spacing:.1px;\n    text-align:start;padding:10px 18px;border-bottom:1px solid #D8E6F1;white-space:nowrap;cursor:pointer;user-select:none;transition:.12s}\n  th:hover{background:#E3EFF8}\n  th .ar{display:inline-block;width:0;height:0;margin-inline-start:6px;border-inline-start:4px solid transparent;\n    border-inline-end:4px solid transparent;border-top:5px solid var(--faint);vertical-align:2px;opacity:0;transition:.12s}\n  th:hover .ar{opacity:.5}\n  th.on .ar{opacity:1;border-top-color:var(--navy)}\n  th.on.asc .ar{transform:rotate(180deg)}\n  th.num,td.num,th.ltr,td.ltr,th.sta,td.sta,th.tx,td.tx{width:1%;white-space:nowrap}\n  td.tx{padding-inline-end:34px}\n  th.num,td.num,td.ltr{text-align:end}\n  td{padding:11px 18px;border-bottom:1px solid #EEF2F6;color:var(--ink);white-space:nowrap;max-width:360px;overflow:hidden;text-overflow:ellipsis}\n  td:first-child{font-weight:500;color:var(--navy)}\n  td.num,td.ltr{font-variant-numeric:tabular-nums;direction:ltr;unicode-bidi:isolate}\n  td.ltr{color:var(--ink2)}\n  td .cur{color:var(--faint);font-size:11px;margin-inline-end:2px}\n  td .neg{color:var(--bad)}\n  tbody tr:nth-child(even) td{background:#FBFCFE}\n  tbody tr:hover td{background:#F2F8FD}\n  /* שורת הסה״כ דביקה לתחתית — נראית גם כשהטבלה גוללת בתוך עצמה */\n  tr.tot td{position:sticky;bottom:0;z-index:1;background:var(--tint);font-weight:700;color:var(--navy);border-top:2px solid #C9DAE8;border-bottom:0;padding:12px 18px}\n  tr.tot td:first-child{font-weight:600}\n  tr.tot td:first-child small{font-weight:400;color:var(--ink2);margin-inline-start:6px;font-size:11.5px}\n  tr.tot .avg{display:block;font-size:9.5px;font-weight:400;color:var(--gray);line-height:1.2}\n  .chip{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;border-radius:999px;padding:3px 10px 3px 11px;line-height:1.4}\n  .chip::before{content:\"\";width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.75}\n  .chip.g{background:#E7F7EF;color:#0B6E4B}.chip.b{background:#E1F0FA;color:#14618F}.chip.r{background:#FDECEB;color:#C43D30}.chip.n{background:#EEF2F6;color:#5A6B7C}\n  .chip.a{background:#FFF4E0;color:#8A5A00}.chip.v{background:#E3EDF6;color:var(--navy)}\n  /* צבעי ערך לפי view.columns[].color / rules */\n  .c-r{color:#C43D30}.c-g{color:#0B6E4B}.c-b{color:#14618F}.c-a{color:#B4700A}.c-n{color:#7A8898}.c-v{color:var(--navy);font-weight:600}\n  td .unit{font-size:11px;color:var(--faint);margin-inline-start:3px}\n  td .lnk{color:#14618F;text-decoration:none;border-bottom:1px solid #BFD8EA}\n  td .lnk:hover{color:var(--navy);border-bottom-color:var(--navy)}\n  td .bar{display:block;height:4px;border-radius:99px;background:#EEF2F6;margin-top:4px;overflow:hidden;direction:rtl}\n  td .bar b{display:block;height:100%;border-radius:99px;background:#39ABE2}\n  td .bar.r b{background:#C43D30}td .bar.g b{background:#0B6E4B}td .bar.a b{background:#E1A23A}td .bar.n b{background:#9AA7BB}td .bar.v b{background:var(--navy)}\n  tr.rc-r td{background:#FFF6F5}tr.rc-a td{background:#FFFAF0}tr.rc-g td{background:#F3FBF6}tr.rc-b td{background:#F2F8FD}\n  td.al-s{text-align:start}td.al-c{text-align:center}\n  th.fz,td.fz{position:sticky;inset-inline-start:0;background:#fff;z-index:2;box-shadow:-1px 0 0 var(--line)}\n  th.fz{z-index:3;background:var(--tint)}\n  .ft{display:flex;align-items:center;gap:12px;padding:9px 20px;font-size:11.5px;color:var(--gray);border-top:1px solid var(--line);background:#fff}\n  .ft b{font-weight:600;color:var(--ink2)}\n  .ft .sp{flex:1}\n  .st{padding:34px 18px;text-align:center;color:var(--gray);font-size:13px;line-height:1.6}\n  .st b{display:block;color:var(--navy);font-weight:600;margin-bottom:3px}\n  .st.err b{color:var(--bad)}\n  .st code{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--ink2);background:#F4F7FA;border-radius:6px;padding:1px 6px}\n";
  function ensureCss(){ if(document.getElementById('hk-json-table-css')) return;
    var st=document.createElement('style'); st.id='hk-json-table-css'; st.textContent=CSS; document.head.appendChild(st); }

  function create(W, OPTS){
    OPTS=OPTS||{};
  var NF=new Intl.NumberFormat('he-IL'), NF2=new Intl.NumberFormat('he-IL',{maximumFractionDigits:2});
    /* דוגמה = הקובץ מסעיף 03 באפיון השרת (haviv / payment_terms), בתוספת שורה עם ערך חסר */
    var DEMO={received_at:'2026-09-03T09:00:12+03:00',
      view:{title:'תנאי תשלום',subtitle:'haviv · דוגמה לחוזה view',sort:{by:'חויב',dir:'desc'},
        columns:{'גבייה':{decimals:1,bar:{max:100,color:'green'},rules:[{lt:50,color:'red'},{lt:90,color:'amber'},{gte:90,color:'green'}]},
                 'ימים בפועל':{unit:'ימים',color:{pos:'gray'}},'חויב':{footer:'sum'},'שולם':{footer:'sum'},'גבייה ':{}},
        row_color:{col:'סטטוס',map:{'באיחור':'red'}}},
      types:{'לקוח':'text','מספר חשבונית':'text','חויב':'money','שולם':'money','ימים בפועל':'number','תאריך אחרון לתשלום':'date','סטטוס':'status','גבייה':'percent'},
      rows:[{'לקוח':'אופטיקנה','מספר חשבונית':'5023509','חויב':424891,'שולם':397751,'ימים בפועל':14,'תאריך אחרון לתשלום':'2026-09-03','סטטוס':'פתוח','גבייה':93.6},
            {'לקוח':'אופטיסטור.נט','מספר חשבונית':'5023508','חויב':44869,'שולם':31913,'ימים בפועל':16,'תאריך אחרון לתשלום':'2026-09-10','סטטוס':'פתוח','גבייה':71.1},
            {'לקוח':'אופטיקנה','מספר חשבונית':'5023491','חויב':12400,'שולם':12400,'ימים בפועל':9,'תאריך אחרון לתשלום':'2026-08-28','סטטוס':'שולם','גבייה':100},
            {'לקוח':'אופטיסטור.נט','מספר חשבונית':'5023470','חויב':-3150,'שולם':null,'ימים בפועל':41,'תאריך אחרון לתשלום':'2026-07-30','סטטוס':'באיחור','גבייה':0}]};
    var STATUS={'סגור':'g','שולם':'g','הושלמה':'g','פתוח':'b','מחכה לתשלום':'b','בביצוע':'b','באיחור':'r','באיחור לא שולם':'r','טיוטה':'n','מבוטל':'n','לא נשלחה':'n'};
    /* צבעים בשם בלבד — זו הפלטה של המוצר. השרת לא שולח hex. */
    var COLOR={red:'r',green:'g',blue:'b',amber:'a',gray:'n',navy:'v'};
    var V={};   /* בלוק view מה-JSON (docs/WIDGET_JSON_CONTRACT.md) */
    var TYPES=['text','number','money','date','percent','status'];
  
    var S={cols:[],rows:[],title:'',sub:'',sortK:null,asc:true,q:'',search:false,total:false,at:'',cur:'₪',csv:true,freeze:false,rowColor:null};
  
    function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function isNum(v){return typeof v==='number'&&isFinite(v)}
    function isDate(v){return typeof v==='string'&&/^\d{4}-\d{2}-\d{2}/.test(v)&&!isNaN(Date.parse(v))}
    function guessType(key,rows){
      var vals=rows.map(function(r){return r[key]}).filter(function(v){return v!=null&&v!==''});
      if(!vals.length) return 'text';
      if(vals.every(isNum)){
        if(/pct|percent|אחוז|%/i.test(key)) return 'percent';
        if(/sum|amount|total|balance|price|cost|target|actual|gap|₪|סכום|יתרה|יעד|בפועל|פער|חריגה|הכנס|הוצא|תשלום|חוב/i.test(key)) return 'money';
        return 'number';
      }
      if(vals.every(isDate)) return 'date';
      return 'text';
    }
    function nfd(v,d){ return new Intl.NumberFormat('he-IL',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v); }
    /* צבע לערך לפי הגדרת העמודה: color:{neg,pos,zero} או rules:[{lt|lte|gt|gte|eq, color}] */
    function colorOf(v,c){
      if(!c||!isNum(v)) return '';
      var k=null;
      if(c.rules) c.rules.some(function(r){ var ok=('lt' in r&&v<r.lt)||('lte' in r&&v<=r.lte)||('gt' in r&&v>r.gt)||('gte' in r&&v>=r.gte)||('eq' in r&&v===r.eq); if(ok){k=r.color;return true} });
      else if(c.color){ k=v<0?c.color.neg:v>0?c.color.pos:c.color.zero; }
      return k?(' c-'+(COLOR[k]||'n')):'';
    }
    function fmt(v,t,c){
      c=c||{};
      if(v==null||v==='') return '<span style="color:var(--faint)">—</span>';
      var unit=c.unit?'<span class="unit">'+esc(c.unit)+'</span>':'';
      if(t==='money'){ var cur=c.currency||S.cur, d=c.decimals!=null?c.decimals:0;
        return '<span class="'+(v<0?'neg':'')+colorOf(v,c)+'">'+(v<0?'-':'')+'<span class="cur">'+esc(cur)+'</span>'+nfd(Math.abs(v),d)+'</span>'+bar(v,c); }
      if(t==='percent'){ var d2=c.decimals!=null?c.decimals:(Math.abs(v)%1?1:0); return '<span class="'+colorOf(v,c)+'">'+(v<0?'-':'')+nfd(Math.abs(v),d2)+'%</span>'+bar(v,c); }
      if(t==='number'){ var d3=c.decimals!=null?c.decimals:0; return '<span class="'+colorOf(v,c)+'">'+(v<0?'-':'')+nfd(Math.abs(v),d3)+unit+'</span>'+bar(v,c); }
      if(t==='status'){ var k=(c.colors&&c.colors[v])?COLOR[c.colors[v]]:STATUS[v]; return '<span class="chip '+(k||'n')+'">'+esc(v)+'</span>'; }
      if(t==='text'&&c.link){ var href=c.link.replace(/\{([^}]+)\}/g,function(_,key){return encodeURIComponent(fmt._row&&fmt._row[key]!=null?fmt._row[key]:'')}); return '<a class="lnk" href="'+esc(href)+'" target="_blank" rel="noopener">'+esc(v)+'</a>'; }
      if(t==='date'){var d=new Date(v);return d.getDate().toString().padStart(2,'0')+'.'+(d.getMonth()+1).toString().padStart(2,'0')+'.'+d.getFullYear()}
      return esc(v);
    }
    /* פס קטן מתחת למספר — bar:{max, color} */
    function bar(v,c){ if(!c.bar||!isNum(v)) return ''; var max=c.bar.max||c._max||1, w=Math.max(0,Math.min(100,Math.abs(v)/max*100));
      return '<i class="bar '+(COLOR[c.bar.color]||'b')+'"><b style="width:'+w.toFixed(1)+'%"></b></i>'; }
  
    function load(json){
      var data=json;
      if(typeof data==='string'){ try{data=JSON.parse(data)}catch(e){return fail('ה-JSON לא תקין',e.message)} }
      var rows,cols,types=null;
      if(Array.isArray(data)){ rows=data; S.title=''; S.sub=''; S.at=''; S.search=true; S.total=true; cols=null; }
      else if(data&&typeof data==='object'){
        rows=data.rows||data.data||data.items||[];
        if(!Array.isArray(rows)) return fail('לא נמצאה רשימת שורות','צפוי מערך ב-rows, או מערך ברמה העליונה');
        if(data.types&&typeof data.types==='object'){ types=data.types;
          var bad=Object.keys(types).filter(function(k){return TYPES.indexOf(types[k])<0});
          if(bad.length) return fail('טיפוס לא מוכר','types.'+bad[0]+' = "'+types[bad[0]]+'" · המותרים: '+TYPES.join(' · ')); }
        V=(data.view&&typeof data.view==='object')?data.view:{};
        S.title=V.title||data.title||(OPTS.title||''); S.sub=V.subtitle||data.subtitle||''; S.at=data.received_at||'';
        S.search=V.search!==false&&data.search!==false; S.total=V.total!==false&&data.total!==false; S.csv=V.csv!==false;
        S.cur=V.currency||'₪'; S.freeze=!!V.freeze_first; S.rowColor=V.row_color||null;
        cols=data.columns||null;
      } else return fail('קלט לא מזוהה','צפוי מערך של אובייקטים או אובייקט עם rows');
      if(!rows.length){ S.rows=[]; S.cols=[]; return render(); }
      if(!cols){ var seen=[]; rows.forEach(function(r){Object.keys(r||{}).forEach(function(k){if(seen.indexOf(k)<0)seen.push(k)})}); cols=seen.map(function(k){return {key:k,label:k.replace(/_/g,' ')}}); }
      var VC=V.columns||{};
      S.cols=cols.map(function(c){var cfg=VC[c.key]||{}; var t=cfg.type||c.type||(types?(types[c.key]||'text'):guessType(c.key,rows));
        if(cfg.chip&&t==='text') t='status';
        return {key:c.key,label:cfg.label||c.label||c.key,type:t,cfg:cfg,hidden:!!cfg.hidden,
                num:t==='number'||t==='money'||t==='percent',ltr:t!=='text'&&t!=='status',
                foot:cfg.footer||(V.footer||{})[c.key]||null}}).filter(function(c){return !c.hidden});
      /* bar בלי max → המקסימום של העמודה */
      S.cols.forEach(function(c){ if(c.cfg.bar&&!c.cfg.bar.max){ var m=0; rows.forEach(function(r){ if(isNum(r[c.key])) m=Math.max(m,Math.abs(r[c.key])) }); c.cfg._max=m||1; } });
      if(V.column_order){ var ord=V.column_order; S.cols.sort(function(a,b){var ia=ord.indexOf(a.key),ib=ord.indexOf(b.key);return (ia<0?999:ia)-(ib<0?999:ib)}); }
      S.rows=rows; S.q='';
      S.sortK=null; S.asc=true;
      if(V.sort&&V.sort.by&&S.cols.some(function(c){return c.key===V.sort.by})){ S.sortK=V.sort.by; S.asc=(V.sort.dir!=='desc'); }
      render();
    }
    function fail(t,d){ W.innerHTML='<div class="st err"><b>'+esc(t)+'</b>'+esc(d||'')+'</div>'; if(OPTS.onRender) OPTS.onRender(); }
  
    function render(){
      var rows=S.rows.slice();
      if(S.q){var q=S.q.toLowerCase();rows=rows.filter(function(r){return S.cols.some(function(c){return (c.type==='text'||c.type==='status')&&String(r[c.key]==null?'':r[c.key]).toLowerCase().indexOf(q)>=0})})}
      if(S.sortK){var c=S.cols.filter(function(x){return x.key===S.sortK})[0];
        rows.sort(function(a,b){var x=a[S.sortK],y=b[S.sortK];if(x==null)return 1;if(y==null)return -1;
          var r=c.num?(x-y):String(x).localeCompare(String(y),'he');return S.asc?r:-r})}
      var h='';
      var at=''; if(S.at){var d=new Date(S.at); if(!isNaN(d)) at='עודכן '+String(d.getDate()).padStart(2,'0')+'.'+String(d.getMonth()+1).padStart(2,'0')+'.'+d.getFullYear()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
      if(S.title||S.search||at||S.csv){
        h+='<div class="hd">'+(S.title?'<h2>'+esc(S.title)+'</h2>':'')+(S.sub?'<span class="sub">'+esc(S.sub)+'</span>':'')+(at?'<span class="at"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'+at+'</span>':'')+'<span class="sp"></span>'+
          (S.search?'<label class="q"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" placeholder="חיפוש" value="'+esc(S.q)+'"></label>':'')+
          (S.csv?'<button class="csv" id="csv" type="button" title="הורדת CSV של מה שמוצג"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>CSV</button>':'')+'</div>';
      }
      if(!S.cols.length){ h+='<div class="st"><b>אין נתונים להצגה</b>שלחו JSON דרך <code>?src=</code> או <code>postMessage({hkJson})</code></div>'; W.innerHTML=h; if(OPTS.onRender) OPTS.onRender(); return; }
      var cols=S.cols;
      h+='<div class="tw"><table><thead><tr>'+cols.map(function(c,i){
        return '<th class="'+(c.num?'num ':c.type==='status'?'sta ':c.ltr?'ltr ':(i>0?'tx ':''))+(i===0&&S.freeze?'fz ':'')+(S.sortK===c.key?'on '+(S.asc?'asc':'desc'):'')+'" data-k="'+esc(c.key)+'">'+esc(c.label)+'<i class="ar"></i></th>'}).join('')+'</tr></thead><tbody>';
      if(!rows.length) h+='<tr><td colspan="'+cols.length+'" class="st">אין שורות שמתאימות ל״'+esc(S.q)+'״</td></tr>';
      var rc=S.rowColor;
      rows.forEach(function(r){ fmt._row=r;
        var tint=(rc&&rc.col&&rc.map&&rc.map[r[rc.col]])?' class="rc-'+(COLOR[rc.map[r[rc.col]]]||'n')+'"':'';
        h+='<tr'+tint+'>'+cols.map(function(c,i){var al=c.cfg.align==='start'?' al-s':c.cfg.align==='center'?' al-c':'';
          return '<td class="'+(c.num?'num':c.type==='status'?'sta':c.ltr?'ltr':(i>0?'tx':''))+al+(i===0&&S.freeze?' fz':'')+'"'+(i===0&&c.type==='text'?' title="'+esc(r[c.key])+'"':'')+'>'+fmt(r[c.key],c.type,c.cfg)+'</td>'}).join('')+'</tr>'; });
      fmt._row=null;
      if(S.total&&rows.length){ h+='<tr class="tot">'+cols.map(function(c,i){
        var mode=c.foot||(i===0?'label':(c.type==='money'||c.type==='number')?'sum':c.type==='percent'?'avg':'none');
        if(mode==='label') return '<td'+(S.freeze?' class="fz"':'')+'>סה״כ<small>'+rows.length+' שורות</small></td>';
        if(mode==='none') return '<td></td>';
        var vs=rows.map(function(r){return r[c.key]}).filter(isNum), val=null, lab='';
        if(mode==='sum') val=vs.reduce(function(a,b){return a+b},0);
        else if(mode==='avg'){ val=vs.length?vs.reduce(function(a,b){return a+b},0)/vs.length:null; lab='ממוצע'; }
        else if(mode==='min'){ val=vs.length?Math.min.apply(null,vs):null; lab='מינימום'; }
        else if(mode==='max'){ val=vs.length?Math.max.apply(null,vs):null; lab='מקסימום'; }
        else if(mode==='count'){ return '<td class="num">'+rows.filter(function(r){return r[c.key]!=null&&r[c.key]!==''}).length+'<small class="avg">מונה</small></td>'; }
        var cfg2={}; for(var k in c.cfg){cfg2[k]=c.cfg[k]} delete cfg2.bar; delete cfg2.color; delete cfg2.rules;
        return '<td class="num">'+(val==null?'':fmt(val,c.type==='status'||c.type==='text'||c.type==='date'?'number':c.type,cfg2)+(lab?'<small class="avg">'+lab+'</small>':''))+'</td>'}).join('')+'</tr>'; }
      h+='</tbody></table></div>';
      h+='<div class="ft"><span>מוצגות <b>'+rows.length+'</b> מתוך '+S.rows.length+'</span><span class="sp"></span>'+(S.sortK?'<span>ממוין לפי '+esc((S.cols.filter(function(x){return x.key===S.sortK})[0]||{}).label)+'</span>':'')+'</div>';
      S.view=rows;
      W.innerHTML=h;
      W.querySelectorAll('th').forEach(function(th){th.addEventListener('click',function(){var k=th.dataset.k;if(S.sortK===k)S.asc=!S.asc;else{S.sortK=k;S.asc=true}render()})});
      var csv=W.querySelector('#csv'); if(csv) csv.addEventListener('click',downloadCsv);
  
      var q=W.querySelector('#q'); if(q){q.addEventListener('input',function(){S.q=q.value;var pos=q.selectionStart;render();var q2=W.querySelector('#q');if(q2){q2.focus();q2.setSelectionRange(pos,pos)}})}
      if(OPTS.onRender) OPTS.onRender();
    }
  
    /* ---- CSV של מה שמסונן, UTF-8 עם BOM כדי שאקסל יפתח עברית ---- */
    function downloadCsv(){
      var rows=S.view||[]; var cell=function(v){v=v==null?'':String(v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
      var lines=[S.cols.map(function(c){return cell(c.label)}).join(',')].concat(rows.map(function(r){return S.cols.map(function(c){return cell(r[c.key])}).join(',')}));
      var blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(S.title||'table').replace(/[^\w\u0590-\u05FF ]+/g,'_')+'.csv'; document.body.appendChild(a); a.click(); a.remove();
    }
  
  
    return { reload:load, destroy:function(){ W.innerHTML=''; } };
  }

  root.hkJsonTable={
    css:CSS,
    render:function(el,json,opts){ ensureCss(); el.classList.add('w'); var api=create(el,opts||{}); api.reload(json); return api; }
  };
})(window);
