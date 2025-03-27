import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertSubjectSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

// Extend the schema with validation rules
const formSchema = insertSubjectSchema.extend({
  name: z.string(),
  teacher: z.string(),
  description: z.string().nullable().optional(),
});

// Available colors for subjects
const colorOptions = [
  { name: "Красный", value: "#E30611" },
  { name: "Синий", value: "#1976D2" },
  { name: "Оранжевый", value: "#FF9800" },
  { name: "Желтый", value: "#FFC107" },
  { name: "Зеленый", value: "#4CAF50" },
  { name: "Голубой", value: "#2196F3" },
];

interface AddSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSubjectDialog({ open, onOpenChange }: AddSubjectDialogProps) {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teacher: "",
      description: "",
      color: colorOptions[0].value,
    },
  });

  // Mutation for subject creation
  const createSubjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/subjects", {
        ...data,
        color: selectedColor, // Make sure to use the selected color
      });
      return await res.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Invalidate subjects cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      
      toast({
        title: "Предмет создан",
        description: "Новый предмет успешно добавлен в систему.",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать предмет: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createSubjectMutation.mutate({
      ...data,
      color: selectedColor,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить предмет</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название предмета</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название предмета" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Преподаватель</FormLabel>
                  <FormControl>
                    <Input placeholder="ФИО преподавателя" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block text-sm font-medium mb-1">Цвет</FormLabel>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <div
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                      selectedColor === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setSelectedColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание предмета"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                onOpenChange(false);
              }}>
                Отмена
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={createSubjectMutation.isPending}
              >
                {createSubjectMutation.isPending ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
