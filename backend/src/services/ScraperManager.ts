import { spawn, ChildProcess } from "child_process";
import path from "path";
import { Server } from "socket.io";
import { logger } from "../utils/logger";

class ScraperManager {
  private scraperProcess: ChildProcess | null = null;
  private io: Server | null = null;
  private logs: string[] = [];
  private readonly MAX_LOGS = 200;

  constructor() {}

  public setIo(io: Server) {
    this.io = io;
  }

  public getStatus() {
    return {
      running: this.scraperProcess !== null,
      pid: this.scraperProcess?.pid,
      logCount: this.logs.length,
    };
  }

  public async start(): Promise<boolean> {
    if (this.scraperProcess) {
      logger.warn("Scraper is already running.");
      return false;
    }

    const scraperDir = path.resolve(process.cwd(), "..");
    const pythonPath = path.join(scraperDir, "scraper", "venv", "bin", "python");
    const scriptPath = path.join(scraperDir, "scraper", "scrapers", "dynamic_browser_scraper.py");

    logger.info(`Starting scraper: ${pythonPath} ${scriptPath} --continuous`);

    try {
      this.scraperProcess = spawn(pythonPath, [scriptPath, "--continuous"], {
        cwd: path.join(scraperDir, "scraper"),
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });

      this.scraperProcess.stdout?.on("data", (data) => {
        const chunk = data.toString();
        const lines = chunk.split("\n");
        lines.forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed) {
            this.addLog(trimmed);
          }
        });
      });

      this.scraperProcess.stderr?.on("data", (data) => {
        const chunk = data.toString();
        const lines = chunk.split("\n");
        lines.forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed) {
            // Check if it's an actual python traceback or just a warning
            if (trimmed.includes("Traceback") || trimmed.includes("Error:")) {
              this.addLog(`[ERROR] ${trimmed}`);
            } else {
              // Likely a warning or environment noise, still prefix with warning for clarity
              this.addLog(`[WARN] ${trimmed}`);
            }
          }
        });
      });

      this.scraperProcess.on("close", (code) => {
        logger.info(`Scraper process exited with code ${code}`);
        this.addLog(`[SYSTEM] Scraper process exited with code ${code}`);
        this.scraperProcess = null;
        this.emitStatus();
      });

      this.scraperProcess.on("error", (err) => {
        logger.error(`Scraper process error: ${err.message}`);
        this.addLog(`[SYSTEM] PROCESS ERROR: ${err.message}`);
        this.scraperProcess = null;
        this.emitStatus();
      });

      this.emitStatus();
      return true;
    } catch (error: any) {
      logger.error(`Failed to start scraper: ${error.message}`);
      return false;
    }
  }

  public stop(): boolean {
    if (!this.scraperProcess) {
      logger.warn("No scraper process to stop.");
      return false;
    }

    logger.info(`Stopping scraper (PID: ${this.scraperProcess.pid})...`);
    this.addLog(`[SYSTEM] Sending stop signal to scraper...`);
    
    // Send SIGINT (Ctrl+C) for graceful shutdown
    const success = this.scraperProcess.kill("SIGINT");
    
    // Fallback force kill after 5 seconds if still running
    setTimeout(() => {
      if (this.scraperProcess) {
        logger.warn("Scraper didn't stop gracefully, forcing kill.");
        this.scraperProcess.kill("SIGKILL");
        this.scraperProcess = null;
        this.emitStatus();
      }
    }, 5000);

    return success;
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedLog = `[${timestamp}] ${message}`;
    this.logs.push(formattedLog);
    
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    if (this.io) {
      this.io.to("admin_logs").emit("scraper:log", formattedLog);
    }
  }

  private emitStatus() {
    if (this.io) {
      this.io.to("admin_logs").emit("scraper:status", this.getStatus());
    }
  }

  public getRecentLogs() {
    return this.logs;
  }
}

export const scraperManager = new ScraperManager();
