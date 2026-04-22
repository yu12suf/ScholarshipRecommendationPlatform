'use client';

import { useState, useEffect } from 'react';
import { getAllCounselors, updateCounselorVerification } from '../api/admin-api';
import { Button, ConfirmModal } from '@/components/ui';
import { Loader2, Check, X, FileText, User as UserIcon, ExternalLink, ShieldCheck, Mail, MapPin, Briefcase, GraduationCap, Banknote, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { adminPayoutCounselor } from '../api/admin-api';

export const CounselorManagement = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<any | null>(null);

  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [isPayoutProcessing, setIsPayoutProcessing] = useState(false);

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
      if (selectedCounselor && selectedCounselor.id === id) {
        setSelectedCounselor({ ...selectedCounselor, verificationStatus: 'verified' });
      }
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
      if (selectedCounselor && selectedCounselor.id === targetId) {
        setSelectedCounselor({ ...selectedCounselor, verificationStatus: 'rejected' });
      }
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to reject counselor');
    } finally {
      setTargetId(null);
      setIsRejectModalOpen(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedCounselor) return;
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0 || amount > Number(selectedCounselor.pendingBalance)) {
      toast.error('Invalid payout amount or insufficient balance');
      return;
    }
    setIsPayoutProcessing(true);
    try {
      await adminPayoutCounselor(selectedCounselor.id, amount);
      toast.success('Payout processed successfully!');
      
      const newBalance = Number(selectedCounselor.pendingBalance) - amount;
      setSelectedCounselor({ ...selectedCounselor, pendingBalance: newBalance });
      setPayoutAmount('');
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to process payout.');
    } finally {
      setIsPayoutProcessing(false);
    }
  };

  const handleReview = (counselor: any) => {
    setSelectedCounselor(counselor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-6 w-6" />
      </div>
    );
  }

  // DETAILS VIEW (SECTION-BASED, NO CARDS)
  if (selectedCounselor) {
    return (
      <div className="space-y-12 pb-24 max-w-6xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <Button 
               variant="ghost" 
               onClick={() => setSelectedCounselor(null)}
               className="h-10 px-0 hover:bg-transparent text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">←</div>
              Back to List
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-4">
              {selectedCounselor.profileImageUrl ? (
                <img 
                  src={selectedCounselor.profileImageUrl} 
                  alt={selectedCounselor.name} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-primary font-black">
                  {selectedCounselor.name?.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedCounselor.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2 opacity-60 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-primary" /> Counselor Application Review
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {selectedCounselor.verificationStatus === 'pending' ? (
                <>
                  <Button 
                    variant="outline"
                    className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg hover:bg-destructive/5"
                    onClick={() => handleReject(selectedCounselor.id)}
                  >
                    Reject Application
                  </Button>
                  <Button 
                    className="primary-gradient text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                    onClick={() => handleAccept(selectedCounselor.id)}
                  >
                    Verify & Approve
                  </Button>
                </>
             ) : (
                <div className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest border ${
                  selectedCounselor.verificationStatus === 'verified' ? 'bg-success/5 text-success border-success/20' : 'bg-destructive/5 text-destructive border-destructive/20'
                }`}>
                  Status: {selectedCounselor.verificationStatus}
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-16">
            {/* Biography Section */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                 <UserIcon size={16} /> Candidate Biography
              </h3>
              <div className="p-8 bg-muted/30 border border-border/50 rounded-2xl italic text-lg leading-relaxed text-foreground/80 font-medium">
                "{selectedCounselor.bio || 'No professional biography provided.'}"
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Years of Experience</p>
                    <p className="text-3xl font-black text-foreground">{selectedCounselor.yearsOfExperience || 0} Years</p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Hourly Rate</p>
                    <p className="text-3xl font-black text-foreground">{selectedCounselor.hourlyRate || 0} <span className="text-sm">ETB</span></p>
                 </div>
              </div>
            </section>

            {/* Financial & Payout Section */}
            {selectedCounselor.verificationStatus === 'verified' && (
              <section className="space-y-6 pt-8 border-t border-border/40">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Banknote size={16} /> Financial Overview
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Earned</p>
                       <p className="text-4xl font-black mt-2">{Number(selectedCounselor.totalEarned || 0).toLocaleString()} <span className="text-xs text-slate-400">ETB</span></p>
                    </div>
                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pending Amount</p>
                       <div className="mt-2">
                         <p className="text-4xl font-black text-foreground">{Number(selectedCounselor.pendingBalance || 0).toLocaleString()} <span className="text-xs text-muted-foreground">ETB</span></p>
                       </div>
                       
                       <div className="mt-6 flex flex-col sm:flex-row gap-3">
                         <input 
                           type="number"
                           className="h-10 bg-background border border-border rounded-lg px-3 text-sm flex-1 w-full"
                           placeholder="Amount to payout"
                           value={payoutAmount}
                           max={selectedCounselor.pendingBalance || 0}
                           onChange={(e) => setPayoutAmount(e.target.value)}
                         />
                         <Button 
                           isLoading={isPayoutProcessing}
                           disabled={isPayoutProcessing || !payoutAmount || Number(payoutAmount) <= 0 || Number(payoutAmount) > Number(selectedCounselor.pendingBalance)}
                           onClick={handleProcessPayout}
                           className="h-10 text-xs font-bold whitespace-nowrap bg-success hover:bg-success/90 text-white"
                         >
                           Process Payout
                         </Button>
                       </div>
                    </div>
                 </div>
              </section>
            )}

            {/* Employment & Academic Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-border/40">
               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <Briefcase size={16} /> Profession
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Position</span>
                        <p className="text-lg font-bold mt-1">{selectedCounselor.currentPosition || 'N/A'}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organization</span>
                        <p className="text-lg font-bold mt-1">{selectedCounselor.organization || 'N/A'}</p>
                     </div>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <GraduationCap size={16} /> Education
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Highest Degree</span>
                        <p className="text-lg font-bold mt-1">{selectedCounselor.highestEducationLevel || 'N/A'}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">University</span>
                        <p className="text-lg font-bold mt-1">{selectedCounselor.universityName || 'N/A'}</p>
                     </div>
                  </div>
               </section>
            </div>

            {/* Tags Section */}
            <section className="space-y-8 pt-8 border-t border-border/40">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Fields of Study</h4>
                     <div className="flex flex-wrap gap-2">
                        {(() => {
                           try {
                              const fields = JSON.parse(selectedCounselor.fieldsOfStudy || '[]');
                              return fields.length > 0 ? fields.map((f: string) => (
                                 <span key={f} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-[10px] font-black uppercase tracking-tighter">{f}</span>
                              )) : <span className="text-sm font-bold opacity-40 italic">Not specified</span>;
                           } catch {
                              return <span className="text-base font-bold text-foreground">{selectedCounselor.fieldsOfStudy || 'N/A'}</span>;
                           }
                        })()}
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Expertise Areas</h4>
                     <div className="flex flex-wrap gap-2">
                        {(() => {
                           try {
                              const expertise = JSON.parse(selectedCounselor.areasOfExpertise || '[]');
                              return expertise.length > 0 ? expertise.map((e: string) => (
                                 <span key={e} className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-md text-[10px] font-black uppercase tracking-tighter">{e}</span>
                              )) : <span className="text-sm font-bold opacity-40 italic">Not specified</span>;
                           } catch {
                              return <span className="text-base font-bold text-foreground">{selectedCounselor.areasOfExpertise || 'N/A'}</span>;
                           }
                        })()}
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Verification Sidebar (Plain, no cards) */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
               <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity & Contact</h3>
                  <div className="pt-4 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Mail size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Email Address</p>
                           <p className="text-sm font-bold">{selectedCounselor.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><MapPin size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Location</p>
                           <p className="text-sm font-bold">{selectedCounselor.city}, {selectedCounselor.countryOfResidence}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-8 border-t border-border/40">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <FileText size={16} /> Review Verifications
                  </h3>
                  <div className="space-y-4">
                     <div className="group flex flex-col p-6 bg-muted/10 border border-border/40 rounded-xl hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between">
                           <FileText className="text-primary" size={24} />
                           <div className="flex items-center gap-2">
                              <a href={selectedCounselor.cvUrl || selectedCounselor.documentUrl} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View</a>
                              <span className="text-muted-foreground opacity-20">|</span>
                              <a href={selectedCounselor.cvUrl || selectedCounselor.documentUrl} download className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Download</a>
                           </div>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest mt-4">Professional CV</span>
                        <span className="text-[9px] text-muted-foreground mt-1 font-bold">Verify academic credentials</span>
                     </div>

                     <div className="group flex flex-col p-6 bg-muted/10 border border-border/40 rounded-xl hover:border-warning/50 transition-colors">
                        <div className="flex items-center justify-between">
                           <UserIcon className="text-warning" size={24} />
                           <div className="flex items-center gap-2">
                              <a href={selectedCounselor.idCardUrl} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-warning hover:underline">View</a>
                              <span className="text-muted-foreground opacity-20">|</span>
                              <a href={selectedCounselor.idCardUrl} download className="text-[10px] font-black uppercase tracking-widest text-warning hover:underline">Download</a>
                           </div>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest mt-4">Identity Card</span>
                        <span className="text-[9px] text-muted-foreground mt-1 font-bold">Standard government ID</span>
                     </div>

                     <div className="group flex flex-col p-6 bg-muted/10 border border-border/40 rounded-xl hover:border-success/50 transition-colors">
                        <div className="flex items-center justify-between">
                           <Check className="text-success" size={24} />
                           <div className="flex items-center gap-2">
                              <a href={selectedCounselor.selfieUrl} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-success hover:underline">View</a>
                              <span className="text-muted-foreground opacity-20">|</span>
                              <a href={selectedCounselor.selfieUrl} download className="text-[10px] font-black uppercase tracking-widest text-success hover:underline">Download</a>
                           </div>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest mt-4">Persona Selfie</span>
                        <span className="text-[9px] text-muted-foreground mt-1 font-bold">Real-time person verification</span>
                     </div>

                     {selectedCounselor.certificateUrls && (
                       <div className="group flex flex-col p-6 bg-muted/10 border border-border/40 rounded-xl hover:border-primary/50 transition-colors">
                          <div className="flex items-center justify-between">
                             <ShieldCheck className="text-primary" size={24} />
                             <div className="flex items-center gap-2">
                                <a href={selectedCounselor.certificateUrls} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View</a>
                                <span className="text-muted-foreground opacity-20">|</span>
                                <a href={selectedCounselor.certificateUrls} download className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Download</a>
                             </div>
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest mt-4">Certificates & Awards</span>
                          <span className="text-[9px] text-muted-foreground mt-1 font-bold">Additional supporting credentials</span>
                       </div>
                     )}
                  </div>
               </div>
            </section>
          </div>
        </div>

        <ConfirmModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={confirmReject}
          title="Reject Counselor"
          description="Confirm rejection of this applicant. This action cannot be undone easily."
          confirmText="Reject Application"
        />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Counselor Inbox</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Review, verify and authenticate student-facing experts
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Status Overview</span>
           <div className="flex items-center gap-6 text-xs font-bold font-mono">
              <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-warning" /> {counselors.filter(c => c.verificationStatus === 'pending').length} Pending</span>
              <span className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-success" /> {counselors.filter(c => c.verificationStatus === 'verified').length} Verified</span>
           </div>
        </div>
      </div>

      <div className="divide-y divide-border border-y border-border">
        {counselors.length > 0 ? (
          counselors.map((counselor, idx) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleReview(counselor)}
              className="group py-6 px-4 lg:px-8 hover:bg-muted/30 cursor-pointer transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 min-w-0 flex-1">
                 <div className="h-14 w-14 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                    {counselor.profileImageUrl ? (
                      <img src={counselor.profileImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-foreground font-black text-xl">{counselor.name?.charAt(0) || 'A'}</span>
                    )}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-black text-foreground text-xl tracking-tight leading-none group-hover:text-primary transition-colors flex items-center gap-3">
                      {counselor.name}
                      {counselor.verificationStatus === 'verified' && <Check size={18} className="text-success" />}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3">
                       <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest"><Mail size={12} className="opacity-50" /> {counselor.email}</span>
                       <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-widest"><Briefcase size={12} className="opacity-50" /> {counselor.currentPosition || 'Generalist'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-12 shrink-0">
                 <div className="hidden xl:block">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Experience</p>
                    <p className="text-sm font-black text-foreground">{counselor.yearsOfExperience || 0} Years</p>
                 </div>
                 
                 <div>
                    <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                       counselor.verificationStatus === 'verified' ? 'bg-success/5 text-success border-success/20' : 
                       counselor.verificationStatus === 'rejected' ? 'bg-destructive/5 text-destructive border-destructive/20' : 
                       'bg-warning/5 text-warning border-warning/20'
                     }`}>
                       <span className={`h-1 w-1 rounded-full ${counselor.verificationStatus === 'verified' ? 'bg-success' : counselor.verificationStatus === 'rejected' ? 'bg-destructive' : 'bg-warning'}`} />
                       {counselor.verificationStatus}
                    </span>
                 </div>

                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={20} className="text-primary" />
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center">
            <div className="h-16 w-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <UserIcon size={24} />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">No counselors found</h3>
            <p className="text-muted-foreground text-sm font-medium mt-2">The approval queue is currently empty.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Are you sure you want to permanently reject this counselor?"
        confirmText="Confirm Rejection"
      />
    </div>
  );
};
