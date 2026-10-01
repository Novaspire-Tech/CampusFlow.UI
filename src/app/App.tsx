import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import SchoolAppContent from "../routes/SchoolRoutes";
import AdminAppContent from "../routes/AdminRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

//  Role-based layout switcher 
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const role = localStorage.getItem("role");

  if (isAuthenticated && (role === "SUPER_ADMIN" || role === "ADMIN")) {
    return <AdminAppContent />;
  }

  return <SchoolAppContent />;
};

//  Root App 
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppContent />
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
