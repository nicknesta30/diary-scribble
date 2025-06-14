
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import Navbar from '../components/Navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const EntryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getEntry, deleteEntry, isLoading } = useJournalEntries();

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const entry = id ? getEntry(id) : null;

  React.useEffect(() => {
    if (!entry && id) {
      toast({
        title: "Entry not found",
        description: "The journal entry you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate('/entries');
    }
  }, [entry, id, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteEntry(id);
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been successfully deleted.",
      });
      navigate('/entries');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error deleting your entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const formatCreatedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy \'at\' h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  if (!user || !entry) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/entries')}
              className="text-gray-600 hover:text-orange-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Entries
            </Button>
            
            <div className="flex items-center space-x-2">
              <Link to={`/edit/${entry.id}`}>
                <Button variant="outline" className="border-orange-200 hover:bg-orange-50">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this entry? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Entry Content */}
          <Card className="shadow-lg border-orange-100">
            <CardHeader className="pb-6">
              <div className="space-y-4">
                <CardTitle className="text-4xl font-bold text-gray-900 leading-tight">
                  {entry.title}
                </CardTitle>
                
                <div className="flex items-center space-x-6 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">{formatDate(entry.date)}</span>
                  </div>
                  
                  <div className="text-sm">
                    Created on {formatCreatedDate(entry.createdAt)}
                  </div>
                  
                  {entry.updatedAt !== entry.createdAt && (
                    <div className="text-sm">
                      Last updated {formatCreatedDate(entry.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntryDetails;
