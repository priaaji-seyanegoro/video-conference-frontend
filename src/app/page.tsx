'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Video, Users, Shield } from 'lucide-react';

export default function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    const newRoomId = generateRoomId();
    const params = new URLSearchParams({
      name: userName,
      ...(roomPassword && { password: roomPassword })
    });
    
    router.push(`/room/${newRoomId}?${params.toString()}`);
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    if (!roomId.trim()) {
      alert('Please enter room ID');
      return;
    }
    
    const params = new URLSearchParams({
      name: userName,
      ...(roomPassword && { password: roomPassword })
    });
    
    router.push(`/room/${roomId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Video Conference</h1>
          <p className="mt-2 text-gray-600">Connect with anyone, anywhere</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* User Name */}
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              style={{
                color: '#111827',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Room ID (for joining) */}
          {!isCreating && (
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID to join"
                className="input-field"
                style={{
                  color: '#111827',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
          )}

          {/* Room Password (optional) */}
          <div>
            <label htmlFor="roomPassword" className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Room Password (Optional)</span>
              </div>
            </label>
            <input
              id="roomPassword"
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Enter password for private room"
              className="input-field"
              style={{
                color: '#111827',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isCreating ? (
              <>
                <Button
                  onClick={handleCreateRoom}
                  className="w-full"
                  size="lg"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
                <Button
                  onClick={() => setIsCreating(false)}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  Join Existing Room
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleJoinRoom}
                  className="w-full"
                  size="lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  Create New Room
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="text-center text-sm text-gray-600">
          <p>✓ HD Video & Audio</p>
          <p>✓ Screen Sharing</p>
          <p>✓ Real-time Chat</p>
          <p>✓ Secure & Private</p>
        </div>
      </div>
    </div>
  );
}
