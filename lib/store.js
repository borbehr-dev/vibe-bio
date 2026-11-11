'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PROFILE_PATH = path.join(DATA_DIR, 'profile.json');
const VIEWS_PATH = path.join(DATA_DIR, 'views.json');

const FONTS = Object.freeze({
  inter: {
    label: 'Inter',
    stack: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    google: 'Inter:wght@400;500;600;700;800',
  },
  poppins: {
    label: 'Poppins',
    stack: '"Poppins", "Segoe UI", system-ui, sans-serif',
    google: 'Poppins:wght@400;500;600;700',
  },
  sora: {
    label: 'Sora',
    stack: '"Sora", "Segoe UI", system-ui, sans-serif',
    google: 'Sora:wght@400;500;600;700',
  },
  manrope: {
    label: 'Manrope',
    stack: '"Manrope", "Segoe UI", system-ui, sans-serif',
    google: 'Manrope:wght@400;500;600;700;800',
  },
  space: {
    label: 'Space Grotesk',
    stack: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
    google: 'Space+Grotesk:wght@400;500;600;700',
  },
  outfit: {
    label: 'Outfit',
    stack: '"Outfit", "Segoe UI", system-ui, sans-serif',
    google: 'Outfit:wght@400;500;600;700',
  },
  mono: {
    label: 'JetBrains Mono',
    stack: '"JetBrains Mono", "Cascadia Code", ui-monospace, monospace',
    google: 'JetBrains+Mono:wght@400;500;700',
  },
  playfair: {
    label: 'Playfair Display',
    stack: '"Playfair Display", Georgia, serif',
    google: 'Playfair+Display:wght@500;600;700',
  },
});

const AVATAR_SHAPES = Object.freeze(['circle', 'rounded', 'square']);
const CARD_STYLES = Object.freeze(['glass', 'solid', 'outline', 'none']);
const SOCIAL_STYLES = Object.freeze(['icons', 'buttons']);
const ICON_STYLES = Object.freeze(['color', 'mono']);
const CURSORS = Object.freeze(['off', 'glow', 'trail']);
const PARTICLE_EFFECTS = Object.freeze([
  'off',
  'hearts',
  'snow',
  'neon',
  'stars',
  'bubbles',
  'fire',
  'confetti',
]);

const LINK_KEYS = Object.freeze([
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
]);

const DEFAULT_PROFILE = Object.freeze({
  username: 'yourname',
  displayName: '',
  bio: 'Добро пожаловать на мою страницу. Здесь собраны все мои ссылки.',
  avatar: null,
  backgroundImage: null,
  audio: null,
  audioCover: null,
  audioTitle: '',
  audioArtist: '',
  background: '#0b0b10',
  accent: '#8b5cf6',
  textColor: '',
  font: 'inter',
  avatarShape: 'circle',
  cardStyle: 'glass',
  cardOpacity: 62,
  cardBlur: 22,
  socialStyle: 'icons',
  iconStyle: 'color',
  typewriter: false,
  particles: 'off',
  cursor: 'off',
  showViews: true,
  showClock: true,
  showShare: true,
  showDiscord: true,
  discordId: '',
  badges: '',
  links: {
    telegram: '',
    discord: '',
    youtube: '',
    tiktok: '',
    twitch: '',
    steam: '',
    github: '',
    spotify: '',
    x: '',
    instagram: '',
    vk: '',
    reddit: '',
    roblox: '',
    website: '',
    email: '',
  },
  customLinks: [],
});

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function isHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ''));
}

/** Trim, collapse redundant whitespace and hard-limit a single-line value. */
function cleanLine(value, max) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Trim a multiline value while keeping intentional line breaks. */
function cleanText(value, max) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1;
}

function clampInt(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeChoice(value, allowed, fallback) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return allowed.includes(normalized) ? normalized : fallback;
}

function normalizeCustomLinks(value, fallback) {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source)) return [];

  return source
    .slice(0, 8)
    .map((item) => ({
      label: cleanLine(item && item.label, 40),
      url: cleanLine(item && item.url, 300),
    }))
    .filter((item) => item.label || item.url)
    .map((item) => ({
      label: item.label || 'Ссылка',
      url: item.url,
    }));
}

/**
 * Merge incoming fields into the current profile and validate them.
 * Unknown keys are ignored on purpose.
 */
function normalizeProfile(input, base) {
  const source = input || {};
  const current = base || DEFAULT_PROFILE;
  const links = source.links || {};
  const defaultLinks = DEFAULT_PROFILE.links;

  const particles = source.particles !== undefined
    ? String(source.particles)
    : current.particles;

  const profile = {
    username: cleanLine(
      source.username !== undefined ? source.username : current.username,
      40,
    ),
    displayName: cleanLine(
      source.displayName !== undefined ? source.displayName : current.displayName,
      40,
    ),
    bio: cleanText(
      source.bio !== undefined ? source.bio : current.bio,
      300,
    ),
    background: isHexColor(source.background)
      ? String(source.background).toLowerCase()
      : current.background || DEFAULT_PROFILE.background,
    accent: isHexColor(source.accent)
      ? String(source.accent).toLowerCase()
      : current.accent || DEFAULT_PROFILE.accent,
    textColor: isHexColor(source.textColor)
      ? String(source.textColor).toLowerCase()
      : '',
    font: normalizeChoice(
      source.font !== undefined ? source.font : current.font,
      Object.keys(FONTS),
      'inter',
    ),
    avatarShape: normalizeChoice(
      source.avatarShape !== undefined ? source.avatarShape : current.avatarShape,
      AVATAR_SHAPES,
      'circle',
    ),
    cardStyle: normalizeChoice(
      source.cardStyle !== undefined ? source.cardStyle : current.cardStyle,
      CARD_STYLES,
      'glass',
    ),
    cardOpacity: clampInt(
      source.cardOpacity !== undefined ? source.cardOpacity : current.cardOpacity,
      0,
      100,
      62,
    ),
    cardBlur: clampInt(
      source.cardBlur !== undefined ? source.cardBlur : current.cardBlur,
      0,
      40,
      22,
    ),
    socialStyle: normalizeChoice(
      source.socialStyle !== undefined ? source.socialStyle : current.socialStyle,
      SOCIAL_STYLES,
      'icons',
    ),
    iconStyle: normalizeChoice(
      source.iconStyle !== undefined ? source.iconStyle : current.iconStyle,
      ICON_STYLES,
      'color',
    ),
    avatar:
      source.avatar !== undefined ? source.avatar : current.avatar,
    backgroundImage:
      source.backgroundImage !== undefined
        ? source.backgroundImage
        : current.backgroundImage,
    audio:
      source.audio !== undefined ? source.audio : current.audio,
    audioCover:
      source.audioCover !== undefined ? source.audioCover : current.audioCover,
    audioTitle: cleanLine(
      source.audioTitle !== undefined ? source.audioTitle : current.audioTitle,
      60,
    ),
    audioArtist: cleanLine(
      source.audioArtist !== undefined ? source.audioArtist : current.audioArtist,
      60,
    ),
    typewriter: source.typewriter !== undefined
      ? normalizeBoolean(source.typewriter)
      : Boolean(current.typewriter),
    particles: normalizeChoice(
      particles,
      PARTICLE_EFFECTS,
      normalizeChoice(current.particles, PARTICLE_EFFECTS, 'off'),
    ),
    cursor: normalizeChoice(
      source.cursor !== undefined ? source.cursor : current.cursor,
      CURSORS,
      'off',
    ),
    showViews: source.showViews !== undefined
      ? normalizeBoolean(source.showViews)
      : Boolean(current.showViews),
    showClock: source.showClock !== undefined
      ? normalizeBoolean(source.showClock)
      : Boolean(current.showClock),
    showShare: source.showShare !== undefined
      ? normalizeBoolean(source.showShare)
      : Boolean(current.showShare),
    showDiscord: source.showDiscord !== undefined
      ? normalizeBoolean(source.showDiscord)
      : Boolean(current.showDiscord),
    discordId: /^\d{17,20}$/.test(
      cleanLine(
        source.discordId !== undefined ? source.discordId : current.discordId,
        20,
      ),
    )
      ? cleanLine(
        source.discordId !== undefined ? source.discordId : current.discordId,
        20,
      )
      : '',
    badges: cleanLine(
      source.badges !== undefined ? source.badges : current.badges,
      120,
    ),
    links: {},
    customLinks: normalizeCustomLinks(
      source.customLinks,
      current.customLinks,
    ),
  };

  for (const key of LINK_KEYS) {
    const fallback = current.links && current.links[key] !== undefined
      ? current.links[key]
      : defaultLinks[key];

    profile.links[key] = cleanLine(
      links[key] !== undefined ? links[key] : fallback,
      300,
    );
  }

  if (!profile.username) {
    throw new ValidationError('Username не может быть пустым.');
  }
  if (profile.avatar !== null && typeof profile.avatar !== 'string') {
    throw new ValidationError('Некорректный путь к аватарке.');
  }
  if (
    profile.backgroundImage !== null &&
    typeof profile.backgroundImage !== 'string'
  ) {
    throw new ValidationError('Некорректный путь к фону.');
  }
  if (profile.audio !== null && typeof profile.audio !== 'string') {
    throw new ValidationError('Некорректный путь к музыке.');
  }
  if (profile.audioCover !== null && typeof profile.audioCover !== 'string') {
    throw new ValidationError('Некорректный путь к обложке.');
  }

  return profile;
}

function loadProfile() {
  ensureDataDir();

  try {
    const raw = fs.readFileSync(PROFILE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeProfile(parsed, DEFAULT_PROFILE);
  } catch {
    // Missing, corrupted or manually broken file: fall back to defaults.
    return normalizeProfile(DEFAULT_PROFILE, DEFAULT_PROFILE);
  }
}

function saveProfile(input) {
  ensureDataDir();

  const current = loadProfile();
  const profile = normalizeProfile(input, current);
  const tempPath = `${PROFILE_PATH}.tmp`;

  fs.writeFileSync(tempPath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, PROFILE_PATH);

  return profile;
}

/* ------------------------------- view counter ------------------------------ */

function loadViews() {
  ensureDataDir();

  try {
    const raw = fs.readFileSync(VIEWS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function saveViews(views) {
  ensureDataDir();

  const tempPath = `${VIEWS_PATH}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(views, null, 2)}\n`, 'utf8');
  fs.renameSync(tempPath, VIEWS_PATH);
}

function getViews(username) {
  const key = String(username || '').toLowerCase();
  const views = loadViews();
  return Math.max(0, Number.parseInt(views[key], 10) || 0);
}

function incrementViews(username) {
  const key = String(username || '').toLowerCase();
  if (!key) return 0;

  const views = loadViews();
  const next = Math.max(0, Number.parseInt(views[key], 10) || 0) + 1;
  views[key] = next;
  saveViews(views);
  return next;
}

module.exports = {
  AVATAR_SHAPES,
  CARD_STYLES,
  CURSORS,
  DEFAULT_PROFILE,
  FONTS,
  ICON_STYLES,
  LINK_KEYS,
  PARTICLE_EFFECTS,
  PROFILE_PATH,
  SOCIAL_STYLES,
  VIEWS_PATH,
  ValidationError,
  ensureDataDir,
  getViews,
  incrementViews,
  isHexColor,
  loadProfile,
  normalizeProfile,
  saveProfile,
};
