import { Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubjectCardProps {
  subject: Subject;
  isAdmin: boolean;
}

export default function SubjectCard({ subject, isAdmin }: SubjectCardProps) {
  // Функция для определения контрастного цвета текста
  const getContrastColor = (hexColor: string): string => {
    // Преобразуем строку HEX в RGB
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    
    // Вычисляем яркость по формуле (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // Если яркость больше 128, возвращаем черный, иначе белый
    return brightness > 170 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  };
  
  // Определяем цвет текста на основе цвета фона
  const textColor = getContrastColor(subject.color);
  
  // Навигация к деталям предмета
  const navigateToSubject = () => {
    window.location.href = `/subjects/${subject.id}`;
  };

  return (
    <div 
      className="card bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer"
      onClick={navigateToSubject}
    >
      {/* Верхняя часть карточки с цветом предмета */}
      <div 
        className="p-4 relative" 
        style={{ 
          backgroundColor: subject.color,
          color: textColor,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Декоративный элемент в углу */}
        <div 
          className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20"
          style={{ backgroundColor: textColor }}
        ></div>
        
        <div className="flex justify-between items-start relative">
          <h2 className="text-lg font-medium truncate max-w-[80%]">{subject.name}</h2>
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 hover:bg-white/20 rounded h-7 w-7 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Здесь можно добавить логику редактирования
                    }}
                  >
                    <span className="material-icons text-sm">edit</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Редактировать предмет</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        
        <div className="flex items-center mt-1">
          <span className="material-icons text-sm mr-1 opacity-80">person</span>
          <p className="text-sm opacity-80 truncate">{subject.teacher}</p>
        </div>
      </div>
      
      {/* Нижняя часть карточки */}
      <div className="p-4">
        {/* Кнопки быстрого доступа */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs px-3 py-1 h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/subjects/${subject.id}`;
            }}
          >
            <span className="material-icons text-xs mr-1">description</span>
            Материалы
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs px-3 py-1 h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/subjects/${subject.id}/homework`;
            }}
          >
            <span className="material-icons text-xs mr-1">assignment</span>
            Задания
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="text-xs px-3 py-1 h-7 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full border-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/subjects/${subject.id}/notes`;
            }}
          >
            <span className="material-icons text-xs mr-1">sticky_note_2</span>
            Заметки
          </Button>
        </div>
        
        {/* Описание предмета */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {subject.description || "Описание отсутствует"}
        </p>
      </div>
    </div>
  );
}
