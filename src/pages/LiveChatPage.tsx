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
    <div className="fixed inset-0 flex h-[100dvh] flex-col overflow-hidden bg-[hsl(var(--imessage-background))] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text',sans-serif] text-foreground">
      {/* Header */}
      <div className="shrink-0 bg-[hsl(var(--imessage-background)/0.88)] px-4 py-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur-xl flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-base font-semibold">Live Class Chat</h1>
          <p className="text-xs text-muted-foreground">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[hsl(var(--imessage-background))] px-2.5 pb-32 pt-2">
        {messages.map((msg, index) => {
          const isMe = msg.sender_name === currentUser?.name;
          const previous = messages[index - 1];
          const next = messages[index + 1];
          const startsGroup = !previous || previous.sender_name !== msg.sender_name;
          const endsGroup = !next || next.sender_name !== msg.sender_name;
          const showTimestamp = startsGroup;
          const isLatestSent = isMe && !messages.slice(index + 1).some((message) => message.sender_name === currentUser?.name);
          return (
            <div key={msg.id}>
              {showTimestamp && (
                <p className="py-2 text-center text-xs font-medium text-[hsl(var(--imessage-gray))]">{formatGroupTimestamp(msg.timestamp)}</p>
              )}
              <div className={`flex items-end gap-2 ${startsGroup ? "mt-3" : "mt-0.5"} ${isMe ? "justify-end" : "justify-start"}`}>
                {!isMe && endsGroup ? (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.sender_image} />
                    <AvatarFallback className="text-xs">{msg.sender_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : !isMe ? (
                  <div className="h-8 w-8 shrink-0" />
                ) : null}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  onContextMenu={(event) => {
                    event.preventDefault();
                    setActiveReactionFor(msg.id);
                  }}
                  onTouchStart={() => handleLongPressStart(msg.id)}
                  onTouchEnd={handleLongPressEnd}
                  onMouseDown={() => handleLongPressStart(msg.id)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  className={`relative px-[14px] py-[10px] text-[16px] leading-5 imessage-bubble-in ${
                    isMe
                      ? "rounded-[18px] rounded-br-[4px] bg-[hsl(var(--imessage-blue))] text-primary-foreground"
                      : "rounded-[18px] rounded-bl-[4px] bg-[hsl(var(--imessage-received))] text-[hsl(var(--imessage-received-foreground))]"
                  }`}
                >
                  {activeReactionFor === msg.id && (
                    <div className={`absolute -top-12 z-30 flex items-center gap-1 rounded-full bg-popover px-2 py-1.5 shadow-lg ${isMe ? "right-0" : "left-0"}`}>
                      {reactionOptions.map((reaction) => (
                        <button key={reaction} onClick={() => { setReactions((prev) => ({ ...prev, [msg.id]: reaction })); setActiveReactionFor(null); }} className="flex h-8 min-w-8 items-center justify-center rounded-full px-1 text-lg transition-transform hover:scale-110">
                          {reaction}
                        </button>
                      ))}
                    </div>
                  )}
                  {msg.message_type === "image" && msg.file_url && (
                    <img src={msg.file_url} alt="Chat attachment" className="mb-1 max-w-full rounded-[1rem]" loading="lazy" />
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  {reactions[msg.id] && <span className={`absolute -bottom-3 ${isMe ? "right-1" : "left-1"} rounded-full bg-background px-1 text-sm shadow-sm`}>{reactions[msg.id]}</span>}
                </div>
                {isMe && isLatestSent && <p className="pr-2 pt-1 text-[11px] leading-4 text-[hsl(var(--imessage-gray))]">Delivered</p>}
                {isMe && endsGroup && !isLatestSent && (
                  <button onClick={() => handleDeleteMessage(msg.id)} className="px-2 pt-0.5 text-[11px] leading-4 text-muted-foreground hover:text-destructive">
                    Delete
                  </button>
                )}
              </div>
              </div>
            </div>
          );
        })}
        {messages.length > 0 && (
          <div className="mt-3 flex items-end gap-2">
            <div className="h-8 w-8 shrink-0" />
            <div className="flex h-9 items-center gap-1 rounded-[18px] rounded-bl-[4px] bg-[hsl(var(--imessage-received))] px-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--imessage-gray))] imessage-typing-dot" />
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--imessage-gray))] imessage-typing-dot [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--imessage-gray))] imessage-typing-dot [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input — bottom-aligned, follows keyboard */}
      <div
        className="fixed left-0 right-0 z-20 border-t border-[hsl(var(--imessage-border))] bg-[hsl(var(--imessage-background)/0.96)] px-3 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] backdrop-blur-xl"
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
