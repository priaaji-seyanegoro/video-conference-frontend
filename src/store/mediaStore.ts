import { create } from 'zustand';
import { MediaState, PeerConnection } from '@/types';

interface MediaStoreState extends MediaState {
  // Peer connections
  peers: PeerConnection[];
  
  // Actions
  setAudioEnabled: (enabled: boolean) => void;
  setVideoEnabled: (enabled: boolean) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  setScreenSharing: (sharing: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  setScreenStream: (stream: MediaStream | null) => void;
  
  // Peer management
  addPeer: (peer: PeerConnection) => void;
  removePeer: (userId: string) => void;
  updatePeerStream: (userId: string, stream: MediaStream | null) => void;
  
  // Reset
  reset: () => void;
}

export const useMediaStore = create<MediaStoreState>((set, get) => ({
  // Initial state
  isAudioEnabled: false,
  isVideoEnabled: false,
  isScreenSharing: false,
  localStream: null,
  screenStream: null,
  peers: [],
  
  // Actions
  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
  setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
  toggleAudio: () =>
    set((state) => ({ isAudioEnabled: !state.isAudioEnabled })),
  toggleVideo: () =>
    set((state) => ({ isVideoEnabled: !state.isVideoEnabled })),
  setScreenSharing: (sharing) => set({ isScreenSharing: sharing }),
  setLocalStream: (stream) => set({ localStream: stream }),
  setScreenStream: (stream) => set({ screenStream: stream }),
  
  addPeer: (peer) => set((state) => ({
    peers: [...state.peers, peer]
  })),
  
  removePeer: (userId) => set((state) => ({
    peers: state.peers.filter(peer => peer.userId !== userId)
  })),
  
  updatePeerStream: (userId, stream) => set((state) => ({
    peers: state.peers.map(peer => 
      peer.userId === userId ? { ...peer, stream } : peer
    )
  })),
  
  reset: () => set({
    isAudioEnabled: false,
    isVideoEnabled: false,
    isScreenSharing: false,
    localStream: null,
    screenStream: null,
    peers: [],
  }),
}));