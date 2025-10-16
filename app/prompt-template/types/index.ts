export interface ResumeAnalysis {
  candidateInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  careerLevel: 'junior' | 'mid' | 'senior' | 'lead';
  industryExperience: string[];
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  expected_duration: number;
}

export interface PromptTemplate {
  templateId: string;
  name: string;
  candidateName: string;
  description: string;
  assessment?: string;
  category: string;
  targetRole: string;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
  
  // Interview Agent Prompts
  prompt: {
    interviewer_instructions: string;
    greeting_message: string;
    duration?: number;
    default_questions: InterviewQuestion[];
    technical_questions: InterviewQuestion[];
    positive_feedback: string[];
    neutral_feedback: string[];
    encouragement: string[];
    closing_message: string;
    error_messages: {
      no_response: string;
      technical: string;
      timeout: string;
    };
  };
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  averageRating: number;
  isActive: boolean;
  tags: string[];
}

export type TemplateCategory = 
  | 'Technical Interview'
  | 'Behavioral Interview'
  | 'Executive Interview'
  | 'Sales Interview'
  | 'Customer Service'
  | 'Design Interview'
  | 'Product Management'
  | 'Data Science'
  | 'Custom Template';
