import SimplePeer from 'simple-peer';

export const createPeer = (initiator: boolean, stream?: MediaStream): SimplePeer.Instance => {
  return new SimplePeer({
    initiator,
    trickle: false,
    stream,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    },
  });
};

export const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

export const getDisplayMedia = async (): Promise<MediaStream> => {
  try {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
  } catch (error) {
    console.error('Error accessing display media:', error);
    throw error;
  }
};

export const stopMediaStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
};