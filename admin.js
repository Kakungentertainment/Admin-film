const FB_CFG={databaseURL:"https://film-3f570-default-rtdb.asia-southeast1.firebasedatabase.app/"};
firebase.initializeApp(FB_CFG);
const db=firebase.database();

let DATA={},INBOX={},ANN={},pendFn=null;
const ALL_GENRES=[
  {g:'Aksi',items:['Action','Adventure','Thriller','War','Western','Superhero']},
  {g:'Fiksi',items:['Sci-Fi','Fantasy','Supernatural','Mecha','Isekai','Psychological']},
  {g:'Drama',items:['Drama','Comedy','Romance','Horror','Mystery','Crime','Heist','Gangster','Dubbing']},
  {g:'Anime',items:['Shounen','Shoujo','Seinen','Josei','Slice of Life','Harem']},
  {g:'Keluarga',items:['Family','Edukasi','Lagu Anak','Legenda']},
  {g:'Non-Fiksi',items:['Dokumenter','Biografi','Sejarah','Berita','Olahraga','Sport','Religi','Musikal','Game','Talk Show','Reality Show','Variety']}
];

function esc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function showAlert(t,m){
  document.getElementById('alertTitle').textContent=t;
  document.getElementById('alertMsg').textContent=m;
  document.getElementById('alertBtns').innerHTML='<button class="abtn ok" onclick="closeAlert()">Oke</button>';
  document.getElementById('alertMask').classList.add('on');
}
function showConfirm(t,m,fn){
  document.getElementById('alertTitle').textContent=t;
  document.getElementById('alertMsg').textContent=m;
  pendFn=fn;
  document.getElementById('alertBtns').innerHTML='<button class="abtn cancel" onclick="closeAlert()">Batal</button><button class="abtn danger" onclick="execPend()">Lanjutkan</button>';
  document.getElementById('alertMask').classList.add('on');
}
function execPend(){if(pendFn)pendFn();closeAlert()}
function closeAlert(){document.getElementById('alertMask').classList.remove('on');pendFn=null}

db.ref('movies').on('value',snap=>{
  DATA=snap.val()||{};
  Object.entries(DATA).forEach(([k,v])=>{if(v)v._key=k});
  renderAdminList();
});
db.ref('inbox').on('value',snap=>{
  INBOX=snap.val()||{};
  renderInboxList();
  updateInboxBadge();
});
db.ref('announcements').on('value',snap=>{
  ANN=snap.val()||{};
  renderAnnAdmin();
});

function toggleDD(id){
  const e=document.getElementById(id);
  const v=e.style.display==='block';
  closeAllDropdowns();
  if(!v)e.style.display='block';
}
function closeAllDropdowns(e){
  if(!e||!e.target.closest('.csw'))document.querySelectorAll('.cso').forEach(d=>d.style.display='none');
}
function selOpt(iid,val,lbl,tid,did){
  document.getElementById(iid).value=val;
  document.getElementById(tid).innerHTML=lbl+' <span style="font-size:.6rem;color:var(--txt3)">▼</span>';
  closeAllDropdowns();
  if(iid==='addType')toggleEpField();
}
function toggleEpField(){
  const t=document.getElementById('addType').value;
  document.getElementById('fldMovie').style.display=t==='movie'?'block':'none';
  document.getElementById('fldSeries').style.display=t==='series'?'block':'none';
  document.getElementById('fldLive').style.display=t==='livetv'?'block':'none';
  if(t==='livetv')selOpt('addCat','Live TV','Live TV','trigCat','ddCat');
  if(t==='series'&&!document.getElementById('seasonCon').innerHTML)addSeason();
}
function buildGenreCBGrid(cid,name){
  const c=document.getElementById(cid);if(!c)return;
  let h='';
  ALL_GENRES.forEach(grp=>{
    h+=`<div class="genre-sec-lbl">${grp.g}</div>`;
    grp.items.forEach(it=>h+=`<label class="genre-cb"><input type="checkbox" name="${name}" value="${esc(it)}"> ${esc(it)}</label>`);
  });
  c.innerHTML=h;
}
function addSeason(){
  const con=document.getElementById('seasonCon'),si=con.children.length;
  const d=document.createElement('div');d.className='ep-grp';
  d.innerHTML=`<div class="ep-grp-head"><div style="display:flex;align-items:center;gap:8px"><div class="ep-grp-num">${si+1}</div><input type="text" class="ai season-name" placeholder="Nama Season" style="margin:0;flex:1"></div><button class="btn-rm" onclick="this.closest('.ep-grp').remove()">Hapus</button></div><div class="ep-con"></div><button onclick="addEpToSeason(this)" style="width:100%;padding:7px;font-size:.65rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--txt3);border:1px solid var(--line2);background:none;cursor:pointer;margin-top:6px">+ Episode</button>`;
  con.appendChild(d);
  addEpToSeason(d.querySelector('.ep-con').parentElement.querySelector('button'));
}
function addEpToSeason(btn,embedVal,dlVal){
  const ec=btn.closest('.ep-grp').querySelector('.ep-con'),i=ec.children.length+1;
  const w=document.createElement('div');
  w.style.cssText='display:flex;flex-direction:column;gap:4px;margin-bottom:10px;padding:8px;border:1px solid var(--line)';
  const dl1080=typeof dlVal==='object'?dlVal['1080p']||'':dlVal||'';
  const dl720=typeof dlVal==='object'?dlVal['720p']||'':'';
  w.innerHTML=`<div style="display:flex;align-items:center;gap:6px"><span style="font-size:.65rem;font-weight:700;color:var(--txt3);white-space:nowrap;width:40px;flex-shrink:0">Ep ${i}</span><input type="text" class="ai ep-link" placeholder="Link embed ep ${i}" style="margin:0;flex:1" value="${esc(embedVal||'')}"><button onclick="this.closest('div[style]').remove()" class="btn-rm">✕</button></div><div style="display:flex;align-items:center;gap:6px;padding-left:46px"><span style="font-size:.58rem;font-weight:700;color:var(--txt3);flex-shrink:0;width:34px">1080p</span><input type="text" class="ai ep-dl ep-dl-1080" placeholder="Link download 1080p (opsional)" style="margin:0;flex:1" value="${esc(dl1080)}"></div><div style="display:flex;align-items:center;gap:6px;padding-left:46px"><span style="font-size:.58rem;font-weight:700;color:var(--txt3);flex-shrink:0;width:34px">720p</span><input type="text" class="ai ep-dl ep-dl-720" placeholder="Link download 720p (opsional)" style="margin:0;flex:1" value="${esc(dl720)}"></div>`;
  ec.appendChild(w);
}
function getSeasons(){
  return Array.from(document.querySelectorAll('#seasonCon .ep-grp')).map((box,i)=>({
    name:box.querySelector('.season-name')?.value.trim()||'Season '+(i+1),
    episodes:Array.from(box.querySelectorAll('.ep-con > div')).map(w=>{
      const url=(w.querySelector('.ep-link')||{}).value||'';
      const dl1080=(w.querySelector('.ep-dl-1080')||{}).value||'';
      const dl720=(w.querySelector('.ep-dl-720')||{}).value||'';
      const dl=dl1080||dl720?{'1080p':dl1080,'720p':dl720}:null;
      return url.trim()?{url,dl}:null;
    }).filter(Boolean)
  }));
}

function saveMovie(){
  const type=document.getElementById('addType').value;
  const t=document.getElementById('addTitle').value.trim();
  if(!t){showAlert('Validasi','Judul wajib diisi.');return}
  const k=document.getElementById('editKey').value;
  const genres=Array.from(document.querySelectorAll('input[name="addGenres"]:checked')).map(e=>e.value);
  document.getElementById('admPanelLoader').classList.add('on');
  const at=new Date().toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'});
  const obj={
    title:t,poster:document.getElementById('addPoster').value||'https://placehold.co/500x750/181818/444?text=N',
    category:document.getElementById('addCat').value,genres,
    synopsis:document.getElementById('addSynopsis').value||'',type,
    schedule:'Tersedia',uploadedBy:document.getElementById('addUploader').value||'Admin',uploadedAt:at,
    language:document.getElementById('addLang').value||'',rating:document.getElementById('addRating').value||'',
    trailerUrl:document.getElementById('addTrailer').value||''
  };
  if(type==='livetv'){
    obj.url=document.getElementById('addLiveUrl').value;
    obj.channelLogo=document.getElementById('addChLogo').value||'';
    obj.liveQuality=document.getElementById('addLiveQ').value;
    obj.liveStatus=document.getElementById('addLiveSt').value;
    obj.downloadUrl='';
  } else if(type==='movie'){
    obj.url=document.getElementById('addUrl').value;
    const dl1080=document.getElementById('addDlUrl1080').value||'',dl720=document.getElementById('addDlUrl720').value||'';
    obj.downloadUrl=dl1080||dl720?{'1080p':dl1080,'720p':dl720}:'';
  } else {
    obj.seasons=getSeasons();obj.url='';
  }
  const done=()=>{
    document.getElementById('admPanelLoader').classList.remove('on');
    resetForm();showAlert('Sukses',k?'Diperbarui.':'Dipublikasikan.');switchAdmTab('manage');
  };
  (k?db.ref('movies/'+k).update(obj):db.ref('movies').push(obj)).then(done).catch(e=>{
    document.getElementById('admPanelLoader').classList.remove('on');
    showAlert('Gagal',e.message||'Gagal menyimpan data.');
  });
}
function editMovie(key){
  const m=DATA[key];if(!m)return;
  resetForm();switchAdmTab('upload');buildGenreCBGrid('uploadGenreGrid','addGenres');
  document.getElementById('admFormTitle').textContent='Edit Konten';
  document.getElementById('editKey').value=key;
  const tl=m.type==='series'?'Serial':m.type==='livetv'?'Live TV':'Movie';
  selOpt('addType',m.type||'movie',tl,'trigType','ddType');
  const catLbl={'Kartun':'Animation','Film':'Film Indonesia','Film Luar':'Film Luar'}[m.category]||m.category||'Animation';
  selOpt('addCat',m.category||'Kartun',catLbl,'trigCat','ddCat');
  document.getElementById('addTitle').value=m.title||'';
  document.getElementById('addPoster').value=m.poster||'';
  document.getElementById('addSynopsis').value=m.synopsis||'';
  document.getElementById('addLang').value=m.language||'';
  document.getElementById('addRating').value=m.rating||'';
  document.getElementById('addTrailer').value=m.trailerUrl||'';
  document.getElementById('addUploader').value=m.uploadedBy||'';
  setTimeout(()=> (m.genres||[]).forEach(g=>{const b=document.querySelector(`input[name="addGenres"][value="${CSS.escape(g)}"]`);if(b)b.checked=true}),50);
  toggleEpField();
  if(m.type==='series'){
    document.getElementById('seasonCon').innerHTML='';
    const seasons=m.seasons?.length?m.seasons:m.episodes?[{name:'Season 1',episodes:m.episodes}]:[];
    seasons.forEach(s=>{
      addSeason();
      const boxes=document.querySelectorAll('#seasonCon .ep-grp'),box=boxes[boxes.length-1];
      box.querySelector('.season-name').value=s.name||'';
      const ec=box.querySelector('.ep-con');ec.innerHTML='';
      (s.episodes||[]).forEach(ep=>{
        const embedVal=typeof ep==='object'?ep.url||'':ep||'';
        const dlVal=typeof ep==='object'?(ep.dl||null):null;
        addEpToSeason(box.querySelector('.ep-grp-head').parentElement.querySelector('button:last-child'),embedVal,dlVal);
      });
    });
  } else if(m.type==='livetv'){
    document.getElementById('addLiveUrl').value=m.url||'';
    document.getElementById('addChLogo').value=m.channelLogo||'';
    document.getElementById('addLiveQ').value=m.liveQuality||'auto';
    document.getElementById('addLiveSt').value=m.liveStatus||'live';
  } else {
    document.getElementById('addUrl').value=m.url||'';
    const dl=m.downloadUrl||'';
    document.getElementById('addDlUrl1080').value=typeof dl==='object'?dl['1080p']||'':dl;
    document.getElementById('addDlUrl720').value=typeof dl==='object'?dl['720p']||'':'';
  }
}
function renderAdminList(){
  const l=document.getElementById('manageList');if(!l)return;
  const q=(document.getElementById('manageSearch')?.value||'').trim().toLowerCase();
  const entries=Object.entries(DATA).reverse().filter(([k,m])=>(m.title||'').toLowerCase().includes(q));
  l.innerHTML='';
  document.getElementById('manageCount').textContent=q?`${entries.length} hasil`:`${entries.length} konten`;
  if(!entries.length){
    l.innerHTML=`<div class="empty-search">${q?'Film tidak ditemukan.':'Belum ada konten.'}</div>`;
    return;
  }
  entries.forEach(([key,m])=>{
    const d=document.createElement('div');d.className='manage-item';
    d.innerHTML=`<span title="${esc(m.title||'')}">${esc(m.title||'Tanpa Judul')}</span><button class="me-edit">Ubah</button><button class="me-del">Hapus</button>`;
    d.querySelector('.me-edit').onclick=()=>editMovie(key);
    d.querySelector('.me-del').onclick=()=>delMovie(key);
    l.appendChild(d);
  });
}
function delMovie(key){
  showConfirm('Hapus','Hapus konten ini?',()=>{
    document.getElementById('admPanelLoader').classList.add('on');
    db.ref('movies/'+key).remove().then(()=>document.getElementById('admPanelLoader').classList.remove('on'))
      .catch(e=>{document.getElementById('admPanelLoader').classList.remove('on');showAlert('Gagal',e.message)});
  });
}
function resetForm(){
  document.getElementById('admFormTitle').textContent='Tambah Konten';
  document.getElementById('editKey').value='';
  ['addTitle','addPoster','addUrl','addDlUrl1080','addDlUrl720','addSynopsis','addLang','addRating','addTrailer','addUploader','addLiveUrl','addChLogo'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
  document.querySelectorAll('input[name="addGenres"]').forEach(b=>b.checked=false);
  document.getElementById('seasonCon').innerHTML='';
  selOpt('addType','movie','Movie','trigType','ddType');
  selOpt('addCat','Kartun','Animation','trigCat','ddCat');
}
function saveSchedule(){
  const title=document.getElementById('schTitle').value.trim(),day=document.getElementById('schDay').value.trim();
  if(!title){showAlert('Validasi','Judul wajib.');return}
  if(!day){showAlert('Validasi','Hari wajib.');return}
  document.getElementById('admPanelLoader').classList.add('on');
  const genres=Array.from(document.querySelectorAll('input[name="schGenres"]:checked')).map(e=>e.value);
  const obj={
    title,poster:document.getElementById('schPoster').value||'https://placehold.co/500x750/181818/444?text=Soon',
    synopsis:document.getElementById('schSynopsis').value||'Segera hadir.',schedule:day,
    category:document.getElementById('schCat').value,genres,type:'movie',url:'',
    uploadedBy:document.getElementById('schUploader').value||'Admin',
    uploadedAt:new Date().toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}),
    language:document.getElementById('schLang').value||'',rating:'',trailerUrl:document.getElementById('schTrailer').value||''
  };
  db.ref('movies').push(obj).then(()=>{
    document.getElementById('admPanelLoader').classList.remove('on');
    ['schTitle','schPoster','schSynopsis','schDay','schUploader','schLang','schTrailer'].forEach(id=>{const e=document.getElementById(id);if(e)e.value=''});
    document.querySelectorAll('input[name="schGenres"]').forEach(b=>b.checked=false);
    showAlert('Sukses','Jadwal tersimpan.');switchAdmTab('manage');
  }).catch(e=>{document.getElementById('admPanelLoader').classList.remove('on');showAlert('Gagal',e.message)});
}
function triggerRemoveAll(){
  showConfirm('Hapus Semua','Ini akan menghapus SEMUA data cloud!',()=>{
    showConfirm('Konfirmasi Akhir','Yakin? Tidak bisa dibatalkan!',()=>{
      document.getElementById('admPanelLoader').classList.add('on');
      db.ref('movies').remove().then(()=>{document.getElementById('admPanelLoader').classList.remove('on');showAlert('Sukses','Database dikosongkan.')});
    });
  });
}
function switchAdmTab(t){
  const mp={upload:'aSecUpload',schedule:'aSecSchedule',manage:'aSecManage',inbox:'aSecInbox'};
  const tp={upload:'atUpload',schedule:'atSchedule',manage:'atManage',inbox:'atInbox'};
  document.querySelectorAll('.adm-sec').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.adm-tab').forEach(b=>b.classList.remove('on'));
  document.getElementById(mp[t]).classList.add('on');
  document.getElementById(tp[t]).classList.add('on');
  if(t==='manage')renderAdminList();
  if(t==='inbox')renderInboxList();
  if(t==='upload')buildGenreCBGrid('uploadGenreGrid','addGenres');
  if(t==='schedule')buildGenreCBGrid('schGenreGrid','schGenres');
}

function updateInboxBadge(){
  const c=Object.keys(INBOX).length,b=document.getElementById('inboxBadge');
  b.style.display=c?'inline':'none';if(c)b.textContent=c;
}
function fmtTime(ts){return ts?new Date(ts).toLocaleString('id-ID',{dateStyle:'short',timeStyle:'short'}):''}
function renderInboxList(){
  const l=document.getElementById('inboxList');l.innerHTML='';
  const keys=Object.keys(INBOX).reverse();
  if(!keys.length){l.innerHTML='<div class="inbox-empty">Belum ada pesan.</div>';return}
  keys.forEach(key=>{
    const item=INBOX[key],thread=item.thread||[];
    const all=[{role:'user',text:item.message,time:item.time,name:item.name||'Anonim'},...thread];
    const bubbles=all.map(msg=>`<div class="chat-bubble ${msg.role==='admin'?'admin':'user'}">${esc(msg.text)}<div class="chat-bubble-meta">${msg.role==='admin'?'Admin':esc(msg.name||item.name||'User')} · ${fmtTime(msg.time)}</div></div>`).join('');
    const d=document.createElement('div');d.className='inbox-item';
    d.innerHTML=`<div class="inbox-item-head"><div style="display:flex;align-items:center;gap:8px"><span class="inbox-name">${esc(item.name||'Anonim')}</span><span class="inbox-badge ${item.type==='lapor'?'lap':'req'}">${item.type==='lapor'?'Laporan':'Request'}</span></div><button class="inbox-del-btn">Hapus</button></div><div class="chat-thread">${bubbles}</div><div class="chat-input-row"><textarea placeholder="Balas sebagai Admin..." rows="1"></textarea><button class="chat-send-btn"><span class="ms">send</span></button></div>`;
    d.querySelector('.inbox-del-btn').onclick=()=>delInbox(key);
    const ta=d.querySelector('textarea'),send=d.querySelector('.chat-send-btn');
    send.onclick=()=>sendReply(key,ta);
    ta.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendReply(key,ta)}};
    l.appendChild(d);
    const ct=d.querySelector('.chat-thread');ct.scrollTop=ct.scrollHeight;
  });
}
function sendReply(k,ta){
  const t=(ta.value||'').trim();if(!t||!INBOX[k])return;
  const thread=INBOX[k].thread||[];
  thread.push({role:'admin',text:t,time:Date.now()});
  ta.value='';
  db.ref('inbox/'+k).update({thread,reply:t,replyTime:Date.now()});
}
function delInbox(k){showConfirm('Hapus','Hapus pesan ini?',()=>db.ref('inbox/'+k).remove())}

function postAnnouncement(){
  const title=(document.getElementById('annTitle').value||'').trim();
  const body=(document.getElementById('annBody').value||'').trim();
  if(!title||!body){showAlert('Kosong','Isi judul dan teks pengumuman.');return}
  db.ref('announcements').push({title,body,time:Date.now()}).then(()=>{
    document.getElementById('annTitle').value='';document.getElementById('annBody').value='';
    showAlert('Terkirim','Pengumuman dikirim ke semua user!');
  });
}
function renderAnnAdmin(){
  const list=document.getElementById('annAdminList');list.innerHTML='';
  const entries=Object.entries(ANN).reverse();
  if(!entries.length){list.innerHTML='<div style="font-size:.68rem;color:var(--txt3);padding:8px 0">Belum ada pengumuman.</div>';return}
  entries.forEach(([key,a])=>{
    const d=document.createElement('div');d.className='ann-admin-item';
    d.innerHTML=`<div class="ann-admin-item-text"><strong>${esc(a.title||'')}</strong> — ${esc(a.body||'')}</div><button class="inbox-del-btn">Hapus</button>`;
    d.querySelector('button').onclick=()=>delAnn(key);list.appendChild(d);
  });
}
function delAnn(k){showConfirm('Hapus','Hapus pengumuman ini?',()=>db.ref('announcements/'+k).remove())}
function logoutAdmin(){window.location.href='about:blank'}

document.addEventListener('DOMContentLoaded',()=>{
  buildGenreCBGrid('uploadGenreGrid','addGenres');
  buildGenreCBGrid('schGenreGrid','schGenres');
  document.getElementById('manageSearch').addEventListener('input',renderAdminList);
});
