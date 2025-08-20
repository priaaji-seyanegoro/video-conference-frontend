'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { VideoGrid } from '@/components/ui/VideoGrid';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { ChatPanel } from '@/components/ui/ChatPanel';
import { ParticipantsPanel } from '@/components/ui/ParticipantsPanel';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useMedia } from '@/hooks/useMedia';
import { useRoomStore } from '@/store/roomStore';
import { useMediaStore } from '@/store/mediaStore';

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roomId = params.roomId as string;
  const userName = searchParams.get('name') || 'Anonymous';
  const roomPassword = searchParams.get('password') || '';
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  
  // Store states
  const { 
    currentRoom, 
    users, 
    messages, 
    connectionStatus, 
    error 
  } = useRoomStore();
  
  const { 
    isAudioEnabled, 
    isVideoEnabled, 
    isScreenSharing, 
    localStream, 
    remoteStreams,
    screenStream, // pastikan sudah ada
  } = useMediaStore();
  
  // Hooks
  const { 
    socket, 
    joinRoom, 
    leaveRoom, 
    sendMessage, 
  } = useSocket();
  
  // Ganti pemanggilan useWebRTC agar sesuai signature (tanpa argumen)
  const { } = useWebRTC();
  
  const { 
    initializeMedia, 
    toggleAudio: handleToggleAudio, 
    toggleVideo: handleToggleVideo, 
    toggleScreenShare: handleToggleScreenShare 
  } = useMedia(socket);
  
  // Initialize media on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeMedia();
        await joinRoom(roomId, userName, roomPassword);
      } catch (error) {
        console.error('Failed to initialize:', error);
        alert('Failed to access camera/microphone or join room');
        router.push('/');
      }
    };
    
    init();
    
    return () => {
      leaveRoom();
    };
  }, [roomId, userName, roomPassword]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      alert(error);
      if (error.includes('Room not found') || error.includes('Invalid password')) {
        router.push('/');
      }
    }
  }, [error, router]);
  
  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/');
  };
  
  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      alert('Room ID copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy room ID:', error);
    }
  };
  
  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };
  
  const currentUser = users.find(user => user.name === userName);
  const otherUsers = users.filter(user => user.name !== userName);
  
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Connecting...</h2>
          <p>Please wait while we connect you to the room.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <Header
        roomId={roomId}
        participantCount={users.length}
        connectionQuality={connectionStatus === 'connected' ? 'good' : 'poor'}
        onCopyRoomId={handleCopyRoomId}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Video Grid */}
        <div className="flex-1">
          <VideoGrid
            localStream={localStream}
            screenStream={screenStream}
            isScreenSharing={isScreenSharing}
            remoteStreams={remoteStreams}
            users={otherUsers}
            localUser={currentUser}
            isLocalAudioEnabled={isAudioEnabled}
            isLocalVideoEnabled={isVideoEnabled}
          />
        </div>
        
        {/* Chat Panel */}
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
          isOpen={isChatOpen}
        />
        
        {/* Participants Panel */}
        <ParticipantsPanel
          participants={users}
          currentUserId={currentUser?.id}
          onClose={() => setIsParticipantsOpen(false)}
          isOpen={isParticipantsOpen}
        />
      </div>
      
      {/* Control Panel */}
      <ControlPanel
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isScreenSharing={isScreenSharing}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onLeaveRoom={handleLeaveRoom}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onToggleParticipants={() => setIsParticipantsOpen(!isParticipantsOpen)}
      />
    </div>
  );
}