import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import { cn } from '@/utils/cn';
import { User } from '@/types';

interface VideoGridProps {
  localStream?: MediaStream;
  remoteStreams: Map<string, MediaStream>;
  users: User[];
  localUser?: User;
  className?: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  users,
  localUser,
  className
}) => {
  const totalUsers = (localStream ? 1 : 0) + users.length;

  // Layout khusus untuk satu peserta agar video tidak fullscreen
  if (totalUsers === 1) {
    return (
      <div className={cn('flex items-center justify-center h-full p-4', className)}>
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl">
          {localStream && (
            <VideoPlayer
              key={localUser?.id || 'local-user'}
              stream={localStream}
              isLocal={true}
              isMuted={!(localUser?.isAudioEnabled ?? true)}
              isVideoEnabled={localUser?.isVideoEnabled ?? true}
              userName={localUser?.name || 'You'}
            />
          )}
        </div>
      </div>
    );
  }

  // Tata letak grid untuk banyak peserta
  const getGridCols = (count: number) => {
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  const getGridRows = (count: number) => {
    if (count <= 2) return 'grid-rows-1';
    if (count <= 4) return 'grid-rows-2';
    if (count <= 9) return 'grid-rows-3';
    return 'grid-rows-4';
  };

  return (
    <div className={cn(
      'grid gap-2 p-4 h-full',
      getGridCols(totalUsers),
      getGridRows(totalUsers),
      className
    )}>
      {/* Render video pengguna lokal */}
      {localStream && (
        <VideoPlayer
          key={localUser?.id || 'local-user'}
          stream={localStream}
          isLocal={true}
          isMuted={!(localUser?.isAudioEnabled ?? true)}
          isVideoEnabled={localUser?.isVideoEnabled ?? true}
          userName={localUser?.name || 'You'}
          className="min-h-[150px]"
        />
      )}
      
      {/* Render video pengguna remote */}
      {users.map((user) => {
        const stream = remoteStreams.get(user.id);
        return (
          <VideoPlayer
            key={user.id}
            stream={stream}
            isLocal={false}
            isMuted={!user.isAudioEnabled}
            isVideoEnabled={user.isVideoEnabled}
            userName={user.name}
            className="min-h-[150px]"
          />
        );
      })}
    </div>
  );
};