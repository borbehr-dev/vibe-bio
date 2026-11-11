'use strict';

(() => {
  const form = document.getElementById('profile-form');
  if (!form) return;

  /* ------------------------------- elements ------------------------------- */

  const $ = (id) => document.getElementById(id);

  const usernameInput = $('username');
  const displayNameInput = $('displayName');
  const bioInput = $('bio');
  const bioCount = $('bio-count');
  const badgesInput = $('badges');

  const backgroundInput = $('background');
  const bgChip = $('bg-chip');
  const bgHex = $('bg-hex');
  const accentInput = $('accent');
  const accentChip = $('accent-chip');
  const accentHex = $('accent-hex');
  const textColorPicker = $('textColor-picker');
  const textChip = $('text-chip');
  const textColorAuto = $('textColor-auto');
  const textColorHidden = $('textColor');
  const fontSelect = $('font');

  const cardOpacity = $('cardOpacity');
  const cardOpacityValue = $('cardOpacity-value');
  const cardBlur = $('cardBlur');
  const cardBlurValue = $('cardBlur-value');

  const swatches = Array.from(document.querySelectorAll('.swatch'));
  const themePresets = Array.from(document.querySelectorAll('.theme-preset'));

  const avatarInput = $('avatar-input');
  const avatarBox = $('avatar-box');
  const avatarPreview = $('avatar-preview');
  const avatarBadge = $('avatar-badge');
  const avatarFilename = $('avatar-filename');
  const avatarRemove = $('avatar-remove');

  const backgroundInputFile = $('background-input');
  const backgroundPreview = $('background-preview');
  const backgroundFilename = $('background-filename');
  const backgroundRemove = $('background-remove');

  const audioInput = $('audio-input');
  const audioPreview = $('audio-preview');
  const audioFilename = $('audio-filename');
  const audioRemove = $('audio-remove');
  const audioTitleInput = $('audioTitle');
  const audioArtistInput = $('audioArtist');

  const coverInput = $('cover-input');
  const coverPreview = $('cover-preview');
  const coverFilename = $('cover-filename');
  const coverRemove = $('cover-remove');

  const customLinksList = $('custom-links-list');
  const customLinksEmpty = $('custom-links-empty');
  const customLinksAdd = $('custom-link-add');
  const customLinksHidden = $('customLinks');

  const previewBg = $('preview-bg');
  const previewBgImage = $('preview-bg-image');
  const previewCard = $('preview-card');
  const previewAvatarWrap = $('preview-avatar-wrap');
  const previewAvatar = $('preview-avatar');
  const previewName = $('preview-name');
  const previewHandle = $('preview-handle');
  const previewBadges = $('preview-badges');
  const previewBio = $('preview-bio');
  const previewSocials = $('preview-socials');
  const previewLinks = $('preview-links');
  const previewMeta = $('preview-meta');
  const previewViewsWrap = $('preview-views-wrap');
  const previewViews = $('preview-views');
  const previewClockWrap = $('preview-clock-wrap');
  const previewClock = $('preview-clock');
  const previewShareWrap = $('preview-share-wrap');
  const previewPlayer = $('preview-player');
  const previewPlayerCover = $('preview-player-cover');
  const previewPlayerTitle = $('preview-player-title');
  const previewPlayerArtist = $('preview-player-artist');

  const discordIdInput = $('discordId');
  const showDiscordInput = $('showDiscord');
  const discordCheck = $('discord-check');
  const discordStatus = $('discord-status');
  const previewPresence = $('preview-presence');
  const previewPresenceDot = $('preview-presence-dot');
  const previewPresenceText = $('preview-presence-text');
  const previewPresenceActivity = $('preview-presence-activity');
  const previewAvatarStatus = $('preview-avatar-status');

  const saveButton = $('btn-save');
  const buildButton = $('btn-build');
  const saveStateDot = $('save-dot');
  const saveStateText = $('save-state-text');
  const builtAt = $('built-at');

  const toastElement = $('toast');
  const toastIcon = $('toast-icon');
  const toastText = $('toast-text');

  /* -------------------------------- constants ------------------------------ */

  const MB = 1024 * 1024;

  const TOAST_ICONS = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info',
  };

  const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg'];

  const FILE_LIMITS = {
    avatar: 5 * MB,
    background: 10 * MB,
    audio: 10 * MB,
    cover: 5 * MB,
  };

  const FONT_STACKS = {
    inter: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    poppins: '"Poppins", "Segoe UI", system-ui, sans-serif',
    sora: '"Sora", "Segoe UI", system-ui, sans-serif',
    manrope: '"Manrope", "Segoe UI", system-ui, sans-serif',
    space: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
    outfit: '"Outfit", "Segoe UI", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
    playfair: '"Playfair Display", Georgia, serif',
  };

  const SOCIAL_KEYS = [
    'telegram',
    'discord',
    'youtube',
    'tiktok',
    'twitch',
    'steam',
    'github',
    'spotify',
    'x',
    'instagram',
    'vk',
    'reddit',
    'roblox',
    'website',
    'email',
  ];

  const SOCIAL_BRANDS = {
    telegram: { label: 'Telegram', icon: 'fa-brands fa-telegram', brand: '#2aa9e0' },
    discord: { label: 'Discord', icon: 'fa-brands fa-discord', brand: '#7c86ff' },
    youtube: { label: 'YouTube', icon: 'fa-brands fa-youtube', brand: '#ff4d5e' },
    tiktok: { label: 'TikTok', icon: 'fa-brands fa-tiktok', brand: '#25f4ee' },
    twitch: { label: 'Twitch', icon: 'fa-brands fa-twitch', brand: '#9146ff' },
    steam: { label: 'Steam', icon: 'fa-brands fa-steam', brand: '#66c0f4' },
    github: { label: 'GitHub', icon: 'fa-brands fa-github', brand: '#e6edf3' },
    spotify: { label: 'Spotify', icon: 'fa-brands fa-spotify', brand: '#1db954' },
    x: { label: 'X', icon: 'fa-brands fa-x-twitter', brand: '#f4f4f5' },
    instagram: { label: 'Instagram', icon: 'fa-brands fa-instagram', brand: '#e1306c' },
    vk: { label: 'VK', icon: 'fa-brands fa-vk', brand: '#0077ff' },
    reddit: { label: 'Reddit', icon: 'fa-brands fa-reddit-alien', brand: '#ff4500' },
    roblox: { label: 'Roblox', icon: 'fa-solid fa-gamepad', brand: '#f43f5e' },
    website: { label: 'Сайт', icon: 'fa-solid fa-globe', brand: '#38bdf8' },
    email: { label: 'Почта', icon: 'fa-solid fa-envelope', brand: '#f59e0b' },
  };

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
  const X_DOMAINS = [/^(?:www\.|mobile\.)?(?:x|twitter)\.com\//i];
  const INSTAGRAM_DOMAINS = [/^(?:www\.|m\.)?instagram\.com\//i];
  const VK_DOMAINS = [/^(?:www\.|m\.)?vk\.(?:com|ru)\//i];
  const REDDIT_DOMAINS = [
    /^(?:www\.|old\.|new\.)?reddit\.com\//i,
    /^(?:www\.)?redd\.it\//i,
  ];
  const ROBLOX_DOMAINS = [/^(?:www\.)?roblox\.com\//i];

  /* --------------------------------- state --------------------------------- */

  const profileData = readProfileData();
  const objectUrls = {
    avatar: null,
    background: null,
    audio: null,
    cover: null,
  };

  let customLinks = Array.isArray(profileData.customLinks)
    ? profileData.customLinks
      .slice(0, 8)
      .map((item) => ({
        label: String((item && item.label) || ''),
        url: String((item && item.url) || ''),
      }))
    : [];

  let backgroundSrc = cssUrl(backgroundPreview && backgroundPreview.style.backgroundImage);
  let coverSrc = cssUrl(coverPreview && coverPreview.style.backgroundImage);
  let hasAudio = Boolean(audioPreview && audioPreview.getAttribute('src'));

  let dirty = false;
  let busy = false;
  let toastTimer = null;
  let clockTimer = null;
  let discordTimer = null;
  let discordPollTimer = null;
  let discordRequest = 0;

  /* -------------------------------- helpers -------------------------------- */

  function readProfileData() {
    const node = document.getElementById('profile-data');
    if (!node) return {};

    try {
      return JSON.parse(node.textContent || '{}') || {};
    } catch {
      return {};
    }
  }

  function toast(message, type = 'info', duration = 2800) {
    if (!toastElement) return;

    toastElement.classList.remove('toast--success', 'toast--error', 'toast--info');
    toastElement.classList.add(`toast--${type}`);
    if (toastIcon) toastIcon.className = TOAST_ICONS[type] || TOAST_ICONS.info;
    if (toastText) toastText.textContent = message;
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
      if (saveStateText) saveStateText.textContent = 'Есть несохранённые изменения';
    } else {
      saveStateDot.classList.remove('bg-amber-400');
      saveStateDot.classList.add('bg-emerald-400');
      if (saveStateText) saveStateText.textContent = 'Все изменения сохранены';
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
      const span = button.querySelector('span');
      if (span) span.textContent = label;
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

  function hexToRgba(hex, alpha) {
    if (!isValidHex(hex)) return `rgba(245, 246, 250, ${alpha})`;
    const number = parseInt(hex.slice(1), 16);
    const r = (number >> 16) & 255;
    const g = (number >> 8) & 255;
    const b = number & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function cssUrl(value) {
    const match = /^url\((['"]?)(.*)\1\)$/.exec(String(value || '').trim());
    return match ? match[2] : '';
  }

  function basename(value) {
    return String(value || '').split('/').pop() || '';
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
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

  function checkedValue(name) {
    const input = document.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : '';
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

  function formatViews(value) {
    const number = Number.parseInt(value, 10) || 0;
    try {
      return new Intl.NumberFormat('ru-RU').format(number);
    } catch {
      return String(number);
    }
  }

  async function readJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function postJson(url, options = {}) {
    const response = await fetch(url, { method: 'POST', ...options });
    const data = await readJson(response);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Запрос не удался.');
    }

    return data;
  }

  function describeError(error) {
    if (error instanceof TypeError) {
      return 'Сервер недоступен. Проверь, что он запущен на порту 9999.';
    }
    return error.message || 'Что-то пошло не так.';
  }

  function fileSizeLabel(file) {
    return `${(file.size / MB).toFixed(2)} МБ`;
  }

  function revokeObjectUrl(kind) {
    if (objectUrls[kind]) {
      URL.revokeObjectURL(objectUrls[kind]);
      objectUrls[kind] = null;
    }
  }

  /* ------------------------------ social links ----------------------------- */

  function collectSocials() {
    const links = {};
    for (const key of SOCIAL_KEYS) links[key] = fieldValue(key);

    const result = [];
    const push = (key, href, handle, copy) => {
      const brand = SOCIAL_BRANDS[key];
      const meta = copy
        ? `@${copy}`
        : handle
          ? `@${handle}`
          : href
            ? prettyUrl(href)
            : '';

      result.push({
        key,
        label: brand.label,
        icon: brand.icon,
        brand: brand.brand,
        href: href || '',
        copy: copy || '',
        meta,
      });
    };

    const telegramRaw = links.telegram;
    let telegramUrl = normalizeSocialUrl(telegramRaw, TELEGRAM_DOMAINS);
    let telegramHandle = '';
    if (telegramUrl) {
      const match = telegramUrl.match(/t\.me\/([^/?#]+)/i);
      if (match) telegramHandle = sanitizeHandle(match[1]);
    } else {
      telegramHandle = sanitizeHandle(telegramRaw);
      if (telegramHandle) telegramUrl = `https://t.me/${telegramHandle}`;
    }
    if (telegramUrl) push('telegram', telegramUrl, telegramHandle);

    const discordRaw = links.discord;
    const discordUrl = normalizeSocialUrl(discordRaw, DISCORD_DOMAINS);
    if (discordUrl) {
      push('discord', discordUrl, '');
    } else if (discordRaw) {
      const name = discordRaw.replace(/^@+/, '').trim();
      if (/^[\w.#-]{2,64}$/.test(name)) push('discord', '', '', name);
    }

    const youtubeRaw = links.youtube;
    let youtubeUrl = normalizeSocialUrl(youtubeRaw, YOUTUBE_DOMAINS);
    let youtubeHandle = '';
    if (youtubeUrl) {
      const match = youtubeUrl.match(/youtube\.com\/@([^/?#]+)/i);
      if (match) youtubeHandle = sanitizeHandle(match[1]);
    } else {
      youtubeHandle = sanitizeHandle(youtubeRaw);
      if (youtubeHandle) youtubeUrl = `https://youtube.com/@${youtubeHandle}`;
    }
    if (youtubeUrl) push('youtube', youtubeUrl, youtubeHandle);

    const tiktok = resolveHandleLink(
      links.tiktok,
      TIKTOK_DOMAINS,
      (handle) => `https://tiktok.com/@${handle}`,
      /tiktok\.com\/@([^/?#]+)/i,
    );
    if (tiktok.url) push('tiktok', tiktok.url, tiktok.handle);

    const twitch = resolveHandleLink(
      links.twitch,
      TWITCH_DOMAINS,
      (handle) => `https://twitch.tv/${handle}`,
      /twitch\.tv\/([^/?#]+)/i,
    );
    if (twitch.url) push('twitch', twitch.url, twitch.handle);

    const steamRaw = links.steam;
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
    if (steamUrl) push('steam', steamUrl, steamHandle);

    const github = resolveHandleLink(
      links.github,
      GITHUB_DOMAINS,
      (handle) => `https://github.com/${handle}`,
      /github\.com\/([^/?#]+)/i,
    );
    if (github.url) push('github', github.url, github.handle);

    const spotifyRaw = links.spotify;
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
    if (spotifyUrl) push('spotify', spotifyUrl, spotifyHandle);

    const x = resolveHandleLink(
      links.x,
      X_DOMAINS,
      (handle) => `https://x.com/${handle}`,
      /(?:x|twitter)\.com\/([^/?#]+)/i,
    );
    if (x.url) push('x', x.url, x.handle);

    const instagram = resolveHandleLink(
      links.instagram,
      INSTAGRAM_DOMAINS,
      (handle) => `https://instagram.com/${handle}`,
      /instagram\.com\/([^/?#]+)/i,
    );
    if (instagram.url) push('instagram', instagram.url, instagram.handle);

    const vk = resolveHandleLink(
      links.vk,
      VK_DOMAINS,
      (handle) => `https://vk.com/${handle}`,
      /vk\.(?:com|ru)\/([^/?#]+)/i,
    );
    if (vk.url) push('vk', vk.url, vk.handle);

    const redditRaw = links.reddit;
    let redditUrl = normalizeSocialUrl(redditRaw, REDDIT_DOMAINS);
    let redditHandle = '';
    if (redditUrl) {
      const match = redditUrl.match(/(?:reddit\.com|redd\.it)\/(?:u|user)\/([^/?#]+)/i);
      if (match) redditHandle = sanitizeHandle(match[1]);
    } else {
      redditHandle = sanitizeHandle(redditRaw.replace(/^\/?u\//i, ''));
      if (redditHandle) redditUrl = `https://reddit.com/user/${redditHandle}`;
    }
    if (redditUrl) push('reddit', redditUrl, redditHandle);

    const robloxRaw = links.roblox;
    let robloxUrl = normalizeSocialUrl(robloxRaw, ROBLOX_DOMAINS);
    if (!robloxUrl && /^\d{5,15}$/.test(robloxRaw)) {
      robloxUrl = `https://www.roblox.com/users/${robloxRaw}/profile`;
    } else if (!robloxUrl) {
      const handle = sanitizeHandle(robloxRaw);
      if (handle) {
        robloxUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(handle)}`;
      }
    }
    if (robloxUrl) push('roblox', robloxUrl, '');

    const websiteUrl = normalizeUrl(links.website);
    if (websiteUrl) push('website', websiteUrl, '');

    const emailRaw = String(links.email || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw)) {
      const brand = SOCIAL_BRANDS.email;
      result.push({
        key: 'email',
        label: brand.label,
        icon: brand.icon,
        brand: brand.brand,
        href: `mailto:${emailRaw}`,
        copy: '',
        meta: emailRaw,
      });
    }

    return result;
  }

  /* ------------------------------ custom links ----------------------------- */

  function syncCustomLinksInput() {
    if (customLinksHidden) customLinksHidden.value = JSON.stringify(customLinks);
  }

  function renderCustomLinks() {
    if (!customLinksList) return;

    customLinksList.replaceChildren();

    customLinks.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'custom-link';

      const label = document.createElement('input');
      label.type = 'text';
      label.maxLength = 40;
      label.placeholder = 'Название';
      label.value = item.label;
      label.setAttribute('aria-label', 'Название ссылки');

      const url = document.createElement('input');
      url.type = 'text';
      url.maxLength = 300;
      url.placeholder = 'https://example.com';
      url.value = item.url;
      url.spellcheck = false;
      url.setAttribute('aria-label', 'Адрес ссылки');

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'custom-link__remove';
      remove.setAttribute('aria-label', 'Удалить ссылку');
      remove.innerHTML = '<i class="fa-regular fa-trash-can" aria-hidden="true"></i>';

      label.addEventListener('input', () => {
        customLinks[index].label = label.value;
        syncCustomLinksInput();
      });

      url.addEventListener('input', () => {
        customLinks[index].url = url.value;
        syncCustomLinksInput();
      });

      remove.addEventListener('click', () => removeCustomLink(index));

      row.append(label, url, remove);
      customLinksList.appendChild(row);
    });

    if (customLinksEmpty) {
      customLinksEmpty.classList.toggle('hidden', customLinks.length > 0);
    }

    if (customLinksAdd) {
      customLinksAdd.disabled = customLinks.length >= 8;
    }

    syncCustomLinksInput();
  }

  function addCustomLink() {
    if (customLinks.length >= 8) {
      toast('Максимум 8 своих ссылок.', 'info');
      return;
    }

    customLinks.push({ label: '', url: '' });
    renderCustomLinks();
    setDirty(true);
    renderPreview();

    const rows = customLinksList.querySelectorAll('.custom-link');
    const last = rows[rows.length - 1];
    if (last) last.querySelector('input').focus();
  }

  function removeCustomLink(index) {
    customLinks.splice(index, 1);
    renderCustomLinks();
    setDirty(true);
    renderPreview();
  }

  /* ------------------------------ preview bits ----------------------------- */

  function applyPreviewColors() {
    const background = backgroundInput ? backgroundInput.value : '#0b0b10';
    const accent = accentInput ? accentInput.value : '#8b5cf6';
    const auto = !textColorAuto || textColorAuto.checked;
    const picked = textColorPicker && isValidHex(textColorPicker.value)
      ? textColorPicker.value
      : '#ffffff';
    const customText = auto ? '' : picked;
    const light = !backgroundSrc && !customText && isLightHex(background);
    const text = customText || (light ? '#111318' : '#f5f6fa');

    if (previewBg) {
      previewBg.style.setProperty('--preview-bg', background);
      previewBg.style.setProperty('--accent', accent);
      previewBg.style.setProperty('--preview-text', text);
      previewBg.style.setProperty('--preview-muted', hexToRgba(text, 0.62));
      previewBg.classList.toggle('is-light', light);
    }

    if (textChip) {
      textChip.style.backgroundColor = auto
        ? (light ? '#111318' : '#f5f6fa')
        : picked;
    }

    if (textColorHidden) {
      textColorHidden.value = auto ? '' : picked.toLowerCase();
    }
  }

  function applyPreviewBackgroundImage() {
    if (!previewBgImage) return;

    if (backgroundSrc) {
      const safe = String(backgroundSrc).replace(/["'()\\\n\r]/g, '');
      previewBgImage.style.backgroundImage = `url("${safe}")`;
      previewBgImage.classList.add('has-image');
    } else {
      previewBgImage.style.backgroundImage = '';
      previewBgImage.classList.remove('has-image');
    }
  }

  function applyPreviewCard() {
    if (!previewCard) return;

    const style = checkedValue('cardStyle') || 'glass';
    previewCard.classList.remove('is-solid', 'is-outline', 'is-none');
    if (style !== 'glass') previewCard.classList.add(`is-${style}`);

    const opacity = clamp(Number.parseInt(cardOpacity ? cardOpacity.value : 62, 10) || 0, 0, 100);
    const blur = clamp(Number.parseInt(cardBlur ? cardBlur.value : 22, 10) || 0, 0, 40);

    previewCard.style.setProperty('--preview-card-opacity', `${opacity}%`);
    previewCard.style.setProperty('--preview-card-blur', `${blur}px`);

    if (cardOpacityValue) cardOpacityValue.textContent = String(opacity);
    if (cardBlurValue) cardBlurValue.textContent = String(blur);
  }

  function applyPreviewAvatarShape() {
    if (!previewAvatarWrap) return;

    const shape = checkedValue('avatarShape') || 'circle';
    previewAvatarWrap.className = `phone__avatar avatar--${shape}`;
  }

  function applyPreviewFont() {
    if (!previewBg || !fontSelect) return;

    previewBg.style.fontFamily =
      FONT_STACKS[fontSelect.value] || FONT_STACKS.inter;
  }

  function makePreviewLink(icon, label, meta, brand, mono) {
    const row = document.createElement('div');
    row.className = 'phone__link';

    const iconEl = document.createElement('i');
    iconEl.className = icon;
    iconEl.setAttribute('aria-hidden', 'true');
    if (brand && !mono) iconEl.style.color = brand;

    const body = document.createElement('span');
    body.style.display = 'flex';
    body.style.minWidth = '0';
    body.style.flex = '1';
    body.style.flexDirection = 'column';
    body.style.lineHeight = '1.35';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.fontWeight = '600';
    body.appendChild(labelEl);

    if (meta) {
      const metaEl = document.createElement('span');
      metaEl.textContent = meta;
      metaEl.style.opacity = '0.55';
      metaEl.style.fontSize = '0.46rem';
      body.appendChild(metaEl);
    }

    row.append(iconEl, body);
    return row;
  }

  function renderBadgesPreview() {
    if (!previewBadges) return;

    const badges = fieldValue('badges')
      .split(',')
      .map((badge) => badge.trim())
      .filter(Boolean)
      .slice(0, 6);

    previewBadges.replaceChildren();

    for (const badge of badges) {
      const span = document.createElement('span');
      span.className = 'phone__badge';
      span.textContent = badge;
      previewBadges.appendChild(span);
    }
  }

  function updateMetaPreview() {
    const showViews = Boolean($('showViews') && $('showViews').checked);
    const showClock = Boolean($('showClock') && $('showClock').checked);
    const showShare = Boolean($('showShare') && $('showShare').checked);

    if (previewViewsWrap) previewViewsWrap.classList.toggle('hidden', !showViews);
    if (previewClockWrap) previewClockWrap.classList.toggle('hidden', !showClock);
    if (previewShareWrap) previewShareWrap.classList.toggle('hidden', !showShare);
    if (previewMeta) {
      previewMeta.classList.toggle('hidden', !(showViews || showClock || showShare));
    }
  }

  function updateCoverPreview() {
    if (!previewPlayerCover) return;

    previewPlayerCover.replaceChildren();

    if (coverSrc) {
      const image = document.createElement('img');
      image.src = coverSrc;
      image.alt = '';
      previewPlayerCover.appendChild(image);
      return;
    }

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-music';
    icon.setAttribute('aria-hidden', 'true');
    previewPlayerCover.appendChild(icon);
  }

  function updatePlayerPreview() {
    if (previewPlayer) previewPlayer.classList.toggle('hidden', !hasAudio);

    if (previewPlayerTitle) {
      previewPlayerTitle.textContent = fieldValue('audioTitle') || 'Фоновая музыка';
    }
    if (previewPlayerArtist) {
      previewPlayerArtist.textContent =
        fieldValue('audioArtist') || fieldValue('username') || 'yourname';
    }

    updateCoverPreview();
  }

  function updateClock() {
    if (!previewClock) return;

    try {
      previewClock.textContent = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      previewClock.textContent = '--:--';
    }
  }

  /* ------------------------------ discord status --------------------------- */

  function discordStatusLabel(status) {
    if (status === 'online') return 'В сети';
    if (status === 'idle') return 'Не активен';
    if (status === 'dnd') return 'Не беспокоить';
    return 'Не в сети';
  }

  function setDiscordPreviewState(status) {
    const state = status || 'offline';
    if (previewPresenceDot) previewPresenceDot.setAttribute('data-state', state);
    if (previewAvatarStatus) previewAvatarStatus.setAttribute('data-state', state);
  }

  function setDiscordHint(message, kind = '', link = null) {
    if (!discordStatus) return;

    discordStatus.replaceChildren();
    discordStatus.classList.remove('is-ok', 'is-warn', 'is-error');

    if (!message) {
      discordStatus.hidden = true;
      return;
    }

    if (kind) discordStatus.classList.add(`is-${kind}`);
    discordStatus.appendChild(document.createTextNode(message));

    if (link) {
      discordStatus.appendChild(document.createTextNode(' '));
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = link.label;
      discordStatus.appendChild(anchor);
    }

    discordStatus.hidden = false;
  }

  function hideDiscordPreview() {
    if (previewPresence) previewPresence.classList.add('hidden');
    if (previewAvatarStatus) previewAvatarStatus.classList.add('hidden');
    setDiscordPreviewState('offline');
  }

  function showDiscordPresence(data) {
    if (!previewPresence) return;

    const user = data.discord_user || {};
    const status = data.discord_status || 'offline';

    if (previewPresenceText) {
      previewPresenceText.textContent =
        user.global_name || user.username || 'Discord';
    }

    if (previewPresenceActivity) {
      previewPresenceActivity.replaceChildren();
      const spotify = data.spotify;

      if (spotify && spotify.song) {
        previewPresenceActivity.textContent = `${spotify.song} — ${spotify.artist}`;
      } else if (Array.isArray(data.activities) && data.activities.length) {
        const current = data.activities[0];
        let label = current.name || '';
        if (current.details) label += ` · ${current.details}`;
        previewPresenceActivity.textContent = label;
      } else {
        previewPresenceActivity.textContent = discordStatusLabel(status);
      }
    }

    setDiscordPreviewState(status);
    previewPresence.classList.remove('hidden');
    if (previewAvatarStatus) previewAvatarStatus.classList.remove('hidden');
  }

  function showDiscordUnavailable(reason, message) {
    if (previewPresence) {
      if (previewPresenceText) previewPresenceText.textContent = 'Discord';
      if (previewPresenceActivity) {
        previewPresenceActivity.textContent =
          reason === 'not_monitored' ? 'не отслеживается' : 'недоступен';
      }
      previewPresence.classList.remove('hidden');
    }

    if (previewAvatarStatus) previewAvatarStatus.classList.add('hidden');
    setDiscordPreviewState('offline');

    if (reason === 'not_monitored') {
      setDiscordHint(
        'Lanyard не видит этот аккаунт. Зайдите на сервер Lanyard и повторите проверку.',
        'warn',
        { href: 'https://discord.gg/lanyard', label: 'Открыть Lanyard' },
      );
    } else {
      setDiscordHint(message || 'Не удалось получить статус.', 'error');
    }
  }

  async function refreshDiscord() {
    const id = discordIdInput ? discordIdInput.value.trim() : '';
    const enabled = Boolean(showDiscordInput && showDiscordInput.checked);

    if (!enabled) {
      hideDiscordPreview();
      setDiscordHint('');
      return;
    }

    if (!id) {
      hideDiscordPreview();
      setDiscordHint('Введите Discord ID, чтобы проверить статус.', 'warn');
      return;
    }

    if (!/^\d{17,20}$/.test(id)) {
      hideDiscordPreview();
      setDiscordHint('Discord ID должен состоять из 17–20 цифр.', 'error');
      return;
    }

    const request = ++discordRequest;
    if (discordCheck) discordCheck.disabled = true;
    setDiscordHint('Проверяем статус через Lanyard…');

    try {
      const response = await fetch(`/api/discord?id=${encodeURIComponent(id)}`);
      const data = await readJson(response);

      if (request !== discordRequest) return;

      if (data.ok && data.data) {
        showDiscordPresence(data.data);
        setDiscordHint(
          `Lanyard видит аккаунт · ${discordStatusLabel(data.data.discord_status)}.`,
          'ok',
        );
        return;
      }

      showDiscordUnavailable(
        data.reason || 'unavailable',
        data.error || 'Не удалось получить статус.',
      );
    } catch {
      if (request !== discordRequest) return;
      showDiscordUnavailable('unavailable', 'Не удалось связаться с сервером.');
    } finally {
      if (request === discordRequest && discordCheck) discordCheck.disabled = false;
    }
  }

  function scheduleDiscordRefresh() {
    if (discordTimer) clearTimeout(discordTimer);
    discordTimer = setTimeout(refreshDiscord, 500);
  }

  function renderPreview() {
    if (!previewName) return;

    const username = fieldValue('username') || 'yourname';
    const displayName = fieldValue('displayName') || username;

    previewName.textContent = displayName;
    if (previewHandle) previewHandle.textContent = `@${username}`;
    if (previewBio) previewBio.textContent = (bioInput ? bioInput.value : '').trim();

    renderBadgesPreview();

    const socials = collectSocials();
    const socialStyle = checkedValue('socialStyle') || 'icons';
    const mono = checkedValue('iconStyle') === 'mono';

    if (previewSocials) previewSocials.replaceChildren();
    if (previewLinks) previewLinks.replaceChildren();

    if (socialStyle === 'icons') {
      for (const social of socials) {
        const icon = document.createElement('span');
        icon.className = `phone__social${mono ? ' is-mono' : ''}`;
        if (!mono) icon.style.setProperty('--brand', social.brand);
        icon.title = social.label;
        icon.innerHTML = `<i class="${social.icon}" aria-hidden="true"></i>`;
        if (previewSocials) previewSocials.appendChild(icon);
      }
    } else {
      for (const social of socials) {
        if (!previewLinks) continue;
        previewLinks.appendChild(
          makePreviewLink(social.icon, social.label, social.meta, social.brand, mono),
        );
      }
    }

    for (const item of customLinks) {
      const url = normalizeUrl(item.url);
      if (!url || !previewLinks) continue;

      previewLinks.appendChild(
        makePreviewLink(
          'fa-solid fa-link',
          item.label || prettyUrl(url),
          prettyUrl(url),
          '',
          true,
        ),
      );
    }

    applyPreviewColors();
    applyPreviewFont();
    applyPreviewCard();
    applyPreviewAvatarShape();
    applyPreviewBackgroundImage();
    updateMetaPreview();
    updatePlayerPreview();
  }

  /* ------------------------------- color UI -------------------------------- */

  function syncThemePresets() {
    const background = backgroundInput ? backgroundInput.value.toLowerCase() : '';
    const accent = accentInput ? accentInput.value.toLowerCase() : '';

    themePresets.forEach((preset) => {
      const matches =
        preset.dataset.bg.toLowerCase() === background &&
        preset.dataset.accent.toLowerCase() === accent;
      preset.classList.toggle('is-active', matches);
    });
  }

  function syncBackgroundUI() {
    if (!backgroundInput) return;

    const value = backgroundInput.value.toLowerCase();

    if (bgChip) bgChip.style.backgroundColor = value;
    if (bgHex) bgHex.textContent = value;

    swatches.forEach((swatch) => {
      swatch.classList.toggle(
        'is-active',
        String(swatch.dataset.color || '').toLowerCase() === value,
      );
    });

    syncThemePresets();
  }

  function syncAccentUI() {
    if (!accentInput) return;

    const value = accentInput.value.toLowerCase();

    if (accentChip) accentChip.style.backgroundColor = value;
    if (accentHex) accentHex.textContent = value;

    syncThemePresets();
  }

  function applyThemePreset(preset) {
    if (!backgroundInput || !accentInput) return;

    if (isValidHex(preset.dataset.bg)) backgroundInput.value = preset.dataset.bg;
    if (isValidHex(preset.dataset.accent)) accentInput.value = preset.dataset.accent;

    syncBackgroundUI();
    syncAccentUI();
    setDirty(true);
    renderPreview();
  }

  function applySwatch(color) {
    if (!backgroundInput || !isValidHex(color)) return;

    backgroundInput.value = color;
    syncBackgroundUI();
    setDirty(true);
    renderPreview();
  }

  /* ------------------------------- file logic ------------------------------ */

  function validateImage(file, limit, input) {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast('Поддерживаются только PNG, JPG, WEBP и GIF.', 'error');
      if (input) input.value = '';
      return false;
    }

    if (file.size > limit) {
      toast(`Файл слишком большой. Максимум — ${Math.round(limit / MB)} МБ.`, 'error');
      if (input) input.value = '';
      return false;
    }

    return true;
  }

  function handleAvatarFile(file) {
    if (!file) return;
    if (!validateImage(file, FILE_LIMITS.avatar, avatarInput)) return;

    revokeObjectUrl('avatar');
    objectUrls.avatar = URL.createObjectURL(file);

    if (avatarPreview) avatarPreview.src = objectUrls.avatar;
    if (previewAvatar) previewAvatar.src = objectUrls.avatar;

    if (avatarBadge) avatarBadge.classList.remove('hidden');
    if (avatarRemove) avatarRemove.classList.remove('hidden');
    if (avatarFilename) {
      avatarFilename.textContent = `${file.name} · ${fileSizeLabel(file)}`;
      avatarFilename.classList.remove('hidden');
    }

    setDirty(true);
  }

  function handleBackgroundFile(file) {
    if (!file) return;
    if (!validateImage(file, FILE_LIMITS.background, backgroundInputFile)) return;

    revokeObjectUrl('background');
    objectUrls.background = URL.createObjectURL(file);
    backgroundSrc = objectUrls.background;

    if (backgroundPreview) {
      const safe = backgroundSrc.replace(/["'()\\\n\r]/g, '');
      backgroundPreview.style.backgroundImage = `url("${safe}")`;
      backgroundPreview.classList.remove('is-empty');
    }
    if (backgroundFilename) {
      backgroundFilename.textContent = `${file.name} · ${fileSizeLabel(file)}`;
    }
    if (backgroundRemove) backgroundRemove.classList.remove('hidden');

    applyPreviewBackgroundImage();
    setDirty(true);
    renderPreview();
  }

  function handleCoverFile(file) {
    if (!file) return;
    if (!validateImage(file, FILE_LIMITS.cover, coverInput)) return;

    revokeObjectUrl('cover');
    objectUrls.cover = URL.createObjectURL(file);
    coverSrc = objectUrls.cover;

    if (coverPreview) {
      const safe = coverSrc.replace(/["'()\\\n\r]/g, '');
      coverPreview.style.backgroundImage = `url("${safe}")`;
      coverPreview.classList.remove('is-empty');
    }
    if (coverFilename) {
      coverFilename.textContent = `${file.name} · ${fileSizeLabel(file)}`;
    }
    if (coverRemove) coverRemove.classList.remove('hidden');

    updateCoverPreview();
    setDirty(true);
    renderPreview();
  }

  function handleAudioFile(file) {
    if (!file) return;

    const looksLikeMp3 = /\.mp3$/i.test(file.name);
    if (!AUDIO_TYPES.includes(file.type) && !looksLikeMp3) {
      toast('Можно загрузить только MP3-файл.', 'error');
      if (audioInput) audioInput.value = '';
      return;
    }

    if (file.size > FILE_LIMITS.audio) {
      toast('Файл слишком большой. Максимум — 10 МБ.', 'error');
      if (audioInput) audioInput.value = '';
      return;
    }

    revokeObjectUrl('audio');
    objectUrls.audio = URL.createObjectURL(file);
    hasAudio = true;

    if (audioPreview) {
      audioPreview.src = objectUrls.audio;
      audioPreview.classList.remove('hidden');
      audioPreview.load();
    }
    if (audioFilename) {
      audioFilename.textContent = `${file.name} · ${fileSizeLabel(file)}`;
    }
    if (audioRemove) audioRemove.classList.remove('hidden');

    setDirty(true);
    renderPreview();
  }

  function resetAudioPreview() {
    hasAudio = false;

    if (audioPreview) {
      audioPreview.pause();
      audioPreview.removeAttribute('src');
      audioPreview.load();
      audioPreview.classList.add('hidden');
    }
    if (audioFilename) audioFilename.textContent = 'MP3 · до 10 МБ';
    if (audioRemove) audioRemove.classList.add('hidden');
  }

  function bindDropZone(zone, input, handler) {
    if (!zone) return;

    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      zone.classList.add('is-dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('is-dragover');
    });

    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('is-dragover');

      const file = event.dataTransfer && event.dataTransfer.files
        ? event.dataTransfer.files[0]
        : null;
      if (!file) return;

      if (input) {
        try {
          const transfer = new DataTransfer();
          transfer.items.add(file);
          input.files = transfer.files;
        } catch {
          // Older browsers do not expose the DataTransfer constructor.
        }
      }

      handler(file);
    });
  }

  /* -------------------------------- actions -------------------------------- */

  function validateForm() {
    if (!form.reportValidity()) return false;

    if (!usernameInput || !usernameInput.value.trim()) {
      if (usernameInput) usernameInput.focus();
      toast('Username не может быть пустым.', 'error');
      return false;
    }

    return true;
  }

  function syncToggleFields(formData) {
    const toggles = ['typewriter', 'showViews', 'showClock', 'showShare', 'showDiscord'];

    for (const key of toggles) {
      const input = $(key);
      formData.set(key, input && input.checked ? 'on' : 'off');
    }
  }

  async function persist({ silent = false } = {}) {
    syncCustomLinksInput();
    applyPreviewColors();

    const formData = new FormData(form);
    syncToggleFields(formData);

    const response = await fetch('/api/save', {
      method: 'POST',
      body: formData,
    });
    const data = await readJson(response);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Не удалось сохранить профиль.');
    }

    const profile = data.profile || {};

    ['avatar', 'background', 'audio', 'cover'].forEach((kind) => {
      const input = $(`${kind}-input`);
      if (input) input.value = '';
      revokeObjectUrl(kind);
    });

    if (avatarPreview) avatarPreview.src = data.avatarUrl || '/assets/default-avatar.svg';
    if (previewAvatar) previewAvatar.src = data.avatarUrl || '/assets/default-avatar.svg';
    if (avatarFilename) avatarFilename.classList.add('hidden');
    if (avatarBadge) avatarBadge.classList.add('hidden');
    if (avatarRemove) avatarRemove.classList.toggle('hidden', !profile.avatar);

    backgroundSrc = data.backgroundUrl || '';
    if (backgroundPreview) {
      backgroundPreview.style.backgroundImage = backgroundSrc
        ? `url("${String(backgroundSrc).replace(/["'()\\\n\r]/g, '')}")`
        : '';
      backgroundPreview.classList.toggle('is-empty', !backgroundSrc);
    }
    if (backgroundFilename) {
      backgroundFilename.textContent = profile.backgroundImage
        ? basename(profile.backgroundImage)
        : 'PNG, JPG, WEBP или GIF · до 10 МБ';
    }
    if (backgroundRemove) backgroundRemove.classList.toggle('hidden', !profile.backgroundImage);

    hasAudio = Boolean(data.audioUrl);
    if (hasAudio) {
      if (audioPreview) {
        audioPreview.src = data.audioUrl;
        audioPreview.classList.remove('hidden');
        audioPreview.load();
      }
    } else {
      resetAudioPreview();
    }
    if (audioFilename) {
      audioFilename.textContent = profile.audio ? basename(profile.audio) : 'MP3 · до 10 МБ';
    }
    if (audioRemove) audioRemove.classList.toggle('hidden', !profile.audio);

    coverSrc = data.coverUrl || '';
    if (coverPreview) {
      coverPreview.style.backgroundImage = coverSrc
        ? `url("${String(coverSrc).replace(/["'()\\\n\r]/g, '')}")`
        : '';
      coverPreview.classList.toggle('is-empty', !coverSrc);
    }
    if (coverFilename) {
      coverFilename.textContent = profile.audioCover
        ? basename(profile.audioCover)
        : 'Квадратная картинка · до 5 МБ';
    }
    if (coverRemove) coverRemove.classList.toggle('hidden', !profile.audioCover);

    renderPreview();
    setDirty(false);

    if (!silent) toast('Профиль сохранён.', 'success');

    return data;
  }

  async function handleSave() {
    if (busy) return;
    if (!validateForm()) return;

    busy = true;
    setButtonBusy(saveButton, true, 'Сохраняем…');

    try {
      await persist();
      refreshViews();
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
    if (saveButton) saveButton.disabled = true;

    try {
      await persist({ silent: true });

      const data = await postJson('/api/build');

      if (data.previewUrl) {
        document.querySelectorAll('[data-open-dist]').forEach((link) => {
          link.href = data.previewUrl;
          link.classList.remove('pointer-events-none', 'opacity-40');
        });
      }

      if (data.builtAt && builtAt) {
        builtAt.textContent = new Intl.DateTimeFormat('ru-RU', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(data.builtAt));
      }

      setDirty(false);
      toast('Готово! dist/ обновлён — index.html, style.css, script.js и assets.', 'success', 3800);
    } catch (error) {
      toast(describeError(error), 'error', 4600);
    } finally {
      busy = false;
      setButtonBusy(buildButton, false);
      if (saveButton) saveButton.disabled = false;
    }
  }

  async function handleRemoveAvatar() {
    if (busy) return;
    if (!window.confirm('Убрать аватарку? Текущий файл будет откреплён.')) return;

    if (avatarRemove) avatarRemove.disabled = true;

    try {
      const data = await postJson('/api/avatar/remove');
      const src = data.avatarUrl || '/assets/default-avatar.svg';

      revokeObjectUrl('avatar');
      if (avatarInput) avatarInput.value = '';
      if (avatarPreview) avatarPreview.src = src;
      if (previewAvatar) previewAvatar.src = src;
      if (avatarFilename) avatarFilename.classList.add('hidden');
      if (avatarBadge) avatarBadge.classList.add('hidden');
      if (avatarRemove) avatarRemove.classList.add('hidden');

      toast('Аватарка удалена.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      if (avatarRemove) avatarRemove.disabled = false;
    }
  }

  async function handleRemoveBackground() {
    if (busy) return;
    if (!window.confirm('Убрать фоновое изображение? Файл будет удалён.')) return;

    if (backgroundRemove) backgroundRemove.disabled = true;

    try {
      await postJson('/api/background/remove');

      revokeObjectUrl('background');
      backgroundSrc = '';
      if (backgroundInputFile) backgroundInputFile.value = '';
      if (backgroundPreview) {
        backgroundPreview.style.backgroundImage = '';
        backgroundPreview.classList.add('is-empty');
      }
      if (backgroundFilename) {
        backgroundFilename.textContent = 'PNG, JPG, WEBP или GIF · до 10 МБ';
      }
      if (backgroundRemove) backgroundRemove.classList.add('hidden');

      renderPreview();
      toast('Фоновое изображение удалено.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      if (backgroundRemove) backgroundRemove.disabled = false;
    }
  }

  async function handleRemoveAudio() {
    if (busy) return;
    if (!window.confirm('Убрать фоновую музыку? Файл будет удалён.')) return;

    if (audioRemove) audioRemove.disabled = true;

    try {
      await postJson('/api/audio/remove');

      revokeObjectUrl('audio');
      if (audioInput) audioInput.value = '';
      resetAudioPreview();
      renderPreview();

      toast('Фоновая музыка удалена.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      if (audioRemove) audioRemove.disabled = false;
    }
  }

  async function handleRemoveCover() {
    if (busy) return;
    if (!window.confirm('Убрать обложку трека? Файл будет удалён.')) return;

    if (coverRemove) coverRemove.disabled = true;

    try {
      await postJson('/api/cover/remove');

      revokeObjectUrl('cover');
      coverSrc = '';
      if (coverInput) coverInput.value = '';
      if (coverPreview) {
        coverPreview.style.backgroundImage = '';
        coverPreview.classList.add('is-empty');
      }
      if (coverFilename) coverFilename.textContent = 'Квадратная картинка · до 5 МБ';
      if (coverRemove) coverRemove.classList.add('hidden');

      updateCoverPreview();
      renderPreview();
      toast('Обложка трека удалена.', 'success');
    } catch (error) {
      toast(describeError(error), 'error');
    } finally {
      if (coverRemove) coverRemove.disabled = false;
    }
  }

  async function refreshViews() {
    const username = fieldValue('username');
    if (!username || !previewViews) return;

    try {
      const response = await fetch(
        `/api/views?username=${encodeURIComponent(username)}`,
      );
      const data = await readJson(response);
      if (data.ok && data.views !== undefined) {
        previewViews.textContent = formatViews(data.views);
      }
    } catch {
      // The preview keeps its last known value.
    }
  }

  /* -------------------------------- events --------------------------------- */

  function onFormUpdate() {
    if (bioCount && bioInput) bioCount.textContent = String(bioInput.value.length);
    if (backgroundInput) syncBackgroundUI();
    if (accentInput) syncAccentUI();

    setDirty(true);
    renderPreview();
  }

  form.addEventListener('input', onFormUpdate);
  form.addEventListener('change', onFormUpdate);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handleSave();
  });

  swatches.forEach((swatch) => {
    swatch.addEventListener('click', () => applySwatch(swatch.dataset.color));
  });

  themePresets.forEach((preset) => {
    preset.addEventListener('click', () => applyThemePreset(preset));
  });

  if (textColorPicker) {
    textColorPicker.addEventListener('input', () => {
      if (textColorAuto) textColorAuto.checked = false;
      syncBackgroundUI();
      setDirty(true);
      renderPreview();
    });
  }

  if (textColorAuto) {
    textColorAuto.addEventListener('change', () => {
      if (textColorAuto.checked && textColorHidden) textColorHidden.value = '';
      setDirty(true);
      renderPreview();
    });
  }

  if (fontSelect) {
    fontSelect.addEventListener('change', () => {
      applyPreviewFont();
      setDirty(true);
    });
  }

  [cardOpacity, cardBlur].forEach((range) => {
    if (!range) return;
    range.addEventListener('input', () => {
      applyPreviewCard();
      setDirty(true);
    });
  });

  document
    .querySelectorAll('input[name="avatarShape"], input[name="cardStyle"], input[name="socialStyle"], input[name="iconStyle"]')
    .forEach((input) => {
      input.addEventListener('change', () => {
        renderPreview();
        setDirty(true);
      });
    });

  if (avatarInput) {
    avatarInput.addEventListener('change', () => {
      handleAvatarFile(avatarInput.files && avatarInput.files[0]);
    });
  }

  if (backgroundInputFile) {
    backgroundInputFile.addEventListener('change', () => {
      handleBackgroundFile(backgroundInputFile.files && backgroundInputFile.files[0]);
    });
  }

  if (audioInput) {
    audioInput.addEventListener('change', () => {
      handleAudioFile(audioInput.files && audioInput.files[0]);
    });
  }

  if (coverInput) {
    coverInput.addEventListener('change', () => {
      handleCoverFile(coverInput.files && coverInput.files[0]);
    });
  }

  if (avatarRemove) avatarRemove.addEventListener('click', handleRemoveAvatar);
  if (backgroundRemove) backgroundRemove.addEventListener('click', handleRemoveBackground);
  if (audioRemove) audioRemove.addEventListener('click', handleRemoveAudio);
  if (coverRemove) coverRemove.addEventListener('click', handleRemoveCover);
  if (customLinksAdd) customLinksAdd.addEventListener('click', addCustomLink);

  bindDropZone(avatarBox, avatarInput, handleAvatarFile);
  bindDropZone(backgroundPreview, backgroundInputFile, handleBackgroundFile);
  bindDropZone(coverPreview, coverInput, handleCoverFile);

  if (avatarBox && avatarInput) {
    avatarBox.addEventListener('click', () => avatarInput.click());
  }

  if (audioTitleInput) {
    audioTitleInput.addEventListener('input', () => {
      updatePlayerPreview();
      setDirty(true);
    });
  }

  if (audioArtistInput) {
    audioArtistInput.addEventListener('input', () => {
      updatePlayerPreview();
      setDirty(true);
    });
  }

  if (discordIdInput) discordIdInput.addEventListener('input', scheduleDiscordRefresh);
  if (showDiscordInput) showDiscordInput.addEventListener('change', refreshDiscord);
  if (discordCheck) discordCheck.addEventListener('click', refreshDiscord);

  if (saveButton) saveButton.addEventListener('click', handleSave);
  if (buildButton) buildButton.addEventListener('click', handleBuild);

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

  /* ------------------------------ scroll spy ------------------------------- */

  const navLinks = Array.from(document.querySelectorAll('.sidebar__link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  function updateActiveNav() {
    if (!sections.length) return;

    const marker = window.scrollY + 150;
    let current = sections[0].id;

    for (const section of sections) {
      if (section.offsetTop <= marker) current = section.id;
    }

    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav);

  /* --------------------------------- init ---------------------------------- */

  renderCustomLinks();
  syncBackgroundUI();
  syncAccentUI();
  applyPreviewColors();
  applyPreviewFont();
  applyPreviewCard();
  applyPreviewAvatarShape();
  applyPreviewBackgroundImage();
  updateMetaPreview();
  updatePlayerPreview();
  renderPreview();
  updateActiveNav();
  refreshViews();
  refreshDiscord();

  updateClock();
  clockTimer = setInterval(updateClock, 30000);
  discordPollTimer = setInterval(refreshDiscord, 30000);
  window.addEventListener('beforeunload', () => {
    clearInterval(clockTimer);
    clearInterval(discordPollTimer);
    if (discordTimer) clearTimeout(discordTimer);
  });
})();
