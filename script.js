// ===============================
// PERSISTÊNCIA IMEDIATA (roda ANTES do primeiro paint)
// ─────────────────────────────────────────────────────
// ANTIGO: restore só no DOMContentLoaded → browser já pintava #home → flash
// NOVO:   lê sessionStorage AQUI, ainda na fase de parse do script,
//         e corrige as classes antes de qualquer repaint.
// ===============================
const STORAGE_KEY = 'arcanum_current_page';
const VALID_PAGES  = ['home', 'downloads', 'contact', 'outros'];

(function applyPageImmediately() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved || !VALID_PAGES.includes(saved) || saved === 'home') return;

    const homeEl  = document.getElementById('home');
    const homeNav = document.querySelector('li[data-page="home"]');
    if (homeEl)  homeEl.classList.remove('active');
    if (homeNav) homeNav.classList.remove('active');

    const targetEl  = document.getElementById(saved);
    const targetNav = document.querySelector('li[data-page="' + saved + '"]');
    if (targetEl)  targetEl.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
  } catch (e) {}
})();


// ===============================
// Typing effect
// ===============================
const text = "Studios • Games • Apps";
const typingElement = document.getElementById("typing");
let typingIndex = 0;

function typeEffect() {
  if (typingIndex < text.length) {
    typingElement.textContent += text.charAt(typingIndex);
    typingIndex++;
    setTimeout(typeEffect, 100);
  }
}

if (document.getElementById('home') && document.getElementById('home').classList.contains('active')) {
  typeEffect();
}


// ===============================
// NAVEGAÇÃO UNIFICADA
// ─────────────────────────────────────────────────────
// ANTIGO: showPage() simples + IIFE separado criava wrapper window.showPage
//         — duas versões conflitantes, listeners chamavam a versão antiga.
// NOVO:   uma única showPage() que faz tudo: troca página, salva, side-effects.
// ===============================
const pages    = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('li[data-page]');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileToggle = document.getElementById('mobileMenuToggle');

let downloadSystemReady = false;

function showPage(pageId) {
  if (!VALID_PAGES.includes(pageId)) return;

  pages.forEach(p => p.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));

  const targetEl  = document.getElementById(pageId);
  const targetNav = document.querySelector('li[data-page="' + pageId + '"]');
  if (!targetEl || !targetNav) return;

  targetEl.classList.add('active');
  targetNav.classList.add('active');
  mobileMenu.classList.remove('active');

  try { sessionStorage.setItem(STORAGE_KEY, pageId); } catch (e) {}

  if (pageId === 'home' && typingIndex === 0) typeEffect();

  if (pageId === 'downloads' && !downloadSystemReady) {
    downloadSystemReady = true;
    initDownloadSystem();
  }
}

window.showPage = showPage;

navItems.forEach(item => {
  item.addEventListener('click', () => showPage(item.getAttribute('data-page')));
});


// ===============================
// TOAST
// ===============================
const toast = document.getElementById('toast');
let toastTimeout = null;

function showToast(message) {
  if (toastTimeout) { clearTimeout(toastTimeout); toastTimeout = null; }
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.textContent = message;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => { toast.classList.remove('show'); toastTimeout = null; }, 3000);
}

mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('active'));

document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
    mobileMenu.classList.remove('active');
  }
});


// ===============================
// SISTEMA DE DOWNLOADS
// ===============================
const downloadConfig = {
  scrap: {
    name: 'Scrap Survivor Apocalypse',
    file: 'Scrap_Survivor_Apocalypse_v1.0.0.apk',
    size: 'NULL MB',
    link: '#',
    message: 'Download disponível em breve na Play Store',
    hasPreview: false
  },
  sonus: {
    name: 'Luvia Wave',
    file: 'Luvia Wave.playstore',
    size: 'NULL MB',
    link: 'https://play.google.com/store/apps/details?id=com.arcanumrise.luviawave',
    message: null,
    hasPreview: true,
    previewId: 'sonus-preview-section'
  },
  waveframe: {
    name: 'Waveframe',
    file: 'Waveframe.playstore',
    size: 'NULL MB',
    link: 'https://play.google.com/store/apps/details?id=com.arcanumrise.waveframe',
    message: null,
    hasPreview: false
  },
  wave: {
    name: 'Velonote',
    file: 'Velonote.exe',
    size: '5,2 MB',
    link: 'https://github.com/MateusLomas/Arcanum-Rise_Store/releases/download/ArcanumRise/Velonote-Setup.rar',
    message: 'Velonote.exe',
    hasPreview: true,
    previewId: 'velonote-preview-section'
  }
};

let selectedPlatform = 'wave';

function detectOS() {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) {
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const v = parseFloat(match[1]);
      if (v >= 10.0) return 'Windows 10/11';
      if (v >= 6.3)  return 'Windows 8.1';
      if (v >= 6.2)  return 'Windows 8';
      if (v >= 6.1)  return 'Windows 7';
    }
    return 'Windows';
  }
  if (/Android/i.test(ua)) {
    const m = ua.match(/Android\s([0-9.]+)/);
    return m ? 'Android ' + m[1] : 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS\s([0-9_]+)/);
    return m ? 'iOS ' + m[1].replace(/_/g, '.') : 'iOS';
  }
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua))    return 'Linux';
  return 'Sistema não identificado';
}


// ===============================
// VELONOTE PREVIEW CAROUSEL
// ===============================
let vpCurrentSlide = 0;
const vpTotalSlides = 2;

function vpGoTo(index) {
  vpCurrentSlide = index;
  const track = document.getElementById('vpTrack');
  if (track) track.style.transform = 'translateX(-' + (vpCurrentSlide * 100) + '%)';
  document.querySelectorAll('#velonote-preview-section .vp-dot-btn').forEach((dot, i) => {
    dot.classList.toggle('active', i === vpCurrentSlide);
  });
}
function vpNext() { vpGoTo((vpCurrentSlide + 1) % vpTotalSlides); }
function vpPrev() { vpGoTo((vpCurrentSlide - 1 + vpTotalSlides) % vpTotalSlides); }

function initVelonotePreview() {
  const prevBtn = document.getElementById('vpPrev');
  const nextBtn = document.getElementById('vpNext');
  if (!prevBtn || !nextBtn) return;
  prevBtn.onclick = vpPrev;
  nextBtn.onclick = vpNext;
  document.querySelectorAll('#velonote-preview-section .vp-dot-btn').forEach(dot => {
    dot.addEventListener('click', () => vpGoTo(parseInt(dot.dataset.slide)));
  });
  const carousel = document.querySelector('#velonote-preview-section .vp-carousel');
  if (carousel) {
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? vpNext() : vpPrev();
    }, { passive: true });
    let vpAutoPlay = setInterval(vpNext, 4000);
    carousel.addEventListener('mouseenter', () => clearInterval(vpAutoPlay));
    carousel.addEventListener('mouseleave', () => { vpAutoPlay = setInterval(vpNext, 4000); });
  }
  document.querySelectorAll('#velonote-preview-section .vp-slide').forEach((slide, i) => {
    const imgWrap = slide.querySelector('.vp-img-wrap');
    if (imgWrap) imgWrap.addEventListener('click', () => openLightbox('velonote', i));
  });
  vpGoTo(0);
}


// ===============================
// SONUS WAVE PREVIEW CAROUSEL
// ===============================
let sonusCurrentSlide = 0;
const sonusTotalSlides = 3;

function sonusGoTo(index) {
  sonusCurrentSlide = index;
  const track = document.getElementById('sonusTrack');
  if (track) track.style.transform = 'translateX(-' + (sonusCurrentSlide * 100) + '%)';
  document.querySelectorAll('#sonus-preview-section .vp-dot-btn').forEach((dot, i) => {
    dot.classList.toggle('active', i === sonusCurrentSlide);
  });
}
function sonusNext() { sonusGoTo((sonusCurrentSlide + 1) % sonusTotalSlides); }
function sonusPrev() { sonusGoTo((sonusCurrentSlide - 1 + sonusTotalSlides) % sonusTotalSlides); }

function initSonusPreview() {
  const prevBtn = document.getElementById('sonusPrev');
  const nextBtn = document.getElementById('sonusNext');
  if (!prevBtn || !nextBtn) return;
  prevBtn.onclick = sonusPrev;
  nextBtn.onclick = sonusNext;
  document.querySelectorAll('#sonus-preview-section .vp-dot-btn').forEach(dot => {
    dot.addEventListener('click', () => sonusGoTo(parseInt(dot.dataset.slide)));
  });
  const carousel = document.querySelector('#sonus-preview-section .vp-carousel');
  if (carousel) {
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? sonusNext() : sonusPrev();
    }, { passive: true });
    let sonusAutoPlay = setInterval(sonusNext, 4000);
    carousel.addEventListener('mouseenter', () => clearInterval(sonusAutoPlay));
    carousel.addEventListener('mouseleave', () => { sonusAutoPlay = setInterval(sonusNext, 4000); });
  }
  document.querySelectorAll('#sonus-preview-section .vp-slide').forEach((slide, i) => {
    const imgWrap = slide.querySelector('.vp-img-wrap');
    if (imgWrap) imgWrap.addEventListener('click', () => openLightbox('sonus', i));
  });
  sonusGoTo(0);
}


// ===============================
// LIGHTBOX
// ===============================
const lightboxData = {
  velonote: [
    'images/Previews/Velonote-ModoEditor.png',
    'images/Previews/Velonote-ModoDev.png'
  ],
  sonus: [
    'images/Previews/SonusWave-Musics.jpeg',
    'images/Previews/SonusWave-Config.jpeg',
    'images/Previews/SonusWave-Playlists.jpeg'
  ]
};

function openLightbox(app, index) {
  let lb = document.getElementById('vpLightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'vpLightbox';
    lb.className = 'vp-lightbox';
    lb.innerHTML = '<button class="vp-lightbox-close" id="vpLbClose">✕</button><img id="vpLbImg" src="" alt="Preview" />';
    document.body.appendChild(lb);
    document.getElementById('vpLbClose').addEventListener('click', closeLightbox);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }
  document.getElementById('vpLbImg').src = lightboxData[app][index];
  requestAnimationFrame(() => lb.classList.add('active'));
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('vpLightbox');
  if (lb) { lb.classList.remove('active'); document.body.style.overflow = ''; }
}


// ===============================
// SCROLL REVEAL
// ===============================
function revealSection(section) {
  if (!section) return;
  section.classList.remove('vp-visible');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('vp-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    observer.observe(section);
  } else {
    section.classList.add('vp-visible');
  }
  requestAnimationFrame(() => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight) setTimeout(() => section.classList.add('vp-visible'), 80);
  });
}

function updatePreviewVisibility() {
  const velonoteSection = document.getElementById('velonote-preview-section');
  const sonusSection    = document.getElementById('sonus-preview-section');
  if (velonoteSection) velonoteSection.style.display = 'none';
  if (sonusSection)    sonusSection.style.display    = 'none';

  const config = downloadConfig[selectedPlatform];
  if (!config || !config.hasPreview) return;

  if (selectedPlatform === 'wave' && velonoteSection) {
    velonoteSection.style.display = 'block';
    revealSection(velonoteSection);
    initVelonotePreview();
  } else if (selectedPlatform === 'sonus' && sonusSection) {
    sonusSection.style.display = 'block';
    revealSection(sonusSection);
    initSonusPreview();
  }
}


// ===============================
// MODAL DE DOWNLOAD
// ===============================
function startDownloadAnimation(link) {
  const overlay       = document.getElementById('download-overlay');
  const cancelBtn     = document.getElementById('cancel-download');
  const countdownText = document.getElementById('download-countdown-text');
  const progressBar   = document.getElementById('download-progress-bar');
  const dlBtn         = document.getElementById('irw-download-link');

  overlay.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('visible')));

  countdownText.textContent = 'Aguarde um momento...';
  progressBar.style.width   = '0%';

  let countdown   = 4;
  let isCancelled = false;

  setTimeout(() => { if (!isCancelled) progressBar.style.width = '25%'; }, 50);

  const interval = setInterval(() => {
    if (isCancelled) { clearInterval(interval); return; }
    countdown--;
    progressBar.style.width = ((4 - countdown) / 4 * 100) + '%';
    if (countdown > 0) {
      countdownText.textContent = 'Iniciando em ' + countdown + ' segundo' + (countdown !== 1 ? 's' : '') + '...';
    } else {
      countdownText.textContent = 'Redirecionando... 🚀';
      clearInterval(interval);
      setTimeout(() => {
        if (!isCancelled) {
          closeDownloadModal();
          window.open(link, '_blank') || (window.location.href = link);
        }
      }, 600);
    }
  }, 1000);

  function closeDownloadModal() {
    overlay.classList.remove('visible');
    setTimeout(() => { overlay.style.display = 'none'; }, 320);
  }

  function cancel() {
    isCancelled = true;
    clearInterval(interval);
    closeDownloadModal();
    showToast('Download cancelado.');
    if (dlBtn) dlBtn.disabled = false;
  }

  cancelBtn.onclick = cancel;
  overlay.onclick   = (e) => { if (e.target === overlay) cancel(); };

  if (dlBtn) {
    dlBtn.disabled = true;
    setTimeout(() => { if (!isCancelled) dlBtn.disabled = false; }, 4500);
  }
}


// ===============================
// INIT DO SISTEMA DE DOWNLOADS
// ─────────────────────────────────────────────────────
// ANTIGO: MutationObserver observava quando #downloads ficava active
//         — frágil, disparava fora de ordem e reinicializava errado.
// NOVO:   chamado diretamente por showPage() via flag downloadSystemReady.
//         DOMContentLoaded cobre o caso de restore imediato.
// ===============================
function initDownloadSystem() {
  const platforms    = document.querySelectorAll('.irw-platform');
  const downloadBtn  = document.getElementById('irw-download-link');
  const detectedSpan = document.getElementById('irw-detected');
  const fileSpan     = document.getElementById('irw-file');
  const sizeSpan     = document.getElementById('irw-size');

  if (!platforms.length || !downloadBtn) return;

  const detectedOS = detectOS();
  if (detectedSpan) detectedSpan.textContent = detectedOS;

  if (/Android/i.test(detectedOS))      selectedPlatform = 'scrap';
  else if (/Windows/i.test(detectedOS)) selectedPlatform = 'wave';
  else                                  selectedPlatform = 'wave';

  function updateDownloadInfo() {
    const config     = downloadConfig[selectedPlatform];
    const statusText = document.getElementById('irw-status-text');
    if (fileSpan)   fileSpan.textContent   = config.file;
    if (sizeSpan)   sizeSpan.textContent   = config.size === 'NULL MB' ? '—' : config.size;
    if (statusText) statusText.textContent = config.message != null ? config.message : config.file;
  }

  updateDownloadInfo();
  updatePreviewVisibility();

  platforms.forEach(platform => {
    platform.addEventListener('click', () => {
      selectedPlatform = platform.dataset.platform;
      platforms.forEach(p => p.classList.remove('active'));
      platform.classList.add('active');
      updateDownloadInfo();
      updatePreviewVisibility();
    });
  });

  platforms.forEach(p => {
    p.classList.toggle('active', p.dataset.platform === selectedPlatform);
  });

  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const config = downloadConfig[selectedPlatform];
    if (config.link && config.link !== '#') {
      startDownloadAnimation(config.link);
    } else {
      showToast(config.message);
    }
  });
}


// ===============================
// DOMContentLoaded — init final
// ─────────────────────────────────────────────────────
// ANTIGO: restore acontecia aqui — sempre tarde demais, causava flash.
// NOVO:   restore já aconteceu no topo do arquivo. Aqui só inicializa
//         downloads caso a página restaurada seja downloads.
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = (document.querySelector('.page.active') || {}).id || 'home';
  if (currentPage === 'downloads' && !downloadSystemReady) {
    downloadSystemReady = true;
    initDownloadSystem();
  }
});