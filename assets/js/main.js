/* Progressive enhancement: page content and navigation work without JS; latest downloads use downloads.js. */
(function () {
  'use strict';
  var en = document.documentElement.lang === 'en';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = reduced.matches;
  var menu = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  var toggle = document.querySelector('.motion-toggle');
  var heroVideo = document.querySelector('[data-hero-video]');
  var heroControl = document.querySelector('[data-hero-motion]');
  var heroVisible = true;

  function syncHeroVideo() {
    if (!heroVideo) return;
    if (heroControl) {
      heroControl.querySelector('span').textContent = paused ? (en ? 'Play background' : '播放背景') : (en ? 'Pause background' : '暂停背景');
      heroControl.setAttribute('aria-pressed', String(paused));
      heroControl.querySelector('[data-video-icon="play"]').hidden = !paused;
      heroControl.querySelector('[data-video-icon="pause"]').hidden = paused;
    }
    if (paused || !heroVisible || document.hidden) { heroVideo.pause(); return; }
    if (!heroVideo.getAttribute('src')) {
      // Reduced-motion visitors see the poster without fetching a video.
      heroVideo.src = window.matchMedia('(max-width: 800px)').matches ? heroVideo.dataset.mobileSrc : heroVideo.dataset.desktopSrc;
    }
    heroVideo.muted = true;
    var playback = heroVideo.play();
    if (playback && playback.catch) playback.catch(function () {
      if (!paused && heroControl) {
        heroControl.querySelector('span').textContent = en ? 'Play background' : '播放背景';
        heroControl.querySelector('[data-video-icon="play"]').hidden = false;
        heroControl.querySelector('[data-video-icon="pause"]').hidden = true;
      }
    });
  }
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false'); mobile.hidden = true;
    menu.setAttribute('aria-label', en ? 'Open menu' : '打开菜单');
  }
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); mobile.hidden = !open;
    menu.setAttribute('aria-label', open ? (en ? 'Close menu' : '关闭菜单') : (en ? 'Open menu' : '打开菜单'));
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.site-header')) closeMenu(); });
  mobile.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function () { if (innerWidth > 800) closeMenu(); });
  document.querySelector('[data-language]').addEventListener('click', function (e) {
    if (location.hash) e.currentTarget.hash = location.hash;
  });

  function applyMotion() {
    document.body.classList.toggle('motion-paused', paused);
    toggle.textContent = paused ? (en ? 'Enable motion' : '开启动效') : (en ? 'Pause motion' : '暂停动效');
    toggle.setAttribute('aria-pressed', String(paused));
    document.querySelectorAll('[data-tilt]').forEach(function (el) { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
    syncHeroVideo();
  }
  toggle.addEventListener('click', function () { paused = !paused; applyMotion(); });
  reduced.addEventListener('change', function (e) { paused = e.matches; applyMotion(); });
  applyMotion();
  if (heroControl) heroControl.addEventListener('click', function () {
    if (heroVideo.paused && !paused) syncHeroVideo();
    else { paused = !paused; applyMotion(); }
  });
  if (heroVideo) {
    document.addEventListener('visibilitychange', syncHeroVideo);
    heroVideo.addEventListener('error', function () {
      // Local poster remains visible when a browser cannot decode the clip.
      heroVideo.hidden = true;
      if (heroControl) heroControl.hidden = true;
    });
    if ('IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting; syncHeroVideo();
      });
      heroObserver.observe(document.querySelector('.hero'));
    }
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('seen'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
    document.body.classList.add('motion-ready');
  }
  var ticking = false;
  function progress() {
    var height = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('.scroll-meter').style.transform = 'scaleX(' + (height > 0 ? scrollY / height : 0) + ')'; ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(progress); ticking = true; } }, { passive: true });
  progress();
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('[data-tilt], .spotlight-card').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      if (paused || !finePointer.matches) return;
      var rect = el.getBoundingClientRect(); var x = (e.clientX - rect.left) / rect.width; var y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      if (el.hasAttribute('data-tilt')) { el.style.setProperty('--rx', (0.5 - y) * 5 + 'deg'); el.style.setProperty('--ry', (x - 0.5) * 7 + 'deg'); }
    });
    el.addEventListener('pointerleave', function () { el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); });
  });

  var dialog = document.querySelector('.image-dialog'); var previousFocus;
  document.querySelectorAll('[data-image]').forEach(function (button) {
    button.addEventListener('click', function () {
      previousFocus = button; document.querySelector('#large-image').src = button.getAttribute('data-image');
      if (typeof dialog.showModal === 'function') dialog.showModal(); else window.open(button.getAttribute('data-image'), '_blank', 'noopener');
    });
  });
  document.querySelector('.dialog-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', function () { if (previousFocus) previousFocus.focus(); });

  var stepCopy = en ? [
    'Full screen or a rectangle. You decide what goes into the frame.',
    'Choose quality, frame rate, audio and a local folder. You are ready.',
    'Use Ctrl + Shift + F9 to pause. Ctrl + Shift + F10 stops and saves.'
  ] : ['全屏或矩形区域，把想展示的内容放进画面。', '选好画质、帧率、声音与本地目录，准备就绪。', 'Ctrl + Shift + F9 暂停；Ctrl + Shift + F10 停止并保存。'];
  document.querySelectorAll('[data-step]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-step]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      document.querySelector('#step-caption').textContent = stepCopy[Number(button.dataset.step)];
    });
  });
  var modes = {
    mp4: { name: 'MP4', codec: 'H.264 · CRF 18', title: en ? 'Clear. Compact. Ready to share.' : '清楚记录，轻松分享。', text: en ? 'Original resolution with high-quality compression. A practical choice for everyday recording and sharing.' : '保留原始分辨率，用高质量压缩平衡清晰度与体积。日常录制、教学演示、分享交流，选它就好。' },
    mkv: { name: 'MKV', codec: 'H.264 RGB · CRF 0', title: en ? 'Every pixel, just as it was.' : '每个像素，原样留存。', text: en ? 'Lossless RGB for fine text, graphics and editing. Larger files; use VLC or a compatible editor.' : '保留原始 RGB 像素，适合精细文字、图形与后期素材。文件较大，建议用 VLC 或兼容剪辑软件。' }
  };
  document.querySelectorAll('[data-quality]').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = modes[button.dataset.quality];
      document.querySelectorAll('[data-quality]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
      Object.keys(item).forEach(function (key) { document.getElementById('quality-' + key).textContent = item[key]; });
    });
  });
})();
