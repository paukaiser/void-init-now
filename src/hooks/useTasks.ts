import { useEffect, useState } from "react";
import { Task } from "../types/index.ts"; // Changed from "../types/task" to "../types"
import { v4 as uuidv4 } from "uuid";
import { isPast, isSameDay } from "date-fns";

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
        disqualified: false,
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
        disqualified: false,
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
        disqualified: false,
    },
];

interface CreateTaskInput {
    restaurantName: string;
    moreInfo?: string;
    dueDate: string;
}

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    // Get unread tasks count
    const unreadCount = tasks.filter((task) => !task.isRead).length;

    // Fetch tasks from backend on mount
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/tasks", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch tasks");
                const data = await res.json();
                // Optionally map fields if needed to match your Task type
                setTasks(data.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Function to mark a task as read (client side only for now)
    const markAsRead = (taskId: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, isRead: true } : task
            )
        );
    };

    // Mark all tasks as read
    const markAllAsRead = () => {
        setTasks((prev) => prev.map((task) => ({ ...task, isRead: true })));
    };

    // Function to mark a task as completed (client side only for now)
    const markAsCompleted = (taskId: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, completed: true } : task
            )
        );
        // Optionally: send to backend with fetch if you want real completion!
    };

    // Function to disqualify a task (client side only for now)
    const disqualifyTask = (
        taskId: string,
        reason: string,
        otherReason?: string,
    ) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId
                    ? {
                        ...task,
                        disqualified: true,
                        disqualifyReason: reason,
                        disqualifyOtherReason: otherReason,
                    }
                    : task
            )
        );
        // Optionally: send to backend with fetch if you want real disqualification!
    };

    // Function to create a new task (client side only for now)
    const createTask = (taskInput: Partial<CreateTaskInput>) => {
        // This is for demo, in a real app you'd POST to your backend here
        const newTask: Task = {
            id: Math.random().toString(36).slice(2), // use uuid in real apps
            contactName: "New Contact",
            phoneNumber: "",
            email: "",
            restaurantName: taskInput.restaurantName || "",
            cuisine: "",
            createdAt: new Date().toISOString(),
            dueDate: taskInput.dueDate || new Date().toISOString(),
            isRead: false,
            completed: false,
            disqualified: false,
            moreInfo: taskInput.moreInfo,
        };
        setTasks((prev) => [newTask, ...prev]);
        return newTask;
    };

    return {
        tasks,
        loading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        markAsCompleted,
        disqualifyTask,
        createTask,
    };
};
