'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { PARTICLE_EFFECTS } = require('./store');

const CSS_PATH = path.join(__dirname, 'page.css');
const SCRIPT_PATH = path.join(__dirname, 'page.js');
const CSS = fs.readFileSync(CSS_PATH, 'utf8');

const FONT_AWESOME =
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Only http(s) links are allowed in the generated page. */
function normalizeUrl(value) {
  let raw = String(value ?? '').trim();
  if (!raw) return '';

  if (!/^https?:\/\//i.test(raw)) {
    const looksLikeDomain =
      /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?::\d+)?(?:\/.*)?$/i.test(raw);
    if (!looksLikeDomain) return '';
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
  const handle = String(value ?? '')
    .trim()
    .replace(/^@+/, '');
  return /^[a-zA-Z0-9._-]{2,40}$/.test(handle) ? handle : '';
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

/**
 * Accept either a full http(s) URL or a recognized bare domain (for example
 * `t.me/username`). Unrelated domains are rejected so a Discord username like
 * `alex.design` is not mistaken for a website.
 */
function normalizeSocialUrl(value, domainPatterns) {
  const raw = String(value ?? '').trim();
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

/**
 * Resolve a platform input that may be a full URL or a bare handle.
 * Returns the final http(s) URL plus the extracted handle (when known).
 */
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

function pushLink(result, key, label, icon, url, handle) {
  result.push({
    key,
    label,
    icon,
    href: url,
    meta: handle ? `@${handle}` : prettyUrl(url),
  });
}

/**
 * Turn the raw profile links into ready-to-render button descriptors.
 * Discord accepts either an invite URL or a plain username (copied on click).
 */
function buildLinks(profile) {
  const result = [];
  const links = profile.links || {};

  const telegramRaw = links.telegram || '';
  let telegramUrl = normalizeSocialUrl(telegramRaw, TELEGRAM_DOMAINS);
  let telegramHandle = '';

  if (telegramUrl) {
    const match = telegramUrl.match(/t\.me\/([^/?#]+)/i);
    if (match) telegramHandle = sanitizeHandle(match[1]);
  } else {
    telegramHandle = sanitizeHandle(telegramRaw);
    if (telegramHandle) telegramUrl = `https://t.me/${telegramHandle}`;
  }

  if (telegramUrl) {
    pushLink(
      result,
      'telegram',
      'Telegram',
      'fa-brands fa-telegram',
      telegramUrl,
      telegramHandle,
    );
  }

  const discordRaw = links.discord || '';
  const discordUrl = normalizeSocialUrl(discordRaw, DISCORD_DOMAINS);

  if (discordUrl) {
    pushLink(
      result,
      'discord',
      'Discord',
      'fa-brands fa-discord',
      discordUrl,
    );
  } else if (discordRaw) {
    const username = discordRaw.replace(/^@+/, '').trim();
    if (/^[\w.#-]{2,64}$/.test(username)) {
      result.push({
        key: 'discord',
        label: 'Discord',
        icon: 'fa-brands fa-discord',
        copy: username,
        meta: `@${username}`,
      });
    }
  }

  const youtubeRaw = links.youtube || '';
  let youtubeUrl = normalizeSocialUrl(youtubeRaw, YOUTUBE_DOMAINS);
  let youtubeHandle = '';

  if (youtubeUrl) {
    const match = youtubeUrl.match(/youtube\.com\/@([^/?#]+)/i);
    if (match) youtubeHandle = sanitizeHandle(match[1]);
  } else {
    youtubeHandle = sanitizeHandle(youtubeRaw);
    if (youtubeHandle) youtubeUrl = `https://youtube.com/@${youtubeHandle}`;
  }

  if (youtubeUrl) {
    pushLink(
      result,
      'youtube',
      'YouTube',
      'fa-brands fa-youtube',
      youtubeUrl,
      youtubeHandle,
    );
  }

  const tiktok = resolveHandleLink(
    links.tiktok || '',
    TIKTOK_DOMAINS,
    (handle) => `https://tiktok.com/@${handle}`,
    /tiktok\.com\/@([^/?#]+)/i,
  );
  if (tiktok.url) {
    pushLink(
      result,
      'tiktok',
      'TikTok',
      'fa-brands fa-tiktok',
      tiktok.url,
      tiktok.handle,
    );
  }

  const twitch = resolveHandleLink(
    links.twitch || '',
    TWITCH_DOMAINS,
    (handle) => `https://twitch.tv/${handle}`,
    /twitch\.tv\/([^/?#]+)/i,
  );
  if (twitch.url) {
    pushLink(
      result,
      'twitch',
      'Twitch',
      'fa-brands fa-twitch',
      twitch.url,
      twitch.handle,
    );
  }

  const steamRaw = links.steam || '';
  let steamUrl = normalizeSocialUrl(steamRaw, STEAM_DOMAINS);
  let steamHandle = '';

  if (steamUrl) {
    const match = steamUrl.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
    if (match) steamHandle = sanitizeHandle(match[1]);
  } else if (/^\d{17}$/.test(steamRaw)) {
    // SteamID64 profile URL.
    steamUrl = `https://steamcommunity.com/profiles/${steamRaw}`;
  } else {
    steamHandle = sanitizeHandle(steamRaw);
    if (steamHandle) steamUrl = `https://steamcommunity.com/id/${steamHandle}`;
  }

  if (steamUrl) {
    pushLink(
      result,
      'steam',
      'Steam',
      'fa-brands fa-steam',
      steamUrl,
      steamHandle,
    );
  }

  const github = resolveHandleLink(
    links.github || '',
    GITHUB_DOMAINS,
    (handle) => `https://github.com/${handle}`,
    /github\.com\/([^/?#]+)/i,
  );
  if (github.url) {
    pushLink(
      result,
      'github',
      'GitHub',
      'fa-brands fa-github',
      github.url,
      github.handle,
    );
  }

  const spotifyRaw = links.spotify || '';
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

  if (spotifyUrl) {
    pushLink(
      result,
      'spotify',
      'Spotify',
      'fa-brands fa-spotify',
      spotifyUrl,
      spotifyHandle,
    );
  }

  return result;
}

function renderLink(link, index) {
  const delay = (0.26 + index * 0.07).toFixed(2);
  const chevron = link.copy
    ? 'fa-solid fa-copy'
    : 'fa-solid fa-arrow-up-right-from-square';
  const inner = [
    `<span class="link__icon"><i class="${link.icon}" aria-hidden="true"></i></span>`,
    '<span class="link__body">',
    `<span class="link__label">${escapeHtml(link.label)}</span>`,
    `<span class="link__meta">${escapeHtml(link.meta)}</span>`,
    '</span>',
    `<i class="${chevron} link__chev" aria-hidden="true"></i>`,
  ].join('');

  if (link.copy) {
    return (
      `<button type="button" class="link link--${link.key} reveal" ` +
      `style="--d:${delay}s" data-copy="${escapeHtml(link.copy)}" ` +
      `aria-label="Скопировать ${escapeHtml(link.label)}">${inner}</button>`
    );
  }

  return (
    `<a class="link link--${link.key} reveal" style="--d:${delay}s" ` +
    `href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" ` +
    `aria-label="${escapeHtml(link.label)}">${inner}</a>`
  );
}

function renderFavicon(username, accent) {
  const letter = (String(username).trim()[0] || 'v').toUpperCase();
  const color = /^#[0-9a-f]{6}$/i.test(accent) ? accent : '#8b5cf6';
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    `<stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#22d3ee"/>` +
    '</linearGradient></defs>' +
    '<rect width="64" height="64" rx="16" fill="url(#g)"/>' +
    `<text x="32" y="44" font-family="Inter,Arial,sans-serif" font-size="32" ` +
    `font-weight="700" fill="#ffffff" text-anchor="middle">${escapeHtml(letter)}</text>` +
    '</svg>';
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Relative luminance heuristic used to switch the generated page to its
 * light palette. `#f5f5f7` is light, `#12071f` is dark.
 */
function isLightColor(value) {
  const match = /^#([0-9a-f]{6})$/i.exec(String(value || ''));
  if (!match) return false;

  const number = parseInt(match[1], 16);
  const channels = [number >> 16, number >> 8, number].map((channel) => {
    const srgb = (channel & 255) / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.55;
}

const CONFETTI_CDN =
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';

/**
 * Render the standalone bio page.
 *
 * @param {object} profile
 * @param {{
 *   cssHref?: string,
 *   scriptHref?: string,
 *   avatarSrc?: string,
 *   audioSrc?: string,
 * }} options
 * @returns {string}
 */
function renderPage(profile, options = {}) {
  const cssHref = options.cssHref || 'style.css';
  const scriptHref = options.scriptHref || 'script.js';
  const avatarSrc = options.avatarSrc || 'assets/default-avatar.svg';
  const storedAudio = profile.audio ? path.basename(profile.audio) : '';
  const audioSrc = options.audioSrc !== undefined
    ? options.audioSrc
    : (/\.mp3$/i.test(storedAudio) ? `assets/${storedAudio}` : '');
  const links = buildLinks(profile);
  const username = escapeHtml(profile.username);
  const bio = escapeHtml(profile.bio);
  const background = /^#[0-9a-f]{6}$/i.test(profile.background)
    ? profile.background
    : '#0b0b10';
  const accent = /^#[0-9a-f]{6}$/i.test(profile.accent)
    ? profile.accent
    : '#8b5cf6';
  const particles = PARTICLE_EFFECTS.includes(profile.particles)
    ? profile.particles
    : 'off';
  const typewriter = Boolean(profile.typewriter) && Boolean(profile.bio);
  const lightTheme = isLightColor(background);
  const description = profile.bio
    ? profile.bio.replace(/\s+/g, ' ').slice(0, 160)
    : `Ссылки ${profile.username}`;
  const footerDelay = (0.26 + links.length * 0.07 + 0.05).toFixed(2);

  const linksHtml = links.length
    ? links.map(renderLink).join('\n        ')
    : '<p class="links-empty reveal" style="--d:.26s">Ссылки пока не добавлены</p>';

  const bioHtml = !bio
    ? ''
    : typewriter
      ? `<p class="bio bio--typewriter reveal" style="--d:.18s" data-typewriter><span class="bio__text">${bio}</span><span class="bio__caret" aria-hidden="true"></span></p>`
      : `<p class="bio reveal" style="--d:.18s">${bio}</p>`;

  const audioHtml = audioSrc
    ? `<audio id="bg-music" src="${escapeHtml(audioSrc)}" loop preload="none"></audio>
  <button type="button" class="music-toggle" id="music-toggle" aria-label="Включить фоновую музыку" aria-pressed="false">
    <i class="fa-solid fa-play" aria-hidden="true"></i>
  </button>`
    : '';

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${username}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="${background}">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${username}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${username}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="icon" href="${renderFavicon(profile.username, accent)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${GOOGLE_FONTS}">
  <link rel="stylesheet" href="${escapeHtml(FONT_AWESOME)}" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="${escapeHtml(cssHref)}">
</head>
<body${lightTheme ? ' class="theme-light"' : ''} style="--bg:${background};--accent:${accent}" data-particles="${particles}">
  <div class="backdrop" aria-hidden="true">
    <span class="orb orb--1"></span>
    <span class="orb orb--2"></span>
  </div>

  ${audioHtml}

  <div class="card-stage">
    <div class="card-tilt" id="card-tilt">
      <main class="card">
        <div class="avatar">
          <img src="${escapeHtml(avatarSrc)}" alt="Аватар ${username}" width="116" height="116">
        </div>

        <h1 class="name reveal" style="--d:.12s">${username}</h1>
        ${bioHtml}

        <nav class="links" aria-label="Социальные сети">
            ${linksHtml}
        </nav>

        <footer class="footer reveal" style="--d:${footerDelay}s">
          <i class="fa-solid fa-bolt" aria-hidden="true"></i>
          <span>vibe.bio</span>
        </footer>
      </main>
    </div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  ${particles !== 'off' ? `<script src="${CONFETTI_CDN}" defer></script>` : ''}
  <script src="${escapeHtml(scriptHref)}" defer></script>
</body>
</html>
`;
}

module.exports = {
  CSS,
  CSS_PATH,
  SCRIPT_PATH,
  buildLinks,
  escapeHtml,
  isLightColor,
  normalizeUrl,
  renderPage,
};
