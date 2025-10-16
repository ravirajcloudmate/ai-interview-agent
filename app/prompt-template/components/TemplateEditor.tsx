import { useState } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PromptTemplate, InterviewQuestion } from '../types';

interface TemplateEditorProps {
  template?: PromptTemplate;
  onSave: (template: PromptTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [formData, setFormData] = useState<PromptTemplate>(
    template || {
      templateId: `template-${Date.now()}`,
      name: '',
      candidateName: '',
      description: '',
      assessment: '',
      category: 'Technical Interview',
      targetRole: '',
      experienceLevel: 'mid',
      prompt: {
        interviewer_instructions: '',
        greeting_message: '',
        duration: 45,
        default_questions: [],
        technical_questions: [],
        positive_feedback: [],
        neutral_feedback: [],
        encouragement: [],
        closing_message: '',
        error_messages: {
          no_response: "I didn't quite catch that. Could you please repeat your answer?",
          technical: "I'm experiencing a technical issue. Please give me a moment.",
          timeout: "I haven't heard from you in a while. Are you still there?"
        }
      },
      createdBy: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      averageRating: 0,
      isActive: true,
      tags: []
    }
  );

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePromptField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      prompt: { ...prev.prompt, [field]: value }
    }));
  };

  const addDefaultQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: formData.prompt.default_questions.length + 1,
      question: '',
      category: 'general',
      expected_duration: 45
    };
    updatePromptField('default_questions', [...formData.prompt.default_questions, newQuestion]);
  };

  const updateDefaultQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.prompt.default_questions];
    updated[index] = { ...updated[index], [field]: value };
    updatePromptField('default_questions', updated);
  };

  const removeDefaultQuestion = (index: number) => {
    const updated = formData.prompt.default_questions.filter((_, i) => i !== index);
    updatePromptField('default_questions', updated);
  };

  const addTechnicalQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: formData.prompt.technical_questions.length + 1,
      question: '',
      category: 'technical',
      expected_duration: 60
    };
    updatePromptField('technical_questions', [...formData.prompt.technical_questions, newQuestion]);
  };

  const updateTechnicalQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.prompt.technical_questions];
    updated[index] = { ...updated[index], [field]: value };
    updatePromptField('technical_questions', updated);
  };

  const removeTechnicalQuestion = (index: number) => {
    const updated = formData.prompt.technical_questions.filter((_, i) => i !== index);
    updatePromptField('technical_questions', updated);
  };

  const handleSave = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    console.log('=== SAVE BUTTON CLICKED ===');
    console.log('Form Data:', formData);
    console.log('Button clicked at:', new Date().toISOString());
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter an Agent Name');
      return;
    }
    
    const templateToSave = {
      ...formData,
      name: formData.name.trim(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Calling onSave with template:', templateToSave);
    onSave(templateToSave);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header with Buttons */}
      <div className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold">{template ? 'Edit AI Agent Template' : 'Create New AI Agent Template'}</h2>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave} 
            className="bg-[#e30d0d] hover:bg-[#c00a0a] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Frontend Developer - Mid Level"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Role</Label>
              <Input
                id="targetRole"
                value={formData.targetRole}
                onChange={(e) => updateField('targetRole', e.target.value)}
                placeholder="e.g., Frontend Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the purpose of this template..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment</Label>
            <Textarea
              id="assessment"
              value={formData.assessment || ''}
              onChange={(e) => updateField('assessment', e.target.value)}
              placeholder="Define assessment criteria and evaluation methods..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical Interview">Technical Interview</SelectItem>
                  <SelectItem value="Behavioral Interview">Behavioral Interview</SelectItem>
                  <SelectItem value="Executive Interview">Executive Interview</SelectItem>
                  <SelectItem value="Sales Interview">Sales Interview</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Design Interview">Design Interview</SelectItem>
                  <SelectItem value="Product Management">Product Management</SelectItem>
                  <SelectItem value="Custom Template">Custom Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value: any) => updateField('experienceLevel', value)}
              >
                <SelectTrigger id="experienceLevel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.prompt.duration || 45}
                onChange={(e) => updatePromptField('duration', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Instructions</CardTitle>
          <CardDescription>
            Base instructions for the AI agent personality and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.interviewer_instructions}
            onChange={(e) => updatePromptField('interviewer_instructions', e.target.value)}
            placeholder="You are a professional and friendly AI interviewer..."
            rows={8}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Greeting Message</CardTitle>
          <CardDescription>
            The opening message for the candidate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.greeting_message}
            onChange={(e) => updatePromptField('greeting_message', e.target.value)}
            placeholder="Hello! Welcome to your interview..."
            rows={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Default Questions</CardTitle>
              <CardDescription>
                General interview questions for all candidates
              </CardDescription>
            </div>
            <Button onClick={addDefaultQuestion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.prompt.default_questions.map((question, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4>Question {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDefaultQuestion(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={question.category}
                    onChange={(e) => updateDefaultQuestion(index, 'category', e.target.value)}
                    placeholder="e.g., introduction, skills, goals"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={question.expected_duration}
                    onChange={(e) => updateDefaultQuestion(index, 'expected_duration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateDefaultQuestion(index, 'question', e.target.value)}
                  placeholder="Enter the interview question..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          {formData.prompt.default_questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No questions added yet. Click "Add Question" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Technical Questions</CardTitle>
              <CardDescription>
                Role-specific technical questions
              </CardDescription>
            </div>
            <Button onClick={addTechnicalQuestion} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.prompt.technical_questions.map((question, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4>Technical Question {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTechnicalQuestion(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={question.category}
                    onChange={(e) => updateTechnicalQuestion(index, 'category', e.target.value)}
                    placeholder="e.g., technical, coding, system-design"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expected Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={question.expected_duration}
                    onChange={(e) => updateTechnicalQuestion(index, 'expected_duration', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={question.question}
                  onChange={(e) => updateTechnicalQuestion(index, 'question', e.target.value)}
                  placeholder="Enter the technical question..."
                  rows={2}
                />
              </div>
            </div>
          ))}

          {formData.prompt.technical_questions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No technical questions added yet. Click "Add Question" to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback & Encouragement</CardTitle>
          <CardDescription>
            Response templates for the AI interviewer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Positive Feedback (one per line)</Label>
            <Textarea
              value={formData.prompt.positive_feedback.join('\n')}
              onChange={(e) => updatePromptField('positive_feedback', e.target.value.split('\n').filter(Boolean))}
              placeholder="Great response!&#10;Thank you for that detailed answer."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Neutral Feedback (one per line)</Label>
            <Textarea
              value={formData.prompt.neutral_feedback.join('\n')}
              onChange={(e) => updatePromptField('neutral_feedback', e.target.value.split('\n').filter(Boolean))}
              placeholder="Thank you for sharing.&#10;I appreciate your honesty."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Encouragement (one per line)</Label>
            <Textarea
              value={formData.prompt.encouragement.join('\n')}
              onChange={(e) => updatePromptField('encouragement', e.target.value.split('\n').filter(Boolean))}
              placeholder="Take your time.&#10;Feel free to elaborate."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Closing Message</CardTitle>
          <CardDescription>
            The final message at the end of the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.prompt.closing_message}
            onChange={(e) => updatePromptField('closing_message', e.target.value)}
            placeholder="Thank you so much for your time today..."
            rows={5}
          />
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
