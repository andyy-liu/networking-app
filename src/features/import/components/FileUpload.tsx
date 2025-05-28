import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  acceptedFileTypes?: string;
}

export function FileUpload({
  onFileSelected,
  isProcessing,
  acceptedFileTypes = ".csv,.xlsx,.xls",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Check if file type is valid
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const validExtensions = ["csv", "xlsx", "xls"];

    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Contacts</CardTitle>
        <CardDescription>
          Upload your contacts from a CSV or Excel file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`
            flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-md cursor-pointer
            ${
              dragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary/50"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <svg
            className="w-10 h-10 mb-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
            />
          </svg>

          <p className="mb-2 text-sm text-gray-600">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500">CSV, Excel (.xlsx, .xls)</p>

          {selectedFile && (
            <div className="mt-4 p-2 bg-secondary/20 rounded-md flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm font-medium">{selectedFile.name}</span>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedFileTypes}
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
        </div>

        {selectedFile && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="default"
              disabled={isProcessing}
              onClick={() => onFileSelected(selectedFile)}
            >
              {isProcessing ? "Processing..." : "Process File"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
