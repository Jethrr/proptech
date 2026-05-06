import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lead } from "@/data/leads";
import { generateLeadsFromCSV } from "@/lib/mockData";

interface CSVUploadProps {
  onLeadsParsed: (leads: Lead[]) => void;
}

const CSVUpload = ({ onLeadsParsed }: CSVUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewLeads, setPreviewLeads] = useState<Lead[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentField.trim());
        currentField = "";
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (currentField || currentLine.length > 0) {
          currentLine.push(currentField.trim());
          currentField = "";
          if (currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [];
          }
        }
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n after \r
        }
      } else {
        currentField += char;
      }
    }

    // Add last field and line
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField.trim());
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length < 2) {
        throw new Error("CSV file must have at least a header row and one data row");
      }

      const leads = generateLeadsFromCSV(csvData);
      setPreviewLeads(leads);
      onLeadsParsed(leads);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV file");
      setUploadedFile(null);
      setPreviewLeads([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv" || file.name.endsWith(".csv")) {
      handleFile(file);
    } else {
      setError("Please upload a CSV file");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setPreviewLeads([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload your CRM export or lead database CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              {isDragging ? "Drop your CSV file here" : "Drag and drop your CSV file"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              or click to browse
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              Select File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <FileText className="h-4 w-4 inline mr-2" />
                  {uploadedFile.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-6 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>

            {isProcessing && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground mt-2">Processing CSV...</p>
              </div>
            )}

            {previewLeads.length > 0 && (
              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">
                  Successfully parsed {previewLeads.length} leads
                </p>
                <p className="text-xs text-muted-foreground">
                  Preview: {previewLeads.slice(0, 3).map(l => l.name).join(", ")}
                  {previewLeads.length > 3 && ` and ${previewLeads.length - 3} more...`}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Expected CSV format:</p>
          <p>Name, Email, Phone, Last Contact Date, Source, Notes</p>
          <p className="mt-2">The system will auto-detect column headers.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;

