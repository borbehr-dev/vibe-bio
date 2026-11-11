'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

const {
  AVATAR_SHAPES,
  CARD_STYLES,
  CURSORS,
  FONTS,
  ICON_STYLES,
  PARTICLE_EFFECTS,
  SOCIAL_STYLES,
  ValidationError,
  getViews,
  incrementViews,
  loadProfile,
  saveProfile,
} = require('./lib/store');
const { buildSite, DIST_DIR } = require('./lib/build');
const { CSS, SCRIPT_PATH, renderPage } = require('./lib/render');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 9999;
const HOST = process.env.HOST || '127.0.0.1';

const ASSETS_DIR = path.join(ROOT, 'assets');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');

const MB = 1024 * 1024;

fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/* ---------------------------- file uploads ----------------------------- */

const IMAGE_MIME_EXTENSIONS = new Map([
  ['image/jpeg', '.jpg'],
  ['image/jpg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
]);

const AUDIO_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mpeg3',
  'audio/x-mpeg',
]);

const FIELD_PREFIXES = Object.freeze({
  avatar: 'avatar',
  background: 'bg',
  cover: 'cover',
});

const FIELD_LIMITS = Object.freeze({
  avatar: 5 * MB,
  background: 10 * MB,
  audio: 10 * MB,
  cover: 5 * MB,
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, ASSETS_DIR),
  filename: (req, file, callback) => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (file.fieldname === 'audio') {
      callback(null, `music-${suffix}.mp3`);
      return;
    }

    const extension = IMAGE_MIME_EXTENSIONS.get(file.mimetype) || '.png';
    const prefix = FIELD_PREFIXES[file.fieldname] || 'file';
    callback(null, `${prefix}-${suffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * MB, files: 4 },
  fileFilter: (req, file, callback) => {
    if (file.fieldname === 'audio') {
      const genericMp3 =
        file.mimetype === 'application/octet-stream' &&
        /\.mp3$/i.test(file.originalname || '');

      if (!AUDIO_MIME_TYPES.has(file.mimetype) && !genericMp3) {
        const error = new Error('Можно загрузить только MP3-файл.');
        error.code = 'INVALID_AUDIO_TYPE';
        callback(error);
        return;
      }

      callback(null, true);
      return;
    }

    if (!IMAGE_MIME_EXTENSIONS.has(file.mimetype)) {
      const error = new Error('Поддерживаются только PNG, JPG, WEBP и GIF.');
      error.code = 'INVALID_FILE_TYPE';
      callback(error);
      return;
    }

    callback(null, true);
  },
});

const profileUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'background', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

function uploadedFile(req, field) {
  const files = req.files && req.files[field];
  return Array.isArray(files) && files[0] ? files[0] : null;
}

function uploadedFileList(req) {
  if (!req.files) return [];
  return Object.values(req.files).flat();
}

function validateUploadedSizes(req) {
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const file = uploadedFile(req, field);
    if (!file) continue;

    if (file.size > limit) {
      throw new ValidationError(
        `Файл «${file.originalname}» слишком большой. Максимум — ${Math.round(limit / MB)} МБ.`,
      );
    }
  }
}

function removeManagedAsset(storedPath, fileNamePattern) {
  if (!storedPath) return;

  const fileName = path.basename(storedPath);
  if (!fileNamePattern.test(fileName)) return;

  const filePath = path.join(ASSETS_DIR, fileName);
  if (!filePath.startsWith(`${ASSETS_DIR}${path.sep}`)) return;

  try {
    fs.rmSync(filePath, { force: true });
  } catch {
    // A leftover file is not critical.
  }
}

function removeUploadedAvatar(avatarPath) {
  removeManagedAsset(avatarPath, /^avatar-[a-z0-9._-]+$/i);
}

function removeUploadedBackground(backgroundPath) {
  removeManagedAsset(backgroundPath, /^bg-[a-z0-9._-]+$/i);
}

function removeUploadedAudio(audioPath) {
  removeManagedAsset(audioPath, /^music-[a-z0-9._-]+\.mp3$/i);
}

function removeUploadedCover(coverPath) {
  removeManagedAsset(coverPath, /^cover-[a-z0-9._-]+$/i);
}

function assetUrlFor(storedPath, fallback = '') {
  if (!storedPath) return fallback;

  const fileName = path.basename(storedPath);
  const filePath = path.join(ASSETS_DIR, fileName);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const cacheKey = Math.floor(fs.statSync(filePath).mtimeMs);
    return `/assets/${encodeURIComponent(fileName)}?v=${cacheKey}`;
  }

  return fallback;
}

function avatarUrlFor(profile) {
  return assetUrlFor(profile.avatar, '/assets/default-avatar.svg');
}

function backgroundUrlFor(profile) {
  return assetUrlFor(profile.backgroundImage, '');
}

function audioUrlFor(profile) {
  if (!profile.audio) return '';

  const fileName = path.basename(profile.audio);
  if (!/\.mp3$/i.test(fileName)) return '';

  return assetUrlFor(profile.audio, '');
}

function coverUrlFor(profile) {
  return assetUrlFor(profile.audioCover, '');
}

function builtAtFor() {
  try {
    const stat = fs.statSync(DIST_INDEX);
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(stat.mtime);
  } catch {
    return null;
  }
}

function parseCustomLinks(raw) {
  if (raw === undefined) return undefined;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeViewUsername(value) {
  const username = String(value || '').trim().toLowerCase();
  return /^[a-z0-9._-]{1,40}$/.test(username) ? username : '';
}

/* --------------------------------- app ---------------------------------- */

const app = express();
app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/assets', express.static(ASSETS_DIR, { maxAge: '1h' }));
app.use('/static', express.static(PUBLIC_DIR, { maxAge: '1h' }));
app.use('/dist', express.static(DIST_DIR, { index: 'index.html' }));

app.get('/', (req, res, next) => {
  try {
    const profile = loadProfile();
    res.render('admin', {
      profile,
      avatarUrl: avatarUrlFor(profile),
      backgroundUrl: backgroundUrlFor(profile),
      audioUrl: audioUrlFor(profile),
      coverUrl: coverUrlFor(profile),
      distExists: fs.existsSync(DIST_INDEX),
      builtAt: builtAtFor(),
      fonts: Object.entries(FONTS).map(([id, font]) => ({ id, ...font })),
      avatarShapes: AVATAR_SHAPES,
      cardStyles: CARD_STYLES,
      socialStyles: SOCIAL_STYLES,
      iconStyles: ICON_STYLES,
      cursors: CURSORS,
      particleEffects: PARTICLE_EFFECTS,
    });
  } catch (error) {
    next(error);
  }
});

app.get('/preview', (req, res, next) => {
  try {
    const profile = loadProfile();
    const html = renderPage(profile, {
      cssHref: '/preview/style.css',
      scriptHref: '/preview/script.js',
      avatarSrc: avatarUrlFor(profile),
      backgroundImageSrc: backgroundUrlFor(profile),
      audioSrc: audioUrlFor(profile),
      audioCoverSrc: coverUrlFor(profile),
      viewsEndpoint: '/api/views',
      presenceEndpoint: '/api/discord',
    });
    res.type('html').send(html);
  } catch (error) {
    next(error);
  }
});

app.get('/preview/style.css', (req, res) => {
  res.type('css').send(CSS);
});

app.get('/preview/script.js', (req, res) => {
  res.type('application/javascript').sendFile(SCRIPT_PATH);
});

app.post('/api/save', profileUpload, (req, res, next) => {
  const avatarFile = uploadedFile(req, 'avatar');
  const backgroundFile = uploadedFile(req, 'background');
  const audioFile = uploadedFile(req, 'audio');
  const coverFile = uploadedFile(req, 'cover');
  const uploadedPaths = uploadedFileList(req).map((file) =>
    path.join(ASSETS_DIR, file.filename),
  );

  try {
    validateUploadedSizes(req);

    const previous = loadProfile();
    const body = req.body || {};

    const profile = saveProfile({
      username: body.username,
      displayName: body.displayName,
      bio: body.bio,
      background: body.background,
      accent: body.accent,
      textColor: body.textColor,
      font: body.font,
      avatarShape: body.avatarShape,
      cardStyle: body.cardStyle,
      cardOpacity: body.cardOpacity,
      cardBlur: body.cardBlur,
      socialStyle: body.socialStyle,
      iconStyle: body.iconStyle,
      typewriter:
        body.typewriter !== undefined ? body.typewriter === 'on' : undefined,
      particles: body.particles,
      cursor: body.cursor,
      showViews:
        body.showViews !== undefined ? body.showViews === 'on' : undefined,
      showClock:
        body.showClock !== undefined ? body.showClock === 'on' : undefined,
      showShare:
        body.showShare !== undefined ? body.showShare === 'on' : undefined,
      showDiscord:
        body.showDiscord !== undefined ? body.showDiscord === 'on' : undefined,
      discordId: body.discordId,
      badges: body.badges,
      audioTitle: body.audioTitle,
      audioArtist: body.audioArtist,
      customLinks: parseCustomLinks(body.customLinks),
      links: {
        telegram: body.telegram,
        discord: body.discord,
        youtube: body.youtube,
        tiktok: body.tiktok,
        twitch: body.twitch,
        steam: body.steam,
        github: body.github,
        spotify: body.spotify,
        x: body.x,
        instagram: body.instagram,
        vk: body.vk,
        reddit: body.reddit,
        roblox: body.roblox,
        website: body.website,
        email: body.email,
      },
      ...(avatarFile ? { avatar: `/assets/${avatarFile.filename}` } : {}),
      ...(backgroundFile
        ? { backgroundImage: `/assets/${backgroundFile.filename}` }
        : {}),
      ...(audioFile ? { audio: `/assets/${audioFile.filename}` } : {}),
      ...(coverFile ? { audioCover: `/assets/${coverFile.filename}` } : {}),
    });

    if (avatarFile && previous.avatar && previous.avatar !== profile.avatar) {
      removeUploadedAvatar(previous.avatar);
    }
    if (
      backgroundFile &&
      previous.backgroundImage &&
      previous.backgroundImage !== profile.backgroundImage
    ) {
      removeUploadedBackground(previous.backgroundImage);
    }
    if (audioFile && previous.audio && previous.audio !== profile.audio) {
      removeUploadedAudio(previous.audio);
    }
    if (
      coverFile &&
      previous.audioCover &&
      previous.audioCover !== profile.audioCover
    ) {
      removeUploadedCover(previous.audioCover);
    }

    res.json({
      ok: true,
      profile,
      avatarUrl: avatarUrlFor(profile),
      backgroundUrl: backgroundUrlFor(profile),
      audioUrl: audioUrlFor(profile),
      coverUrl: coverUrlFor(profile),
    });
  } catch (error) {
    uploadedPaths.forEach((uploadedPath) => {
      try {
        fs.rmSync(uploadedPath, { force: true });
      } catch {
        // ignore cleanup errors
      }
    });
    next(error);
  }
});

app.post('/api/avatar/remove', (req, res, next) => {
  try {
    const previous = loadProfile();
    const profile = saveProfile({ avatar: null });

    if (previous.avatar) removeUploadedAvatar(previous.avatar);

    res.json({ ok: true, profile, avatarUrl: avatarUrlFor(profile) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/background/remove', (req, res, next) => {
  try {
    const previous = loadProfile();
    const profile = saveProfile({ backgroundImage: null });

    if (previous.backgroundImage) {
      removeUploadedBackground(previous.backgroundImage);
    }

    res.json({
      ok: true,
      profile,
      backgroundUrl: backgroundUrlFor(profile),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/audio/remove', (req, res, next) => {
  try {
    const previous = loadProfile();
    const profile = saveProfile({ audio: null });

    if (previous.audio) removeUploadedAudio(previous.audio);

    res.json({ ok: true, profile, audioUrl: audioUrlFor(profile) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/cover/remove', (req, res, next) => {
  try {
    const previous = loadProfile();
    const profile = saveProfile({ audioCover: null });

    if (previous.audioCover) removeUploadedCover(previous.audioCover);

    res.json({ ok: true, profile, coverUrl: coverUrlFor(profile) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/views', (req, res, next) => {
  try {
    const requested = sanitizeViewUsername(req.body && req.body.username);
    const username = requested || sanitizeViewUsername(loadProfile().username);
    const views = incrementViews(username);
    res.json({ ok: true, views });
  } catch (error) {
    next(error);
  }
});

app.get('/api/views', (req, res, next) => {
  try {
    const requested = sanitizeViewUsername(req.query.username);
    const username = requested || sanitizeViewUsername(loadProfile().username);
    res.json({ ok: true, views: getViews(username) });
  } catch (error) {
    next(error);
  }
});

/**
 * Proxy a Lanyard lookup so the admin can explain why a presence badge is
 * missing. Lanyard only tracks users who joined its Discord server, so a
 * `user_not_monitored` response is expected until the owner does that.
 */
app.get('/api/discord', async (req, res) => {
  const id = String(req.query.id || '').trim();

  if (!/^\d{17,20}$/.test(id)) {
    res.status(400).json({
      ok: false,
      reason: 'invalid_id',
      error: 'Discord ID должен состоять из 17–20 цифр.',
    });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${encodeURIComponent(id)}`,
      {
        signal: controller.signal,
        headers: { accept: 'application/json' },
      },
    );

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (response.ok && payload && payload.success && payload.data) {
      res.json({ ok: true, data: payload.data });
      return;
    }

    const code = payload && payload.error && payload.error.code;
    if (response.status === 404 && code === 'user_not_monitored') {
      res.json({
        ok: false,
        reason: 'not_monitored',
        error: 'Lanyard не отслеживает этот аккаунт. Зайдите на discord.gg/lanyard.',
      });
      return;
    }

    res.json({
      ok: false,
      reason: 'unavailable',
      error: 'Lanyard временно недоступен. Попробуйте позже.',
    });
  } catch {
    res.json({
      ok: false,
      reason: 'unavailable',
      error: 'Не удалось связаться с Lanyard. Проверьте интернет.',
    });
  } finally {
    clearTimeout(timer);
  }
});

app.post('/api/build', (req, res, next) => {
  try {
    const profile = loadProfile();
    const result = buildSite(profile);
    console.log(
      `[build] ${result.files.join(' + ')} (${new Date().toLocaleTimeString('ru-RU')})`,
    );
    res.json({
      ok: true,
      ...result,
      previewUrl: `/dist/index.html?v=${Date.now()}`,
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ ok: false, error: 'Маршрут не найден.' });
    return;
  }
  res.status(404).type('text').send('404 — страница не найдена');
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  let status = Number(error.status) || 500;
  let message = 'Внутренняя ошибка сервера.';

  if (error instanceof ValidationError) {
    message = error.message;
  } else if (error instanceof multer.MulterError) {
    status = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'Файл слишком большой. Максимум — 12 МБ.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Неожиданное поле загрузки файла.';
    } else {
      message = `Ошибка загрузки файла: ${error.message}`;
    }
  } else if (
    error.code === 'INVALID_FILE_TYPE' ||
    error.code === 'INVALID_AUDIO_TYPE'
  ) {
    status = 400;
    message = error.message;
  } else {
    console.error('[error]', error);
  }

  if (req.path.startsWith('/api/')) {
    res.status(status).json({ ok: false, error: message });
    return;
  }

  res.status(status).type('text').send(message);
});

app.listen(PORT, HOST, () => {
  console.log('');
  console.log('  vibe.bio — bio-link page generator');
  console.log(`  Админка:  http://${HOST}:${PORT}`);
  console.log(`  Превью:   http://${HOST}:${PORT}/preview`);
  console.log('');
});
