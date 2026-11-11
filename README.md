# vibe-bio

**vibe-bio** — open-source генератор bio-link страниц в стиле [guns.lol](https://guns.lol) и [lume.su](https://lume.su): тёмная админ-панель с живым превью в виде телефона и экспорт готового статического сайта в папку `dist/` одной кнопкой.

Проект написан с помощью ИИ (Vibe Coding) и полностью открыт. Никаких платных подписок — только HTML/CSS/JS.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-templates-B4CA65)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CDN-38BDF8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## Что умеет

### Админ-панель

- Тёмный дашборд на `http://127.0.0.1:9999` с боковым меню и семью разделами: профиль, соцсети, свои ссылки, оформление, медиа, эффекты, публикация.
- **Живое превью в макете телефона** — все изменения (текст, ссылки, темы, шрифты, карточка, эффекты, музыка) видны сразу, без перезагрузки.
- Липкая нижняя панель с кнопками **Сохранить** и **Собрать проект**, индикатор последней сборки.
- Перетаскивание файлов (drag & drop) в блоки аватарки, фона, музыки и обложки.
- Автосохранение настроек в `data/profile.json` и счётчик просмотров в `data/views.json`.

### Профиль

- **Display name**, **username** и многострочное **bio** (до 300 символов).
- **Бейджи** — до 6 штук через запятую (`owner`, `dev`, `vip`, `verified`, `music` и любые свои). Иконка подбирается автоматически по слову.
- **Аватарка** с тремя формами: круг, скруглённый квадрат, квадрат.
- **Discord presence** через [Lanyard](https://github.com/Phineas/lanyard): статус-точка на аватарке, текущая активность и статус (online / idle / dnd / offline). Нужен числовой Discord ID и включённый `showDiscord`.
- **15 соцсетей**: Telegram, Discord, YouTube, TikTok, Twitch, Steam, GitHub, Spotify, X (Twitter), Instagram, VK, Reddit, Roblox, сайт и почта.
- Можно вставить полную ссылку **или просто ник** — ссылка нормализуется автоматически (`@name` → `https://t.me/name` и т. д.).
- **Discord-ник без ссылки** превращается в кнопку «скопировать ник» с уведомлением.
- **Свои ссылки** — до 8 произвольных кнопок с названием и URL.
- Две раскладки соцсетей: **иконки** в ряд или **полноценные кнопки** со списком.
- Два стиля иконок: **цветные** (брендовые) или **монохромные**.

### Оформление

- Цвет фона, акцент и **свой цвет текста**.
- **8 шрифтов**: Inter, Poppins, Sora, Manrope, Space Grotesk, Outfit, JetBrains Mono, Playfair Display (подключаются с Google Fonts).
- **4 стиля карточки**: стекло (`glass`), сплошная (`solid`), обводка (`outline`), без карточки (`none`).
- **Прозрачность карточки** (0–100%) и **blur** (0–40px) регулируются слайдерами.
- **Пресеты тем** одним кликом и готовые цвета фона.
- Автоматическая светлая палитра для светлого фона (и ручной цвет текста имеет приоритет).
- **Фоновое изображение** с затемнением и blur, декоративные орбы и сетка.

### Медиа и музыка

- Загрузка **аватарки** (PNG/JPG/WEBP/GIF до 5 МБ).
- Загрузка **фонового изображения** (PNG/JPG/WEBP/GIF до 10 МБ).
- Загрузка **музыки** (MP3 до 10 МБ) и **обложки трека** (PNG/JPG/WEBP/GIF до 5 МБ).
- Поля **название трека** и **исполнитель**.
- Плеер в правом нижнем углу: обложка, play/pause, перемотка, время, mute. Автозапуск срабатывает только после первого действия пользователя (ограничение браузеров).
- Кнопки «Убрать» удаляют файл и из профиля, и с диска.

### Эффекты и интерактив

- **Печатная машинка** для bio (можно выключить).
- **8 эффектов при клике**: сердечки, снег, неон, звёзды, пузыри, огонь, конфетти и «выключено». Собственный canvas-движок, без внешних библиотек.
- **Курсор**: выключен, мягкое свечение (`glow`) или шлейф (`trail`).
- **3D-наклон карточки** при движении мыши (отключается на тач-устройствах и при `prefers-reduced-motion`).
- **Счётчик просмотров**: серверный через `/api/views` в превью, с fallback в `localStorage` для статической сборки.
- **Локальные часы** и кнопка **«Поделиться»** (Web Share API или копирование ссылки).
- Плавные анимации появления, toast-уведомления, адаптив и поддержка `prefers-reduced-motion`.

### Сборка и приватность

- Кнопка **«Собрать проект»** пересоздаёт `dist/` с `index.html`, `style.css`, `script.js` и нужными файлами из `assets/`.
- **Без базы данных**: профиль и просмотры лежат в JSON, `dist/` — обычный статический сайт.
- **Безопасность**: экранирование HTML, только `http(s)`-ссылки, строгая проверка цветов, MIME-типов и размеров загрузок, имена файлов генерируются на сервере.
- Сервер по умолчанию слушает только `127.0.0.1`.

## Стек

- Node.js + Express
- EJS
- TailwindCSS через CDN (только админка)
- Multer (загрузка медиа)
- Чистый CSS и Vanilla JS в готовой странице (никаких React/Vue и сборщиков)
- Собственный canvas-движок частиц (без `canvas-confetti`)

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

Порт и хост можно изменить переменными окружения:

```bash
PORT=3000 HOST=0.0.0.0 npm start
```

## Как пользоваться

1. Заполните **Display name**, **Username** и **Bio**.
2. Загрузите аватарку или перетащите картинку в блок аватарки.
3. Добавьте соцсети. Можно вставлять ник или полную ссылку:
   - Telegram: `@username` или `https://t.me/username`;
   - Discord: `username` (будет копироваться) или ссылка-приглашение `https://discord.gg/...`;
   - YouTube: `@channel` или полная ссылка;
   - TikTok: `@username` или `https://tiktok.com/@username`;
   - Twitch: `username` или `https://twitch.tv/username`;
   - Steam: ссылка на профиль или числовой SteamID64;
   - GitHub: `username` или `https://github.com/username`;
   - Spotify: ссылка на профиль/трек/плейлист или Spotify username;
   - X: `@username` или `https://x.com/username`;
   - Instagram, VK, Reddit, Roblox — ник или ссылка;
   - Сайт — любой `http(s)` URL;
   - Почта — адрес вида `name@example.com`.
4. При желании добавьте **свои ссылки** (до 8) и **бейджи** через запятую.
5. Настройте оформление: тему, цвета, шрифт, форму аватарки, стиль карточки, прозрачность и blur.
6. В разделе **Медиа** загрузите фон, музыку и обложку, укажите название и исполнителя.
7. В разделе **Эффекты** включите печатную машинку, частицы и курсор.
8. Нажмите **Сохранить** — профиль запишется в `data/profile.json`.
9. Нажмите **Собрать проект** — появится папка `dist/` с готовым сайтом.

Кнопка **«Собрать проект»** сначала автоматически сохраняет текущие поля, чтобы в `dist/` всегда попадали актуальные данные. Ссылки **«Открыть dist»** и **«Открыть готовую страницу»** ведут на `/dist/index.html` (в админке) или на локальный файл `dist/index.html`.

### Discord presence

1. Включите тумблер **Discord-статус** в разделе «Профиль».
2. Укажите числовой Discord ID (17–20 цифр) — не ник, а именно ID (в Discord: **Настройки → Дополнительно → Режим разработчика**, затем правый клик по себе → **Копировать ID**).
3. Аккаунт должен быть доступен через [Lanyard](https://github.com/Phineas/lanyard). Для этого **зайдите на Discord-сервер Lanyard** — [discord.gg/lanyard](https://discord.gg/lanyard). Без этого API отвечает `user_not_monitored`.
4. Нажмите кнопку **«Проверить»** рядом с полем Discord ID — админка покажет, видит ли Lanyard аккаунт, и подскажет ссылку, если нет.
5. Готовая страница опрашивает `https://api.lanyard.rest/v1/users/{id}` и показывает статус и активность. Если аккаунт не отслеживается, вместо скрытия блока выводится состояние «не отслеживается»; если Lanyard недоступен — «недоступен».

### Превью

- `http://127.0.0.1:9999/preview` — страница, отрендеренная напрямую из текущего профиля (без сборки).
- `http://127.0.0.1:9999/dist/index.html` — последняя собранная версия.

### Сборка из терминала

```bash
npm run build
```

Команда читает `data/profile.json`, пересоздаёт `dist/` и печатает список файлов. Если профиля ещё нет, собирается страница с настройками по умолчанию. Удобно для CI или деплоя.

## Структура проекта

```text
vibe-bio/
├── server.js              # Express-сервер, загрузки и API
├── views/
│   └── admin.ejs          # тёмная админ-панель
├── public/
│   ├── admin.css          # стили админки и макета телефона
│   └── admin.js           # живое превью, формы, сохранение, сборка
├── lib/
│   ├── store.js           # схема, валидация, профиль и просмотры
│   ├── render.js          # генератор HTML bio-страницы
│   ├── page.css           # стили готовой страницы
│   ├── page.js            # музыка, частицы, курсор, presence, часы, share
│   └── build.js           # сборка dist/
├── scripts/
│   └── build-cli.js       # npm run build
├── assets/
│   ├── default-avatar.svg # аватарка по умолчанию
│   ├── avatar-*           # загруженные аватарки (в .gitignore)
│   ├── bg-*               # фоновые изображения (в .gitignore)
│   ├── music-*.mp3        # музыка (в .gitignore)
│   └── cover-*            # обложки треков (в .gitignore)
├── data/
│   ├── profile.json       # создаётся автоматически (в .gitignore)
│   └── views.json         # счётчики просмотров (в .gitignore)
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
    ├── bg-1234567890.png       # если загружен фон
    ├── music-1234567890.mp3    # если загружена музыка
    └── cover-1234567890.png    # если загружена обложка
```

Папка полностью самодостаточна: HTML, CSS, JS, картинки и (опционально) MP3. Шрифты и FontAwesome подключаются с CDN, поэтому готовой странице нужен интернет. Частицы, курсор, плеер, часы и share работают полностью локально. Если нужен офлайн-вариант, скачайте FontAwesome и Google Fonts локально и поправьте ссылки в `lib/render.js`.

В статической сборке нет сервера, поэтому счётчик просмотров использует `localStorage` (значение уникально для браузера). В режиме `/preview` он ходит в `GET/POST /api/views` и хранится в `data/views.json`.

Discord-статус в `/preview` запрашивается через серверный прокси `/api/discord` — так админка и страница получают понятную причину (`not_monitored` или `unavailable`). В статическом `dist/` тот же статус запрашивается напрямую у Lanyard.

## Поля профиля

| Поле | Тип | Описание |
| --- | --- | --- |
| `username` | string | Username, до 40 символов, обязателен |
| `displayName` | string | Отображаемое имя, до 40 символов |
| `bio` | string | Описание, до 300 символов, переносы строк сохраняются |
| `avatar` | string \| null | Путь к загруженной аватарке |
| `backgroundImage` | string \| null | Путь к фоновому изображению |
| `audio` | string \| null | Путь к MP3 |
| `audioCover` | string \| null | Путь к обложке трека |
| `audioTitle` / `audioArtist` | string | Название и исполнитель, до 60 символов |
| `background` / `accent` / `textColor` | `#rrggbb` | Цвета; `textColor` может быть пустым |
| `font` | string | `inter`, `poppins`, `sora`, `manrope`, `space`, `outfit`, `mono`, `playfair` |
| `avatarShape` | string | `circle`, `rounded`, `square` |
| `cardStyle` | string | `glass`, `solid`, `outline`, `none` |
| `cardOpacity` / `cardBlur` | number | 0–100 и 0–40 |
| `socialStyle` | string | `icons` или `buttons` |
| `iconStyle` | string | `color` или `mono` |
| `typewriter` | boolean | Печатная машинка для bio |
| `particles` | string | `off`, `hearts`, `snow`, `neon`, `stars`, `bubbles`, `fire`, `confetti` |
| `cursor` | string | `off`, `glow`, `trail` |
| `showViews` / `showClock` / `showShare` | boolean | Показывать элементы внизу карточки |
| `showDiscord` | boolean | Показывать Discord presence |
| `discordId` | string | Числовой Discord ID (17–20 цифр) |
| `badges` | string | Бейджи через запятую, до 6 |
| `links` | object | 15 соцсетей (`telegram`, `discord`, `youtube`, `tiktok`, `twitch`, `steam`, `github`, `spotify`, `x`, `instagram`, `vk`, `reddit`, `roblox`, `website`, `email`) |
| `customLinks` | array | До 8 объектов `{ label, url }` |

## API

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/` | Админ-панель |
| `GET` | `/preview` | Превью из текущего профиля |
| `GET` | `/preview/style.css` | CSS превью |
| `GET` | `/preview/script.js` | JS превью |
| `POST` | `/api/save` | Сохранить профиль (`multipart/form-data`; файлы `avatar`, `background`, `audio`, `cover`) |
| `POST` | `/api/avatar/remove` | Удалить аватарку |
| `POST` | `/api/background/remove` | Удалить фоновое изображение |
| `POST` | `/api/audio/remove` | Удалить музыку |
| `POST` | `/api/cover/remove` | Удалить обложку трека |
| `GET` | `/api/views?username=...` | Получить счётчик просмотров |
| `POST` | `/api/views` | Увеличить счётчик (`{ "username": "..." }`, JSON или форма) |
| `GET` | `/api/discord?id=...` | Проверить Discord-статус через Lanyard (`reason: not_monitored` / `unavailable`) |
| `POST` | `/api/build` | Собрать `dist/` |
| `GET` | `/dist/index.html` | Последняя сборка |

`/api/save` принимает все поля профиля из таблицы выше. `customLinks` передаётся JSON-строкой. Если файл не передан, предыдущее значение сохраняется; для удаления используйте соответствующий `/api/*/remove`.

Ответы API имеют вид `{ "ok": true, ... }`, ошибки — `{ "ok": false, "error": "..." }` с кодом 400/500.

## Деплой

Готовая папка `dist/` — обычный статический сайт. Её можно положить куда угодно: GitHub Pages, Cloudflare Pages, Netlify, Vercel, nginx, S3.

Сначала соберите проект кнопкой в админке или командой `npm run build`.

### GitHub Pages (отдельный репозиторий)

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

Если репозиторий называется иначе (не `USERNAME.github.io`), сайт откроется по адресу `https://USERNAME.github.io/REPO/`. В сборке уже используются относительные пути (`style.css` и `assets/...` без ведущего слеша), поэтому всё заработает и в подпапке.

### GitHub Pages (из основного репозитория)

1. Соберите проект и скопируйте содержимое `dist/` в папку `docs/` либо запушьте `dist/` в ветку `gh-pages`.
2. В **Settings → Pages** выберите ветку и папку с файлами.
3. Для автоматизации закоммитьте `data/profile.json` и нужные файлы из `assets/` (уберите их из `.gitignore`) и добавьте GitHub Actions, который выполняет `npm ci && npm run build` и публикует `dist/`. Без файла профиля CI соберёт страницу с дефолтными настройками.

Быстрый ручной вариант с `docs/`:

```bash
npm run build
rm -rf docs && cp -r dist docs
git add docs && git commit -m "Update bio page" && git push
```

В настройках Pages выберите ветку `main` и папку `/docs`.

### Cloudflare Pages (drag & drop)

1. Откройте [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages → Create → Pages → Upload assets**.
2. Перетащите папку `dist` целиком.
3. Укажите имя проекта и нажмите **Deploy**. Получите адрес `https://project-name.pages.dev`.
4. Свой домен добавляется в **Custom domains**.

### Cloudflare Pages (Wrangler CLI)

```bash
npx wrangler pages deploy dist --project-name vibe-bio
```

Первый запуск попросит авторизоваться в Cloudflare. Дальше достаточно повторять команду после каждой сборки.

### Cloudflare Pages из Git

Если хотите автодеплой при пуше:

- **Build command**: `npm run build` (или оставьте пустым, если коммитите готовый `dist/`);
- **Build output directory**: `dist`;
- **Framework preset**: `None`.

Для сборки на стороне Cloudflare нужны `data/profile.json` и медиа в репозитории — иначе соберётся дефолтная страница.

## Кастомизация

- **Цвета кнопок соцсетей**: классы `.social--telegram`, `.link--discord` и т. п. в `lib/page.css`; брендовые цвета задаются в `SOCIAL_BRANDS` в `lib/render.js`.
- **Пресеты тем**: массив `themePresets` в `views/admin.ejs` (цвет фона + акцент).
- **Шрифты**: объект `FONTS` в `lib/store.js` (стек + параметры Google Fonts).
- **Эффекты частиц**: режимы в `lib/page.js` и список `PARTICLE_EFFECTS` в `lib/store.js`.
- **Стили карточки и аватарки**: `CARD_STYLES` и `AVATAR_SHAPES` в `lib/store.js`, стили — в `lib/page.css`.
- **Готовые цвета фона**: массив `swatches` в `views/admin.ejs`.
- **Поля профиля**: `lib/store.js` (валидация) и `views/admin.ejs` (форма).
- **Новая соцсеть**: добавьте поле в `views/admin.ejs`, `server.js` (`/api/save`), `lib/store.js` (`LINK_KEYS`) и логику в `buildSocials()` в `lib/render.js`.

## Безопасность

- Сервер по умолчанию слушает только `127.0.0.1` — снаружи он недоступен.
- HTML экранируется, в ссылки допускаются только `http` и `https` (защита от `javascript:`).
- Аватарка и обложка: только PNG/JPG/WEBP/GIF, максимум 5 МБ, имя файла генерируется на сервере.
- Фоновое изображение: PNG/JPG/WEBP/GIF, максимум 10 МБ.
- Музыка: только MP3, максимум 10 МБ, сервер принудительно сохраняет расширение `.mp3`.
- SVG-загрузки запрещены, чтобы нельзя было подсунуть скрипт через картинку.
- Просмотры принимаются только для username из `[a-z0-9._-]` длиной до 40 символов.
- Не выставляйте админку в интернет без аутентификации и HTTPS. Это локальный инструмент. Если нужен публичный режим — добавьте авторизацию, CSRF-защиту и reverse proxy.

## Частые проблемы

**Порт 9999 занят.** Остановите другой процесс или запустите `PORT=3001 npm start`.

**Иконки не отображаются на готовой странице.** FontAwesome подключается с CDN — проверьте интернет. Для офлайн-раздачи скачайте FontAwesome локально и замените ссылку в `lib/render.js`.

**Шрифт не тот.** Google Fonts также подключается с CDN. Проверьте интернет и выбранный шрифт в разделе «Оформление».

**Аватарка/фон не обновились.** Нажмите «Собрать проект» ещё раз: `dist/assets/` пересоздаётся при каждой сборке.

**Музыка не играет на готовой странице.** Убедитесь, что после загрузки MP3 вы нажали «Собрать проект»: файл должен попасть в `dist/assets/music-*.mp3`. Браузеры запрещают автозапуск без действия пользователя, поэтому трек стартует только после клика по обложке плеера.

**Discord presence не появляется или пишет «не отслеживается».** Проверьте числовой Discord ID (17–20 цифр) и включённый тумблер. Затем нажмите **«Проверить»** в админке. Если Lanyard отвечает `user_not_monitored`, зайдите на [discord.gg/lanyard](https://discord.gg/lanyard) — Lanyard отслеживает только участников своего сервера. После этого подождите до 20 секунд (страница обновляет статус автоматически) или перезагрузите её.

**Эффекты при клике не работают.** Убедитесь, что в админке выбран не «Выключено». При `prefers-reduced-motion` эффекты, курсор, наклон и печатная машинка отключаются автоматически.

**Счётчик просмотров не растёт в `dist/`.** Статическая страница не имеет сервера и хранит счётчик в `localStorage`. Серверный счётчик работает в `/preview` и админке.

**Хочу сбросить настройки.** Остановите сервер, удалите `data/profile.json`, `data/views.json` и загруженные файлы `assets/avatar-*`, `assets/bg-*`, `assets/music-*`, `assets/cover-*`, затем запустите снова.

**Не сохраняется профиль.** Username — до 40 символов, bio — до 300, ссылки — до 300, свои ссылки — до 8 штук. Файлы — в пределах лимитов выше.

## Лицензия

[MIT](LICENSE). Используйте, форкайте и меняйте под себя.
