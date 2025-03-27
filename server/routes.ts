import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { getScheduleForGroup } from "./schedule-parser";
import { z } from "zod";
import { 
  insertSubjectSchema, 
  insertMaterialSchema, 
  insertHomeworkSchema,
  insertAnnouncementSchema,
  insertCalendarEventSchema
} from "@shared/schema";
import { notificationService, UpdateEventType } from "./notification-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const { isAuthenticated, isAdmin } = setupAuth(app);

  // API routes
  // Get subjects
  app.get("/api/subjects", isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Ошибка при получении предметов" });
    }
  });

  // Get a single subject
  app.get("/api/subjects/:id", isAuthenticated, async (req, res) => {
    try {
      const subject = await storage.getSubject(Number(req.params.id));
      if (!subject) {
        return res.status(404).json({ message: "Предмет не найден" });
      }
      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Ошибка при получении предмета" });
    }
  });

  // Create subject (admin only)
  app.post("/api/subjects", isAdmin, async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      
      // Отправляем уведомление о создании предмета
      notificationService.broadcast({
        type: UpdateEventType.SUBJECT,
        action: 'create',
        data: subject
      });
      
      res.status(201).json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error creating subject:", error);
      res.status(500).json({ message: "Ошибка при создании предмета" });
    }
  });

  // Update subject (admin only)
  app.put("/api/subjects/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const subjectData = insertSubjectSchema.partial().parse(req.body);
      const subject = await storage.updateSubject(id, subjectData);
      
      if (!subject) {
        return res.status(404).json({ message: "Предмет не найден" });
      }
      
      res.json(subject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error updating subject:", error);
      res.status(500).json({ message: "Ошибка при обновлении предмета" });
    }
  });

  // Delete subject (admin only)
  app.delete("/api/subjects/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteSubject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Предмет не найден" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ message: "Ошибка при удалении предмета" });
    }
  });

  // Get materials for a subject
  app.get("/api/subjects/:id/materials", isAuthenticated, async (req, res) => {
    try {
      const subjectId = Number(req.params.id);
      const materials = await storage.getMaterialsBySubject(subjectId);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ message: "Ошибка при получении материалов" });
    }
  });

  // Create material (admin only)
  app.post("/api/materials", isAdmin, async (req, res) => {
    try {
      const materialData = insertMaterialSchema.parse(req.body);
      const material = await storage.createMaterial(materialData);
      
      // Отправляем уведомление о создании материала
      notificationService.broadcast({
        type: UpdateEventType.MATERIAL,
        action: 'create',
        data: material
      });
      
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error creating material:", error);
      res.status(500).json({ message: "Ошибка при создании материала" });
    }
  });

  // Update material (admin only)
  app.put("/api/materials/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const materialData = insertMaterialSchema.partial().parse(req.body);
      const material = await storage.updateMaterial(id, materialData);
      
      if (!material) {
        return res.status(404).json({ message: "Материал не найден" });
      }
      
      res.json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error updating material:", error);
      res.status(500).json({ message: "Ошибка при обновлении материала" });
    }
  });

  // Delete material (admin only)
  app.delete("/api/materials/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteMaterial(id);
      
      if (!success) {
        return res.status(404).json({ message: "Материал не найден" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting material:", error);
      res.status(500).json({ message: "Ошибка при удалении материала" });
    }
  });

  // Get all homeworks
  app.get("/api/homeworks", isAuthenticated, async (req, res) => {
    try {
      const homeworks = await storage.getAllHomeworks();
      
      // If subject filter is provided
      const subjectId = req.query.subjectId 
        ? Number(req.query.subjectId) 
        : undefined;
        
      if (subjectId) {
        const filteredHomeworks = homeworks.filter(hw => hw.subjectId === subjectId);
        return res.json(filteredHomeworks);
      }
      
      res.json(homeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      res.status(500).json({ message: "Ошибка при получении домашних заданий" });
    }
  });

  // Get homework by id
  app.get("/api/homeworks/:id", isAuthenticated, async (req, res) => {
    try {
      const homework = await storage.getHomework(Number(req.params.id));
      
      if (!homework) {
        return res.status(404).json({ message: "Домашнее задание не найдено" });
      }
      
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "Ошибка при получении домашнего задания" });
    }
  });

  // Create homework (admin only)
  app.post("/api/homeworks", isAdmin, async (req, res) => {
    try {
      const homeworkData = insertHomeworkSchema.parse(req.body);
      const homework = await storage.createHomework(homeworkData);
      
      // Отправляем уведомление о создании домашнего задания
      notificationService.broadcast({
        type: UpdateEventType.HOMEWORK,
        action: 'create',
        data: homework
      });
      
      res.status(201).json(homework);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error creating homework:", error);
      res.status(500).json({ message: "Ошибка при создании домашнего задания" });
    }
  });

  // Update homework (admin only)
  app.put("/api/homeworks/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const homeworkData = insertHomeworkSchema.partial().parse(req.body);
      const homework = await storage.updateHomework(id, homeworkData);
      
      if (!homework) {
        return res.status(404).json({ message: "Домашнее задание не найдено" });
      }
      
      res.json(homework);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error updating homework:", error);
      res.status(500).json({ message: "Ошибка при обновлении домашнего задания" });
    }
  });

  // Delete homework (admin only)
  app.delete("/api/homeworks/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteHomework(id);
      
      if (!success) {
        return res.status(404).json({ message: "Домашнее задание не найдено" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting homework:", error);
      res.status(500).json({ message: "Ошибка при удалении домашнего задания" });
    }
  });

  // Get all announcements
  app.get("/api/announcements", isAuthenticated, async (req, res) => {
    try {
      const announcements = await storage.getAllAnnouncements();
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Ошибка при получении объявлений" });
    }
  });

  // Create announcement (admin only)
  app.post("/api/announcements", isAdmin, async (req, res) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(announcementData);
      
      // Отправляем уведомление о создании объявления
      notificationService.broadcast({
        type: UpdateEventType.ANNOUNCEMENT,
        action: 'create',
        data: announcement
      });
      
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Ошибка при создании объявления" });
    }
  });

  // Update announcement (admin only)
  app.put("/api/announcements/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const announcementData = insertAnnouncementSchema.partial().parse(req.body);
      const announcement = await storage.updateAnnouncement(id, announcementData);
      
      if (!announcement) {
        return res.status(404).json({ message: "Объявление не найдено" });
      }
      
      res.json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Ошибка при обновлении объявления" });
    }
  });

  // Delete announcement (admin only)
  app.delete("/api/announcements/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteAnnouncement(id);
      
      if (!success) {
        return res.status(404).json({ message: "Объявление не найдено" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Ошибка при удалении объявления" });
    }
  });

  // Get calendar events
  app.get("/api/calendar-events", isAuthenticated, async (req, res) => {
    try {
      // If subject filter is provided
      const subjectId = req.query.subjectId 
        ? Number(req.query.subjectId) 
        : undefined;
        
      if (subjectId) {
        const events = await storage.getCalendarEventsBySubject(subjectId);
        return res.json(events);
      }
      
      const events = await storage.getAllCalendarEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ message: "Ошибка при получении событий календаря" });
    }
  });

  // Get a single calendar event
  app.get("/api/calendar-events/:id", isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getCalendarEvent(Number(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Событие не найдено" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching calendar event:", error);
      res.status(500).json({ message: "Ошибка при получении события календаря" });
    }
  });

  // Create calendar event (admin only)
  app.post("/api/calendar-events", isAdmin, async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(eventData);
      
      // Отправляем уведомление о создании события календаря
      notificationService.broadcast({
        type: UpdateEventType.CALENDAR_EVENT,
        action: 'create',
        data: event
      });
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error creating calendar event:", error);
      res.status(500).json({ message: "Ошибка при создании события календаря" });
    }
  });

  // Update calendar event (admin only)
  app.put("/api/calendar-events/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const eventData = insertCalendarEventSchema.partial().parse(req.body);
      const event = await storage.updateCalendarEvent(id, eventData);
      
      if (!event) {
        return res.status(404).json({ message: "Событие не найдено" });
      }
      
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Неверные данные", errors: error.errors });
      }
      console.error("Error updating calendar event:", error);
      res.status(500).json({ message: "Ошибка при обновлении события календаря" });
    }
  });

  // Delete calendar event (admin only)
  app.delete("/api/calendar-events/:id", isAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteCalendarEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Событие не найдено" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      res.status(500).json({ message: "Ошибка при удалении события календаря" });
    }
  });

  // Get schedule
  app.get("/api/schedule/:groupId", isAuthenticated, async (req, res) => {
    try {
      const groupId = req.params.groupId;
      
      // Try to get from cache first
      const cachedSchedule = await storage.getScheduleCache(groupId);
      if (cachedSchedule) {
        return res.json(cachedSchedule);
      }
      
      // If not in cache, fetch from source
      const schedule = await getScheduleForGroup(groupId);
      
      // Cache the result
      await storage.cacheSchedule(groupId, schedule);
      
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Ошибка при получении расписания" });
    }
  });

  // Get upcoming events for dashboard
  app.get("/api/upcoming-events", isAuthenticated, async (req, res) => {
    try {
      const homeworks = await storage.getAllHomeworks();
      const calendarEvents = await storage.getAllCalendarEvents();
      const subjects = await storage.getAllSubjects();
      
      // Map subject IDs to names
      const subjectMap = new Map();
      subjects.forEach(subject => {
        subjectMap.set(subject.id, subject.name);
      });
      
      // Get upcoming events from homeworks
      const now = new Date();
      const upcomingHomeworks = homeworks
        .filter(hw => new Date(hw.dueDate) >= now)
        .map(hw => ({
          id: hw.id,
          type: 'homework',
          date: hw.dueDate.toISOString().split('T')[0],
          timestamp: new Date(hw.dueDate).getTime(),
          title: hw.title,
          subjectName: subjectMap.get(hw.subjectId) || "Неизвестный предмет",
          subjectId: hw.subjectId,
          color: subjects.find(s => s.id === hw.subjectId)?.color || "#9E9E9E"
        }));
      
      // Get upcoming events from calendar
      const upcomingCalendarEvents = calendarEvents
        .filter(ev => new Date(ev.startDate) >= now)
        .map(ev => ({
          id: ev.id,
          type: 'calendar',
          date: ev.startDate.toISOString().split('T')[0],
          timestamp: new Date(ev.startDate).getTime(),
          title: ev.title,
          subjectName: ev.subjectId ? (subjectMap.get(ev.subjectId) || "Неизвестный предмет") : "Общее событие",
          subjectId: ev.subjectId || null,
          color: ev.color || "#E30611"
        }));
      
      // Combine, sort and limit
      const allEvents = [...upcomingHomeworks, ...upcomingCalendarEvents]
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, 10); // Limit to 10 upcoming events
      
      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Ошибка при получении предстоящих событий" });
    }
  });

  const httpServer = createServer(app);
  
  // Инициализируем WebSocket сервис
  notificationService.initialize(httpServer);
  
  return httpServer;
}
