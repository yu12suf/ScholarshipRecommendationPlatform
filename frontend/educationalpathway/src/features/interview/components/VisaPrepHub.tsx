"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Loader2,
  Info,
  Search,
  Building2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { getVisaGuidelines } from "../api/visa-api";

interface VisaPrepHubProps {
  onStartInterview: (country: string, university: string) => void;
}

const countries = [
  { id: "USA", name: "United States", flag: "🇺🇸", color: "from-blue-600 to-red-600" },
  { id: "UK", name: "United Kingdom", flag: "🇬🇧", color: "from-blue-800 to-red-700" },
  { id: "Canada", name: "Canada", flag: "🇨🇦", color: "from-red-600 to-red-400" },
  { id: "Australia", name: "Australia", flag: "🇦🇺", color: "from-blue-700 to-blue-500" },
];

export function VisaPrepHub({ onStartInterview }: VisaPrepHubProps) {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [guidelines, setGuidelines] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [university, setUniversity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadGuidelines() {
      try {
        setLoading(true);
        const res = await getVisaGuidelines(selectedCountry.id);
        const data = res?.status === "success" ? res.data : res;
        setGuidelines(data);
      } catch (err) {
        console.error("Failed to load guidelines", err);
        setGuidelines(null);
      } finally {
        setLoading(false);
      }
    }
    loadGuidelines();
  }, [selectedCountry]);

  // Handle university search
  useEffect(() => {
    if (university.length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `http://universities.hipolabs.com/search?name=${encodeURIComponent(university)}&country=${encodeURIComponent(selectedCountry.name === "United States" ? "United States" : selectedCountry.name)}`
        );
        const data = await response.json();
        setSuggestions(data.slice(0, 5).map((u: any) => u.name));
      } catch (err) {
        console.error("Failed to fetch universities", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [university, selectedCountry]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
            <Globe2 className="size-3" /> Professional Immigration Simulation
          </div>
          <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
            Visa <span className="text-primary italic">Success</span> Studio
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground font-medium">
            Master your embassy interview with our hyper-realistic AI Consular Officer. Start by selecting your destination.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Country Selector */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 flex items-center gap-2">
            <Zap size={14} className="text-primary fill-primary" /> Select Destination
          </h3>
          <div className="grid gap-3">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 ${
                  selectedCountry.id === country.id
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-border bg-background hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <span className="text-3xl">{country.flag}</span>
                  <div className="text-left">
                    <p className={`font-black tracking-tight ${selectedCountry.id === country.id ? 'text-primary' : 'text-foreground'}`}>
                      {country.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Visa Simulation</p>
                  </div>
                </div>
                <ChevronRight className={`size-5 transition-transform duration-300 ${selectedCountry.id === country.id ? 'translate-x-0 opacity-100 text-primary' : '-translate-x-4 opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* University Selection */}
          <div className="space-y-4 p-5 rounded-3xl bg-primary/5 border-2 border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 size={40} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary px-1 flex items-center gap-2">
              <Building2 size={14} className="fill-primary" /> 2. Target University
            </h3>
            <div className="relative">
              <Input
                placeholder="Search university in destination..."
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="pl-12 h-14 rounded-2xl border-2 border-primary/20 focus:border-primary bg-background shadow-sm transition-all text-sm font-bold"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={20} />
              
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
              )}

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-2xl"
                  >
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setUniversity(s);
                          setSuggestions([]);
                        }}
                        className="w-full px-6 py-4 text-left text-xs font-black uppercase tracking-tight hover:bg-primary/10 transition-colors border-b border-border last:border-0 flex items-center justify-between group/item"
                      >
                        {s}
                        <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-all -translate-x-2 group-hover/item:translate-x-0" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest px-2 italic">
              REQUIRED: AI will test your knowledge of this campus
            </p>
          </div>

          <Card className="border-2 border-dashed border-border/60 bg-muted/5 opacity-80">
            <CardBody className="p-6 space-y-4">
               <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary/10 p-2 shrink-0">
                    <ShieldCheck className="text-primary" size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground italic">System Warning</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      Our AI chief is programmed for maximum skepticism. Vague answers will result in instant failure.
                    </p>
                  </div>
               </div>
            </CardBody>
          </Card>
        </div>

        {/* Guidelines Display */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCountry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card className="border-none bg-background shadow-2xl overflow-hidden rounded-[2.5rem]">
                {/* Visual Backdrop */}
                <div className={`h-3 bg-linear-to-r ${selectedCountry.color}`} />
                
                <CardBody className="p-8 lg:p-12 space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black tracking-tight">{selectedCountry.name} Preparation</h2>
                      <p className="text-primary font-bold">{guidelines?.visaType || "Student Visa"}</p>
                    </div>
                    <div className="hidden sm:block text-7xl opacity-10 font-black italic">{selectedCountry.id}</div>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="animate-spin text-primary size-8" />
                      <p className="text-muted-foreground font-bold italic">Gathering Embassy Intel...</p>
                    </div>
                  ) : (
                    <div className="grid gap-10 md:grid-cols-2">
                       {/* Documentation */}
                       <div className="space-y-5">
                         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <BookOpen size={14} className="text-primary" /> Required Documentation
                         </div>
                         <div className="grid gap-3">
                           {guidelines?.requiredDocuments?.map((doc: string, i: number) => (
                             <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-sm font-semibold">
                               <div className="size-5 rounded-full bg-success/20 flex items-center justify-center">
                                 <CheckCircle2 size={12} className="text-success" />
                               </div>
                               {doc}
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Practice Questions */}
                       <div className="space-y-5">
                         <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                            <Info size={14} className="text-primary" /> Common Interview Themes
                         </div>
                         <div className="grid gap-3">
                           {guidelines?.commonQuestions?.map((q: string, i: number) => (
                             <div key={i} className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs font-medium leading-relaxed italic relative">
                                "{q}"
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  )}

                  <div className="pt-8 border-t border-border mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button 
                      onClick={() => {
                        if (!university) {
                          alert("Please select or enter a target university first!");
                          return;
                        }
                        onStartInterview(selectedCountry.id, university);
                      }}
                      size="xl" 
                      className="w-full sm:w-auto px-12 h-16 rounded-2xl primary-gradient text-lg gap-3 shadow-xl hover:scale-[1.02] transition-transform"
                    >
                      Start Mock Interview <ArrowRight className="size-5" />
                    </Button>
                    <p className="text-xs text-muted-foreground font-bold italic max-w-[200px] text-center">
                      Ensure your microphone is ready. Duration: 5 Minutes.
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Warning/Tip Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-amber-500/5 border-2 border-amber-500/20 rounded-2xl flex gap-4">
                   <div className="rounded-full bg-amber-500/10 p-2 shrink-0 h-fit">
                      <Zap className="text-amber-600" size={16} />
                   </div>
                   <div className="space-y-1">
                      <h5 className="font-black text-xs uppercase tracking-tight text-amber-700">Expert Tip</h5>
                      <p className="text-xs text-amber-900/70 leading-relaxed font-bold">
                        Keep your answers under 30 seconds. Clarity and confidence are key to passing.
                      </p>
                   </div>
                </div>
                <div className="p-6 bg-blue-500/5 border-2 border-blue-500/20 rounded-2xl flex gap-4">
                   <div className="rounded-full bg-blue-500/10 p-2 shrink-0 h-fit">
                      <Zap className="text-blue-600" size={16} />
                   </div>
                   <div className="space-y-1">
                      <h5 className="font-black text-xs uppercase tracking-tight text-blue-700">Visonary AI</h5>
                      <p className="text-xs text-blue-900/70 leading-relaxed font-bold">
                        The AI will interrogate your "Intent to Return" and your funding proof.
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
