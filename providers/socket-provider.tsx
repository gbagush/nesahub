"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  on: (event: string, handler: (data: any) => void) => () => void;
  once: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken } = useAuth();

  const getFreshToken = async () => {
    try {
      const token = await getToken();
      return token;
    } catch (error) {
      console.error("Failed to refresh token", error);
      return null;
    }
  };

  const initializeSocket = async () => {
    const token = await getFreshToken();
    if (!token) {
      console.error("No token available for connection");
      return;
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_BASE_URI!, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      randomizationFactor: 0.5,
      transports: ["websocket"],
    });

    setSocket(newSocket);
    setIsConnected(newSocket.connected);

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", async (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);

      if (reason === "io server disconnect") {
        setTimeout(() => {
          newSocket.connect();
        }, 2000);
      }
    });

    newSocket.on("reconnect_attempt", async (attempt) => {
      console.log(`Reconnect attempt #${attempt}`);
      const freshToken = await getFreshToken();
      if (freshToken) {
        newSocket.auth = { token: freshToken };
      } else {
        console.warn("No fresh token available during reconnect");
      }
    });

    newSocket.on("reconnect", () => {
      console.log("Socket reconnected");
    });
  };

  useEffect(() => {
    let isMounted = true;

    const setupSocket = async () => {
      if (isMounted) {
        await initializeSocket();
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
      }
    };
  }, [getToken]);

  const on = (event: string, handler: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  };

  const once = (event: string, handler: (data: any) => void) => {
    if (!socket) return;
    socket.once(event, handler);
  };

  const off = (event: string, handler: (data: any) => void) => {
    if (!socket) return;
    socket.off(event, handler);
  };

  const emit = (event: string, data: any) => {
    if (!socket) return;
    socket.emit(event, data);
  };

  const value = {
    socket,
    isConnected,
    on,
    once,
    off,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
