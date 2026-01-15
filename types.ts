
export type UserRole = 'ADMIN' | 'MEMBER';

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}

export interface Task {
  task: string;
  assignee: string;
}

export interface MeetingAnalysis {
  summary: string;
  keyPoints: string[];
  tasks: Task[];
  problemSolvingSuggestions: string[];
}

export interface UserSession {
  role: UserRole;
  userName: string;
}

export interface BroadcastEvent {
  type: 'MESSAGE_SENT' | 'ANALYSIS_UPDATED' | 'TASK_TOGGLE' | 'TYPING_STATUS' | 'SESSION_CLOSED' | 'USER_ACTIVITY';
  payload: any;
}
