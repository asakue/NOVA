import { useEffect, useState } from 'react';
import { queryClient } from '@/lib/queryClient';

// Типы событий обновления (должны совпадать с серверными)
export enum UpdateEventType {
  SUBJECT = 'subject',
  HOMEWORK = 'homework',
  ANNOUNCEMENT = 'announcement',
  MATERIAL = 'material',
  CALENDAR_EVENT = 'calendar_event',
}

// Тип действия
type UpdateAction = 'create' | 'update' | 'delete';

// Интерфейс сообщения обновления
interface UpdateMessage {
  type: UpdateEventType;
  action: UpdateAction;
  data?: any;
}

// Карта соответствия типов событий -> ключи запросов
const queryKeyMap: Record<UpdateEventType, string[]> = {
  [UpdateEventType.SUBJECT]: ['/api/subjects'],
  [UpdateEventType.HOMEWORK]: ['/api/homeworks'],
  [UpdateEventType.ANNOUNCEMENT]: ['/api/announcements'],
  [UpdateEventType.MATERIAL]: ['/api/materials'],
  [UpdateEventType.CALENDAR_EVENT]: ['/api/calendar-events'],
};

// Хук для соединения с WebSocket и получения обновлений в реальном времени
export function useRealtimeUpdates() {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Создаем WebSocket соединение
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    // Обработчик событий открытия соединения
    socket.onopen = () => {
      console.log('WebSocket соединение установлено');
      setConnected(true);
      setError(null);
    };

    // Обработчик событий получения сообщений
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as UpdateMessage;
        
        // Пропускаем сообщения не связанные с обновлениями
        if (!message.type || !message.action) {
          return;
        }

        console.log(`Получено обновление: ${message.type}, действие: ${message.action}`);
        
        // Получаем ключи запросов для инвалидации
        const queryKeys = queryKeyMap[message.type] || [];
        
        // Инвалидируем запросы для обновления данных
        for (const key of queryKeys) {
          queryClient.invalidateQueries({ queryKey: [key] });
        }
        
        // Инвалидируем предстоящие события, так как они могут включать различные типы
        if (message.type === UpdateEventType.HOMEWORK || message.type === UpdateEventType.CALENDAR_EVENT) {
          queryClient.invalidateQueries({ queryKey: ['/api/upcoming-events'] });
        }
      } catch (err) {
        console.error('Ошибка при обработке сообщения WebSocket:', err);
      }
    };

    // Обработчик событий закрытия соединения
    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket соединение закрыто, код: ${event.code}, причина: ${event.reason}`);
      } else {
        console.error('WebSocket соединение прервано');
        setError('Соединение потеряно');
      }
      setConnected(false);
    };

    // Обработчик ошибок
    socket.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setError('Ошибка соединения');
    };

    // Очистка при размонтировании компонента
    return () => {
      socket.close();
    };
  }, []);

  return { connected, error };
}