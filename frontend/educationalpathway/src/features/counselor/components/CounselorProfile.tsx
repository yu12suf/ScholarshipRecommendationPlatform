'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Globe, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Plus,
  X,
  Languages,
  Video,
  Mic,
  MessageSquare,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { getCounselorProfile, updateCounselorProfile, applyAsCounselor } from '../api/counselor-api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Professional', icon: Briefcase },
  { id: 3, title: 'Availability', icon: Clock },
  { id: 4, title: 'Documents', icon: ShieldCheck }
];

export const CounselorProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Availability Slots State
  const [slots, setSlots] = useState<{day: string, startTime: string, endTime: string}[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCounselorProfile();
        setProfile(data);
        if (!data.isOnboarded) {
          setIsOnboarding(true);
        }
        // Initialize slots from profile if available
        if (data.weeklySchedule) {
          try {
            const parsed = JSON.parse(data.weeklySchedule);
            if (parsed.slots) setSlots(parsed.slots);
          } catch (e) {}
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...profile,
        weeklySchedule: JSON.stringify({ slots }),
        isOnboarded: true
      };

      if (isOnboarding) {
        await applyAsCounselor(payload);
        toast.success('Professional application submitted');
      } else {
        await updateCounselorProfile(payload);
        toast.success('Profile updated successfully');
      }

      setIsOnboarding(false);
      router.push('/dashboard/counselor');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit application';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const mockUrl = URL.createObjectURL(e.target.files[0]);
      setProfile({ ...profile, [field]: mockUrl });
      toast.success(`${field.replace('Url', '').replace('profileImageUrl', 'Photo')} selected`);
    }
  };

  const addSlot = () => {
    setSlots([...slots, { day: 'Monday', startTime: '09:00', endTime: '10:00' }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: string, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const updateConsultationMode = (mode: string) => {
    const current = profile.consultationModes ? (typeof profile.consultationModes === 'string' ? JSON.parse(profile.consultationModes) : profile.consultationModes) : [];
    const updated = current.includes(mode) 
      ? current.filter((m: string) => m !== mode)
      : [...current, mode];
    setProfile({ ...profile, consultationModes: updated });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!profile) return <div className="p-8 text-center"><AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" /><h2 className="text-xl font-bold">Error Loading Profile</h2></div>;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const isModeSelected = (mode: string) => {
    const current = profile.consultationModes ? (typeof profile.consultationModes === 'string' ? JSON.parse(profile.consultationModes) : profile.consultationModes) : [];
    return current.includes(mode);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 p-6">
      {profile.isOnboarded && (
        <div className="flex justify-end items-center gap-6 pb-6 mt-4">
          <div className="flex items-center gap-3">
            {profile.verificationStatus === 'pending' && (
              <span className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black uppercase tracking-widest border border-amber-500/20 flex items-center gap-2">
                <Clock size={14} className="animate-pulse" /> Pending Approval
              </span>
            )}
            {profile.verificationStatus === 'verified' && (
              <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 size={14} /> Verified Expert
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="flex justify-between max-w-2xl mx-auto relative px-4">
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-muted z-0 hidden md:block" />
        {STEPS.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'primary-gradient text-white shadow-lg shadow-primary/30 ring-4 ring-primary/10' : 
                  isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto space-y-10 px-4">
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Identity & Contact */}
              {currentStep === 1 && (
                <Card className="border-border shadow-xl">
                  <CardBody className="p-8 space-y-8">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-lg"><User size={20} /></div>
                      <h2 className="text-xl font-bold font-heading">Core Identity</h2>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Professional Bio (Min. 50 characters)</label>
                      <textarea
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full min-h-[140px] bg-muted/40 border border-border rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none leading-relaxed"
                        placeholder="I am an experienced education consultant specializing in..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                        <Input value={profile.phoneNumber || ''} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} placeholder="+1..." className="h-14 bg-muted/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Residence</label>
                        <Input value={profile.countryOfResidence || ''} onChange={(e) => setProfile({ ...profile, countryOfResidence: e.target.value })} placeholder="e.g. Ethiopia" className="h-14 bg-muted/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">City</label>
                        <Input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="e.g. Addis Ababa" className="h-14 bg-muted/30" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Languages (e.g. English, Amharic)</label>
                        <Input value={profile.languages || ''} onChange={(e) => setProfile({ ...profile, languages: e.target.value })} placeholder="English, French" className="h-14 bg-muted/30" />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border flex justify-end">
                      <Button onClick={nextStep} className="h-14 px-10 gap-2 primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        Next Step <ChevronRight size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Step 2: Professional & Academic */}
              {currentStep === 2 && (
                <Card className="border-border shadow-xl">
                  <CardBody className="p-8 space-y-10">
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 text-primary">
                        <div className="p-2 bg-primary/10 rounded-lg"><GraduationCap size={20} /></div>
                        <h2 className="text-xl font-bold font-heading">Academic History</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Highest Education</label>
                          <select 
                            value={profile.highestEducationLevel || ''} 
                            onChange={(e) => setProfile({...profile, highestEducationLevel: e.target.value})}
                            className="w-full h-14 bg-muted/30 border border-border rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="">Select Level</option>
                            <option value="Bachelors">Bachelors</option>
                            <option value="Masters">Masters</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">University Name</label>
                          <Input value={profile.universityName || ''} onChange={(e) => setProfile({ ...profile, universityName: e.target.value })} placeholder="University of..." className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Study Country</label>
                          <Input value={profile.studyCountry || ''} onChange={(e) => setProfile({ ...profile, studyCountry: e.target.value })} placeholder="e.g. USA" className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fields of Study</label>
                          <Input value={profile.fieldsOfStudy || ''} onChange={(e) => setProfile({ ...profile, fieldsOfStudy: e.target.value })} placeholder="e.g. Computer Science" className="h-14 bg-muted/30" />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-3 text-primary">
                        <div className="p-2 bg-primary/10 rounded-lg"><Briefcase size={20} /></div>
                        <h2 className="text-xl font-bold font-heading">Professional Standing</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Position</label>
                          <Input value={profile.currentPosition || ''} onChange={(e) => setProfile({ ...profile, currentPosition: e.target.value })} placeholder="e.g. Senior Consultant" className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Organization</label>
                          <Input value={profile.organization || ''} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} placeholder="Company / University" className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Years of Experience</label>
                          <Input type="number" value={profile.yearsOfExperience || ''} onChange={(e) => setProfile({ ...profile, yearsOfExperience: parseInt(e.target.value) })} className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Areas of Expertise</label>
                          <Input value={profile.areasOfExpertise || ''} onChange={(e) => setProfile({ ...profile, areasOfExpertise: e.target.value })} placeholder="Scholarships, SOP, Visa" className="h-14 bg-muted/30" />
                        </div>
                      </div>
                    </section>

                    <div className="pt-8 border-t border-border flex justify-between">
                      <Button variant="outline" onClick={prevStep} className="h-14 px-8 gap-2 border-border font-black uppercase tracking-widest text-xs">
                        <ChevronLeft size={16} /> Previous
                      </Button>
                      <Button onClick={nextStep} className="h-14 px-10 gap-2 primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        Next Step <ChevronRight size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Step 3: Availability & Pricing */}
              {currentStep === 3 && (
                <Card className="border-border shadow-xl">
                  <CardBody className="p-8 space-y-10">
                    <section className="space-y-6">
                       <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-primary">
                          <div className="p-2 bg-primary/10 rounded-lg"><Clock size={20} /></div>
                          <h2 className="text-xl font-bold font-heading">Weekly Availability</h2>
                        </div>
                        <Button onClick={addSlot} type="button" size="sm" variant="outline" className="h-10 px-4 gap-2 border-primary/20 text-primary hover:bg-primary/5">
                          <Plus size={14} /> Add Slot
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {slots.length === 0 && (
                          <div className="text-center py-10 bg-muted/20 border border-dashed border-border rounded-xl">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No slots defined yet</p>
                          </div>
                        )}
                        {slots.map((slot, index) => (
                          <div key={index} className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border group animate-in slide-in-from-left-2 transition-all hover:bg-muted/50">
                            <div className="flex-1 min-w-[140px]">
                              <select 
                                value={slot.day} 
                                onChange={(e) => updateSlot(index, 'day', e.target.value)}
                                className="w-full h-10 bg-transparent font-bold text-xs uppercase tracking-tight outline-none"
                              >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input type="time" value={slot.startTime} onChange={(e) => updateSlot(index, 'startTime', e.target.value)} className="h-10 w-32 bg-background border-border" />
                              <span className="text-muted-foreground text-xs uppercase font-black">to</span>
                              <Input type="time" value={slot.endTime} onChange={(e) => updateSlot(index, 'endTime', e.target.value)} className="h-10 w-32 bg-background border-border" />
                            </div>
                            <button onClick={() => removeSlot(index)} type="button" className="p-2 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-8 pt-6 border-t border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-primary">
                            <div className="p-2 bg-primary/10 rounded-lg"><DollarSign size={18} /></div>
                            <h3 className="text-sm font-black uppercase tracking-widest">Pricing & Mode</h3>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Price ($/hr)</label>
                              <Input type="number" value={profile.hourlyRate || ''} onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) })} className="h-12 bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Duration (min)</label>
                              <Input type="number" value={profile.sessionDuration || 60} onChange={(e) => setProfile({ ...profile, sessionDuration: parseInt(e.target.value) })} className="h-12 bg-muted/30" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Consultation Modes</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { id: 'chat', label: 'Direct Chat', icon: MessageSquare },
                              { id: 'audio', label: 'Audio Call', icon: Mic },
                              { id: 'video', label: 'Video Meeting', icon: Video },
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                type="button"
                                onClick={() => updateConsultationMode(mode.id)}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                  isModeSelected(mode.id) 
                                  ? 'border-primary bg-primary/5 text-primary' 
                                  : 'border-border bg-transparent text-muted-foreground hover:bg-muted/30'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <mode.icon size={16} />
                                  <span className="text-xs font-black uppercase tracking-tight">{mode.label}</span>
                                </div>
                                {isModeSelected(mode.id) && <CheckCircle2 size={16} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="pt-8 border-t border-border flex justify-between">
                      <Button variant="outline" onClick={prevStep} className="h-14 px-8 gap-2 border-border font-black uppercase tracking-widest text-xs">
                        <ChevronLeft size={16} /> Previous
                      </Button>
                      <Button onClick={nextStep} className="h-14 px-10 gap-2 primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                        Next Step <ChevronRight size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Step 4: Documents */}
              {currentStep === 4 && (
                <Card className="border-border shadow-xl">
                  <CardBody className="p-8 space-y-10">
                    <div className="flex items-center gap-3 text-primary">
                      <div className="p-2 bg-primary/10 rounded-lg"><ShieldCheck size={20} /></div>
                      <h2 className="text-xl font-bold font-heading">Verification Files</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Picture</label>
                        <div className="relative group overflow-hidden rounded-2xl aspect-square border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary/50 transition-all bg-muted/20">
                          {profile.profileImageUrl ? (
                            <img src={profile.profileImageUrl} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center">
                              <ImageIcon className="text-muted-foreground group-hover:text-primary mb-2" />
                              <span className="text-[10px] font-black uppercase tracking-tight text-muted-foreground">Square Photo</span>
                            </div>
                          )}
                          <input type="file" onChange={(e) => handleFileChange('profileImageUrl', e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Curriculum Vitae (CV)</label>
                          <div className={`p-6 border-2 border-dashed rounded-2xl flex items-center justify-between transition-all relative ${profile.cvUrl ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-primary bg-muted/20'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${profile.cvUrl ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight">{profile.cvUrl ? 'Resumé Ready' : 'Upload CV'}</p>
                                <p className="text-[10px] text-muted-foreground">PDF or DOCX max 5MB</p>
                              </div>
                            </div>
                            <input type="file" onChange={(e) => handleFileChange('cvUrl', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {profile.cvUrl && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Academic Certificates</label>
                          <div className={`p-6 border-2 border-dashed rounded-2xl flex items-center justify-between transition-all relative ${profile.certificateUrls ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-primary bg-muted/20'}`}>
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${profile.certificateUrls ? 'bg-emerald-500/20 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                <GraduationCap size={20} />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-tight">Upload Degrees</p>
                                <p className="text-[10px] text-muted-foreground">Combine multiple into a PDF</p>
                              </div>
                            </div>
                            <input type="file" onChange={(e) => handleFileChange('certificateUrls', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {profile.certificateUrls && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-border flex justify-between">
                      <Button variant="outline" onClick={prevStep} disabled={saving} className="h-14 px-8 gap-2 border-border font-black uppercase tracking-widest text-xs">
                        <ChevronLeft size={16} /> Previous
                      </Button>
                      <Button 
                        onClick={handleSave} 
                        isLoading={saving}
                        className="h-14 px-12 gap-2 primary-gradient text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/30"
                      >
                        Finish Application <CheckCircle2 size={18} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

