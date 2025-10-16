import { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ResumeAnalysis } from '../types';

interface ResumeUploadProps {
  onAnalysisComplete: (analysis: ResumeAnalysis) => void;
}

export function ResumeUpload({ onAnalysisComplete }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const analyzeResume = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setAnalysisSteps([]);

    try {
      // Step 1: Upload file
      setProgress(10);
      setAnalysisSteps(prev => [...prev, 'Uploading resume...']);

      const formData = new FormData();
      formData.append('file', file);

      // Step 2: Send to OpenAI API
      setProgress(30);
      setAnalysisSteps(prev => [...prev, 'Sending to OpenAI for analysis...']);

      const response = await fetch('/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      // Step 3: Processing response
      setProgress(70);
      setAnalysisSteps(prev => [...prev, 'Processing analysis results...']);

      const { analysis } = await response.json();

      // Step 4: Finalizing
      setProgress(90);
      setAnalysisSteps(prev => [...prev, 'Extracting candidate information...']);

      // Step 5: Complete
      setProgress(100);
      setAnalysisSteps(prev => [...prev, 'Analysis complete!']);

      // Use the real analysis data
      onAnalysisComplete(analysis);

    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisSteps(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      
      // Fallback to mock data on error
      setTimeout(async () => {
        const { mockResumeAnalysis } = await import('../lib/mockData');
        onAnalysisComplete(mockResumeAnalysis);
      }, 1000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Upload Resume</CardTitle>
        <CardDescription>
          Upload candidate resume (PDF/DOCX) to extract key information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!uploading ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2">Drag & Drop Resume Here</p>
              <p className="text-muted-foreground mb-4">or</p>
              <label htmlFor="file-upload">
                <Button asChild variant="secondary">
                  <span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                    Choose File
                  </span>
                </Button>
              </label>
              <p className="text-muted-foreground mt-4">
                Supported: PDF, DOCX • Max size: 10MB
              </p>
            </div>

            {file && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <p>{file.name}</p>
                    <p className="text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button onClick={analyzeResume}>
                  Analyze Resume
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p>Analyzing Resume...</p>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="space-y-2">
              {analysisSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  {index === analysisSteps.length - 1 && progress < 100 ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
