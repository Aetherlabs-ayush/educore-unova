import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
}

const NotesAssignments = () => {
  const [items, setItems] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('clubs').select('*').order('name');
        if (error) throw error;
        setItems(data || []);
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Failed to load notes & assignments", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 px-4 py-6 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notes & Assignments</h1>
            <p className="text-sm text-muted-foreground">Browse your subjects and tasks</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-[var(--shadow-card)]">
            <CardContent className="text-center py-16">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notes or assignments yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className="rounded-3xl border-0 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => navigate(`/club-application/${item.id}`, { state: { clubName: item.name } })}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <CardDescription className="line-clamp-1">{item.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full rounded-2xl" size="lg">Open</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesAssignments;
