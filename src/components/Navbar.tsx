
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Book, Plus, List } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/entries" className="flex items-center space-x-2">
            <Book className="h-6 w-6 text-orange-500" />
            <span className="text-xl font-semibold text-gray-900">My Journal</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/entries">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-500">
                <List className="h-4 w-4 mr-2" />
                Entries
              </Button>
            </Link>
            
            <Link to="/new-entry">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Hello, {user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
