# -*- coding: utf-8 -*-
"""בונה גרסת HTML אינטראקטיבית לאפיון הג׳וב הלילי.
   המקור נשאר docs/NIGHTLY_COMM_SPEC.md; ה-HTML מטמיע אותו, מאפשר לערוך
   פר סעיף, שומר מקומית, ומייצא חזרה ל-Markdown."""
import os, json
os.chdir('/Users/eyalhazut/Documents/Claude/Projects/hk/mainScreen')
MD = open('docs/NIGHTLY_COMM_SPEC.md').read()
# </script> בתוך תגית script סוגרת אותה — נטרול לפני ההטמעה
MD_SAFE = MD.replace('</script>', '<\\/script>')
OUT = 'docs/NIGHTLY_COMM_SPEC.html'

CSS = r"""
:root{--navy:#0C4068;--navy2:#0A3557;--band:#104A76;--coral:#E8635A;--sky:#39ABE2;
 --ink:#28425C;--ink2:#51677A;--muted:#7A8898;--line:#E6ECF4;--bg:#F4F7FA;
 --onnavy:#9FC0DA;--good:#13895B;--warn:#D9922B;--bad:#C43D30}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Rubik,'Heebo',Arial,sans-serif;background:var(--bg);color:var(--ink);
 direction:rtl;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
 font-size:14px;line-height:1.5}

/* ---------- הרצועה ---------- */
.strip{position:sticky;top:0;z-index:20;height:68px;background:var(--navy);color:#fff;
 display:flex;align-items:center;gap:20px;padding:0 26px;box-shadow:0 2px 12px rgba(12,64,104,.18)}
.strip h1{font-family:'Frank Ruhl Libre',Georgia,serif;font-size:22px;font-weight:700;
 letter-spacing:-.2px;white-space:nowrap}
.strip .sub{font-size:12.5px;color:var(--onnavy);white-space:nowrap}
.strip .sep{width:1px;height:30px;background:rgba(255,255,255,.18)}
.strip .spacer{margin-inline-start:auto}
.saved{font-size:12px;color:var(--onnavy);white-space:nowrap;min-width:118px;text-align:end}
.saved.on{color:#7FD7B0}
.tb{display:flex;gap:8px}
.tb button{font:inherit;font-size:12.5px;font-weight:500;border:1px solid rgba(255,255,255,.22);
 background:rgba(255,255,255,.08);color:#E7EFF7;border-radius:8px;padding:8px 14px;cursor:pointer;
 transition:.14s;white-space:nowrap}
.tb button:hover{background:rgba(255,255,255,.18);color:#fff}
.tb button.pri{background:var(--coral);border-color:var(--coral);color:#fff}
.tb button.pri:hover{background:#D9534A}

/* ---------- פריסה ---------- */
.wrap{display:grid;grid-template-columns:274px minmax(0,1fr);gap:22px;
 max-width:1420px;margin:0 auto;padding:22px 26px 60px;align-items:start}

/* ---------- ניווט ---------- */
.nav{position:sticky;top:90px;background:#fff;border:1px solid var(--line);border-radius:10px;
 box-shadow:0 1px 2px rgba(12,64,104,.04);overflow:hidden}
.nav-h{padding:14px 18px 10px;font-size:12px;font-weight:600;color:var(--muted);
 letter-spacing:.3px;border-bottom:1px solid var(--line)}
.nav-l{padding:8px;max-height:calc(100vh - 220px);overflow-y:auto}
.nav-l a{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;
 font-size:13px;color:var(--ink2);text-decoration:none;line-height:1.4;transition:.12s}
.nav-l a:hover{background:#EAF1F8;color:var(--navy)}
.nav-l a.on{background:#EAF3FA;color:var(--navy);font-weight:600}
.nav-l a.sub{padding-inline-start:24px;font-size:12.5px}
.nav-l a i{flex:none;width:7px;height:7px;border-radius:50%;background:#D3DCE5}
.nav-l a i.ok{background:var(--good)}
.nav-l a i.talk{background:var(--warn)}
.nav-foot{padding:11px 16px;border-top:1px solid var(--line);background:var(--bg);
 font-size:11.5px;color:var(--muted);line-height:1.6}

/* ---------- חלק (כותרת #) ---------- */
.sec.part{background:none;border:0;box-shadow:none;margin:26px 0 14px}
.sec.part .part-h{padding:6px 2px 10px;border-bottom:2px solid var(--navy)}
.sec.part .part-h h2{font-family:'Frank Ruhl Libre',Georgia,serif;font-size:24px;font-weight:700;
 color:var(--navy);letter-spacing:-.3px}
.sec.part:first-child{margin-top:0}
.sec.part .sec-h .ttl{font-family:'Frank Ruhl Libre',Georgia,serif;font-size:19px}
.nav-l a.grp{margin-top:8px;font-weight:700;color:var(--navy);font-size:12.5px;letter-spacing:.2px}
.nav-l a.grp:first-child{margin-top:0}
.nav-l a.grp i{display:none}

/* ---------- סעיף ---------- */
.sec{background:#fff;border:1px solid var(--line);border-radius:10px;margin-bottom:16px;
 box-shadow:0 1px 2px rgba(12,64,104,.04);scroll-margin-top:90px}
.sec.talk{border-color:#F0D9A6}
.sec.ok{border-color:#BFE3CE}
.sec-h{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--line);
 background:#FCFDFE;border-radius:10px 10px 0 0}
.sec-h .num{flex:none;font-size:11.5px;font-weight:700;color:var(--coral);letter-spacing:.3px}
.sec-h .ttl{font-size:15px;font-weight:600;color:var(--navy);min-width:0;flex:1}
.sec-h .acts{display:flex;gap:6px;flex:none}
.sec-h button{font:inherit;font-size:12px;border:1px solid var(--line);background:#fff;
 color:var(--ink2);border-radius:7px;padding:5px 11px;cursor:pointer;transition:.12s;white-space:nowrap}
.sec-h button:hover{border-color:var(--navy);color:var(--navy)}
.sec-h button.on{background:var(--navy);border-color:var(--navy);color:#fff}
.sec-h .st{flex:none;display:flex;gap:4px}
.sec-h .st button.ok.on{background:var(--good);border-color:var(--good)}
.sec-h .st button.talk.on{background:var(--warn);border-color:var(--warn)}
.sec-b{padding:18px 22px 22px}
.sec.edit .sec-b{padding:0}

/* ---------- עורך ---------- */
textarea.ed{display:block;width:100%;min-height:340px;border:0;border-radius:0 0 10px 10px;
 padding:18px 22px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;
 line-height:1.75;color:var(--ink);background:#FBFCFE;resize:vertical;outline:none;direction:rtl}
textarea.ed:focus{background:#fff;box-shadow:inset 0 0 0 2px #CFE3F5}

/* ---------- תגובות ---------- */
.cm{margin:14px 22px 18px;background:var(--bg);border:1px solid var(--line);border-radius:9px;
 padding:12px 14px;display:none}
.sec.cmon .cm{display:block}
.cm label{display:block;font-size:11.5px;font-weight:600;color:var(--coral);margin-bottom:7px}
.cm textarea{width:100%;min-height:70px;font:inherit;font-size:13px;line-height:1.6;color:var(--ink);
 border:1px solid var(--line);border-radius:7px;padding:9px 11px;resize:vertical;outline:none;background:#fff}
.cm textarea:focus{border-color:var(--sky)}

/* ---------- תוכן מרונדר ---------- */
.md h2{font-family:'Frank Ruhl Libre',Georgia,serif;font-size:21px;font-weight:700;color:var(--navy);
 margin:0 0 12px;line-height:1.25}
.md h3{font-size:15.5px;font-weight:600;color:var(--navy);margin:22px 0 9px}
.md h1{display:none}
.md p{margin:0 0 12px;line-height:1.8;color:var(--ink)}
.md b,.md strong{font-weight:600;color:var(--navy)}
.md em{font-style:italic;color:var(--ink2)}
.md a{color:var(--navy);border-bottom:1px solid #C6D9EA;text-decoration:none}
.md ul,.md ol{margin:0 0 13px;padding-inline-start:20px}
.md li{margin-bottom:7px;line-height:1.75}
.md li::marker{color:var(--coral)}
.md code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;
 background:#EEF3F8;color:#12507F;border-radius:4px;padding:1.5px 6px;direction:ltr;
 display:inline-block}
.md pre{background:var(--navy2);color:#DCEBF5;border-radius:9px;padding:15px 18px;overflow-x:auto;
 margin:0 0 14px;direction:ltr;text-align:left}
.md pre code{background:none;color:inherit;padding:0;font-size:12px;line-height:1.65;display:block}
.md blockquote{margin:0 0 14px;padding:11px 15px;background:#EAF3FA;border-radius:8px;
 border-inline-start:3px solid var(--sky);color:var(--ink2);font-size:13.5px;line-height:1.7}
.md blockquote p:last-child{margin:0}
.md hr{border:0;border-top:1px solid var(--line);margin:20px 0}
.md table{width:100%;border-collapse:collapse;margin:0 0 15px;font-size:13px}
.md th{text-align:start;padding:9px 12px;background:#F1F5F9;color:var(--navy);font-weight:600;
 border-bottom:1px solid var(--line);font-size:12.5px}
.md td{padding:9px 12px;border-bottom:1px solid var(--line);color:var(--ink2);line-height:1.65;
 vertical-align:top}
.md tr:last-child td{border-bottom:0}
.md td code{font-size:11.5px}

/* ---------- מצב הדפסה ---------- */
@media print{
 .strip,.nav,.sec-h .acts,.nav-foot{display:none!important}
 body{background:#fff}.wrap{display:block;max-width:none;padding:0}
 .sec{border:0;box-shadow:none;margin-bottom:8px;break-inside:avoid}
 .sec-h{background:none;border-bottom:1px solid var(--line)}
}
@media (max-width:980px){.wrap{grid-template-columns:minmax(0,1fr)}.nav{display:none}}
"""

JS = r"""
/* =====================================================================
   מנוע העריכה. יחידת העריכה היא סעיף: בתצוגה הוא מרונדר, בעריכה הוא
   ה-Markdown הגולמי שלו — כך שהייצוא חוזר למקור בלי אובדן.
   ===================================================================== */
const KEY='hkNightlySpec.v1';
const SRC=document.getElementById('src').textContent;

/* ---------- פיצול לסעיפים לפי ## ---------- */
function split(md){
  const lines=md.split('\n'), secs=[]; let cur={t:'',lv:0,body:[]};
  let fence=false;
  for(const ln of lines){
    if(/^```/.test(ln)) fence=!fence;
    const m=!fence&&ln.match(/^(#{1,3})\s+(.*)$/);
    if(m){ if(cur.t||cur.body.length) secs.push(cur);
      cur={t:m[2].trim(),lv:m[1].length,body:[]}; }
    else cur.body.push(ln);
  }
  if(cur.t||cur.body.length) secs.push(cur);
  if(secs.length&&!secs[0].t){ secs[0].t='פתיח'; secs[0].lv=2; }
  /* שורות --- שנשארו בסוף גוף לפני כותרת חלק — רעש, לא תוכן */
  secs.forEach(s=>{ while(s.body.length&&/^(---+\s*|)$/.test(s.body[s.body.length-1])) s.body.pop(); });
  return secs;
}

/* ---------- רנדור Markdown (התת־קבוצה שהמסמך משתמש בה) ---------- */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function inline(s){
  return esc(s)
    .replace(/`([^`]+)`/g,(m,c)=>'<code>'+c+'</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g,'$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2">$1</a>');
}
function render(md){
  const L=md.split('\n'), out=[]; let i=0;
  const flush=(tag,items)=>out.push('<'+tag+'>'+items.map(x=>'<li>'+inline(x)+'</li>').join('')+'</'+tag+'>');
  while(i<L.length){
    let ln=L[i];
    if(/^```/.test(ln)){                       /* בלוק קוד */
      const lang=ln.slice(3).trim(); i++; const buf=[];
      while(i<L.length&&!/^```/.test(L[i])) buf.push(L[i++]);
      i++; out.push('<pre><code data-lang="'+esc(lang)+'">'+esc(buf.join('\n'))+'</code></pre>');
      continue;
    }
    if(/^\|/.test(ln)){                        /* טבלה */
      const rows=[]; while(i<L.length&&/^\|/.test(L[i])) rows.push(L[i++]);
      const cells=r=>r.replace(/^\||\|$/g,'').split('|').map(c=>c.trim());
      const head=cells(rows[0]); const body=rows.slice(2).map(cells);
      out.push('<table><thead><tr>'+head.map(h=>'<th>'+inline(h)+'</th>').join('')+
        '</tr></thead><tbody>'+body.map(r=>'<tr>'+r.map(c=>'<td>'+inline(c)+'</td>').join('')+
        '</tr>').join('')+'</tbody></table>');
      continue;
    }
    if(/^>\s?/.test(ln)){                      /* ציטוט */
      const buf=[]; while(i<L.length&&/^>\s?/.test(L[i])) buf.push(L[i++].replace(/^>\s?/,''));
      out.push('<blockquote>'+render(buf.join('\n'))+'</blockquote>'); continue;
    }
    if(/^\s*[-*]\s+/.test(ln)){                /* רשימה */
      const buf=[]; while(i<L.length&&/^\s*[-*]\s+/.test(L[i])){
        let it=L[i++].replace(/^\s*[-*]\s+/,'');
        while(i<L.length&&/^\s{2,}\S/.test(L[i])&&!/^\s*[-*]\s+/.test(L[i])) it+=' '+L[i++].trim();
        buf.push(it);
      } flush('ul',buf); continue;
    }
    if(/^\s*\d+\.\s+/.test(ln)){               /* רשימה ממוספרת */
      const buf=[]; while(i<L.length&&/^\s*\d+\.\s+/.test(L[i])){
        let it=L[i++].replace(/^\s*\d+\.\s+/,'');
        while(i<L.length&&/^\s{2,}\S/.test(L[i])&&!/^\s*\d+\.\s+/.test(L[i])) it+=' '+L[i++].trim();
        buf.push(it);
      } flush('ol',buf); continue;
    }
    if(/^---+\s*$/.test(ln)){ out.push('<hr>'); i++; continue; }
    if(/^#{1,4}\s+/.test(ln)){
      const m=ln.match(/^(#+)\s+(.*)$/); out.push('<h'+m[1].length+'>'+inline(m[2])+'</h'+m[1].length+'>');
      i++; continue;
    }
    if(!ln.trim()){ i++; continue; }
    const buf=[];                              /* פסקה */
    while(i<L.length&&L[i].trim()&&!/^(```|\||>|#{1,4}\s|---+\s*$|\s*[-*]\s|\s*\d+\.\s)/.test(L[i]))
      buf.push(L[i++]);
    out.push('<p>'+inline(buf.join(' '))+'</p>');
  }
  return out.join('');
}

/* ---------- מצב ---------- */
let ST = {secs:null, meta:{}};
try{ const raw=localStorage.getItem(KEY); if(raw) ST=JSON.parse(raw); }catch(e){}
const BASE=split(SRC);
if(!ST.secs||ST.secs.length!==BASE.length) ST.secs=BASE.map(s=>s.body.join('\n'));
if(!ST.meta) ST.meta={};

let dirty=false, tmr=null;
function save(){
  try{ localStorage.setItem(KEY,JSON.stringify(ST));
    mark('נשמר '+new Date().toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'}),true);
  }catch(e){ mark('השמירה נכשלה — ייצא לקובץ',false); }
  dirty=false;
}
function mark(t,ok){ const e=document.getElementById('saved');
  e.textContent=t; e.classList.toggle('on',!!ok); }
function touch(){ dirty=true; mark('שינויים לא שמורים…',false);
  clearTimeout(tmr); tmr=setTimeout(save,900); }

/* ---------- בנייה ---------- */
function build(){
  const host=document.getElementById('doc'), nav=document.getElementById('nav');
  host.innerHTML=''; nav.innerHTML='';
  BASE.forEach((s,ix)=>{
    const id='s'+ix, meta=ST.meta[id]||{};
    const el=document.createElement('section');
    const isPart=(s.lv===1), hasBody=!!ST.secs[ix].trim();
    el.className='sec'+(isPart?' part':'')+(meta.st?' '+meta.st:'')+(meta.cm?' cmon':'');
    el.id=id;
    const numMatch=s.t.match(/^([\d]+[א]?)\s*·\s*(.*)$/);
    if(isPart&&!hasBody){
      el.innerHTML='<div class="part-h"><h2>'+esc(s.t)+'</h2></div>';
      host.appendChild(el);
      const a=document.createElement('a'); a.href='#'+id; a.className='grp';
      a.innerHTML='<span>'+esc(s.t)+'</span>'; nav.appendChild(a);
      return;
    }
    el.innerHTML=
      '<div class="sec-h">'+
        (numMatch?'<span class="num">'+esc(numMatch[1])+'</span>':'')+
        '<span class="ttl">'+esc(numMatch?numMatch[2]:s.t)+'</span>'+
        '<span class="st">'+
          '<button class="ok'+(meta.st==='ok'?' on':'')+'" onclick="setSt(\''+id+'\',\'ok\')" title="אושר">אושר</button>'+
          '<button class="talk'+(meta.st==='talk'?' on':'')+'" onclick="setSt(\''+id+'\',\'talk\')" title="דורש דיון">לדיון</button>'+
        '</span>'+
        '<span class="acts">'+
          '<button onclick="tgCm(\''+id+'\')">הערה</button>'+
          '<button class="edb" onclick="tgEd(\''+id+'\')">עריכה</button>'+
        '</span>'+
      '</div>'+
      '<div class="cm"><label>הערה לצוות הפיתוח</label>'+
        '<textarea oninput="setNote(\''+id+'\',this.value)" placeholder="מה צריך לשנות, ולמה">'+
        esc(meta.note||'')+'</textarea></div>'+
      '<div class="sec-b md">'+render(ST.secs[ix])+'</div>';
    host.appendChild(el);

    const a=document.createElement('a');
    a.href='#'+id; a.className=(s.lv===3?'sub':isPart?'grp':'');
    a.innerHTML='<i class="'+(meta.st||'')+'"></i><span>'+esc(s.t)+'</span>';
    nav.appendChild(a);
  });
  spy();
}

/* ---------- פעולות ---------- */
window.tgEd=function(id){
  const el=document.getElementById(id), ix=+id.slice(1);
  const b=el.querySelector('.edb');
  if(el.classList.contains('edit')){
    const ta=el.querySelector('textarea.ed');
    ST.secs[ix]=ta.value; touch();
    el.classList.remove('edit'); b.textContent='עריכה'; b.classList.remove('on');
    const div=document.createElement('div');
    div.className='sec-b md'; div.innerHTML=render(ST.secs[ix]);
    ta.replaceWith(div);
    const a=document.querySelectorAll('#nav a')[ix];
    if(a) a.querySelector('span').textContent=BASE[ix].t;
  }else{
    el.classList.add('edit'); b.textContent='סיום עריכה'; b.classList.add('on');
    const body=el.querySelector('.sec-b');
    const ta=document.createElement('textarea');
    ta.className='ed'; ta.value=ST.secs[ix];
    ta.style.minHeight=Math.max(260,body.offsetHeight)+'px';
    body.replaceWith(ta); ta.focus();
  }
};
window.setSt=function(id,st){
  const m=ST.meta[id]=ST.meta[id]||{};
  m.st = (m.st===st) ? '' : st;
  const el=document.getElementById(id);
  el.classList.remove('ok','talk'); if(m.st) el.classList.add(m.st);
  el.querySelectorAll('.st button').forEach(b=>
    b.classList.toggle('on', b.classList.contains(m.st)&&!!m.st));
  const a=document.querySelectorAll('#nav a')[+id.slice(1)];
  if(a) a.querySelector('i').className=m.st||'';
  touch();
};
window.tgCm=function(id){
  const m=ST.meta[id]=ST.meta[id]||{};
  m.cm=!m.cm; document.getElementById(id).classList.toggle('cmon',m.cm);
  if(m.cm) document.getElementById(id).querySelector('.cm textarea').focus();
  touch();
};
window.setNote=function(id,v){ (ST.meta[id]=ST.meta[id]||{}).note=v; touch(); };

/* ייצוא: מרכיב את ה-Markdown מחדש, והערות שנכתבו נוספות בסוף */
window.exportMd=function(){
  let out=[];
  BASE.forEach((s,ix)=>{
    if(s.t&&s.lv>=1) out.push('#'.repeat(s.lv)+' '+s.t);
    out.push(ST.secs[ix]);
  });
  const notes=BASE.map((s,ix)=>{
    const m=ST.meta['s'+ix]||{};
    if(!m.note&&!m.st) return null;
    return '- **'+s.t+'** — '+(m.st==='ok'?'אושר':m.st==='talk'?'דורש דיון':'—')+
           (m.note?': '+m.note:'');
  }).filter(Boolean);
  if(notes.length) out.push('\n---\n\n## הערות מהסקירה\n\n'+notes.join('\n')+'\n');
  const blob=new Blob([out.join('\n')],{type:'text/markdown;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download='NIGHTLY_COMM_SPEC.md';
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
};
window.resetAll=function(){
  if(!confirmBox()) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  ST={secs:BASE.map(s=>s.body.join('\n')),meta:{}};
  build(); mark('שוחזר למקור',true);
};
/* אין confirm של הדפדפן — שאלה בתוך הדף */
function confirmBox(){
  const w=document.getElementById('cfm');
  w.style.display='flex';
  return false;
}
window.cfmDo=function(yes){
  document.getElementById('cfm').style.display='none';
  if(!yes) return;
  try{ localStorage.removeItem(KEY); }catch(e){}
  ST={secs:BASE.map(s=>s.body.join('\n')),meta:{}};
  build(); mark('שוחזר למקור',true);
};

/* ---------- «איפה אני» בניווט ---------- */
function spy(){
  const links=[...document.querySelectorAll('#nav a')];
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(!e.isIntersecting) return;
      const ix=+e.target.id.slice(1);
      links.forEach((a,i)=>a.classList.toggle('on',i===ix)); });
  },{rootMargin:'-80px 0px -70% 0px',threshold:0});
  document.querySelectorAll('.sec').forEach(s=>io.observe(s));
}

addEventListener('beforeunload',e=>{ if(dirty){ save(); } });
addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='s'){ e.preventDefault(); save(); }
  if(e.key==='Escape') document.getElementById('cfm').style.display='none';
});
build();
mark('נטען','');
"""

HTML = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>אפיון הג׳וב הלילי · HK</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@700&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>

<header class="strip">
  <h1>אפיון הג׳וב הלילי</h1>
  <span class="sep"></span>
  <span class="sub">תקשורת · זיכרון · תקציר הבוקר</span>
  <span class="spacer"></span>
  <span class="saved" id="saved"></span>
  <div class="tb">
    <button onclick="window.print()">הדפסה</button>
    <button onclick="resetAll()">שחזור למקור</button>
    <button class="pri" onclick="exportMd()">ייצוא ל-Markdown</button>
  </div>
</header>

<div class="wrap">
  <aside class="nav">
    <div class="nav-h">סעיפי האפיון</div>
    <div class="nav-l" id="nav"></div>
    <div class="nav-foot">כל סעיף ניתן לעריכה, לסימון «אושר» או «לדיון»,
      ולהוספת הערה. הכל נשמר בדפדפן הזה — הייצוא מחזיר Markdown מלא
      עם ההערות בסוף.</div>
  </aside>
  <main id="doc"></main>
</div>

<div id="cfm" style="display:none;position:fixed;inset:0;z-index:40;background:rgba(12,64,104,.42);
  align-items:center;justify-content:center">
  <div style="background:#fff;border-radius:12px;padding:24px 26px;max-width:420px;
    box-shadow:0 24px 60px rgba(12,64,104,.32)">
    <b style="display:block;font-size:16px;color:#0C4068;margin-bottom:8px">לשחזר למקור?</b>
    <span style="display:block;font-size:13.5px;line-height:1.7;color:#51677A;margin-bottom:18px">
      כל העריכות, הסימונים וההערות שנעשו כאן יימחקו, והמסמך יחזור לגרסה שבקובץ.</span>
    <div style="display:flex;gap:8px;justify-content:flex-start">
      <button onclick="cfmDo(true)" style="font:inherit;font-size:13px;font-weight:600;border:0;
        background:#C43D30;color:#fff;border-radius:8px;padding:9px 18px;cursor:pointer">שחזור</button>
      <button onclick="cfmDo(false)" style="font:inherit;font-size:13px;border:1px solid #E6ECF4;
        background:#fff;color:#51677A;border-radius:8px;padding:9px 18px;cursor:pointer">ביטול</button>
    </div>
  </div>
</div>

<script id="src" type="text/markdown">{MD_SAFE}</script>
<script>{JS}</script>
</body>
</html>
"""

open(OUT, 'w').write(HTML)
print('נוצר:', OUT, '·', len(HTML), 'תווים')
