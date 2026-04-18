import DashboardHero from "@/components/DashboardHero";
import CourseList from "@/components/CourseList";
import FloatingChatButton from "@/components/FloatingChatButton";
import AIFloatingButton from "@/components/AIFloatingButton";
import { Link } from "react-router-dom";
import { MessageCircle, TrendingUp, Calendar, BookOpen } from "lucide-react";

const tiles = [
  { to: "/view-all-teachers", label: "Teachers", icon: MessageCircle, color: "from-blue-500 to-blue-600" },
  { to: "/progress", label: "Progress", icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
  { to: "/attendance", label: "Attendance", icon: Calendar, color: "from-violet-500 to-violet-600" },
  { to: "/notes-assignments", label: "Notes & Tasks", icon: BookOpen, color: "from-amber-500 to-orange-500" },
];

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-accent/40 px-4 py-6 pb-24 animate-fade-in">
      <main className="max-w-6xl mx-auto">
        <DashboardHero />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tiles.map(({ to, label, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <div className={`group rounded-3xl p-4 bg-gradient-to-br ${color} text-white shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] active:scale-[0.97] transition-all`}>
                <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold text-sm leading-tight">{label}</p>
              </div>
            </Link>
          ))}
        </div>

        <section>
          <CourseList />
        </section>
      </main>
      <AIFloatingButton />
      <FloatingChatButton />
    </div>
  );
};

export default Index;
