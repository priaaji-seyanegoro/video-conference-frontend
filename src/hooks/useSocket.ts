import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { socketManager } from "@/utils/socket";
import { useRoomStore } from "@/store/roomStore";
import { User, Message } from "@/types";

export const useSocket = () => {
  const socketRef = useRef<typeof Socket | null>(null);
  const {
    setConnected,
    setUsers,
    addUser,
    removeUser,
    updateUser,
    addMessage,
    setError,
  } = useRoomStore();

  useEffect(() => {
    // Connect to socket
    socketRef.current = socketManager.connect();
    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setError("Failed to connect to server");
      setConnected(false);
    });

    // Room events
    socket.on("room-users", (users: User[]) => {
      setUsers(users);
    });

    socket.on("user-joined", (user: User) => {
      addUser(user);
    });

    socket.on("user-left", (userId: string) => {
      removeUser(userId);
    });

    socket.on("user-media-updated", ({ userId, mediaState }) => {
      updateUser(userId, mediaState);
    });

    // Chat events
    socket.on("new-message", (message: Message) => {
      addMessage(message);
    });

    // Error events
    socket.on("error", (error: { message: string }) => {
      setError(error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("user-media-updated");
      socket.off("new-message");
      socket.off("error");
      socketManager.disconnect();
    };
  }, []);

  const joinRoom = (roomId: string, userName: string, password?: string) => {
    if (socketRef.current) {
      socketRef.current.emit("join-room", { roomId, userName, password });
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room");
    }
  };

  const sendMessage = (
    content: string,
    type: "text" | "file" | "emoji" = "text"
  ) => {
    if (socketRef.current) {
      socketRef.current.emit("send-message", { content, type });
    }
  };

  const toggleAudio = (enabled: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit("toggle-audio", { enabled });
    }
  };

  const toggleVideo = (enabled: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit("toggle-video", { enabled });
    }
  };

  const toggleScreenShare = (enabled: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit("toggle-screen-share", { enabled });
    }
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
};
