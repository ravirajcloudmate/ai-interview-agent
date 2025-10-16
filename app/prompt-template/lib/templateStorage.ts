// lib/templateStorage.ts
// Helper functions for template storage (works in real browser, not artifacts)

import { PromptTemplate } from '../types';

const STORAGE_KEY = 'jobly_ai_templates';

/**
 * Save templates to browser storage
 * This will persist across page refreshes
 */
export const saveTemplatesToStorage = (templates: PromptTemplate[]): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
      console.log('Templates saved to storage:', templates.length);
    }
  } catch (error) {
    console.error('Error saving templates to storage:', error);
  }
};

/**
 * Load templates from browser storage
 * Returns empty array if nothing found
 */
export const loadTemplatesFromStorage = (): PromptTemplate[] => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored);
        console.log('Templates loaded from storage:', templates.length);
        return templates;
      }
    }
  } catch (error) {
    console.error('Error loading templates from storage:', error);
  }
  return [];
};

/**
 * Clear all templates from storage
 */
export const clearTemplatesStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Templates storage cleared');
    }
  } catch (error) {
    console.error('Error clearing templates storage:', error);
  }
};

/**
 * Add or update a single template in storage
 */
export const saveTemplateToStorage = (template: PromptTemplate): void => {
  try {
    const templates = loadTemplatesFromStorage();
    const existingIndex = templates.findIndex(t => t.templateId === template.templateId);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.unshift(template);
    }
    
    saveTemplatesToStorage(templates);
  } catch (error) {
    console.error('Error saving template to storage:', error);
  }
};

/**
 * Delete a template from storage
 */
export const deleteTemplateFromStorage = (templateId: string): void => {
  try {
    const templates = loadTemplatesFromStorage();
    const filtered = templates.filter(t => t.templateId !== templateId);
    saveTemplatesToStorage(filtered);
  } catch (error) {
    console.error('Error deleting template from storage:', error);
  }
};