# Prompt Template Module

## Overview
The Prompt Template module allows users to create, manage, and organize interview prompt templates for AI-powered interviews.

## Features
- **Create Templates**: Add new prompt templates with name, description, and content
- **Edit Templates**: Modify existing templates as needed
- **Delete Templates**: Remove templates that are no longer needed
- **Categorize**: Organize templates by category (Technical, Behavioral, HR, Custom)
- **Company-Specific**: Each company can only see and manage their own templates

## File Structure
```
intrview-frontend/
├── app/
│   ├── components/
│   │   └── Sidebar.tsx                        # Updated with new menu item
│   └── prompt-template/
│       └── page.tsx                            # Main prompt template page
└── supabase/
    └── schema/
        ├── 30_prompt_templates.sql             # Database table schema
        └── 31_prompt_templates_policies.sql    # RLS policies
```

## Database Schema

### Table: prompt_templates
- `id` (UUID): Primary key
- `company_id` (UUID): Foreign key to companies table
- `name` (TEXT): Template name
- `description` (TEXT): Brief description
- `prompt_text` (TEXT): The actual prompt content
- `category` (TEXT): Category (technical, behavioral, hr, custom)
- `is_active` (BOOLEAN): Whether the template is active
- `created_at` (TIMESTAMP): Creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp
- `created_by` (UUID): User who created the template

## Row Level Security (RLS)
The prompt_templates table has RLS policies that ensure:
- Users can only view templates from their own company
- Users can only create templates for their own company
- Users can only update/delete their company's templates

## Usage

### Access the Module
1. Navigate to the dashboard
2. Click on "Prompt Template" in the Hiring section of the sidebar

### Create a Template
1. Click the "Create Template" button
2. Fill in the form:
   - Template Name: A descriptive name
   - Description: Brief explanation of the template's purpose
   - Category: Select the appropriate category
   - Prompt Text: Enter the prompt content
3. Click "Create" to save

### Edit a Template
1. Find the template in the list
2. Click the "Edit" button
3. Modify the fields as needed
4. Click "Update" to save changes

### Delete a Template
1. Find the template in the list
2. Click the "Delete" button
3. Confirm the deletion

## Database Migration
To apply the database schema, run the following SQL files in your Supabase dashboard:
1. `supabase/schema/30_prompt_templates.sql` - Creates the table and indexes
2. `supabase/schema/31_prompt_templates_policies.sql` - Sets up RLS policies

## Technical Details

### Technologies Used
- Next.js 14 (App Router)
- React 18
- TypeScript
- Supabase (Database & Auth)
- Tailwind CSS
- shadcn/ui components
- Lucide React (Icons)

### Key Components
- **Sidebar**: Updated to include the new "Prompt Template" menu item
- **PromptTemplatePage**: Main page component with CRUD functionality
- **Supabase Client**: For database operations with RLS

### Authentication
The module uses the `useAuth` hook from the AuthContext to:
- Get the current user's information
- Fetch the user's company_id for RLS
- Display user details in the sidebar

## Future Enhancements
- Template versioning
- Template sharing between companies
- Template preview with sample data
- Export/import templates
- Template usage analytics
- AI-powered template suggestions

