import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, FileText, UserCheck } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/admin/students")}
              variant="outline"
            >
              <Users className="w-4 h-4 mr-2" />
              Students
            </Button>
            <Button 
              onClick={() => navigate("/admin/requests")}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Requests
            </Button>
            <Button 
              onClick={() => navigate("/admin/student-profiles")}
              variant="outline"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Student Profiles
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Admin dashboard content will be added here</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;