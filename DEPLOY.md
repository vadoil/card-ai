# Деплой Stock AI на VPS (159.194.226.37, домен stock-cards.ru)

Стек проекта: **TanStack Start + Vite + Bun**, SSR через Nitro (Node preset для VPS).
Репозиторий: https://github.com/vadoil/card-ai

---

## 0. Что получим в итоге

- Сайт работает на `https://stock-cards.ru` и `https://www.stock-cards.ru`
- Node-сервер крутится через `pm2` на порту `3000`
- `nginx` проксирует 80/443 → 3000, выдаёт SSL через Let's Encrypt
- Обновление сайта = `git pull && bun install && bun run build && pm2 restart stock-ai`

---

## 1. DNS (делается у регистратора stock-cards.ru)

Создай две A-записи:

| Тип | Имя | Значение         | TTL  |
|-----|-----|------------------|------|
| A   | @   | 159.194.226.37   | 3600 |
| A   | www | 159.194.226.37   | 3600 |

Проверь: `dig stock-cards.ru +short` должен вернуть `159.194.226.37`.

---

## 2. Первичная настройка VPS

Подключись:
```bash
ssh root@159.194.226.37
```

Обнови систему и поставь базовые пакеты:
```bash
apt update && apt upgrade -y
apt install -y curl git nginx ufw build-essential unzip
```

Файрвол:
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

Установи **Bun** (то, на чём собирается проект):
```bash
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
bun --version
```

Установи **Node.js 20** (нужен для pm2 и для запуска собранного SSR-сервера):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm i -g pm2
```

---

## 3. Привязка GitHub → пуш кода из Lovable

1. В Lovable: **+ (плюс в чате) → GitHub → Connect project**.
2. Авторизуй Lovable GitHub App для аккаунта `vadoil`.
3. Lovable создаст / синхронизирует репозиторий https://github.com/vadoil/card-ai
4. Дальше каждое изменение в Lovable автоматически уходит в `main` ветку.

> Если репо приватное — на VPS сгенерируй ключ:
> ```bash
> ssh-keygen -t ed25519 -C "vps-stock-cards" -f ~/.ssh/id_ed25519 -N ""
> cat ~/.ssh/id_ed25519.pub
> ```
> Скопируй вывод в GitHub → repo Settings → Deploy keys (Read access).

---

## 4. Клонируем и собираем проект на VPS

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/vadoil/card-ai.git stock-ai
cd stock-ai

bun install
bun run build
```

После сборки появится папка `.output/` (Nitro build) или `dist/` — в зависимости от пресета.
По умолчанию шаблон собирается под Cloudflare Workers. **Для VPS меняем target на Node.**

Открой `vite.config.ts` и убедись, что блок выглядит так:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
});
```

Пересобери:
```bash
bun run build
```

Готовый сервер появится по пути `.output/server/index.mjs`.
Проверь локально:
```bash
PORT=3000 node .output/server/index.mjs
# в другом окне: curl http://127.0.0.1:3000
```

---

## 5. Запуск через pm2

```bash
cd /var/www/stock-ai
PORT=3000 pm2 start .output/server/index.mjs --name stock-ai
pm2 save
pm2 startup systemd -u root --hp /root
```

Проверка:
```bash
pm2 status
pm2 logs stock-ai --lines 50
```

---

## 6. Nginx + SSL

Создай конфиг `/etc/nginx/sites-available/stock-cards.ru`:

```nginx
server {
    listen 80;
    server_name stock-cards.ru www.stock-cards.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Активируй:
```bash
ln -s /etc/nginx/sites-available/stock-cards.ru /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Открой `http://stock-cards.ru` — должен открыться сайт.

Поставь SSL:
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d stock-cards.ru -d www.stock-cards.ru \
        --redirect --agree-tos -m admin@stock-cards.ru --non-interactive
```

Сертификат продлевается автоматически (`systemctl status certbot.timer`).

---

## 7. Обновление сайта (deploy script)

Создай `/var/www/stock-ai/deploy.sh`:

```bash
#!/usr/bin/env bash
set -e
cd /var/www/stock-ai
git pull origin main
bun install
bun run build
pm2 restart stock-ai
echo "✅ Deployed at $(date)"
```

```bash
chmod +x /var/www/stock-ai/deploy.sh
```

Теперь после любых правок в Lovable:
```bash
ssh root@159.194.226.37 '/var/www/stock-ai/deploy.sh'
```

(можно повесить на GitHub Action — по `push` в `main` дергать webhook на VPS, скажи если нужно — пришлю готовый workflow).

---

## 8. Переменные окружения

Создай `/var/www/stock-ai/.env` (не коммитится):

```
NODE_ENV=production
PORT=3000
# Ключи, когда подключим Gemini / БД:
GEMINI_API_KEY=...
```

Перезапусти pm2 с env:
```bash
pm2 restart stock-ai --update-env
```

---

## 9. Чек-лист после деплоя

- [ ] `https://stock-cards.ru` открывается, замок зелёный
- [ ] `https://www.stock-cards.ru` редиректит на основной домен
- [ ] `pm2 status` — процесс `online`
- [ ] `pm2 logs stock-ai` — без ошибок
- [ ] `curl -I https://stock-cards.ru` → `200 OK`
- [ ] Открой `/studio` — страница работает (значит роутинг SSR ок)

---

## Типовые проблемы

**`502 Bad Gateway`** — упал Node-процесс. `pm2 logs stock-ai`.
**`Cannot find module '.output/server/index.mjs'`** — не пересобрал после смены `nitro.preset`. Запусти `bun run build`.
**Белый экран и `Hydration failed`** — env разный на сервере и в браузере. Проверь `.env` и `pm2 restart stock-ai --update-env`.
**SSL не выдался** — DNS ещё не прорезолвился. Подожди 10–60 минут и повтори `certbot`.
