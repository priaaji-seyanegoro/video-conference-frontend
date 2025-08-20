import React from "react";
import { VideoPlayer } from "./VideoPlayer";
import { cn } from "@/utils/cn";
import { User } from "@/types";

// Helper layout grid (statis agar aman untuk Tailwind)
const getGridCols = (count: number): string => {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  if (count <= 9) return "grid-cols-3";
  if (count <= 12) return "grid-cols-4";
  return "grid-cols-4";
};

const getGridRows = (count: number): string => {
  if (count <= 1) return "grid-rows-1";
  if (count === 2) return "grid-rows-1";
  if (count <= 4) return "grid-rows-2";
  if (count <= 6) return "grid-rows-2";
  if (count <= 9) return "grid-rows-3";
  if (count <= 12) return "grid-rows-3";
  return "grid-rows-4";
};

interface VideoGridProps {
  localStream?: MediaStream;
  screenStream?: MediaStream;
  isScreenSharing: boolean;
  remoteStreams: Map<string, MediaStream>;
  users: User[];
  localUser?: User;
  className?: string;
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  screenStream,
  isScreenSharing,
  remoteStreams,
  users,
  localUser,
  className,
  isLocalAudioEnabled,
  isLocalVideoEnabled,
}) => {
  const totalUsers = users.length + (localStream || screenStream ? 1 : 0);

  if (isScreenSharing) {
    return (
      <div className={cn("h-full w-full p-4 flex", className)}>
        {/* Main screen share view */}
        <div className="flex-1 relative">
          <VideoPlayer
            stream={screenStream}
            isLocal={true}
            isScreenShare={true}
            userName="Your Screen"
            className="w-full h-full"
          />
        </div>

        {/* Sidebar for other videos */}
        <div className="w-48 ml-4 flex flex-col space-y-4">
          {/* Local camera view (PiP) */}
          {localStream && (
            <VideoPlayer
              stream={localStream}
              isLocal={true}
              isMuted={!isLocalAudioEnabled}
              isVideoEnabled={isLocalVideoEnabled}
              userName={localUser?.name || "You"}
              className="w-full aspect-video"
            />
          )}

          {/* Remote users */}
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
                className="w-full aspect-video"
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Layout khusus untuk satu peserta agar video tidak fullscreen
  if (totalUsers === 1 && localStream) {
    return (
      <div
        className={cn("flex items-center justify-center h-full p-4", className)}
      >
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl">
          {localStream && (
            <VideoPlayer
              key={localUser?.id || "local-user"}
              stream={localStream}
              isLocal={true}
              isMuted={!isLocalAudioEnabled}
              isVideoEnabled={isLocalVideoEnabled}
              userName={localUser?.name || "You"}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2 p-4 h-full",
        getGridCols(totalUsers),
        getGridRows(totalUsers),
        className
      )}
    >
      {/* Render video pengguna lokal */}
      {localStream && (
        <VideoPlayer
          key={localUser?.id || "local-user"}
          stream={localStream}
          isLocal={true}
          isMuted={!isLocalAudioEnabled}
          isVideoEnabled={isLocalVideoEnabled}
          userName={localUser?.name || "You"}
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
