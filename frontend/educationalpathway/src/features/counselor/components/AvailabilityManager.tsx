'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Clock, 
  Save, 
  Loader2,
  CalendarCheck,
  RefreshCw
} from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { getCounselorSlots, createCounselorSlots } from '../api/counselor-api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const AvailabilityManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        console.log('[AvailabilityManager] Fetching slots...');
        const response = await getCounselorSlots();
        console.log('[AvailabilityManager] Raw response:', response);
        
        // Handle { success, data, weeklySchedule } format
        const rawSlots = response?.data || [];
        const weeklySchedule = response?.weeklySchedule || [];
        console.log('[AvailabilityManager] DB slots:', rawSlots.length);
        console.log('[AvailabilityManager] Weekly schedule slots:', weeklySchedule.length);
        
        // Convert ISO8601 slots to time-only format for the UI
        // Group slots by day of week to show unique weekly patterns
        const slotMap = new Map<string, { startTime: string; endTime: string }>();
        rawSlots.forEach((slot: any) => {
          const start = new Date(slot.startTime);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayOfWeek = dayNames[start.getDay()];
          const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
          const end = new Date(slot.endTime);
          const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
          
          // Store unique slots based on day + time combination
          const key = `${dayOfWeek}-${startTime}-${endTime}`;
          if (!slotMap.has(key)) {
            slotMap.set(key, { dayOfWeek, startTime, endTime });
          }
        });
        
        // Also include weeklySchedule slots if no DB slots exist
        const allSlots = rawSlots.length > 0 ? rawSlots : weeklySchedule;
        
        const formattedSlots = Array.from(slotMap.values());
        console.log('[AvailabilityManager] Formatted slots:', formattedSlots);
        if (formattedSlots.length === 0 && weeklySchedule.length > 0) {
          // Show weekly schedule slots if no DB slots
          weeklySchedule.forEach((slot: any) => {
            const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
            if (!slotMap.has(key)) {
              slotMap.set(key, { dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime });
            }
          });
        }
        setSlots(Array.from(slotMap.values()));
      } catch (error: any) {
        console.error('[AvailabilityManager] Failed to load slots:', error);
        console.error('[AvailabilityManager] Error response:', error?.response?.data);
        toast.error('Failed to load availability');
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const addSlot = () => {
    const newSlot = {
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: true
    };
    setSlots([...slots, newSlot]);
  };

  const removeSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    setSlots(newSlots);
  };

  const updateSlot = (index: number, field: string, value: any) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    // Convert time-only format to ISO8601 datetime
    const slotsToSave = slots.map(slot => {
      const dayMap: Record<string, number> = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
      };
      const dayIndex = dayMap[slot.dayOfWeek] || 1;
      
      // Get next occurrence of this day
      const today = new Date();
      const currentDay = today.getDay();
      const daysUntil = (dayIndex - currentDay + 7) % 7 || 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntil);
      
      // Parse time and set on target date
      const [startHour, startMin] = slot.startTime.split(':');
      const startDate = new Date(targetDate);
      startDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);
      
      const [endHour, endMin] = slot.endTime.split(':');
      const endDate = new Date(targetDate);
      endDate.setHours(parseInt(endHour), parseInt(endMin), 0, 0);
      
      return {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      };
    });
    
    console.log('[AvailabilityManager] Saving slots:', slotsToSave);
    
    setSaving(true);
    try {
      const response = await createCounselorSlots(slotsToSave);
      console.log('[AvailabilityManager] Save response:', response);
      toast.success('Availability updated successfully');
      
      // Refresh slots after saving - with deduplication like in fetchSlots
      const data = await getCounselorSlots();
      const rawSlots = data || []; // Already unwrapped by interceptor
      
      const slotMap = new Map<string, { dayOfWeek: string; startTime: string; endTime: string }>();
      rawSlots.forEach((slot: any) => {
        const start = new Date(slot.startTime);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = dayNames[start.getDay()];
        const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
        const end = new Date(slot.endTime);
        const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
        
        const key = `${dayOfWeek}-${startTime}-${endTime}`;
        if (!slotMap.has(key)) {
          slotMap.set(key, { dayOfWeek, startTime, endTime });
        }
      });
      
      setSlots(Array.from(slotMap.values()));
    } catch (error: any) {
      console.error('[AvailabilityManager] Save error:', error);
      console.error('[AvailabilityManager] Error response:', error?.response?.data);
      toast.error(error?.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="h1 flex items-center gap-3">
            Schedule & Availability
            <CalendarCheck size={32} className="text-primary hidden md:block" />
          </h1>
          <p className="text-muted-foreground mt-1">Set your recurring availability slots for student bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={async () => {
              setLoading(true);
              try {
                const data = await getCounselorSlots();
                console.log('[AvailabilityManager] Refresh - data:', data);
                const rawSlots = data || []; // Already unwrapped by interceptor
                // Deduplicate slots based on day + time combination (same as in initial load)
                const slotMap = new Map<string, { dayOfWeek: string; startTime: string; endTime: string }>();
                rawSlots.forEach((slot: any) => {
                  const start = new Date(slot.startTime);
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayOfWeek = dayNames[start.getDay()];
                  const startTime = `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
                  const end = new Date(slot.endTime);
                  const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                  
                  const key = `${dayOfWeek}-${startTime}-${endTime}`;
                  if (!slotMap.has(key)) {
                    slotMap.set(key, { dayOfWeek, startTime, endTime });
                  }
                });
                setSlots(Array.from(slotMap.values()));
              } catch (error) {
                toast.error('Failed to refresh slots');
              } finally {
                setLoading(false);
              }
            }}
            title="Refresh slots"
            className="h-12 w-12"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button 
            onClick={addSlot}
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 h-12 px-6"
          >
            <Plus size={18} className="mr-2" />
            Add Slot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Slot List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {slots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 border-2 border-dashed border-border rounded-lg text-center"
              >
                <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={20} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold mb-1">No slots defined</h3>
                <p className="text-small mb-6">Click the button to start adding your availability.</p>
                <Button onClick={addSlot} size="sm">Add First Slot</Button>
              </motion.div>
            ) : (
              slots.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card className="border-border bg-card group">
                    <CardBody className="p-4 flex flex-col md:flex-row items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <select
                          value={slot.dayOfWeek}
                          onChange={(e) => updateSlot(index, 'dayOfWeek', e.target.value)}
                          className="bg-muted border border-border rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <div className="relative">
                          <Clock size={14} className="absolute left-3 top-3 text-muted-foreground" />
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                            className="bg-muted pl-10 h-10"
                          />
                        </div>
                        <div className="relative">
                          <Clock size={14} className="absolute left-3 top-3 text-muted-foreground" />
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                            className="bg-muted pl-10 h-10"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <Card className="primary-gradient text-white border-none shadow-xl shadow-primary/20">
            <CardBody className="p-8 space-y-6">
              <h3 className="font-bold flex items-center gap-2 text-lg">
                <Clock size={20} />
                Booking Rule
              </h3>
              <p className="text-sm opacity-90 leading-relaxed">
                By setting your availability, you allow students to book sessions with you instantly. Each slot represents a 60-minute window.
              </p>
              <div className="pt-4 border-t border-white/20">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-white mt-1 shrink-0" />
                    Recurring weekly slots
                  </li>
                  <li className="flex items-start gap-2 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-white mt-1 shrink-0" />
                    Automatic session links
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>

          <Button 
            onClick={handleSave} 
            className="w-full h-12 primary-gradient text-white flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20"
            isLoading={saving}
          >
            <Save size={18} />
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
};
