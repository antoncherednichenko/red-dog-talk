export const SOCKET_EVENTS = {
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
  UPDATE_STATUS: "member:update_status",
  MEMBER_STATUS_CHANGED: "member:status_changed",
} as const;
