import { useEffect, useRef, useCallback } from "react";
import SimplePeer from "simple-peer";
import { useMediaStore } from "@/store/mediaStore";
import { useRoomStore } from "@/store/roomStore";
import { useSocket } from "./useSocket";
import { createPeer } from "@/utils/webrtc";
import { PeerConnection } from "@/types";

export const useWebRTC = () => {
  const {
    localStream,
    screenStream,
    peers,
    addPeer,
    removePeer,
    updatePeerStream,
  } = useMediaStore();

  const { users, currentUser } = useRoomStore();
  const { socket } = useSocket();
  const peersRef = useRef<{ [userId: string]: SimplePeer.Instance }>({});

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
    };
  }, [socket]);

  // Ganti track outgoing ke peers saat start/stop screen share
  useEffect(() => {
    const activeStream = screenStream ?? localStream;
    // Tidak ada stream aktif, tidak perlu apa-apa
    if (!activeStream) return;

    const newVideo = activeStream.getVideoTracks()?.[0] || null;
    const newAudio = activeStream.getAudioTracks()?.[0] || null;

    Object.values(peersRef.current).forEach((peer) => {
      try {
        // Akses RTCPeerConnection dari simple-peer
        const pc = (peer as any)?._pc;
        if (!pc || !pc.getSenders) return;

        const senders: RTCRtpSender[] = pc.getSenders() || [];

        // Replace video sender
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender && videoSender.track !== newVideo) {
          videoSender.replaceTrack(newVideo);
        }

        // Replace audio sender
        const audioSender = senders.find((s) => s.track && s.track.kind === 'audio');
        if (audioSender && audioSender.track !== newAudio) {
          audioSender.replaceTrack(newAudio);
        }
      } catch (err) {
        console.error('Failed to replace tracks on peer:', err);
      }
    });
  }, [screenStream, localStream]);

  const handleOffer = useCallback(
    ({ offer, fromUserId }: { offer: any; fromUserId: string }) => {
      if (!localStream) return;

      const peer = createPeer(false, localStream);
      peersRef.current[fromUserId] = peer;

      peer.on("signal", (signal) => {
        socket?.emit("webrtc-answer", { answer: signal, toUserId: fromUserId });
      });

      peer.on("stream", (stream) => {
        updatePeerStream(fromUserId, stream);
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
        removePeer(fromUserId);
        delete peersRef.current[fromUserId];
      });

      peer.signal(offer);

      addPeer({ userId: fromUserId, peer, stream: null });
    },
    [localStream, socket, addPeer, updatePeerStream, removePeer]
  );

  const handleAnswer = useCallback(
    ({ answer, fromUserId }: { answer: any; fromUserId: string }) => {
      const peer = peersRef.current[fromUserId];
      if (peer) {
        peer.signal(answer);
      }
    },
    []
  );

  const handleIceCandidate = useCallback(
    ({ candidate, fromUserId }: { candidate: any; fromUserId: string }) => {
      const peer = peersRef.current[fromUserId];
      if (peer) {
        peer.signal(candidate);
      }
    },
    []
  );

  const handleUserJoined = useCallback(
    ({ user }: { user: any }) => {
      if (!localStream || !currentUser || user.id === currentUser.id) return;

      const peer = createPeer(true, localStream);
      peersRef.current[user.id] = peer;

      peer.on("signal", (signal) => {
        socket?.emit("webrtc-offer", { offer: signal, toUserId: user.id });
      });

      peer.on("stream", (stream) => {
        updatePeerStream(user.id, stream);
      });

      peer.on("error", (error) => {
        console.error("Peer error:", error);
        removePeer(user.id);
        delete peersRef.current[user.id];
      });

      addPeer({ userId: user.id, peer, stream: null });
    },
    [localStream, currentUser, socket, addPeer, updatePeerStream, removePeer]
  );

  const handleUserLeft = useCallback(
    ({ userId }: { userId: string }) => {
      const peer = peersRef.current[userId];
      if (peer) {
        peer.destroy();
        delete peersRef.current[userId];
      }
      removePeer(userId);
    },
    [removePeer]
  );

  const updatePeerStreams = useCallback((newStream: MediaStream | null) => {
    Object.values(peersRef.current).forEach((peer) => {
      if (newStream) {
        peer.replaceTrack(
          peer.streams[0]?.getVideoTracks()[0],
          newStream.getVideoTracks()[0],
          peer.streams[0]
        );
        peer.replaceTrack(
          peer.streams[0]?.getAudioTracks()[0],
          newStream.getAudioTracks()[0],
          peer.streams[0]
        );
      }
    });
  }, []);

  const destroyAllPeers = useCallback(() => {
    Object.values(peersRef.current).forEach((peer) => {
      peer.destroy();
    });
    peersRef.current = {};
  }, []);

  return {
    peers,
    updatePeerStreams,
    destroyAllPeers,
  };
};
