import React from 'react';
import { useUsers } from '../../context/UserContext';
import UserList from '../users/UserList';
import SearchBox from '../ui/SearchBox';

const UsersTab: React.FC = () => {
  const { searchQuery, setSearchQuery } = useUsers();

  return (
    <>
      <div className="mb-6 md:flex md:items-center md:justify-between">
        <div className="w-full md:max-w-xs mb-4 md:mb-0">
          <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search users..." />
        </div>
      </div>
      <UserList />
    </>
  );
};

export default UsersTab;
