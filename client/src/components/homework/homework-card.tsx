import { Homework, Subject } from "@shared/schema";
import { format, isBefore, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";

interface HomeworkCardProps {
  homework: Homework;
  subject?: Subject;
}

export default function HomeworkCard({ homework, subject }: HomeworkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const dueDate = new Date(homework.dueDate);
  const assignedDate = new Date(homework.assignedDate);
  const now = new Date();
  
  const isOverdue = isBefore(dueDate, now);
  const daysLeft = differenceInDays(dueDate, now);
  
  // Определяем цвета и статусы на основе дедлайна
  const getStatusInfo = () => {
    // Если задание выполнено, показываем зеленый статус
    if (isCompleted) {
      return {
        borderColor: "border-green-500",
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-500",
        icon: "task_alt",
        text: "Выполнено"
      };
    }
    
    // Если просрочено
    if (isOverdue) {
      return {
        borderColor: "border-red-500",
        iconColor: "text-red-500",
        bgColor: "bg-red-50",
        textColor: "text-red-500",
        icon: "error_outline",
        text: `Просрочено: ${format(dueDate, "dd MMMM", { locale: ru })}`
      };
    }
    
    // Если осталось меньше 3 дней
    if (daysLeft <= 2) {
      return {
        borderColor: "border-orange-500",
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-500",
        icon: "alarm",
        text: daysLeft === 0 
          ? "Срок сдачи: сегодня" 
          : daysLeft === 1 
            ? "Срок сдачи: завтра" 
            : `Осталось дней: ${daysLeft}`
      };
    }
    
    // Если больше 7 дней
    if (daysLeft > 7) {
      return {
        borderColor: "border-blue-500",
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-500",
        icon: "event_available",
        text: `Срок сдачи: ${format(dueDate, "dd MMMM", { locale: ru })}`
      };
    }
    
    // По умолчанию
    return {
      borderColor: "border-indigo-500",
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-500",
      icon: "schedule",
      text: `Осталось дней: ${daysLeft}`
    };
  };
  
  const status = getStatusInfo();
  
  // Получаем информацию о предмете
  const subjectColor = subject?.color || "#9E9E9E";
  const subjectName = subject?.name || "Неизвестный предмет";
  
  // Переключение состояния завершения
  const toggleCompletion = () => {
    setIsCompleted(!isCompleted);
  };
  
  // Получаем информацию о прикрепленных файлах
  const attachmentsCount = Array.isArray(homework.attachments) ? homework.attachments.length : 0;
  
  return (
    <div 
      className={`card bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md
        ${isCompleted ? 'opacity-80' : 'opacity-100'}`}
    >
      <div 
        className={`p-4 border-l-4 ${status.borderColor} ${isCompleted ? 'bg-gray-50' : 'bg-white'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-wrap justify-between items-start">
          <div className="mb-2 md:mb-0 flex-1 mr-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isCompleted}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompletion();
                }}
                className={`${isCompleted ? 'data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500' : ''}`}
              />
              <h2 className={`text-lg font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {homework.title}
              </h2>
            </div>
            
            <div className="flex items-center mt-1 ml-7">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: subjectColor }}
              ></div>
              <p className="text-sm font-medium text-gray-600">
                {subjectName}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`px-3 py-1 text-xs font-medium rounded-full flex items-center ${status.bgColor} ${status.textColor}`}>
              <span className="material-icons text-xs mr-1">{status.icon}</span>
              <span>{status.text}</span>
            </div>
            
            <span className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="material-icons text-xs mr-1">event</span>
              Задано: {format(assignedDate, "dd.MM.yyyy", { locale: ru })}
            </span>
          </div>
        </div>
        
        {/* Развернутое содержимое */}
        <div className={`mt-3 ${isExpanded ? 'block' : 'hidden md:block'}`}>
          <p className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-600'} line-clamp-2 md:line-clamp-none`}>
            {homework.description || "Описание отсутствует"}
          </p>
          
          {isExpanded && homework.description && (
            <div className="mt-4 text-sm">
              <hr className="my-2" />
              <p className="whitespace-pre-wrap">{homework.description}</p>
            </div>
          )}
        </div>
        
        {/* Нижняя часть с кнопками */}
        <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center">
            {attachmentsCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-primary hover:text-primary/80 h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Логика для просмотра вложений
                      }}
                    >
                      <span className="material-icons text-sm mr-1">attachment</span>
                      <span>Вложения ({attachmentsCount})</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Просмотреть прикрепленные файлы</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="h-8" 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <>
                  <span className="material-icons text-sm mr-1">expand_less</span>
                  <span>Свернуть</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm mr-1">expand_more</span>
                  <span>Детали</span>
                </>
              )}
            </Button>
            
            <Button 
              className={`flex items-center h-8 ${isCompleted 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-primary text-white hover:bg-primary/90'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleCompletion();
              }}
              disabled={isCompleted}
            >
              <span className="material-icons text-sm mr-1">
                {isCompleted ? 'task_alt' : 'check'}
              </span>
              <span>
                {isCompleted ? 'Выполнено' : 'Отметить выполненным'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
