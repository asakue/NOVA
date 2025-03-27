import { Announcement } from "@shared/schema";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AnnouncementCardProps {
  announcement: Announcement;
  type: "important" | "general";
}

export default function AnnouncementCard({ announcement, type }: AnnouncementCardProps) {
  const date = format(new Date(announcement.createdAt), "dd.MM.yyyy", { locale: ru });
  
  if (type === "important") {
    return (
      <div className="card bg-[#F44336] bg-opacity-5 p-4 rounded-md mb-3 border-l-4 border-[#F44336] transition-all hover:shadow-md">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800">{announcement.title}</h3>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <p className="mt-2 text-gray-600">{announcement.content}</p>
      </div>
    );
  }
  
  return (
    <div className="card bg-white p-4 rounded-md mb-3 border border-gray-200 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{announcement.title}</h3>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <p className="mt-2 text-gray-600">{announcement.content}</p>
    </div>
  );
}
