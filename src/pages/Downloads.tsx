import { ArrowLeft, BookOpen, FileQuestion, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const resources = [
  {
    title: "Classes",
    description: "Access your virtual classroom and live lessons",
    href: "https://samagra.kite.kerala.gov.in/#/layout/learningroom",
    icon: BookOpen,
  },
  {
    title: "Question Bank",
    description: "Browse through practice questions and exercises",
    href: "https://samagra.kite.kerala.gov.in/#/question-repository",
    icon: FileQuestion,
  },
  {
    title: "Model Question Papers",
    description: "Download and practice with sample exam papers",
    href: "https://samagra.kite.kerala.gov.in/#/model-questions",
    icon: FileText,
  },
];

const Downloads = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
            <p className="text-sm text-muted-foreground">All your learning resources in one place</p>
          </div>
        </div>

        <div className="space-y-3">
          {resources.map(({ title, description, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="rounded-3xl border-0 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all p-5 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">{title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Downloads;
