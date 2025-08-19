import React from 'react';
import { Button } from './Button';
import { Copy, Users, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ConnectionQuality } from '@/types';

interface HeaderProps {
  roomId: string;
  participantCount: number;
  connectionQuality: ConnectionQuality;
  onCopyRoomId: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  participantCount,
  connectionQuality,
  onCopyRoomId,
  className
}) => {
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'poor':
        return <Wifi className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'poor': return 'Poor';
      case 'disconnected': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  return (
    <header className={cn('bg-gray-900 text-white p-4 flex items-center justify-between', className)}>
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">Video Conference</h1>
        
        <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg">
          <span className="text-sm text-gray-300">Room:</span>
          <span className="text-sm font-mono">{roomId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyRoomId}
            className="p-1 h-auto text-gray-400 hover:text-white"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Participant count */}
        <div className="flex items-center space-x-1 text-sm text-gray-300">
          <Users className="w-4 h-4" />
          <span>{participantCount}</span>
        </div>

        {/* Connection quality */}
        <div className="flex items-center space-x-1 text-sm">
          {getConnectionIcon()}
          <span className="text-gray-300">{getConnectionText()}</span>
        </div>
      </div>
    </header>
  );
};