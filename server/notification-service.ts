import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

// Типы событий обновления
export enum UpdateEventType {
  SUBJECT = 'subject',
  HOMEWORK = 'homework',
  ANNOUNCEMENT = 'announcement',
  MATERIAL = 'material',
  CALENDAR_EVENT = 'calendar_event',
}

// Интерфейс сообщения обновления
export interface UpdateMessage {
  type: UpdateEventType;
  action: 'create' | 'update' | 'delete';
  data?: any;
}

// Класс сервиса уведомлений
class NotificationService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  // Инициализация WebSocket сервера
  public initialize(server: Server) {
    log('Initializing notification service', 'websocket');
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      log('Client connected to notification service', 'websocket');
      this.clients.add(ws);

      // Отправляем сообщение о подключении
      ws.send(JSON.stringify({ type: 'connection', message: 'Connected to update service' }));

      // Обработка закрытия соединения
      ws.on('close', () => {
        log('Client disconnected from notification service', 'websocket');
        this.clients.delete(ws);
      });

      // Обработка ошибок
      ws.on('error', (error) => {
        log(`WebSocket Error: ${error}`, 'websocket');
      });
    });

    log('Notification service initialized', 'websocket');
  }

  // Отправка обновления всем подключенным клиентам
  public broadcast(message: UpdateMessage) {
    if (!this.wss) {
      log('Notification service not initialized', 'websocket');
      return;
    }

    log(`Broadcasting update: ${JSON.stringify(message)}`, 'websocket');
    const messageString = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }
}

// Создаем экземпляр сервиса
export const notificationService = new NotificationService();