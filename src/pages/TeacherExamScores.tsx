import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Student = {
  id: string;
  name: string;
  class: string;
  division: string;
  phone: string;
  image?: string;
};

const TeacherExamScores = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [examData, setExamData] = useState({
    subject: "",
    testName: "",
    score: "",
    total: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('role', 'student')
        .order('name');

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load student profiles",
        variant: "destructive"
      });
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('test_scores')
        .insert({
          student_id: selectedStudent.id,
          subject: examData.subject,
          test_name: examData.testName,
          score: parseInt(examData.score),
          total: parseInt(examData.total),
          date: examData.date
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Exam score uploaded for ${selectedStudent.name}`,
      });

      // Reset form
      setExamData({
        subject: "",
        testName: "",
        score: "",
        total: "",
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedStudent(null);
    } catch (error: any) {
      console.error('Error uploading score:', error);
      toast({
        title: "Error",
        description: "Failed to upload exam score",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Exam Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Select a student and enter their exam details
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student List */}
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {students.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedStudent?.id === student.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.image} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Class {student.class}-{student.division}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exam Score Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStudent ? `Score for ${selectedStudent.name}` : 'Select a Student'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <form onSubmit={handleSubmitScore} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={examData.subject}
                      onChange={(e) => setExamData({...examData, subject: e.target.value})}
                      placeholder="e.g., Mathematics"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="testName">Test Name</Label>
                    <Input
                      id="testName"
                      value={examData.testName}
                      onChange={(e) => setExamData({...examData, testName: e.target.value})}
                      placeholder="e.g., Mid-term Exam"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="score">Score Obtained</Label>
                      <Input
                        id="score"
                        type="number"
                        value={examData.score}
                        onChange={(e) => setExamData({...examData, score: e.target.value})}
                        placeholder="85"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="total">Total Marks</Label>
                      <Input
                        id="total"
                        type="number"
                        value={examData.total}
                        onChange={(e) => setExamData({...examData, total: e.target.value})}
                        placeholder="100"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="date">Exam Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={examData.date}
                      onChange={(e) => setExamData({...examData, date: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Uploading..." : "Upload Score"}
                  </Button>
                </form>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Select a student from the list to upload their exam score
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherExamScores;
