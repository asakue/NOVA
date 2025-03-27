import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // "admin" or "student"
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subject schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacher: text("teacher").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#E30611"), // Primary color by default
});

export const insertSubjectSchema = createInsertSchema(subjects);
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Material schema
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "document", "link", "note", "file"
  fileUrl: text("file_url"), // URL или base64 для файла
  fileName: text("file_name"), // Имя файла
  fileSize: integer("file_size"), // Размер файла в байтах
  fileType: text("file_type"), // MIME тип файла
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Создаем базовую схему для материалов
const baseInsertMaterialSchema = createInsertSchema(materials);

// Модифицируем схему, чтобы createdAt мог быть строкой или датой
export const insertMaterialSchema = baseInsertMaterialSchema.extend({
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

// Homework schema
export const homeworks = pgTable("homeworks", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  attachments: jsonb("attachments").default([]), // Links to attachments
});

// Создаем базовую схему
const baseInsertHomeworkSchema = createInsertSchema(homeworks);

// Модифицируем схему, чтобы dueDate и assignedDate могли быть строкой или датой
export const insertHomeworkSchema = baseInsertHomeworkSchema.extend({
  dueDate: z.union([z.string(), z.date()]),
  assignedDate: z.union([z.string(), z.date()]).optional(),
});

export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homeworks.$inferSelect;

// Announcement schema
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  important: boolean("important").notNull().default(false),
});

// Создаем базовую схему для объявлений
const baseInsertAnnouncementSchema = createInsertSchema(announcements);

// Модифицируем схему, чтобы createdAt мог быть строкой или датой
export const insertAnnouncementSchema = baseInsertAnnouncementSchema.extend({
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Calendar events schema
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  allDay: boolean("all_day").notNull().default(true),
  subjectId: integer("subject_id"),
  color: text("color").default("#E30611"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Создаем базовую схему
const baseInsertCalendarEventSchema = createInsertSchema(calendarEvents);

// Модифицируем схему, чтобы startDate, endDate и createdAt могли быть строкой или датой
export const insertCalendarEventSchema = baseInsertCalendarEventSchema.extend({
  startDate: z.union([z.string(), z.date()]),
  endDate: z.union([z.string(), z.date()]).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
});

export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
