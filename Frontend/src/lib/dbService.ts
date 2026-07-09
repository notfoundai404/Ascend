// ============================================================
// LIVE API SERVICE — ASCEND CRICKET ACADEMY
// Client-side fetch wrapper for all ERP API calls.
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
  eventDate: string; // ISO date
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
  _count?: {
    students: number;
  };
}

export interface StudentReview {
  id: string;
  studentId: string;
  coachName: string;
  battingRating: number; // 0-100
  bowlingRating: number; // 0-100
  fitnessRating: number; // 0-100
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

// No-op for dbService compatibility
export const initDB = () => {
  // Database initialization is now handled by the backend migration seeding.
};

// Token storage helpers
const getAccessToken = () => typeof window !== 'undefined' ? localStorage.getItem('erp_access_token') : null;
const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('erp_refresh_token') : null;
const setTokens = (access: string, refresh: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_access_token', access);
    localStorage.setItem('erp_refresh_token', refresh);
  }
};
export const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('erp_access_token');
    localStorage.removeItem('erp_refresh_token');
    localStorage.removeItem('erp_role');
    localStorage.removeItem('erp_username');
    localStorage.removeItem('erp_user_id');
  }
};

/**
 * Fetch wrapper that attaches headers and handles automatic token refresh on 401.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Only set application/json for non-FormData request bodies
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Attempt Token Refresh
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        });

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          const { accessToken, refreshToken: newRefresh } = refreshResult.data;
          setTokens(accessToken, newRefresh);

          // Retry original request
          headers.set('Authorization', `Bearer ${accessToken}`);
          const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const errBody = await retryResponse.json();
            throw new Error(errBody.message || 'Request failed after refresh');
          }
          return await retryResponse.json();
        }
      } catch (refreshErr) {
        console.error('Session expired, logging out:', refreshErr);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/erp/login';
        }
        throw new Error('Session expired');
      }
    }
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

export const dbService = {
  // Auth API
  async login(email: string, password: string): Promise<any> {
    const res = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { accessToken, refreshToken, user } = res.data;
    setTokens(accessToken, refreshToken);

    localStorage.setItem('erp_role', user.role.toLowerCase());
    localStorage.setItem('erp_username', user.fullName);
    localStorage.setItem('erp_user_id', user.id);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors during logout
    } finally {
      clearTokens();
    }
  },

  async changePassword(current: string, newPass: string): Promise<void> {
    await fetchWithAuth('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    });
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
      const res = await fetchWithAuth('/payments', {
        method: 'POST',
        body: tx,
      });
      return res.data;
    }
    const formData = new FormData();
    formData.append('amount', String(tx.amount));
    formData.append('type', tx.type);
    formData.append('mode', tx.mode);
    if (tx.utrNumber) formData.append('utrNumber', tx.utrNumber);
    if (tx.transactionDatetime) formData.append('transactionDatetime', tx.transactionDatetime);
    if (tx.installmentNumber) formData.append('installmentNumber', String(tx.installmentNumber));

    const res = await fetchWithAuth('/payments', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async updateTransactionStatus(txId: string, status: 'Approved' | 'Rejected', adminId: string): Promise<Transaction> {
    const endpoint = `/payments/${txId}/${status.toLowerCase()}`;
    const res = await fetchWithAuth(endpoint, {
      method: 'PATCH',
    });
    return res.data;
  },

  // Notices API
  async getNotices(): Promise<Notice[]> {
    const res = await fetchWithAuth('/notices');
    return res.data.notices ?? res.data;
  },

  async addNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'createdBy' | 'noticeStudents' | 'noticeCoaches'>): Promise<Notice> {
    const res = await fetchWithAuth('/notices', {
      method: 'POST',
      body: JSON.stringify(notice),
    });
    return res.data;
  },

  // Calendar Events API
  async getEvents(): Promise<CalendarEvent[]> {
    const res = await fetchWithAuth('/calendar');
    return res.data;
  },

  async addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
    const res = await fetchWithAuth('/calendar', {
      method: 'POST',
      body: JSON.stringify(event),
    });
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
    const res = await fetchWithAuth('/students/me/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
    return res.data;
  },

  // Feedback API
  async getFeedback(): Promise<Feedback[]> {
    const res = await fetchWithAuth('/students/me/feedbacks');
    return res.data;
  },

  async addFeedback(fb: Omit<Feedback, 'id' | 'createdAt' | 'studentName' | 'isTestimonial' | 'studentId'>): Promise<Feedback> {
    const res = await fetchWithAuth('/students/me/feedbacks', {
      method: 'POST',
      body: JSON.stringify(fb),
    });
    return res.data;
  },

  // Achievements API
  async getAchievements(): Promise<Achievement[]> {
    const res = await fetchWithAuth('/students/me/achievements');
    return res.data;
  },

  async addAchievement(formData: FormData): Promise<Achievement> {
    const res = await fetchWithAuth('/students/me/achievements', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  async deleteAchievement(id: string): Promise<void> {
    await fetchWithAuth(`/students/me/achievements/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin creations
  async adminCreateStudent(data: any): Promise<any> {
    const res = await fetchWithAuth('/admin/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    const res = await fetchWithAuth('/admin/coaches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  /** Student: fetch own attendance history + stats */
  async getMyAttendance(): Promise<{ stats: any; records: any[] }> {
    const res = await fetchWithAuth('/students/me/attendance');
    return res.data;
  },

  /** Coach: fetch own profile */
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

  // Role dashboard aggregator
  async getDashboardData(): Promise<any> {
    const res = await fetchWithAuth('/dashboard');
    return res.data;
  }
};
