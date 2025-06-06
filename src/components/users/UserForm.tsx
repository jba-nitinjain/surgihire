import React, { useState, useEffect } from 'react';
import { User, UserFormData } from '../../types';
import { useCrud } from '../../context/CrudContext';
import { Save, X, Loader2 } from 'lucide-react';
import OutlinedTextField from '../ui/OutlinedTextField';

interface UserFormProps {
  user?: User | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: UserFormData = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
};

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};
    if (!/^\d{10}$/.test(formData.username)) {
      errors.username = 'Enter a valid 10 digit mobile number.';
    }
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required.';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required.';
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'username') {
      processedValue = value.replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (formErrors[name as keyof UserFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      if (user && user.user_id) {
        await updateItem('users1', user.user_id, formData);
      } else {
        await createItem('users1', formData);
      }
      onSave();
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  const inputClass = 'mt-1 block w-full';

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {crudError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
            <p className="font-bold">Error Saving User</p>
            <p>{crudError}</p>
          </div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-dark-text mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <OutlinedTextField
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '\\d*' }}
            className={inputClass}
          />
          {formErrors.username && <p className="text-xs text-red-500 mt-1">{formErrors.username}</p>}
        </div>
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-dark-text mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <OutlinedTextField
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={inputClass}
          />
          {formErrors.first_name && <p className="text-xs text-red-500 mt-1">{formErrors.first_name}</p>}
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-dark-text mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <OutlinedTextField
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={inputClass}
          />
          {formErrors.last_name && <p className="text-xs text-red-500 mt-1">{formErrors.last_name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark-text mb-1">
            Email ID <span className="text-red-500">*</span>
          </label>
          <OutlinedTextField
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
          {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
        </div>
        <div className="flex justify-end items-center pt-4 border-t border-light-gray-200 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={crudLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
          >
            <X className="inline h-4 w-4 mr-1" /> Cancel
          </button>
          <button
            type="submit"
            disabled={crudLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
          >
            {crudLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="inline h-4 w-4 mr-1" />}
            {user ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
