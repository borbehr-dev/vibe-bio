'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  FONTS,
  PARTICLE_EFFECTS,
} = require('./store');

const CSS_PATH = path.join(__dirname, 'page.css');
const SCRIPT_PATH = path.join(__dirname, 'page.js');
const CSS = fs.readFileSync(CSS_PATH, 'utf8');

const FONT_AWESOME =
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';

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
const X_DOMAINS = [/^(?:www\.|mobile\.)?(?:x|twitter)\.com\//i];
const INSTAGRAM_DOMAINS = [/^(?:www\.|m\.)?instagram\.com\//i];
const VK_DOMAINS = [/^(?:www\.|m\.)?vk\.(?:com|ru)\//i];
const REDDIT_DOMAINS = [
  /^(?:www\.|old\.|new\.)?reddit\.com\//i,
  /^(?:www\.)?redd\.it\//i,
];
const ROBLOX_DOMAINS = [/^(?:www\.)?roblox\.com\//i];

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

const SOCIAL_BRANDS = Object.freeze({
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
});

function socialLink(key, url, handle) {
  const brand = SOCIAL_BRANDS[key];
  return {
    key,
    label: brand.label,
    icon: brand.icon,
    brand: brand.brand,
    href: url,
    meta: handle ? `@${handle}` : prettyUrl(url),
  };
}

function buildSocials(profile) {
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
  if (telegramUrl) result.push(socialLink('telegram', telegramUrl, telegramHandle));

  const discordRaw = links.discord || '';
  const discordUrl = normalizeSocialUrl(discordRaw, DISCORD_DOMAINS);
  if (discordUrl) {
    result.push(socialLink('discord', discordUrl));
  } else if (discordRaw) {
    const username = discordRaw.replace(/^@+/, '').trim();
    if (/^[\w.#-]{2,64}$/.test(username)) {
      const brand = SOCIAL_BRANDS.discord;
      result.push({
        key: 'discord',
        label: brand.label,
        icon: brand.icon,
        brand: brand.brand,
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
  if (youtubeUrl) result.push(socialLink('youtube', youtubeUrl, youtubeHandle));

  const tiktok = resolveHandleLink(
    links.tiktok || '',
    TIKTOK_DOMAINS,
    (handle) => `https://tiktok.com/@${handle}`,
    /tiktok\.com\/@([^/?#]+)/i,
  );
  if (tiktok.url) result.push(socialLink('tiktok', tiktok.url, tiktok.handle));

  const twitch = resolveHandleLink(
    links.twitch || '',
    TWITCH_DOMAINS,
    (handle) => `https://twitch.tv/${handle}`,
    /twitch\.tv\/([^/?#]+)/i,
  );
  if (twitch.url) result.push(socialLink('twitch', twitch.url, twitch.handle));

  const steamRaw = links.steam || '';
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
  if (steamUrl) result.push(socialLink('steam', steamUrl, steamHandle));

  const github = resolveHandleLink(
    links.github || '',
    GITHUB_DOMAINS,
    (handle) => `https://github.com/${handle}`,
    /github\.com\/([^/?#]+)/i,
  );
  if (github.url) result.push(socialLink('github', github.url, github.handle));

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
  if (spotifyUrl) result.push(socialLink('spotify', spotifyUrl, spotifyHandle));

  const x = resolveHandleLink(
    links.x || '',
    X_DOMAINS,
    (handle) => `https://x.com/${handle}`,
    /(?:x|twitter)\.com\/([^/?#]+)/i,
  );
  if (x.url) result.push(socialLink('x', x.url, x.handle));

  const instagram = resolveHandleLink(
    links.instagram || '',
    INSTAGRAM_DOMAINS,
    (handle) => `https://instagram.com/${handle}`,
    /instagram\.com\/([^/?#]+)/i,
  );
  if (instagram.url) {
    result.push(socialLink('instagram', instagram.url, instagram.handle));
  }

  const vk = resolveHandleLink(
    links.vk || '',
    VK_DOMAINS,
    (handle) => `https://vk.com/${handle}`,
    /vk\.(?:com|ru)\/([^/?#]+)/i,
  );
  if (vk.url) result.push(socialLink('vk', vk.url, vk.handle));

  const redditRaw = links.reddit || '';
  let redditUrl = normalizeSocialUrl(redditRaw, REDDIT_DOMAINS);
  let redditHandle = '';

  if (redditUrl) {
    const match = redditUrl.match(/(?:reddit\.com|redd\.it)\/(?:u|user)\/([^/?#]+)/i);
    if (match) redditHandle = sanitizeHandle(match[1]);
  } else {
    redditHandle = sanitizeHandle(redditRaw.replace(/^\/?u\//i, ''));
    if (redditHandle) redditUrl = `https://reddit.com/user/${redditHandle}`;
  }
  if (redditUrl) result.push(socialLink('reddit', redditUrl, redditHandle));

  const robloxRaw = links.roblox || '';
  let robloxUrl = normalizeSocialUrl(robloxRaw, ROBLOX_DOMAINS);

  if (!robloxUrl && /^\d{5,15}$/.test(robloxRaw)) {
    robloxUrl = `https://www.roblox.com/users/${robloxRaw}/profile`;
  } else if (!robloxUrl) {
    const handle = sanitizeHandle(robloxRaw);
    if (handle) {
      robloxUrl = `https://www.roblox.com/search/users?keyword=${encodeURIComponent(handle)}`;
    }
  }
  if (robloxUrl) {
    result.push(socialLink('roblox', robloxUrl, ''));
  }

  const websiteUrl = normalizeUrl(links.website || '');
  if (websiteUrl) result.push(socialLink('website', websiteUrl, ''));

  const emailRaw = String(links.email || '').trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailRaw)) {
    const brand = SOCIAL_BRANDS.email;
    result.push({
      key: 'email',
      label: brand.label,
      icon: brand.icon,
      brand: brand.brand,
      href: `mailto:${emailRaw}`,
      meta: emailRaw,
    });
  }

  return result;
}

function buildCustomLinks(profile) {
  const result = [];

  for (const item of profile.customLinks || []) {
    const url = normalizeUrl(item.url);
    if (!url) continue;

    result.push({
      label: item.label || prettyUrl(url),
      href: url,
      meta: prettyUrl(url),
    });
  }

  return result;
}

function renderSocial(social, iconStyle) {
  const mono = iconStyle === 'mono';
  const style = mono ? '' : ` style="--brand:${social.brand}"`;
  const inner = `<i class="${social.icon}" aria-hidden="true"></i>`;
  const label = escapeHtml(social.label);

  if (social.copy) {
    return (
      `<button type="button" class="social social--${social.key}"${style} ` +
      `data-copy="${escapeHtml(social.copy)}" aria-label="Скопировать ${label}" ` +
      `title="Скопировать ${label}">${inner}</button>`
    );
  }

  return (
    `<a class="social social--${social.key}"${style} href="${escapeHtml(social.href)}" ` +
    `target="_blank" rel="noopener noreferrer" aria-label="${label}" ` +
    `title="${label}">${inner}</a>`
  );
}

function renderSocialButton(social) {
  const chevron = social.copy
    ? 'fa-solid fa-copy'
    : 'fa-solid fa-arrow-up-right-from-square';
  const inner = [
    `<span class="link__icon"><i class="${social.icon}" aria-hidden="true"></i></span>`,
    '<span class="link__body">',
    `<span class="link__label">${escapeHtml(social.label)}</span>`,
    `<span class="link__meta">${escapeHtml(social.meta)}</span>`,
    '</span>',
    `<i class="${chevron} link__chev" aria-hidden="true"></i>`,
  ].join('');

  if (social.copy) {
    return (
      `<button type="button" class="link link--${social.key}" ` +
      `style="--brand:${social.brand}" data-copy="${escapeHtml(social.copy)}" ` +
      `aria-label="Скопировать ${escapeHtml(social.label)}">${inner}</button>`
    );
  }

  return (
    `<a class="link link--${social.key}" style="--brand:${social.brand}" ` +
    `href="${escapeHtml(social.href)}" target="_blank" rel="noopener noreferrer" ` +
    `aria-label="${escapeHtml(social.label)}">${inner}</a>`
  );
}

function renderCustomLink(link, index) {
  const delay = (0.26 + index * 0.06).toFixed(2);

  return (
    `<a class="link link--custom reveal" style="--d:${delay}s" ` +
    `href="${escapeHtml(link.href)}" target="_blank" rel="noopener noreferrer" ` +
    `aria-label="${escapeHtml(link.label)}">` +
    '<span class="link__icon"><i class="fa-solid fa-link" aria-hidden="true"></i></span>' +
    '<span class="link__body">' +
    `<span class="link__label">${escapeHtml(link.label)}</span>` +
    `<span class="link__meta">${escapeHtml(link.meta)}</span>` +
    '</span>' +
    '<i class="fa-solid fa-arrow-up-right-from-square link__chev" aria-hidden="true"></i>' +
    '</a>'
  );
}

function badgeIcon(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('owner') || normalized.includes('владел')) {
    return 'fa-solid fa-crown';
  }
  if (normalized.includes('dev') || normalized.includes('разраб')) {
    return 'fa-solid fa-code';
  }
  if (normalized.includes('vip')) return 'fa-solid fa-gem';
  if (normalized.includes('verify') || normalized.includes('галоч')) {
    return 'fa-solid fa-circle-check';
  }
  if (normalized.includes('music') || normalized.includes('музык')) {
    return 'fa-solid fa-headphones';
  }
  return 'fa-solid fa-star';
}

function renderBadges(raw) {
  const badges = String(raw || '')
    .split(',')
    .map((badge) => badge.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!badges.length) return '';

  return (
    '<div class="badges reveal" style="--d:.2s">' +
    badges
      .map(
        (badge) =>
          `<span class="badge"><i class="${badgeIcon(badge)}" aria-hidden="true"></i>${escapeHtml(badge)}</span>`,
      )
      .join('') +
    '</div>'
  );
}

function renderFavicon(name, accent) {
  const letter = (String(name).trim()[0] || 'v').toUpperCase();
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

function cssImageUrl(src) {
  const safe = String(src || '').replace(/["'()\\\n\r]/g, '');
  return safe ? `url("${safe}")` : '';
}

function assetBasename(storedPath) {
  return storedPath ? path.basename(String(storedPath)) : '';
}

/**
 * Render the standalone bio page.
 *
 * @param {object} profile
 * @param {{
 *   cssHref?: string,
 *   scriptHref?: string,
 *   avatarSrc?: string,
 *   backgroundImageSrc?: string,
 *   audioSrc?: string,
 *   audioCoverSrc?: string,
 *   viewsEndpoint?: string,
 *   presenceEndpoint?: string,
 * }} options
 * @returns {string}
 */
function renderPage(profile, options = {}) {
  const cssHref = options.cssHref || 'style.css';
  const scriptHref = options.scriptHref || 'script.js';

  const avatarFile = assetBasename(profile.avatar);
  const backgroundFile = assetBasename(profile.backgroundImage);
  const audioFile = assetBasename(profile.audio);
  const coverFile = assetBasename(profile.audioCover);

  const avatarSrc = options.avatarSrc !== undefined
    ? options.avatarSrc
    : (avatarFile ? `assets/${avatarFile}` : 'assets/default-avatar.svg');
  const backgroundImageSrc = options.backgroundImageSrc !== undefined
    ? options.backgroundImageSrc
    : (backgroundFile ? `assets/${backgroundFile}` : '');
  const audioSrc = options.audioSrc !== undefined
    ? options.audioSrc
    : (/\.mp3$/i.test(audioFile) ? `assets/${audioFile}` : '');
  const audioCoverSrc = options.audioCoverSrc !== undefined
    ? options.audioCoverSrc
    : (coverFile ? `assets/${coverFile}` : '');
  const viewsEndpoint = options.viewsEndpoint !== undefined
    ? options.viewsEndpoint
    : '';
  const presenceEndpoint = options.presenceEndpoint !== undefined
    ? options.presenceEndpoint
    : '';

  const socials = buildSocials(profile);
  const customLinks = buildCustomLinks(profile);

  const displayName = escapeHtml(profile.displayName || profile.username);
  const username = escapeHtml(profile.username);
  const bio = escapeHtml(profile.bio);
  const background = /^#[0-9a-f]{6}$/i.test(profile.background)
    ? profile.background
    : '#0b0b10';
  const accent = /^#[0-9a-f]{6}$/i.test(profile.accent)
    ? profile.accent
    : '#8b5cf6';
  const customText = /^#[0-9a-f]{6}$/i.test(profile.textColor || '')
    ? profile.textColor
    : '';
  const particles = PARTICLE_EFFECTS.includes(profile.particles)
    ? profile.particles
    : 'off';
  const typewriter = Boolean(profile.typewriter) && Boolean(profile.bio);
  const hasImage = Boolean(backgroundImageSrc);
  const lightTheme = !hasImage && !customText && isLightColor(background);
  const textColor = customText || (lightTheme ? '#111318' : '#f5f6fa');
  const description = profile.bio
    ? profile.bio.replace(/\s+/g, ' ').slice(0, 160)
    : `Ссылки ${profile.username}`;
  const font = FONTS[profile.font] || FONTS.inter;
  const googleFont = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;

  const socialsHtml = socials.length
    ? socials.map((social) => renderSocial(social, profile.iconStyle)).join('\n          ')
    : '';
  const socialButtonsHtml = socials.length
    ? socials.map(renderSocialButton).join('\n            ')
    : '';

  const socialsBlock = socials.length
    ? profile.socialStyle === 'buttons'
      ? `<nav class="links links--socials reveal" style="--d:.24s" aria-label="Социальные сети">
            ${socialButtonsHtml}
          </nav>`
      : `<nav class="socials reveal" style="--d:.24s" aria-label="Социальные сети">
          ${socialsHtml}
        </nav>`
    : '';

  const customLinksHtml = customLinks.length
    ? `<nav class="links reveal" style="--d:.3s" aria-label="Ссылки">
            ${customLinks.map(renderCustomLink).join('\n            ')}
          </nav>`
    : '';

  const bioHtml = !bio
    ? ''
    : typewriter
      ? `<p class="bio bio--typewriter reveal" style="--d:.18s" data-typewriter><span class="bio__text">${bio}</span><span class="bio__caret" aria-hidden="true"></span></p>`
      : `<p class="bio reveal" style="--d:.18s">${bio}</p>`;

  const badgesHtml = renderBadges(profile.badges);

  const discordBlock = profile.showDiscord && profile.discordId
    ? `<div class="presence reveal" style="--d:.21s" id="presence" data-discord-id="${escapeHtml(profile.discordId)}" data-presence-endpoint="${escapeHtml(presenceEndpoint)}" hidden>
            <span class="presence__dot" data-state="offline" aria-hidden="true"></span>
            <span class="presence__icon"><i class="fa-brands fa-discord" aria-hidden="true"></i></span>
            <span class="presence__text" id="presence-text">Discord</span>
            <span class="presence__activity" id="presence-activity"></span>
          </div>`
    : '';

  const metaItems = [];
  if (profile.showViews) {
    metaItems.push(
      `<span class="meta" id="views" data-endpoint="${escapeHtml(viewsEndpoint)}" data-username="${username}">
              <i class="fa-solid fa-eye" aria-hidden="true"></i>
              <span id="views-count">0</span>
            </span>`,
    );
  }
  if (profile.showClock) {
    metaItems.push(
      `<span class="meta" id="clock" title="Местное время">
              <i class="fa-regular fa-clock" aria-hidden="true"></i>
              <span id="clock-time">--:--</span>
            </span>`,
    );
  }
  if (profile.showShare) {
    metaItems.push(
      `<button type="button" class="meta meta--button" id="share" aria-label="Поделиться страницей">
              <i class="fa-solid fa-share-nodes" aria-hidden="true"></i>
              <span>Поделиться</span>
            </button>`,
    );
  }

  const metaHtml = metaItems.length
    ? `<div class="meta-row reveal" style="--d:.34s">${metaItems.join('')}</div>`
    : '';

  const audioHtml = audioSrc
    ? `<div class="player reveal" id="player">
    <audio id="bg-music" src="${escapeHtml(audioSrc)}" loop preload="metadata"></audio>
    <button type="button" class="player__cover" id="music-toggle" aria-label="Включить музыку" aria-pressed="false">
      ${audioCoverSrc
        ? `<img src="${escapeHtml(audioCoverSrc)}" alt="Обложка трека" width="56" height="56">`
        : '<span class="player__cover-fallback"><i class="fa-solid fa-music" aria-hidden="true"></i></span>'}
      <span class="player__cover-overlay"><i class="fa-solid fa-play" id="music-icon" aria-hidden="true"></i></span>
    </button>
    <div class="player__body">
      <div class="player__meta">
        <span class="player__title" title="${escapeHtml(profile.audioTitle || 'Фоновая музыка')}">${escapeHtml(profile.audioTitle || 'Фоновая музыка')}</span>
        <span class="player__artist">${escapeHtml(profile.audioArtist || profile.username)}</span>
      </div>
      <div class="player__row">
        <span class="player__time" id="music-current">0:00</span>
        <input type="range" class="player__range" id="music-seek" min="0" max="100" step="0.1" value="0" aria-label="Позиция трека">
        <span class="player__time" id="music-duration">0:00</span>
        <button type="button" class="player__mute" id="music-mute" aria-label="Выключить звук">
          <i class="fa-solid fa-volume-high" id="music-volume-icon" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  </div>`
    : '';

  const avatarClass = ['avatar', `avatar--${profile.avatarShape}`].join(' ');
  const cardClass = ['card', `card--${profile.cardStyle}`].join(' ');
  const iconClass = profile.iconStyle === 'mono' ? 'icons--mono' : '';
  const bodyClass = [
    lightTheme ? 'theme-light' : '',
    iconClass,
    hasImage ? 'has-image' : '',
    audioSrc ? 'has-player' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Custom properties may contain quotes (font stacks), so the whole style
  // attribute value has to be HTML-escaped before it is placed in markup.
  const bodyStyle = [
    `--bg:${background}`,
    `--accent:${accent}`,
    `--text:${textColor}`,
    `--font:${font.stack}`,
    `--card-opacity:${profile.cardOpacity}%`,
    `--card-blur:${profile.cardBlur}px`,
  ].join(';');

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${displayName} (@${username})</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="${background}">
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${displayName} (@${username})">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(avatarSrc)}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${displayName} (@${username})">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <link rel="icon" href="${renderFavicon(profile.displayName || profile.username, accent)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${escapeHtml(googleFont)}">
  <link rel="stylesheet" href="${escapeHtml(FONT_AWESOME)}" referrerpolicy="no-referrer">
  <link rel="stylesheet" href="${escapeHtml(cssHref)}">
</head>
<body
  class="${bodyClass}"
  style="${escapeHtml(bodyStyle)}"
  data-particles="${particles}"
  data-cursor="${profile.cursor}"
  data-username="${username}"
>
  <div class="bg" aria-hidden="true">
    ${hasImage ? `<div class="bg__image" style="background-image:${escapeHtml(cssImageUrl(backgroundImageSrc))}"></div>` : ''}
    <div class="bg__overlay"></div>
    <div class="bg__grid"></div>
    <span class="orb orb--1"></span>
    <span class="orb orb--2"></span>
    <span class="orb orb--3"></span>
  </div>

  <div class="cursor-glow" id="cursor-glow" aria-hidden="true"></div>
  <canvas class="fx" id="fx" aria-hidden="true"></canvas>

  <div class="page">
    <main class="${cardClass}">
      <div class="card__glow" aria-hidden="true"></div>

      <header class="profile">
        <div class="${avatarClass}">
          <img src="${escapeHtml(avatarSrc)}" alt="Аватар ${displayName}" width="120" height="120">
          ${profile.showDiscord && profile.discordId
            ? '<span class="avatar__status" id="avatar-status" data-state="offline" title="Discord"></span>'
            : ''}
        </div>

        <h1 class="name reveal" style="--d:.1s">${displayName}</h1>
        <p class="handle reveal" style="--d:.14s">@${username}</p>
        ${badgesHtml}
        ${bioHtml}
        ${discordBlock}
      </header>

      ${socialsBlock}
      ${customLinksHtml}
      ${metaHtml}

      <footer class="card-footer reveal" style="--d:.4s">
        <span class="brand">
          <i class="fa-solid fa-bolt" aria-hidden="true"></i>
          <span>vibe.bio</span>
        </span>
      </footer>
    </main>
  </div>

  ${audioHtml}

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script src="${escapeHtml(scriptHref)}" defer></script>
</body>
</html>
`;
}

module.exports = {
  CSS,
  CSS_PATH,
  SCRIPT_PATH,
  buildCustomLinks,
  buildSocials,
  escapeHtml,
  isLightColor,
  normalizeUrl,
  renderPage,
};
