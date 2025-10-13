-- =====================================================
-- Dummy Meeting Data for Supabase
-- =====================================================
-- This script inserts 10 sample meetings
-- IMPORTANT: Replace 'e8403df0-339a-4879-95bb-169bca9564d8' with your actual user ID
-- 
-- To get your user ID:
-- 1. Sign up/Sign in to your app
-- 2. Run this query first: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- 3. Copy the UUID and replace it below
-- =====================================================

-- Insert 10 dummy meetings
-- Replace 'e8403df0-339a-4879-95bb-169bca9564d8' with your actual user UUID

INSERT INTO meetings (
  user_id,
  title,
  description,
  start_time,
  end_time,
  duration,
  type,
  platform,
  status,
  has_transcript,
  has_summary,
  has_video,
  ai_summary,
  key_points,
  action_items,
  participants,
  sentiment,
  topics,
  is_favorite,
  recording_url,
  transcript_url
) VALUES

-- Meeting 1: Weekly Project Sync
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Weekly Project Sync',
  'Regular team sync to discuss project progress and upcoming milestones',
  '2025-10-03 10:00:00+00',
  '2025-10-03 11:00:00+00',
  60,
  'VIDEO',
  'GOOGLE_MEET',
  'COMPLETED',
  true,
  true,
  true,
  'The team discussed the current sprint progress. All major features are on track for the Q4 release. Sarah presented the new UI designs which received positive feedback. Action items were assigned for the upcoming week.',
  ARRAY['Q4 release on track', 'New UI designs approved', 'Backend API completed', 'Testing phase starting next week'],
  ARRAY['Review Sarah''s UI designs by EOD', 'Complete API documentation', 'Schedule QA testing session'],
  ARRAY['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis'],
  'positive',
  ARRAY['Project Planning', 'UI Design', 'Backend Development'],
  true,
  'https://storage.example.com/recordings/meeting-001.mp4',
  'https://storage.example.com/transcripts/meeting-001.txt'
),

-- Meeting 2: Client Presentation
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Client Presentation - Phase 2 Demo',
  'Demonstrating Phase 2 deliverables to the client stakeholders',
  '2025-10-01 14:00:00+00',
  '2025-10-01 15:30:00+00',
  90,
  'VIDEO',
  'ZOOM',
  'COMPLETED',
  true,
  true,
  true,
  'Successful presentation of Phase 2 features. Client expressed satisfaction with the progress and approved moving forward with Phase 3. Discussion about timeline adjustments and additional requirements.',
  ARRAY['Phase 2 approved', 'Client satisfied with progress', 'Phase 3 greenlit', 'Timeline extended by 2 weeks'],
  ARRAY['Send Phase 3 proposal by Friday', 'Update project timeline', 'Schedule Phase 3 kickoff meeting'],
  ARRAY['David Williams', 'Lisa Anderson', 'Tom Brown', 'Jennifer Lee'],
  'positive',
  ARRAY['Client Relations', 'Product Demo', 'Project Planning'],
  true,
  'https://storage.example.com/recordings/meeting-002.mp4',
  'https://storage.example.com/transcripts/meeting-002.txt'
),

-- Meeting 3: Technical Architecture Review
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Technical Architecture Review',
  'Deep dive into system architecture and scalability planning',
  '2025-09-28 15:00:00+00',
  '2025-09-28 17:00:00+00',
  120,
  'VIDEO',
  'GOOGLE_MEET',
  'COMPLETED',
  true,
  true,
  true,
  'Comprehensive review of the current system architecture. Identified potential bottlenecks and discussed migration to microservices. Team agreed on implementing caching layer and database optimization strategies.',
  ARRAY['Microservices migration planned', 'Caching layer needed', 'Database optimization priority', 'Load testing scheduled'],
  ARRAY['Create microservices migration plan', 'Research caching solutions (Redis vs Memcached)', 'Set up load testing environment'],
  ARRAY['Alex Kumar', 'Chris Taylor', 'Maria Garcia', 'Ryan Murphy'],
  'neutral',
  ARRAY['System Architecture', 'Scalability', 'Performance Optimization'],
  false,
  'https://storage.example.com/recordings/meeting-003.mp4',
  'https://storage.example.com/transcripts/meeting-003.txt'
),

-- Meeting 4: Sprint Planning
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Sprint 12 Planning Session',
  'Planning and estimation for the upcoming 2-week sprint',
  '2025-09-29 09:00:00+00',
  '2025-09-29 11:00:00+00',
  120,
  'VIDEO',
  'MICROSOFT_TEAMS',
  'COMPLETED',
  true,
  false,
  true,
  'Team estimated 45 story points for Sprint 12. Prioritized user authentication refactor and payment integration. Discussed potential blockers and dependencies.',
  ARRAY['45 story points committed', 'Authentication refactor priority', 'Payment integration in scope'],
  ARRAY['Break down authentication tasks', 'Research payment gateway options', 'Set up daily standups at 9:30 AM'],
  ARRAY['Sam Wilson', 'Kate Martinez', 'Daniel Park', 'Olivia Thompson'],
  'positive',
  ARRAY['Sprint Planning', 'Agile', 'Task Estimation'],
  true,
  'https://storage.example.com/recordings/meeting-004.mp4',
  'https://storage.example.com/transcripts/meeting-004.txt'
),

-- Meeting 5: Quick Standup
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Daily Standup',
  'Quick daily sync on progress and blockers',
  '2025-10-04 09:30:00+00',
  '2025-10-04 09:45:00+00',
  15,
  'AUDIO',
  'SLACK',
  'COMPLETED',
  true,
  false,
  false,
  'Quick updates from team members. No major blockers reported. Frontend team needs API documentation.',
  ARRAY['All tasks progressing well', 'API docs needed for frontend'],
  ARRAY['Share API documentation link', 'Schedule code review for PR #234'],
  ARRAY['John Smith', 'Sarah Johnson', 'Mike Chen'],
  'neutral',
  ARRAY['Daily Standup', 'Team Sync'],
  false,
  null,
  'https://storage.example.com/transcripts/meeting-005.txt'
),

-- Meeting 6: Design Review
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'UI/UX Design Review - Dashboard Redesign',
  'Review new dashboard mockups and user flow',
  '2025-10-02 13:00:00+00',
  '2025-10-02 14:30:00+00',
  90,
  'VIDEO',
  'ZOOM',
  'COMPLETED',
  true,
  true,
  true,
  'Design team presented three dashboard layout options. Team selected Option B with minor modifications. Discussed color scheme and accessibility improvements.',
  ARRAY['Option B selected for dashboard', 'Accessibility improvements needed', 'Mobile responsive design confirmed'],
  ARRAY['Update mockups based on feedback', 'Create design system documentation', 'Schedule user testing session'],
  ARRAY['Emma Wilson', 'Lucas Brown', 'Sophia Davis', 'James Miller'],
  'positive',
  ARRAY['UI Design', 'UX Research', 'Accessibility'],
  true,
  'https://storage.example.com/recordings/meeting-006.mp4',
  'https://storage.example.com/transcripts/meeting-006.txt'
),

-- Meeting 7: Security Audit Discussion
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Q3 Security Audit Findings',
  'Review security audit results and remediation plan',
  '2025-09-27 10:00:00+00',
  '2025-09-27 11:30:00+00',
  90,
  'VIDEO',
  'MICROSOFT_TEAMS',
  'COMPLETED',
  false,
  true,
  false,
  'Security audit revealed 3 medium-priority vulnerabilities. Team reviewed each finding and created remediation timeline. All issues to be resolved within 2 weeks.',
  ARRAY['3 medium vulnerabilities found', 'No critical issues', '2-week remediation timeline', 'Penetration testing scheduled'],
  ARRAY['Fix SQL injection vulnerability in search', 'Update authentication tokens', 'Implement rate limiting', 'Schedule penetration test'],
  ARRAY['Kevin Anderson', 'Rachel Green', 'Michael Scott'],
  'neutral',
  ARRAY['Security', 'Compliance', 'Risk Management'],
  false,
  null,
  null
),

-- Meeting 8: Onboarding Session
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'New Team Member Onboarding',
  'Welcome and orientation for new developer joining the team',
  '2025-10-01 10:00:00+00',
  '2025-10-01 12:00:00+00',
  120,
  'VIDEO',
  'GOOGLE_MEET',
  'COMPLETED',
  true,
  false,
  true,
  'Comprehensive onboarding session covering company culture, tech stack, development workflow, and team structure. New member received access to all necessary tools and repositories.',
  ARRAY['Access credentials provided', 'Development environment setup', 'First task assigned', 'Mentor assigned'],
  ARRAY['Complete dev environment setup', 'Review codebase documentation', 'Schedule 1:1 with mentor', 'Join team Slack channels'],
  ARRAY['Amanda Foster', 'Brian Cooper', 'New Developer'],
  'positive',
  ARRAY['Onboarding', 'Team Building', 'Training'],
  false,
  'https://storage.example.com/recordings/meeting-008.mp4',
  'https://storage.example.com/transcripts/meeting-008.txt'
),

-- Meeting 9: Budget Review
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Q4 Budget Planning Meeting',
  'Review current spend and plan Q4 budget allocation',
  '2025-09-30 14:00:00+00',
  '2025-09-30 15:00:00+00',
  60,
  'AUDIO',
  'SLACK',
  'COMPLETED',
  true,
  true,
  false,
  'Reviewed Q3 expenses and discussed Q4 budget allocation. Infrastructure costs increasing due to user growth. Approved additional budget for cloud services and new tools.',
  ARRAY['Q3 under budget by 5%', 'Cloud costs increasing 15%', 'New tools approved', '$50K additional budget for Q4'],
  ARRAY['Submit revised Q4 budget proposal', 'Research cost optimization strategies', 'Negotiate AWS reserved instances'],
  ARRAY['Patricia Hayes', 'George Martin', 'Nancy White'],
  'neutral',
  ARRAY['Budget Planning', 'Finance', 'Resource Management'],
  false,
  null,
  'https://storage.example.com/transcripts/meeting-009.txt'
),

-- Meeting 10: Retrospective
(
  'e8403df0-339a-4879-95bb-169bca9564d8',
  'Sprint 11 Retrospective',
  'Team retrospective to discuss what went well and areas for improvement',
  '2025-09-26 16:00:00+00',
  '2025-09-26 17:00:00+00',
  60,
  'VIDEO',
  'ZOOM',
  'COMPLETED',
  true,
  true,
  true,
  'Productive retrospective session. Team highlighted improved communication and faster PR reviews. Identified need for better documentation and more pair programming sessions.',
  ARRAY['Communication improved significantly', 'PR review time reduced by 40%', 'Documentation needs improvement', 'More pair programming requested'],
  ARRAY['Create documentation template', 'Schedule weekly pair programming sessions', 'Update PR review guidelines'],
  ARRAY['All Team Members'],
  'positive',
  ARRAY['Retrospective', 'Team Improvement', 'Agile'],
  true,
  'https://storage.example.com/recordings/meeting-010.mp4',
  'https://storage.example.com/transcripts/meeting-010.txt'
);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ 10 dummy meetings inserted successfully!';
  RAISE NOTICE '⚠️  Remember to replace e8403df0-339a-4879-95bb-169bca9564d8 with your actual user ID!';
  RAISE NOTICE '💡 Query to get your user ID: SELECT id FROM auth.users WHERE email = ''your-email@example.com'';';
END $$;

