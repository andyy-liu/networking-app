import React from "react";
import { useContactImport } from "@/features/import/hooks/useContactImport";
import { FileUpload } from "@/features/import/components/FileUpload";
import { FieldMappingComponent } from "@/features/import/components/FieldMapping";
import { DataValidation } from "@/features/import/components/DataValidation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

export function ImportContacts() {
  const {
    isProcessing,
    parsedData,
    fieldMappings,
    validationResults,
    duplicateEmails,
    importStep,
    importResult,
    canUndo,
    undoInProgress,
    parseFile,
    updateFieldMapping,
    addFieldMapping,
    removeFieldMapping,
    validateData,
    startImport,
    handleUndoImport,
    resetImport,
  } = useContactImport();
  // Render the current step based on importStep
  const renderStep = () => {
    console.log(`Rendering step: ${importStep}`);
    switch (importStep) {
      case "upload":
        return (
          <FileUpload
            onFileSelected={parseFile}
            isProcessing={isProcessing}
          />
        );
      case "mapping":
        if (!parsedData) return null;
        return (
          <FieldMappingComponent
            headers={parsedData.headers}
            fieldMappings={fieldMappings}
            onUpdateMapping={updateFieldMapping}
            onAddMapping={addFieldMapping}
            onRemoveMapping={removeFieldMapping}
            onContinue={validateData}
            onBack={resetImport}
            isProcessing={isProcessing}
          />
        );
      case "validation":
        if (!validationResults) return null;
        return (
          <DataValidation
            validData={validationResults.validData}
            fieldMappings={fieldMappings}
            validationErrors={validationResults.errors}
            duplicateEmails={duplicateEmails}
            onBack={() => resetImport()}
            onImport={startImport}
            isProcessing={isProcessing}
          />
        );
      case "import":
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Importing Contacts</CardTitle>
              <CardDescription>
                Your contacts are being imported...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
              <p className="text-sm text-gray-600">This may take a moment</p>
              <Button
                variant="link"
                onClick={resetImport}
                className="mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        );
      case "complete":
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                Import Complete
              </CardTitle>
              <CardDescription>
                Your contacts have been successfully imported
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-green-50 p-3 rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {importResult?.imported} Contacts Imported
                </h3>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  All your contacts have been successfully added to your
                  database.
                </p>
              </div>

              {canUndo && (
                <Alert className="mb-6">
                  <AlertTitle>Need to undo this import?</AlertTitle>
                  <AlertDescription>
                    If something doesn't look right, you can undo this import
                    and all imported contacts will be removed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={resetImport}
              >
                Import More Contacts
              </Button>

              {canUndo && (
                <Button
                  variant="destructive"
                  onClick={handleUndoImport}
                  disabled={undoInProgress}
                >
                  {undoInProgress ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Undoing Import...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Undo Import
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };
  return (
    <div className="container mx-auto py-6 px-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Contacts</h1>
        <p className="text-gray-600 mt-2">
          Import your contacts from a CSV or Excel file
        </p>
      </div>
      <div className="mb-6">
        <Tabs
          value={importStep}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger
              value="upload"
              disabled
            >
              1. Upload File
            </TabsTrigger>
            <TabsTrigger
              value="mapping"
              disabled
            >
              2. Map Fields
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              disabled
            >
              3. Validate Data
            </TabsTrigger>
            <TabsTrigger
              value="import"
              disabled
            >
              4. Importing
            </TabsTrigger>
            <TabsTrigger
              value="complete"
              disabled
            >
              5. Complete
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {renderStep()}
    </div>
  );
}
