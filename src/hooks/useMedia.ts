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
    if (!localStream || !socket) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      const newState = !videoTrack.enabled;
      videoTrack.enabled = newState;
      toggleVideoInStore();
      socket.emit("toggle-video", { enabled: newState });
    }
  }, [localStream, socket, toggleVideoInStore]);

  const stopScreenShare = useCallback(() => {
    if (!socket) return;
    if (screenStream) {
      stopMediaStream(screenStream);
      setScreenStream(null);
    }
    setScreenSharing(false);
    socket.emit("toggle-screen-share", { enabled: false });
  }, [screenStream, setScreenStream, setScreenSharing, socket]);

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
      stopScreenShare();
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
