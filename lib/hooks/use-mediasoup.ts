import * as mediasoupClient from "mediasoup-client";
import { useCallback, useRef, useState } from "react";
import { useSocket } from "./use-socket";
import { SOCKET_EVENTS } from "@/lib/constants/socket";

export const useMediasoup = (roomId: string) => {
  const socket = useSocket();
  const deviceRef = useRef<mediasoupClient.types.Device | null>(null);
  const sendTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const recvTransportRef = useRef<mediasoupClient.types.Transport | null>(null);
  const audioProducerRef = useRef<mediasoupClient.types.Producer | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    { id: string; stream: MediaStream; kind: "video" | "audio" }[]
  >([]);
  const [isMuted, setIsMuted] = useState(false);

  const consumeProducer = useCallback(
    async (producerId: string) => {
      if (!socket || !deviceRef.current || !recvTransportRef.current) return;

      const { rtpCapabilities } = deviceRef.current;

      const { id, kind, rtpParameters } = await socket.emitWithAck(
        SOCKET_EVENTS.MEDIASOUP_CONSUME,
        {
          transportId: recvTransportRef.current.id,
          producerId,
          rtpCapabilities,
        },
      );

      const consumer = await recvTransportRef.current.consume({
        id,
        producerId,
        kind,
        rtpParameters,
      });

      const { track } = consumer;
      const stream = new MediaStream([track]);

      setRemoteStreams((prev) => [...prev, { id: consumer.id, stream, kind }]);

      await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_RESUME_CONSUMER, {
        consumerId: id,
      });
    },
    [socket],
  );

  const initConsuming = useCallback(async () => {
    if (!socket || !deviceRef.current) return;

    const transportParams = await socket.emitWithAck(
      SOCKET_EVENTS.MEDIASOUP_CREATE_TRANSPORT,
      { roomId },
    );

    recvTransportRef.current =
      deviceRef.current.createRecvTransport(transportParams);

    recvTransportRef.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CONNECT_TRANSPORT, {
            transportId: recvTransportRef.current?.id,
            dtlsParameters,
          });
          callback();
        } catch (error: any) {
          errback(error);
        }
      },
    );

    socket.on(
      SOCKET_EVENTS.MEDIASOUP_NEW_PRODUCER,
      async ({ producerId, socketId }) => {
        if (socketId === socket.id) return;
        await consumeProducer(producerId);
      },
    );
  }, [socket, roomId, consumeProducer]);

  const startProducing = useCallback(async () => {
    if (!socket || !deviceRef.current) return;

    const transportParams = await socket.emitWithAck(
      SOCKET_EVENTS.MEDIASOUP_CREATE_TRANSPORT,
      { roomId },
    );

    sendTransportRef.current =
      deviceRef.current.createSendTransport(transportParams);

    sendTransportRef.current.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await socket.emitWithAck(SOCKET_EVENTS.MEDIASOUP_CONNECT_TRANSPORT, {
            transportId: sendTransportRef.current?.id,
            dtlsParameters,
          });
          callback();
        } catch (error: any) {
          errback(error);
        }
      },
    );

    sendTransportRef.current.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await socket.emitWithAck(
            SOCKET_EVENTS.MEDIASOUP_PRODUCE,
            {
              transportId: sendTransportRef.current?.id,
              kind,
              rtpParameters,
              roomId,
            },
          );
          callback({ id });
        } catch (error: any) {
          errback(error);
        }
      },
    );

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {
      audioProducerRef.current = await sendTransportRef.current.produce({
        track: audioTrack,
      });
    }
  }, [socket, roomId]);

  const toggleMic = useCallback(() => {
    if (audioProducerRef.current) {
      if (audioProducerRef.current.paused) {
        audioProducerRef.current.resume();
        setIsMuted(false);
      } else {
        audioProducerRef.current.pause();
        setIsMuted(true);
      }
    }
  }, []);

  const initMediasoup = useCallback(async () => {
    if (!socket) return;

    deviceRef.current = new mediasoupClient.Device();

    const routerRtpCapabilities = await socket.emitWithAck(
      SOCKET_EVENTS.MEDIASOUP_GET_CAPABILITIES,
      { roomId },
    );

    await deviceRef.current.load({ routerRtpCapabilities });
  }, [socket, roomId]);

  return {
    initMediasoup,
    startProducing,
    initConsuming,
    remoteStreams,
    toggleMic,
    isMuted,
  };
};
