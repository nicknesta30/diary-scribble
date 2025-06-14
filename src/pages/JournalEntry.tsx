
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';

const JournalEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { createEntry, updateEntry, getEntry, isLoading } = useJournalEntries();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    if (isEditMode && id) {
      const entry = getEntry(id);
      if (entry) {
        setFormData({
          title: entry.title,
          content: entry.content,
          date: entry.date
        });
      } else {
        toast({
          title: "Entry not found",
          description: "The journal entry you're looking for doesn't exist.",
          variant: "destructive"
        });
        navigate('/entries');
      }
    }
  }, [user, navigate, isEditMode, id, getEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Title and content are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditMode && id) {
        await updateEntry({ id, ...formData });
        toast({
          title: "Entry updated!",
          description: "Your journal entry has been successfully updated.",
        });
      } else {
        await createEntry(formData);
        toast({
          title: "Entry saved!",
          description: "Your journal entry has been successfully created.",
        });
      }
      navigate('/entries');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/entries')}
                className="text-gray-600 hover:text-orange-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Entries
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Entry' : 'New Journal Entry'}
            </h1>
            
            <div></div>
          </div>

          <Card className="shadow-lg border-orange-100">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-900">
                {isEditMode ? 'Update your thoughts' : 'What\'s on your mind?'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-lg font-medium">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Give your entry a title..."
                      className="text-lg"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-lg font-medium">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="text-lg"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-lg font-medium">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write about your day, thoughts, feelings, or anything else..."
                    className="min-h-[400px] text-base leading-relaxed resize-none"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/entries')}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600 px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading 
                      ? (isEditMode ? 'Updating...' : 'Saving...') 
                      : (isEditMode ? 'Update Entry' : 'Save Entry')
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry;
