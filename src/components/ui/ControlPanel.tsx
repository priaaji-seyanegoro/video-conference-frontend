import React from 'react';
import { Button } from './Button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  Phone,
  MessageSquare,
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ControlPanelProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveRoom: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveRoom,
  onToggleChat,
  onToggleParticipants,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-4 p-4 bg-gray-800', className)}>
      {/* Audio Control */}
      <Button
        variant={isAudioEnabled ? 'secondary' : 'danger'}
        size="lg"
        onClick={onToggleAudio}
        className="rounded-full w-12 h-12 p-0"
      >
        {isAudioEnabled ? (
          <Mic className="w-5 h-5" />
        ) : (
          <MicOff className="w-5 h-5" />
        )}
      </Button>

      {/* Video Control */}
      <Button
        variant={isVideoEnabled ? 'secondary' : 'danger'}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-12 h-12 p-0"
      >
        {isVideoEnabled ? (
          <Video className="w-5 h-5" />
        ) : (
          <VideoOff className="w-5 h-5" />
        )}
      </Button>

      {/* Screen Share Control */}
      <Button
        variant={isScreenSharing ? 'primary' : 'secondary'}
        size="lg"
        onClick={onToggleScreenShare}
        className="rounded-full w-12 h-12 p-0"
      >
        {isScreenSharing ? (
          <MonitorOff className="w-5 h-5" />
        ) : (
          <Monitor className="w-5 h-5" />
        )}
      </Button>

      {/* Chat Toggle */}
      {onToggleChat && (
        <Button
          variant="ghost"
          size="lg"
          onClick={onToggleChat}
          className="rounded-full w-12 h-12 p-0 text-white hover:bg-gray-700"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      )}

      {/* Participants Toggle */}
      {onToggleParticipants && (
        <Button
          variant="ghost"
          size="lg"
          onClick={onToggleParticipants}
          className="rounded-full w-12 h-12 p-0 text-white hover:bg-gray-700"
        >
          <Users className="w-5 h-5" />
        </Button>
      )}

      {/* Settings */}
      <Button
        variant="ghost"
        size="lg"
        className="rounded-full w-12 h-12 p-0 text-white hover:bg-gray-700"
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Leave Room */}
      <Button
        variant="danger"
        size="lg"
        onClick={onLeaveRoom}
        className="rounded-full w-12 h-12 p-0"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" />
      </Button>
    </div>
  );
};