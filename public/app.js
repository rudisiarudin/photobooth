const video = document.getElementById('video');
const flash = document.getElementById('flash');
const countdownEl = document.getElementById('countdown');
const poseIndicator = document.getElementById('poseIndicator');
const currentPoseEl = document.getElementById('currentPose');
const maxPoseEl = document.getElementById('maxPose');
const cameraHint = document.getElementById('cameraHint');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const startCamBtn = document.getElementById('startCamBtn');
const actionGroup = document.getElementById('actionGroup');
const startSessionBtn = document.getElementById('startSessionBtn');
const shotsTrack = document.getElementById('shotsTrack');
const resultModal = document.getElementById('resultModal');
const finalStripImg = document.getElementById('finalStripImg');
const downloadBtn = document.getElementById('downloadBtn');
const restartBtn = document.getElementById('restartBtn');
const helperCanvas = document.getElementById('helperCanvas');
const qrcodeBox = document.getElementById('qrcodeBox');
const directLink = document.getElementById('directLink');

// Event Setup Drawer Elements
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const eventSettingsDrawer = document.getElementById('eventSettingsDrawer');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const eventTitleInput = document.getElementById('eventTitleInput');
const eventSubtitleInput = document.getElementById('eventSubtitleInput');
const eventDateInput = document.getElementById('eventDateInput');
const headerTitle = document.getElementById('headerTitle');
const headerSubtitle = document.getElementById('headerSubtitle');

// Layout selector elements
const layoutCards = document.querySelectorAll('.layout-card');
const layoutInfoTag = document.getElementById('layoutInfoTag');

// Filter & Theme elements
const filterBtns = document.querySelectorAll('.filter-btn');
const themeBtns = document.querySelectorAll('.theme-btn');

// Online Virtual elements
const onlinePanel = document.getElementById('onlinePanel');
const createSessionBtn = document.getElementById('createSessionBtn');
const joinSessionInput = document.getElementById('joinSessionInput');
const joinSessionBtn = document.getElementById('joinSessionBtn');
const sessionQRContainer = document.getElementById('sessionQRContainer');
const sessionQRCodeEl = document.getElementById('sessionQRCodeEl');
const sessionLinkText = document.getElementById('sessionLinkText');
const onlineStatus = document.getElementById('onlineStatus');
const hostControlPanel = document.getElementById('hostControlPanel');
const startCountdownBtn = document.getElementById('startCountdownBtn');
const participantPreviewContainer = document.getElementById('participantPreviewContainer');
const toggleOnlineHostBtn = document.getElementById('toggleOnlineHostBtn');
const toggleOnlineJoinBtn = document.getElementById('toggleOnlineJoinBtn');
const joinPanel = document.getElementById('joinPanel');
const onlineCountdownOverlay = document.getElementById('onlineCountdownOverlay');
const onlineCountdownText = document.getElementById('onlineCountdownText');
const clearStickersBtn = document.getElementById('clearStickersBtn');
const stickerPicker = document.getElementById('stickerPicker');
const stickerLayer = document.getElementById('stickerLayer');
const stripPreviewContainer = document.getElementById('stripPreviewContainer');
const gifPreviewImg = document.getElementById('gifPreviewImg');
const downloadGifBtn = document.getElementById('downloadGifBtn');

// Global state
let stream = null;
let currentTheme = 'dark';
let currentFilter = 'normal';
let qrcodeInstance = null;
const capturedFrames = [];
let currentLayout = 'strip4';
let onlineSessionId = null;
let wsConnection = null;
let isOnlineHost = false;
let stickerElements = [];
let photoSubmitted = false;

// ==================== EVENT CONFIG ====================
const eventConfig = {
  title: localStorage.getItem('pb_title') || 'IT PALUGADA',
  subtitle: localStorage.getItem('pb_subtitle') || 'PHOTOBOOTH EVENT STATION',
  date: localStorage.getItem('pb_date') || ''
};

function applyEventConfig() {
  eventTitleInput.value = eventConfig.title;
  eventSubtitleInput.value = eventConfig.subtitle;
  eventDateInput.value = eventConfig.date;
  headerTitle.textContent = eventConfig.title;
  headerSubtitle.textContent = eventConfig.subtitle;
}
applyEventConfig();

// ==================== EVENT SETTINGS DRAWER ====================
toggleSettingsBtn.onclick = () => eventSettingsDrawer.classList.toggle('hidden');
closeSettingsBtn.onclick = () => eventSettingsDrawer.classList.add('hidden');
saveSettingsBtn.onclick = () => {
  eventConfig.title = eventTitleInput.value.trim() || 'IT PALUGADA';
  eventConfig.subtitle = eventSubtitleInput.value.trim() || 'PHOTOBOOTH EVENT STATION';
  eventConfig.date = eventDateInput.value.trim();
  localStorage.setItem('pb_title', eventConfig.title);
  localStorage.setItem('pb_subtitle', eventConfig.subtitle);
  localStorage.setItem('pb_date', eventConfig.date);
  applyEventConfig();
  eventSettingsDrawer.classList.add('hidden');
};

// ==================== FILTERS ====================
const FILTERS = {
  normal: { css: 'none', canvas: 'none' },
  bw: { css: 'grayscale(100%) contrast(110%)', canvas: 'grayscale(100%) contrast(110%)' },
  vintage: { css: 'sepia(50%) contrast(95%) brightness(105%)', canvas: 'sepia(50%) contrast(95%) brightness(105%)' },
  glow: { css: 'brightness(115%) contrast(105%) saturate(110%)', canvas: 'brightness(115%) contrast(105%) saturate(110%)' }
};

document.querySelectorAll('.filter-btn').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    video.style.filter = FILTERS[currentFilter].css;
  };
});

// ==================== THEMES ====================
const THEMES = {
  dark: { bg: '#18181b', border: '#27272a', text: '#ffffff', subtext: '#a1a1aa' },
  cream: { bg: '#fbf7ee', border: '#ece3ce', text: '#292524', subtext: '#78716c' },
  pink: { bg: '#fdf2f8', border: '#fbcfe8', text: '#831843', subtext: '#db2777' },
  white: { bg: '#ffffff', border: '#e4e4e7', text: '#09090b', subtext: '#71717a' }
};

document.querySelectorAll('.theme-btn').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentTheme = btn.dataset.theme;
  };
});

// ==================== LAYOUT PICKER ====================
layoutCards.forEach((card) => {
  card.onclick = () => {
    layoutCards.forEach((c) => c.classList.remove('active'));
    card.classList.add('active');
    currentLayout = card.dataset.layout;
    const poses = parseInt(card.dataset.poses, 10) || 4;
    if (maxPoseEl) maxPoseEl.textContent = poses;
    const labelMap = { strip4: 'Strip 4', strip3: 'Strip 3', grid4: 'Grid 2x2' };
    const sizeMap = { strip4: '2 x 6"', strip3: '2 x 6"', grid4: '4 x 6"' };
    if (layoutInfoTag) {
      layoutInfoTag.textContent = `${labelMap[currentLayout] || 'Strip'} • ${poses} Pose`;
    }
    if (startSessionBtn) {
      startSessionBtn.textContent = `Mulai Sesi Foto (${poses} Pose)`;
      startSessionBtn.disabled = false;
    }
  };
});

// Default: select first layout
if (layoutCards.length > 0) layoutCards[0].click();

// ==================== UTILITY ====================
function updateStatus(text, isOnline = false) {
  if (statusText) statusText.textContent = text;
  if (statusDot) statusDot.classList.toggle('online', isOnline);
}

// ==================== CAMERA CONTROL ====================
startCamBtn.onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      audio: false
    });
    video.srcObject = stream;
    startCamBtn.classList.add('hidden');
    actionGroup.classList.remove('hidden');
    cameraHint.textContent = 'Siap! Ambil pose terbaikmu';
    updateStatus('Kamera Siap', true);
  } catch (err) {
    console.error(err);
    updateStatus('Gagal akses kamera');
    alert('Kamera tidak dapat diakses. Pastikan izin kamera diberikan.');
  }
};

function triggerFlash() {
  flash.classList.add('active');
  setTimeout(() => flash.classList.remove('active'), 250);
}

function countdown(seconds) {
  return new Promise((resolve) => {
    const numEl = document.getElementById('countdownNumber') || countdownEl;
    if (countdownEl) {
      countdownEl.classList.remove('hidden');
      if (numEl) numEl.textContent = seconds;
    }
    let left = seconds;
    const interval = setInterval(() => {
      left--;
      if (numEl) {
        // Re-trigger animation
        numEl.style.animation = 'none';
        void numEl.offsetHeight;
        numEl.style.animation = 'countdownPop 1s var(--ease-spring) forwards';
        numEl.textContent = left > 0 ? left : '📸';
      }
      if (left <= 0) {
        clearInterval(interval);
        setTimeout(() => {
          if (countdownEl) countdownEl.classList.add('hidden');
          resolve();
        }, 400);
      }
    }, 1000);
  });
}

function grabVideoFrame() {
  const c = document.createElement('canvas');
  const vw = video.videoWidth || 1280;
  const vh = video.videoHeight || 960;
  c.width = 800;
  c.height = 600;
  const ctx = c.getContext('2d');
  if (FILTERS[currentFilter] && FILTERS[currentFilter].canvas !== 'none') {
    ctx.filter = FILTERS[currentFilter].canvas;
  }
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, vw, vh, 0, 0, c.width, c.height);
  return c;
}

// ==================== SESSION START ====================
startSessionBtn.onclick = async () => {
  photoSubmitted = false;
  startSessionBtn.disabled = true;
  cameraHint.textContent = 'Memulai sesi...';
  
  const poses = parseInt(maxPoseEl?.textContent || '4', 10);
  capturedFrames.length = 0;
  
  // Reset thumbnails
  if (shotsTrack) {
    shotsTrack.classList.remove('hidden');
    poseIndicator?.classList.remove('hidden');
    for (let i = 1; i <= poses; i++) {
      const box = document.getElementById(`thumb-${i}`);
      if (box) {
        box.innerHTML = `${i}`;
        box.classList.remove('done');
      }
    }
  }

  // Capture poses
  for (let i = 0; i < poses; i++) {
    currentPoseEl.textContent = i + 1;
    cameraHint.textContent = `Siapkan Pose ke-${i + 1}!`;
    await countdown(3);
    triggerFlash();
    const frameCanvas = grabVideoFrame();
    capturedFrames.push(frameCanvas);
    
    if (shotsTrack) {
      const thumbBox = document.getElementById(`thumb-${i + 1}`);
      if (thumbBox) {
        thumbBox.innerHTML = '';
        const imgThumb = document.createElement('img');
        imgThumb.src = frameCanvas.toDataURL('image/jpeg', 0.8);
        imgThumb.style.width = '100%';
        imgThumb.style.height = '100%';
        imgThumb.style.objectFit = 'cover';
        thumbBox.appendChild(imgThumb);
        thumbBox.classList.add('done');
      }
    }

    if (i < poses - 1) {
      cameraHint.textContent = 'Ganti gaya...';
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // For online mode: send photos to server via WebSocket
  if (isOnlineHost && wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    // Send host photos to participants
    for (let i = 0; i < capturedFrames.length; i++) {
      wsConnection.send(JSON.stringify({
        type: 'photo',
        dataUrl: capturedFrames[i].toDataURL('image/jpeg', 0.7),
        poseIndex: i,
        role: 'host'
      }));
    }
    
    cameraHint.textContent = 'Menunggu foto peserta...';
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  poseIndicator?.classList.add('hidden');
  cameraHint.textContent = 'Menyusun photostrip...';
  updateStatus('Membuat Photostrip...');

  // Generate strip based on layout
  const config = eventConfig;
  let stripDataUrl;
  if (currentLayout === 'grid4') {
    stripDataUrl = renderGridPhotostrip(capturedFrames, currentTheme, config);
  } else {
    stripDataUrl = renderStripPhotostrip(capturedFrames, currentTheme, config);
  }
  
  finalStripImg.src = stripDataUrl;
  downloadBtn.href = stripDataUrl;

  // Generate GIF
  generateAnimatedGIF(capturedFrames);

  // Upload to server
  try {
    const res = await fetch('/api/captures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: stripDataUrl })
    });
    
    if (res.ok) {
      const resData = await res.json();
      updateStatus('Tersimpan di PC ✓', true);
      const captureUrl = resData.capture ? resData.capture.url : (resData.url || '');
      const fullUrl = `${window.location.origin}${captureUrl}`;
      generateQRCode(fullUrl);
      directLink.href = captureUrl;
    }
  } catch (err) {
    console.error(err);
    updateStatus('Gagal simpan ke PC');
  }

  // Update retake preview
  updateRetakePreview();
  
  // Show result
  resultModal.classList.remove('hidden');
  photoSubmitted = true;
  startSessionBtn.disabled = false;
  startSessionBtn.textContent = `Mulai Sesi Foto (${poses} Pose)`;
};

// ==================== RENDER STRIP PHOTOS (Vertical) ====================
function renderStripPhotostrip(frames, themeKey, config) {
  const theme = THEMES[themeKey] || THEMES.dark;
  const canvas = helperCanvas;
  const ctx = canvas.getContext('2d');
  
  const count = frames.length || 4;
  const stripW = 600;
  const photoH = 360;
  const gapY = 25;
  const topY = 50;
  const stripH = topY + count * (photoH + gapY) + 100;
  
  canvas.width = stripW;
  canvas.height = stripH;
  
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, stripW, stripH);

  const padX = 40;
  const photoW = stripW - (padX * 2);

  frames.forEach((frame, idx) => {
    const y = topY + idx * (photoH + gapY);
    ctx.fillStyle = theme.border;
    ctx.fillRect(padX - 4, y - 4, photoW + 8, photoH + 8);
    ctx.drawImage(frame, padX, y, photoW, photoH);
  });

  const footerY = topY + count * (photoH + gapY) + 20;

  ctx.fillStyle = theme.text;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(config.title.toUpperCase(), stripW / 2, footerY + 40);

  ctx.fillStyle = theme.subtext;
  ctx.font = '500 17px sans-serif';
  ctx.fillText(config.subtitle.toUpperCase(), stripW / 2, footerY + 70);

  let displayDate = config.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  ctx.font = '14px sans-serif';
  ctx.fillText(`• ${displayDate} •`, stripW / 2, footerY + 100);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ==================== RENDER GRID PHOTOS (2x2) ====================
function renderGridPhotostrip(frames, themeKey, config) {
  const theme = THEMES[themeKey] || THEMES.dark;
  const canvas = helperCanvas;
  const ctx = canvas.getContext('2d');
  
  const stripW = 800;
  const stripH = 1060;
  canvas.width = stripW;
  canvas.height = stripH;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, stripW, stripH);

  const padX = 16;
  const padY = 16;
  const gap = 10;
  const cols = 2;
  const rows = 2;
  const photoW = (stripW - padX * 2 - gap) / cols;
  const photoH = (stripH - padY * 2 - gap) / rows;

  frames.forEach((frame, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = padX + col * (photoW + gap);
    const y = padY + row * (photoH + gap);
    ctx.fillStyle = theme.border;
    ctx.fillRect(x - 3, y - 3, photoW + 6, photoH + 6);
    ctx.drawImage(frame, x, y, photoW, photoH);
  });

  const footerY = padY + rows * (photoH + gap) + 20;

  ctx.fillStyle = theme.text;
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(config.title.toUpperCase(), stripW / 2, footerY + 40);

  ctx.fillStyle = theme.subtext;
  ctx.font = '500 17px sans-serif';
  ctx.fillText(config.subtitle.toUpperCase(), stripW / 2, footerY + 70);

  let displayDate = config.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  ctx.font = '14px sans-serif';
  ctx.fillText(`• ${displayDate} •`, stripW / 2, footerY + 100);

  return canvas.toDataURL('image/jpeg', 0.95);
}

// ==================== ANIMATED GIF ====================
function generateAnimatedGIF(frames) {
  if (typeof GIFSHOT === 'undefined') {
    if (gifPreviewImg) gifPreviewImg.style.display = 'none';
    if (downloadGifBtn) downloadGifBtn.style.display = 'none';
    return;
  }
  
  if (frames.length < 2) {
    if (gifPreviewImg) gifPreviewImg.style.display = 'none';
    if (downloadGifBtn) downloadGifBtn.style.display = 'none';
    return;
  }

  try {
    const images = frames.map((f) => f.toDataURL('image/jpeg', 0.8));
    GIFSHOT.createAnimation({ images: images, interval: 0.3, maxWidth: 480, loop: 0 }, function (error, gif) {
      if (error) {
        console.warn('GIF generation error:', error);
        if (gifPreviewImg) gifPreviewImg.style.display = 'none';
        if (downloadGifBtn) downloadGifBtn.style.display = 'none';
        return;
      }
      if (gifPreviewImg) {
        gifPreviewImg.src = gif;
        gifPreviewImg.style.display = 'block';
      }
      if (downloadGifBtn) {
        downloadGifBtn.href = gif;
        downloadGifBtn.style.display = 'inline-block';
        downloadGifBtn.download = `photobooth-${Date.now()}.gif`;
      }
    });
  } catch (err) {
    console.warn('GIF generation failed:', err);
  }
}

// ==================== RETAKE PREVIEW ====================
function updateRetakePreview() {
  const container = document.getElementById('retakeCardsRow');
  if (!container) return;
  
  container.innerHTML = '';
  const poses = parseInt(maxPoseEl?.textContent || '4', 10);
  
  for (let i = 0; i < poses; i++) {
    const card = document.createElement('div');
    card.className = 'retake-card';
    card.dataset.index = i;
    
    const photoData = capturedFrames[i]?.toDataURL('image/jpeg', 0.85) || '';
    card.innerHTML = `
      <img src="${photoData}" alt="Pose ${i+1}" class="w-full aspect-[4/3] object-cover">
      <button type="button" class="retake-btn" data-index="${i}">🔄 Retake ${i + 1}</button>
    `;
    container.appendChild(card);
  }
}

// ==================== RETAKE HANDLER (Delegated) ====================
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.retake-btn');
  if (!btn) return;
  
  const idx = parseInt(btn.dataset.index, 10);
  if (isNaN(idx)) return;
  
  resultModal.classList.add('hidden');
  poseIndicator?.classList.remove('hidden');
  currentPoseEl.textContent = `${idx + 1} (Retake)`;
  cameraHint.textContent = `Foto Ulang Pose ke-${idx + 1}! Siap-siap...`;

  await countdown(3);
  triggerFlash();
  const newFrame = grabVideoFrame();
  capturedFrames[idx] = newFrame;

  // Update thumb
  const thumbBox = document.getElementById(`thumb-${idx + 1}`);
  if (thumbBox) {
    thumbBox.innerHTML = '';
    const imgThumb = document.createElement('img');
    imgThumb.src = newFrame.toDataURL('image/jpeg', 0.8);
    imgThumb.style.width = '100%';
    imgThumb.style.height = '100%';
    imgThumb.style.objectFit = 'cover';
    thumbBox.appendChild(imgThumb);
  }

  poseIndicator?.classList.add('hidden');
  cameraHint.textContent = 'Memperbarui photostrip...';

  // Regenerate
  const poses = parseInt(maxPoseEl?.textContent || '4', 10);
  const activeFrames = capturedFrames.slice(0, poses);
  
  let stripDataUrl;
  if (currentLayout === 'grid4') {
    stripDataUrl = renderGridPhotostrip(activeFrames, currentTheme, eventConfig);
  } else {
    stripDataUrl = renderStripPhotostrip(activeFrames, currentTheme, eventConfig);
  }
  
  finalStripImg.src = stripDataUrl;
  downloadBtn.href = stripDataUrl;

  generateAnimatedGIF(activeFrames);
  
  // Re-upload
  fetch('/api/captures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl: stripDataUrl })
  }).then((res) => res.json()).then((data) => {
    if (data.capture) {
      directLink.href = data.capture.url;
      generateQRCode(`${window.location.origin}${data.capture.url}`);
    }
  }).catch(console.error);

  updateRetakePreview();
  resultModal.classList.remove('hidden');
});

// ==================== STICKER SYSTEM ====================
function addSticker(emoji) {
  const container = stripPreviewContainer;
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  const scale = (container.offsetWidth || 192) / rect.width;
  const x = 20 + Math.random() * ((container.offsetWidth || 192) - 50);
  const y = 10 + Math.random() * ((container.offsetHeight || 540) - 50);
  
  const el = document.createElement('div');
  el.className = 'drag-sticker';
  el.textContent = emoji;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.fontSize = '28px';
  
  container.appendChild(el);
  stickerElements.push({ el, emoji, x, y });
  makeDraggable(el);
  
  // Redraw photo behind sticker layer
  const img = finalStripImg;
  if (img && img.complete) {
    const ctx = helperCanvas.getContext('2d');
    helperCanvas.width = img.naturalWidth || 600;
    helperCanvas.height = img.naturalHeight || 1800;
    ctx.drawImage(img, 0, 0);
  }
}

function clearStickers() {
  if (stickerLayer) stickerLayer.innerHTML = '';
  stickerElements = [];
}

clearStickersBtn?.addEventListener('click', clearStickers);
stickerPicker?.addEventListener('click', (e) => {
  const btn = e.target.closest('.sticker-add-btn');
  if (btn?.dataset?.emoji) addSticker(btn.dataset.emoji);
});

function makeDraggable(el) {
  let isDragging = false;
  let startX, startY, origX, origY;

  const onStart = (e) => {
    isDragging = true;
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX;
    startY = touch.clientY;
    origX = parseFloat(el.style.left) || 0;
    origY = parseFloat(el.style.top) || 0;
    el.style.zIndex = 10;
    e.preventDefault();
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    el.style.left = (origX + dx) + 'px';
    el.style.top = (origY + dy) + 'px';
    e.preventDefault();
  };

  const onEnd = () => {
    isDragging = false;
    el.style.zIndex = 5;
  };

  el.addEventListener('mousedown', onStart);
  el.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

// ==================== QR CODE ====================
function generateQRCode(text) {
  if (!qrcodeBox) return;
  qrcodeBox.innerHTML = '';
  try {
    qrcodeInstance = new QRCode(qrcodeBox, {
      text: text,
      width: 140,
      height: 140,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch (err) {
    console.warn('QR Code generation failed:', err);
    qrcodeBox.textContent = 'QR Error';
  }
}

// ==================== ONLINE VIRTUAL MODE ====================
function connectOnline(sessionId) {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  
  onlineSessionId = sessionId;
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${location.host}/online?session=${sessionId}`;
  
  wsConnection = new WebSocket(wsUrl);
  
  wsConnection.onopen = () => {
    onlineStatus.textContent = 'Terkoneksi ✓';
    onlineStatus.className = 'text-green-400 text-[11px] font-medium';
    if (isOnlineHost) {
      wsConnection.send(JSON.stringify({ type: 'host-ready' }));
    }
  };
  
  wsConnection.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleOnlineMessage(msg);
    } catch (err) {
      console.warn('WebSocket message parse error:', err);
    }
  };
  
  wsConnection.onclose = () => {
    onlineStatus.textContent = 'Terputus';
    onlineStatus.className = 'text-red-400 text-[11px] font-medium';
    wsConnection = null;
  };
  
  wsConnection.onerror = () => {
    onlineStatus.textContent = 'Koneksi error';
    onlineStatus.className = 'text-red-400 text-[11px] font-medium';
  };
}

function handleOnlineMessage(msg) {
  switch (msg.type) {
    case 'status':
      if (msg.status === 'ready' && isOnlineHost) {
        if (hostControlPanel) hostControlPanel.classList.remove('hidden');
      }
      break;
      
    case 'countdown':
      if (msg.state === 'start') {
        showOnlineCountdown();
      }
      break;
      
    case 'photo-received':
      addParticipantPhoto(msg);
      break;
  }
}

function showOnlineCountdown() {
  if (!onlineCountdownOverlay || !onlineCountdownText) return;
  
  onlineCountdownOverlay.classList.remove('hidden');
  let count = 3;
  onlineCountdownText.textContent = count;
  
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      onlineCountdownText.textContent = count;
    } else {
      clearInterval(interval);
      onlineCountdownText.textContent = '📸';
      setTimeout(() => {
        onlineCountdownOverlay.classList.add('hidden');
      }, 400);
    }
  }, 1000);
}

function addParticipantPhoto(msg) {
  if (!participantPreviewContainer) return;
  
  const preview = document.createElement('div');
  preview.className = 'participant-photo';
  preview.innerHTML = `
    <img src="${msg.dataUrl}" class="w-16 h-16 object-cover rounded-lg border-2 border-primary flex-shrink-0" alt="Foto peserta">
    <span class="text-[10px] text-muted-foreground block mt-0.5">
      ${msg.role === 'host' ? 'Anda (Host)' : 'Peserta'}
    </span>
  `;
  participantPreviewContainer.appendChild(preview);
  participantPreviewContainer.classList.remove('hidden');
  
  // Store for hybrid strip
  if (!window._participantPhotos) window._participantPhotos = [];
  window._participantPhotos.push({
    dataUrl: msg.dataUrl,
    role: msg.role,
    poseIndex: msg.poseIndex
  });
}

// ==================== HOST: CREATE SESSION ====================
createSessionBtn?.addEventListener('click', async () => {
  createSessionBtn.disabled = true;
  createSessionBtn.innerHTML = '<span class="animate-spin">⏳</span> Membuat...';
  
  try {
    const res = await fetch('/api/sessions', { method: 'POST' });
    const data = await res.json();
    
    if (res.ok && data.sessionId) {
      onlineSessionId = data.sessionId;
      isOnlineHost = true;
      connectOnline(data.sessionId);
      
      const qrUrl = `${window.location.origin}/online?session=${data.sessionId}`;
      sessionLinkText.textContent = qrUrl;
      
      // Generate QR
      new QRCode(sessionQRCodeEl, {
        text: qrUrl,
        width: 140,
        height: 140,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      
      sessionQRContainer.classList.remove('hidden');
      onlineStatus.textContent = 'Menunggu peserta...';
      onlineStatus.className = 'text-yellow-400 text-[11px] font-medium';
      
      if (hostControlPanel) hostControlPanel.classList.remove('hidden');
      if (participantPreviewContainer) participantPreviewContainer.classList.remove('hidden');
      
      // Clear participant photos
      window._participantPhotos = [];
    } else {
      alert('Gagal membuat session: ' + (data.error || 'unknown'));
    }
  } catch (err) {
    console.error(err);
    alert('Gagal membuat session');
  } finally {
    createSessionBtn.disabled = false;
    createSessionBtn.innerHTML = '<span class="text-lg">📡</span> Buat Sesi Online';
  }
});

// ==================== PARTICIPANT: JOIN SESSION ====================
joinSessionBtn?.addEventListener('click', () => {
  const sessionId = joinSessionInput?.value?.trim();
  if (!sessionId) {
    alert('Masukkan Session ID');
    return;
  }
  
  isOnlineHost = false;
  onlineStatus.textContent = 'Menghubungi...';
  onlineStatus.className = 'text-yellow-400 text-[11px] font-medium';
  connectOnline(sessionId);
});

// ==================== HOST: START COUNTDOWN ====================
startCountdownBtn?.addEventListener('click', () => {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    alert('Tidak terhubung ke sesi');
    return;
  }
  
  if (!stream) {
    alert('Kamera belum diaktifkan');
    return;
  }
  
  startCountdownBtn.disabled = true;
  startCountdownBtn.innerHTML = '<span class="animate-pulse">⏳</span> Menjalankan...';
  cameraHint.textContent = 'Host memulai countdown...';
  
  // Send countdown signal to participants
  wsConnection.send(JSON.stringify({ type: 'start-countdown', poseIndex: 0 }));
  
  // Wait a bit then capture host photos
  setTimeout(async () => {
    const poses = parseInt(maxPoseEl?.textContent || '4', 10);
    capturedFrames.length = 0;
    
    for (let i = 0; i < poses; i++) {
      currentPoseEl.textContent = i + 1;
      cameraHint.textContent = `Pose ${i + 1}: Siap...`;
      await countdown(3);
      triggerFlash();
      const frameCanvas = grabVideoFrame();
      capturedFrames.push(frameCanvas);
      
      // Send host photo to participants (lower res for preview)
      wsConnection.send(JSON.stringify({
        type: 'photo',
        dataUrl: frameCanvas.toDataURL('image/jpeg', 0.6),
        poseIndex: i,
        role: 'host'
      }));
      
      if (i < poses - 1) {
        cameraHint.textContent = 'Ganti gaya...';
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    
    // After host captures, wait for participant photos
    cameraHint.textContent = 'Menunggu foto peserta...';
    startCountdownBtn.disabled = false;
    startCountdownBtn.innerHTML = '<span>🎬</span> Mulai Countdown Bersama';
    
    // Generate hybrid strip after timeout
    setTimeout(() => {
      generateHybridStrip();
    }, 5000);
  }, 800);
});

async function generateHybridStrip() {
  if (!finalStripImg) return;
  
  updateStatus('Menyusun photostrip hybrid...');
  
  const poses = parseInt(maxPoseEl?.textContent || '4', 10);
  const hostCount = Math.min(capturedFrames.length, poses);
  const participantPhotos = window._participantPhotos || [];
  
  // Combine host + participant photos
  const allFrames = [];
  for (let i = 0; i < poses; i++) {
    if (i < hostCount) {
      allFrames.push(capturedFrames[i]);
    }
    // Find matching participant photo
    const match = participantPhotos.find((p) => p.poseIndex === i);
    if (match && match.dataUrl) {
      const img = new Image();
      img.src = match.dataUrl;
      // We need canvas for hybrid - create from image
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 800;
      c.height = img.naturalHeight || 600;
      c.getContext('2d').drawImage(img, 0, 0);
      allFrames.push(c);
    }
  }
  
  // If we don't have enough, use what we have
  if (allFrames.length === 0) {
    allFrames.push(...capturedFrames);
  }
  
  let stripDataUrl;
  if (currentLayout === 'grid4') {
    stripDataUrl = renderGridPhotostrip(allFrames, currentTheme, eventConfig);
  } else {
    stripDataUrl = renderStripPhotostrip(allFrames, currentTheme, eventConfig);
  }
  
  finalStripImg.src = stripDataUrl;
  downloadBtn.href = stripDataUrl;

  generateAnimatedGIF(allFrames);
  
  // Upload
  try {
    const res = await fetch('/api/captures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl: stripDataUrl })
    });
    if (res.ok) {
      const resData = await res.json();
      updateStatus('Tersimpan di PC ✓', true);
      if (resData.capture) {
        directLink.href = resData.capture.url;
        generateQRCode(`${window.location.origin}${resData.capture.url}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
  
  updateRetakePreview();
  resultModal.classList.remove('hidden');
  
  cameraHint.textContent = 'Sesi foto selesai!';
}

// ==================== TOGGLE ONLINE MODE ====================
toggleOnlineHostBtn?.addEventListener('click', () => {
  onlinePanel.classList.remove('hidden');
  joinPanel.classList.add('hidden');
  isOnlineHost = true;
  onlinePanel.scrollIntoView({ behavior: 'smooth' });
});

toggleOnlineJoinBtn?.addEventListener('click', () => {
  joinPanel.classList.remove('hidden');
  onlinePanel.classList.add('hidden');
  isOnlineHost = false;
  joinPanel.scrollIntoView({ behavior: 'smooth' });
});

// ==================== RESTART ====================
restartBtn?.addEventListener('click', () => {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }
  onlineSessionId = null;
  isOnlineHost = false;
  window._participantPhotos = [];
  
  resultModal.classList.add('hidden');
  shotsTrack?.classList.add('hidden');
  poseIndicator?.classList.add('hidden');
  actionGroup?.classList.remove('hidden');
  participantPreviewContainer?.classList.add('hidden');
  startSessionBtn.disabled = false;
  startSessionBtn.textContent = `Mulai Sesi Foto (${maxPoseEl?.textContent || 4} Pose)`;
  cameraHint.textContent = 'Siap untuk sesi foto berikutnya!';
  updateStatus('Menunggu kamera...');
});

// ==================== CLEANUP ====================
window.addEventListener('beforeunload', () => {
  stream?.getTracks().forEach((t) => t.stop());
  if (wsConnection) wsConnection.close();
});
