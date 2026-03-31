'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getAllUsers } from '../api/admin-api';

import { Button, Card, CardBody } from '@/components/ui';

import { Loader2, UserPlus, Check, X, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ConfirmModal } from '@/components/ui';

export const CounselorManagement = () => {
  const [counselors, setCounselors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      const filtered = data.filter((user) => user.role === 'counselor');
      setCounselors(filtered);
    } catch {
      toast.error('Failed to load counselors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleAccept = async (id: number) => {
    toast.success('Counselor accepted');
  };

  const handleReject = async (id: number) => {
    setTargetId(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!targetId) return;
    toast.error('Counselor rejected');
    setTargetId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-end justify-between">

        <div className="space-y-2">

          <h2 className="h2">
            Counselor Network
          </h2>

          <p className="text-small">
            Manage expert advisors and verified mentors
          </p>

        </div>

        <Button className="primary-gradient text-primary-foreground h-12 px-6 rounded-lg font-semibold">

          <UserPlus className="mr-2 h-4 w-4" />

          Onboard Counselor

        </Button>

      </div>

      {/* Table */}

      <Card className="border-border bg-card rounded-lg">

        <CardBody className="p-0">

          <div className="overflow-x-auto">

            <table className="w-full">

              {/* Header */}

              <thead className="bg-muted/40 border-b border-border">

                <tr className="text-muted-foreground text-sm">

                  <th className="px-6 py-4 text-left font-semibold">
                    Counselor
                  </th>

                  <th className="px-6 py-4 text-left font-semibold">
                    Specialization
                  </th>

                  <th className="px-6 py-4 text-left font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* Body */}

              <tbody>

                {counselors.length > 0 ? (
                  counselors.map((counselor, idx) => (

                    <motion.tr
                      key={counselor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-border hover:bg-muted/30 transition"
                    >

                      {/* Counselor */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">

                            {counselor.name.charAt(0)}

                          </div>

                          <div>

                            <p className="font-semibold text-foreground">
                              {counselor.name}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Specialization */}

                      <td className="px-6 py-4">

                        <div className="flex flex-col">

                          <span className="text-sm font-medium text-foreground">
                            Academic Advising
                          </span>

                          <span className="text-xs text-muted-foreground">
                            General
                          </span>

                        </div>

                      </td>

                      {/* Status */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />

                          <span className="text-xs font-semibold text-warning">
                            Pending
                          </span>

                        </div>

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAccept(counselor.id)}
                            className="hover:bg-success/10 text-success"
                          >

                            <Check className="h-4 w-4" />

                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(counselor.id)}
                            className="hover:bg-destructive/10 text-destructive"
                          >

                            <X className="h-4 w-4" />

                          </Button>

                        </div>

                      </td>

                    </motion.tr>

                  ))
                ) : (
                  <tr>

                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No counselors found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </CardBody>

      </Card>

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Counselor"
        description="Are you sure you want to reject this counselor application?"
        confirmText="Reject"
      />
    </div>
  );
};
