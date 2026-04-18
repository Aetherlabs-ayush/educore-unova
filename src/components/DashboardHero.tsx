import { GraduationCap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DashboardHero = () => {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    setIsTeacher(localStorage.getItem('teacher-logged-in') !== null);
  }, []);

  return (
    <header className="relative overflow-hidden rounded-3xl mb-6 p-6 bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="relative flex items-start gap-4">
        <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl w-14 h-14 flex items-center justify-center">
          <GraduationCap size={28} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-white/80 text-xs font-medium">
            <Sparkles size={12} /> Welcome to BTC
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Your Tuition Hub</h1>
          <p className="text-sm text-white/90 mb-4 leading-relaxed">
            Courses, assignments, progress and more — all in one place.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/courses">
              <Button size="sm" variant="secondary" className="rounded-full font-semibold shadow-md">
                Browse Courses
              </Button>
            </Link>
            {isTeacher && (
              <Link to="/teacher-exam-scores">
                <Button size="sm" className="rounded-full bg-white text-primary hover:bg-white/90 font-semibold shadow-md">
                  Upload Exam Scores
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHero;
