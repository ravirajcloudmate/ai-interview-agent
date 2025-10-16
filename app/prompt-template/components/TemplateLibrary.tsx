import { useState } from 'react';
import { Search, FileText, Eye, Edit, Copy, Trash2, Plus, BotMessageSquare, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptTemplate } from '../types';

interface TemplateLibraryProps {
  templates: PromptTemplate[];
  onView: (template: PromptTemplate) => void;
  onEdit: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
  onDelete: (templateId: string) => void;
  onCreateAgent: () => void;
}

export function TemplateLibrary({
  templates,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateAgent
}: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  console.log('TemplateLibrary received templates:', templates);
  console.log('Templates count:', templates.length);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || template.experienceLevel === levelFilter;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  console.log('Filtered templates:', filteredTemplates);
  console.log('Filtered count:', filteredTemplates.length);

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={onCreateAgent} className="bg-[#e30d0d] hover:bg-[#c00a0a] text-white">
          <BotMessageSquare className="w-4 h-4 mr-2" />
          Create New Agent
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="mb-2">No templates found</p>
                <p className="text-muted-foreground mb-4">
                  Upload a resume to automatically generate your first template
                </p>
                <Button onClick={onCreateAgent} className="bg-[#e30d0d] hover:bg-[#c00a0a] text-white">
                  <BotMessageSquare className="w-4 h-4 mr-2" />
                  Create New Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.templateId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Bot className="w-4 h-4 text-[#e30d0d] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm leading-tight break-words pr-2">
                        {template.targetRole || template.name || 'AI Agent'}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs px-1 py-0">{template.category}</Badge>
                        <Badge variant="outline" className="text-xs px-1 py-0 capitalize">
                          {template.experienceLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(template)}
                      className="text-[#e30d0d] hover:bg-[#e30d0d]/10 h-6 w-6 p-0"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(template)}
                      className="text-[#e30d0d] hover:bg-[#e30d0d]/10 h-6 w-6 p-0"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(template)}
                      className="text-[#e30d0d] hover:bg-[#e30d0d]/10 h-6 w-6 p-0"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(template.templateId)}
                      className="text-[#e30d0d] hover:bg-[#e30d0d]/10 h-6 w-6 p-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3">
                {template.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {template.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  {new Date(template.createdAt).toLocaleDateString()} • {template.usageCount}x • {template.averageRating > 0 ? `${template.averageRating}/5` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

