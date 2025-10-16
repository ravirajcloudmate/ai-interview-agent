import { CheckCircle, Clock, Target, MessageSquare, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PromptTemplate, ResumeAnalysis } from '../types';

interface PromptPreviewProps {
  template: PromptTemplate;
  analysis?: ResumeAnalysis;
  onView: () => void;
  onUploadAnother: () => void;
  onSave: () => void;
}

export function PromptPreview({ template, analysis, onView, onUploadAnother, onSave }: PromptPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Step 2: Generated Prompt Template</CardTitle>
            <CardDescription>
              AI-generated interview prompt based on resume analysis
            </CardDescription>
          </div>
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <p className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            Interview prompt template generated successfully!
          </p>
        </div>

        <div>
          <h4 className="mb-3">Analysis Summary</h4>
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-muted-foreground">Candidate</p>
              <p>{analysis?.candidateInfo.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Experience Level</p>
              <p className="capitalize">{template.experienceLevel}-Level ({analysis?.experience[0]?.duration.split('(')[1]?.replace(')', '') || 'N/A'})</p>
            </div>
            <div>
              <p className="text-muted-foreground">Primary Skills</p>
              <p>{analysis?.skills.technical.slice(0, 2).join(', ') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Focus Areas</p>
              <p>{template.prompt.default_questions[0]?.category || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Questions</p>
              <p>{template.prompt.default_questions.length + template.prompt.technical_questions.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated Duration</p>
              <p>45 minutes</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-3">Generated Prompt Preview</h4>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <p>Introduction Script</p>
                </div>
                <p className="text-muted-foreground italic">
                  "{template.prompt.greeting_message.substring(0, 100)}..."
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <p>Question Strategy</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Default Questions</span>
                    <Badge variant="secondary">{template.prompt.default_questions.length} questions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Technical Questions</span>
                    <Badge variant="secondary">{template.prompt.technical_questions.length} questions</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Questions</span>
                    <Badge variant="outline">{template.prompt.default_questions.length + template.prompt.technical_questions.length}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <p>Interview Details</p>
                </div>
                <div className="space-y-1 text-muted-foreground">
                  <p>Candidate: {template.candidateName}</p>
                  <p>Position: {template.targetRole}</p>
                  <p>Experience Level: {template.experienceLevel}</p>
                  <p>Total Questions: {template.prompt.default_questions.length + template.prompt.technical_questions.length}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={onView}>
                View Full Prompt
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onUploadAnother}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Another Resume
          </Button>
          <Button onClick={onSave}>
            Save Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
