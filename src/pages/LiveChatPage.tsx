import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  useEffect(() => {
    loadProfile();
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProfile = () => {
    const profiles = JSON.parse(localStorage.getItem('student-profiles') || '[]');
    if (profiles.length > 0) {
      setCurrentUser(profiles[profiles.length - 1]);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    if (!currentUser) {
      toast({ title: "Please create a profile first", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_name: currentUser.name,
          message: newMessage.trim() || 'Sent an image',
          sender_image: currentUser.image,
          sender_phone: currentUser.phone,
          message_type: selectedImage ? 'image' : 'text',
          file_url: selectedImage
        });

      if (error) throw error;

      setNewMessage("");
      setSelectedImage(null);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({ title: "Failed to send message", variant: "destructive" });
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
      };

      recognition.onerror = () => {
        toast({ title: "Voice input failed", variant: "destructive" });
      };

      recognition.start();
    } else {
      toast({ title: "Voice input not supported in this browser", variant: "destructive" });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({ title: "Failed to delete message", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">Live Class Chat</h1>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender_name === currentUser?.name ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender_name !== currentUser?.name && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.sender_image} />
                  <AvatarFallback>{msg.sender_name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] ${msg.sender_name === currentUser?.name ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">{msg.sender_name}</p>
                  {msg.sender_name === currentUser?.name && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Card className={`p-3 ${msg.sender_name === currentUser?.name ? 'bg-blue-500 text-white' : 'bg-white'}`}>
                  <p>{msg.message}</p>
                  {msg.message_type === 'image' && msg.file_url && (
                    <img src={msg.file_url} alt="Uploaded" className="mt-2 rounded-lg max-w-full" />
                  )}
                </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          {selectedImage && (
            <div className="mb-2 relative inline-block">
              <img src={selectedImage} alt="Selected" className="h-20 w-20 object-cover rounded" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleImageUpload}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={handleVoiceInput}>
              <Mic className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatPage;
