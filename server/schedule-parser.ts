import fetch from "node-fetch";
import { DaySchedule, ScheduleLesson, WeekSchedule } from "@shared/types";

// Translates day of week to Russian
function getDayOfWeekRussian(date: Date): string {
  const daysOfWeek = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота"
  ];
  return daysOfWeek[date.getDay()];
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get the start and end dates of the current week
function getCurrentWeekDates(): { start: Date, end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Adjust to get Monday as the first day of the week
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday is the end of the academic week
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { start: startOfWeek, end: endOfWeek };
}

// Extract time from a string like "8:30-10:00"
function extractTime(timeString: string): { start: string, end: string } {
  const [start, end] = timeString.split('-');
  return { start: start.trim(), end: end.trim() };
}

// Parse the schedule data from DGTU website for a specific group
export async function getScheduleForGroup(groupId: string): Promise<WeekSchedule> {
  try {
    // Fetch the schedule data from DGTU API
    const url = `https://edu.donstu.ru/api/Rasp/Group/${groupId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If there's no data or no rasps property, return an empty schedule
    if (!data || !data.data || !data.data.rasp) {
      throw new Error("Invalid schedule data format");
    }
    
    // Get current week dates
    const { start: weekStart, end: weekEnd } = getCurrentWeekDates();
    
    // Initialize the week schedule
    const weekSchedule: WeekSchedule = {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      days: []
    };
    
    // Create a map of days for the current week
    const weekDays = new Map<string, DaySchedule>();
    
    // Initialize the days of the week
    for (let i = 0; i < 5; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      
      const daySchedule: DaySchedule = {
        date: formatDate(day),
        dayOfWeek: getDayOfWeekRussian(day),
        lessons: []
      };
      
      weekDays.set(formatDate(day), daySchedule);
    }
    
    // Process each lesson in the schedule
    for (const lesson of data.data.rasp) {
      // Skip lessons that are not in the current week
      const lessonDate = new Date(lesson.Date);
      if (lessonDate < weekStart || lessonDate > weekEnd) {
        continue;
      }
      
      const lessonDateStr = formatDate(lessonDate);
      const daySchedule = weekDays.get(lessonDateStr);
      
      if (daySchedule) {
        const timeInfo = extractTime(lesson.Time);
        
        const scheduleLesson: ScheduleLesson = {
          id: String(lesson.Id),
          title: lesson.Disc,
          type: lesson.TypeLesson, // лекция, практика, лаб. работа
          teacher: lesson.Prepod,
          room: lesson.Aud,
          time: {
            start: timeInfo.start,
            end: timeInfo.end
          }
        };
        
        daySchedule.lessons.push(scheduleLesson);
      }
    }
    
    // Sort each day's lessons by start time and add to the week schedule
    weekDays.forEach(day => {
      day.lessons.sort((a, b) => {
        const timeA = a.time.start.split(':').map(Number);
        const timeB = b.time.start.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
      });
      
      weekSchedule.days.push(day);
    });
    
    // Sort days chronologically
    weekSchedule.days.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    return weekSchedule;
  } catch (error) {
    console.error("Error parsing schedule:", error);
    
    // Return empty schedule on error
    const { start: weekStart, end: weekEnd } = getCurrentWeekDates();
    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      days: []
    };
  }
}
