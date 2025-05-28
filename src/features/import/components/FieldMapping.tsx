import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Contact } from "@/features/contacts/types";
import { FieldMapping } from "@/features/import/utils/fileImport";

interface FieldMappingProps {
  headers: string[];
  fieldMappings: FieldMapping[];
  onUpdateMapping: (index: number, mapping: Partial<FieldMapping>) => void;
  onAddMapping: (mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

export function FieldMappingComponent({
  headers,
  fieldMappings,
  onUpdateMapping,
  onAddMapping,
  onRemoveMapping,
  onContinue,
  onBack,
  isProcessing,
}: FieldMappingProps) {
  // Get all possible target fields from Contact type
  const targetFields: Array<{
    label: string;
    value: keyof Omit<Contact, "id" | "todos">;
    optional?: boolean;
    defaultValue?: string;
  }> = [
    { label: "Name", value: "name" },
    { label: "Email (Optional)", value: "email", optional: true },
    { label: "Role (Optional)", value: "role", optional: true },
    { label: "Company (Optional)", value: "company", optional: true },
    { label: "Tags (Optional)", value: "tags", optional: true },
    { label: "Date of Contact", value: "dateOfContact" },
    {
      label: "Status (Optional, defaults to Not Started)",
      value: "status",
      optional: true,
      defaultValue: "Not Started",
    },
    { label: "LinkedIn URL (Optional)", value: "linkedinUrl", optional: true },
  ];

  // Find unused source fields
  const usedSourceFields = fieldMappings.map((mapping) => mapping.sourceField);
  const unusedSourceFields = headers.filter(
    (header) => !usedSourceFields.includes(header)
  );

  // Find unused target fields
  const usedTargetFields = fieldMappings.map((mapping) => mapping.targetField);
  const unusedTargetFields = targetFields.filter(
    (field) => !usedTargetFields.includes(field.value)
  );

  const handleAddMapping = () => {
    if (unusedSourceFields.length > 0 && unusedTargetFields.length > 0) {
      onAddMapping({
        sourceField: unusedSourceFields[0],
        targetField: unusedTargetFields[0].value,
      });
    }
  };
  // Check if required fields are mapped
  const requiredFields: (keyof Omit<Contact, "id" | "todos">)[] = [
    "name",
    "dateOfContact",
  ];
  const missingRequiredFields = requiredFields.filter(
    (field) => !usedTargetFields.includes(field)
  );
  const canContinue = missingRequiredFields.length === 0;

  return (
    <Card className="w-full">
      {" "}
      <CardHeader>
        <CardTitle>Map Your Fields</CardTitle>
        <CardDescription>
          Match the columns from your file to the appropriate contact fields
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
          <p className="font-medium">Field Information:</p>
          <ul className="list-disc ml-5 mt-1">
            <li>Only Name and Date of Contact are required</li>
            <li>Email will use a placeholder if empty</li>
            <li>Status will default to "Not Started" if not provided</li>
          </ul>
        </div>

        {missingRequiredFields.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
            <p className="font-medium">Required fields missing:</p>
            <ul className="list-disc ml-5 mt-1">
              {missingRequiredFields.map((field) => (
                <li key={field}>
                  {targetFields.find((f) => f.value === field)?.label || field}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {fieldMappings.map((mapping, index) => (
            <div
              key={index}
              className="flex gap-4 items-center"
            >
              <div className="flex-1">
                <Select
                  value={mapping.sourceField}
                  onValueChange={(value) =>
                    onUpdateMapping(index, { sourceField: value })
                  }
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source field" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem
                        key={header}
                        value={header}
                      >
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <Select
                  value={mapping.targetField}
                  onValueChange={(value) =>
                    onUpdateMapping(index, {
                      targetField: value as keyof Omit<Contact, "id" | "todos">,
                    })
                  }
                  disabled={isProcessing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target field" />
                  </SelectTrigger>{" "}
                  <SelectContent>
                    {targetFields.map((field) => (
                      <SelectItem
                        key={field.value}
                        value={field.value}
                      >
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-none">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveMapping(index)}
                  disabled={isProcessing}
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {unusedSourceFields.length > 0 && unusedTargetFields.length > 0 && (
            <Button
              variant="outline"
              onClick={handleAddMapping}
              className="self-start"
              disabled={isProcessing}
            >
              Add Field Mapping
            </Button>
          )}{" "}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
            >
              Back
            </Button>
            <Button
              onClick={() => {
                console.log("Continue button clicked");
                onContinue();
              }}
              disabled={!canContinue || isProcessing}
            >
              {isProcessing ? "Processing..." : "Continue"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
