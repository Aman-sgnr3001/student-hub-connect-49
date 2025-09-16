import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementModal from "@/components/AchievementModal";
import axios from "axios";

interface SkillDocument {
  _id: string;
  sid: string;
  skillname: string;
  url?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

interface SkillsResponse {
  message: string;
  totalCount: number;
  documents: SkillDocument[];
}

const StudentSkills = () => {
  const [skills, setSkills] = useState<SkillDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    isModalOpen, 
    openAchievementModal,
    closeAchievementModal,
    selectAchievementType,
    submissionStatus, 
    resetSubmissionStatus 
  } = useAchievements();

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("studentToken");
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your skills.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get<SkillsResponse>("http://localhost:5000/api/student/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSkills(response.data.documents);
      
      toast({
        title: "Skills Loaded",
        description: `Found ${response.data.totalCount} skill documents.`,
      });
    } catch (error) {
      console.error("Error fetching skills:", error);
      toast({
        title: "Error",
        description: "Failed to load skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSkills();
  }, []);

  // Auto-refresh when submission status changes to 1 (submitted)
  useEffect(() => {
    if (submissionStatus === 1) {
      // Refresh data after successful submission
      fetchSkills();
      // Reset status back to 0
      resetSubmissionStatus();
    }
  }, [submissionStatus, resetSubmissionStatus]);

  const handleAddSkill = () => {
    openAchievementModal();
    selectAchievementType("skill");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your skills...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Skills</h1>
          <p className="text-muted-foreground">
            Manage and track your skill certifications
          </p>
        </div>
        <Button onClick={handleAddSkill} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Skills Added Yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Start building your profile by adding your first skill certification.
            </p>
            <Button onClick={handleAddSkill} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{skill.skillname}</CardTitle>
                  {getStatusBadge(skill.status)}
                </div>
                <CardDescription>
                  Submitted on {formatDate(skill.createdAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Student ID:</strong> {skill.sid}
                  </div>
                  
                  {skill.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(skill.url, "_blank")}
                      className="flex items-center gap-2 w-full"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Certificate
                    </Button>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {formatDate(skill.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AchievementModal 
        isOpen={isModalOpen} 
        onClose={closeAchievementModal} 
      />
    </div>
  );
};

export default StudentSkills;