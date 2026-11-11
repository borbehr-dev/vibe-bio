'use strict';

/**
 * Client-side behaviour of the generated bio page.
 *
 * This file is copied verbatim to `dist/script.js` and served as
 * `/preview/script.js` in the admin preview. It has no external dependencies:
 * particles, cursor trails, the music player and Discord presence are all
 * implemented here.
 */
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toast = document.getElementById('toast');
  var toastTimer = null;

  /* -------------------------------- toast -------------------------------- */

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }

  /* --------------------------------- copy -------------------------------- */

  function legacyCopy(value) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();

    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }

    document.body.removeChild(area);
    return copied;
  }

  function copyValue(value, successMessage) {
    function done(ok) {
      showToast(ok ? successMessage : 'Не удалось скопировать');
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(
        function () { done(true); },
        function () { done(legacyCopy(value)); },
      );
    } else {
      done(legacyCopy(value));
    }
  }

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy') || '';
      copyValue(value, 'Discord скопирован: ' + value);
    });
  });

  /* -------------------------------- canvas ------------------------------- */

  var canvas = document.getElementById('fx');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var particles = [];
  var rafId = null;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var dpr = 1;

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  if (canvas) {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  var EFFECTS = {
    hearts: {
      count: 22,
      colors: ['#ff2d55', '#ff4d6d', '#ff8fa3', '#ffb3c1'],
      shapes: ['heart'],
      size: [7, 15],
      speed: [2, 7],
      gravity: 0.16,
      ttl: [800, 1400],
      spread: Math.PI * 2,
    },
    snow: {
      count: 30,
      colors: ['#ffffff', '#e0f2fe', '#bfdbfe', '#dbeafe'],
      shapes: ['circle'],
      size: [2, 5],
      speed: [1, 5],
      gravity: 0.04,
      ttl: [1200, 2200],
      spread: Math.PI * 2,
    },
    neon: {
      count: 30,
      colors: ['#a855f7', '#8b5cf6', '#d946ef', '#22d3ee', '#f0abfc'],
      shapes: ['sparkle'],
      size: [4, 10],
      speed: [2, 8],
      gravity: 0.06,
      ttl: [700, 1300],
      spread: Math.PI * 2,
      glow: true,
    },
    stars: {
      count: 24,
      colors: ['#fde68a', '#fbbf24', '#fef3c7', '#ffffff'],
      shapes: ['star'],
      size: [5, 12],
      speed: [2, 7],
      gravity: 0.08,
      ttl: [800, 1500],
      spread: Math.PI * 2,
      glow: true,
    },
    bubbles: {
      count: 20,
      colors: ['#67e8f9', '#a5f3fc', '#bae6fd', '#c4b5fd'],
      shapes: ['bubble'],
      size: [6, 16],
      speed: [1, 4],
      gravity: -0.05,
      ttl: [1000, 1900],
      spread: Math.PI * 2,
    },
    fire: {
      count: 26,
      colors: ['#f97316', '#fb923c', '#fbbf24', '#ef4444', '#fde047'],
      shapes: ['circle'],
      size: [4, 11],
      speed: [1, 5],
      gravity: -0.12,
      ttl: [500, 1100],
      spread: Math.PI * 2,
      glow: true,
    },
    confetti: {
      count: 36,
      colors: ['#f43f5e', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'],
      shapes: ['rect'],
      size: [4, 8],
      speed: [3, 9],
      gravity: 0.2,
      ttl: [900, 1600],
      spread: Math.PI * 2,
    },
    trail: {
      count: 1,
      colors: ['#8b5cf6'],
      shapes: ['circle'],
      size: [2, 4],
      speed: [0, 0.4],
      gravity: 0,
      ttl: [450, 750],
      spread: Math.PI * 2,
    },
  };

  function spawn(x, y, mode, amount) {
    if (!ctx) return;
    var config = EFFECTS[mode];
    if (!config) return;

    var count = amount || config.count;

    for (var i = 0; i < count; i += 1) {
      var angle = Math.random() * config.spread;
      var speed = rand(config.speed[0], config.speed[1]);
      var size = rand(config.size[0], config.size[1]);
      var ttl = rand(config.ttl[0], config.ttl[1]);

      particles.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (mode === 'fire' ? rand(0.5, 2) : 0),
        gravity: config.gravity,
        drag: 0.985,
        size: size,
        color: pick(config.colors),
        shape: pick(config.shapes),
        ttl: ttl,
        life: ttl,
        rotation: Math.random() * Math.PI * 2,
        spin: rand(-0.14, 0.14),
        glow: Boolean(config.glow),
      });
    }

    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function drawHeart(context, size) {
    context.beginPath();
    context.moveTo(0, size * 0.32);
    context.bezierCurveTo(size * 0.5, -size * 0.35, size * 1.1, size * 0.28, 0, size);
    context.bezierCurveTo(-size * 1.1, size * 0.28, -size * 0.5, -size * 0.35, 0, size * 0.32);
    context.closePath();
  }

  function drawStar(context, size, points) {
    var outer = size;
    var inner = size * 0.44;
    context.beginPath();
    for (var i = 0; i < points * 2; i += 1) {
      var radius = i % 2 === 0 ? outer : inner;
      var angle = (Math.PI / points) * i - Math.PI / 2;
      var x = Math.cos(angle) * radius;
      var y = Math.sin(angle) * radius;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
  }

  function drawSparkle(context, size) {
    context.beginPath();
    context.moveTo(0, -size);
    context.quadraticCurveTo(size * 0.2, -size * 0.2, size, 0);
    context.quadraticCurveTo(size * 0.2, size * 0.2, 0, size);
    context.quadraticCurveTo(-size * 0.2, size * 0.2, -size, 0);
    context.quadraticCurveTo(-size * 0.2, -size * 0.2, 0, -size);
    context.closePath();
  }

  function tick() {
    rafId = null;
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    for (var i = particles.length - 1; i >= 0; i -= 1) {
      var particle = particles[i];
      particle.life -= 16;
      particle.vy += particle.gravity;
      particle.vx *= particle.drag;
      particle.vy *= particle.drag;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.spin;

      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      var alpha = Math.max(0, Math.min(1, particle.life / particle.ttl));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;

      if (particle.glow) {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 14;
      }

      if (particle.shape === 'heart') {
        drawHeart(ctx, particle.size);
        ctx.fill();
      } else if (particle.shape === 'star') {
        drawStar(ctx, particle.size, 5);
        ctx.fill();
      } else if (particle.shape === 'sparkle') {
        drawSparkle(ctx, particle.size);
        ctx.fill();
      } else if (particle.shape === 'bubble') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.35;
        ctx.fill();
      } else if (particle.shape === 'rect') {
        ctx.fillRect(
          -particle.size / 2,
          -particle.size / 2,
          particle.size,
          particle.size * 0.55,
        );
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length) rafId = requestAnimationFrame(tick);
  }

  var particleMode = document.body.getAttribute('data-particles') || 'off';

  if (particleMode !== 'off' && !reducedMotion) {
    document.addEventListener('click', function (event) {
      if (event.button !== 0) return;
      spawn(event.clientX, event.clientY, particleMode);
    });
  }

  /* ------------------------------ cursor glow ----------------------------- */

  var cursorMode = document.body.getAttribute('data-cursor') || 'off';
  var glow = document.getElementById('cursor-glow');
  var pointerX = width / 2;
  var pointerY = height / 2;
  var glowX = pointerX;
  var glowY = pointerY;
  var glowRaf = null;
  var lastTrail = 0;

  function moveGlow() {
    glowRaf = null;
    if (!glow) return;

    glowX += (pointerX - glowX) * 0.12;
    glowY += (pointerY - glowY) * 0.12;
    glow.style.transform = 'translate3d(' + glowX + 'px,' + glowY + 'px,0)';

    if (Math.abs(pointerX - glowX) > 0.4 || Math.abs(pointerY - glowY) > 0.4) {
      glowRaf = requestAnimationFrame(moveGlow);
    }
  }

  if (cursorMode !== 'off' && glow && !reducedMotion) {
    window.addEventListener('pointermove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (!glowRaf) glowRaf = requestAnimationFrame(moveGlow);

      if (cursorMode === 'trail') {
        var now = Date.now();
        if (now - lastTrail > 28) {
          lastTrail = now;
          spawn(event.clientX, event.clientY, 'trail');
        }
      }
    });
  }

  /* ---------------------------------- tilt -------------------------------- */

  var card = document.querySelector('.card');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (card && !reducedMotion) {
    var tiltEnabled = function () {
      return finePointer.matches && window.innerWidth >= 900;
    };

    var resetTilt = function () {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    };

    card.addEventListener('pointerenter', function () {
      if (!tiltEnabled()) return;
      card.classList.add('is-tilting');
    });

    card.addEventListener('pointermove', function (event) {
      if (!tiltEnabled()) return;

      var rect = card.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;

      var rotateY = Math.max(-7, Math.min(7, x * 10)).toFixed(2);
      var rotateX = Math.max(-7, Math.min(7, -y * 9)).toFixed(2);

      card.style.transform =
        'perspective(1200px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    card.addEventListener('pointerleave', resetTilt);
    finePointer.addEventListener('change', resetTilt);
    window.addEventListener('resize', resetTilt);
  }

  /* -------------------------------- music -------------------------------- */

  var audio = document.getElementById('bg-music');
  var musicButton = document.getElementById('music-toggle');
  var player = document.getElementById('player');
  var musicIcon = document.getElementById('music-icon');
  var musicSeek = document.getElementById('music-seek');
  var musicCurrent = document.getElementById('music-current');
  var musicDuration = document.getElementById('music-duration');
  var musicMute = document.getElementById('music-mute');
  var musicVolumeIcon = document.getElementById('music-volume-icon');
  var userPaused = false;
  var musicStarted = false;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ':' + String(rest).padStart(2, '0');
  }

  function setMusicState(playing) {
    if (!player) return;
    player.classList.toggle('is-playing', playing);
    player.classList.toggle('is-paused', !playing);

    if (musicButton) {
      musicButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
      musicButton.setAttribute(
        'aria-label',
        playing ? 'Поставить музыку на паузу' : 'Включить музыку',
      );
    }

    if (musicIcon) {
      musicIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
  }

  function startMusic() {
    if (!audio) return;
    var playback = audio.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(function () {
        setMusicState(false);
      });
    }
  }

  if (audio && player) {
    audio.volume = 0.7;
    setMusicState(false);

    if (musicButton) {
      musicButton.addEventListener('click', function () {
        if (audio.paused) {
          userPaused = false;
          startMusic();
        } else {
          userPaused = true;
          audio.pause();
        }
      });
    }

    audio.addEventListener('play', function () {
      musicStarted = true;
      setMusicState(true);
    });

    audio.addEventListener('pause', function () {
      setMusicState(false);
    });

    audio.addEventListener('ended', function () {
      setMusicState(false);
    });

    audio.addEventListener('loadedmetadata', function () {
      if (musicDuration) musicDuration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
      if (musicCurrent) musicCurrent.textContent = formatTime(audio.currentTime);
      if (musicSeek && Number.isFinite(audio.duration) && audio.duration > 0) {
        musicSeek.value = String((audio.currentTime / audio.duration) * 100);
      }
    });

    if (musicSeek) {
      musicSeek.addEventListener('input', function () {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
        audio.currentTime = (Number(musicSeek.value) / 100) * audio.duration;
      });
    }

    if (musicMute) {
      musicMute.addEventListener('click', function () {
        audio.muted = !audio.muted;
        if (musicVolumeIcon) {
          musicVolumeIcon.className = audio.muted
            ? 'fa-solid fa-volume-xmark'
            : 'fa-solid fa-volume-high';
        }
        musicMute.setAttribute(
          'aria-label',
          audio.muted ? 'Включить звук' : 'Выключить звук',
        );
      });
    }

    // Browsers block unmuted autoplay; start on the first user gesture instead.
    var startOnGesture = function () {
      if (!musicStarted && !userPaused && audio.paused) startMusic();
      window.removeEventListener('pointerdown', startOnGesture);
      window.removeEventListener('keydown', startOnGesture);
    };

    window.addEventListener('pointerdown', startOnGesture);
    window.addEventListener('keydown', startOnGesture);

    setTimeout(function () {
      if (!musicStarted && !userPaused) startMusic();
    }, 900);
  }

  /* ------------------------------ typewriter ----------------------------- */

  var typewriter = document.querySelector('[data-typewriter]');

  if (typewriter) {
    var typeText = typewriter.querySelector('.bio__text');
    var fullText = typeText ? typeText.textContent : '';
    var characters = Array.from(fullText);

    if (typeText) {
      if (reducedMotion) {
        typeText.textContent = fullText;
        typewriter.classList.add('is-complete');
      } else {
        typeText.textContent = '';
        var index = 0;

        var typeNext = function () {
          if (index >= characters.length) {
            typewriter.classList.add('is-complete');
            return;
          }

          typeText.textContent += characters[index];
          index += 1;

          var current = characters[index - 1];
          var pause = current === '\n' ? 110 : current === ' ' ? 34 : 22 + Math.random() * 22;
          setTimeout(typeNext, pause);
        };

        setTimeout(typeNext, 520);
      }
    }
  }

  /* -------------------------------- discord ------------------------------ */

  var presence = document.getElementById('presence');

  function statusLabel(status) {
    if (status === 'online') return 'В сети';
    if (status === 'idle') return 'Не активен';
    if (status === 'dnd') return 'Не беспокоить';
    return 'Не в сети';
  }

  function setPresenceState(status) {
    var state = status || 'offline';
    var dot = presence.querySelector('.presence__dot');
    var avatarStatus = document.getElementById('avatar-status');
    if (dot) dot.setAttribute('data-state', state);
    if (avatarStatus) avatarStatus.setAttribute('data-state', state);
  }

  function renderPresence(data) {
    if (!presence || !data) return;

    var text = document.getElementById('presence-text');
    var activity = document.getElementById('presence-activity');
    var user = data.discord_user || {};
    var status = data.discord_status || 'offline';

    setPresenceState(status);

    if (text) {
      text.textContent = user.global_name || user.username || 'Discord';
    }

    if (activity) {
      activity.replaceChildren();
      var spotify = data.spotify;

      if (spotify && spotify.song) {
        var cover = document.createElement('img');
        cover.className = 'presence__cover';
        cover.alt = '';
        cover.loading = 'lazy';
        if (spotify.album_art_url) cover.src = spotify.album_art_url;
        activity.appendChild(cover);
        activity.appendChild(
          document.createTextNode(' ' + spotify.song + ' — ' + spotify.artist),
        );
      } else if (Array.isArray(data.activities) && data.activities.length) {
        var current = data.activities[0];
        var label = current.name || '';
        if (current.details) label += ' · ' + current.details;
        activity.textContent = label;
      } else {
        activity.textContent = statusLabel(status);
      }
    }

    presence.hidden = false;
  }

  function renderPresenceUnavailable(reason) {
    if (!presence) return;

    setPresenceState('offline');

    var text = document.getElementById('presence-text');
    var activity = document.getElementById('presence-activity');

    if (text) text.textContent = 'Discord';
    if (activity) {
      activity.textContent =
        reason === 'not_monitored' ? 'не отслеживается' : 'недоступен';
    }

    presence.hidden = false;
  }

  function loadPresence() {
    if (!presence) return;

    var id = presence.getAttribute('data-discord-id');
    if (!id) return;

    // In /preview the server proxies Lanyard and explains a missing account;
    // a static build talks to Lanyard directly.
    var endpoint = presence.getAttribute('data-presence-endpoint') || '';
    var url = endpoint
      ? endpoint +
        (endpoint.indexOf('?') === -1 ? '?' : '&') +
        'id=' +
        encodeURIComponent(id)
      : 'https://api.lanyard.rest/v1/users/' + encodeURIComponent(id);

    fetch(url, { cache: 'no-store' })
      .then(function (response) {
        return response.json().then(function (json) {
          return { response: response, json: json };
        });
      })
      .then(function (result) {
        var json = result.json || {};

        if (result.response.ok && json.data && (json.ok === true || json.success === true)) {
          renderPresence(json.data);
          return;
        }

        var code = json.reason || (json.error && json.error.code) || '';

        if (code === 'not_monitored') {
          console.warn(
            '[vibe-bio] Discord ID не отслеживается Lanyard. ' +
              'Зайдите на https://discord.gg/lanyard, чтобы включить статус.',
          );
          renderPresenceUnavailable('not_monitored');
          return;
        }

        if (code === 'unavailable') {
          renderPresenceUnavailable('unavailable');
          return;
        }

        throw new Error('presence');
      })
      .catch(function () {
        presence.hidden = true;
      });
  }

  if (presence) {
    loadPresence();
    setInterval(loadPresence, 20000);
  }

  /* --------------------------------- views ------------------------------- */

  var viewsElement = document.getElementById('views');
  var viewsCount = document.getElementById('views-count');

  function formatNumber(value) {
    try {
      return new Intl.NumberFormat('ru-RU').format(value);
    } catch (error) {
      return String(value);
    }
  }

  function setViews(value) {
    if (viewsCount) viewsCount.textContent = formatNumber(value);
  }

  function localViews(username, increment) {
    var key = 'vibe-bio:views:' + username;
    var current = Number(localStorage.getItem(key) || 0);
    if (increment) {
      current += 1;
      localStorage.setItem(key, String(current));
    }
    return current;
  }

  function initViews() {
    if (!viewsElement || !viewsCount) return;

    var endpoint = viewsElement.getAttribute('data-endpoint') || '';
    var username = viewsElement.getAttribute('data-username') || 'page';
    var sessionKey = 'vibe-bio:counted:' + username;
    var alreadyCounted = sessionStorage.getItem(sessionKey) === '1';

    if (endpoint) {
      var request = alreadyCounted
        ? fetch(endpoint + '?username=' + encodeURIComponent(username), {
          cache: 'no-store',
        })
        : fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username }),
        });

      request
        .then(function (response) {
          if (!response.ok) throw new Error('views');
          return response.json();
        })
        .then(function (data) {
          if (!data || !data.ok) throw new Error('views');
          sessionStorage.setItem(sessionKey, '1');
          setViews(data.views);
        })
        .catch(function () {
          setViews(localViews(username, !alreadyCounted));
          sessionStorage.setItem(sessionKey, '1');
        });

      return;
    }

    setViews(localViews(username, !alreadyCounted));
    sessionStorage.setItem(sessionKey, '1');
  }

  initViews();

  /* --------------------------------- clock ------------------------------- */

  var clock = document.getElementById('clock-time');

  if (clock) {
    var updateClock = function () {
      clock.textContent = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  /* --------------------------------- share ------------------------------- */

  var shareButton = document.getElementById('share');

  if (shareButton) {
    shareButton.addEventListener('click', function () {
      var data = {
        title: document.title,
        text: document.querySelector('meta[name="description"]')?.content || '',
        url: window.location.href,
      };

      if (navigator.share) {
        navigator.share(data).catch(function () {
          // The user dismissed the native share sheet.
        });
        return;
      }

      copyValue(data.url, 'Ссылка скопирована');
    });
  }
})();
