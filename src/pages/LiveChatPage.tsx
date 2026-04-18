import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Send, Mic, Paperclip, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Message = {
  id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  sender_image?: string;
  file_url?: string;
  message_type?: string;
};

const LiveChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem("student-profiles") || "[]");
    if (profiles.length > 0) setCurrentUser(profiles[profiles.length - 1]);
    loadMessages();

    const channel = supabase
      .channel("chat-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "chat_messages" }, (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages").select("*").order("timestamp", { ascending: true });
    if (!error) setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!currentUser) {
      toast({ title: "Please create a profile first", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("chat_messages").insert({
        sender_name: currentUser.name,
        message: newMessage.trim() || "Sent an image",
        sender_image: currentUser.image,
        sender_phone: currentUser.phone,
        message_type: selectedImage ? "image" : "text",
        file_url: selectedImage,
      });
      if (error) throw error;
      setNewMessage("");
      setSelectedImage(null);
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const r = new FileReader();
        r.onloadend = () => setSelectedImage(r.result as string);
        r.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleVoiceInput = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      toast({ title: "Voice input not supported", variant: "destructive" });
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (ev: any) => setNewMessage(ev.results[0][0].transcript);
    recognition.onerror = () => toast({ title: "Voice input failed", variant: "destructive" });
    recognition.start();
  };

  const handleDeleteMessage = async (id: string) => {
    await supabase.from("chat_messages").delete().eq("id", id);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3 shrink-0 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold">Live Class Chat</h1>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_name === currentUser?.name;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={msg.sender_image} />
                  <AvatarFallback className="text-xs">{msg.sender_name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {!isMe && <p className="text-xs text-muted-foreground px-2">{msg.sender_name}</p>}
                <div
                  className={`px-4 py-2.5 rounded-3xl ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {msg.message_type === "image" && msg.file_url && (
                    <img src={msg.file_url} alt="" className="rounded-2xl max-w-full mb-1" />
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                {isMe && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="text-xs text-muted-foreground px-2 hover:text-destructive">
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input — bottom-aligned, follows keyboard */}
      <div className="bg-card/95 backdrop-blur-xl border-t border-border/50 px-3 py-2 shrink-0 pb-[max(env(safe-area-inset-bottom),0.5rem)]">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="" className="h-16 w-16 object-cover rounded-2xl" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleImageUpload} className="rounded-full shrink-0 h-10 w-10">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Message"
            className="flex-1 rounded-full bg-muted border-0 h-10 px-4"
          />
          {newMessage.trim() || selectedImage ? (
            <Button onClick={handleSendMessage} size="icon" className="rounded-full shrink-0 h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleVoiceInput} className="rounded-full shrink-0 h-10 w-10">
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
