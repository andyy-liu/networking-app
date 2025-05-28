import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactTag } from "@/features/contacts/types";
import { ArrowUp, ArrowDown, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactTableHeaderProps {
  onSort: (key: string, direction: "asc" | "desc" | "default") => void;
  sortKey: string;
  sortDirection: "asc" | "desc" | "default";
  onFilterByTag: (tag: ContactTag | null) => void;
  activeTagFilter: ContactTag | null;
  availableTags: ContactTag[];
  hasCheckboxColumn?: boolean;
}

export const ContactTableHeader: React.FC<ContactTableHeaderProps> = ({
  onSort,
  sortKey,
  sortDirection,
  onFilterByTag,
  activeTagFilter,
  availableTags,
  hasCheckboxColumn = false,
}) => {
  const handleSortClick = (key: string) => {
    if (sortKey === key) {
      // Cycle through sort directions: default -> asc -> desc -> default
      if (sortDirection === "default") {
        onSort(key, "asc");
      } else if (sortDirection === "asc") {
        onSort(key, "desc");
      } else {
        onSort(key, "default");
      }
    } else {
      // New column, start with ascending
      onSort(key, "asc");
    }
  };

  const renderSortIndicator = (key: string) => {
    if (sortKey !== key) return null;

    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-blue-500" />;
    } else if (sortDirection === "desc") {
      return <ArrowDown className="ml-2 h-4 w-4 text-blue-500" />;
    }
    return null;
  };

  return (
    <TableHeader>
      <TableRow>
        {hasCheckboxColumn && <TableHead className="w-10"></TableHead>}
        <TableHead
          className="w-[200px] cursor-pointer"
          onClick={() => handleSortClick("name")}
        >
          <div className="flex items-center">
            Person
            {renderSortIndicator("name")}
          </div>
        </TableHead>
        <TableHead>Role</TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSortClick("company")}
        >
          <div className="flex items-center">
            Company
            {renderSortIndicator("company")}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center">
            Tags
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2">
                <Filter className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem
                  checked={activeTagFilter === null}
                  onCheckedChange={() => onFilterByTag(null)}
                >
                  All Tags
                </DropdownMenuCheckboxItem>
                {availableTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={activeTagFilter === tag}
                    onCheckedChange={() => onFilterByTag(tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSortClick("dateOfContact")}
        >
          <div className="flex items-center ml-4">
            Last Contacted
            {renderSortIndicator("dateOfContact")}
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center ml-4">To-do</div>
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleSortClick("status")}
        >
          <div className="flex items-center ml-4">
            Status
            {renderSortIndicator("status")}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
