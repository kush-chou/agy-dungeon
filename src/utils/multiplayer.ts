import Peer, { DataConnection } from 'peerjs';
import { LogEntry, Player, Room } from '../types/game';

export type NetworkMessageType =
  | 'PLAYER_JOIN'
  | 'PLAYER_UPDATE'
  | 'LOG_SYNC'
  | 'DICE_EVENT'
  | 'ROOM_CHANGE'
  | 'CHAT_MESSAGE'
  | 'STATE_SYNC'
  | 'PING';

export interface NetworkMessage {
  type: NetworkMessageType;
  senderId: string;
  senderName: string;
  payload: any;
  timestamp: string;
}

export type NetworkEventHandler = (message: NetworkMessage) => void;

class MultiplayerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private isHost: boolean = false;
  private currentRoomCode: string = '';
  private handlers: Set<NetworkEventHandler> = new Set();
  private statusChangeHandlers: Set<(status: string, peerCount: number) => void> = new Set();
  private localPlayerId: string = '';

  constructor() {
    this.localPlayerId = 'p_' + Math.random().toString(36).substring(2, 8);
  }

  public getPlayerId(): string {
    return this.localPlayerId;
  }

  public getRoomCode(): string {
    return this.currentRoomCode;
  }

  public getIsHost(): boolean {
    return this.isHost;
  }

  public getPeerCount(): number {
    return this.connections.size;
  }

  public onMessage(handler: NetworkEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  public onStatusChange(handler: (status: string, peerCount: number) => void): () => void {
    this.statusChangeHandlers.add(handler);
    return () => this.statusChangeHandlers.delete(handler);
  }

  private notifyStatus(status: string) {
    this.statusChangeHandlers.forEach((h) => h(status, this.connections.size));
  }

  private notifyMessage(msg: NetworkMessage) {
    this.handlers.forEach((h) => h(msg));
  }

  // Initialize as Host with a room code (e.g., JEV4 or custom)
  public async hostRoom(customCode?: string): Promise<string> {
    this.cleanup();
    this.isHost = true;
    const roomCode = (customCode || 'jev-' + Math.random().toString(36).substring(2, 6)).toLowerCase();
    this.currentRoomCode = roomCode;

    return new Promise((resolve, reject) => {
      try {
        const peerId = `agyd-${roomCode}`;
        this.peer = new Peer(peerId, {
          debug: 1,
        });

        this.peer.on('open', () => {
          this.notifyStatus('Hosting room');
          resolve(roomCode);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS Host Error:', err);
          // If ID taken, generate random suffix
          if (err.type === 'unavailable-id') {
            const fallbackCode = 'jev-' + Math.floor(1000 + Math.random() * 9000);
            this.hostRoom(fallbackCode).then(resolve).catch(reject);
          } else {
            this.notifyStatus('Connection error: ' + err.type);
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Join an existing room code
  public async joinRoom(roomCode: string, player: Player): Promise<boolean> {
    this.cleanup();
    this.isHost = false;
    const cleanCode = roomCode.toLowerCase().trim().replace(/^agyd-/, '');
    this.currentRoomCode = cleanCode;

    return new Promise((resolve) => {
      try {
        this.peer = new Peer(undefined as any, {
          debug: 1,
        });

        this.peer.on('open', () => {
          const targetHostId = `agyd-${cleanCode}`;
          this.notifyStatus(`Connecting to ${cleanCode}...`);
          const conn = this.peer!.connect(targetHostId, {
            metadata: {
              player,
            },
          });

          conn.on('open', () => {
            this.setupConnection(conn);
            this.notifyStatus(`Connected to party ${cleanCode}`);
            // Send greeting
            this.send({
              type: 'PLAYER_JOIN',
              senderId: this.localPlayerId,
              senderName: player.name,
              payload: player,
              timestamp: new Date().toLocaleTimeString(),
            });
            resolve(true);
          });

          conn.on('error', (err) => {
            console.warn('Connection failed:', err);
            this.notifyStatus('Failed to connect to host');
            resolve(false);
          });
        });

        this.peer.on('error', (err) => {
          console.warn('Peer error:', err);
          this.notifyStatus('Network error: ' + err.type);
          resolve(false);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);
    this.notifyStatus('Active');

    conn.on('data', (data) => {
      try {
        const msg = data as NetworkMessage;
        this.notifyMessage(msg);

        // If host, forward message to all other connected peers (mesh broadcast)
        if (this.isHost) {
          this.connections.forEach((otherConn, peerId) => {
            if (peerId !== conn.peer && otherConn.open) {
              otherConn.send(msg);
            }
          });
        }
      } catch (err) {
        console.error('Error handling peer message:', err);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.notifyStatus('Peer disconnected');
    });

    conn.on('error', (err) => {
      console.warn('Connection error on peer:', conn.peer, err);
      this.connections.delete(conn.peer);
    });
  }

  // Broadcast message to all connected peers
  public send(msg: NetworkMessage) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  // Helper broadcast methods
  public broadcastLog(log: LogEntry, senderName: string) {
    this.send({
      type: 'LOG_SYNC',
      senderId: this.localPlayerId,
      senderName,
      payload: log,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  public broadcastDiceRoll(outcome: any, rollValue: number, senderName: string) {
    this.send({
      type: 'DICE_EVENT',
      senderId: this.localPlayerId,
      senderName,
      payload: { outcome, rollValue },
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  public broadcastChat(text: string, senderName: string) {
    this.send({
      type: 'CHAT_MESSAGE',
      senderId: this.localPlayerId,
      senderName,
      payload: { text },
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  public broadcastRoomChange(room: Room, senderName: string) {
    this.send({
      type: 'ROOM_CHANGE',
      senderId: this.localPlayerId,
      senderName,
      payload: room,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  public broadcastPlayerState(player: Player) {
    this.send({
      type: 'PLAYER_UPDATE',
      senderId: this.localPlayerId,
      senderName: player.name,
      payload: player,
      timestamp: new Date().toLocaleTimeString(),
    });
  }

  public cleanup() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.notifyStatus('Standalone session');
  }
}

export const multiplayer = new MultiplayerManager();
