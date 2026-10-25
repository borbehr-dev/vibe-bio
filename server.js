'use strict';

const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

const { loadProfile, saveProfile, ValidationError } = require('./lib/store');
const { buildSite, DIST_DIR } = require('./lib/build');
const { CSS, SCRIPT_PATH, renderPage } = require('./lib/render');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 9999;
const HOST = process.env.HOST || '127.0.0.1';

const ASSETS_DIR = path.join(ROOT, 'assets');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');

fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

/* ---------------------------- file uploads ----------------------------- */

const MIME_EXTENSIONS = new Map([
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
  'audio/x-mp3',
]);

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, ASSETS_DIR),
  filename: (req, file, callback) => {
    if (file.fieldname === 'audio') {
      callback(null, `music-${Date.now()}.mp3`);
      return;
    }

    const extension = MIME_EXTENSIONS.get(file.mimetype) || '.png';
    callback(null, `avatar-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
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

    if (!MIME_EXTENSIONS.has(file.mimetype)) {
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
  { name: 'audio', maxCount: 1 },
]);

function uploadedFile(req, field) {
  const files = req.files && req.files[field];
  return Array.isArray(files) && files[0] ? files[0] : null;
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

function removeUploadedAudio(audioPath) {
  removeManagedAsset(audioPath, /^music-[a-z0-9._-]+\.mp3$/i);
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

function audioUrlFor(profile) {
  if (!profile.audio) return '';

  const fileName = path.basename(profile.audio);
  if (!/\.mp3$/i.test(fileName)) return '';

  return assetUrlFor(profile.audio, '');
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
      audioUrl: audioUrlFor(profile),
      distExists: fs.existsSync(DIST_INDEX),
      builtAt: builtAtFor(),
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
      audioSrc: audioUrlFor(profile),
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
  const audioFile = uploadedFile(req, 'audio');
  const uploadedPaths = [avatarFile, audioFile]
    .filter(Boolean)
    .map((file) => path.join(ASSETS_DIR, file.filename));

  try {
    const previous = loadProfile();

    const profile = saveProfile({
      username: req.body.username,
      bio: req.body.bio,
      background: req.body.background,
      accent: req.body.accent,
      typewriter: req.body.typewriter === 'on',
      ...(req.body.particles !== undefined
        ? { particles: req.body.particles }
        : {}),
      links: {
        telegram: req.body.telegram,
        discord: req.body.discord,
        youtube: req.body.youtube,
        tiktok: req.body.tiktok,
        twitch: req.body.twitch,
        steam: req.body.steam,
        github: req.body.github,
        spotify: req.body.spotify,
      },
      ...(avatarFile ? { avatar: `/assets/${avatarFile.filename}` } : {}),
      ...(audioFile ? { audio: `/assets/${audioFile.filename}` } : {}),
    });

    if (avatarFile && previous.avatar && previous.avatar !== profile.avatar) {
      removeUploadedAvatar(previous.avatar);
    }

    if (audioFile && previous.audio && previous.audio !== profile.audio) {
      removeUploadedAudio(previous.audio);
    }

    res.json({
      ok: true,
      profile,
      avatarUrl: avatarUrlFor(profile),
      audioUrl: audioUrlFor(profile),
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

    if (previous.avatar) {
      removeUploadedAvatar(previous.avatar);
    }

    res.json({
      ok: true,
      profile,
      avatarUrl: avatarUrlFor(profile),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/audio/remove', (req, res, next) => {
  try {
    const previous = loadProfile();
    const profile = saveProfile({ audio: null });

    if (previous.audio) {
      removeUploadedAudio(previous.audio);
    }

    res.json({
      ok: true,
      profile,
      audioUrl: audioUrlFor(profile),
    });
  } catch (error) {
    next(error);
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
      message = 'Файл слишком большой. Максимум — 5 МБ.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Неожиданное поле загрузки файла.';
    } else {
      message = `Ошибка загрузки файла: ${error.message}`;
    }
  } else if (error.code === 'INVALID_FILE_TYPE' || error.code === 'INVALID_AUDIO_TYPE') {
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
