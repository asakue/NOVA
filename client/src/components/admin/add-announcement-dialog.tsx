import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertAnnouncementSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";

// Extend the schema with validation rules
const formSchema = insertAnnouncementSchema.extend({
  title: z.string(),
  content: z.string(),
  createdAt: z.date().optional(),
});

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddAnnouncementDialog({ open, onOpenChange }: AddAnnouncementDialogProps) {
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      important: false,
      createdAt: new Date(),
    },
  });

  // Mutation for announcement creation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/announcements", data);
      return await res.json();
    },
    onSuccess: () => {
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Invalidate announcements cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      
      toast({
        title: "Объявление создано",
        description: "Новое объявление успешно добавлено в систему.",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: `Не удалось создать объявление: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const { createdAt, ...rest } = data;
    createAnnouncementMutation.mutate(rest);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить объявление</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите заголовок объявления" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Содержание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите текст объявления"
                      className="resize-none"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="important"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Важное объявление
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Важные объявления выделяются и отображаются в верхней части доски
                    </p>
                  </div>
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
                disabled={createAnnouncementMutation.isPending}
              >
                {createAnnouncementMutation.isPending ? "Добавление..." : "Добавить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
