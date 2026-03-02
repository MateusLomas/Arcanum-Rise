// ===============================
// Typing effect
// ===============================
const text = "Studios • Games • Apps";
const typingElement = document.getElementById("typing");
let index = 0;

function typeEffect() {
  if (index < text.length) {
    typingElement.textContent += text.charAt(index);
    index++;
    setTimeout(typeEffect, 100);
  }
}
typeEffect();


// ===============================
// Navegação entre páginas
// ===============================
const pages = document.querySelectorAll('.page');
const navItems = document.querySelectorAll('li[data-page]');
const mobileMenu = document.getElementById('mobileMenu');
const mobileToggle = document.getElementById('mobileMenuToggle');

function showPage(pageId) {
  pages.forEach(page => page.classList.remove('active'));
  navItems.forEach(item => item.classList.remove('active'));

  document.getElementById(pageId).classList.add('active');
  document.querySelector(`li[data-page="${pageId}"]`).classList.add('active');

  mobileMenu.classList.remove('active');
}

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const pageId = item.getAttribute('data-page');
    showPage(pageId);
  });
});


// ===============================
// TOAST ROBUSTO
// ===============================
const toast = document.getElementById('toast');
let toastTimeout = null;

function showToast(message) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }

  toast.classList.remove('show');
  void toast.offsetWidth;

  toast.textContent = message;
  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toastTimeout = null;
  }, 3000);
}

mobileToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

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
    name: 'Sonus Wave',
    file: 'Em breve na Play Store',
    size: 'NULL MB',
    link: '#',
    message: 'Download disponível em breve na Play Store',
    hasPreview: true,
    previewId: 'sonus-preview-section'
  },
  waveframe: {
    name: 'Waveframe',
    file: 'Em breve na Play Store',
    size: 'NULL MB',
    link: '#',
    message: 'Download disponível em breve na Play Store',
    hasPreview: false
  },
  wave: {
    name: 'Velonote',
    file: 'Velonote.exe',
    size: '5,2 MB',
    link: 'https://drive.google.com/file/d/1a_dOxCf3XG_x740v6LU4LJUYoW4c0gX5/view?usp=sharing',
    message: null,
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
      const version = parseFloat(match[1]);
      if (version >= 10.0) return 'Windows 10/11';
      if (version >= 6.3) return 'Windows 8.1';
      if (version >= 6.2) return 'Windows 8';
      if (version >= 6.1) return 'Windows 7';
    }
    return 'Windows';
  }
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android\s([0-9.]+)/);
    return match ? `Android ${match[1]}` : 'Android';
  }
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const match = ua.match(/OS\s([0-9_]+)/);
    if (match) {
      return `iOS ${match[1].replace(/_/g, '.')}`;
    }
    return 'iOS';
  }
  if (/Mac OS X/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  
  return 'Sistema não identificado';
}


// ===============================
// VELONOTE PREVIEW CAROUSEL
// ===============================

let vpCurrentSlide = 0;
const vpTotalSlides = 2;
let vpScrollObserverAttached = false;

function vpGoTo(index) {
  vpCurrentSlide = index;
  const track = document.getElementById('vpTrack');
  if (track) {
    track.style.transform = `translateX(-${vpCurrentSlide * 100}%)`;
  }
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
  }

  let vpAutoPlay = setInterval(vpNext, 4000);
  if (carousel) {
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
let sonusScrollObserverAttached = false;

function sonusGoTo(index) {
  sonusCurrentSlide = index;
  const track = document.getElementById('sonusTrack');
  if (track) {
    track.style.transform = `translateX(-${sonusCurrentSlide * 100}%)`;
  }
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
  }

  let sonusAutoPlay = setInterval(sonusNext, 4000);
  if (carousel) {
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
// LIGHTBOX (compartilhado)
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
    lb.innerHTML = `
      <button class="vp-lightbox-close" id="vpLbClose">✕</button>
      <img id="vpLbImg" src="" alt="Preview" />
    `;
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

// Scroll-reveal helper
function revealSection(section) {
  if (!section) return;
  section.classList.remove('vp-visible');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vp-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(section);
  } else {
    section.classList.add('vp-visible');
  }
  // Trigger immediately if already in view
  requestAnimationFrame(() => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setTimeout(() => section.classList.add('vp-visible'), 80);
    }
  });
}

function updatePreviewVisibility() {
  const velonoteSection = document.getElementById('velonote-preview-section');
  const sonusSection = document.getElementById('sonus-preview-section');

  // Hide all first
  if (velonoteSection) velonoteSection.style.display = 'none';
  if (sonusSection) sonusSection.style.display = 'none';

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


function initDownloadSystem() {
  const platforms = document.querySelectorAll('.irw-platform');
  const downloadBtn = document.getElementById('irw-download-link');
  const detectedSpan = document.getElementById('irw-detected');
  const fileSpan = document.getElementById('irw-file');
  const sizeSpan = document.getElementById('irw-size');
  
  if (!platforms.length || !downloadBtn) return;
  
  const detectedOS = detectOS();
  detectedSpan.textContent = detectedOS;
  
  if (/Android/i.test(detectedOS)) {
    selectedPlatform = 'scrap';
  } else if (/Windows/i.test(detectedOS)) {
    selectedPlatform = 'wave';
  } else {
    selectedPlatform = 'wave';
  }
  
  updateDownloadInfo();
  updatePreviewVisibility();
  
  platforms.forEach(platform => {
    platform.addEventListener('click', () => {
      const platformKey = platform.dataset.platform;
      selectedPlatform = platformKey;
      
      platforms.forEach(p => p.classList.remove('active'));
      platform.classList.add('active');
      
      updateDownloadInfo();
      updatePreviewVisibility();
    });
  });
  
  platforms.forEach(platform => {
    if (platform.dataset.platform === selectedPlatform) {
      platform.classList.add('active');
    }
  });
  
  downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const config = downloadConfig[selectedPlatform];
    if (config.link && config.link !== '#') {
      window.location.href = config.link;
    } else {
      showToast(config.message);
    }
  });
  
  function updateDownloadInfo() {
    const config = downloadConfig[selectedPlatform];
    if (fileSpan) fileSpan.textContent = config.file;
    if (sizeSpan) sizeSpan.textContent = config.size;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const downloadPage = document.getElementById('downloads');
  if (!downloadPage) return;
  
  const observer = new MutationObserver(() => {
    if (downloadPage.classList.contains('active')) {
      initDownloadSystem();
      observer.disconnect();
    }
  });
  
  observer.observe(downloadPage, { attributes: true, attributeFilter: ['class'] });
  
  if (downloadPage.classList.contains('active')) {
    initDownloadSystem();
  }
});


// ===============================
// SISTEMA ROBUSTO DE PERSISTÊNCIA DE PÁGINA
// ===============================
(function() {
  const STORAGE_KEY = 'arcanum_current_page';
  
  function savePage(pageId) {
    try {
      sessionStorage.setItem(STORAGE_KEY, pageId);
    } catch(e) {
      console.warn('SessionStorage não disponível');
    }
  }
  
  function restorePage() {
    try {
      const savedPage = sessionStorage.getItem(STORAGE_KEY);
      if (savedPage && document.getElementById(savedPage)) {
        pages.forEach(page => page.classList.remove('active'));
        navItems.forEach(item => item.classList.remove('active'));
        
        const targetPage = document.getElementById(savedPage);
        const targetNav = document.querySelector(`li[data-page="${savedPage}"]`);
        
        if (targetPage && targetNav) {
          targetPage.classList.add('active');
          targetNav.classList.add('active');
          
          if (savedPage === 'downloads') {
            setTimeout(() => initDownloadSystem(), 100);
          }
        }
      }
    } catch(e) {
      console.warn('Erro ao restaurar página');
    }
  }
  
  const originalShowPage = window.showPage || showPage;
  window.showPage = function(pageId) {
    originalShowPage(pageId);
    savePage(pageId);
  };
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.getAttribute('data-page');
      savePage(pageId);
    });
  });
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restorePage);
  } else {
    restorePage();
  }
})();