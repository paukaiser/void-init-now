
import { useState, useEffect } from "react";
import { Task } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// This is a mock service for now
// In a real app, this would fetch data from Hubspot via a webhook
const mockTasks: Task[] = [
  {
    id: "1",
    contactName: "Thomas Schmidt",
    phoneNumber: "+49 176 12345678",
    email: "thomas@schmidt-restaurant.de",
    restaurantName: "Schmidts Gourmet",
    cuisine: "German",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    dueDate: new Date().toISOString(), // Today
    isRead: false,
    completed: false,
    disqualified: false
  },
  {
    id: "2",
    contactName: "Maria Gonzalez",
    phoneNumber: "+49 177 87654321",
    email: "maria@tapasbar.de",
    restaurantName: "Tapas Bar München",
    cuisine: "Spanish",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    isRead: false,
    completed: false,
    disqualified: false
  },
  {
    id: "3",
    contactName: "Hans Weber",
    phoneNumber: "+49 178 55555555",
    email: "hans@bavarian-eats.de",
    restaurantName: "Bavarian Eats",
    cuisine: "Bavarian",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    isRead: true,
    completed: false,
    disqualified: false
  }
];

interface CreateTaskInput {
  contactName: string;
  phoneNumber: string;
  email: string;
  restaurantName: string;
  cuisine: string;
  dueDate: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get unread tasks count
  const unreadCount = tasks.filter(task => !task.isRead).length;
  
  // Function to mark a task as read
  const markAsRead = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, isRead: true } : task
      )
    );
  };
  
  // Mark all tasks as read
  const markAllAsRead = () => {
    setTasks(prev => 
      prev.map(task => ({ ...task, isRead: true }))
    );
  };

  // Function to mark a task as completed
  const markAsCompleted = (taskId: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  // Function to disqualify a task
  const disqualifyTask = (taskId: string, reason: string, otherReason?: string) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === taskId ? { 
          ...task, 
          disqualified: true,
          disqualifyReason: reason,
          disqualifyOtherReason: otherReason
        } : task
      )
    );
  };
  
  // Function to create a new task
  const createTask = (taskInput: Partial<CreateTaskInput>) => {
    const newTask: Task = {
      id: uuidv4(),
      contactName: taskInput.contactName || "",
      phoneNumber: taskInput.phoneNumber || "",
      email: taskInput.email || "",
      restaurantName: taskInput.restaurantName || "",
      cuisine: taskInput.cuisine || "",
      createdAt: new Date().toISOString(),
      dueDate: taskInput.dueDate || new Date().toISOString(),
      isRead: false,
      completed: false,
      disqualified: false
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };
  
  // Fetch tasks (mock implementation)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sort tasks by createdAt (newest first)
        const sortedTasks = [...mockTasks].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    // In a real implementation, you would set up a webhook or polling mechanism here
  }, []);
  
  return { 
    tasks, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    markAsCompleted,
    disqualifyTask,
    createTask
  };
};
