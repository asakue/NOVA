import { ReactNode } from "react";
import Sidebar from "./sidebar";

interface PageContainerProps {
  children: ReactNode;
  title: string;
  currentDate?: string;
}

export default function PageContainer({ children, title, currentDate }: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 transition-all">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
        {/* Заголовок страницы с тенью и фоном */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {currentDate && (
            <p className="text-gray-500 mt-2 md:mt-0 text-sm md:text-base flex items-center">
              <span className="material-icons mr-1 text-sm">today</span>
              {currentDate}
            </p>
          )}
        </div>
        
        {/* Основной контент страницы */}
        <div className="transition-all duration-200 ease-in-out">
          {children}
        </div>
        
        {/* Нижний колонтитул */}
        <footer className="mt-8 text-center text-gray-500 text-sm py-4">
          <p>© {new Date().getFullYear()} Виртуальная информационная система</p>
          <div className="flex items-center justify-center mt-2">
            <a 
              href="https://github.com/asakue" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-1">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>by asakue</span>
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
