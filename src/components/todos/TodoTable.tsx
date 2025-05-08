import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  CalendarIcon,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Todo } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type SortField = "status" | "contact" | "dueDate" | null;
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
    // Cycle through: null -> asc -> desc -> null
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === null) {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(null);
        setSortOrder(null);
      }
    }
  };

  const sortedTodos = [...todos];
  if (sortField && sortOrder) {
    sortedTodos.sort((a, b) => {
      if (sortField === "status") {
        // Sort by completion status
        const comparison = Number(a.completed) - Number(b.completed);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortField === "contact") {
        // Sort by contact name
        const nameA = getContactName(a.contactId).toLowerCase();
        const nameB = getContactName(b.contactId).toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortField === "dueDate") {
        // Sort by due date (handle null values)
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return sortOrder === "asc" ? 1 : -1;
        if (!b.dueDate) return sortOrder === "asc" ? -1 : 1;

        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        const comparison = dateA.getTime() - dateB.getTime();
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return 0;
    });
  }

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline" />
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-[100px] cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status {renderSortIndicator("status")}
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("contact")}
            >
              Contact {renderSortIndicator("contact")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("dueDate")}
            >
              Due Date {renderSortIndicator("dueDate")}
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
                <TableCell>
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
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                    >
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
