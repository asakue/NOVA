import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { WeekSchedule, DaySchedule, ScheduleLesson } from "@shared/types";
import { ScheduleNote } from "@shared/schema";
import { Loader2 } from "lucide-react";
import PageContainer from "@/components/layout/page-container";
import ScheduleGrid from "@/components/schedule/schedule-grid";
import { Button } from "@/components/ui/button";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Start of week (Monday) and end of week (Friday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 4); // 5 days later (Friday)
  
  const formattedWeek = `${format(weekStart, "d")} - ${format(weekEnd, "d MMMM", { locale: ru })}`;

  // Fetch schedule for DGTU group with ID 57741
  const { 
    data: schedule, 
    isLoading: isLoadingSchedule,
    error: scheduleError 
  } = useQuery<WeekSchedule>({
    queryKey: ["/api/schedule/57741"],
  });

  // Fetch schedule notes
  const { 
    data: scheduleNotes, 
    isLoading: isLoadingNotes,
    error: notesError 
  } = useQuery<ScheduleNote[]>({
    queryKey: ["/api/schedule-notes"],
  });

  // Go to previous week
  const goToPrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  // Go to next week
  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <PageContainer title="Расписание">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Расписание</h1>
        <div className="flex space-x-2 items-center">
          <Button 
            variant="ghost" 
            onClick={goToPrevWeek}
            size="icon"
            className="h-10 w-10"
          >
            <span className="material-icons">chevron_left</span>
          </Button>
          <span className="py-2 font-medium">{formattedWeek}</span>
          <Button 
            variant="ghost" 
            onClick={goToNextWeek}
            size="icon"
            className="h-10 w-10"
          >
            <span className="material-icons">chevron_right</span>
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      {isLoadingSchedule ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : scheduleError ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-red-500">Ошибка при загрузке расписания</p>
          <p className="text-sm text-gray-500 mt-2">
            Не удалось получить данные с сервера ДГТУ. Пожалуйста, попробуйте позже.
          </p>
        </div>
      ) : (
        <ScheduleGrid weekSchedule={schedule!} />
      )}

      {/* Notes section */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-3">Примечания к расписанию</h2>
        
        {isLoadingNotes ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notesError ? (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center text-red-500">
            Ошибка при загрузке примечаний
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            {scheduleNotes?.length ? (
              <ul className="space-y-2">
                {scheduleNotes.map(note => {
                  let iconClass = "text-[#2196F3]"; // info by default
                  let icon = "info";
                  
                  if (note.type === "warning") {
                    iconClass = "text-[#FF9800]";
                    icon = "warning";
                  } else if (note.type === "event") {
                    iconClass = "text-[#4CAF50]";
                    icon = "event_available";
                  }
                  
                  return (
                    <li key={note.id} className="flex items-start">
                      <span className={`material-icons ${iconClass} mr-2 text-sm`}>{icon}</span>
                      <span className="text-sm text-gray-700">{note.content}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-2">Нет примечаний к расписанию</p>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
