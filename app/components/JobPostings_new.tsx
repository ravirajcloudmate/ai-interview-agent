import { useState } from 'react';
import { X, Plus, CheckCircle, Clock } from 'lucide-react';

const templates = [
  { id: 'developer', name: 'Software Developer', desc: 'Technical skills, problem-solving, coding practices' },
  { id: 'sales', name: 'Sales Representative', desc: 'Communication, persuasion, CRM, objection handling' },
  { id: 'support', name: 'Customer Support', desc: 'Empathy, problem resolution, patience, troubleshooting' },
  { id: 'marketing', name: 'Marketing Manager', desc: 'Strategic thinking, creativity, analytics, campaigns' },
  { id: 'hr', name: 'HR Professional', desc: 'Recruitment, employee relations, compliance, conflict resolution' },
  { id: 'finance', name: 'Finance Analyst', desc: 'Financial analysis, budgeting, forecasting, risk assessment' }
];

export default function JobPostingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    job_title: '',
    department: '',
    job_description: '',
    employment_type: 'full-time',
    experience_level: 'mid-level',
    location: '',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    is_remote: false,
    interview_mode: 'video',
    interview_language: 'en',
    difficulty_level: 'medium',
    ai_interview_template: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: string) => {
    setFormData(prev => ({ ...prev, ai_interview_template: template }));
  };

  const isStep1Valid = formData.job_title.trim() && formData.department && formData.job_description.trim();
  const isStep2Valid = formData.ai_interview_template && formData.interview_mode;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Job Posting</h1>
          <p className="text-slate-600">Setup a new position with AI interview configuration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          <div className={`flex-1 rounded-lg p-4 transition-all ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            <div className="font-semibold text-sm">Step 1</div>
            <div className="text-xs opacity-90">Job Details</div>
          </div>
          <div className={`flex-1 rounded-lg p-4 transition-all ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            <div className="font-semibold text-sm">Step 2</div>
            <div className="text-xs opacity-90">Interview Setup</div>
          </div>
          <div className={`flex-1 rounded-lg p-4 transition-all ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
            <div className="font-semibold text-sm">Step 3</div>
            <div className="text-xs opacity-90">Review</div>
          </div>
        </div>

        {/* Form Container with Custom Scrollbar */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-slate-100 p-8">
            
            {/* Step 1: Job Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Job Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Department *</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    >
                      <option value="">Select department</option>
                      <option value="engineering">Engineering</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="support">Support</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Employment Type</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.employment_type}
                      onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Job Description *</label>
                  <textarea
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition resize-none"
                    value={formData.job_description}
                    onChange={(e) => handleInputChange('job_description', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Experience Level</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.experience_level}
                      onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    >
                      <option value="entry-level">Entry Level</option>
                      <option value="mid-level">Mid Level</option>
                      <option value="senior-level">Senior Level</option>
                      <option value="executive">Executive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Difficulty Level</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.difficulty_level}
                      onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Interview Setup & Salary */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">AI Interview Template *</label>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.name)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          formData.ai_interview_template === template.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{template.name}</div>
                        <div className="text-sm text-slate-600">{template.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Interview Mode *</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.interview_mode}
                      onChange={(e) => handleInputChange('interview_mode', e.target.value)}
                    >
                      <option value="video">Video Interview</option>
                      <option value="audio">Audio Only</option>
                      <option value="text">Text Based</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Language</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.interview_language}
                      onChange={(e) => handleInputChange('interview_language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <input
                    type="checkbox"
                    id="remote"
                    className="w-5 h-5 rounded cursor-pointer"
                    checked={formData.is_remote}
                    onChange={(e) => handleInputChange('is_remote', e.target.checked)}
                  />
                  <label htmlFor="remote" className="text-sm font-semibold text-slate-900 cursor-pointer">
                    This is a remote position
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Salary Range</label>
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.salary_min}
                      onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.salary_max}
                      onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    />
                    <select
                      className="px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-slate-900 mb-4">Review Your Job Posting</h3>
                  <div className="space-y-3 text-sm">
                    <div><span className="font-semibold text-slate-900">Title:</span> <span className="text-slate-600">{formData.job_title}</span></div>
                    <div><span className="font-semibold text-slate-900">Department:</span> <span className="text-slate-600">{formData.department}</span></div>
                    <div><span className="font-semibold text-slate-900">Type:</span> <span className="text-slate-600">{formData.employment_type}</span></div>
                    <div><span className="font-semibold text-slate-900">Experience:</span> <span className="text-slate-600">{formData.experience_level}</span></div>
                    <div><span className="font-semibold text-slate-900">Interview Mode:</span> <span className="text-slate-600">{formData.interview_mode}</span></div>
                    <div><span className="font-semibold text-slate-900">Difficulty:</span> <span className="text-slate-600">{formData.difficulty_level}</span></div>
                    {formData.is_remote && <div className="text-blue-700 font-semibold">✓ Remote Position</div>}
                  </div>
                </div>
                <p className="text-slate-600 text-sm">Everything looks good? Click publish to make this job posting live.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t-2 border-slate-200 px-8 py-4 flex justify-between gap-4">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              className="px-6 py-2 text-slate-700 font-semibold rounded-lg border-2 border-slate-300 hover:bg-slate-100 transition disabled:opacity-50"
              disabled={step === 1}
            >
              Back
            </button>
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span>Next</span>
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Save Draft
                </button>
                <button className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Publish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-blue-400::-webkit-scrollbar-thumb {
          background-color: #60a5fa;
          border-radius: 3px;
        }
        .scrollbar-track-slate-100::-webkit-scrollbar-track {
          background-color: #f1f5f9;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}