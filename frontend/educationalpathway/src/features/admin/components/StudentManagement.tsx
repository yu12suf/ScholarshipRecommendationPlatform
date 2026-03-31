'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getAllUsers } from '../api/admin-api';

import { Button, Card, CardBody } from '@/components/ui';
import { Loader2, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ConfirmModal } from '@/components/ui';

export const StudentManagement = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      const filtered = data.filter(user => user.role === 'student');
      setStudents(filtered);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      // In a real app, call delete API: await deleteUser(studentToDelete);
      toast.success('Student deleted');
      fetchStudents();
    } catch {
      toast.error('Delete failed');
    } finally {
      setStudentToDelete(null);
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
    <Card className="bg-card border-border rounded-lg">
      <CardBody className="p-0">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* Table Header */}

            <thead className="bg-muted/40 border-b border-border">

              <tr className="text-sm text-muted-foreground">

                <th className="text-left px-6 py-4 font-semibold">
                  Student
                </th>

                <th className="text-left px-6 py-4 font-semibold">
                  Status
                </th>

                <th className="text-right px-6 py-4 font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            {/* Table Body */}

            <tbody>

              {students.length > 0 ? (
                students.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >

                    {/* Student Info */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">

                          {user.name.charAt(0)}

                        </div>

                        <div>

                          <p className="font-semibold text-foreground">
                            {user.name}
                          </p>
                        </div>

                      </div>

                    </td>

                    {/* Status */}

                    <td className="px-6 py-4">

                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-success">

                        <span className="h-2 w-2 rounded-full bg-success" />

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
                          title="Edit Student"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>

                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No students found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </CardBody>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Student"
        description="Are you sure you want to delete this student profile? This action cannot be undone."
        confirmText="Delete"
      />
    </Card>
  );
};
