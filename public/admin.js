'use strict';

(() => {
  const form = document.getElementById('profile-form');
  if (!form) return;

  const usernameInput = document.getElementById('username');
  const bioInput = document.getElementById('bio');
  const bioCount = document.getElementById('bio-count');
  const backgroundInput = document.getElementById('background');
  const bgChip = document.getElementById('bg-chip');
  const bgHex = document.getElementById('bg-hex');
  const accentInput = document.getElementById('accent');
  const accentChip = document.getElementById('accent-chip');
  const accentHex = document.getElementById('accent-hex');
  const swatches = Array.from(document.querySelectorAll('.swatch'));
  const themePresets = Array.from(document.querySelectorAll('.theme-preset'));
  const typewriterInput = document.getElementById('typewriter');
  const particleInputs = Array.from(
    document.querySelectorAll('input[name="particles"]'),
  );

  const avatarInput = document.getElementById('avatar-input');
  const avatarBox = document.getElementById('avatar-box');
  const avatarPreview = document.getElementById('avatar-preview');
  const avatarBadge = document.getElementById('avatar-badge');
  const avatarFilename = document.getElementById('avatar-filename');
  const avatarRemove = document.getElementById('avatar-remove');

  const audioInput = document.getElementById('audio-input');
  const audioPreview = document.getElementById('audio-preview');
  const audioFilename = document.getElementById('audio-filename');
  const audioRemove = document.getElementById('audio-remove');

  const previewBg = document.getElementById('preview-bg');
  const previewAvatar = document.getElementById('preview-avatar');
  const previewName = document.getElementById('preview-name');
  const previewBio = document.getElementById('preview-bio');
  const previewFooter = document.getElementById('preview-footer');
  const previewLinks = document.getElementById('preview-links');

  const saveButton = document.getElementById('btn-save');
  const buildButton = document.getElementById('btn-build');
  const saveStateDot = document.getElementById('save-dot');
  const saveStateText = document.getElementById('save-state-text');
  const builtAt = document.getElementById('built-at');

  const toastElement = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastText = document.getElementById('toast-text');

  const TOAST_ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  const LINK_BRANDS = {
    telegram: { brand: '#2aa9e0', label: 'Telegram', icon: 'fa-brands fa-telegram' },
    discord: { brand: '#7c86ff', label: 'Discord', icon: 'fa-brands fa-discord' },
    youtube: { brand: '#ff4d5e', label: 'YouTube', icon: 'fa-brands fa-youtube' },
    tiktok: { brand: '#25f4ee', label: 'TikTok', icon: 'fa-brands fa-tiktok' },
    twitch: { brand: '#9146ff', label: 'Twitch', icon: 'fa-brands fa-twitch' },
    steam: { brand: '#66c0f4', label: 'Steam', icon: 'fa-brands fa-steam' },
    github: { brand: '#e6edf3', label: 'GitHub', icon: 'fa-brands fa-github' },
    spotify: { brand: '#1db954', label: 'Spotify', icon: 'fa-brands fa-spotify' },
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg'];

  let dirty = false;
  let busy = false;
  let toastTimer = null;
  let objectUrl = null;
  let audioObjectUrl = null;

  /* ------------------------------ helpers ------------------------------ */

  function toast(message, type = 'info', duration = 2800) {
    if (!toastElement) return;

    toastElement.classList.remove('toast--success', 'toast--error', 'toast--info');
    toastElement.classList.add(`toast--${type}`);
    toastIcon.className = TOAST_ICONS[type] || TOAST_ICONS.info;
    toastText.textContent = message;
    toastElement.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElement.classList.remove('is-visible');
    }, duration);
  }

  function setDirty(value) {
    dirty = value;
    if (!saveStateDot) return;

    if (value) {
      saveStateDot.classList.remove('bg-emerald-400');
      saveStateDot.classList.add('bg-amber-400');
      saveStateText.textContent = 'Есть несохранённые изменения';
    } else {
      saveStateDot.classList.remove('bg-amber-400');
      saveStateDot.classList.add('bg-emerald-400');
      saveStateText.textContent = 'Все изменения сохранены';
    }
  }

  function setButtonBusy(button, isBusy, label) {
    if (!button) return;

    if (isBusy) {
      if (!button.dataset.originalHtml) {
        button.dataset.originalHtml = button.innerHTML;
      }
      button.disabled = true;
      button.innerHTML =
        '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i><span></span>';
      button.querySelector('span').textContent = label;
    } else {
      button.disabled = false;
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml;
        delete button.dataset.originalHtml;
      }
    }
  }

  function isValidHex(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ''));
  }

  function isLightHex(value) {
    if (!isValidHex(value)) return false;

    const number = parseInt(value.slice(1), 16);
    const channels = [number >> 16, number >> 8, number].map((channel) => {
      const srgb = (channel & 255) / 255;
      return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    });

    return (
      0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2] >
      0.55
    );
  }

  function normalizeUrl(value) {
    let raw = String(value || '').trim();
    if (!raw) return '';

    if (!/^https?:\/\//i.test(raw)) {
      if (!/^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?(?:\/.*)?$/i.test(raw)) {
        return '';
      }
      raw = `https://${raw}`;
    }

    try {
      const url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return url.toString();
    } catch {
      return '';
    }
  }

  function sanitizeHandle(value) {
    const handle = String(value || '').trim().replace(/^@+/, '');
    return /^[a-zA-Z0-9._-]{2,40}$/.test(handle) ? handle : '';
  }

  function normalizeSocialUrl(value, domainPatterns) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return normalizeUrl(raw);
    if (domainPatterns.some((pattern) => pattern.test(raw))) return normalizeUrl(raw);
    return '';
  }

  const TELEGRAM_DOMAINS = [/^(?:www\.)?(?:t\.me|telegram\.me|telegram\.dog)\//i];
  const DISCORD_DOMAINS = [
    /^(?:www\.)?(?:ptb\.|canary\.)?discord(?:app)?\.(?:gg|com)\//i,
  ];
  const YOUTUBE_DOMAINS = [
    /^(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\//i,
  ];
  const TIKTOK_DOMAINS = [/^(?:www\.|m\.)?tiktok\.com\//i];
  const TWITCH_DOMAINS = [/^(?:www\.|m\.|go\.)?twitch\.tv\//i];
  const STEAM_DOMAINS = [/^(?:www\.)?steamcommunity\.com\//i];
  const GITHUB_DOMAINS = [/^(?:www\.)?github\.com\//i];
  const SPOTIFY_DOMAINS = [
    /^(?:www\.|open\.|play\.)?spotify\.com\//i,
    /^(?:www\.)?spotify\.link\//i,
  ];

  function prettyUrl(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, '');
      const pathname = parsed.pathname.replace(/\/+$/, '');
      return `${host}${pathname}${parsed.search}`.slice(0, 56);
    } catch {
      return String(url).slice(0, 56);
    }
  }

  function fieldValue(key) {
    const input = document.getElementById(key);
    return input ? input.value.trim() : '';
  }

  function resolveHandleLink(raw, domains, urlForHandle, extractPattern) {
    let url = normalizeSocialUrl(raw, domains);
    let handle = '';

    if (url) {
      if (extractPattern) {
        const match = url.match(extractPattern);
        if (match) handle = sanitizeHandle(match[1]);
      }
    } else {
      handle = sanitizeHandle(raw);
      if (handle) url = urlForHandle(handle);
    }

    return { url, handle };
  }

  function pushPreviewLink(result, key, url, handle) {
    if (!url) return;
    result.push({
      ...LINK_BRANDS[key],
      meta: handle ? `@${handle}` : prettyUrl(url),
    });
  }

  function collectPreviewLinks() {
    const result = [];

    const telegramRaw = fieldValue('telegram');
    let telegramUrl = normalizeSocialUrl(telegramRaw, TELEGRAM_DOMAINS);
    let telegramHandle = '';
    if (telegramUrl) {
      const match = telegramUrl.match(/t\.me\/([^/?#]+)/i);
      if (match) telegramHandle = sanitizeHandle(match[1]);
    } else {
      telegramHandle = sanitizeHandle(telegramRaw);
      if (telegramHandle) telegramUrl = `https://t.me/${telegramHandle}`;
    }
    pushPreviewLink(result, 'telegram', telegramUrl, telegramHandle);

    const discordRaw = fieldValue('discord');
    const discordUrl = normalizeSocialUrl(discordRaw, DISCORD_DOMAINS);
    if (discordUrl) {
      pushPreviewLink(result, 'discord', discordUrl);
    } else if (discordRaw) {
      const name = discordRaw.replace(/^@+/, '').trim();
      if (/^[\w.#-]{2,64}$/.test(name)) {
        result.push({ ...LINK_BRANDS.discord, meta: `@${name}` });
      }
    }

    const youtubeRaw = fieldValue('youtube');
    let youtubeUrl = normalizeSocialUrl(youtubeRaw, YOUTUBE_DOMAINS);
    let youtubeHandle = '';
    if (youtubeUrl) {
      const match = youtubeUrl.match(/youtube\.com\/@([^/?#]+)/i);
      if (match) youtubeHandle = sanitizeHandle(match[1]);
    } else {
      youtubeHandle = sanitizeHandle(youtubeRaw);
      if (youtubeHandle) youtubeUrl = `https://youtube.com/@${youtubeHandle}`;
    }
    pushPreviewLink(result, 'youtube', youtubeUrl, youtubeHandle);

    const tiktok = resolveHandleLink(
      fieldValue('tiktok'),
      TIKTOK_DOMAINS,
      (handle) => `https://tiktok.com/@${handle}`,
      /tiktok\.com\/@([^/?#]+)/i,
    );
    pushPreviewLink(result, 'tiktok', tiktok.url, tiktok.handle);

    const twitch = resolveHandleLink(
      fieldValue('twitch'),
      TWITCH_DOMAINS,
      (handle) => `https://twitch.tv/${handle}`,
      /twitch\.tv\/([^/?#]+)/i,
    );
    pushPreviewLink(result, 'twitch', twitch.url, twitch.handle);

    const steamRaw = fieldValue('steam');
    let steamUrl = normalizeSocialUrl(steamRaw, STEAM_DOMAINS);
    let steamHandle = '';
    if (steamUrl) {
      const match = steamUrl.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
      if (match) steamHandle = sanitizeHandle(match[1]);
    } else if (/^\d{17}$/.test(steamRaw)) {
      steamUrl = `https://steamcommunity.com/profiles/${steamRaw}`;
    } else {
      steamHandle = sanitizeHandle(steamRaw);
      if (steamHandle) steamUrl = `https://steamcommunity.com/id/${steamHandle}`;
    }
    pushPreviewLink(result, 'steam', steamUrl, steamHandle);

    const github = resolveHandleLink(
      fieldValue('github'),
      GITHUB_DOMAINS,
      (handle) => `https://github.com/${handle}`,
      /github\.com\/([^/?#]+)/i,
    );
    pushPreviewLink(result, 'github', github.url, github.handle);

    const spotifyRaw = fieldValue('spotify');
    let spotifyUrl = normalizeSocialUrl(spotifyRaw, SPOTIFY_DOMAINS);
    let spotifyHandle = '';
    if (spotifyUrl) {
      const match = spotifyUrl.match(/spotify\.com\/user\/([^/?#]+)/i);
      if (match) spotifyHandle = sanitizeHandle(match[1]);
    } else {
      spotifyHandle = sanitizeHandle(spotifyRaw);
      if (spotifyHandle) {
        spotifyUrl = `https://open.spotify.com/user/${spotifyHandle}`;
      }
    }
    pushPreviewLink(result, 'spotify', spotifyUrl, spotifyHandle);

    return result;
  }

  function renderPreviewLinks() {
    if (!previewLinks) return;
    previewLinks.replaceChildren();

    const links = collectPreviewLinks();

    if (!links.length) {
      const empty = document.createElement('p');
      empty.className =
        'rounded-lg border border-dashed border-white/15 px-2 py-1.5 text-center text-[10px] text-white/35';
      empty.textContent = 'Ссылки появятся здесь';
      previewLinks.appendChild(empty);
      return;
    }

    links.forEach((link) => {
      const row = document.createElement('div');
      row.className = 'preview-link';
      row.style.setProperty('--brand', link.brand);

      const icon = document.createElement('span');
      icon.className = 'preview-link__icon';
      icon.innerHTML = `<i class="${link.icon}" aria-hidden="true"></i>`;

      const body = document.createElement('span');
      body.className = 'min-w-0 flex-1';

      const label = document.createElement('span');
      label.className = 'preview-link__label block';
      label.textContent = link.label;

      const meta = document.createElement('span');
      meta.className = 'preview-link__meta block';
      meta.textContent = link.meta;

      body.append(label, meta);
      row.append(icon, body);
      previewLinks.appendChild(row);
    });
  }

  function syncThemePresets() {
    const background = backgroundInput.value.toLowerCase();
    const accent = accentInput.value.toLowerCase();

    themePresets.forEach((preset) => {
      const matches =
        preset.dataset.bg.toLowerCase() === background &&
        preset.dataset.accent.toLowerCase() === accent;
      preset.classList.toggle('is-active', matches);
    });
  }

  function applyColor(color) {
    if (!isValidHex(color)) return;

    const normalized = color.toLowerCase();
    backgroundInput.value = normalized;
    bgChip.style.backgroundColor = normalized;
    bgHex.textContent = normalized;
    previewBg.style.backgroundColor = normalized;
    previewBg.classList.toggle('is-light', isLightHex(normalized));

    swatches.forEach((swatch) => {
      swatch.classList.toggle('is-active', swatch.dataset.color === normalized);
    });

    syncThemePresets();
  }

  function applyAccent(color) {
    if (!isValidHex(color)) return;

    const normalized = color.toLowerCase();
    accentInput.value = normalized;
    accentChip.style.backgroundColor = normalized;
    accentHex.textContent = normalized;
    previewBg.style.setProperty('--accent', normalized);
    syncThemePresets();
  }

  function applyThemePreset(preset) {
    applyColor(preset.dataset.bg);
    applyAccent(preset.dataset.accent);
    setDirty(true);
  }

  function updatePreviewText() {
    previewName.textContent = usernameInput.value.trim() || 'yourname';
    previewBio.textContent = bioInput.value.trim() || 'Описание появится здесь';
    previewBio.classList.toggle(
      'is-typewriter',
      typewriterInput.checked && Boolean(bioInput.value.trim()),
    );
    bioCount.textContent = String(bioInput.value.length);
  }

  function updatePreviewAvatar(src) {
    avatarPreview.src = src;
    previewAvatar.src = src;
  }

  function updatePreviewLight() {
    previewBg.classList.toggle('is-light', isLightHex(backgroundInput.value));
  }

  function resetAudioPreview() {
    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
      audioObjectUrl = null;
    }

    audioInput.value = '';
    audioPreview.pause();
    audioPreview.removeAttribute('src');
    audioPreview.load();
    audioPreview.classList.add('hidden');
    audioFilename.textContent = 'MP3 · до 5 МБ';
    audioRemove.classList.add('hidden');
  }

  function showAudioPreview(src, fileName) {
    audioPreview.src = src;
    audioPreview.classList.remove('hidden');
    audioPreview.load();
    audioFilename.textContent = fileName;
    audioRemove.classList.remove('hidden');
  }

  function validateForm() {
    if (!form.reportValidity()) return false;

    if (!usernameInput.value.trim()) {
      usernameInput.focus();
      toast('Username не может быть пустым.', 'error');
      return false;
    }

    return true;
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  function describeError(error) {
    if (error instanceof TypeError) {
      return 'Сервер недоступен. Проверь, что он запущен на порту 9999.';
    }
    return error.message || 'Что-то пошло не так.';
  }

  /* ------------------------------ actions ------------------------------ */

  async function persist({ silent = false } = {}) {
    const formData = new FormData(form);
    // An unchecked checkbox is not sent by the browser; send an explicit value
    // so the server can turn the typewriter off.
    formData.set('typewriter', typewriterInput.checked ? 'on' : 'off');

    const response = await fetch('/api/save', {
      method: 'POST',
      body: formData,
    });
    const data = await readJson(response);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Не удалось сохранить профиль.');
    }

    avatarInput.value = '';
    avatarFilename.classList.add('hidden');
    avatarBadge.classList.add('hidden');
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }

    updatePreviewAvatar(data.avatarUrl);
    avatarRemove.classList.toggle('hidden', !data.profile.avatar);

    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
      audioObjectUrl = null;
    }

    if (data.audioUrl) {
      showAudioPreview(data.audioUrl, data.profile.audio.split('/').pop());
    } else {
      resetAudioPreview();
    }
    audioInput.value = '';

    setDirty(false);

    if (!silent) {
      toast('Профиль сохранён.', 'success');
    }

    return data;
  }

  async function handleSave() {
    if (busy) return;
    if (!validateForm()) return;

    busy = true;
    setButtonBusy(saveButton, true, 'Сохраняем…');

    try {
      await persist();
    } catch (error) {
      toast(describeError(error), 'error', 4200);
    } finally {
      busy = false;
      setButtonBusy(saveButton, false);
    }
  }

  async function handleBuild() {
    if (busy) return;
    if (!validateForm()) return;

    busy = true;
    setButtonBusy(buildButton, true, 'Собираем…');
    saveButton.disabled = true;

    try {
      await persist({ silent: true });

      const response = await fetch('/api/build', { method: 'POST' });
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось собрать проект.');
      }

      if (data.previewUrl) {
        document.querySelectorAll('[data-open-dist]').forEach((link) => {
          link.href = data.previewUrl;
          link.classList.remove('pointer-events-none', 'opacity-40');
        });
      }

      if (data.builtAt) {
        builtAt.textContent = new Intl.DateTimeFormat('ru-RU', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(data.builtAt));
      }

      setDirty(false);
      toast(
        'Готово! index.html, style.css, script.js и assets обновлены.',
        'success',
        3800,
      );
    } catch (error) {
      toast(describeError(error), 'error', 4600);
    } finally {
      busy = false;
      setButtonBusy(buildButton, false);
      saveButton.disabled = false;
    }
  }

  async function handleRemoveAvatar() {
    if (busy) return;

    const confirmed = window.confirm('Убрать аватарку? Текущий файл будет откреплён.');
    if (!confirmed) return;

    avatarRemove.disabled = true;

    try {
      const response = await fetch('/api/avatar/remove', { method: 'POST' });
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось удалить аватарку.');
      }

      avatarInput.value = '';
      avatarFilename.classList.add('hidden');
      avatarBadge.classList.add('hidden');
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      avatarRemove.classList.add('hidden');
      updatePreviewAvatar(`${data.avatarUrl}?v=${Date.now()}`);
      toast('Аватарка удалена.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      avatarRemove.disabled = false;
    }
  }

  async function handleRemoveAudio() {
    if (busy) return;

    const confirmed = window.confirm('Убрать фоновую музыку? Файл будет удалён.');
    if (!confirmed) return;

    audioRemove.disabled = true;

    try {
      const response = await fetch('/api/audio/remove', { method: 'POST' });
      const data = await readJson(response);

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось удалить музыку.');
      }

      resetAudioPreview();
      toast('Фоновая музыка удалена.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      audioRemove.disabled = false;
    }
  }

  function handleAvatarFile(file) {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Поддерживаются только PNG, JPG, WEBP и GIF.', 'error');
      avatarInput.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast('Файл слишком большой. Максимум — 5 МБ.', 'error');
      avatarInput.value = '';
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);

    updatePreviewAvatar(objectUrl);
    avatarBadge.classList.remove('hidden');
    avatarRemove.classList.remove('hidden');
    avatarFilename.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} МБ`;
    avatarFilename.classList.remove('hidden');
    setDirty(true);
  }

  function handleAudioFile(file) {
    if (!file) return;

    const looksLikeMp3 = /\.mp3$/i.test(file.name);
    if (!ALLOWED_AUDIO_TYPES.includes(file.type) && !looksLikeMp3) {
      toast('Можно загрузить только MP3-файл.', 'error');
      audioInput.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast('Файл слишком большой. Максимум — 5 МБ.', 'error');
      audioInput.value = '';
      return;
    }

    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    audioObjectUrl = URL.createObjectURL(file);

    showAudioPreview(
      audioObjectUrl,
      `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} МБ`,
    );
    setDirty(true);
  }

  /* ------------------------------ events ------------------------------- */

  form.addEventListener('input', (event) => {
    if (event.target === bioInput) {
      bioCount.textContent = String(bioInput.value.length);
    }

    if (event.target === backgroundInput) {
      applyColor(backgroundInput.value);
    }

    if (event.target === accentInput) {
      applyAccent(accentInput.value);
    }

    if (event.target === typewriterInput) {
      updatePreviewText();
    }

    updatePreviewText();
    renderPreviewLinks();
    setDirty(true);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSave();
  });

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => {
      applyColor(swatch.dataset.color);
      setDirty(true);
    });
  });

  themePresets.forEach((preset) => {
    preset.addEventListener('click', () => applyThemePreset(preset));
  });

  particleInputs.forEach((input) => {
    input.addEventListener('change', () => setDirty(true));
  });

  avatarInput.addEventListener('change', () => {
    handleAvatarFile(avatarInput.files && avatarInput.files[0]);
  });

  audioInput.addEventListener('change', () => {
    handleAudioFile(audioInput.files && audioInput.files[0]);
  });

  avatarRemove.addEventListener('click', handleRemoveAvatar);
  audioRemove.addEventListener('click', handleRemoveAudio);

  avatarBox.addEventListener('dragover', (event) => {
    event.preventDefault();
    avatarBox.classList.add('is-dragover');
  });

  avatarBox.addEventListener('dragleave', () => {
    avatarBox.classList.remove('is-dragover');
  });

  avatarBox.addEventListener('drop', (event) => {
    event.preventDefault();
    avatarBox.classList.remove('is-dragover');

    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;

    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      avatarInput.files = transfer.files;
    } catch {
      // The DataTransfer constructor is not available in very old browsers.
    }

    handleAvatarFile(file);
  });

  saveButton.addEventListener('click', handleSave);
  buildButton.addEventListener('click', handleBuild);

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      handleSave();
    }
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  /* ------------------------------- init -------------------------------- */

  applyColor(backgroundInput.value);
  applyAccent(accentInput.value);
  updatePreviewLight();
  updatePreviewText();
  renderPreviewLinks();

  if (usernameInput.value.trim()) {
    avatarPreview.alt = `Аватар ${usernameInput.value.trim()}`;
  }
})();
