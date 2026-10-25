# vibe-bio

**vibe-bio** — open-source генератор bio-link страниц в стиле [guns.lol](https://guns.lol): тёмная админ-панель, живое превью и экспорт готового статического сайта в папку `dist/` одной кнопкой.

Этот проект написан с помощью ИИ (Vibe Coding) и полностью открыт. Никаких платных подписок, только чистый HTML/CSS/JS.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-templates-B4CA65)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CDN-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Что умеет

- **Админ-панель** на `http://127.0.0.1:9999` — тёмная тема, живое превью, адаптивная вёрстка.
- **Профиль**: username, bio, аватарка, цвет фона и отдельный цвет акцента.
- **8 соцсетей**: Telegram, Discord, YouTube, TikTok, Twitch, Steam, GitHub, Spotify. Можно вставить полную ссылку или просто ник — ссылка нормализуется автоматически.
- **Discord-ник без ссылки** превращается в кнопку «скопировать ник» с красивым уведомлением.
- **Загрузка аватарки** локально в `assets/` (PNG, JPG, WEBP, GIF до 5 МБ). Кнопка «Убрать» удаляет файл.
- **Фоновая музыка**: загрузка MP3 до 5 МБ, круглая Play/Pause-кнопка с blur-эффектом в правом верхнем углу готовой страницы.
- **Печатная машинка**: bio печатается по буквам с мигающим курсором (можно выключить — тогда текст статичный).
- **Эффекты при клике**: сердечки, снежинки, неон или «выключено» на базе `canvas-confetti` (CDN). Эффект срабатывает в точке клика.
- **3D-наклон карточки** при движении мыши. На тач-устройствах и при `prefers-reduced-motion` отключается.
- **4 пресета тем**: Cyberpunk, Midnight, Minimal (светлая) и Forest. Меняют фон и акцент одним кликом; для светлой темы автоматически включается контрастная палитра.
- **Сборка проекта**: кнопка «Собрать проект» сохраняет профиль и генерирует `dist/` с `index.html`, `style.css`, `script.js` и `assets/`.
- **Готовая страница**: стеклянная карточка, светящаяся аватарка, брендовые кнопки соцсетей с FontAwesome, плавные анимации появления, адаптив и поддержка `prefers-reduced-motion`.
- **Без базы данных и бэкенда на проде**: настройки хранятся в `data/profile.json`, а `dist/` — обычный статический сайт.
- **Безопасность**: экранирование HTML, допускаются только `http(s)`-ссылки, строгая проверка цветов, MIME-типов и размеров загружаемых файлов.

## Стек

- Node.js + Express
- EJS
- TailwindCSS через CDN (только админка)
- Multer (загрузка аватарки и MP3)
- Чистый CSS и Vanilla JS в готовой странице (никаких React/Vue и сборщиков)
- canvas-confetti через CDN (только для эффектов при клике)

## Быстрый старт

Нужен [Node.js](https://nodejs.org/) 18 или новее.

```bash
git clone https://github.com/borbehr-dev/vibe-bio.git
cd vibe-bio
npm install
npm start
```

Откройте **http://127.0.0.1:9999** — это админ-панель.

Для разработки с автоперезапуском:

```bash
npm run dev
```

Порт можно изменить переменной окружения:

```bash
PORT=3000 npm start
```

## Как пользоваться

1. Заполните **Username** и **Bio**.
2. Нажмите **Загрузить** или перетащите картинку в квадрат с аватаркой.
3. Добавьте ссылки:
   - Telegram: `@username` или `https://t.me/username`;
   - Discord: `username` (будет копироваться) или ссылка `https://discord.gg/...`;
   - YouTube: `@channel` или полная ссылка;
   - TikTok: `@username` или `https://tiktok.com/@username`;
   - Twitch: `username` или `https://twitch.tv/username`;
   - Steam: ссылка на профиль или числовой SteamID64;
   - GitHub: `username` или `https://github.com/username`;
   - Spotify: ссылка на профиль/трек/плейлист или Spotify username.
4. Выберите пресет темы (**Cyberpunk**, **Midnight**, **Minimal**, **Forest**) либо настройте цвет фона и акцента вручную.
5. В блоке **Фишки** загрузите MP3 (до 5 МБ), включите печатную машинку и выберите эффект при клике.
6. Нажмите **Сохранить** — профиль запишется в `data/profile.json`.
7. Нажмите **Собрать проект** — появится папка `dist/` с готовым сайтом.

MP3 хранится в `assets/music-*.mp3`, при сборке копируется в `dist/assets/`. Имя файла генерируется на сервере, а кнопка «Убрать» удаляет трек из профиля и с диска.

Кнопка **Собрать проект** сначала автоматически сохраняет текущие поля, чтобы в `dist/` всегда попадали актуальные данные. После сборки ссылки **Открыть dist** и **Открыть готовую страницу** ведут на `/dist/index.html` (в админке) или на локальный файл `dist/index.html`.

### Превью

- `http://127.0.0.1:9999/preview` — страница, отрендеренная напрямую из текущего профиля (без сборки).
- `http://127.0.0.1:9999/dist/index.html` — последняя собранная версия.

### Сборка из терминала

```bash
npm run build
```

Команда читает `data/profile.json`, пересоздаёт `dist/` и печатает список файлов. Удобно для CI или деплоя.

## Структура проекта

```text
vibe-bio/
├── server.js              # Express-сервер и API
├── views/
│   └── admin.ejs          # тёмная админ-панель
├── public/
│   ├── admin.css          # стили админки
│   └── admin.js           # превью, сохранение, сборка, тосты
├── lib/
│   ├── store.js           # чтение/валидация/запись профиля
│   ├── render.js          # генератор HTML bio-страницы
│   ├── page.css           # стили готовой страницы
│   ├── page.js            # Vanilla JS готовой страницы (музыка, tilt, эффекты)
│   └── build.js           # сборка dist/
├── scripts/
│   └── build-cli.js       # npm run build
├── assets/
│   ├── default-avatar.svg # аватарка по умолчанию
│   ├── avatar-*.png       # загруженные аватарки (в .gitignore)
│   └── music-*.mp3        # загруженная музыка (в .gitignore)
├── data/
│   └── profile.json       # создаётся автоматически (в .gitignore)
├── dist/                  # создаётся при сборке (в .gitignore)
├── package.json
└── README.md
```

### Что попадает в `dist/`

```text
dist/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── avatar-1234567890.png   # или default-avatar.svg
    └── music-1234567890.mp3    # если загружена музыка
```

Папка полностью самодостаточна: HTML, CSS, JS, картинка и (опционально) MP3. Шрифт Inter, FontAwesome и canvas-confetti подключаются с CDN, поэтому готовой странице нужен интернет (как и большинству bio-страниц). Если нужен полностью офлайн-вариант, скачайте FontAwesome и canvas-confetti локально и поправьте ссылки в `lib/render.js`.

## API

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/` | Админ-панель |
| `GET` | `/preview` | Превью из текущего профиля |
| `GET` | `/preview/style.css` | CSS превью |
| `GET` | `/preview/script.js` | JS превью |
| `POST` | `/api/save` | Сохранить профиль (`multipart/form-data`, поля `avatar` и `audio`) |
| `POST` | `/api/avatar/remove` | Удалить загруженную аватарку |
| `POST` | `/api/audio/remove` | Удалить загруженную музыку |
| `POST` | `/api/build` | Собрать `dist/` |
| `GET` | `/dist/index.html` | Последняя сборка |

## Деплой

Готовая папка `dist/` — обычный статический сайт. Её можно положить куда угодно: GitHub Pages, Cloudflare Pages, Netlify, Vercel, nginx, S3.

Сначала соберите проект кнопкой в админке или командой `npm run build`.

### Вариант 1. GitHub Pages (отдельный репозиторий)

Подходит, если нужен адрес вида `https://username.github.io`.

```bash
cd dist
git init -b main
git add .
git commit -m "Deploy bio page"
git remote add origin git@github.com:USERNAME/USERNAME.github.io.git
git push -u origin main
```

Затем в GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, ветка `main`, папка `/ (root)`. Через минуту страница будет доступна по адресу `https://USERNAME.github.io`.

Если репозиторий называется иначе (не `USERNAME.github.io`), сайт откроется по адресу `https://USERNAME.github.io/REPO/`. В этом случае при сборке нужен относительный путь — он уже используется (`style.css` и `assets/...` без ведущего слеша), поэтому всё заработает и в подпапке.

### Вариант 2. GitHub Pages (из основного репозитория)

1. Соберите проект и скопируйте содержимое `dist/` в папку `docs/` либо запушьте `dist/` в ветку `gh-pages`.
2. В **Settings → Pages** выберите ветку и папку с файлами.
3. Если хотите автоматизировать: закоммитьте `data/profile.json` и `assets/avatar-*` (уберите их из `.gitignore`), добавьте GitHub Actions, который выполняет `npm ci && npm run build` и публикует `dist/`. Без файла профиля CI соберёт страницу с дефолтными настройками.

Быстрый ручной вариант с `docs/`:

```bash
npm run build
rm -rf docs && cp -r dist docs
git add docs && git commit -m "Update bio page" && git push
```

В настройках Pages выберите ветку `main` и папку `/docs`.

### Вариант 3. Cloudflare Pages (drag & drop)

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages → Create → Pages → Upload assets**.
2. Перетащите папку `dist` целиком.
3. Укажите имя проекта и нажмите **Deploy**. Получите адрес `https://project-name.pages.dev`.
4. Свой домен добавляется в **Custom domains**.

### Вариант 4. Cloudflare Pages (Wrangler CLI)

```bash
npx wrangler pages deploy dist --project-name vibe-bio
```

Первый запуск попросит авторизоваться в Cloudflare. Дальше достаточно повторять команду после каждой сборки.

### Cloudflare Pages из Git

Если хотите автодеплой при пуше:

- **Build command**: `npm run build` (или оставьте пустым, если коммитите готовый `dist/`);
- **Build output directory**: `dist`;
- **Framework preset**: `None`.

Для сборки на стороне Cloudflare нужны `data/profile.json` и аватарка в репозитории — иначе соберётся дефолтная страница.

## Кастомизация

- **Цвета кнопок**: классы `.link--telegram`, `.link--discord`, `.link--youtube`, `.link--tiktok`, `.link--twitch`, `.link--steam`, `.link--github`, `.link--spotify` в `lib/page.css`.
- **Пресеты тем**: массив `themePresets` в `views/admin.ejs` (цвет фона + акцент).
- **Эффекты при клике**: режимы `hearts`, `snow`, `neon`, `off` в `lib/page.js` и `lib/store.js` (`PARTICLE_EFFECTS`).
- **Готовые цвета фона**: массив `swatches` в `views/admin.ejs`.
- **Иконки и шрифты**: ссылки на FontAwesome и Google Fonts в `lib/render.js`.
- **Поля профиля**: `lib/store.js` (валидация) и `views/admin.ejs` (форма).
- **Новая соцсеть**: добавьте поле в `views/admin.ejs`, `server.js` (`/api/save`), `lib/store.js` и логику в `buildLinks()` в `lib/render.js`.

## Безопасность

- Сервер по умолчанию слушает только `127.0.0.1` — снаружи он недоступен.
- HTML экранируется, в ссылки допускаются только `http` и `https` (защита от `javascript:`).
- Загрузка аватарки: только PNG/JPG/WEBP/GIF, максимум 5 МБ, имя файла генерируется на сервере.
- Загрузка музыки: только `audio/mpeg` (MP3), максимум 5 МБ, сервер принудительно сохраняет файл с расширением `.mp3`.
- SVG-загрузки запрещены, чтобы нельзя было подсунуть скрипт через картинку.
- Не выставляйте админку в интернет без аутентификации и HTTPS. Это локальный инструмент. Если нужен публичный режим — добавьте авторизацию, CSRF-защиту и reverse proxy.

## Частые проблемы

**Порт 9999 занят.** Остановите другой процесс или запустите `PORT=3001 npm start`.

**Иконки не отображаются на готовой странице.** FontAwesome подключается с CDN — проверьте интернет. Для офлайн-раздачи скачайте FontAwesome локально и замените ссылку в `lib/render.js`.

**Аватарка не обновилась.** Нажмите «Собрать проект» ещё раз: `dist/assets/` пересоздаётся при каждой сборке.

**Музыка не играет на готовой странице.** Убедитесь, что после загрузки MP3 вы нажали «Собрать проект»: файл должен попасть в `dist/assets/music-*.mp3`. Браузеры запрещают автозапуск без действия пользователя, поэтому трек стартует только после клика по круглой кнопке.

**Эффекты при клике не работают.** canvas-confetti подключается с CDN — проверьте интернет и что в админке выбран не «Выключено». При `prefers-reduced-motion` эффекты и печатная машинка отключаются автоматически.

**3D-наклон не работает.** Он отключён на тач-устройствах, экранах уже 720px и при `prefers-reduced-motion`. Это сделано намеренно.

**Хочу сбросить настройки.** Остановите сервер, удалите `data/profile.json` и загруженные файлы `assets/avatar-*`, `assets/music-*`, затем запустите снова.

**Не сохраняется bio.** Лимит — 300 символов, username — 40, ссылки — 200. Музыка и аватарка — до 5 МБ.

## Лицензия

[MIT](LICENSE). Используйте, форкайте и меняйте под себя.
