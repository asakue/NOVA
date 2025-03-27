import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import PageContainer from "@/components/layout/page-container";
import { Subject, Material, Homework } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BookOpen, FileText, NotebookPen, PlusCircle, Edit, Download } from "lucide-react";
import { useAuth } from "@/lib/authProvider";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import AddMaterialDialog from "@/components/admin/add-material-dialog";

export default function SubjectDetailPage() {
  const { id, tab = "materials" } = useParams();
  const [, navigate] = useLocation();
  const subjectId = Number(id);
  const { isAdmin } = useAuth();
  const [showAddMaterialDialog, setShowAddMaterialDialog] = useState(false);

  // Fetch subject details
  const { 
    data: subject, 
    isLoading: isLoadingSubject,
    error: subjectError
  } = useQuery<Subject>({
    queryKey: [`/api/subjects/${subjectId}`],
    enabled: Boolean(subjectId),
  });

  // Fetch materials
  const { 
    data: materials, 
    isLoading: isLoadingMaterials,
    error: materialsError
  } = useQuery<Material[]>({
    queryKey: [`/api/subjects/${subjectId}/materials`],
    enabled: Boolean(subjectId),
  });

  // Fetch homeworks
  const { 
    data: homeworks, 
    isLoading: isLoadingHomeworks,
    error: homeworksError
  } = useQuery<Homework[]>({
    queryKey: [`/api/homeworks`, { subjectId }],
    enabled: Boolean(subjectId),
  });

  const handleTabChange = (value: string) => {
    navigate(`/subjects/${id}/${value}`);
  };

  if (isLoadingSubject) {
    return (
      <PageContainer title="Загрузка...">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (subjectError || !subject) {
    return (
      <PageContainer title="Ошибка">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center text-red-500">
          Предмет не найден или произошла ошибка при загрузке
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={subject.name}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{subject.name}</h1>
          <p className="text-gray-600">{subject.teacher}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </Button>
            <Button 
              className="bg-primary" 
              onClick={() => setShowAddMaterialDialog(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить материал
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue={tab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Материалы</span>
          </TabsTrigger>
          <TabsTrigger value="homework" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Задания</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4" />
            <span>Заметки</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials">
          {isLoadingMaterials ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : materialsError ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-red-500">
              Ошибка при загрузке материалов
            </div>
          ) : materials?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map(material => (
                <Card key={material.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {material.type === "document" && <BookOpen className="mr-2 h-4 w-4" />}
                      {material.type === "link" && <FileText className="mr-2 h-4 w-4" />}
                      {material.type === "note" && <NotebookPen className="mr-2 h-4 w-4" />}
                      {material.type === "file" && <Download className="mr-2 h-4 w-4" />}
                      {material.title}
                    </CardTitle>
                    <CardDescription className="flex justify-between items-center">
                      <span>
                        {material.type === "document" ? "Документ" : 
                         material.type === "link" ? "Ссылка" : 
                         material.type === "note" ? "Заметка" : "Файл"}
                      </span>
                      <span>{format(new Date(material.createdAt), "dd.MM.yyyy", { locale: ru })}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {material.type === "link" ? (
                      <a 
                        href={material.content} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {material.content}
                      </a>
                    ) : material.type === "file" && material.fileUrl ? (
                      <div className="space-y-2">
                        <p>{material.content}</p>
                        <Button 
                          onClick={() => {
                            // Создаем ссылку для скачивания
                            const link = document.createElement("a");
                            link.href = material.fileUrl || "";
                            link.download = material.fileName || "file";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          variant="outline"
                          className="flex items-center"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Скачать {material.fileName}
                          {material.fileSize && <span className="ml-1 text-xs text-muted-foreground">
                            ({Math.round(material.fileSize / 1024)} KB)
                          </span>}
                        </Button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{material.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
              Нет доступных материалов для этого предмета
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="homework">
          {isLoadingHomeworks ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : homeworksError ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-red-500">
              Ошибка при загрузке заданий
            </div>
          ) : homeworks?.length ? (
            <div className="space-y-4">
              {homeworks.map(homework => (
                <Card key={homework.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{homework.title}</CardTitle>
                      <div className="px-2 py-1 text-xs font-medium bg-warning bg-opacity-10 text-warning rounded-full">
                        Срок: {format(new Date(homework.dueDate), "dd.MM.yyyy", { locale: ru })}
                      </div>
                    </div>
                    <CardDescription>
                      Задано: {format(new Date(homework.assignedDate), "dd.MM.yyyy", { locale: ru })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{homework.description}</p>
                    <div className="flex justify-between items-center">
                      {Array.isArray(homework.attachments) && homework.attachments.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Button variant="link" className="p-0 h-auto">
                            <span className="material-icons text-sm align-text-bottom mr-1">description</span>
                            <span>Материалы</span>
                          </Button>
                        </div>
                      )}
                      <Button className="ml-auto">Отметить выполненным</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500">
              Нет доступных заданий для этого предмета
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes">
          {isLoadingMaterials ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : materialsError ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center text-red-500">
              Ошибка при загрузке заметок
            </div>
          ) : materials && materials.filter(m => m.type === "note").length > 0 ? (
            <div className="space-y-4">
              {materials
                .filter(m => m.type === "note")
                .map(note => (
                <Card key={note.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <NotebookPen className="mr-2 h-4 w-4" />
                      {note.title}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(note.createdAt), "dd MMMM yyyy, HH:mm", { locale: ru })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-center text-gray-500">
                Нет доступных заметок для этого предмета.
                {isAdmin && " Как администратор, вы можете добавлять и редактировать заметки."}
              </p>
              {isAdmin && (
                <div className="mt-4 flex justify-center">
                  <Button onClick={() => setShowAddMaterialDialog(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить заметку
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Диалог добавления материала */}
      {subject && (
        <AddMaterialDialog 
          open={showAddMaterialDialog}
          onOpenChange={setShowAddMaterialDialog}
          subjects={[subject]}
          subjectId={subjectId}
        />
      )}
    </PageContainer>
  );
}
