import { PromptTemplate, ResumeAnalysis, InterviewQuestion } from '../types';

export const mockResumeAnalysis: ResumeAnalysis = {
  candidateInfo: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1-234-567-8900',
    location: 'San Francisco, CA'
  },
  experience: [
    {
      company: 'Tech Corp',
      role: 'Frontend Developer',
      duration: '2021 - Present (3 years)',
      responsibilities: [
        'Led development of e-commerce platform using React',
        'Implemented state management with Redux',
        'Collaborated with backend team for API integration'
      ]
    },
    {
      company: 'Startup Inc',
      role: 'Junior Developer',
      duration: '2019 - 2021 (2 years)',
      responsibilities: [
        'Developed responsive web applications',
        'Maintained legacy jQuery codebase'
      ]
    }
  ],
  skills: {
    technical: ['React', 'TypeScript', 'Node.js', 'Python'],
    soft: ['Communication', 'Team Leadership', 'Problem Solving'],
    tools: ['Git', 'AWS', 'Docker', 'Figma']
  },
  education: [
    {
      degree: 'B.S. Computer Science',
      institution: 'State University',
      year: '2019'
    }
  ],
  certifications: ['AWS Certified Developer', 'React Professional'],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Full-stack shopping application with payment integration',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe']
    },
    {
      name: 'Dashboard System',
      description: 'Analytics dashboard for business metrics',
      technologies: ['React', 'D3.js', 'Express']
    }
  ],
  careerLevel: 'mid',
  industryExperience: ['E-commerce', 'SaaS', 'FinTech']
};

export const mockTemplates: PromptTemplate[] = [
  {
    templateId: '1',
    name: 'John Doe - Frontend Developer',
    candidateName: 'John Doe',
    description: 'AI-generated interview template for John Doe - Frontend Developer position',
    category: 'Technical Interview',
    targetRole: 'Frontend Developer',
    experienceLevel: 'mid',
    prompt: {
      interviewer_instructions: `You are a professional and friendly AI interviewer conducting a job interview for John Doe.

Your personality:
- Warm, professional, and encouraging
- Clear and articulate in speech
- Patient and attentive listener
- Supportive but objective

Your responsibilities:
1. Greet the candidate warmly and make them comfortable
2. Ask interview questions clearly and naturally
3. Listen carefully to their responses
4. Provide brief, encouraging feedback after each answer
5. Maintain a conversational yet professional tone
6. Guide the interview flow smoothly

Important guidelines:
- Speak naturally, like a real interviewer would
- Keep your questions and feedback concise and clear
- Be encouraging and positive
- Allow the candidate time to think and respond
- Don't interrupt or talk over the candidate
- Acknowledge their responses before moving to the next question

Remember: Your goal is to conduct a professional interview while making the candidate feel comfortable and valued.`,
      
      greeting_message: `Hello John! Welcome to your interview. I'm your AI interviewer today, and I'm excited to learn more about you and your experience as a Frontend Developer.

This will be a conversational interview where I'll ask you several questions about your background, technical skills, and goals. Please take your time with each answer, and feel free to elaborate on your responses.

Let's begin. Are you ready to start?`,
      
      default_questions: [
        {
          id: 1,
          question: "Tell me about yourself and your professional background as a Frontend Developer.",
          category: "introduction",
          expected_duration: 60
        },
        {
          id: 2,
          question: "I see you have experience with React and Node.js. What attracts you to this position?",
          category: "motivation",
          expected_duration: 45
        },
        {
          id: 3,
          question: "What are your greatest strengths in frontend development, and how would they benefit this role?",
          category: "skills",
          expected_duration: 45
        },
        {
          id: 4,
          question: "Can you describe your E-commerce Platform project and the most challenging technical problem you faced?",
          category: "experience",
          expected_duration: 60
        },
        {
          id: 5,
          question: "Where do you see yourself professionally in the next 3 to 5 years?",
          category: "goals",
          expected_duration: 45
        }
      ],
      
      technical_questions: [
        {
          id: 6,
          question: "Tell me about your experience with React Hooks and state management. How did you implement them in your projects?",
          category: "technical",
          expected_duration: 60
        },
        {
          id: 7,
          question: "I noticed you worked with AWS. Can you describe your experience deploying and managing applications on AWS?",
          category: "technical",
          expected_duration: 60
        },
        {
          id: 8,
          question: "How do you approach debugging complex issues in a React application?",
          category: "technical",
          expected_duration: 45
        },
        {
          id: 9,
          question: "How do you stay updated with the latest React and frontend technologies?",
          category: "technical",
          expected_duration: 45
        }
      ],
      
      positive_feedback: [
        "Thank you for that comprehensive answer. That's exactly the kind of insight we're looking for.",
        "Great response! I appreciate how you explained that clearly.",
        "Excellent! That demonstrates strong understanding of React and frontend development.",
        "Thank you. That's a very thoughtful answer.",
        "Good! I like how you approached that technical problem."
      ],
      
      neutral_feedback: [
        "Thank you for sharing that. Let's move on to the next question.",
        "I appreciate your honesty. Let's continue.",
        "Thank you. Let's explore another topic.",
        "Okay, I understand. Let's proceed."
      ],
      
      encouragement: [
        "Take your time, there's no rush.",
        "Feel free to elaborate on your React experience.",
        "That's interesting, can you tell me more about that project?",
        "Go on, I'm listening."
      ],
      
      closing_message: `Thank you so much for your time today, John. You've provided some great insights about your React and frontend development experience, and I really enjoyed our conversation.

Your responses have been recorded and will be reviewed by our hiring team. We'll be in touch soon with the next steps regarding the Frontend Developer position.

Is there anything you'd like to ask me before we conclude?`,
      
      error_messages: {
        no_response: "I didn't quite catch that. Could you please repeat your answer?",
        technical: "I'm experiencing a technical issue. Please give me a moment.",
        timeout: "I haven't heard from you in a while. Are you still there?"
      }
    },
    createdBy: 'AI Generator',
    createdAt: '2025-10-08T10:00:00Z',
    updatedAt: '2025-10-08T10:00:00Z',
    usageCount: 15,
    averageRating: 4.5,
    isActive: true,
    tags: ['frontend', 'react', 'javascript', 'mid-level']
  }
];

export function generatePromptFromResume(analysis: ResumeAnalysis): PromptTemplate {
  const firstName = analysis.candidateInfo?.name?.split(' ')[0] || 'Candidate';
  const primarySkill = analysis.skills?.technical?.[0] || 'Software Development';
  const experience = analysis.experience?.[0];
  const project = analysis.projects?.[0];
  
  // Generate default questions
  const defaultQuestions: InterviewQuestion[] = [
    {
      id: 1,
      question: `Tell me about yourself and your professional background as a ${experience?.role || 'developer'}.`,
      category: "introduction",
      expected_duration: 60
    },
    {
      id: 2,
      question: `I see you have experience with ${analysis.skills?.technical?.slice(0, 2).join(' and ') || 'various technologies'}. What attracts you to this position?`,
      category: "motivation",
      expected_duration: 45
    },
    {
      id: 3,
      question: `What are your greatest strengths in ${experience?.role || 'development'}, and how would they benefit this role?`,
      category: "skills",
      expected_duration: 45
    },
    {
      id: 4,
      question: project 
        ? `Can you describe your ${project.name} project and the most challenging technical problem you faced?`
        : `Can you describe a challenging project you worked on and how you handled it?`,
      category: "experience",
      expected_duration: 60
    },
    {
      id: 5,
      question: "Where do you see yourself professionally in the next 3 to 5 years?",
      category: "goals",
      expected_duration: 45
    }
  ];

  // Generate technical questions
  const technicalQuestions: InterviewQuestion[] = [
    {
      id: 6,
      question: `Tell me about your experience with ${primarySkill}. How did you implement it in your projects?`,
      category: "technical",
      expected_duration: 60
    },
    ...(analysis.skills?.tools?.length > 0 ? [{
      id: 7,
      question: `I noticed you worked with ${analysis.skills.tools[0]}. Can you describe your experience and how you used it?`,
      category: "technical",
      expected_duration: 60
    }] : []),
    {
      id: 8,
      question: `How do you approach debugging complex issues in your ${experience?.role || 'development'} work?`,
      category: "technical",
      expected_duration: 45
    },
    {
      id: 9,
      question: `How do you stay updated with the latest technologies in ${experience?.role || 'your field'}?`,
      category: "technical",
      expected_duration: 45
    }
  ];

  return {
    templateId: `template-${Date.now()}`,
    name: `${analysis.candidateInfo?.name || 'Unknown Candidate'} - ${experience?.role || 'Developer'}`,
    candidateName: analysis.candidateInfo?.name || 'Unknown Candidate',
    description: `AI-generated interview template for ${analysis.candidateInfo?.name || 'Unknown Candidate'} - ${experience?.role || 'Developer'} position`,
    category: 'Technical Interview',
    targetRole: experience?.role || 'Software Developer',
    experienceLevel: analysis.careerLevel || 'mid',
    prompt: {
      interviewer_instructions: `You are a professional and friendly AI interviewer conducting a job interview for ${analysis.candidateInfo?.name || 'the candidate'}.

Your personality:
- Warm, professional, and encouraging
- Clear and articulate in speech
- Patient and attentive listener
- Supportive but objective

Your responsibilities:
1. Greet the candidate warmly and make them comfortable
2. Ask interview questions clearly and naturally
3. Listen carefully to their responses
4. Provide brief, encouraging feedback after each answer
5. Maintain a conversational yet professional tone
6. Guide the interview flow smoothly

Important guidelines:
- Speak naturally, like a real interviewer would
- Keep your questions and feedback concise and clear
- Be encouraging and positive
- Allow the candidate time to think and respond
- Don't interrupt or talk over the candidate
- Acknowledge their responses before moving to the next question

Remember: Your goal is to conduct a professional interview while making the candidate feel comfortable and valued.`,

      greeting_message: `Hello ${firstName}! Welcome to your interview. I'm your AI interviewer today, and I'm excited to learn more about you and your experience as a ${experience?.role || 'developer'}.

This will be a conversational interview where I'll ask you several questions about your background, technical skills, and goals. Please take your time with each answer, and feel free to elaborate on your responses.

Let's begin. Are you ready to start?`,

      default_questions: defaultQuestions,
      technical_questions: technicalQuestions,

      positive_feedback: [
        "Thank you for that comprehensive answer. That's exactly the kind of insight we're looking for.",
        "Great response! I appreciate how you explained that clearly.",
        `Excellent! That demonstrates strong understanding of ${primarySkill}.`,
        "Thank you. That's a very thoughtful answer.",
        "Good! I like how you approached that technical problem."
      ],

      neutral_feedback: [
        "Thank you for sharing that. Let's move on to the next question.",
        "I appreciate your honesty. Let's continue.",
        "Thank you. Let's explore another topic.",
        "Okay, I understand. Let's proceed."
      ],

      encouragement: [
        "Take your time, there's no rush.",
        `Feel free to elaborate on your ${primarySkill} experience.`,
        "That's interesting, can you tell me more about that project?",
        "Go on, I'm listening."
      ],

      closing_message: `Thank you so much for your time today, ${firstName}. You've provided some great insights about your ${experience?.role || 'development'} experience, and I really enjoyed our conversation.

Your responses have been recorded and will be reviewed by our hiring team. We'll be in touch soon with the next steps regarding the ${experience?.role || 'position'}.

Is there anything you'd like to ask me before we conclude?`,

      error_messages: {
        no_response: "I didn't quite catch that. Could you please repeat your answer?",
        technical: "I'm experiencing a technical issue. Please give me a moment.",
        timeout: "I haven't heard from you in a while. Are you still there?"
      }
    },
    createdBy: 'AI Generator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    usageCount: 0,
    averageRating: 0,
    isActive: true,
    tags: [...(analysis.skills?.technical?.slice(0, 3) || ['development']), analysis.careerLevel || 'mid']
  };
}
