# Higgsfield MCP — интеграция в Stock AI

Официальный remote MCP сервер Higgsfield:

```
https://mcp.higgsfield.ai/mcp
```

Это даёт нашему бэкенду доступ к моделям Higgsfield (Soul, DoP, фото-генерация, примерка моделей) без прямой работы с их REST API — через стандартный MCP-протокол.

---

## 1. Где используется

В тарифе **Топ** (4 990 ₽/мес) — функция «Примерка моделей» и фото-генерация на товар. Сервер вызывается из server function на VPS, ключ и токен — только на сервере.

---

## 2. Переменные окружения

Добавь на VPS (`/etc/stock-cards/.env` или через секреты Lovable Cloud):

```env
HIGGSFIELD_MCP_URL=https://mcp.higgsfield.ai/mcp
HIGGSFIELD_API_KEY=...      # личный API-ключ из кабинета Higgsfield
```

Получить ключ: https://higgsfield.ai → Account → API.

---

## 3. Подключение через AI SDK MCP client

Используем `@ai-sdk/mcp` (а не Cloudflare Agents) — он работает и в Node, и в edge-runtime TanStack Start.

```bash
bun add @ai-sdk/mcp @modelcontextprotocol/sdk
```

`src/lib/higgsfield.server.ts`:

```ts
import { createMCPClient } from "@ai-sdk/mcp";

export async function getHiggsfieldClient() {
  const url = process.env.HIGGSFIELD_MCP_URL!;
  const key = process.env.HIGGSFIELD_API_KEY!;

  return await createMCPClient({
    transport: {
      type: "http",
      url,
      headers: { Authorization: `Bearer ${key}` },
      redirect: "error",
    },
  });
}
```

---

## 4. Server function — генерация карточки

`src/lib/higgsfield.functions.ts`:

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateWithHiggsfield = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      imageUrl: z.string().url(),
      prompt: z.string().min(3),
      style: z.enum(["studio", "lifestyle", "model", "flatlay"]),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const { getHiggsfieldClient } = await import("./higgsfield.server");
    const client = await getHiggsfieldClient();
    try {
      const tools = await client.tools();
      // Имена тулов смотрим в client.tools() при первом запуске —
      // ориентир: soul.generate, dop.generate, model.tryon
      const tool = tools["soul.generate"] ?? tools["generate"];
      const result = await tool.execute({
        image: data.imageUrl,
        prompt: data.prompt,
        preset: data.style,
      });
      return { ok: true, result };
    } finally {
      await client.close();
    }
  });
```

Вызов с клиента — через `useServerFn(generateWithHiggsfield)`.

---

## 5. Связка с Gemini (оркестратор)

Gemini 2.5 Flash выступает оркестратором:
1. Анализирует исходное фото товара → описание + категория.
2. Решает, какой пресет Higgsfield использовать (studio / model / lifestyle).
3. Вызывает `generateWithHiggsfield` 4 раза параллельно (4 варианта).
4. Пишет тексты карточки (title, bullets, SEO) сам.

Это дешевле, чем гонять весь промптинг через Higgsfield, и устойчивее: текст всегда есть, даже если генерация фото частично упала.

---

## 6. Проверка вручную

```bash
curl -X POST https://mcp.higgsfield.ai/mcp \
  -H "Authorization: Bearer $HIGGSFIELD_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

В ответе придёт список доступных тулов — их имена подставляем в `tools[...]` в коде выше.

---

## 7. Чего НЕ делать

- Не светить `HIGGSFIELD_API_KEY` через `VITE_*` — только серверная переменная.
- Не дёргать MCP напрямую с клиента — всегда через server function.
- Не держать MCP-клиент в глобале: открывать в начале хендлера, `client.close()` в `finally`.
- Не выкладывать ключ в репозиторий — добавляется через секреты VPS / Lovable Cloud.
