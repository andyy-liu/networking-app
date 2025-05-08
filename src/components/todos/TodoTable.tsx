import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, CalendarIcon, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Todo } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type SortField = "status" | "task" | "contact" | "dueDate" | null;
type SortOrder = "asc" | "desc" | null;

interface TodoTableProps {
  todos: Todo[];
  contacts: { id: string; name: string }[];
  onToggleCompletion: (todoId: string, completed: boolean) => void;
  onUpdateDueDate: (todoId: string, date: Date | null) => void;
  onOpenTodoPanel: (contactId: string) => void;
}

export const TodoTable: React.FC<TodoTableProps> = ({
  todos,
  contacts,
  onToggleCompletion,
  onUpdateDueDate,
  onOpenTodoPanel,
}) => {
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const getContactName = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    return contact?.name || "Unknown Contact";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortField(null);
        setSortOrder(null);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTodos = useMemo(() => {
    if (!sortField || !sortOrder) return todos;

    return [...todos].sort((a, b) => {
      let comparison = 0;
      let contactA: string;
      let contactB: string;

      switch (sortField) {
        case "status":
          comparison = a.completed === b.completed ? 0 : a.completed ? 1 : -1;
          break;
        case "task":
          comparison = a.task.localeCompare(b.task);
          break;
        case "contact":
          contactA = getContactName(a.contactId);
          contactB = getContactName(b.contactId);
          comparison = contactA.localeCompare(contactB);
          break;
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else
            comparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [todos, contacts, sortField, sortOrder, getContactName]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[100px] pr-4"
              onClick={() => handleSort("status")}
              style={{ cursor: "pointer" }}
            >
              Status{" "}
              {sortField === "status" && (
                <ArrowUpDown className="inline h-4 w-4 ml-1" />
              )}
            </TableHead>
            <TableHead
              onClick={() => handleSort("task")}
              style={{ cursor: "pointer" }}
            >
              Task{" "}
              {sortField === "task" && (
                <ArrowUpDown className="inline h-4 w-4 ml-1" />
              )}
            </TableHead>
            <TableHead
              onClick={() => handleSort("contact")}
              style={{ cursor: "pointer" }}
            >
              Contact{" "}
              {sortField === "contact" && (
                <ArrowUpDown className="inline h-4 w-4 ml-1" />
              )}
            </TableHead>
            <TableHead
              onClick={() => handleSort("dueDate")}
              style={{ cursor: "pointer" }}
            >
              Due Date{" "}
              {sortField === "dueDate" && (
                <ArrowUpDown className="inline h-4 w-4 ml-1" />
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:!h-10 [&_td]:!py-0.5">
          {sortedTodos.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center"
              >
                No todos found. Add some todos to get started.
              </TableCell>
            </TableRow>
          ) : (
            sortedTodos.map((todo) => (
              <TableRow key={todo.id}>
                <TableCell className="pl-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onToggleCompletion(todo.id, todo.completed)}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </Button>
                </TableCell>
                <TableCell
                  className={cn(
                    todo.completed && "line-through text-muted-foreground",
                    "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => onOpenTodoPanel(todo.contactId)}
                >
                  {todo.task}
                </TableCell>
                <TableCell>{getContactName(todo.contactId)}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex h-6 items-center justify-center gap-1 rounded-md border bg-background px-2 text-sm",
                          "hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <CalendarIcon className="h-3 w-3" />
                        {todo.dueDate
                          ? format(
                              new Date(`${todo.dueDate}T00:00:00`),
                              "MMM d, yyyy"
                            )
                          : "Set due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          todo.dueDate
                            ? new Date(`${todo.dueDate}T00:00:00`)
                            : undefined
                        }
                        onSelect={(date) => onUpdateDueDate(todo.id, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
