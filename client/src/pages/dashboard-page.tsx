import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Announcement } from "@shared/schema";
import { UpcomingEvent } from "@shared/types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/lib/authProvider";
import PageContainer from "@/components/layout/page-container";
import AnnouncementCard from "@/components/dashboard/announcement-card";
import AddAnnouncementDialog from "@/components/admin/add-announcement-dialog";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const today = format(new Date(), "d MMMM yyyy", { locale: ru });
  const { isAdmin } = useAuth();

  // Query for announcements
  const { 
    data: announcements, 
    isLoading: isLoadingAnnouncements,
    error: announcementsError 
  } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Query for upcoming events
  const { 
    data: upcomingEvents, 
    isLoading: isLoadingEvents,
    error: eventsError 
  } = useQuery<UpcomingEvent[]>({
    queryKey: ["/api/upcoming-events"],
  });

  return (
    <PageContainer title="Информационная доска" currentDate={today}>
      {/* Admin-only Action Button */}
      {isAdmin && (
        <div className="mb-4">
          <Button 
            onClick={() => setAddAnnouncementOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-white"
          >
            <span className="material-icons mr-2">add</span>
            <span>Добавить объявление</span>
          </Button>
        </div>
      )}

      {/* Important Announcements */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[#F44336] mr-2">priority_high</span>
          <h2 className="text-lg font-medium">Важные объявления</h2>
        </div>
        
        {isLoadingAnnouncements ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcementsError ? (
          <div className="p-4 text-center text-red-500">
            Ошибка при загрузке объявлений
          </div>
        ) : (
          <>
            {announcements
              ?.filter(a => a.important)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(announcement => (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement} 
                  type="important" 
                />
              ))
            }
            {announcements?.filter(a => a.important).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Нет важных объявлений
              </div>
            )}
          </>
        )}
      </div>

      {/* General Announcements */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[#2196F3] mr-2">campaign</span>
          <h2 className="text-lg font-medium">Общие объявления</h2>
        </div>
        
        {isLoadingAnnouncements ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcementsError ? (
          <div className="p-4 text-center text-red-500">
            Ошибка при загрузке объявлений
          </div>
        ) : (
          <>
            {announcements
              ?.filter(a => !a.important)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(announcement => (
                <AnnouncementCard 
                  key={announcement.id} 
                  announcement={announcement} 
                  type="general" 
                />
              ))
            }
            {announcements?.filter(a => !a.important).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Нет общих объявлений
              </div>
            )}
          </>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center mb-4">
          <span className="material-icons text-[#1976D2] mr-2">event</span>
          <h2 className="text-lg font-medium">Ближайшие события</h2>
        </div>
        
        {isLoadingEvents ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : eventsError ? (
          <div className="p-4 text-center text-red-500">
            Ошибка при загрузке событий
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Дата</th>
                  <th className="py-3 px-6 text-left">Событие</th>
                  <th className="py-3 px-6 text-left">Предмет</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {upcomingEvents?.length ? (
                  upcomingEvents.map(event => (
                    <tr key={event.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6">
                        {format(new Date(event.date), "dd.MM.yyyy")}
                      </td>
                      <td className="py-3 px-6">{event.title}</td>
                      <td className="py-3 px-6">{event.subjectName}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      Нет предстоящих событий
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Announcement Dialog */}
      <AddAnnouncementDialog
        open={addAnnouncementOpen}
        onOpenChange={setAddAnnouncementOpen}
      />
    </PageContainer>
  );
}
