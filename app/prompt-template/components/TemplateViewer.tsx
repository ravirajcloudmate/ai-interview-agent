import { X, MessageSquare, Target, Award, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PromptTemplate } from '../types';

interface TemplateViewerProps {
  template: PromptTemplate;
  onClose: () => void;
  onEdit?: () => void;
}

export function TemplateViewer({ template, onClose, onEdit }: TemplateViewerProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>{template.name}</CardTitle>
              <CardDescription className="mt-2">
                {template.description}
              </CardDescription>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary">{template.category}</Badge>
                <Badge variant="outline" className="capitalize">
                  {template.experienceLevel} Level
                </Badge>
                <Badge variant="outline">{template.targetRole}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-6 space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  45 minutes
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Usage</p>
                <p>{template.usageCount} times</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p>{template.averageRating > 0 ? `${template.averageRating}/5` : 'Not rated'}</p>
              </div>
            </div>

            {/* Interviewer Instructions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3>Interviewer Instructions</h3>
              </div>
              <Card>
                <CardContent className="p-4">
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {template.prompt.interviewer_instructions}
                  </pre>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Greeting Message */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3>Greeting Message</h3>
              </div>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {template.prompt.greeting_message}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Default Questions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3>Default Questions</h3>
              </div>
              <div className="space-y-3">
                {template.prompt.default_questions.map((q) => (
                  <Card key={q.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{q.category}</Badge>
                        <Badge variant="secondary">{q.expected_duration}s</Badge>
                      </div>
                      <p className="text-muted-foreground">{q.question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Technical Questions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary" />
                <h3>Technical Questions</h3>
              </div>
              <div className="space-y-3">
                {template.prompt.technical_questions.map((q) => (
                  <Card key={q.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">{q.category}</Badge>
                        <Badge variant="secondary">{q.expected_duration}s</Badge>
                      </div>
                      <p className="text-muted-foreground">{q.question}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Feedback Templates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-primary" />
                <h3>Feedback Templates</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2">Positive Feedback:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {template.prompt.positive_feedback.map((feedback, i) => (
                      <li key={i}>{feedback}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2">Neutral Feedback:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {template.prompt.neutral_feedback.map((feedback, i) => (
                      <li key={i}>{feedback}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2">Encouragement:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {template.prompt.encouragement.map((feedback, i) => (
                      <li key={i}>{feedback}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Closing Message */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3>Closing Message</h3>
              </div>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {template.prompt.closing_message}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-primary" />
                    <h3>Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Metadata Footer */}
            <Separator />
            <div className="text-muted-foreground">
              <p>Created by {template.createdBy} on {new Date(template.createdAt).toLocaleDateString()}</p>
              <p>Last updated: {new Date(template.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
