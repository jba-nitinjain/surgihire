import React from 'react';
import { useUsers } from '../../context/UserContext';
import UserList from '../users/UserList';
import SearchBox from '../ui/SearchBox';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UsersTab: React.FC = () => {
  const { searchQuery, setSearchQuery, totalUsers } = useUsers();
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="w-full md:max-w-xs mb-4 md:mb-0">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." />
        </div>
        {totalUsers > 1 && (
          <button
            onClick={() => navigate('/users/new')}
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition-colors"
          >
            <PlusCircle className="h-5 w-5 mr-2" />Add New User
          </button>
        )}
      </div>
      <UserList />
    </>
  );
};

export default UsersTab;
