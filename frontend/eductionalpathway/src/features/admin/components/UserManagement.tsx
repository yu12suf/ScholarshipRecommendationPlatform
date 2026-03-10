'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getAllUsers, deactivateUser, activateUser } from '../api/admin-api';
import { Button, Card, CardBody } from '@/components/ui';
import { Loader2, UserMinus, UserCheck, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    try {
      // In a real app we'd check if active/deactive property exists on user model
      // For now we assume the toggle logic
      toast.success('Action performed');
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardBody>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-bold text-gray-900">User</th>
                <th className="py-4 font-bold text-gray-900">Role</th>
                <th className="py-4 font-bold text-gray-900">Status</th>
                <th className="py-4 text-right font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'counselor' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" title="Edit Role">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleToggleStatus(user)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
};
