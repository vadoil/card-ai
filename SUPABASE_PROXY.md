# Прокси Supabase через свой домен (обход блокировок в РФ)

Цель: пользователи из РФ ходят только на `stock-cards.ru`, а nginx на VPS
проксирует запросы в Supabase. Код фронта не меняется — меняется только URL.

> Это **Option A** из обсуждения. Быстро (30 минут), 0 правок кода.
> Когда дорастём до платящих клиентов — мигрируем на self-hosted Supabase
> (см. `SUPABASE_SELFHOST.md`, добавлю по запросу).

---

## 1. Узнай свой Supabase URL

В Lovable Cloud → Settings → видно что-то вроде:
```
https://abcdefgh.supabase.co
```
Запомни хост `abcdefgh.supabase.co` — он понадобится ниже.

---

## 2. Добавь конфиг nginx

На VPS открой `/etc/nginx/sites-available/stock-cards.ru` и **внутри того же
`server { … }` блока, где уже есть `location /`**, добавь до него:

```nginx
# --- Supabase proxy (REST / Auth / Storage / Realtime) ---
set $supabase_host  abcdefgh.supabase.co;   # ← подставь свой
set $supabase_orig  https://abcdefgh.supabase.co;

# REST (PostgREST)
location /db/ {
    proxy_pass         $supabase_orig/rest/v1/;
    proxy_ssl_server_name on;
    proxy_set_header   Host $supabase_host;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
}

# Auth (GoTrue)
location /auth/ {
    proxy_pass         $supabase_orig/auth/v1/;
    proxy_ssl_server_name on;
    proxy_set_header   Host $supabase_host;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
}

# Storage
location /storage/ {
    proxy_pass         $supabase_orig/storage/v1/;
    proxy_ssl_server_name on;
    proxy_set_header   Host $supabase_host;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 50m;
    proxy_http_version 1.1;
}

# Realtime (WebSocket)
location /realtime/ {
    proxy_pass         $supabase_orig/realtime/v1/;
    proxy_ssl_server_name on;
    proxy_set_header   Host $supabase_host;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_read_timeout 3600s;
    proxy_http_version 1.1;
}

# Functions (если будут edge functions, хотя по правилам мы их не используем)
location /functions/ {
    proxy_pass         $supabase_orig/functions/v1/;
    proxy_ssl_server_name on;
    proxy_set_header   Host $supabase_host;
    proxy_http_version 1.1;
}
```

Перезагрузи nginx:
```bash
nginx -t && systemctl reload nginx
```

Проверь:
```bash
curl -I https://stock-cards.ru/auth/health
# должен прийти 200 от GoTrue
```

---

## 3. Переключи фронт на свой домен

В `.env` на VPS (см. `DEPLOY.md` §8):

```
VITE_SUPABASE_URL=https://stock-cards.ru
SUPABASE_URL=https://stock-cards.ru
# publishable key оставь тот же, он публичный
```

**Важно:** в коде `@/integrations/supabase/client` собран на стандартные пути
`/auth/v1`, `/rest/v1`, `/storage/v1`, `/realtime/v1`. Поэтому в `location`
выше мы **переписываем** `/auth/` → `/auth/v1/`, `/db/` → `/rest/v1/` и т.д.

Чтобы не переписывать — можно сделать «прозрачный» вариант: один `location /supabase/`
и `proxy_pass https://abcdefgh.supabase.co/;`. Тогда:
```
VITE_SUPABASE_URL=https://stock-cards.ru/supabase
```
Этот вариант проще, но клиент Supabase должен поддерживать base path —
у `@supabase/supabase-js` это работает.

Минимальный «прозрачный» блок:
```nginx
location /supabase/ {
    proxy_pass         https://abcdefgh.supabase.co/;
    proxy_ssl_server_name on;
    proxy_set_header   Host abcdefgh.supabase.co;
    proxy_set_header   Upgrade $http_upgrade;
    proxy_set_header   Connection "upgrade";
    proxy_http_version 1.1;
    client_max_body_size 50m;
    proxy_read_timeout 3600s;
}
```

Пересобери и рестартни:
```bash
/var/www/stock-ai/deploy.sh
```

---

## 4. Что важно понимать

- **Auth cookies / JWT** теперь идут через `stock-cards.ru` — никаких
  cross-origin проблем, RKN не блокирует.
- **152-ФЗ** этот вариант **не закрывает**: данные физически всё ещё в
  Supabase (за рубежом). Для b2b с ПДн нужен self-hosted (Option B).
- **Latency**: +50–100ms на хоп через твой VPS. Для нашего кейса несущественно.
- **Лимиты Supabase** работают как раньше — это та же база.

---

## 5. Когда переходить на self-hosted

Сигналы:
- Появились платящие клиенты с требованием «данные в РФ».
- Supabase урезал free tier / поднял цену.
- Хочешь полный контроль над БД (свои расширения, pg_cron, и т.д.).

Тогда пиши «давай SUPABASE_SELFHOST.md» — соберу docker-compose
(postgres + gotrue + postgrest + storage + studio + kong) под этот же VPS.
