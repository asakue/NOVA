// Types for the schedule integration

export interface ScheduleLesson {
  id: string;
  title: string;
  type: string; // lecture, practice, lab
  teacher: string;
  room: string;
  time: {
    start: string;
    end: string;
  };
  subjectId?: number; // To link to our subjects
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  lessons: ScheduleLesson[];
}

export interface WeekSchedule {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
}

// Auth types
export interface LoginCredentials {
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'student';
}

// Event types for the dashboard
export interface UpcomingEvent {
  id: number;
  type: 'homework' | 'calendar'; // Тип события
  date: string;
  timestamp: number; // UNIX timestamp для сортировки
  title: string;
  subjectName: string;
  subjectId: number | null;
  color: string; // Цвет события (из предмета или календаря)
}
