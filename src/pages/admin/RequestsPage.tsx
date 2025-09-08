import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X } from "lucide-react";

interface Request {
  id: number;
  studentName: string;
  email: string;
  requestType: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

const RequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      studentName: "John Doe",
      email: "john@example.com",
      requestType: "Course Enrollment",
      status: "pending",
      date: "2024-01-15"
    },
    {
      id: 2,
      studentName: "Jane Smith", 
      email: "jane@example.com",
      requestType: "Leave Application",
      status: "pending",
      date: "2024-01-14"
    },
    {
      id: 3,
      studentName: "Alice Johnson",
      email: "alice@example.com", 
      requestType: "Grade Review",
      status: "approved",
      date: "2024-01-13"
    },
  ]);

  const handleRequestAction = (requestId: number, action: "approved" | "rejected") => {
    setRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: action }
          : request
      )
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin/dashboard")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">Student Requests</h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-[var(--shadow-card)]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.studentName}</CardTitle>
                    <p className="text-muted-foreground text-sm">{request.email}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">Request Type:</p>
                    <p className="text-muted-foreground">{request.requestType}</p>
                  </div>
                  <div>
                    <p className="font-medium">Date:</p>
                    <p className="text-muted-foreground">{request.date}</p>
                  </div>
                  
                  {request.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, "approved")}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRequestAction(request.id, "rejected")}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {requests.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No student requests found.
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestsPage;