import { useState, useMemo } from "react";
import { Todo } from "../types";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

export type CompletionFilter = "all" | "completed" | "not-completed";
export type DueDateFilter = "all" | "this-week" | "this-month";

export function useTodoFilters(todos: Todo[]) {
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all");
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>("all");

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
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
  }, [todos, completionFilter, dueDateFilter]);

  return {
    completionFilter,
    setCompletionFilter,
    dueDateFilter,
    setDueDateFilter,
    filteredTodos,
  };
}
