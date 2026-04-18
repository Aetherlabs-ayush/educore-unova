import { Link, useLocation } from "react-router-dom";
import { Home, Download, Bell, User, Lock } from "lucide-react";
import { useState } from "react";
import TeachersAccessModal from "./TeachersAccessModal";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/downloads", label: "Materials", icon: Download },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <ul className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => setModalOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-2xl text-muted-foreground hover:text-foreground transition-all"
              type="button"
            >
              <Lock size={22} />
              <span className="text-[10px] font-medium">Teachers</span>
            </button>
          </li>
        </ul>
      </nav>
      <TeachersAccessModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};

export default BottomNav;
