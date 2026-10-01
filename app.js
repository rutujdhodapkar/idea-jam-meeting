const ADMIN_EMAIL = 'rutujdhodapkar@gmail.com';
const GOOGLE_CLIENT_ID = '455530891300-p0slp1v17nq98rodbsvp2hg9vb4b4tje.apps.googleusercontent.com';
const API_URL = '/api/submissions';
let currentUser = null;
let submissions = [];
let signInTimer = null;
let signInPromptQueued = false;
const $ = (id) => document.getElementById(id);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
const initials = (name = '') => name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
const formatDate = (value) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
function showToast(message) { $('toast').textContent = message; $('toast').classList.add('show'); window.setTimeout(() => $('toast').classList.remove('show'), 3000); }
function decodeGoogleCredential(credential) { const encoded = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(atob(encoded)); }
function setUser(user) { currentUser = user; $('googleButton').hidden = true; $('userChip').hidden = false; $('userChip').innerHTML = `<img src="${escapeHtml(user.photo)}" alt="" /><span>${escapeHtml(user.name)}</span><small>SIGN OUT</small>`; $('submitButton').disabled = false; $('loginMessage').textContent = `Posting as ${user.email}. Your name and photo will be shown with your idea.`; }
function signOut() { currentUser = null; $('googleButton').hidden = false; $('userChip').hidden = true; $('submitButton').disabled = false; $('loginMessage').textContent = 'Sign in with Google to submit. Your Google name and photo will be shown with your idea.'; showToast('SIGNED OUT'); }
function requestSignIn() {
  if (currentUser || signInPromptQueued) return;
  signInPromptQueued = true;
  $('loginMessage').textContent = 'Sign in to submit your idea. Opening Google sign-in in 3 seconds…';
  showToast('SIGN IN TO SUBMIT');
  signInTimer = window.setTimeout(() => {
    signInPromptQueued = false;
    if (!currentUser && window.google?.accounts?.id) google.accounts.id.prompt();
  }, 3000);
}
function handleCredential(response) { const user = decodeGoogleCredential(response.credential); setUser({ name: user.name, email: user.email, photo: user.picture || '' }); showToast(`SIGNED IN AS ${user.name}`); }
function initGoogle() { if (!window.google?.accounts?.id) { window.setTimeout(initGoogle, 250); return; } google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential, auto_select: false }); google.accounts.id.renderButton($('googleButton'), { theme: 'filled_black', size: 'large', text: 'signin_with', shape: 'rectangular', width: 210 }); }
function renderIdeas() { $('ideaCount').textContent = submissions.length; if (!submissions.length) { $('ideasGrid').innerHTML = '<p class="empty">No ideas submitted yet. Be the first.</p>'; return; } $('ideasGrid').innerHTML = submissions.map((idea) => `<article class="idea-card"><p>${escapeHtml(idea.text)}</p><div class="idea-meta">${idea.photo ? `<img src="${escapeHtml(idea.photo)}" alt="${escapeHtml(idea.name)}" />` : `<span class="avatar">${initials(idea.name)}</span>`}<div><strong>${escapeHtml(idea.name)}</strong><small>${formatDate(idea.createdAt)}</small></div></div></article>`).join(''); }
async function loadSubmissions() { try { const response = await fetch(API_URL); if (!response.ok) throw new Error(); submissions = await response.json(); renderIdeas(); } catch { submissions = []; $('ideasGrid').innerHTML = '<p class="empty">Submissions are not connected yet. Add the database API to start collecting real ideas.</p>'; $('ideaCount').textContent = '0'; } }
async function submitIdea(event) { event.preventDefault(); if (!currentUser) { requestSignIn(); return; } const text = $('ideaInput').value.trim(); if (!text) return; $('submitButton').disabled = true; try { const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, name: currentUser.name, email: currentUser.email, photo: currentUser.photo }) }); if (!response.ok) throw new Error(); $('ideaInput').value = ''; $('charCount').textContent = '0 / 280'; showToast('IDEA SUBMITTED'); await loadSubmissions(); } catch { showToast('SUBMISSIONS DATABASE IS NOT CONNECTED'); } $('submitButton').disabled = false; }
function renderAdmin() { if (!currentUser || currentUser.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) { showToast('ADMIN GOOGLE ACCOUNT REQUIRED'); return; } $('adminPanel').hidden = false; $('adminList').innerHTML = submissions.map((idea) => `<div class="admin-row"><small>${formatDate(idea.createdAt)} · ${escapeHtml(idea.name)} · ${escapeHtml(idea.email)}</small><p>${escapeHtml(idea.text)}</p></div>`).join('') || '<p class="empty">No submissions yet.</p>'; }
function exportCsv() { const rows = submissions.map((idea) => [idea.createdAt, idea.name, idea.email, idea.text].map((value) => `"${String(value || '').replace(/"/g, '""')}"`).join(',')); const blob = new Blob([['timestamp,name,email,idea', ...rows].join('\n')], { type: 'text/csv' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'department-ideas.csv'; link.click(); URL.revokeObjectURL(link.href); }
$('ideaInput').addEventListener('input', (event) => { $('charCount').textContent = `${event.target.value.length} / 280`; if (event.target.value.trim() && !currentUser) requestSignIn(); });
$('ideaForm').addEventListener('submit', submitIdea); $('refreshButton').addEventListener('click', loadSubmissions); $('userChip').addEventListener('click', signOut); $('adminToggle').addEventListener('click', renderAdmin); $('closeAdmin').addEventListener('click', () => $('adminPanel').hidden = true); $('exportButton').addEventListener('click', exportCsv);
loadSubmissions(); initGoogle();
