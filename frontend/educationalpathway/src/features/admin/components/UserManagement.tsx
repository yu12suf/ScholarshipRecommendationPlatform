'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getAllUsers } from '../api/admin-api';

import { Button, Card, CardBody } from '@/components/ui';

import { Loader2, UserMinus, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setIsConfirmModalOpen(true);
  };

  const confirmToggle = async () => {
    if (!selectedUser) return;
    try {
      toast.success('User status updated');
      fetchUsers();
    } catch {
      toast.error('Action failed');
    } finally {
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-border bg-background rounded-lg">

      <CardBody className="p-0">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* Header */}

            <thead className="bg-muted/40 border-b border-border">

              <tr className="text-sm text-muted-foreground">

                <th className="text-left px-6 py-4 font-semibold">User</th>
                <th className="text-left px-6 py-4 font-semibold">Role</th>
                <th className="text-left px-6 py-4 font-semibold">Status</th>
                <th className="text-right px-6 py-4 font-semibold">Actions</th>

              </tr>

            </thead>

            {/* Body */}

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >

                  {/* User */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">

                        {user.name.charAt(0)}

                      </div>

                      <div>

                        <p className="font-semibold text-foreground">
                          {user.name}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>

                      </div>

                    </div>

                  </td>

                  {/* Role */}

                  <td className="px-6 py-4">

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold capitalize
                      ${
                        user.role === 'admin'
                          ? 'bg-destructive/10 text-destructive'
                          : user.role === 'counselor'
                          ? 'bg-info/10 text-info'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {user.role}
                    </span>

                  </td>

                  {/* Status */}

                  <td className="px-6 py-4">

                    <span className="text-sm font-medium text-success">
                      Active
                    </span>

                  </td>

                  {/* Actions */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-muted"
                        title="Edit Role"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleToggleStatus(user)}
                      >
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

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmToggle}
        title="Deactivate User"
        description={`Are you sure you want to deactivate ${selectedUser?.name}? They will lose access to the platform.`}
        confirmText="Deactivate"
      />
    </Card>
  );
};
