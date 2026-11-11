'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { CSS_PATH, SCRIPT_PATH, renderPage } = require('./render');

const ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT, 'dist');
const ASSETS_DIR = path.join(ROOT, 'assets');
const DEFAULT_AVATAR = path.join(ASSETS_DIR, 'default-avatar.svg');

function fallbackAvatarSvg() {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">' +
    '<rect width="256" height="256" fill="#101016"/>' +
    '<circle cx="128" cy="104" r="40" fill="#2a2a38"/>' +
    '<path d="M56 224c8-44 36-64 72-64s64 20 72 64" fill="#2a2a38"/>' +
    '</svg>'
  );
}

/**
 * Copy a stored asset from assets/ into the build directory.
 * Only the basename is trusted, and the file must match `pattern`.
 */
function copyManagedAsset(storedPath, targetAssetsDir, pattern) {
  if (!storedPath) return '';

  const fileName = path.basename(String(storedPath));
  if (!pattern.test(fileName)) return '';

  const source = path.join(ASSETS_DIR, fileName);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return '';

  fs.copyFileSync(source, path.join(targetAssetsDir, fileName));
  return `assets/${fileName}`;
}

function copyAvatar(profile, targetAssetsDir) {
  const defaultTarget = path.join(targetAssetsDir, 'default-avatar.svg');

  fs.mkdirSync(targetAssetsDir, { recursive: true });

  if (!fs.existsSync(DEFAULT_AVATAR)) {
    fs.writeFileSync(DEFAULT_AVATAR, fallbackAvatarSvg(), 'utf8');
  }

  const copied = copyManagedAsset(
    profile.avatar,
    targetAssetsDir,
    /^avatar-[a-z0-9._-]+\.(?:png|jpe?g|webp|gif)$/i,
  );

  if (copied) return copied;

  fs.copyFileSync(DEFAULT_AVATAR, defaultTarget);
  return 'assets/default-avatar.svg';
}

function copyBackground(profile, targetAssetsDir) {
  return copyManagedAsset(
    profile.backgroundImage,
    targetAssetsDir,
    /^bg-[a-z0-9._-]+\.(?:png|jpe?g|webp|gif)$/i,
  );
}

function copyAudio(profile, targetAssetsDir) {
  return copyManagedAsset(
    profile.audio,
    targetAssetsDir,
    /^music-[a-z0-9._-]+\.mp3$/i,
  );
}

function copyCover(profile, targetAssetsDir) {
  return copyManagedAsset(
    profile.audioCover,
    targetAssetsDir,
    /^cover-[a-z0-9._-]+\.(?:png|jpe?g|webp|gif)$/i,
  );
}

/**
 * Generate a fully static site in dist/.
 * The dist folder is recreated from scratch to avoid stale files.
 */
function buildSite(profile) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });

  const distAssets = path.join(DIST_DIR, 'assets');
  fs.mkdirSync(distAssets, { recursive: true });

  const avatarRel = copyAvatar(profile, distAssets);
  const backgroundRel = copyBackground(profile, distAssets);
  const audioRel = copyAudio(profile, distAssets);
  const coverRel = copyCover(profile, distAssets);

  fs.copyFileSync(CSS_PATH, path.join(DIST_DIR, 'style.css'));
  fs.copyFileSync(SCRIPT_PATH, path.join(DIST_DIR, 'script.js'));

  const html = renderPage(profile, {
    cssHref: 'style.css',
    scriptHref: 'script.js',
    avatarSrc: avatarRel,
    backgroundImageSrc: backgroundRel,
    audioSrc: audioRel,
    audioCoverSrc: coverRel,
    viewsEndpoint: '',
  });
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf8');

  const files = [
    'index.html',
    'style.css',
    'script.js',
    avatarRel,
    ...(backgroundRel ? [backgroundRel] : []),
    ...(audioRel ? [audioRel] : []),
    ...(coverRel ? [coverRel] : []),
  ];

  return {
    builtAt: new Date().toISOString(),
    outputDir: DIST_DIR,
    files,
  };
}

module.exports = {
  DIST_DIR,
  buildSite,
};
