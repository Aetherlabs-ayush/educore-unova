import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const DashboardHero = () => {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    const teacherData = localStorage.getItem('teacher-logged-in');
    setIsTeacher(teacherData !== null);
  }, []);

  return (
    <header className="flex items-center gap-8 bg-gradient-to-r from-blue-100 via-white to-green-100 p-8 rounded-2xl mb-10 shadow">
      <div className="flex-shrink-0 bg-blue-200 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
        <GraduationCap size={40} className="text-blue-700" />
      </div>
      <div className="flex-1">
        <h1 className="text-4xl font-bold mb-2 text-blue-900 tracking-tighter">Welcome to Neodevadhar</h1>
        <p className="text-lg text-slate-700 mb-4 max-w-xl">
          Discover courses, complete fun assignments, and track your learning progress and see everything about your education— all in one place!
        </p>
        <div className="flex gap-3">
          <Link to="/courses" className="inline-block font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg shadow hover:scale-105 transition-transform duration-150 animate-fade-in">
            Browse Courses
          </Link>
          {isTeacher && (
            <Link to="/teacher-exam-scores">
              <Button className="bg-green-600 hover:bg-green-700">
                Upload Exam Scores
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHero;