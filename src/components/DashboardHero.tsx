import { GraduationCap, Sparkles, BookOpen, MessageCircle, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";

const DashboardHero = () => {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    setIsTeacher(localStorage.getItem('teacher-logged-in') !== null);
  }, []);

  return (
    <header className="relative overflow-hidden rounded-[2rem] mb-6 p-6 bg-[var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
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
          <p className="text-sm text-white/90 mb-5 leading-relaxed">
            Courses, assignments, progress and more — all in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-[1.5rem] bg-white/16 backdrop-blur-md px-4 py-4 border border-white/15">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BookOpen size={16} /> Study Plan
              </div>
              <p className="mt-2 text-xs text-white/80">Keep your notes, homework, and class tasks organized.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/16 backdrop-blur-md px-4 py-4 border border-white/15">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageCircle size={16} /> Teacher Support
              </div>
              <p className="mt-2 text-xs text-white/80">Reach teachers and live chat spaces from one clean dashboard.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/16 backdrop-blur-md px-4 py-4 border border-white/15">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CalendarDays size={16} /> Daily Flow
              </div>
              <p className="mt-2 text-xs text-white/80">Track attendance, lessons, and upcoming submissions with ease.</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHero;
