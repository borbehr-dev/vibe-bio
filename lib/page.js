'use strict';

/**
 * Client-side behaviour of the generated bio page.
 *
 * This file is copied verbatim to `dist/script.js` and served as
 * `/preview/script.js` in the admin preview. Keep it dependency-free
 * (canvas-confetti is the only optional CDN dependency).
 */
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toast = document.getElementById('toast');
  var toastTimer = null;

  /* ------------------------------- toast -------------------------------- */

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  /* ------------------------------- copy --------------------------------- */

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

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-copy') || '';

      function done(ok) {
        showToast(ok ? 'Discord скопирован: ' + value : 'Не удалось скопировать');
      }

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(
          function () { done(true); },
          function () { done(legacyCopy(value)); },
        );
      } else {
        done(legacyCopy(value));
      }
    });
  });

  /* ------------------------------- music -------------------------------- */

  var audio = document.getElementById('bg-music');
  var musicButton = document.getElementById('music-toggle');

  if (audio && musicButton) {
    var musicIcon = musicButton.querySelector('i');

    function setMusicState(playing) {
      musicButton.classList.toggle('is-playing', playing);
      musicButton.setAttribute('aria-pressed', playing ? 'true' : 'false');
      musicButton.setAttribute(
        'aria-label',
        playing ? 'Поставить музыку на паузу' : 'Включить фоновую музыку',
      );

      if (musicIcon) {
        musicIcon.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
      }
    }

    musicButton.addEventListener('click', function () {
      if (audio.paused) {
        var playback = audio.play();

        if (playback && typeof playback.catch === 'function') {
          playback.catch(function () {
            setMusicState(false);
            showToast('Не удалось включить музыку.');
          });
        }
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () { setMusicState(true); });
    audio.addEventListener('pause', function () { setMusicState(false); });
    audio.addEventListener('ended', function () { setMusicState(false); });
  }

  /* ----------------------------- typewriter ----------------------------- */

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

  /* ------------------------------ particles ----------------------------- */

  var particleMode = document.body.getAttribute('data-particles');
  var confetti = window.confetti;

  if (
    particleMode &&
    particleMode !== 'off' &&
    typeof confetti === 'function' &&
    !reducedMotion
  ) {
    function textShapes(character) {
      try {
        if (typeof confetti.shapeFromText === 'function') {
          return [confetti.shapeFromText({ text: character, scalar: 2 })];
        }
      } catch (error) {
        // Custom text shapes are optional; colors alone still look good.
      }
      return null;
    }

    var heartShapes = textShapes('❤');
    var snowShapes = textShapes('❄');

    document.addEventListener('click', function (event) {
      if (event.button !== 0) return;

      var origin = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      if (particleMode === 'hearts') {
        confetti({
          particleCount: 26,
          spread: 65,
          startVelocity: 26,
          gravity: 0.9,
          decay: 0.92,
          ticks: 180,
          scalar: 1.35,
          origin: origin,
          colors: ['#ff2d55', '#ff4d6d', '#ff8fa3', '#ffb3c1'],
          shapes: heartShapes || ['circle'],
          zIndex: 60,
        });
      } else if (particleMode === 'snow') {
        confetti({
          particleCount: 34,
          spread: 75,
          startVelocity: 20,
          gravity: 0.65,
          decay: 0.94,
          ticks: 260,
          scalar: 1.1,
          origin: origin,
          colors: ['#ffffff', '#e0f2fe', '#bfdbfe', '#dbeafe'],
          shapes: snowShapes || ['circle'],
          zIndex: 60,
        });
      } else if (particleMode === 'neon') {
        confetti({
          particleCount: 40,
          spread: 80,
          startVelocity: 30,
          gravity: 0.85,
          decay: 0.92,
          ticks: 200,
          origin: origin,
          colors: ['#a855f7', '#8b5cf6', '#d946ef', '#22d3ee', '#f0abfc'],
          shapes: ['star', 'circle'],
          zIndex: 60,
        });
      }
    });
  }

  /* -------------------------------- tilt -------------------------------- */

  var stage = document.querySelector('.card-stage');
  var tilt = document.getElementById('card-tilt');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  if (stage && tilt) {
    var tiltEnabled = function () {
      return finePointer.matches && window.innerWidth >= 720 && !reducedMotion;
    };

    var resetTilt = function () {
      tilt.classList.remove('is-tilting');
      tilt.style.transform = '';
    };

    stage.addEventListener('pointerenter', function () {
      if (!tiltEnabled()) return;
      tilt.classList.add('is-tilting');
    });

    stage.addEventListener('pointermove', function (event) {
      if (!tiltEnabled()) return;

      var rect = stage.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;

      var rotateY = Math.max(-10, Math.min(10, x * 14)).toFixed(2);
      var rotateX = Math.max(-10, Math.min(10, -y * 12)).toFixed(2);

      tilt.style.transform =
        'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });

    stage.addEventListener('pointerleave', resetTilt);
    finePointer.addEventListener('change', resetTilt);
    window.addEventListener('resize', resetTilt);
  }
})();
