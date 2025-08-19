export interface User {
  id: string;
  name: string;
  socketId: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isHost: boolean;
  isHandRaised: boolean;
}

export interface Room {
  roomId: string;
  name: string;
  users: User[];
  settings: {
    requirePassword: boolean;
    maxParticipants: number;
    allowScreenShare: boolean;
    allowChat: boolean;
  };
  createdAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'file' | 'emoji';
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
}

export interface MediaState {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
}

export interface ConnectionQuality {
  userId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  latency: number;
  packetLoss: number;
}

export interface PeerConnection {
  userId: string;
  peer: any; // SimplePeer instance
  stream: MediaStream | null;
}