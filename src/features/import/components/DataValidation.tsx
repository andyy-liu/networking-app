import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Contact } from "@/features/contacts/types";
import { FieldMapping } from "@/features/import/utils/fileImport";

interface DataValidationProps {
  validData: Record<string, unknown>[];
  fieldMappings: FieldMapping[];
  validationErrors: string[];
  duplicateEmails: string[];
  onBack: () => void;
  onImport: (skipDuplicates: boolean) => void;
  isProcessing: boolean;
}

export function DataValidation({
  validData,
  fieldMappings,
  validationErrors,
  duplicateEmails,
  onBack,
  onImport,
  isProcessing,
}: DataValidationProps) {
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  console.log("[DataValidation] Props received:", {
    validData,
    fieldMappings,
    validationErrors,
    duplicateEmails,
  });

  // Get the field names that are mapped
  const displayFields = fieldMappings.map((mapping) => ({
    sourceField: mapping.sourceField,
    targetField: mapping.targetField,
    label:
      {
        name: "Name",
        email: "Email",
        role: "Role",
        company: "Company",
        tags: "Tags",
        dateOfContact: "Date of Contact",
        status: "Status",
      }[mapping.targetField] || mapping.targetField,
  }));
  console.log("[DataValidation] displayFields:", displayFields); // Calculate how many contacts will actually be imported
  const totalToImport = skipDuplicates
    ? validData.filter((item) => {
        const emailMapping = fieldMappings.find(
          (m) => m.targetField === "email"
        );
        if (!emailMapping) return true;
        const email = item[emailMapping.sourceField] as string;

        // Empty emails are not considered duplicates
        if (!email || email.trim() === "") return true;

        return !duplicateEmails.includes(email);
      }).length
    : validData.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Review Import Data</CardTitle>
        <CardDescription>
          Review and confirm your data before importing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            <p className="font-medium mb-2">The following errors were found:</p>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">{validData.length}</span> valid
            contacts found
          </p>

          {duplicateEmails.length > 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-yellow-800">
                    {duplicateEmails.length} duplicate email
                    {duplicateEmails.length !== 1 ? "s" : ""} found
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    These contacts already exist in your database
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="skip-duplicates"
                    checked={skipDuplicates}
                    onCheckedChange={setSkipDuplicates}
                    disabled={isProcessing}
                  />
                  <Label htmlFor="skip-duplicates">Skip duplicates</Label>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mt-4">
            <span className="font-semibold">{totalToImport}</span> contacts will
            be imported
          </p>
        </div>

        <div className="border rounded-md mb-6 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {displayFields.map((field, i) => (
                  <TableHead key={i}>{field.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Ensure no whitespace before this curly brace */}
              {validData.slice(0, 5).map((row, rowIndex) => {
                console.log(
                  `[DataValidation] Row ${rowIndex}:`,
                  JSON.parse(JSON.stringify(row))
                );
                const emailFieldMapping = fieldMappings.find(
                  (m) => m.targetField === "email"
                );
                const email = emailFieldMapping
                  ? (row[
                      emailFieldMapping.targetField as keyof typeof row
                    ] as string)
                  : "";
                const isDuplicate = duplicateEmails.includes(email);

                return (
                  <TableRow
                    key={rowIndex}
                    className={isDuplicate ? "bg-yellow-50" : ""}
                  >
                    {displayFields.map((field, colIndex) => {
                      const cellValue =
                        row[field.targetField as keyof typeof row];
                      console.log(
                        `[DataValidation] Row ${rowIndex}, Col ${colIndex} (Source: ${field.sourceField}, Target: ${field.targetField}): Value:`,
                        cellValue
                      );
                      return (
                        <TableCell key={colIndex}>
                          {field.targetField === "tags" &&
                          Array.isArray(cellValue)
                            ? (cellValue as string[]).join(", ")
                            : String(
                                cellValue !== undefined && cellValue !== null
                                  ? cellValue
                                  : ""
                              )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {validData.length > 5 && (
            <div className="p-2 text-center text-xs text-gray-500 border-t">
              Showing 5 of {validData.length} contacts
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={isProcessing}
          >
            Back
          </Button>
          <Button
            onClick={() => onImport(skipDuplicates)}
            disabled={validData.length === 0 || isProcessing}
          >
            {isProcessing ? "Importing..." : "Import Contacts"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
