// ============================================================
// LIVE API SERVICE — ASCEND CRICKET ACADEMY
// Client-side fetch wrapper for all ERP API calls.
// Auth is handled via Supabase HTTP-only session cookies.
// The browser automatically sends the cookie on every request;
// no manual token management is needed.
// ============================================================

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
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  noticeStudents?: Array<{ studentId: string; student: { fullName: string } }>;
  noticeCoaches?: Array<{ coachId: string; coach: { name: string } }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
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

export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('erp_role');
    localStorage.removeItem('erp_username');
    localStorage.removeItem('erp_user_id');
  }
};

// ── Fetch wrapper ─────────────────────────────────────────────
/**
 * Cookie-based fetch wrapper.
 * `credentials: 'include'` ensures the browser sends the HTTP-only
 * Supabase session cookie automatically — no token needed in JS.
 */
async function fetchAPI(url: string, options: RequestInit = {}): Promise<any> {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // send HTTP-only session cookie
  });

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
    // Sign in via the server-side route so the session cookie is set
    // on the Next.js domain (HTTP-only, handled by Supabase SSR).
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const profile = res.data;

    // Store role/name in localStorage for UI display only — NOT for auth
    localStorage.setItem('erp_role', profile.role.toLowerCase());
    localStorage.setItem('erp_username', profile.fullName);
    localStorage.setItem('erp_user_id', profile.id);

    return profile;
  },

  async logout(): Promise<void> {
    await fetchAPI('/auth/logout', { method: 'POST' }).catch(() => {});
    clearTokens();
  },

  // Student Details / Profile API
  async getStudentDetails(studentId: string): Promise<StudentDetails> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchAPI(`/admin/students/${studentId}`);
      return res.data;
    } else {
      const res = await fetchAPI('/students/me');
      return res.data;
    }
  },

  async updateStudentDetails(details: Partial<StudentDetails>): Promise<StudentDetails> {
    const res = await fetchAPI('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(details),
    });
    return res.data;
  },

  // Transactions / Payments API
  async getTransactions(): Promise<Transaction[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchAPI('/payments');
      return res.data.transactions.map((tx: any) => ({
        ...tx,
        studentName: tx.student?.fullName,
      }));
    } else {
      const res = await fetchAPI('/students/me/transactions');
      return res.data.transactions;
    }
  },

  async addTransaction(tx: FormData | Omit<Transaction, 'id' | 'createdAt' | 'status'>): Promise<Transaction> {
    if (tx instanceof FormData) {
      const res = await fetchAPI('/payments', { method: 'POST', body: tx });
      return res.data;
    }
    const formData = new FormData();
    formData.append('amount', String(tx.amount));
    formData.append('type', tx.type);
    formData.append('mode', tx.mode);
    if (tx.utrNumber) formData.append('utrNumber', tx.utrNumber);
    if (tx.transactionDatetime) formData.append('transactionDatetime', tx.transactionDatetime);
    if (tx.installmentNumber) formData.append('installmentNumber', String(tx.installmentNumber));
    const res = await fetchAPI('/payments', { method: 'POST', body: formData });
    return res.data;
  },

  async updateTransactionStatus(txId: string, status: 'Approved' | 'Rejected', adminId: string): Promise<Transaction> {
    const action = status === 'Approved' ? 'approve' : 'reject';
    const res = await fetchAPI(`/payments/${txId}/${action}`, { method: 'PATCH' });
    return res.data;
  },

  // Notices API
  async getNotices(): Promise<Notice[]> {
    const res = await fetchAPI('/notices');
    return res.data.notices ?? res.data;
  },

  async addNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'createdBy' | 'noticeStudents' | 'noticeCoaches'>): Promise<Notice> {
    const res = await fetchAPI('/notices', { method: 'POST', body: JSON.stringify(notice) });
    return res.data;
  },

  async deleteNotice(id: string): Promise<void> {
    await fetchAPI(`/notices/${id}`, { method: 'DELETE' });
  },

  // Calendar Events API
  async getEvents(): Promise<CalendarEvent[]> {
    const res = await fetchAPI('/calendar');
    return res.data;
  },

  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const res = await fetchAPI('/calendar', { method: 'POST', body: JSON.stringify(event) });
    return res.data;
  },

  // Coaches API
  async getCoaches(): Promise<Coach[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchAPI('/admin/coaches');
      return res.data.coaches ?? res.data;
    } else {
      const res = await fetchAPI('/coaches');
      return res.data;
    }
  },

  // Reviews API
  async getReviews(studentId: string): Promise<StudentReview[]> {
    const role = localStorage.getItem('erp_role');
    if (role === 'admin') {
      const res = await fetchAPI(`/admin/students/${studentId}`);
      return res.data.reviews || [];
    } else {
      const res = await fetchAPI('/students/me/reviews');
      return res.data;
    }
  },

  async addReview(review: Omit<StudentReview, 'id' | 'createdAt'>): Promise<StudentReview> {
    const res = await fetchAPI('/students/me/reviews', { method: 'POST', body: JSON.stringify(review) });
    return res.data;
  },

  // Feedback API
  async getFeedback(): Promise<Feedback[]> {
    const res = await fetchAPI('/students/me/feedbacks');
    return res.data;
  },

  async addFeedback(fb: Omit<Feedback, 'id' | 'createdAt' | 'studentName' | 'isTestimonial' | 'studentId'>): Promise<Feedback> {
    const res = await fetchAPI('/students/me/feedbacks', { method: 'POST', body: JSON.stringify(fb) });
    return res.data;
  },

  // Achievements API
  async getAchievements(): Promise<Achievement[]> {
    const res = await fetchAPI('/students/me/achievements');
    return res.data;
  },

  async addAchievement(formData: FormData): Promise<Achievement> {
    const res = await fetchAPI('/students/me/achievements', { method: 'POST', body: formData });
    return res.data;
  },

  async deleteAchievement(id: string): Promise<void> {
    await fetchAPI(`/students/me/achievements/${id}`, { method: 'DELETE' });
  },

  // Admin creations
  async adminCreateStudent(data: any): Promise<any> {
    const res = await fetchAPI('/admin/students', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },

  async adminListStudents(): Promise<any[]> {
    const res = await fetchAPI('/admin/students');
    return res.data.students ?? res.data ?? [];
  },

  async adminDeleteStudent(studentId: string): Promise<void> {
    await fetchAPI(`/admin/students/${studentId}`, { method: 'DELETE' });
  },

  async adminListFeedbacks(): Promise<Feedback[]> {
    const res = await fetchAPI('/admin/feedbacks');
    return res.data ?? [];
  },

  async adminCreateCoach(data: any): Promise<any> {
    const res = await fetchAPI('/admin/coaches', { method: 'POST', body: JSON.stringify(data) });
    return res.data;
  },

  async adminAssignCoach(studentId: string, coachId: string): Promise<any> {
    const res = await fetchAPI(`/admin/students/${studentId}/coach`, {
      method: 'PATCH',
      body: JSON.stringify({ coachId }),
    });
    return res.data;
  },

  async adminToggleTestimonial(feedbackId: string, isTestimonial: boolean): Promise<any> {
    const res = await fetchAPI(`/admin/feedback/${feedbackId}/testimonial`, {
      method: 'PATCH',
      body: JSON.stringify({ isTestimonial }),
    });
    return res.data;
  },

  async adminToggleFeaturedAchievement(achievementId: string, isFeatured: boolean): Promise<any> {
    const res = await fetchAPI(`/admin/achievements/${achievementId}/featured`, {
      method: 'PATCH',
      body: JSON.stringify({ isFeatured }),
    });
    return res.data;
  },

  // Attendance API
  async getTodayAttendance(): Promise<any> {
    const res = await fetchAPI('/attendance/today');
    return res.data;
  },

  async getMyAttendance(): Promise<{ stats: any; records: any[] }> {
    const res = await fetchAPI('/students/me/attendance');
    return res.data;
  },

  async getCoachProfile(): Promise<Coach> {
    const res = await fetchAPI('/coaches/me');
    return res.data;
  },

  async markStudentAttendance(date: string, records: Array<{ studentId: string; isPresent: boolean; notes?: string }>): Promise<any> {
    const res = await fetchAPI('/attendance/students', {
      method: 'POST',
      body: JSON.stringify({ date, records }),
    });
    return res.data;
  },

  async markCoachAttendance(date: string, coachId: string, isPresent: boolean, notes?: string): Promise<any> {
    const res = await fetchAPI('/attendance/coaches', {
      method: 'POST',
      body: JSON.stringify({ date, coachId, isPresent, notes }),
    });
    return res.data;
  },

  // Dashboard — single aggregated call for initial page load
  async getDashboardData(): Promise<any> {
    const res = await fetchAPI('/dashboard');
    return res.data;
  },
};
