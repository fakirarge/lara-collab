// resources/js/types/index.ts

export interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  client_company_id: number;
  rate?: number;
  default_pricing_type: 'hourly' | 'fixed';
  created_at: string;
  updated_at: string;
  clientCompany?: ClientCompany;
  users?: User[];
  tasks?: Task[];
}

export interface Task {
  id: number;
  name: string;
  description?: string;
  project_id: number;
  group_id: number;
  assigned_to_user_id?: number | null;
  due_on?: string | null;
  estimation?: number | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  project?: Project;
  assignedToUser?: User;
  timeLogs?: TimeLog[];
  comments?: Comment[];
}

export interface TimeLog {
  id: number;
  task_id: number;
  user_id: number;
  minutes: number;
  timer_start?: number | null;
  timer_stop?: number | null;
  created_at: string;
  user?: User;
  task?: Task;
}

export interface ProjectNote {
  id: number;
  project_id: number;
  title: string;
  content: string;
  pinned: boolean;
  order: number;
  created_by: number;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
  creator?: User;
  updater?: User;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  task?: Task;
}

export interface ClientCompany {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions?: Permission[];
}

export interface UserPermissionOverride {
  id: number;
  user_id: number;
  permission_id: number;
  allowed: boolean;
  granted_by?: number | null;
  reason?: string | null;
  created_at: string;
  updated_at: string;
  permission?: Permission;
}

export interface UserRoleAssignment {
  id: number;
  user_id: number;
  role_id: number;
  project_id?: number | null;
  granted_by?: number | null;
  reason?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  role?: Role;
  project?: Project;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_time_logged: number;
  users_count: number;
  completion_percentage: number;
}

export interface TimeLogSummary {
  date: string;
  total_minutes: number;
}

