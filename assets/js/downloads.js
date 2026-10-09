/* GitHub is the source of truth. No release tag or asset filename is pinned. */
(function () {
  'use strict';
  var en = document.documentElement.lang === 'en';
  var repository = 'greatworks/CatEyeScreenRecorder';
  var latestPage = 'https://github.com/' + repository + '/releases/latest';
  var api = 'https://api.github.com/repos/' + repository + '/releases/latest';
  var links = document.querySelectorAll('[data-download]');
  var pending = null;
  var busy = false;
  var toastTimer;

  function message(zh, english) { return en ? english : zh; }
  function notify(text, error) {
    var toast = document.querySelector('.toast');
    if (toast) {
      toast.textContent = text;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      if (!error) toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 5000);
    }
    var feedback = document.querySelector('.download-feedback');
    if (feedback) { feedback.textContent = text; feedback.hidden = false; }
  }

  function setBusy(value) {
    busy = value;
    document.querySelectorAll('[data-download], [data-copy]').forEach(function (button) {
      button.setAttribute('aria-busy', String(value));
      button.setAttribute('aria-disabled', String(value));
    });
  }

  function assetUrl(asset) {
    if (!asset || typeof asset.browser_download_url !== 'string') return null;
    try {
      var url = new URL(asset.browser_download_url);
      if (url.protocol !== 'https:' || url.host !== 'github.com' || url.username || url.password ||
          url.pathname.indexOf('/' + repository + '/releases/download/') !== 0) return null;
      return url.href;
    } catch (error) { return null; }
  }

  function chooseAsset(release) {
    if (!release || release.draft !== false || release.prerelease !== false ||
        typeof release.tag_name !== 'string' || !Array.isArray(release.assets)) throw new Error('Invalid release');
    var candidates = release.assets.filter(function (asset) {
      return typeof asset.name === 'string' && /^CatEyeScreenRecorder[-_.]/i.test(asset.name) &&
        /windows[-_. ](?:x64|amd64)/i.test(asset.name) && !/(?:arm64|aarch64)/i.test(asset.name) &&
        /\.(exe|msi|zip)$/i.test(asset.name) && asset.state === 'uploaded' && asset.size > 0 && assetUrl(asset);
    });
    function rank(asset) {
      if (/\.(exe|msi)$/i.test(asset.name)) return /(?:setup|installer)/i.test(asset.name) ? 0 : 1;
      return 2;
    }
    candidates.sort(function (a, b) { return rank(a) - rank(b) || a.name.localeCompare(b.name); });
    if (!candidates.length) throw new Error('No Windows x64 asset in latest stable release');
    return { release: release, asset: candidates[0], url: assetUrl(candidates[0]) };
  }

  function render(result) {
    var portable = /\.zip$/i.test(result.asset.name);
    var extension = result.asset.name.split('.').pop().toUpperCase();
    var values = {
      version: result.release.tag_name,
      size: (result.asset.size / 1048576).toFixed(1) + ' MiB',
      format: extension + ' ' + (portable ? message('便携版', 'portable') : message('安装包', 'installer'))
    };
    Object.keys(values).forEach(function (key) {
      document.querySelectorAll('[data-release-' + key + ']').forEach(function (el) { el.textContent = values[key]; });
    });
    document.querySelectorAll('[data-package-kind]').forEach(function (el) {
      el.textContent = portable ? message('完整解压后即可使用，请保留所有组件。', 'Extract the entire ZIP and keep all components together.') :
        message('安装后从桌面或开始菜单打开，卸载保留录制文件。', 'Open from your desktop or Start menu after installation. Uninstalling keeps your recordings.');
    });
    document.querySelectorAll('[data-install-title]').forEach(function (el) {
      el.textContent = portable ? message('全部解压到本地', 'Extract everything') : message('双击安装包', 'Run the installer');
    });
    document.querySelectorAll('[data-install-description]').forEach(function (el) {
      el.textContent = portable ? message('右键 ZIP，选择“全部解压缩”。保留 NAudio.dll 和 tools 文件夹，不要只提取 EXE。',
        'Extract the entire ZIP. Keep NAudio.dll and the tools folder beside the app; do not extract only the EXE.') :
        message('按向导完成安装，可创建桌面快捷方式；默认仅为当前用户安装，无需管理员权限。',
          'Follow the setup wizard and optionally create a desktop shortcut. The default per-user installation needs no administrator rights.');
    });
    document.querySelectorAll('[data-install-lead]').forEach(function (el) {
      el.textContent = portable ? message('完整解压后，打开文件夹中的猫眼程序。', 'Extract everything and open CatEye from the folder.') :
        message('按向导安装，从桌面或开始菜单打开。', 'Install and open from your desktop or Start menu.');
    });
    document.querySelectorAll('[data-open-description]').forEach(function (el) {
      el.textContent = portable ? message('运行 CatEyeScreenRecorder.exe，选择范围、画质和声音，先录一小段检查效果。',
        'Run CatEyeScreenRecorder.exe. Choose the area, quality and audio, then make a short test recording.') :
        message('从桌面或开始菜单打开猫眼，选择范围、画质和声音，先录一小段检查效果。',
          'Open CatEye from your desktop or Start menu. Choose the area, quality and audio, then make a short test recording.');
    });
  }

  function getLatest() {
    // Coalesce only an in-flight request; every later click checks GitHub again.
    if (pending) return pending;
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 9000);
    pending = fetch(api, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store', credentials: 'omit', signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error('GitHub HTTP ' + response.status);
      return response.json();
    }).then(chooseAsset).then(function (result) { render(result); return result; });
    pending = pending.then(function (result) {
      clearTimeout(timeout); pending = null; return result;
    }, function (error) {
      clearTimeout(timeout); pending = null; throw error;
    });
    return pending;
  }

  function fail() {
    notify(message('暂时无法获取最新安装包，请重试，或通过 GitHub 最新发布页下载。',
      'Unable to get the latest download. Please retry or use the latest GitHub release.'), true);
    var toast = document.querySelector('.toast');
    if (toast) {
      var fallback = document.createElement('a');
      fallback.href = latestPage; fallback.target = '_blank'; fallback.rel = 'noopener noreferrer';
      fallback.textContent = message('打开 GitHub 最新发布页', 'Open latest GitHub release');
      toast.appendChild(fallback);
    }
  }

  links.forEach(function (link) {
    // Keep the no-JS / context-menu fallback version-independent as well.
    link.href = latestPage;
    link.addEventListener('click', function (event) {
      event.preventDefault();
      if (busy) return;
      setBusy(true);
      notify(message('正在获取最新安装包…', 'Getting the latest download…'));
      getLatest().then(function (result) {
        var transfer = document.createElement('a');
        transfer.href = result.url;
        transfer.setAttribute('download', result.asset.name);
        transfer.hidden = true;
        document.body.appendChild(transfer);
        transfer.click();
        transfer.remove();
        notify(message('已向浏览器请求下载 ', 'Download requested: ') + result.release.tag_name +
          message('。请查看浏览器下载列表。', '. Check your browser downloads.'));
      }).catch(fail).then(function () { setBusy(false); });
    });
  });

  var copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click', function () {
    if (busy) return;
    setBusy(true);
    getLatest().then(function (result) {
      function fallback() {
        var field = document.querySelector('.copy-fallback');
        field.hidden = false; field.value = result.url; field.focus(); field.select();
        notify(message('请复制已选中的地址，在 Windows 电脑上打开。', 'Copy the selected link to your Windows computer.'));
      }
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(result.url).then(function () {
          notify(message('最新安装包下载地址已复制。', 'Latest download link copied.'));
        }, fallback);
      }
      fallback();
    }).catch(fail).then(function () { setBusy(false); });
  });

  if (links.length) getLatest().catch(function () {
    document.querySelectorAll('[data-release-size]').forEach(function (el) { el.textContent = message('体积待获取', 'Size unavailable'); });
  });
})();
