'use client';

import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Loader2,
  ClipboardList,
  Flame,
  Target
} from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';

export const TaskManager = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask, completed: false, priority: 'medium' }, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="h1 flex items-center gap-3">
            Counselor Goals
            <Target size={32} className="text-primary hidden md:block" />
          </h1>
          <p className="text-muted-foreground mt-1">Track your progress and personal academic milestones for your students.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left: Input & Filters */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border bg-card">
            <CardBody className="p-6 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="h-6 px-2 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center">
                    {tasks.filter(t => !t.completed).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completed</span>
                  <span className="h-6 px-2 bg-success/10 text-success text-xs font-bold rounded-lg flex items-center">
                    {tasks.filter(t => t.completed).length}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right: Task List */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Add a new professional milestone..." 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="h-12 bg-card border-border shadow-sm rounded-lg"
            />
            <Button onClick={addTask} className="h-12 w-12 p-0 primary-gradient text-white rounded-lg">
              <Plus size={20} />
            </Button>
          </div>

          <div className="space-y-2 min-h-[300px]">
            <AnimatePresence initial={false} mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center bg-card border border-border border-dashed rounded-lg"
                >
                  <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Your goal list is currently empty.</p>
                  <p className="text-xs text-muted-foreground mt-1">Start adding professional milestones to track your progress.</p>
                </motion.div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <Card className={`border border-border ${task.completed ? 'bg-muted/30 opacity-60' : 'bg-card'}`}>
                      <CardBody className="p-4 flex items-center gap-4">
                        <button 
                          onClick={() => toggleTask(task.id)}
                          className={`hover:scale-110 transition-transform ${task.completed ? 'text-success' : 'text-muted-foreground'}`}
                        >
                          {task.completed ? <CheckCircle size={22} /> : <Circle size={22} />}
                        </button>

                        <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through' : ''}`}>
                          {task.text}
                        </span>

                        <div className={`h-1.5 w-1.5 rounded-full ${
                          task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                        }`} />

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeTask(task.id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
