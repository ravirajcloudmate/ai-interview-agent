'use client';

import { useState, useEffect } from 'react';
import { Library, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Sidebar from '@/app/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TemplateLibrary } from './components/TemplateLibrary';
import { TemplateEditor } from './components/TemplateEditor';
import { TemplateViewer } from './components/TemplateViewer';
import { generatePromptFromResume } from './lib/mockData';
import { PromptTemplate, ResumeAnalysis } from './types';
// Import storage helpers
import {
  saveTemplatesToStorage,
  loadTemplatesFromStorage,
  deleteTemplateFromStorage
} from './lib/templateStorage';

export default function PromptTemplatePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<PromptTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<PromptTemplate | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auto-save templates to storage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      console.log('Saving templates to storage:', templates.length);
      saveTemplatesToStorage(templates);
    }
  }, [templates]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTemplates = async () => {
    console.log('=== LOADING TEMPLATES ===');
    setLoading(true);
    
    // First, load from local storage
    const localTemplates = loadTemplatesFromStorage();
    
    try {
      console.log('Local templates loaded:', localTemplates.length);
      
      if (!user?.id) {
        console.log('No user ID - using local templates only');
        setTemplates(localTemplates);
        setLoading(false);
        return;
      }

      // Try to load from Supabase if user is logged in
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.company_id) {
        console.log('User not set up in database - using local templates');
        setTemplates(localTemplates);
        setLoading(false);
        return;
      }

      // Fetch templates from database
      const { data: dbTemplates, error: templatesError } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('company_id', userData.company_id)
        .order('created_at', { ascending: false });

      if (templatesError) {
        console.error('Error fetching templates:', templatesError);
        setTemplates(localTemplates);
        setLoading(false);
        return;
      }

      // Convert database templates
      const convertedTemplates: PromptTemplate[] = (dbTemplates || []).map((dbTemplate: any) => {
        let promptData;
        try {
          promptData = typeof dbTemplate.prompt_text === 'string' 
            ? JSON.parse(dbTemplate.prompt_text) 
            : dbTemplate.prompt_text;
        } catch (e) {
          console.warn('Failed to parse prompt_text for template:', dbTemplate.id, e);
          promptData = {
            interviewer_instructions: '',
            greeting_message: '',
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
          };
        }

        return {
          templateId: dbTemplate.id,
          name: dbTemplate.name,
          candidateName: dbTemplate.position || '',
          description: dbTemplate.description || '',
          assessment: dbTemplate.assessment || '',
          category: getCategoryFromDb(dbTemplate.category),
          targetRole: dbTemplate.position || '',
          experienceLevel: dbTemplate.level as 'junior' | 'mid' | 'senior' | 'lead',
          prompt: {
            ...promptData,
            duration: (promptData?.duration as number | undefined) ?? 45,
          },
          createdBy: dbTemplate.created_by || 'User',
          createdAt: dbTemplate.created_at,
          updatedAt: dbTemplate.updated_at,
          usageCount: dbTemplate.usage_count || 0,
          averageRating: parseFloat(dbTemplate.rating) || 0,
          isActive: dbTemplate.is_active,
          tags: []
        };
      });

      // Merge database and local templates (database takes priority)
      const dbIds = new Set(convertedTemplates.map(t => t.templateId));
      const uniqueLocalTemplates = localTemplates.filter(t => !dbIds.has(t.templateId));
      const mergedTemplates = [...convertedTemplates, ...uniqueLocalTemplates];
      
      console.log('Merged templates:', mergedTemplates.length);
      setTemplates(mergedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(localTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromDb = (dbCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      'technical': 'Technical Interview',
      'behavioral': 'Behavioral Interview',
      'hr': 'Executive Interview',
      'custom': 'Custom Template'
    };
    return categoryMap[dbCategory] || 'Technical Interview';
  };

  const getCategoryForDb = (category: string): string => {
    const categoryMap: { [key: string]: string } = {
      'Technical Interview': 'technical',
      'Behavioral Interview': 'behavioral',
      'Executive Interview': 'hr',
      'Custom Template': 'custom'
    };
    return categoryMap[category] || 'technical';
  };

  const handleAnalysisComplete = (analysis: ResumeAnalysis) => {
    setCurrentAnalysis(analysis);
    const template = generatePromptFromResume(analysis);
    setGeneratedTemplate(template);
    showToast('Resume analyzed & template generated!');
  };

  const handleSaveTemplate = () => {
    if (generatedTemplate) {
      setTemplates(prev => [generatedTemplate, ...prev]);
      showToast(`Template saved for ${generatedTemplate.candidateName}!`);
      setActiveTab('library');
      setTimeout(() => {
        setCurrentAnalysis(null);
        setGeneratedTemplate(null);
      }, 500);
    }
  };

  const handleViewTemplate = (template: PromptTemplate) => {
    setViewingTemplate(template);
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
  };

  const openDeleteDialog = (templateId: string) => {
    setDeletingTemplateId(templateId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplateId) {
      console.error('No template ID provided for deletion');
      return;
    }
    
    const templateId = deletingTemplateId;
    const templateToDelete = templates.find(t => t.templateId === templateId);
    const templateName = templateToDelete?.name || 'AI Agent';
    
    console.log('Delete confirmed by user for template:', templateId);
    
    try {
      setDeleteLoading(true);
      
      // Check if this is a database template
      const isDatabaseTemplate = !templateId.startsWith('template-');
      
      if (isDatabaseTemplate && user?.id) {
        try {
          console.log('Deleting from database...');
          const { error } = await supabase
            .from('prompt_templates')
            .delete()
            .eq('id', templateId);

          if (error) {
            console.error('Database delete failed:', error);
            showToast(`Failed to delete AI Agent: ${error.message || 'Database error'}`, 'error');
            setIsDeleteDialogOpen(false);
            setDeletingTemplateId(null);
            return;
          } else {
            console.log('Successfully deleted from database');
          }
        } catch (error) {
          console.error('Database delete error:', error);
          showToast(`Failed to delete AI Agent: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
          setIsDeleteDialogOpen(false);
          setDeletingTemplateId(null);
          return;
        }
      }
      
      // Delete from local storage
      deleteTemplateFromStorage(templateId);
      
      // Update state
      setTemplates(prev => prev.filter(t => t.templateId !== templateId));
      showToast(`${templateName} deleted successfully!`, 'success');
      
      setIsDeleteDialogOpen(false);
      setDeletingTemplateId(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      showToast(`Failed to delete AI Agent: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveFromEditor = async (template: PromptTemplate) => {
    console.log('===== HANDLE SAVE FROM EDITOR =====');
    console.log('Template:', template.name);
    
    if (!user?.id) {
      console.log('No user - saving locally only');
      
      setTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.templateId === template.templateId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = template;
          return updated;
        }
        return [template, ...prev];
      });
      
      showToast('AI Agent saved successfully!');
      setEditingTemplate(null);
      return;
    }

    try {
      // Resolve company_id with robust fallbacks (same as Job Postings)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data for template creation:', userError);
      }

      const fallbackLocalCompanyId = (typeof window !== 'undefined') ? window.localStorage.getItem('branding_company_id') : null;
      let resolvedCompanyId = userData?.company_id || (user as any)?.user_metadata?.company_id || fallbackLocalCompanyId || null;

      // If company_id still missing, create a lightweight company automatically
      if (!resolvedCompanyId) {
        try {
          const inferredName = (user as any)?.user_metadata?.company_name || (user.email?.split('@')[0] || 'My Company');
          const { data: createdCompany, error: companyErr } = await supabase
            .from('companies')
            .insert([{ name: inferredName }])
            .select('id')
            .single();
          if (!companyErr && createdCompany?.id) {
            resolvedCompanyId = createdCompany.id as string;
            if (typeof window !== 'undefined') {
              try { window.localStorage.setItem('branding_company_id', resolvedCompanyId); } catch {}
            }
          }
        } catch (e) {
          console.warn('Auto-create company failed; proceeding without but insert may fail due to NOT NULL.', e);
        }
      }

      // Prepare data for database - fix field mapping issues
      const dbData = {
        company_id: resolvedCompanyId,
        name: template.name,
        description: template.description || null,
        assessment: template.assessment || null,
        prompt_text: JSON.stringify(template.prompt), // Store as JSON string
        category: getCategoryForDb(template.category),
        level: template.experienceLevel,
        position: template.targetRole || null,
        usage_count: template.usageCount || 0,
        rating: template.averageRating || 0,
        is_active: template.isActive,
        created_by: user.id
      };

      console.log('Saving template with data:', dbData);

      const isNewTemplate = template.templateId.startsWith('template-');
      
      if (isNewTemplate) {
        console.log('Inserting new template...');
        const { data: insertedData, error: insertError } = await supabase
          .from('prompt_templates')
          .insert([dbData])
          .select()
          .single();

        console.log('Insert response:', { insertedData, insertError });

        if (insertError) {
          console.error('Insert error:', insertError);
          setTemplates(prev => [template, ...prev]);
          showToast(`Failed to save AI Agent: ${insertError.message || 'Database error'}`);
          setEditingTemplate(null);
          return;
        }

        if (!insertedData) {
          console.error('No data returned from insert');
          setTemplates(prev => [template, ...prev]);
          showToast('Failed to save AI Agent: No data returned');
          setEditingTemplate(null);
          return;
        }

        const updatedTemplate = {
          ...template,
          templateId: insertedData.id,
          createdAt: insertedData.created_at,
          updatedAt: insertedData.updated_at
        };
        
        setTemplates(prev => {
          const filtered = prev.filter(t => t.templateId !== template.templateId);
          return [updatedTemplate, ...filtered];
        });
        
        showToast('AI Agent created successfully!');
      } else {
        console.log('Updating existing template...');
        const { data: updatedData, error: updateError } = await supabase
          .from('prompt_templates')
          .update(dbData)
          .eq('id', template.templateId)
          .select()
          .single();

        console.log('Update response:', { updatedData, updateError });

        if (updateError) {
          console.error('Update error:', updateError);
          showToast(`Failed to update AI Agent: ${updateError.message || 'Database error'}`);
          setEditingTemplate(null);
          return;
        }

        const updatedTemplate = {
          ...template,
          updatedAt: updatedData?.updated_at || new Date().toISOString()
        };

        setTemplates(prev =>
          prev.map(t => (t.templateId === template.templateId ? updatedTemplate : t))
        );
        
        showToast('AI Agent updated successfully!');
      }
      
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      
      setTemplates(prev => {
        const existingIndex = prev.findIndex(t => t.templateId === template.templateId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = template;
          return updated;
        }
        return [template, ...prev];
      });
      
      showToast(`Failed to save AI Agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setEditingTemplate(null);
    }
  };

  const handleCancelEditor = () => {
    setEditingTemplate(null);
  };

  const handleCreateNewAgent = () => {
    console.log('Creating new agent...');
    setEditingTemplate({
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
      createdBy: user?.email || 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      averageRating: 0,
      isActive: true,
      tags: []
    });
  };

  const userInitials = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        user={{
          name: user?.email?.split('@')[0] || 'User',
          company: 'Jobly.Ai',
          plan: 'Professional',
          initials: userInitials,
          email: user?.email
        }}
        activeModule="prompt-template"
      />

      <div className="flex-1 with-fixed-sidebar overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#e30d0d] text-white px-3 py-1 rounded-md font-semibold">
                AI
              </div>
              <h1 className="text-3xl font-bold">Agent Library</h1>
            </div>
            <p className="text-muted-foreground">
              Create and manage AI interview agents with custom prompts
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#e30d0d] mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Loading AI Agents...</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1 mb-8 hidden">
                <TabsTrigger value="library" className="flex items-center gap-2">
                  <Library className="w-4 h-4" />
                  AI Agent Library
                </TabsTrigger>
              </TabsList>

              <TabsContent value="library">
                <TemplateLibrary
                  templates={templates}
                  onView={handleViewTemplate}
                  onEdit={handleEditTemplate}
                  onDelete={openDeleteDialog}
                  onCreateAgent={handleCreateNewAgent}
                />
              </TabsContent>
            </Tabs>
          )}

          {viewingTemplate && (
            <TemplateViewer
              template={viewingTemplate}
              onClose={() => setViewingTemplate(null)}
              onEdit={() => {
                handleEditTemplate(viewingTemplate);
                setViewingTemplate(null);
              }}
            />
          )}

          {editingTemplate && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  console.log('Backdrop clicked');
                }
              }}
            >
              <div 
                className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-[#e30d0d]/20 flex flex-col overflow-hidden relative z-[51]"
                onClick={(e) => e.stopPropagation()}
              >
                <TemplateEditor
                  key={editingTemplate.templateId}
                  template={editingTemplate}
                  onSave={handleSaveFromEditor}
                  onCancel={handleCancelEditor}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-2 rounded-md shadow-lg ${
            toastMessage.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toastMessage.message}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete AI Agent
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this AI Agent? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 pt-4">
            <Button 
              variant="destructive" 
              onClick={handleDeleteTemplate}
              disabled={deleteLoading}
              className="gap-2"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Yes, Delete
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingTemplateId(null);
              }}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}