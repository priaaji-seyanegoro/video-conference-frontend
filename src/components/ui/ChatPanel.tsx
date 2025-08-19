import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Send, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Message } from '@/types';

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClose,
  isOpen,
  className
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      'fixed right-0 top-0 h-full w-80 bg-white shadow-lg z-50 flex flex-col',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-900">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 h-auto"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="font-medium">{message.userName}</span>
              <span>{formatTime(message.timestamp)}</span>
            </div>
            <div className="text-sm text-gray-900 bg-gray-100 rounded-lg p-2">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
            style={{
              color: '#111827',
              backgroundColor: '#ffffff'
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputValue.trim()}
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};