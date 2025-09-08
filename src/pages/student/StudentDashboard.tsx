import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Target, Users, Plus, User } from "lucide-react";

const StudentDashboard = () => {
  const handleViewProfile = () => {
    // Dummy functionality
    alert("View Profile - Feature coming soon!");
  };

  const handleAddAchievement = () => {
    // Dummy functionality
    alert("Add Achievement - Feature coming soon!");
  };

  const handleCardClick = (cardName: string) => {
    // Dummy functionality
    alert(`${cardName} - Feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
          <Button onClick={handleViewProfile} variant="outline" size="sm">
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5 text-primary" />
                Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">85.5%</div>
              <p className="text-muted-foreground text-sm">Overall GPA</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-success" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">92%</div>
              <p className="text-muted-foreground text-sm">This semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Academics")}
          >
            <CardHeader className="text-center">
              <GraduationCap className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle>Academics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Course materials and academic resources
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Skills")}
          >
            <CardHeader className="text-center">
              <Target className="w-12 h-12 mx-auto text-warning mb-2" />
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Track and develop your skills
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Curriculum")}
          >
            <CardHeader className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-success mb-2" />
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                View curriculum and course structure
              </p>
            </CardContent>
          </Card>

          <Card 
            className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow cursor-pointer"
            onClick={() => handleCardClick("Extracurricular")}
          >
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto text-destructive mb-2" />
              <CardTitle>Extracurricular</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground text-sm">
                Activities and events participation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Achievement Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleAddAchievement} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Achievement
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;