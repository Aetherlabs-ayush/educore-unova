import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ArrowUp, Camera, Mic, ArrowLeft, X } from "lucide-react";
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
  const [composerBottom, setComposerBottom] = useState(0);
  const [activeReactionFor, setActiveReactionFor] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longPressTimer = useRef<number | null>(null);

  const reactionOptions = ["❤️", "👍", "👎", "😂", "!!", "?"];

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

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [newMessage]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const syncKeyboardOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setComposerBottom(offset);
    };

    viewport.addEventListener("resize", syncKeyboardOffset);
    viewport.addEventListener("scroll", syncKeyboardOffset);
    syncKeyboardOffset();

    return () => {
      viewport.removeEventListener("resize", syncKeyboardOffset);
      viewport.removeEventListener("scroll", syncKeyboardOffset);
    };
  }, []);

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

  const handleLongPressStart = (id: string) => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => setActiveReactionFor(id), 450);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
  };

  const formatGroupTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 flex h-[100dvh] flex-col bg-secondary overflow-hidden">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center gap-3 shrink-0 pt-[max(env(safe-area-inset-top),0.75rem)]">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold">Live Class Chat</h1>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-secondary px-2.5 pb-28 pt-3">
        {messages.map((msg, index) => {
          const isMe = msg.sender_name === currentUser?.name;
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const startsGroup = !previous || previous.sender_name !== msg.sender_name;
          const endsGroup = !next || next.sender_name !== msg.sender_name;
          return (
            <div key={msg.id} className={`flex items-end gap-1.5 ${startsGroup ? "mt-3" : "mt-0.5"} ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && endsGroup ? (
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={msg.sender_image} />
                  <AvatarFallback className="text-[11px]">{msg.sender_name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : !isMe ? (
                <div className="h-7 w-7 shrink-0" />
              ) : null}
              <div className={`max-w-[76%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                {!isMe && startsGroup && <p className="mb-1 px-2 text-[11px] leading-none text-muted-foreground">{msg.sender_name}</p>}
                <div
                  className={`px-3.5 py-2 text-[15px] leading-5 shadow-sm ${
                    isMe
                      ? `bg-primary text-primary-foreground ${startsGroup ? "rounded-tr-[1.35rem]" : "rounded-tr-md"} ${endsGroup ? "rounded-br-md" : "rounded-br-[1.35rem]"} rounded-l-[1.35rem]`
                      : `bg-background text-foreground ${startsGroup ? "rounded-tl-[1.35rem]" : "rounded-tl-md"} ${endsGroup ? "rounded-bl-md" : "rounded-bl-[1.35rem]"} rounded-r-[1.35rem] border border-border/40`
                  }`}
                >
                  {msg.message_type === "image" && msg.file_url && (
                    <img src={msg.file_url} alt="Chat attachment" className="mb-1 max-w-full rounded-[1rem]" loading="lazy" />
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                </div>
                {isMe && endsGroup && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="px-2 pt-0.5 text-[11px] leading-4 text-muted-foreground hover:text-destructive">
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input — bottom-aligned, follows keyboard */}
      <div
        className="fixed left-0 right-0 z-20 border-t border-border/50 bg-background/95 px-2.5 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur-xl"
        style={{ bottom: composerBottom }}
      >
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="Selected attachment preview" className="h-16 w-16 object-cover rounded-2xl" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-1 rounded-full bg-secondary px-1 py-1 shadow-[var(--shadow-card)]">
          <Button variant="ghost" size="icon" onClick={handleImageUpload} className="h-9 w-9 shrink-0 rounded-full">
            <Paperclip className="h-4.5 w-4.5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="iMessage"
            className="h-9 flex-1 rounded-full border border-border/60 bg-background px-3.5 text-[16px] leading-none shadow-none placeholder:text-muted-foreground"
          />
          {newMessage.trim() || selectedImage ? (
            <Button onClick={handleSendMessage} size="icon" className="h-9 w-9 shrink-0 rounded-full">
              <Send className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleVoiceInput} className="h-9 w-9 shrink-0 rounded-full">
              <Mic className="h-4.5 w-4.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
