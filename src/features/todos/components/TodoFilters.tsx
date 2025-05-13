import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CompletionFilter, DueDateFilter } from "../hooks/useTodoFilters";

interface TodoFiltersProps {
  completionFilter: CompletionFilter;
  dueDateFilter: DueDateFilter;
  onCompletionFilterChange: (value: CompletionFilter) => void;
  onDueDateFilterChange: (value: DueDateFilter) => void;
  onAddNewTask: () => void;
}

export function TodoFilters({
  completionFilter,
  dueDateFilter,
  onCompletionFilterChange,
  onDueDateFilterChange,
  onAddNewTask,
}: TodoFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={completionFilter}
        onValueChange={(value: CompletionFilter) =>
          onCompletionFilterChange(value)
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
        onValueChange={(value: DueDateFilter) => onDueDateFilterChange(value)}
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

      <Button onClick={onAddNewTask}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Task
      </Button>
    </div>
  );
}
