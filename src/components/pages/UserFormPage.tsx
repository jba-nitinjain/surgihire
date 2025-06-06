import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import UserForm from '../users/UserForm';
import { User } from '../../types';
import { getUser } from '../../services/api/users';
import { useUsers } from '../../context/UserContext';

const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation() as { state?: { user?: User } };
  const [user, setUser] = useState<User | null>(location.state?.user || null);
  const [loading, setLoading] = useState<boolean>(!!id && !user);
  const { refreshUsers } = useUsers();

  useEffect(() => {
    if (id && !user) {
      getUser(id)
        .then(res => {
          if (res.success && res.data) {
            const data = Array.isArray(res.data) ? res.data[0] : res.data;
            setUser(data as User);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <UserForm
        user={user}
        onSave={() => {
          refreshUsers();
          navigate('/users');
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};

export default UserFormPage;
