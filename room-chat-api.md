# Room Chat API

## Overview

API adds text chat inside an existing room.

- Base prefix: `/api`
- Auth: JWT from `access_token` cookie
- Access rule: only room members can read and send messages
- Message type: text only

For browser requests use `credentials: 'include'`.

## Message Object

```json
{
  "id": "a8b5d2a2-8e19-4c34-9745-d5f7ebad63fa",
  "roomId": "2f3d1bc9-c632-486d-a65b-3e7f2d93a1d6",
  "authorId": "c24c98cc-3f3a-4ce2-bc64-80bb9f6e8ed1",
  "text": "Hello everyone",
  "createdAt": "2026-03-28T15:42:10.120Z",
  "author": {
    "id": "c24c98cc-3f3a-4ce2-bc64-80bb9f6e8ed1",
    "email": "user@example.com",
    "name": "Anton"
  }
}
```

`author.password` is never returned.

## Get Room Messages

`GET /api/rooms/:roomId/messages`

Returns room messages in chronological order from oldest to newest.

### Query Params

- `limit` optional, default `50`, max `100`
- `beforeCreatedAt` optional ISO date; returns only messages created before this timestamp

### Example Request

```ts
const response = await fetch(
  'http://localhost:4242/api/rooms/2f3d1bc9-c632-486d-a65b-3e7f2d93a1d6/messages?limit=20',
  {
    method: 'GET',
    credentials: 'include',
  },
);

const messages = await response.json();
```

### Success Response

```json
[
  {
    "id": "a8b5d2a2-8e19-4c34-9745-d5f7ebad63fa",
    "roomId": "2f3d1bc9-c632-486d-a65b-3e7f2d93a1d6",
    "authorId": "c24c98cc-3f3a-4ce2-bc64-80bb9f6e8ed1",
    "text": "Hello everyone",
    "createdAt": "2026-03-28T15:42:10.120Z",
    "author": {
      "id": "c24c98cc-3f3a-4ce2-bc64-80bb9f6e8ed1",
      "email": "user@example.com",
      "name": "Anton"
    }
  }
]
```

## Send Message

`POST /api/rooms/:roomId/messages`

Creates a new text message in the room.

### Request Body

```json
{
  "text": "Hello everyone"
}
```

### Validation Rules

- `text` is required
- `text` is trimmed on backend
- empty string after trim is rejected
- max length is `2000` characters

### Example Request

```ts
const response = await fetch(
  'http://localhost:4242/api/rooms/2f3d1bc9-c632-486d-a65b-3e7f2d93a1d6/messages',
  {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'Hello everyone',
    }),
  },
);

const message = await response.json();
```

### Success Response

Returns created message object in the same format as `GET /messages`.

## Typical Errors

- `401 Unauthorized` if user is not authenticated
- `403 Forbidden` if user is not a member of the room
- `404 Not Found` if room does not exist
- `400 Bad Request` if body or query params are invalid

## Recommended Client Flow

1. Join room using existing room flow.
2. Load initial chat history with `GET /api/rooms/:roomId/messages`.
3. Send new messages with `POST /api/rooms/:roomId/messages`.
4. For older history, call `GET /api/rooms/:roomId/messages?beforeCreatedAt=<oldestMessage.createdAt>`.
