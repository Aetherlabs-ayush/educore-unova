import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Bell, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  sender_id: string;
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("role", "student")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({ title: "Error", description: "Failed to load notifications.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = async () => {
    const ids = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast({ title: "All marked as read" });
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const diffH = (Date.now() - d.getTime()) / 36e5;
    return diffH < 24
      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/30 px-4 py-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="ghost" size="sm" className="rounded-full">
              <Check className="w-4 h-4 mr-1" />
              Mark all
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading…</div>
        ) : notifications.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-[var(--shadow-card)] p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">You're all caught up</p>
            <p className="text-sm text-muted-foreground">New notifications will appear here</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className={`rounded-2xl border-0 shadow-[var(--shadow-soft)] p-4 transition-all cursor-pointer active:scale-[0.99] ${
                  !n.is_read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${!n.is_read ? "bg-primary/15" : "bg-muted"}`}>
                    <Bell className={`h-5 w-5 ${!n.is_read ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{n.title}</h3>
                      {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(n.timestamp)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
