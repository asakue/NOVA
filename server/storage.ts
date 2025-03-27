import { users, subjects, materials, homeworks, announcements, calendarEvents } from "@shared/schema";
import type { 
  User, InsertUser, 
  Subject, InsertSubject, 
  Material, InsertMaterial,
  Homework, InsertHomework,
  Announcement, InsertAnnouncement,
  CalendarEvent, InsertCalendarEvent
} from "@shared/schema";
import { DaySchedule, WeekSchedule } from "@shared/types";
import session from "express-session";
import crypto from "crypto";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Simple encryption
function encrypt(text: string): string {
  // Simple encryption using a fixed key (for educational purposes only)
  const algorithm = 'aes-256-ctr';
  // Create a key that's exactly 32 bytes (256 bits) for AES-256
  const secretKey = crypto.createHash('sha256').update('donstu-vis-secret-key').digest();
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  
  return `${iv.toString('hex')}.${encrypted.toString('hex')}`;
}

function decrypt(hash: string): string {
  // Simple decryption using a fixed key (for educational purposes only)
  const algorithm = 'aes-256-ctr';
  // Use the same key generation as in encrypt
  const secretKey = crypto.createHash('sha256').update('donstu-vis-secret-key').digest();
  
  const [ivHex, encryptedHex] = hash.split('.');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  
  return decrypted.toString();
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subject methods
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: number): Promise<boolean>;
  
  // Material methods
  getMaterialsBySubject(subjectId: number): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined>;
  deleteMaterial(id: number): Promise<boolean>;
  
  // Homework methods
  getAllHomeworks(): Promise<Homework[]>;
  getHomeworksBySubject(subjectId: number): Promise<Homework[]>;
  getHomework(id: number): Promise<Homework | undefined>;
  createHomework(homework: InsertHomework): Promise<Homework>;
  updateHomework(id: number, homework: Partial<InsertHomework>): Promise<Homework | undefined>;
  deleteHomework(id: number): Promise<boolean>;
  
  // Announcement methods
  getAllAnnouncements(): Promise<Announcement[]>;
  getAnnouncement(id: number): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  
  // Calendar events methods
  getAllCalendarEvents(): Promise<CalendarEvent[]>;
  getCalendarEventsBySubject(subjectId: number): Promise<CalendarEvent[]>;
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;
  
  // Schedule cache
  cacheSchedule(groupId: string, weekSchedule: WeekSchedule): Promise<void>;
  getScheduleCache(groupId: string): Promise<WeekSchedule | undefined>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private subjectsMap: Map<number, Subject>;
  private materialsMap: Map<number, Material>;
  private homeworksMap: Map<number, Homework>;
  private announcementsMap: Map<number, Announcement>;
  private calendarEventsMap: Map<number, CalendarEvent>;
  private scheduleCache: Map<string, { data: WeekSchedule, timestamp: number }>;
  
  currentUserId: number;
  currentSubjectId: number;
  currentMaterialId: number;
  currentHomeworkId: number;
  currentAnnouncementId: number;
  currentCalendarEventId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.usersMap = new Map();
    this.subjectsMap = new Map();
    this.materialsMap = new Map();
    this.homeworksMap = new Map();
    this.announcementsMap = new Map();
    this.calendarEventsMap = new Map();
    this.scheduleCache = new Map();
    
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentMaterialId = 1;
    this.currentHomeworkId = 1;
    this.currentAnnouncementId = 1;
    this.currentCalendarEventId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default users
    this.createUser({
      username: "admin",
      password: encrypt("adm"),
      role: "admin"
    });
    
    this.createUser({
      username: "student",
      password: encrypt("stud"),
      role: "student"
    });
    
    // Create some initial data (subjects and announcements)
    this.initializeDefaultData();
  }
  
  // Helper method to initialize default data (only users, no content data)
  private initializeDefaultData() {
    // No default subjects, announcements, homeworks or calendar events
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  // Subject methods
  async getAllSubjects(): Promise<Subject[]> {
    return Array.from(this.subjectsMap.values());
  }
  
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjectsMap.get(id);
  }
  
  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    // Ensure all required fields are set with default values if not provided
    const newSubject: Subject = {
      id,
      name: subject.name,
      teacher: subject.teacher,
      description: subject.description || null,
      color: subject.color || "#9E9E9E" // Default gray if color is not provided
    };
    this.subjectsMap.set(id, newSubject);
    return newSubject;
  }
  
  async updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject | undefined> {
    const existingSubject = this.subjectsMap.get(id);
    if (!existingSubject) return undefined;
    
    const updatedSubject = { ...existingSubject, ...subject };
    this.subjectsMap.set(id, updatedSubject);
    return updatedSubject;
  }
  
  async deleteSubject(id: number): Promise<boolean> {
    return this.subjectsMap.delete(id);
  }
  
  // Material methods
  async getMaterialsBySubject(subjectId: number): Promise<Material[]> {
    return Array.from(this.materialsMap.values()).filter(
      (material) => material.subjectId === subjectId
    );
  }
  
  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materialsMap.get(id);
  }
  
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const id = this.currentMaterialId++;
    
    // Преобразование createdAt из строки в объект Date, если нужно
    const createdAt = material.createdAt 
      ? (typeof material.createdAt === 'string' 
        ? new Date(material.createdAt) 
        : material.createdAt) 
      : new Date();
      
    const newMaterial: Material = {
      id,
      type: material.type,
      subjectId: material.subjectId,
      title: material.title,
      content: material.content,
      fileUrl: material.fileUrl || null,
      fileName: material.fileName || null,
      fileSize: material.fileSize || null,
      fileType: material.fileType || null,
      createdAt
    };
    this.materialsMap.set(id, newMaterial);
    return newMaterial;
  }
  
  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material | undefined> {
    const existingMaterial = this.materialsMap.get(id);
    if (!existingMaterial) return undefined;
    
    // Обработка преобразования даты, если она присутствует
    let updatedData = { ...material };
    
    if (material.createdAt) {
      updatedData.createdAt = typeof material.createdAt === 'string'
        ? new Date(material.createdAt)
        : material.createdAt;
    }
    
    const updatedMaterial = { ...existingMaterial, ...updatedData };
    this.materialsMap.set(id, updatedMaterial);
    return updatedMaterial;
  }
  
  async deleteMaterial(id: number): Promise<boolean> {
    return this.materialsMap.delete(id);
  }
  
  // Homework methods
  async getAllHomeworks(): Promise<Homework[]> {
    return Array.from(this.homeworksMap.values());
  }
  
  async getHomeworksBySubject(subjectId: number): Promise<Homework[]> {
    return Array.from(this.homeworksMap.values()).filter(
      (homework) => homework.subjectId === subjectId
    );
  }
  
  async getHomework(id: number): Promise<Homework | undefined> {
    return this.homeworksMap.get(id);
  }
  
  async createHomework(homework: InsertHomework): Promise<Homework> {
    const id = this.currentHomeworkId++;
    
    // Преобразование дат из строк в объекты Date, если нужно
    const dueDate = typeof homework.dueDate === 'string' 
      ? new Date(homework.dueDate) 
      : homework.dueDate;
      
    const assignedDate = homework.assignedDate 
      ? (typeof homework.assignedDate === 'string' 
        ? new Date(homework.assignedDate) 
        : homework.assignedDate) 
      : new Date();
    
    const newHomework: Homework = {
      id,
      subjectId: homework.subjectId,
      title: homework.title,
      description: homework.description,
      dueDate,
      assignedDate,
      attachments: homework.attachments || []
    };
    this.homeworksMap.set(id, newHomework);
    return newHomework;
  }
  
  async updateHomework(id: number, homework: Partial<InsertHomework>): Promise<Homework | undefined> {
    const existingHomework = this.homeworksMap.get(id);
    if (!existingHomework) return undefined;
    
    // Обработка преобразования дат, если они присутствуют
    let updatedData = { ...homework };
    
    if (homework.dueDate) {
      updatedData.dueDate = typeof homework.dueDate === 'string'
        ? new Date(homework.dueDate)
        : homework.dueDate;
    }
    
    if (homework.assignedDate) {
      updatedData.assignedDate = typeof homework.assignedDate === 'string'
        ? new Date(homework.assignedDate)
        : homework.assignedDate;
    }
    
    const updatedHomework = { ...existingHomework, ...updatedData };
    this.homeworksMap.set(id, updatedHomework);
    return updatedHomework;
  }
  
  async deleteHomework(id: number): Promise<boolean> {
    return this.homeworksMap.delete(id);
  }
  
  // Announcement methods
  async getAllAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcementsMap.values());
  }
  
  async getAnnouncement(id: number): Promise<Announcement | undefined> {
    return this.announcementsMap.get(id);
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    
    // Преобразование даты из строки в объект Date, если нужно
    const createdAt = announcement.createdAt 
      ? (typeof announcement.createdAt === 'string' 
        ? new Date(announcement.createdAt) 
        : announcement.createdAt) 
      : new Date();
    
    const newAnnouncement: Announcement = {
      id,
      title: announcement.title,
      content: announcement.content,
      createdAt,
      important: announcement.important || false
    };
    this.announcementsMap.set(id, newAnnouncement);
    return newAnnouncement;
  }
  
  async updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>): Promise<Announcement | undefined> {
    const existingAnnouncement = this.announcementsMap.get(id);
    if (!existingAnnouncement) return undefined;
    
    // Обработка преобразования даты, если она присутствует
    let updatedData = { ...announcement };
    
    if (announcement.createdAt) {
      updatedData.createdAt = typeof announcement.createdAt === 'string'
        ? new Date(announcement.createdAt)
        : announcement.createdAt;
    }
    
    const updatedAnnouncement = { ...existingAnnouncement, ...updatedData };
    this.announcementsMap.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcementsMap.delete(id);
  }
  
  // Calendar events methods
  async getAllCalendarEvents(): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEventsMap.values());
  }
  
  async getCalendarEventsBySubject(subjectId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEventsMap.values()).filter(
      (event) => event.subjectId === subjectId
    );
  }
  
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEventsMap.get(id);
  }
  
  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.currentCalendarEventId++;
    
    // Преобразование дат из строк в объекты Date, если нужно
    const startDate = typeof event.startDate === 'string' 
      ? new Date(event.startDate) 
      : event.startDate;
      
    const endDate = event.endDate 
      ? (typeof event.endDate === 'string' 
        ? new Date(event.endDate) 
        : event.endDate) 
      : null;
    
    const createdAt = event.createdAt 
      ? (typeof event.createdAt === 'string' 
        ? new Date(event.createdAt) 
        : event.createdAt) 
      : new Date();
    
    const newEvent: CalendarEvent = {
      id,
      title: event.title,
      description: event.description || null,
      startDate,
      endDate,
      allDay: event.allDay || true,
      subjectId: event.subjectId || null,
      color: event.color || "#E30611",
      createdAt
    };
    this.calendarEventsMap.set(id, newEvent);
    return newEvent;
  }
  
  async updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const existingEvent = this.calendarEventsMap.get(id);
    if (!existingEvent) return undefined;
    
    // Обработка преобразования дат, если они присутствуют
    let updatedData = { ...event };
    
    if (event.startDate) {
      updatedData.startDate = typeof event.startDate === 'string'
        ? new Date(event.startDate)
        : event.startDate;
    }
    
    if (event.endDate) {
      updatedData.endDate = typeof event.endDate === 'string'
        ? new Date(event.endDate)
        : event.endDate;
    }
    
    if (event.createdAt) {
      updatedData.createdAt = typeof event.createdAt === 'string'
        ? new Date(event.createdAt)
        : event.createdAt;
    }
    
    const updatedEvent = { ...existingEvent, ...updatedData };
    this.calendarEventsMap.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEventsMap.delete(id);
  }
  
  // Schedule cache (TTL 1 hour)
  async cacheSchedule(groupId: string, weekSchedule: WeekSchedule): Promise<void> {
    this.scheduleCache.set(groupId, { 
      data: weekSchedule, 
      timestamp: Date.now() 
    });
  }
  
  async getScheduleCache(groupId: string): Promise<WeekSchedule | undefined> {
    const cached = this.scheduleCache.get(groupId);
    
    if (!cached) return undefined;
    
    // Check if cache is expired (1 hour TTL)
    if (Date.now() - cached.timestamp > 3600000) {
      this.scheduleCache.delete(groupId);
      return undefined;
    }
    
    return cached.data;
  }
}

// Exported decrypt and encrypt functions to be used in the auth module
export { encrypt, decrypt };

export const storage = new MemStorage();
