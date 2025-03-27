import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import HomeworkCard from "@/components/homework/homework-card";
import { Homework, Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import AddHomeworkDialog from "@/components/admin/add-homework-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type HomeworkStatus = "all" | "active" | "upcoming" | "overdue" | "completed";
type SortOrder = "asc" | "desc";

export default function HomeworkPage() {
  const [addHomeworkOpen, setAddHomeworkOpen] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<HomeworkStatus>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "title">("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const { isAdmin } = useAuth();
  
  // Fetch homeworks
  const { 
    data: homeworks, 
    isLoading: isLoadingHomeworks,
    error: homeworksError
  } = useQuery<Homework[]>({
    queryKey: ["/api/homeworks"],
  });

  // Fetch subjects for filter
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects,
    error: subjectsError
  } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Статистика по статусам заданий
  const homeworkStats = {
    all: homeworks?.length || 0,
    active: homeworks?.filter(hw => new Date(hw.dueDate) >= new Date()).length || 0,
    upcoming: homeworks?.filter(hw => new Date(hw.dueDate) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length || 0,
    overdue: homeworks?.filter(hw => new Date(hw.dueDate) < new Date()).length || 0,
    completed: 0 // пока не реализовано
  };

  // Filter homeworks based on selected filters
  let filteredHomeworks = homeworks?.filter(homework => {
    // Поиск по тексту
    if (searchQuery && !homework.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Фильтр по предмету
    if (subjectFilter !== "all" && homework.subjectId !== Number(subjectFilter)) {
      return false;
    }

    // Фильтр по статусу
    if (statusFilter !== "all") {
      const now = new Date();
      const dueDate = new Date(homework.dueDate);
      
      if (statusFilter === "active" && dueDate >= now) {
        return true;
      } else if (statusFilter === "upcoming" && dueDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        return true;
      } else if (statusFilter === "overdue" && dueDate < now) {
        return true;
      } else if (statusFilter === "completed") {
        // For demo purposes, no completed status is tracked yet
        return false;
      }
      
      return false;
    }
    
    return true;
  });

  // Сортировка результатов
  if (filteredHomeworks) {
    filteredHomeworks = [...filteredHomeworks].sort((a, b) => {
      if (sortBy === "dueDate") {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
    });
  }

  // Переключение порядка сортировки
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Получение цвета предмета
  const getSubjectColor = (subjectId: number) => {
    return subjects?.find(s => s.id === subjectId)?.color || "#808080";
  };

  return (
    <PageContainer title="Домашние задания">
      {/* Заголовок и кнопка добавления */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию задания"
            className="pl-10 w-full bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isAdmin && (
          <Button 
            className="flex items-center px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors w-full sm:w-auto"
            onClick={() => setAddHomeworkOpen(true)}
          >
            <span className="material-icons mr-2">add</span>
            <span>Добавить задание</span>
          </Button>
        )}
      </div>

      {/* Tabs для статусов */}
      <Tabs defaultValue={statusFilter} onValueChange={(value) => setStatusFilter(value as HomeworkStatus)} className="mb-6">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-2">
          <TabsTrigger value="all" className="flex items-center justify-center gap-2">
            Все
            <Badge variant="secondary">{homeworkStats.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center justify-center gap-2">
            Активные
            <Badge variant="secondary">{homeworkStats.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center justify-center gap-2">
            Предстоящие
            <Badge variant="secondary">{homeworkStats.upcoming}</Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center justify-center gap-2">
            Просроченные
            <Badge variant="secondary">{homeworkStats.overdue}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center gap-2">
            Выполненные
            <Badge variant="secondary">{homeworkStats.completed}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
              <Select 
                value={subjectFilter} 
                onValueChange={setSubjectFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Все предметы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все предметы</SelectItem>
                  {subjects?.map(subject => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: subject.color }}
                        ></div>
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-10 ${sortBy === "dueDate" ? 'bg-gray-100' : ''}`}
                  onClick={() => setSortBy("dueDate")}
                >
                  <span className="mr-1">По дате</span>
                  {sortBy === "dueDate" && (
                    sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-10 ${sortBy === "title" ? 'bg-gray-100' : ''}`}
                  onClick={() => setSortBy("title")}
                >
                  <span className="mr-1">По названию</span>
                  {sortBy === "title" && (
                    sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSortOrder}
                className="h-10 w-10"
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          {renderHomeworkContent()}
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          {renderHomeworkContent()}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          {renderHomeworkContent()}
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          {renderHomeworkContent()}
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          {renderHomeworkContent()}
        </TabsContent>
      </Tabs>

      <AddHomeworkDialog
        open={addHomeworkOpen}
        onOpenChange={setAddHomeworkOpen}
        subjects={subjects || []}
      />
    </PageContainer>
  );

  // Отрисовка содержимого в зависимости от статуса загрузки
  function renderHomeworkContent() {
    if (isLoadingHomeworks || isLoadingSubjects) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Загрузка заданий...</p>
        </div>
      );
    }
    
    if (homeworksError || subjectsError) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-red-500 flex flex-col items-center">
            <span className="material-icons text-4xl mb-2">error_outline</span>
            <p>Ошибка при загрузке заданий</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      );
    }
    
    if (!filteredHomeworks?.length) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="flex flex-col items-center">
            <span className="material-icons text-4xl text-gray-400 mb-2">
              assignment_late
            </span>
            <p className="text-gray-500 mb-2">
              {searchQuery 
                ? "По вашему запросу ничего не найдено" 
                : `Нет заданий со статусом "${statusFilter === 'all' ? 'все' : 
                   statusFilter === 'active' ? 'активные' : 
                   statusFilter === 'upcoming' ? 'предстоящие' : 
                   statusFilter === 'overdue' ? 'просроченные' : 'выполненные'}"`}
            </p>
            {searchQuery && (
              <Button 
                variant="ghost" 
                className="text-primary"
                onClick={() => setSearchQuery("")}
              >
                Сбросить поиск
              </Button>
            )}
            {!searchQuery && isAdmin && (
              <Button 
                className="mt-2"
                onClick={() => setAddHomeworkOpen(true)}
              >
                Добавить задание
              </Button>
            )}
          </div>
        </div>
      );
    }
    
    // Группировка заданий по дате
    const groupedHomeworks: Record<string, Homework[]> = {};
    
    filteredHomeworks.forEach(homework => {
      const date = format(new Date(homework.dueDate), "dd MMMM yyyy", { locale: ru });
      if (!groupedHomeworks[date]) {
        groupedHomeworks[date] = [];
      }
      groupedHomeworks[date].push(homework);
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(groupedHomeworks).map(([date, homeworks]) => (
          <div key={date}>
            <div className="flex items-center mb-2">
              <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                <span className="material-icons text-xs mr-1">event</span>
                {date}
              </div>
              <div className="border-t border-gray-200 flex-1 ml-3"></div>
            </div>
            <div className="space-y-3">
              {homeworks.map(homework => (
                <HomeworkCard 
                  key={homework.id} 
                  homework={homework} 
                  subject={subjects?.find(s => s.id === homework.subjectId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
