import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import SubjectCard from "@/components/subjects/subject-card";
import { Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import AddSubjectDialog from "@/components/admin/add-subject-dialog";
import { Input } from "@/components/ui/input";

export default function SubjectsPage() {
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useAuth();
  
  // Fetch subjects
  const { 
    data: subjects, 
    isLoading,
    error
  } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Фильтрация предметов по поисковому запросу
  const filteredSubjects = subjects?.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    subject.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer title="Предметы">
      {/* Поисковая строка и кнопка добавления */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск по названию или преподавателю"
            className="pl-10 w-full bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isAdmin && (
          <Button 
            className="flex items-center px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors w-full sm:w-auto"
            onClick={() => setAddSubjectOpen(true)}
          >
            <span className="material-icons mr-2">add</span>
            <span>Добавить предмет</span>
          </Button>
        )}
      </div>

      {/* Результаты или индикатор загрузки */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Загрузка предметов...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-red-500 flex flex-col items-center">
            <span className="material-icons text-4xl mb-2">error_outline</span>
            <p>Ошибка при загрузке предметов</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Информация о количестве найденных предметов */}
          {searchQuery && (
            <p className="text-sm text-gray-500 mb-4">
              Найдено предметов: {filteredSubjects?.length || 0}
            </p>
          )}
          
          {/* Сетка с предметами */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all">
            {filteredSubjects?.map(subject => (
              <SubjectCard key={subject.id} subject={subject} isAdmin={isAdmin} />
            ))}
            
            {/* Пустое состояние */}
            {(filteredSubjects?.length === 0 || !filteredSubjects) && (
              <div className="col-span-full bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="flex flex-col items-center">
                  <span className="material-icons text-4xl text-gray-400 mb-2">
                    menu_book
                  </span>
                  <p className="text-gray-500 mb-2">
                    {searchQuery 
                      ? "По вашему запросу ничего не найдено" 
                      : "Нет доступных предметов"}
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
                      onClick={() => setAddSubjectOpen(true)}
                    >
                      Добавить первый предмет
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <AddSubjectDialog 
        open={addSubjectOpen}
        onOpenChange={setAddSubjectOpen}
      />
    </PageContainer>
  );
}
