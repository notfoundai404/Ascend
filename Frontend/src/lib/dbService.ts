// ============================================================
// LIVE API SERVICE — ASCEND CRICKET ACADEMY
// Client-side fetch wrapper for all ERP API calls.
// Auth is handled via Supabase (@supabase/supabase-js).
// ============================================================

import { createClient } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  role: 'student' | 'admin' | 'coach';
  fullName: string;
  avatarUrl?: string;
}

export interface StudentDetails {
  id: string;
  studentId: string; // ASC-001
  fullName: string;
  phone: string;
  email: string;
  dob?: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  fatherEmail?: string;
  motherEmail?: string;
  emergencyPhone?: string;
  address?: string;
  bloodGroup?: string;
  cricketRole?: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
  batch?: string;
  joiningDate?: string;
  primaryCoachId?: string;
  uniformSize?: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  totalFees: number;
  uniformFees: number;
  installmentsLimit: number;
  amountPaidTillDate: number;
  coach?: {
    id: string;
    name: string;
    specialty?: string;
  };
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName?: string;
  amount: number;
  type: 'academy_fees' | 'uniform_fees';
  mode: 'UPI' | 'Cash' | 'Bank_Transfer';
  utrNumber?: string;
  proofUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionDatetime: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  installmentNumber: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'general' | 'event';
  visibility: 'ALL' | 'SELECTED_STUDENTS' | 'SELECTED_COACHES';
  createdBy: string;
  createdAt: string;
  noticeStudents?: Array<{ studentId: string; student: { fullName: string } }>;
  noticeCoaches?: Array<{ coachId: string; coach: { name: string } }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  category: 'match' | 'practice' | 'holiday' | 'fee_deadline';
  eventDate: string;
  createdAt: string;
}

export interface Coach {
  id: string;
  name: string;
  phone?: string;
  email: string;
  specialty?: string;
  experience?: string;
  rating: number;
  avatarUrl?: string;
  _count?: { students: number };
}

export interface StudentReview {
  id: string;
  studentId: string;
  coachName: string;
  battingRating: number;
  bowlingRating: number;
  fitnessRating: number;
  reviewText?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  studentName: string;
  coachName?: string;
  rating: number;
  comments: string;
  isTestimonial: boolean;
  createdAt: string;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date?: string;
  isFeatured: boolean;
  createdAt: string;
}

const API_BASE_URL = '/api';

// No-op for compatibility
export const initDB = () => {};

// ── Token helpers ─────────────────────────────────────────────
/** Get the current Supabase access token from the active session. */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('erp_role');
    localStorage.removeItem('erp_username');
    localStorage.removeItem('erp_user_id');
  }
};

// ── Fetch wrapper ─────────────────────────────────────────────
/**
 * Fetch wrapper that attaches the Supabase Bearer token.
 * Token refresh is handled automatically by the @supabase/ssr middleware.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

// ── Auth ──────────────────────────────────────────────────────
export const dbService = {
  async login(email: string, password: string): Promise<any> {
    const supabase = createClient();

    // 1. Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid email or password');
    }

    // 2. Fetch the Prisma profile using the Supabase access token
    const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    if (!profileRes.ok) {
      const body = await profileRes.json().catch(() => ({}));
      throw new Error(body.message || 'Failed to load user profile');
    }
    const { data: profile } = await profileRes.json();

    // 3. Store role/name in localStorage for UI use
    localStorage.setItem('erp_role', profile.role.toLowerCase());
    localStorage.setItem('erp_username', profile.fullName);
    localStorage.setItem('erp_user_id', profile.id);

    return profile;
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearTokens();
  },

  // Student Details / Profile API
  async getStudentDetails(studentId: string): Promise<StudentDetails> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchWithAuth(`/admin/students/${studentId}`);
      return res.data;
    } else {
      const res = await fetchWithAuth('/students/me');
      return res.data;
    }
  },

  async updateStudentDetails(details: Partial<StudentDetails>): Promise<StudentDetails> {
    const res = await fetchWithAuth('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(details),
    });
    return res.data;
  },

  // Transactions / Payments API
  async getTransactions(): Promise<Transaction[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchWithAuth('/payments');
      return res.data.transactions.map((tx: any) => ({
        ...tx,
        studentName: tx.student?.fullName,
      }));
    } else {
      const res = await fetchWithAuth('/students/me/transactions');
      return res.data.transactions;
    }
  },

  async addTransaction(tx: FormData | Omit<Transaction, 'id' | 'createdAt' | 'status'>): Promise<Transaction> {
    if (tx instanceof FormData) {
      const res = await fetchWithAuth('/payments', { method: 'POST', body: tx });
      return res.data;
    }
    const formData = new FormData();
    formData.append('amount', String(tx.amount));
    formData.append('type', tx.type);
    formData.append('mode', tx.mode);
    if (tx.utrNumber) formData.append('utrNumber', tx.utrNumber);
    if (tx.transactionDatetime) formData.append('transactionDatetime', tx.transactionDatetime);
    if (tx.installmentNumber) formData.append('installmentNumber', String(tx.installmentNumber));
    const res = await fetchWithAuth('/payments', { method: 'POST', body: formData });
    return res.data;
  },

  async updateTransactionStatus(txId: string, status: 'Approved' | 'Rejected', adminId: string): Promise<Transaction> {
    const res = await fetchWithAuth(`/payments/${txId}/${status.toLowerCase()}`, { method: 'PATCH' });
    return res.data;
  },

  // Notices API
  async getNotices(): Promise<Notice[]> {
    const res = await fetchWithAuth('/notices');
    return res.data.notices ?? res.data;
  },

  async addNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'createdBy' | 'noticeStudents' | 'noticeCoaches'>): Promise<Notice> {
    const res = await fetchWithAuth('/notices', { method: 'POST', body: JSON.stringify(notice) });
    return res.data;
  },

  // Calendar Events API
  async getEvents(): Promise<CalendarEvent[]> {
    const res = await fetchWithAuth('/calendar');
    return res.data;
  },

  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const res = await fetchWithAuth('/calendar', { method: 'POST', body: JSON.stringify(event) });
    return res.data;
  },

  // Coaches API
  async getCoaches(): Promise<Coach[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchWithAuth('/admin/coaches');
      return res.data.coaches ?? res.data;
    } else {
      const res = await fetchWithAuth('/coaches');
      return res.data;
    }
  },

  // Reviews API
  async getReviews(studentId: string): Promise<StudentReview[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchWithAuth(`/admin/students/${studentId}`);
      return res.data.reviews || [];
    } else {
      const res = await fetchWithAuth('/students/me/reviews');
      return res.data;
    }
  },

  async addReview(review: Omit<StudentReview, 'id' | 'createdAt'>): Promise<StudentReview> {
    const res = await fetchWithAuth('/students/me/reviews', { method: 'POST', body: JSON.stringify(review) });
    return res.data;
  },

  // Feedback API
  async getFeedback(): Promise<Feedback[]> {
    const res = await fetchWithAuth('/students/me/feedbacks');
    return res.data;
  },

  async addFeedback(fb: Omit<Feedback, 'id' | 'createdAt' | 'studentName' | 'isTestimonial' | 'studentId'>): Promise<Feedback> {
    const res = await fetchWithAuth('/students/me/feedbacks', { method: 'POST', body: JSON.stringify(fb) });
    return res.data;
  },

  // Achievements API
  async getAchievements(): Promise<Achievement[]> {
    const res = await fetchWithAuth('/students/me/achievements');
    return res.data;
  },

  async addAchievement(formData: FormData): Promise<Achievement> {
    const res = await fetchWithAuth('/students/me/achievements', { method: 'POST', body: formData });
    return res.data;
  },

  async deleteAchievement(id: string): Promise<void> {
    await fetchWithAuth(`/students/me/achievements/${id}`, { method: 'DELETE' });
  },

  // Admin creations
  async adminCreateStudent(data: any): Promise<any> {
    const res = await fetchWithAuth('/admin/students', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },

  async adminListStudents(): Promise<any[]> {
    const res = await fetchWithAuth('/admin/students');
    return res.data.students ?? res.data ?? [];
  },

  async adminListFeedbacks(): Promise<Feedback[]> {
    const res = await fetchWithAuth('/admin/feedbacks');
    return res.data ?? [];
  },

  async adminCreateCoach(data: any): Promise<any> {
    const res = await fetchWithAuth('/admin/coaches', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },

  async adminAssignCoach(studentId: string, coachId: string): Promise<any> {
    const res = await fetchWithAuth(`/admin/students/${studentId}/coach`, {
      method: 'PATCH',
      body: JSON.stringify({ coachId }),
    });
    return res.data;
  },

  async adminToggleTestimonial(feedbackId: string, isTestimonial: boolean): Promise<any> {
    const res = await fetchWithAuth(`/admin/feedback/${feedbackId}/testimonial`, {
      method: 'PATCH',
      body: JSON.stringify({ isTestimonial }),
    });
    return res.data;
  },

  async adminToggleFeaturedAchievement(achievementId: string, isFeatured: boolean): Promise<any> {
    const res = await fetchWithAuth(`/admin/achievements/${achievementId}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    });
    return res.data;
  },

  // Attendance API
  async getTodayAttendance(): Promise<any> {
    const res = await fetchWithAuth('/attendance/today');
    return res.data;
  },

  async getMyAttendance(): Promise<{ stats: any; records: any[] }> {
    const res = await fetchWithAuth('/students/me/attendance');
    return res.data;
  },

  async getCoachProfile(): Promise<Coach> {
    const res = await fetchWithAuth('/coaches/me');
    return res.data;
  },

  async markStudentAttendance(date: string, records: Array<{ studentId: string; isPresent: boolean; notes?: string }>): Promise<any> {
    const res = await fetchWithAuth('/attendance/students', {
      method: 'POST',
      body: JSON.stringify({ date, records }),
    });
    return res.data;
  },

  async markCoachAttendance(date: string, coachId: string, isPresent: boolean, notes?: string): Promise<any> {
    const res = await fetchWithAuth('/attendance/coaches', {
      method: 'POST',
      body: JSON.stringify({ date, coachId, isPresent, notes }),
    });
    return res.data;
  },

  // Dashboard
  async getDashboardData(): Promise<any> {
    const res = await fetchWithAuth('/dashboard');
    return res.data;
  },
};
