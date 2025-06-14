
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Calendar, Edit, Book } from 'lucide-react';
import { format } from 'date-fns';
import Navbar from '../components/Navbar';

const JournalList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { entries } = useJournalEntries();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Journal</h1>
              <p className="text-gray-600">
                {entries.length === 0 
                  ? "Start your journaling journey today"
                  : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} in your collection`
                }
              </p>
            </div>
            
            <Link to="/new-entry">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search your entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Entries Grid */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              {entries.length === 0 ? (
                // No entries at all
                <div className="max-w-md mx-auto">
                  <div className="p-6 bg-orange-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Book className="h-12 w-12 text-orange-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Start Your First Entry
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Your journal is empty. Create your first entry to begin capturing your thoughts and memories.
                  </p>
                  <Link to="/new-entry">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Entry
                    </Button>
                  </Link>
                </div>
              ) : (
                // No search results
                <div className="max-w-md mx-auto">
                  <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    No entries found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or create a new entry.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry) => (
                <Card 
                  key={entry.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-orange-100 group"
                  onClick={() => navigate(`/entry/${entry.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {entry.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit/${entry.id}`);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(entry.date)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 line-clamp-4">
                      {truncateContent(entry.content)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalList;
