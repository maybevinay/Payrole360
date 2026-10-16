import axios, { AxiosError } from 'axios';
import {
  User,
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  PayRun,
  Payslip,
  NotificationItem,
  AuditLogItem,
  DepartmentItem,
} from '../types';

const BASE_URL = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('payroll360_token') || localStorage.getItem('peoplepay360_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('payroll360_token', token);
  localStorage.setItem('peoplepay360_token', token); // compatibility
}

export function clearAuthToken() {
  localStorage.removeItem('payroll360_token');
  localStorage.removeItem('peoplepay360_token');
}

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; error?: { message?: string; code?: string } }>) => {
    const errorMsg =
      error.response?.data?.error?.message ||
      (error.response?.data as any)?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // Authentication
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await axiosInstance.post<{ token: string; user: User; success?: boolean }>('/auth/login', credentials);
      return res.data;
    },
    register: async (userData: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      department?: string;
      jobTitle?: string;
      dateOfBirth?: string;
      address?: string;
    }) => {
      const res = await axiosInstance.post<{ success: boolean; message: string; data: any }>('/auth/register', userData);
      return res.data;
    },
    me: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: User } | User>('/auth/me');
      return (res.data as any).data || res.data;
    },
  },

  // Admin APIs
  admin: {
    getUsers: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: User[] }>('/admin/users');
      return res.data.data;
    },
    updateUserStatus: async (id: string, status: string, reason?: string) => {
      const res = await axiosInstance.patch<{ success: boolean; message: string; data: any }>(`/admin/users/${id}/status`, { status, reason });
      return res.data;
    },
    createHrUser: async (data: { name: string; email: string; password: string; department?: string; jobTitle?: string; phone?: string }) => {
      const res = await axiosInstance.post<{ success: boolean; message: string; data: User }>('/admin/hr-users', data);
      return res.data;
    },
    getAnalytics: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: any }>('/admin/analytics');
      return res.data.data;
    },
    getLogs: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: AuditLogItem[] }>('/admin/logs');
      return res.data.data;
    },
  },

  // HR APIs
  hr: {
    getDashboard: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: any }>('/hr/dashboard');
      return res.data.data;
    },
    getPendingApprovals: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: User[] }>('/hr/pending-approvals');
      return res.data.data;
    },
    approveRegistration: async (id: string, data: { monthlySalary?: number; department?: string; jobTitle?: string; employmentType?: string }) => {
      const res = await axiosInstance.patch<{ success: boolean; message: string; data: any }>(`/hr/registrations/${id}/approve`, data);
      return res.data;
    },
    rejectRegistration: async (id: string, reason: string) => {
      const res = await axiosInstance.patch<{ success: boolean; message: string; data: any }>(`/hr/registrations/${id}/reject`, { reason });
      return res.data;
    },
    getDepartments: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: DepartmentItem[] }>('/hr/departments');
      return res.data.data;
    },
  },

  // Employees
  employees: {
    getAll: async () => {
      const res = await axiosInstance.get<Employee[]>('/employees');
      return res.data;
    },
    getById: async (id: string) => {
      const res = await axiosInstance.get<Employee>(`/employees/${id}`);
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post<Employee>('/employees', data);
      return res.data;
    },
    updateBank: async (id: string, bankDetails: any) => {
      const res = await axiosInstance.patch(`/employees/${id}/bank`, bankDetails);
      return res.data;
    },
  },

  // Contracts
  contracts: {
    getAll: async () => {
      const res = await axiosInstance.get<any[]>('/contracts');
      return res.data;
    },
    renew: async (data: { employeeId: string; monthlySalary: number; startDate: string; endDate: string }) => {
      const res = await axiosInstance.post('/contracts/renew', data);
      return res.data;
    },
  },

  // Attendance
  attendance: {
    getAll: async () => {
      const res = await axiosInstance.get<AttendanceRecord[]>('/attendance');
      return res.data;
    },
    getMe: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: AttendanceRecord[] }>('/attendance/me');
      return res.data.data;
    },
    checkIn: async (employeeId?: string, status = 'Present') => {
      const res = await axiosInstance.post<{ success: boolean; message: string; data: any }>('/attendance/check-in', { employeeId, status });
      return res.data;
    },
    checkOut: async (employeeId?: string) => {
      const res = await axiosInstance.post<{ success: boolean; message: string; data: any }>('/attendance/check-out', { employeeId });
      return res.data;
    },
    reconcile: async (id: string, data: { status: string; checkIn: string; checkOut: string }) => {
      const res = await axiosInstance.patch(`/attendance/${id}/reconcile`, data);
      return res.data;
    },
  },

  // Time Off / Leaves
  timeOff: {
    getAll: async () => {
      const res = await axiosInstance.get<{ requests: TimeOffRequest[]; balances: Record<string, any> }>('/timeoff');
      return res.data;
    },
    getBalances: async (employeeId?: string) => {
      const res = await axiosInstance.get<{ success: boolean; data: any }>(`/timeoff/balances${employeeId ? `?employeeId=${employeeId}` : ''}`);
      return res.data.data;
    },
    request: async (data: any) => {
      const res = await axiosInstance.post('/timeoff', data);
      return res.data;
    },
    approve: async (id: string) => {
      const res = await axiosInstance.patch(`/timeoff/${id}/approve`);
      return res.data;
    },
    reject: async (id: string, reason?: string) => {
      const res = await axiosInstance.patch(`/timeoff/${id}/reject`, { reason });
      return res.data;
    },
    updateStatus: async (id: string, status: 'Approved' | 'Refused') => {
      const res = await axiosInstance.patch(`/timeoff/${id}/status`, { status });
      return res.data;
    },
  },

  // Salary Rules
  salaryRules: {
    getAll: async () => {
      const res = await axiosInstance.get<any[]>('/salary-rules');
      return res.data;
    },
    updateRule: async (ruleId: string, expression: string) => {
      const res = await axiosInstance.patch(`/salary-rules/rule/${ruleId}`, { expression });
      return res.data;
    },
  },

  // Pay Runs
  payruns: {
    getAll: async () => {
      const res = await axiosInstance.get<PayRun[]>('/payruns');
      return res.data;
    },
    create: async (data: any) => {
      const res = await axiosInstance.post<{ id: string }>('/payruns', data);
      return res.data;
    },
    compute: async (id: string) => {
      const res = await axiosInstance.post(`/payruns/${id}/compute`);
      return res.data;
    },
    validate: async (id: string) => {
      const res = await axiosInstance.post(`/payruns/${id}/validate`);
      return res.data;
    },
    pay: async (id: string) => {
      const res = await axiosInstance.post(`/payruns/${id}/pay`);
      return res.data;
    },
  },

  // Payslips
  payslips: {
    getAll: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: Payslip[] }>('/payslips');
      return res.data.data;
    },
    getById: async (id: string) => {
      const res = await axiosInstance.get<{ success: boolean; data: Payslip }>(`/payslips/${id}`);
      return res.data.data;
    },
  },

  // Notifications
  notifications: {
    getAll: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: NotificationItem[] }>('/notifications');
      return res.data.data;
    },
    markRead: async (id: string) => {
      const res = await axiosInstance.patch(`/notifications/${id}/read`);
      return res.data;
    },
    markAllRead: async () => {
      const res = await axiosInstance.post('/notifications/mark-all-read');
      return res.data;
    },
  },
};
