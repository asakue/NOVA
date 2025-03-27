import { WeekSchedule } from "@shared/types";
import { Subject } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ScheduleGridProps {
  weekSchedule: WeekSchedule;
}

export default function ScheduleGrid({ weekSchedule }: ScheduleGridProps) {
  // Fetch subjects to match with lessons
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Times for schedule rows
  const timeSlots = [
    { start: "8:30", end: "10:00" },
    { start: "10:15", end: "11:45" },
    { start: "12:00", end: "13:30" },
    { start: "14:15", end: "15:45" },
    { start: "16:00", end: "17:30" }
  ];

  // Get subject color based on subject name
  const getSubjectColor = (subjectName: string): string => {
    if (!subjects) return "#9E9E9E"; // Default gray

    const subject = subjects.find(s => 
      subjectName.toLowerCase().includes(s.name.toLowerCase())
    );
    
    return subject?.color || "#9E9E9E";
  };

  // Get lesson type in Russian
  const getLessonType = (type: string): string => {
    type = type.toLowerCase();
    if (type.includes("лек")) return "лекция";
    if (type.includes("прак")) return "практика";
    if (type.includes("лаб")) return "лаб. работа";
    return type;
  };

  // Find lesson for a specific day and time
  const getLessonForDayAndTime = (dayIndex: number, timeSlot: { start: string, end: string }) => {
    if (!weekSchedule.days[dayIndex]) return null;
    
    const day = weekSchedule.days[dayIndex];
    
    return day.lessons.find(lesson => 
      lesson.time.start === timeSlot.start && lesson.time.end === timeSlot.end
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Schedule Header */}
      <div className="grid grid-cols-6 bg-gray-100">
        <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Время</div>
        <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Понедельник</div>
        <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Вторник</div>
        <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Среда</div>
        <div className="p-3 font-medium text-gray-700 border-r border-gray-200">Четверг</div>
        <div className="p-3 font-medium text-gray-700">Пятница</div>
      </div>

      {/* Schedule Content */}
      {timeSlots.map((timeSlot, timeIndex) => (
        <div key={timeIndex} className="grid grid-cols-6 border-t border-gray-200">
          <div className="p-3 font-medium text-gray-700 border-r border-gray-200 bg-gray-50">
            {timeSlot.start} - {timeSlot.end}
          </div>
          
          {/* Generate cells for each day */}
          {[0, 1, 2, 3, 4].map(dayIndex => {
            const lesson = getLessonForDayAndTime(dayIndex, timeSlot);
            
            if (!lesson) {
              return (
                <div key={dayIndex} className="p-3 border-r border-gray-200 min-h-[100px]"></div>
              );
            }
            
            const subjectColor = getSubjectColor(lesson.title);
            const bgColor = `${subjectColor}20`; // 20% opacity version of color
            
            return (
              <div key={dayIndex} className="p-3 border-r border-gray-200">
                <div className="card p-2 rounded-md transition-all hover:shadow-md" style={{ backgroundColor: bgColor }}>
                  <p className="font-medium" style={{ color: subjectColor }}>{lesson.title}</p>
                  <p className="text-sm text-gray-600">{getLessonType(lesson.type)}</p>
                  <p className="text-sm text-gray-500">ауд. {lesson.room}</p>
                  <p className="text-sm text-gray-500">{lesson.teacher}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
