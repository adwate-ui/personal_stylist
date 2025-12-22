"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { toast } from "sonner";

export interface Task {
    id: string;
    type: 'analysis' | 'save' | 'ootd' | 'other';
    status: 'pending' | 'running' | 'success' | 'error';
    message: string;
    result?: any;
    error?: any;
    timestamp: number;
}

interface TaskContextType {
    tasks: Task[];
    activeTask: Task | null;
    startTask: (id: string, type: Task['type'], message: string, promise: Promise<any>) => void;
    clearTask: (id: string) => void;
    getTaskResult: (id: string) => any;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const startTask = useCallback((id: string, type: Task['type'], message: string, promise: Promise<any>) => {
        const newTask: Task = {
            id,
            type,
            status: 'running',
            message,
            timestamp: Date.now()
        };

        setTasks(prev => [...prev, newTask]);

        promise
            .then(result => {
                setTasks(prev => prev.map(t =>
                    t.id === id ? { ...t, status: 'success', result, message: 'Completed' } : t
                ));
                toast.success(`${message} complete!`, {
                    description: "Click the status icon to view results."
                });
            })
            .catch(error => {
                console.error("Task failed:", error);
                setTasks(prev => prev.map(t =>
                    t.id === id ? { ...t, status: 'error', error, message: 'Failed' } : t
                ));
                toast.error(`${message} failed`);
            });
    }, []);

    const clearTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, []);

    const getTaskResult = useCallback((id: string) => {
        return tasks.find(t => t.id === id)?.result;
    }, [tasks]);

    const activeTask = tasks.find(t => t.status === 'running') || null;

    return (
        <TaskContext.Provider value={{ tasks, activeTask, startTask, clearTask, getTaskResult }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTask() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
}
