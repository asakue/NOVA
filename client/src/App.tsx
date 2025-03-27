import { Switch, Route } from "wouter";
// QueryClientProvider is now in main.tsx
// import { QueryClientProvider } from "@tanstack/react-query";
// import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import DashboardPage from "@/pages/dashboard-page";
import SubjectsPage from "@/pages/subjects-page";
import SubjectDetailPage from "@/pages/subject-detail-page";
import HomeworkPage from "@/pages/homework-page";
import AdminPage from "@/pages/admin-page";
import { ProtectedRoute } from "./lib/protected-route";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/subjects" component={SubjectsPage} />
      <ProtectedRoute path="/subjects/:id" component={SubjectDetailPage} />
      <ProtectedRoute path="/subjects/:id/:tab" component={SubjectDetailPage} />
      <ProtectedRoute path="/homework" component={HomeworkPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Подключаемся к WebSocket для получения обновлений в реальном времени
  useRealtimeUpdates();
  
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
