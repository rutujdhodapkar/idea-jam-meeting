const ADMIN_EMAIL = 'rutujdhodapkar@gmail.ccom';
const GOOGLE_CLIENT_ID = '455530891300-p0slp1v17nq98rodbsvp2hg9vb4b4tje.apps.googleusercontent.com';
const seedIdeas = [
  { id: 'seed-1', text: 'A 48-hour hackathon where mixed-year teams build a tiny tool for a real campus problem.', name: 'Aarav Mehta', email: 'aarav@example.com', photo: '', createdAt: '2026-09-30T14:20:00.000Z' },
  { id: 'seed-2', text: 'Monthly “show your work” sessions: students demo unfinished projects and get useful feedback.', name: 'Nisha Kulkarni', email: 'nisha@example.com', photo: '', createdAt: '2026-09-29T09:05:00.000Z' },
  { id: 'seed-3', text: 'A communication lab with mock interviews, lightning talks and a low-pressure debate night.', name: 'Kabir Shah', email: 'kabir@example.com', photo: '', createdAt: '2026-09-27T17:40:00.000Z' }
];
let currentUser = null;
let sortNewest = true;
const $ = (id) => document.getElementById(id);
const readIdeas = () => JSON.parse(localStorage.getItem('idea-jam-submissions') || '[]');
const allIdeas = () => [...seedIdeas, ...readIdeas()];
function initials(name){ return (name || 'Guest').split(' ').map((part) => part[0]).slice(0,2).join('').toUpperCase(); }
function timeAgo(date){ const mins = Math.max(1, Math.floor((Date.now()-new Date(date))/60000)); if(mins<60)return `${mins} MIN AGO`; const hours=Math.floor(mins/60); if(hours<24)return `${hours} HR AGO`; return `${Math.floor(hours/24)} DAY AGO`; }
function avatar(user){ return user.photo ? `<img class="avatar" src="${user.photo}" alt="${user.name}" />` : `<div class="avatar" aria-label="${user.name}">${initials(user.name)}</div>`; }
function renderIdeas(){
  const ideas = allIdeas().sort((a,b) => sortNewest ? new Date(b.createdAt)-new Date(a.createdAt) : new Date(a.createdAt)-new Date(b.createdAt));
  $('ideasGrid').innerHTML = ideas.map((idea) => `<article class="idea-card"><p class="idea-text">${escapeHtml(idea.text)}</p><div class="idea-meta">${avatar(idea)}<div><div class="meta-name">${escapeHtml(idea.name)}</div><span class="meta-time">${timeAgo(idea.createdAt)}</span></div></div></article>`).join('');
  $('ideaCount').textContent = `${ideas.length.toString().padStart(2,'0')} IDEAS`;
}
function escapeHtml(value){ return value.replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function showToast(message){ $('toast').textContent=message; $('toast').classList.add('show'); setTimeout(() => $('toast').classList.remove('show'), 2800); }
function updateLogin(){ $('loginButton').textContent = currentUser ? `SIGNED IN: ${currentUser.name.split(' ')[0].toUpperCase()}` : 'SIGN IN WITH GOOGLE'; $('signinNote').textContent = currentUser ? `Posting as ${currentUser.email}. Your name and photo will appear on the board.` : 'Sign in to attach your name and photo to an idea. You can still explore the board below.'; }
function handleCredential(response){ const payload = JSON.parse(atob(response.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); currentUser = {name:payload.name,email:payload.email,photo:payload.picture || ''}; sessionStorage.setItem('idea-jam-user', JSON.stringify(currentUser)); updateLogin(); showToast(`SIGNED IN AS ${currentUser.name}`); if($('adminPanel').classList.contains('open')) renderAdmin(); }
function initGoogle(){ if(window.google?.accounts?.id){ google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:handleCredential}); } }
function signIn(){ if(currentUser){ currentUser=null;sessionStorage.removeItem('idea-jam-user');updateLogin();showToast('SIGNED OUT');return; } if(window.google?.accounts?.id){ google.accounts.id.prompt(); } else showToast('GOOGLE SIGN-IN IS LOADING — TRY AGAIN'); }
function renderAdmin(){ const authorized=currentUser?.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase(); $('adminGate').hidden=authorized; $('adminContent').hidden=!authorized; if(!authorized)return; const ideas=allIdeas().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); $('adminCount').textContent=`${ideas.length} SUBMISSIONS`; $('submissionList').innerHTML=ideas.map((idea)=>`<div class="submission-row"><small>${new Date(idea.createdAt).toLocaleString()} · ${escapeHtml(idea.name)} · ${escapeHtml(idea.email)}</small><p>${escapeHtml(idea.text)}</p></div>`).join(''); }
$('ideaInput').addEventListener('input', (event) => $('charCount').textContent=`${event.target.value.length} / 280`);
$('ideaForm').addEventListener('submit', (event) => { event.preventDefault(); if(!currentUser){ showToast('SIGN IN WITH GOOGLE BEFORE POSTING'); return; } const text=$('ideaInput').value.trim(); if(!text)return; const ideas=readIdeas(); ideas.push({id:crypto.randomUUID(),text,name:currentUser.name,email:currentUser.email,photo:currentUser.photo,createdAt:new Date().toISOString()}); localStorage.setItem('idea-jam-submissions',JSON.stringify(ideas)); $('ideaInput').value='';$('charCount').textContent='0 / 280';renderIdeas();showToast('IDEA ADDED TO THE BOARD'); });
$('loginButton').addEventListener('click',signIn); $('sortToggle').addEventListener('click',()=>{sortNewest=!sortNewest;$('sortToggle').textContent=sortNewest?'LATEST ↓':'OLDEST ↑';renderIdeas();}); $('adminToggle').addEventListener('click',()=>{$('adminPanel').classList.add('open');$('adminPanel').setAttribute('aria-hidden','false');renderAdmin();}); $('closeAdmin').addEventListener('click',()=>{$('adminPanel').classList.remove('open');$('adminPanel').setAttribute('aria-hidden','true');});
$('exportButton').addEventListener('click',()=>{const rows=allIdeas().map((idea)=>[new Date(idea.createdAt).toISOString(),idea.name,idea.email,idea.text].map((v)=>`"${String(v).replace(/"/g,'""')}"`).join(','));const blob=new Blob([['timestamp,name,email,idea',...rows].join('\n')],{type:'text/csv'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='idea-jam-submissions.csv';link.click();URL.revokeObjectURL(link.href);});
try{currentUser=JSON.parse(sessionStorage.getItem('idea-jam-user'));}catch{} updateLogin();renderIdeas();initGoogle();
