import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoPlayerProps {
  stream?: MediaStream;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  userName?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  isLocal = false,
  isMuted = false,
  isVideoEnabled = true,
  userName = 'Unknown',
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      // Hanya perbarui srcObject jika stream-nya benar-benar baru
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
        setVideoError(false);
      }
      
      const playVideo = async () => {
        try {
          await videoElement.play();
        } catch (error: any) {
          // Permintaan play() yang dibatalkan adalah hal biasa dan dapat diabaikan.
          if (error.name === 'AbortError') {
            console.log('Pemutaran video diinterupsi. Ini normal.');
          } else {
            console.error('Error saat memutar video:', error);
            setVideoError(true);
          }
        }
      };
      
      playVideo();
      
      const handleError = () => {
        console.error('Video element error');
        setVideoError(true);
      };
      
      videoElement.addEventListener('error', handleError);
      
      return () => {
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [stream]);

  // Debug: Log stream info
  useEffect(() => {
    if (stream) {
      console.log('Stream received:', {
        id: stream.id,
        active: stream.active,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTrackEnabled: stream.getVideoTracks()[0]?.enabled
      });
    }
  }, [stream]);

  return (
    <div className={cn('relative bg-gray-900 rounded-lg overflow-hidden', className)}>
      {isVideoEnabled && stream && !videoError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={{ backgroundColor: '#1f2937' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm">{userName}</p>
            {videoError && (
              <p className="text-red-400 text-xs mt-1">Video error</p>
            )}
            {!isVideoEnabled && (
              <p className="text-gray-400 text-xs mt-1">Kamera mati</p>
            )}
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute bottom-2 left-2 flex space-x-1">
        {!isMuted ? (
          <div className="bg-green-500 p-1 rounded-full">
            <Mic className="w-3 h-3 text-white" />
          </div>
        ) : (
          <div className="bg-red-500 p-1 rounded-full">
            <MicOff className="w-3 h-3 text-white" />
          </div>
        )}
        
        {!isVideoEnabled && (
          <div className="bg-red-500 p-1 rounded-full">
            <VideoOff className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* User name */}
      <div className="absolute bottom-2 right-2">
        <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {userName} {isLocal && '(You)'}
        </span>
      </div>
    </div>
  );
};