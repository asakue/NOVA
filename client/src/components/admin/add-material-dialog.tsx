import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertMaterialSchema, Subject } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Типы материалов
const materialTypes = [
  { id: "document", name: "Документ" },
  { id: "link", name: "Ссылка" },
  { id: "note", name: "Заметка" },
  { id: "file", name: "Файл" },
];

// Расширяем схему для валидации
const formSchema = insertMaterialSchema.extend({
  title: z.string(),
  content: z.string(),
  type: z.enum(["document", "link", "note", "file"]),
  subjectId: z.number(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  createdAt: z.date().optional(),
});

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  subjectId?: number; // опциональный ID предмета, если открывается из страницы предмета
}

export default function AddMaterialDialog({ 
  open, 
  onOpenChange, 
  subjects,
  subjectId 
}: AddMaterialDialogProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      subjectId: subjectId || subjects[0]?.id || 0,
      type: "document" as const,
    },
  });

  // Наблюдаем за изменениями типа материала
  const materialType = form.watch("type");
  
  // Обработка загрузки файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("fileName", file.name);
      form.setValue("fileSize", file.size);
      form.setValue("fileType", file.type);
      
      // Конвертация файла в base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        form.setValue("fileUrl", base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Мутация для создания материала
  const createMaterialMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Очищаем ненужные поля в зависимости от типа материала
      const payload = { ...data };
      if (data.type !== 'file') {
        delete payload.fileUrl;
        delete payload.fileName;
        delete payload.fileSize;
        delete payload.fileType;
      }
      delete payload.createdAt;
      
      const res = await apiRequest("POST", "/api/materials", payload);
      return await res.json();
    },
    onSuccess: () => {
      // Сбрасываем форму и закрываем диалог
      form.reset();
      setSelectedFile(null);
      onOpenChange(false);
      
      // Инвалидируем кэш материалов
      queryClient.invalidateQueries({ queryKey: ["/api/subjects", form.getValues().subjectId, "materials"] });
      
      toast({
        title: "Материал добавлен",
        description: "Новый материал успешно добавлен в систему.",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать материал: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Обработчик отправки формы
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Преобразуем JavaScript Date в строку ISO для отправки на сервер, если есть дата
    const payload = { ...data };
    if (payload.createdAt instanceof Date) {
      payload.createdAt = payload.createdAt.toISOString();
    }
    createMaterialMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить материал</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название материала</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название материала" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Предмет</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Тип материала</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип материала" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Контент в зависимости от типа материала */}
            {materialType === 'file' ? (
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="file-upload">Загрузить файл</Label>
                  <Input 
                    id="file-upload" 
                    type="file" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Выбран файл: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание файла</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Добавьте краткое описание файла"
                          className="resize-none"
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : materialType === 'link' ? (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ссылка</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Содержание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Введите содержание материала"
                        className="resize-none"
                        {...field}
                        rows={8}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                setSelectedFile(null);
                onOpenChange(false);
              }}>
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={createMaterialMutation.isPending || isUploading}
              >
                {createMaterialMutation.isPending || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Добавление...
                  </>
                ) : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}