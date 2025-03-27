import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import { Subject, Announcement, Homework } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import { useLocation } from "wouter";
import AddSubjectDialog from "@/components/admin/add-subject-dialog";
import AddAnnouncementDialog from "@/components/admin/add-announcement-dialog";
import AddHomeworkDialog from "@/components/admin/add-homework-dialog";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function AdminPage() {
  const [, navigate] = useLocation();
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState("subjects");
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [addAnnouncementOpen, setAddAnnouncementOpen] = useState(false);
  const [addHomeworkOpen, setAddHomeworkOpen] = useState(false);
  
  // Redirect if not admin
  if (!isAdmin) {
    navigate("/dashboard");
    // Return a loading indicator instead of null
    return (
      <PageContainer title="Перенаправление...">
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }
  
  // Fetch subjects
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects,
    error: subjectsError
  } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Fetch announcements
  const { 
    data: announcements, 
    isLoading: isLoadingAnnouncements,
    error: announcementsError
  } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  // Fetch homeworks
  const { 
    data: homeworks, 
    isLoading: isLoadingHomeworks,
    error: homeworksError
  } = useQuery<Homework[]>({
    queryKey: ["/api/homeworks"],
  });

  return (
    <PageContainer title="Панель администратора">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Панель администратора</h1>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium mb-3">Быстрые действия</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="p-4 bg-primary/10 text-primary hover:bg-primary/20 border-none h-auto justify-start"
            onClick={() => setAddSubjectOpen(true)}
          >
            <span className="material-icons mr-2">add_circle</span>
            <span>Добавить предмет</span>
          </Button>
          
          <Button
            variant="outline"
            className="p-4 bg-warning/10 text-warning hover:bg-warning/20 border-none h-auto justify-start"
            onClick={() => setAddHomeworkOpen(true)}
          >
            <span className="material-icons mr-2">assignment</span>
            <span>Добавить задание</span>
          </Button>
          
          <Button
            variant="outline"
            className="p-4 bg-info/10 text-info hover:bg-info/20 border-none h-auto justify-start"
            onClick={() => setAddAnnouncementOpen(true)}
          >
            <span className="material-icons mr-2">campaign</span>
            <span>Создать объявление</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="border-b-0">
              <TabsTrigger value="subjects" className="px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Предметы</TabsTrigger>
              <TabsTrigger value="announcements" className="px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Объявления</TabsTrigger>
              <TabsTrigger value="homeworks" className="px-4 py-3 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Задания</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="subjects" className="p-4">
            {isLoadingSubjects ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : subjectsError ? (
              <div className="p-4 text-center text-red-500">
                Ошибка при загрузке предметов
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Название</th>
                      <th className="py-3 px-6 text-left">Преподаватель</th>
                      <th className="py-3 px-6 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {subjects?.map(subject => (
                      <tr key={subject.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6">{subject.name}</td>
                        <td className="py-3 px-6">{subject.teacher}</td>
                        <td className="py-3 px-6">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <span className="material-icons text-sm text-secondary">edit</span>
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => navigate(`/subjects/${subject.id}`)}>
                              <span className="material-icons text-sm text-primary">visibility</span>
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <span className="material-icons text-sm text-destructive">delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {subjects?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">
                          Нет предметов
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="announcements" className="p-4">
            {isLoadingAnnouncements ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : announcementsError ? (
              <div className="p-4 text-center text-red-500">
                Ошибка при загрузке объявлений
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Заголовок</th>
                      <th className="py-3 px-6 text-left">Дата создания</th>
                      <th className="py-3 px-6 text-left">Важное</th>
                      <th className="py-3 px-6 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {announcements?.map(announcement => (
                      <tr key={announcement.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6">{announcement.title}</td>
                        <td className="py-3 px-6">
                          {format(new Date(announcement.createdAt), "dd.MM.yyyy", { locale: ru })}
                        </td>
                        <td className="py-3 px-6">
                          {announcement.important ? (
                            <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">Да</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">Нет</span>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <span className="material-icons text-sm text-secondary">edit</span>
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <span className="material-icons text-sm text-destructive">delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {announcements?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          Нет объявлений
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="homeworks" className="p-4">
            {isLoadingHomeworks || isLoadingSubjects ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : homeworksError || subjectsError ? (
              <div className="p-4 text-center text-red-500">
                Ошибка при загрузке заданий
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Название</th>
                      <th className="py-3 px-6 text-left">Предмет</th>
                      <th className="py-3 px-6 text-left">Срок сдачи</th>
                      <th className="py-3 px-6 text-left">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {homeworks?.map(homework => {
                      const subject = subjects?.find(s => s.id === homework.subjectId);
                      return (
                        <tr key={homework.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6">{homework.title}</td>
                          <td className="py-3 px-6">{subject?.name || "Неизвестный предмет"}</td>
                          <td className="py-3 px-6">
                            {format(new Date(homework.dueDate), "dd.MM.yyyy", { locale: ru })}
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <span className="material-icons text-sm text-secondary">edit</span>
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <span className="material-icons text-sm text-destructive">delete</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {homeworks?.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          Нет заданий
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* System Status */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium mb-3">Статус системы</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-success/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Всего предметов</p>
                <p className="text-2xl font-medium text-success">{subjects?.length || 0}</p>
              </div>
              <span className="material-icons text-success">menu_book</span>
            </div>
          </div>
          
          <div className="p-4 bg-warning/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Активных заданий</p>
                <p className="text-2xl font-medium text-warning">{homeworks?.length || 0}</p>
              </div>
              <span className="material-icons text-warning">assignment</span>
            </div>
          </div>
          
          <div className="p-4 bg-info/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Объявления</p>
                <p className="text-2xl font-medium text-info">{announcements?.length || 0}</p>
              </div>
              <span className="material-icons text-info">campaign</span>
            </div>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Студентов в группе</p>
                <p className="text-2xl font-medium text-primary">24</p>
              </div>
              <span className="material-icons text-primary">groups</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog components */}
      <AddSubjectDialog
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
      />
      
      <AddAnnouncementDialog
        open={addAnnouncementOpen}
        onOpenChange={setAddAnnouncementOpen}
      />
      
      <AddHomeworkDialog
        open={addHomeworkOpen}
        onOpenChange={setAddHomeworkOpen}
        subjects={subjects || []}
      />
    </PageContainer>
  );
}
