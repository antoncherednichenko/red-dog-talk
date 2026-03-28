# LiveKit API документация (для клиента)

Этот документ описывает, как фронтенду подключаться к звонкам в комнатах через backend `red-dog-talk-be`.

## 1. Что реализовано на backend

Добавлен endpoint:

- `POST /rooms/:id/call/token`

Он:

- проверяет, что комната существует;
- проверяет, что текущий пользователь (из JWT cookie `access_token`) является участником комнаты;
- выдаёт LiveKit JWT для подключения к звонку именно в этой комнате.

## 2. Переменные окружения backend

В `.env` должны быть заданы:

- `LIVEKIT_URL` — URL LiveKit сервера для клиента, например `ws://localhost:7880` или `wss://livekit.example.com`
- `LIVEKIT_API_KEY` — API key LiveKit
- `LIVEKIT_API_SECRET` — API secret LiveKit

Пример:

```env
LIVEKIT_URL="ws://localhost:7880"
LIVEKIT_API_KEY="devkey"
LIVEKIT_API_SECRET="secret"
```

## 3. Preconditions для клиента

Перед запросом токена пользователь должен:

1. быть авторизован (валидная cookie `access_token`);
2. быть участником комнаты.

Если пользователь ещё не участник, сначала вызовите:

- `POST /rooms/:id/join`

## 4. Запрос токена

## Endpoint

`POST /rooms/:id/call/token`

- `:id` — `room.id` из API комнат
- тело запроса: не требуется
- авторизация: JWT cookie (`access_token`)

### Пример запроса (fetch)

```ts
const res = await fetch(`/rooms/${roomId}/call/token`, {
  method: 'POST',
  credentials: 'include',
});

if (!res.ok) {
  throw new Error(`Failed to get call token: ${res.status}`);
}

const data = await res.json();
```

### Ответ

```json
{
  "token": "<livekit-jwt>",
  "url": "ws://localhost:7880",
  "roomName": "room-uuid",
  "identity": "user-uuid"
}
```

Поля:

- `token` — LiveKit access token
- `url` — LiveKit URL для подключения клиентского SDK
- `roomName` — имя комнаты в LiveKit (используется `room.id`)
- `identity` — идентификатор участника (используется `user.id`)

## 5. Подключение из клиента через LiveKit JS

Установите SDK на фронте:

```bash
npm install livekit-client
```

Пример подключения:

```ts
import { Room } from 'livekit-client';

export async function connectToCall(roomId: string) {
  const tokenRes = await fetch(`/rooms/${roomId}/call/token`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!tokenRes.ok) {
    throw new Error(`Token request failed: ${tokenRes.status}`);
  }

  const { token, url } = await tokenRes.json();

  const room = new Room({
    adaptiveStream: true,
    dynacast: true,
  });

  await room.connect(url, token);

  // Включить микрофон
  await room.localParticipant.setMicrophoneEnabled(true);

  // Для видеокомнаты можно включать и камеру
  // await room.localParticipant.setCameraEnabled(true);

  return room;
}
```

Отключение:

```ts
room.disconnect();
```

## 6. Права, зашитые в токен

Backend выдаёт токен с grant:

- `roomJoin: true`
- `canPublish: true`
- `canSubscribe: true`
- `canPublishData: true`

Это означает, что клиент может подключаться к комнате, публиковать/получать медиа и отправлять data messages.

## 7. Ошибки API

- `401 Unauthorized` — нет/просрочен JWT
- `404 Not Found` — комната не существует
- `403 Forbidden` — пользователь не является участником комнаты
- `500 Internal Server Error` — LiveKit не сконфигурирован (`LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`)

## 8. Рекомендуемый сценарий на фронте

1. Получить или создать комнату.
2. Вызвать `POST /rooms/:id/join` (если пользователь не участник).
3. Вызвать `POST /rooms/:id/call/token`.
4. Подключиться к LiveKit через `livekit-client`.
5. При выходе из звонка вызвать `room.disconnect()`.
6. При выходе из комнаты вызвать `POST /rooms/:id/leave`.

## 9. Короткий чек-лист для продакшена

- использовать `wss://` и HTTPS;
- хранить `LIVEKIT_API_SECRET` только на backend;
- не логировать токены в клиентских логах;
- обновлять токен через backend при необходимости re-connect.
