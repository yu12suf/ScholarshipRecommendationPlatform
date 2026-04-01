'use client';

import { useState, useEffect } from 'react';
import { getAllCounselors, updateCounselorVerification } from '../api/admin-api';
import { Button, Card, CardBody, ConfirmModal } from '@/components/ui';
import { Loader2, Check, X, FileText, User as UserIcon, ExternalLink, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const CounselorManagement = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const data = await getAllCounselors();
      setCounselors(data);
    } catch {
      toast.error('Failed to load counselor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await updateCounselorVerification(id, 'verified');
      toast.success('Counselor accepted and verified');
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to accept counselor');
    }
  };

  const handleReject = async (id: number) => {
    setTargetId(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!targetId) return;
    try {
      await updateCounselorVerification(targetId, 'rejected');
      toast.success('Counselor application rejected');
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to reject counselor');
    } finally {
      setTargetId(null);
      setIsRejectModalOpen(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="h2 text-2xl md:text-3xl font-black primary-gradient bg-clip-text text-transparent">Counselor Verification</h2>
          <p className="text-muted-foreground text-sm font-medium">Review and verify counselor expertise and identity</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full">
          <ShieldCheck size={16} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Admin Control Panel</span>
        </div>
      </div>

      <div className="grid gap-6">
        {counselors.length > 0 ? (
          counselors.map((counselor, idx) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`border-border transition-all duration-300 ${expandedId === counselor.id ? 'ring-2 ring-primary/20 shadow-xl' : 'hover:shadow-md'}`}>
                <CardBody className="p-0">
                  {/* Summary Bar */}
                  <div 
                    className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleExpand(counselor.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full primary-gradient text-white flex items-center justify-center font-black text-xl shadow-lg ring-2 ring-background">
                        {counselor.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                          {counselor.name}
                          {counselor.verificationStatus === 'verified' && <Check size={14} className="text-success" />}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">{counselor.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:block text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Specialization</p>
                        <p className="text-sm font-bold text-foreground">{counselor.areasOfExpertise || 'General Advising'}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          counselor.verificationStatus === 'verified' ? 'bg-success/10 text-success' : 
                          counselor.verificationStatus === 'rejected' ? 'bg-destructive/10 text-destructive' : 
                          'bg-warning/10 text-warning animate-pulse'
                        }`}>
                          {counselor.verificationStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {counselor.verificationStatus === 'pending' && (
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAccept(counselor.id)}
                              className="w-8 h-8 p-0 rounded-full hover:bg-success/20 text-success"
                              title="Verify Counselor"
                            >
                              <Check size={16} strokeWidth={3} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(counselor.id)}
                              className="w-8 h-8 p-0 rounded-full hover:bg-destructive/20 text-destructive"
                              title="Reject Application"
                            >
                              <X size={16} strokeWidth={3} />
                            </Button>
                          </div>
                        )}
                        {expandedId === counselor.id ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === counselor.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-muted/20 border-t border-border"
                      >
                        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                          {/* Profile Data */}
                          <div className="space-y-8">
                            <div className="space-y-4">
                              <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <UserIcon size={14} /> Professional Profile
                              </h4>
                              <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
                                <p className="text-sm leading-relaxed text-foreground/80 italic">"{counselor.bio || 'No bio provided.'}"</p>
                                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exp Level</p>
                                    <p className="font-bold text-sm">{counselor.yearsOfExperience || 0} Years</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hourly Rate</p>
                                    <p className="font-bold text-sm">${counselor.hourlyRate || 0}/hr</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification Documents */}
                          <div className="space-y-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                              <FileText size={14} /> Identity Documents
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              {/* CV */}
                              <div className="space-y-2">
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Full Resume</p>
                                <a 
                                  href={counselor.documentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all ${counselor.documentUrl ? 'border-primary/20 bg-primary/5 hover:bg-primary/10' : 'border-border opacity-50 pointer-events-none'}`}
                                >
                                  <FileText className="text-primary mb-2" size={24} />
                                  <span className="text-[10px] font-bold">View CV</span>
                                  {counselor.documentUrl && <ExternalLink size={10} className="mt-1" />}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        {counselor.verificationStatus === 'pending' && (
                          <div className="px-8 py-6 bg-primary/5 border-t border-primary/10 flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              className="border-destructive/20 text-destructive hover:bg-destructive/10 font-bold text-xs uppercase"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(counselor.id);
                              }}
                            >
                              Reject Application
                            </Button>
                            <Button 
                              className="primary-gradient text-white font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccept(counselor.id);
                              }}
                            >
                              Approve Counselor
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardBody>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="border-dashed border-2 border-border bg-transparent">
            <CardBody className="py-20 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <UserIcon size={40} />
              </div>
              <h3 className="text-xl font-bold text-foreground">No counselor applications found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">When experts apply to join the platform, their profiles will appear here for verification.</p>
            </CardBody>
          </Card>
        )}
      </div>

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Counselor"
        description="Are you sure you want to reject this counselor application? The user will be notified of this decision."
        confirmText="Reject Application"
      />
    </div>
  );
};

