import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5005";

export interface ScraperStatus {
  running: boolean;
  pid?: number;
  logCount: number;
}

export function useScraperSocket() {
  const [status, setStatus] = useState<ScraperStatus>({ running: false, logCount: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to scraper socket");
      socket.emit("admin:join");
    });

    socket.on("scraper:status", (newStatus: ScraperStatus) => {
      setStatus(newStatus);
    });

    socket.on("scraper:logs_init", (initialLogs: string[]) => {
      setLogs(initialLogs);
    });

    socket.on("scraper:log", (log: string) => {
      setLogs((prev) => {
        const newLogs = [...prev, log];
        if (newLogs.length > 200) return newLogs.slice(1);
        return newLogs;
      });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from scraper socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { status, logs };
}
