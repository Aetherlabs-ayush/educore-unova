import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TeacherProfileCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Insert into teachers table
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          name: formData.name,
          class: formData.subject,
          division: 'All',
          subject: formData.subject
        });

      if (teacherError) throw teacherError;

      // Also add to public_profiles with teacher role
      const { error: profileError } = await supabase
        .from('public_profiles')
        .insert({
          name: formData.name,
          phone: formData.phone,
          class: formData.subject,
          division: 'All',
          dob: new Date().toISOString().split('T')[0],
          role: 'teacher'
        });

      if (profileError) throw profileError;

      // Store in localStorage
      localStorage.setItem('teacher-profile', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject
      }));

      toast({
        title: "Success!",
        description: "Teacher profile created successfully",
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Error creating teacher profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="w-fit mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          <CardTitle className="text-2xl">Create Teacher Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="e.g., Mathematics, Science, English"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Teacher Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherProfileCreate;
