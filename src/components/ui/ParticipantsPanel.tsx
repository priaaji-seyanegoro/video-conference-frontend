import React from 'react';
import { Button } from './Button';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { User } from '@/types';

interface ParticipantsPanelProps {
  participants: User[];
  currentUserId?: string;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserId,
  onClose,
  isOpen,
  className
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">
          Participants ({participants.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        {participants.map((participant) => {
          const isCurrentUser = participant.id === currentUserId;
          
          return (
            <div
              key={participant.id}
              className="flex items-center justify-between p-4 border-b hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {participant.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Name and status */}
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-900">
                      {participant.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs text-gray-500">(You)</span>
                    )}
                    {participant.isHost && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Media status */}
              <div className="flex items-center space-x-1">
                {participant.isAudioEnabled ? (
                  <Mic className="w-4 h-4 text-green-500" />
                ) : (
                  <MicOff className="w-4 h-4 text-red-500" />
                )}
                
                {participant.isVideoEnabled ? (
                  <Video className="w-4 h-4 text-green-500" />
                ) : (
                  <VideoOff className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};