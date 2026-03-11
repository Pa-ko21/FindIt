/* ============================================================
   FindIt @ BAC — app.js
   ============================================================ */

// ══════════════════════════════════
// DATA
// ══════════════════════════════════
const sampleItems = [
  {
    id: 1,
    name: 'Samsung Galaxy S23',
    category: 'Electronics',
    location: 'Library',
    time: '2 hours ago',
    status: 'open',
    icon: '📱',
    desc: 'Black phone with cracked screen protector. Found on study table near window.',
    verifyQ: 'What app was open on the screen when you lost it?',
    poster: 'Lerato K.',
    posterInitials: 'LK',
    new: true
  },
  {
    id: 2,
    name: 'Blue BAC Hoodie',
    category: 'Clothing',
    location: 'Cafeteria',
    time: '5 hours ago',
    status: 'open',
    icon: '👕',
    desc: 'Size M, has name written inside collar.',
    verifyQ: 'What name is written inside the collar?',
    poster: 'Sipho M.',
    posterInitials: 'SM',
    new: true
  },
  {
    id: 3,
    name: 'Student Card',
    category: 'Documents',
    location: 'Computer Lab',
    time: 'Yesterday',
    status: 'open',
    icon: '🪪',
    desc: 'BAC student card. Photo ID visible.',
    verifyQ: 'What is your student number?',
    poster: 'Admin',
    posterInitials: 'AD',
    new: false
  },
  {
    id: 4,
    name: 'Silver Watch',
    category: 'Accessories',
    location: 'Sports Grounds',
    time: 'Yesterday',
    status: 'claimed',
    icon: '⌚',
    desc: 'Silver watch with brown leather strap.',
    verifyQ: 'What brand is the watch?',
    poster: 'Nomsa T.',
    posterInitials: 'NT',
    new: false
  },
  {
    id: 5,
    name: 'Water Bottle',
    category: 'Other',
    location: 'Lecture Hall 1',
    time: '2 days ago',
    status: 'open',
    icon: '🍶',
    desc: 'White SIGG water bottle with stickers on it.',
    verifyQ: 'Describe one of the stickers on the bottle.',
    poster: 'James R.',
    posterInitials: 'JR',
    new: false
  },
  {
    id: 6,
    name: 'MacBook Charger',
    category: 'Electronics',
    location: 'Library',
    time: '3 days ago',
    status: 'open',
    icon: '🔌',
    desc: 'Apple 65W USB-C charger with extension cable.',
    verifyQ: 'What colour is the cable?',
    poster: 'Fatima A.',
    posterInitials: 'FA',
    new: false
  },
  {
    id: 7,
    name: 'Set of Keys',
    category: 'Other',
    location: 'Parking Lot',
    time: '3 days ago',
    status: 'done',
    icon: '🔑',
    desc: 'Car keys + house key on a blue keyring.',
    verifyQ: 'What keyring is on the keys?',
    poster: 'David N.',
    posterInitials: 'DN',
    new: false
  },
  {
    id: 8,
    name: 'Wireless Earbuds',
    category: 'Electronics',
    location: 'Common Room',
    time: '4 days ago',
    status: 'open',
    icon: '🎧',
    desc: 'White earbuds in charging case. Brand unclear.',
    verifyQ: 'What colour is the inside of the case?',
    poster: 'Aisha B.',
    posterInitials: 'AB',
    new: false
  }
];

let allItems       = [...sampleItems];
let userPosted     = [];
let userClaimed    = [];
let currentFilter  = 'all';
let currentItemId  = null;

let chatMessages = {
  1: [
    { text: "Hi! I think that phone is mine. I left it in the library around 10am.", mine: true,  time: "10:32" },
    { text: "Hey! Yes I found it near the window seats. Are you sure it's yours?",  mine: false, time: "10:34" },
    { text: "Yes definitely! It has a cracked screen protector. I just verified my claim.", mine: true, time: "10:35" },
    { text: "Great, verification passed! When can you come collect it?",             mine: false, time: "10:36" }
  ]
};

// ══════════════════════════════════
// RENDER HELPERS
// ══════════════════════════════════
function renderItemCard(item, container, onclick) {
  const statusTag =
    item.status === 'open'    ? `<span class="tag tag-open">Open</span>`       :
    item.status === 'claimed' ? `<span class="tag tag-claimed">Claimed</span>` :
                                `<span class="tag tag-done">Returned ✓</span>`;
  const newTag = item.new ? `<span class="tag tag-new">New</span>` : '';

  const div = document.createElement('div');
  div.className = 'item-card';
  div.onclick = onclick;
  div.innerHTML = `
    <div class="item-thumb">${item.icon}</div>
    <div class="item-info">
      <div class="item-name">${item.name}</div>
      <div class="item-location">📍 ${item.location}</div>
      <div class="item-meta">${statusTag}${newTag}<span class="item-time">${item.time}</span></div>
    </div>
  `;
  container.appendChild(div);
}

function renderHome() {
  const c = document.getElementById('home-items');
  c.innerHTML = '';
  allItems.slice(0, 6).forEach(item =>
    renderItemCard(item, c, () => openDetail(item.id))
  );
}

function renderBrowse() {
  const c     = document.getElementById('browse-items');
  c.innerHTML = '';
  const query = document.getElementById('search-input').value.toLowerCase();

  const filtered = allItems.filter(i => {
    const matchFilter = currentFilter === 'all' || i.category === currentFilter;
    const matchQuery  = !query || i.name.toLowerCase().includes(query) || i.location.toLowerCase().includes(query);
    return matchFilter && matchQuery;
  });

  document.getElementById('results-label').textContent =
    `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`;

  if (filtered.length === 0) {
    c.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-title">No items found</div>
      Try a different search or filter.
    </div>`;
    return;
  }

  filtered.forEach(item => renderItemCard(item, c, () => openDetail(item.id)));
}

function renderProfile() {
  document.getElementById('stat-posted').textContent  = userPosted.length;
  document.getElementById('stat-claimed').textContent = userClaimed.length;
  const activeTab = document.getElementById('tab-posted').classList.contains('active') ? 'posted' : 'claimed';
  switchTab(activeTab);
}

function renderConversations() {
  const c = document.getElementById('conversations-list');
  c.innerHTML = '';
  const convItems = allItems.filter(i => chatMessages[i.id]);

  if (convItems.length === 0) {
    c.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💬</div>
      <div class="empty-title">No messages yet</div>
      When you claim an item, your chat will appear here.
    </div>`;
    return;
  }

  convItems.forEach(item => {
    const msgs = chatMessages[item.id];
    const last = msgs[msgs.length - 1];
    const div  = document.createElement('div');
    div.className = 'item-card';
    div.onclick   = () => openChat(item.id);
    div.innerHTML = `
      <div class="item-thumb">${item.icon}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        <div class="item-location" style="color:var(--text);font-size:0.78rem;margin-bottom:4px">
          ${last.text.substring(0, 50)}${last.text.length > 50 ? '…' : ''}
        </div>
        <div class="item-meta"><span class="item-time">${item.time}</span></div>
      </div>
    `;
    c.appendChild(div);
  });
}

// ══════════════════════════════════
// NAVIGATION
// ══════════════════════════════════
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  window.scrollTo(0, 0);

  if (name === 'home')     renderHome();
  if (name === 'browse')   renderBrowse();
  if (name === 'messages') renderConversations();
  if (name === 'profile')  renderProfile();
}

// ══════════════════════════════════
// FILTERS & SEARCH
// ══════════════════════════════════
function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderBrowse();
}

function filterItems() {
  renderBrowse();
}

// ══════════════════════════════════
// DETAIL VIEW
// ══════════════════════════════════
function openDetail(id) {
  currentItemId = id;
  const item = allItems.find(i => i.id === id);

  const statusTag =
    item.status === 'open'    ? `<span class="tag tag-open">Open</span>`       :
    item.status === 'claimed' ? `<span class="tag tag-claimed">Claimed</span>` :
                                `<span class="tag tag-done">Returned ✓</span>`;

  const claimBtn =
    item.status === 'open'
      ? `<button class="btn-primary" onclick="openClaimModal(${id})">This is mine — Claim it</button>`
      : `<button class="btn-secondary" disabled style="opacity:.4;cursor:not-allowed">
           ${item.status === 'claimed' ? 'Already Claimed' : 'Item Returned ✓'}
         </button>`;

  document.getElementById('detail-content').innerHTML = `
    <button class="back-btn" onclick="showScreen('browse')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back to browse
    </button>
    <div class="detail-img">${item.icon}</div>
    <div class="detail-header">
      <div class="detail-title">${item.name}</div>
      <div class="detail-meta-row">
        ${statusTag}
        <span class="tag" style="background:var(--card);border:1px solid var(--border);color:var(--muted)">${item.category}</span>
        <span class="item-time">${item.time}</span>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Item Details</div>
      <div class="detail-row"><span class="detail-row-icon">📍</span><span class="detail-row-text">Found at <strong>${item.location}</strong></span></div>
      <div class="detail-row"><span class="detail-row-icon">💬</span><span class="detail-row-text"><strong>${item.desc}</strong></span></div>
      <div class="detail-row"><span class="detail-row-icon">👤</span><span class="detail-row-text">Posted by <strong>${item.poster}</strong></span></div>
    </div>
    ${item.status === 'open' ? `
    <div class="verify-box">
      <div class="verify-title">🔐 To claim, you'll need to answer:</div>
      <div class="verify-question">"${item.verifyQ}"</div>
    </div>` : ''}
    ${claimBtn}
    ${chatMessages[id] ? `<button class="btn-secondary" style="margin-top:0.6rem" onclick="openChat(${id})">💬 Open Chat</button>` : ''}
  `;

  showScreen('detail');
}

// ══════════════════════════════════
// CLAIM FLOW
// ══════════════════════════════════
function openClaimModal(id) {
  currentItemId = id;
  const item = allItems.find(i => i.id === id);
  document.getElementById('modal-question').textContent = item.verifyQ;
  document.getElementById('modal-answer').value = '';
  document.getElementById('claimModal').classList.add('open');
}

function closeModal() {
  document.getElementById('claimModal').classList.remove('open');
}

function submitClaim() {
  const ans = document.getElementById('modal-answer').value.trim();
  if (!ans) { showToast('Please enter an answer'); return; }

  closeModal();
  const item = allItems.find(i => i.id === currentItemId);
  item.status = 'claimed';

  if (!userClaimed.find(i => i.id === currentItemId)) userClaimed.push(item);

  if (!chatMessages[currentItemId]) {
    chatMessages[currentItemId] = [
      { text: `Hi! I think I found your ${item.name}. I'm at ${item.location}.`, mine: false, time: 'Just now' }
    ];
  }

  showToast('✅ Claim submitted! Chat with the finder.');
  setTimeout(() => openChat(currentItemId), 1200);
}

// ══════════════════════════════════
// CHAT
// ══════════════════════════════════
function openChat(id) {
  currentItemId = id;
  const item = allItems.find(i => i.id === id);
  document.getElementById('chat-topbar-name').innerHTML =
    `<span style="font-size:0.8rem;color:var(--muted)">Re: ${item.name}</span>`;
  renderChat(id);
  showScreen('chat');
}

function renderChat(id) {
  const item     = allItems.find(i => i.id === id);
  const msgs     = chatMessages[id] || [];
  const initials = item.posterInitials;

  document.getElementById('chat-content').innerHTML = `
    <div class="chat-header">
      <div class="chat-avatar">${initials}</div>
      <div>
        <div class="chat-name">${item.poster}</div>
        <div class="chat-status">Online</div>
      </div>
    </div>
    <div class="chat-messages" id="chat-msgs">
      ${msgs.map(m => `
        <div class="msg ${m.mine ? 'mine' : 'theirs'}">
          <div class="msg-bubble">${m.text}</div>
          <div class="msg-time">${m.time}</div>
        </div>
      `).join('')}
    </div>
    <div class="chat-input-row">
      <input class="chat-input" id="chat-input-field" placeholder="Type a message..."
             onkeydown="if(event.key==='Enter') sendMsg()">
      <button class="send-btn" onclick="sendMsg()">➤</button>
    </div>
  `;

  const msgsDiv = document.getElementById('chat-msgs');
  if (msgsDiv) msgsDiv.scrollTop = msgsDiv.scrollHeight;
}

function sendMsg() {
  const input = document.getElementById('chat-input-field');
  const text  = input.value.trim();
  if (!text) return;

  const now  = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

  if (!chatMessages[currentItemId]) chatMessages[currentItemId] = [];
  chatMessages[currentItemId].push({ text, mine: true, time });
  input.value = '';
  renderChat(currentItemId);

  // Auto-reply after 1.2s
  setTimeout(() => {
    const replies = [
      "Sounds good!",
      "Sure, I'll be there.",
      "Let me know when you're on your way.",
      "Great, see you then!",
      "I'll keep it safe until you arrive."
    ];
    chatMessages[currentItemId].push({
      text: replies[Math.floor(Math.random() * replies.length)],
      mine: false,
      time
    });
    renderChat(currentItemId);
  }, 1200);
}

// ══════════════════════════════════
// POST ITEM
// ══════════════════════════════════
function previewPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader   = new FileReader();
  reader.onload  = ev => {
    document.getElementById('photo-preview-img').src = ev.target.result;
    document.getElementById('photo-upload-area').style.display = 'none';
    document.getElementById('photo-preview').style.display     = 'block';
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  document.getElementById('photo-file').value = '';
  document.getElementById('photo-upload-area').style.display = 'flex';
  document.getElementById('photo-preview').style.display     = 'none';
}

function submitPost() {
  const name = document.getElementById('post-name').value.trim();
  const cat  = document.getElementById('post-category').value;
  const loc  = document.getElementById('post-location').value;

  if (!name || !cat || !loc) {
    showToast('⚠️ Fill in category, name & location');
    return;
  }

  const icons = {
    Electronics: '📱', Clothing: '👕', Documents: '🪪',
    Accessories: '⌚', Keys: '🔑', 'Bag / Backpack': '🎒', Other: '📦'
  };

  const newItem = {
    id:             Date.now(),
    name,
    category:       cat,
    location:       loc,
    time:           'Just now',
    status:         'open',
    icon:           icons[cat] || '📦',
    desc:           document.getElementById('post-desc').value    || 'No description provided.',
    verifyQ:        document.getElementById('post-verify-q').value || 'Describe the item in detail.',
    poster:         'Thabo M.',
    posterInitials: 'TM',
    new:            true
  };

  allItems.unshift(newItem);
  userPosted.push(newItem);

  // Reset form
  document.getElementById('post-name').value      = '';
  document.getElementById('post-category').value  = '';
  document.getElementById('post-location').value  = '';
  document.getElementById('post-desc').value      = '';
  document.getElementById('post-verify-q').value  = '';
  removePhoto();

  showToast('✅ Item posted successfully!');
  setTimeout(() => showScreen('browse'), 1000);
}

// ══════════════════════════════════
// PROFILE TABS
// ══════════════════════════════════
function switchTab(tab) {
  document.getElementById('tab-posted').classList.toggle('active',  tab === 'posted');
  document.getElementById('tab-claimed').classList.toggle('active', tab === 'claimed');

  const c    = document.getElementById('profile-items');
  c.innerHTML = '';
  const list  = tab === 'posted' ? userPosted : userClaimed;

  if (list.length === 0) {
    c.innerHTML = `<div class="empty-state">
      <div class="empty-icon">${tab === 'posted' ? '📸' : '🔎'}</div>
      <div class="empty-title">${tab === 'posted' ? 'No posts yet' : 'No claims yet'}</div>
      ${tab === 'posted'
        ? "Found something? Post it and help someone out."
        : "See something that's yours? Tap 'This is mine' to claim it."}
    </div>`;
    return;
  }

  list.forEach(item => renderItemCard(item, c, () => openDetail(item.id)));
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ══════════════════════════════════
// MODAL — CLOSE ON OUTSIDE CLICK
// ══════════════════════════════════
document.getElementById('claimModal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ══════════════════════════════════
// INIT
// ══════════════════════════════════
renderHome();