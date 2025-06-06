import React from 'react';
import { useUsers } from '../../context/UserContext';
import Spinner from '../ui/Spinner';
import Pagination from '../ui/Pagination';
import EmptyState from '../ui/EmptyState';
import ErrorDisplay from '../ui/ErrorDisplay';
import { Users as UsersIcon } from 'lucide-react';

const UserList: React.FC = () => {
  const {
    users,
    loading,
    error,
    totalUsers,
    currentPage,
    fetchUsersPage,
    refreshUsers,
  } = useUsers();

  const recordsPerPage = 10;
  const totalPages = Math.ceil(totalUsers / recordsPerPage);

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={refreshUsers} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title="No Users Found"
        message="No users available."
        icon={<UsersIcon className="w-16 h-16 text-gray-400" />}
      />
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray-200">
          <thead className="bg-light-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-text uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-light-gray-200">
            {users.map(user => (
              <tr key={user.user_id} className="hover:bg-light-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text font-medium">{user.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">{user.role || <span className="italic text-gray-400">N/A</span>}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text/80">{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && users.length > 0 && (
        <div className="my-4 flex justify-center"><Spinner size="md" /></div>
      )}
      {totalPages > 1 && (
        <div className="p-4 border-t border-light-gray-200">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchUsersPage} />
        </div>
      )}
    </div>
  );
};

export default UserList;
