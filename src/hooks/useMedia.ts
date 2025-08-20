import { useCallback, useEffect } from 'react';
import { useMediaStore } from '@/store/mediaStore';
import { getUserMedia, getDisplayMedia, stopMediaStream } from '@/utils/webrtc';
import { Socket } from 'socket.io-client';

export const useMedia = (socket: typeof Socket | null) => {
  const {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    localStream,
    screenStream,
    setAudioEnabled,
    setVideoEnabled,
    toggleAudio: toggleAudioInStore,
    toggleVideo: toggleVideoInStore,
    setScreenSharing,
    setLocalStream,
    setScreenStream,
  } = useMediaStore();

  const initializeMedia = useCallback(async () => {
    console.log('Initializing media...');
    try {
      const stream = await getUserMedia({
        video: true,
        audio: true,
      });
      
      console.log('Media stream acquired:', stream);
      setLocalStream(stream);
      setAudioEnabled(true);
      setVideoEnabled(true);
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, [setLocalStream, setAudioEnabled, setVideoEnabled]);

  const toggleAudio = useCallback(async () => {
    if (!localStream || !socket) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !audioTrack.enabled;
      audioTrack.enabled = newState;
      toggleAudioInStore();
      socket.emit("toggle-audio", { enabled: newState });
    }
  }, [localStream, socket, toggleAudioInStore]);

  const toggleVideo = useCallback(async () => {
    if (!socket) return;

    // Tidak ada stream saat ini
    if (!localStream) {
      if (isVideoEnabled) {
        setVideoEnabled(false);
        socket.emit("toggle-video", { enabled: false });
        return;
      } else {
        try {
          const cam = await getUserMedia({ video: true, audio: true });
          setLocalStream(cam);
          setAudioEnabled(true);
          setVideoEnabled(true);
          socket.emit("toggle-video", { enabled: true });
        } catch (e) {
          console.error("[useMedia] Failed to getUserMedia when enabling video without stream:", e);
        }
        return;
      }
    }

    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();

    if (isVideoEnabled) {
      // Turn OFF: stop semua video track agar kamera benar-benar mati
      for (const vt of videoTracks) {
        try { vt.stop(); } catch {}
      }
      const newStream = new MediaStream([...audioTracks]); // hanya audio
      setLocalStream(newStream);
      setVideoEnabled(false);
      socket.emit("toggle-video", { enabled: false });
    } else {
      // Turn ON: re-acquire video track baru lalu compose dengan audio lama
      try {
        const camStream = await getUserMedia({ video: true, audio: false });
        const newVideoTrack = camStream.getVideoTracks()[0];

        const newStream = new MediaStream([
          newVideoTrack,
          ...audioTracks,
        ]);

        setLocalStream(newStream);
        setVideoEnabled(true);
        socket.emit("toggle-video", { enabled: true });
      } catch (e) {
        console.error("[useMedia] Failed to re-acquire camera on enable:", e);
      }
    }
  }, [
    socket,
    localStream,
    isVideoEnabled,
    setLocalStream,
    setVideoEnabled,
    setAudioEnabled,
  ]);

  const stopScreenShare = useCallback(async () => {
    if (!socket) return;
    if (screenStream) {
      stopMediaStream(screenStream);
      setScreenStream(null);
    }
    setScreenSharing(false);
    socket.emit("toggle-screen-share", { enabled: false });

    // Pastikan kamera kembali live setelah berhenti share
    try {
      const currentVideoTrack = localStream?.getVideoTracks?.()[0];
      const videoLive = !!currentVideoTrack && currentVideoTrack.readyState === 'live';

      if (!videoLive) {
        const cam = await getUserMedia({ video: true, audio: true });
        setLocalStream(cam);
        setAudioEnabled(true);
        setVideoEnabled(true);
        console.log('[useMedia] Re-acquired camera after stopping screen share:', {
          id: cam.id,
          videoTracks: cam.getVideoTracks().length,
          audioTracks: cam.getAudioTracks().length,
        });
      }
    } catch (e) {
      console.error('[useMedia] Failed to re-acquire camera after stopping screen share:', e);
    }
  }, [socket, screenStream, setScreenStream, setScreenSharing, localStream, setLocalStream, setAudioEnabled, setVideoEnabled]);

  const startScreenShare = useCallback(async () => {
    if (!socket) return;
    try {
      const stream = await getDisplayMedia();
      setScreenStream(stream);
      setScreenSharing(true);
      socket.emit("toggle-screen-share", { enabled: true });
      
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
      
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [setScreenStream, setScreenSharing, socket, stopScreenShare]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, stopScreenShare, startScreenShare]);

  useEffect(() => {
    return () => {
      if (localStream) {
        stopMediaStream(localStream);
      }
      if (screenStream) {
        stopMediaStream(screenStream);
      }
    };
  }, [localStream, screenStream]);

  return {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    localStream,
    screenStream,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
