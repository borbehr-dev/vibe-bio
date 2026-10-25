'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const PROFILE_PATH = path.join(DATA_DIR, 'profile.json');

const DEFAULT_PROFILE = Object.freeze({
  username: 'yourname',
  bio: 'Добро пожаловать на мою страницу. Здесь собраны все мои ссылки.',
  background: '#0b0b10',
  accent: '#8b5cf6',
  avatar: null,
  audio: null,
  typewriter: false,
  particles: 'off',
  links: {
    telegram: '',
    discord: '',
    youtube: '',
    tiktok: '',
    twitch: '',
    steam: '',
    github: '',
    spotify: '',
  },
});

const LINK_KEYS = Object.freeze([
  'telegram',
  'discord',
  'youtube',
  'tiktok',
  'twitch',
  'steam',
  'github',
  'spotify',
]);

const PARTICLE_EFFECTS = Object.freeze(['off', 'hearts', 'snow', 'neon']);

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

/**
 * Merge incoming fields into the current profile and validate them.
 * Unknown keys are ignored on purpose.
 */
function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1;
}

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
    avatar:
      source.avatar !== undefined ? source.avatar : current.avatar,
    audio:
      source.audio !== undefined ? source.audio : current.audio,
    typewriter: source.typewriter !== undefined
      ? normalizeBoolean(source.typewriter)
      : Boolean(current.typewriter),
    particles: PARTICLE_EFFECTS.includes(particles)
      ? particles
      : (PARTICLE_EFFECTS.includes(current.particles) ? current.particles : 'off'),
    links: {},
  };

  for (const key of LINK_KEYS) {
    const fallback = current.links && current.links[key] !== undefined
      ? current.links[key]
      : defaultLinks[key];

    profile.links[key] = cleanLine(
      links[key] !== undefined ? links[key] : fallback,
      200,
    );
  }

  if (!profile.username) {
    throw new ValidationError('Username не может быть пустым.');
  }
  if (profile.avatar !== null && typeof profile.avatar !== 'string') {
    throw new ValidationError('Некорректный путь к аватарке.');
  }
  if (profile.audio !== null && typeof profile.audio !== 'string') {
    throw new ValidationError('Некорректный путь к музыке.');
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

module.exports = {
  DEFAULT_PROFILE,
  LINK_KEYS,
  PARTICLE_EFFECTS,
  PROFILE_PATH,
  ValidationError,
  ensureDataDir,
  loadProfile,
  normalizeProfile,
  saveProfile,
  isHexColor,
};
