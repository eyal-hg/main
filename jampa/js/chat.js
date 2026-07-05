/* Jampa — chat: ליווי המטופל בין פגישות (וואטסאפ) בטאב הצ'אט */
function renderChat(){
  const p=PATIENTS[CUR];
  const b=document.getElementById('chatBody');
  b.innerHTML=(p.chat.length?p.chat:[{from:'jampa',auto:true,t:'עוד לא נשלחו הודעות ליווי ל'+p.name+'. Jampa תתחיל ללוות לפי ההגדרות שלך.',when:''}])
    .map(m=>{
      const hk=m.from==='jampa';
      return `<div class="cmsg ${hk?'':'user'}" style="align-self:${hk?'flex-start':'flex-end'};max-width:78%">
        <div class="cb" style="background:${hk?'var(--blue-bg)':'#fff'};border:1px solid var(--line);border-radius:14px;padding:10px 14px;font-size:13.5px;line-height:1.6;color:var(--ink)">
          <div style="font-size:11px;font-weight:600;color:var(--blue);margin-bottom:3px">${hk?'Jampa · ליווי אוטומטי':p.name}</div>
          ${m.t}
          <div style="font-size:10px;color:var(--muted);margin-top:4px;text-align:left">${m.when||''}</div>
        </div></div>`;}).join('');
  b.scrollTop=b.scrollHeight;
  p.unread=0; renderRail();
}
function chatSend(){
  const inp=document.getElementById('chatInput'); const v=inp.value.trim(); if(!v) return;
  PATIENTS[CUR].chat.push({from:'jampa',t:v,when:'עכשיו'});
  inp.value=''; renderChat(); toast('נשלח למטופל בוואטסאפ');
}
