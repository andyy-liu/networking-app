import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Contact, Todo } from "@/lib/types";
import { supabase } from "@/lib/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { TodoPanel } from "@/components/contacts/TodoPanel";
import { TodoTable } from "@/components/todos/TodoTable";
import { useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const Todos = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isTodoPanelOpen, setIsTodoPanelOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [completionFilter, setCompletionFilter] = useState<
    "all" | "completed" | "not-completed"
  >("all");
  const [dueDateFilter, setDueDateFilter] = useState<
    "all" | "this-week" | "this-month"
  >("all");

  const {
    todos,
    loading,
    fetchTodos,
    toggleTodoCompletion,
    updateTodoDueDate,
  } = useTodos();

  const { addTodo: addTodoForContact } = useTodos({
    contactId: selectedContactId,
  });

  const filteredTodos = todos.filter((todo) => {
    // First filter by completion status
    if (completionFilter === "completed" && !todo.completed) return false;
    if (completionFilter === "not-completed" && todo.completed) return false;

    // Then filter by due date
    if (dueDateFilter === "all") return true;
    if (!todo.dueDate) return false;

    const todoDate = new Date(todo.dueDate);
    const now = new Date();

    if (dueDateFilter === "this-week") {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return isWithinInterval(todoDate, { start: weekStart, end: weekEnd });
    }

    if (dueDateFilter === "this-month") {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return isWithinInterval(todoDate, { start: monthStart, end: monthEnd });
    }

    return true;
  });

  useEffect(() => {
    if (user) {
      fetchTodos();
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    try {
      const { data: contactsData, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id);

      if (contactsError) throw contactsError;

      const transformedContacts: Contact[] = contactsData.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        role: contact.role || "",
        company: contact.company || "",
        tags: contact.tags as string[],
        dateOfContact: contact.dateofcontact,
        status: contact.status as Contact["status"],
      }));

      setContacts(transformedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    }
  };

  const handleOpenTodoPanel = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setSelectedContact(contact);
      setIsTodoPanelOpen(true);
    }
  };

  const handleTodoAdded = (contactId: string, todo: Todo) => {
    fetchTodos();
  };

  const handleTodoCompleted = (
    contactId: string,
    todoId: string,
    completed: boolean
  ) => {
    fetchTodos();
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedContactId || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const added = await addTodoForContact(newTask, dueDate);
    if (added) {
      setNewTask("");
      setSelectedContactId("");
      setDueDate(null);
      setIsAddTaskModalOpen(false);
      fetchTodos();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Todos</h1>
            <div className="flex items-center gap-2">
              <Select
                value={completionFilter}
                onValueChange={(value: "all" | "completed" | "not-completed") =>
                  setCompletionFilter(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="not-completed">Not Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={dueDateFilter}
                onValueChange={(value: "all" | "this-week" | "this-month") =>
                  setDueDateFilter(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by due date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Due Dates</SelectItem>
                  <SelectItem value="this-week">Due This Week</SelectItem>
                  <SelectItem value="this-month">Due This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddTaskModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
              <TodoTable
                todos={filteredTodos}
                contacts={contacts}
                onToggleCompletion={toggleTodoCompletion}
                onUpdateDueDate={updateTodoDueDate}
                onOpenTodoPanel={handleOpenTodoPanel}
              />
            </div>
          )}
        </main>
      </div>

      <TodoPanel
        open={isTodoPanelOpen}
        onClose={() => setIsTodoPanelOpen(false)}
        contact={selectedContact}
        onTodoAdded={handleTodoAdded}
        onTodoCompleted={handleTodoCompleted}
      />

      <Dialog
        open={isAddTaskModalOpen}
        onOpenChange={setIsAddTaskModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Name</label>
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Enter task name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact</label>
              <Select
                value={selectedContactId}
                onValueChange={setSelectedContactId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                    >
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate as Date}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Todos;
