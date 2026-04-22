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
import Select, { MultiValue, SingleValue } from 'react-select';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { useGeoData } from '../../student/hooks/useGeoData';
import { FIELDS_OF_STUDY, FIELDS_OF_STUDY_GROUPED } from '../../student/constants/fields-of-study';

const COUNSELOR_POSITIONS = [
  { value: "Higher Education Consultant", label: "Higher Education Consultant" },
  { value: "Scholarship Specialist", label: "Scholarship Specialist" },
  { value: "Career Coach", label: "Career Coach" },
  { value: "Admissions Officer", label: "Admissions Officer" },
  { value: "Academic Advisor", label: "Academic Advisor" },
  { value: "University Professor", label: "University Professor" },
  { value: "Research Scientist", label: "Research Scientist" },
  { value: "Independent Consultant", label: "Independent Consultant" },
  { value: "Visa & Immigration Expert", label: "Visa & Immigration Expert" }
];

const AREAS_OF_EXPERTISE = [
  { value: "Full Scholarships (PhD/Masters)", label: "Full Scholarships (PhD/Masters)" },
  { value: "Undergraduate Admissions", label: "Undergraduate Admissions" },
  { value: "SOP & Personal Statement Review", label: "SOP & Personal Statement Review" },
  { value: "CV/Resume Optimization", label: "CV/Resume Optimization" },
  { value: "IELTS/TOEFL Preparation", label: "IELTS/TOEFL Preparation" },
  { value: "GRE/GMAT Coaching", label: "GRE/GMAT Coaching" },
  { value: "Visa Interview Prep", label: "Visa Interview Prep" },
  { value: "Research Proposal Development", label: "Research Proposal Development" },
  { value: "Financial Aid & FAFSA", label: "Financial Aid & FAFSA" },
  { value: "Ivy League Admissions", label: "Ivy League Admissions" },
  { value: "Erasmus Mundus Specialist", label: "Erasmus Mundus Specialist" },
  { value: "DAAD & CSC Scholarships", label: "DAAD & CSC Scholarships" }
];

const formatCountryOption = (option: any) => (
  <div className="flex items-center gap-2">
    {option.flag && (
      option.flag.endsWith(".svg") || option.flag.endsWith(".png") ? (
        <img src={option.flag} alt={`${option.label} flag`} className="w-5 h-3 object-cover border border-border" />
      ) : (
        <span>{option.flag}</span>
      )
    )}
    <span className="text-sm">{option.label}</span>
  </div>
);

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
  const [files, setFiles] = useState<{[key: string]: File}>({});

  // Availability Slots State
  const [slots, setSlots] = useState<{day: string, startTime: string, endTime: string}[]>([]);

  const { countries, loadingCountries, getCitiesForCountry } = useGeoData();
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCounselorProfile();
        
        // Parse fields that might be stored as strings
        const parsedData = { ...data };
        ['fieldsOfStudy', 'areasOfExpertise', 'consultationModes'].forEach(field => {
          if (data[field] && typeof data[field] === 'string') {
            try {
              // Try JSON first
              parsedData[field] = JSON.parse(data[field]);
            } catch (e) {
              // Fallback: splitting by comma
              parsedData[field] = data[field].includes(',') 
                ? data[field].split(',').map((s: string) => s.trim()).filter(Boolean)
                : [data[field]].filter(Boolean);
            }
          }
        });

        setProfile(parsedData);
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

  useEffect(() => {
    if (profile?.countryOfResidence) {
      setLoadingCities(true);
      getCitiesForCountry(profile.countryOfResidence).then(cities => {
        setAvailableCities(cities);
        setLoadingCities(false);
      });
    }
  }, [profile?.countryOfResidence]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare payload - stringify arrays for DB
      const payload = { ...profile, ...files };
      
      // Ensure numeric fields are non-negative
      payload.hourlyRate = Math.max(0, Number(payload.hourlyRate) || 0);
      payload.yearsOfExperience = Math.max(0, Number(payload.yearsOfExperience) || 0);
      payload.sessionDuration = Math.max(1, Number(payload.sessionDuration) || 60);

      payload.weeklySchedule = JSON.stringify({ slots });
      payload.isOnboarded = true;

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
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [field]: file }));
      
      // Update preview
      const previewUrl = URL.createObjectURL(file);
      setProfile({ ...profile, [field]: previewUrl });
      
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
                        <PhoneInput
                          defaultCountry="us"
                          value={profile.phoneNumber || ""}
                          onChange={(phone) => setProfile({ ...profile, phoneNumber: phone })}
                          className="w-full h-14 [&>input]:flex-1 [&>input]:h-14 [&>input]:bg-muted/30 [&>input]:border-border [&>input]:rounded-r-xl [&>.react-international-phone-country-selector-button]:h-14 [&>.react-international-phone-country-selector-button]:bg-muted/30 [&>.react-international-phone-country-selector-button]:border-border [&>.react-international-phone-country-selector-button]:rounded-l-xl [&>.react-international-phone-country-selector-button]:px-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Residence</label>
                        <Select
                          options={countries.map((c) => ({
                            value: c.name,
                            label: c.name,
                            flag: c.flag,
                          }))}
                          value={profile.countryOfResidence ? { 
                            value: profile.countryOfResidence, 
                            label: profile.countryOfResidence, 
                            flag: countries.find(c => c.name === profile.countryOfResidence)?.flag || "" 
                          } : null}
                          onChange={(val: SingleValue<any>) => setProfile({ ...profile, countryOfResidence: val?.value || "", city: "" })}
                          classNamePrefix="react-select"
                          placeholder={loadingCountries ? "Loading..." : "Select country"}
                          isDisabled={loadingCountries}
                          formatOptionLabel={formatCountryOption}
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              height: '56px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(var(--muted), 0.3)',
                              borderColor: 'rgba(var(--border), 1)',
                            })
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">City</label>
                        <Select
                          options={availableCities.map((city) => ({
                            value: city,
                            label: city,
                          }))}
                          value={profile.city ? { value: profile.city, label: profile.city } : null}
                          isDisabled={!profile.countryOfResidence || loadingCities}
                          onChange={(val: SingleValue<{ value: string; label: string }>) =>
                            setProfile({ ...profile, city: val?.value || "" })
                          }
                          classNamePrefix="react-select"
                          placeholder={
                            loadingCities
                              ? "Loading cities..."
                              : !profile.countryOfResidence
                              ? "Select country first"
                              : "Select city"
                          }
                          isClearable
                          isSearchable
                          styles={{
                            control: (base) => ({
                              ...base,
                              height: '56px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(var(--muted), 0.3)',
                              borderColor: 'rgba(var(--border), 1)',
                            })
                          }}
                        />
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
                          <Select
                            isMulti
                            options={FIELDS_OF_STUDY_GROUPED as any}
                            value={FIELDS_OF_STUDY.filter(f => {
                              const currentFields = profile.fieldsOfStudy ? (Array.isArray(profile.fieldsOfStudy) ? profile.fieldsOfStudy : (typeof profile.fieldsOfStudy === 'string' ? JSON.parse(profile.fieldsOfStudy) : [])) : [];
                              return currentFields.includes(f.value);
                            }).map(f => ({ value: f.value, label: f.label }))}
                            onChange={(val: MultiValue<{ value: string; label: string }>) =>
                              setProfile({ ...profile, fieldsOfStudy: val.map(v => v.value) })
                            }
                            classNamePrefix="react-select"
                            placeholder="Select specialties..."
                            isSearchable
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '56px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(var(--muted), 0.3)',
                                borderColor: 'rgba(var(--border), 1)',
                              })
                            }}
                          />
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
                          <Select
                            options={COUNSELOR_POSITIONS}
                            value={COUNSELOR_POSITIONS.find(p => p.value === profile.currentPosition) || (profile.currentPosition ? { value: profile.currentPosition, label: profile.currentPosition } : null)}
                            onChange={(val: SingleValue<any>) => setProfile({ ...profile, currentPosition: val?.value || "" })}
                            classNamePrefix="react-select"
                            placeholder="Select position"
                            isSearchable
                            styles={{
                              control: (base) => ({
                                ...base,
                                height: '56px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(var(--muted), 0.3)',
                                borderColor: 'rgba(var(--border), 1)',
                              })
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Organization</label>
                          <Input value={profile.organization || ''} onChange={(e) => setProfile({ ...profile, organization: e.target.value })} placeholder="Company / University" className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Years of Experience</label>
                          <Input type="number" min="0" value={profile.yearsOfExperience || ''} onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value ? Math.max(0, parseInt(e.target.value)) : 0 })} className="h-14 bg-muted/30" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Areas of Expertise</label>
                          <Select
                            isMulti
                            options={AREAS_OF_EXPERTISE}
                            value={AREAS_OF_EXPERTISE.filter(a => {
                              const currentAreas = profile.areasOfExpertise ? (Array.isArray(profile.areasOfExpertise) ? profile.areasOfExpertise : (typeof profile.areasOfExpertise === 'string' ? JSON.parse(profile.areasOfExpertise) : [])) : [];
                              return currentAreas.includes(a.value);
                            })}
                            onChange={(val: MultiValue<{ value: string; label: string }>) =>
                              setProfile({ ...profile, areasOfExpertise: val.map(v => v.value) })
                            }
                            classNamePrefix="react-select"
                            placeholder="Select expertise areas..."
                            isSearchable
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '56px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(var(--muted), 0.3)',
                                borderColor: 'rgba(var(--border), 1)',
                              })
                            }}
                          />
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
                              <Input type="number" min="0" value={profile.hourlyRate || ''} onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value ? Math.max(0, parseFloat(e.target.value)) : 0 })} className="h-12 bg-muted/30" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Default Duration (min)</label>
                              <Input type="number" min="1" value={profile.sessionDuration || 60} onChange={(e) => setProfile({ ...profile, sessionDuration: e.target.value ? Math.max(1, parseInt(e.target.value)) : 60 })} className="h-12 bg-muted/30" />
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

