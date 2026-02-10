export const SOCKET_EVENTS = {
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",
  UPDATE_STATUS: "member:update_status",
  MEMBER_STATUS_CHANGED: "member:status_changed",
  MEDIASOUP_GET_CAPABILITIES: "mediasoup:get_capabilities",
  MEDIASOUP_CREATE_TRANSPORT: "mediasoup:create_transport",
  MEDIASOUP_CONNECT_TRANSPORT: "mediasoup:connect_transport",
  MEDIASOUP_PRODUCE: "mediasoup:produce",
  MEDIASOUP_NEW_PRODUCER: "mediasoup:new_producer",
  MEDIASOUP_CONSUME: "mediasoup:consume",
  MEDIASOUP_RESUME_CONSUMER: "mediasoup:resume_consumer",
} as const;
