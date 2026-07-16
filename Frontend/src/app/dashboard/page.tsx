'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
// sonner toast removed — using inline notifications instead
import {
  LayoutDashboard, User, Shield, CreditCard, Calendar, BookOpen,
  Users, Award, MessageSquare, LogOut, Menu, X, Check, CheckCircle2,
  XCircle, AlertCircle, Plus, Clock, Upload, Eye, MapPin, Phone, Mail,
  FileText, Activity, Trash2, CheckSquare, Edit3, Loader2
} from 'lucide-react';
import {
  dbService, Profile, StudentDetails, Transaction, Notice,
  CalendarEvent, Coach, StudentReview, Feedback, Achievement
} from '@/lib/dbService';

type AttendanceEntry = { isPresent: boolean; notes: string };

type Tab =
  | 'dashboard'
  | 'personal_detail'
  | 'coe'
  | 'notice_board'
  | 'coaches'
  | 'student_review'
  | 'payment'
  | 'feedback'
  | 'achievements'
  | 'attendance'
  | 'manage_accounts'
  | 'assigned_students'
  | 'contact';

export default function ErpDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'admin' | 'coach' | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // Track which tabs have already loaded their full dataset (to avoid re-fetching)
  const loadedTabsRef = React.useRef<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Core aggregated dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);

  // States for lists
  const [studentsList, setStudentsList] = useState<any[]>([]); // Admin student directory
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [reviews, setReviews] = useState<StudentReview[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Specific views
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [coachDetails, setCoachDetails] = useState<Coach | null>(null);
  const [personalDetailsForm, setPersonalDetailsForm] = useState<any | null>(null);

  // Forms & Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(15000);
  const [payType, setPayType] = useState<'academy_fees' | 'uniform_fees'>('academy_fees');
  const [payMode, setPayMode] = useState<'UPI' | 'Cash' | 'Bank_Transfer'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentDatetime, setPaymentDatetime] = useState('');
  const [proofImageFile, setProofImageFile] = useState<File | null>(null);
  const [proofImageBase64, setProofImageBase64] = useState<string>('');

  const [activeReceiptUrl, setActiveReceiptUrl] = useState<string | null>(null);

  // Creation forms (Admin & Coach)
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeCategory, setNewNoticeCategory] = useState<'urgent' | 'general' | 'event'>('general');
  const [newNoticeVisibility, setNewNoticeVisibility] = useState<'ALL' | 'SELECTED_STUDENTS' | 'SELECTED_COACHES'>('ALL');
  const [newNoticeImageFile, setNewNoticeImageFile] = useState<File | null>(null);
  const [newNoticeImageBase64, setNewNoticeImageBase64] = useState('');
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCat, setNewEventCat] = useState<'match' | 'practice' | 'holiday' | 'fee_deadline'>('practice');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventImageFile, setNewEventImageFile] = useState<File | null>(null);
  const [newEventImageBase64, setNewEventImageBase64] = useState('');
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Feedback form
  const [fbCoach, setFbCoach] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbComments, setFbComments] = useState('');
  const [fbMessage, setFbMessage] = useState('');

  // ── Inline notification (replaces corner toasts) ──────────────────────────
  const [notif, setNotif] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const notifTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNotif = (msg: string, type: 'success' | 'error' = 'success') => {
    if (notifTimer.current) clearTimeout(notifTimer.current);
    setNotif({ msg, type });
    notifTimer.current = setTimeout(() => setNotif(null), 3500);
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Achievement form
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achDate, setAchDate] = useState('');
  const [achImageFile, setAchImageFile] = useState<File | null>(null);
  const [achImageBase64, setAchImageBase64] = useState('');
  const [achModalOpen, setAchModalOpen] = useState(false);

  // Student reviews (Coach logs for student)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedStudentIdForReview, setSelectedStudentIdForReview] = useState('');
  const [reviewBatting, setReviewBatting] = useState(80);
  const [reviewBowling, setReviewBowling] = useState(80);
  const [reviewFitness, setReviewFitness] = useState(80);
  const [reviewText, setReviewText] = useState('');

  // Admin Manage Accounts
  const [createAccountType, setCreateAccountType] = useState<'student' | 'coach'>('student');
  const [newAccName, setNewAccName] = useState('');
  const [newAccEmail, setNewAccEmail] = useState('');
  const [newAccPhone, setNewAccPhone] = useState('');
  const [newAccCoachId, setNewAccCoachId] = useState('');
  const [newAccBatch, setNewAccBatch] = useState('Morning Academy');
  const [newAccTotalFees, setNewAccTotalFees] = useState(45000);
  const [newAccUniformFees, setNewAccUniformFees] = useState(2500);
  const [newAccInstallmentsLimit, setNewAccInstallmentsLimit] = useState(3);
  const [createdCredentialsAlert, setCreatedCredentialsAlert] = useState<any>(null);

  // Attendance Marking
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStudents, setAttendanceStudents] = useState<any[]>([]);

  // Fetch attendance when date changes
  useEffect(() => {
    if (!role || role === 'student' || !dashboardData) return;
    
    dbService.getTodayAttendance(attendanceDate).then(data => {
      const mapped = data.map((s: any) => ({
        studentId: s.studentId,
        fullName: s.fullName,
        studentDisplayId: s.studentDisplayId,
        attendance: s.attendance ? { isPresent: s.attendance.isPresent, notes: s.attendance.notes } : { isPresent: false, notes: '' },
      }));
      setAttendanceStudents(mapped);
    }).catch(console.error);
  }, [attendanceDate, role, dashboardData]);

  // ── Initial load — single /api/dashboard call ────────────────
  useEffect(() => {
    const storedRole = localStorage.getItem('erp_role') as 'student' | 'admin' | 'coach' | null;
    const storedUserId = localStorage.getItem('erp_user_id') || '';
    const storedUsername = localStorage.getItem('erp_username') || '';

    if (!storedRole) {
      router.push('/login');
      return;
    }

    setRole(storedRole);
    setUserId(storedUserId);
    setUsername(storedUsername);

    loadDashboard(storedRole);
  }, [router]);

  // ── Lazy per-tab loading (on first visit to a tab) ──────────
  // Tabs that need data beyond the dashboard preview load it once
  // on first open, then cache in state (no re-fetch on tab switch).
  useEffect(() => {
    if (!role) return;
    const tab = activeTab;
    if (loadedTabsRef.current.has(tab)) return;

    if (role === 'student') {
      if (tab === 'payment') {
        loadedTabsRef.current.add(tab);
        dbService.getTransactions().then(setTransactions).catch(() => { });
      }
      if (tab === 'student_review') {
        loadedTabsRef.current.add(tab);
        dbService.getReviews('me').then(setReviews).catch(() => { });
      }
      if (tab === 'feedback') {
        loadedTabsRef.current.add(tab);
        dbService.getFeedback().then(setFeedbacks).catch(() => { });
      }
      if (tab === 'achievements') {
        loadedTabsRef.current.add(tab);
        dbService.getAchievements().then(setAchievements).catch(() => { });
      }
      if (tab === 'attendance') {
        loadedTabsRef.current.add(tab);
        dbService.getMyAttendance().then((att) => {
          setAttendanceStats(att.stats);
          setAttendanceRecords(att.records);
        }).catch(() => { });
      }
    }
  }, [activeTab, role]);

  // ── Poll real-time tabs (calendar & notice board) ───────────
  // Silently refresh when the user is on a time-sensitive tab so
  // updates from admin/coach appear without a full reload.
  useEffect(() => {
    if (!role) return;

    const refreshFn = () => {
      if (activeTab === 'coe') {
        dbService.getEvents().then(setEvents).catch(() => { });
      }
      if (activeTab === 'notice_board') {
        dbService.getNotices().then(setNotices).catch(() => { });
      }
    };

    // Immediate fetch on tab switch
    refreshFn();

    // Poll every 60 seconds while on these tabs
    const interval = (activeTab === 'coe' || activeTab === 'notice_board')
      ? setInterval(refreshFn, 60_000)
      : null;

    return () => { if (interval) clearInterval(interval); };
  }, [activeTab, role]);

  /**
   * loadDashboard — single GET /api/dashboard call.
   * Populates all initial state from the consolidated response.
   * Full datasets for heavy tabs (attendance, reviews, etc.) are
   * loaded lazily on first tab open via the lazy-load effect above.
   */
  const loadDashboard = async (userRole: 'student' | 'admin' | 'coach') => {
    try {
      const data = await dbService.getDashboardData();

      setDashboardData(data);

      if (userRole === 'student') {
        // Student profile
        const details: StudentDetails = {
          ...data.student,
          coach: data.coach,
          totalFees: data.fees.totalFees,
          uniformFees: data.fees.uniformFees,
          amountPaidTillDate: data.fees.totalPaid,
          installmentsLimit: data.student.installmentsLimit,
        };
        setStudentDetails(details);
        setPersonalDetailsForm({ ...details });

        // Previews — enough to render dashboard cards immediately
        setNotices(data.noticesPreview ?? []);
        setEvents(data.eventsPreview ?? []);
        setCoaches(data.coaches ?? []);
        setReviews(data.reviewsPreview ?? []);
        setAchievements(data.achievementsPreview ?? []);

        // Transactions are small — include full list
        setTransactions(data.transactions ?? []);
        loadedTabsRef.current.add('payment');

        // Attendance stats + records come from dashboard
        setAttendanceStats(data.attendance);
        setAttendanceRecords(data.attendance?.records ?? []);
        loadedTabsRef.current.add('attendance');

      } else if (userRole === 'coach') {
        setCoachDetails(data.coach);
        setPersonalDetailsForm({ ...data.coach });
        setNotices(data.noticesPreview ?? []);
        setEvents(data.eventsPreview ?? []);
        setCoaches(data.coaches ?? []);
        // Attendance students for marking — use the full assigned-student list
        // and overlay any already-marked records so students without a record today still appear.
        // Attendance logic handled by useEffect now


      } else if (userRole === 'admin') {
        setNotices(data.noticesPreview ?? []);
        setEvents(data.eventsPreview ?? []);
        setCoaches(data.coaches ?? []);
        setStudentsList(data.allStudents ?? []);
        setTransactions((data.recentTransactions ?? []).map((tx: any) => ({
          ...tx,
          studentName: tx.studentName || tx.student?.fullName,
        })));
        setFeedbacks(data.adminFeedbacks ?? []);
        // Mark heavy tabs as loaded since admin gets full lists in dashboard
        loadedTabsRef.current.add('payment');
        loadedTabsRef.current.add('manage_accounts');
        loadedTabsRef.current.add('attendance');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading portal data:', err);
      setLoading(false);
    }
  };

  /**
   * loadAllData — kept for mutations that need to refresh specific data.
   * After a mutation (payment submit, notice add, etc.) we reload only
   * the relevant slice instead of the full dashboard.
   */
  const loadAllData = async (userRole: 'student' | 'admin' | 'coach', showLoader = false) => {
    // Clear loaded-tab cache so everything reloads fresh
    loadedTabsRef.current.clear();
    if (showLoader) setLoading(true);
    await loadDashboard(userRole);
  };


  const handleLogout = async () => {
    await dbService.logout();
    router.push('/login');
  };

  // Image reader/selector
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'proof' | 'achievement' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'proof') setProofImageFile(file);
      if (type === 'achievement') setAchImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'proof') setProofImageBase64(reader.result as string);
        if (type === 'achievement') setAchImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Student updates personal details
  const handleUpdateStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalDetailsForm) return;
    setLoadingAction('update_profile');
    try {
      const { dob, fatherName, motherName, fatherPhone, motherPhone, fatherEmail, motherEmail, emergencyPhone, address, bloodGroup, cricketRole, uniformSize, batch } = personalDetailsForm;
      const updated = await dbService.updateStudentDetails({
        dob, fatherName, motherName, fatherPhone, motherPhone, fatherEmail, motherEmail, emergencyPhone, address, bloodGroup, cricketRole, uniformSize, batch
      });
      setStudentDetails(updated);
      showNotif('Personal details saved successfully!');
    } catch (err: any) {
      showNotif(err.message || 'Failed to update details.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Coach updates own profile
  const handleUpdateCoachProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalDetailsForm) return;
    setLoadingAction('update_profile');
    try {
      const formData = new FormData();
      formData.append('name', personalDetailsForm.name);
      formData.append('phone', personalDetailsForm.phone || '');
      formData.append('specialty', personalDetailsForm.specialty || '');
      formData.append('experience', personalDetailsForm.experience || '');
      if (achImageFile) {
        formData.append('avatar', achImageFile); // Reuses file state or input
      }

      await fetch('/api/coaches/me', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_access_token')}` },
        body: formData
      });

      showNotif('Profile updated successfully!');
      loadAllData('coach');
    } catch (err: any) {
      showNotif(err.message || 'Failed to update coach profile.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Submit Payment Proof (Student)
  const handlePaymentSubmit = async () => {
    if (!utrNumber || !paymentDatetime) {
      showNotif('Please fill out the UTR reference and payment date/time.', 'error');
      return;
    }

    setLoadingAction('payment_submit');
    try {
      const formData = new FormData();
      formData.append('amount', String(payAmount));
      formData.append('type', payType);
      formData.append('mode', payMode);
      formData.append('utrNumber', utrNumber);
      formData.append('transactionDatetime', new Date(paymentDatetime).toISOString());
      if (proofImageFile) {
        formData.append('proof', proofImageFile);
      }

      await dbService.addTransaction(formData);

      setPaymentModalOpen(false);
      setUtrNumber('');
      setPaymentDatetime('');
      setProofImageBase64('');
      setProofImageFile(null);
      showNotif('Payment submitted! Awaiting Admin approval.');
      loadAllData('student');
    } catch (err: any) {
      showNotif(err.message || 'Error submitting payment.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Approve payment (Admin)
  const handleApproveTransaction = async (txId: string) => {
    setLoadingAction(`approve_${txId}`);
    try {
      await dbService.updateTransactionStatus(txId, 'Approved', userId);
      showNotif('Payment approved!');
      setTransactions((prev) => prev.map(tx => tx.id === txId ? { ...tx, status: 'Approved' } : tx));
    } catch (err: any) {
      showNotif(err.message || 'Approval failed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Reject payment (Admin)
  const handleRejectTransaction = async (txId: string) => {
    setLoadingAction(`reject_${txId}`);
    try {
      await dbService.updateTransactionStatus(txId, 'Rejected', userId);
      showNotif('Payment rejected.');
      setTransactions((prev) => prev.map(tx => tx.id === txId ? { ...tx, status: 'Rejected' } : tx));
    } catch (err: any) {
      showNotif(err.message || 'Rejection failed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Create notice (Admin/Coach)
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    setLoadingAction('add_notice');
    try {
      await dbService.addNotice({
        title: newNoticeTitle,
        content: newNoticeContent,
        category: newNoticeCategory,
        visibility: newNoticeVisibility,
        imageUrl: newNoticeImageBase64 || undefined,
      });
      setNewNoticeTitle('');
      setNewNoticeContent('');
      setNewNoticeImageFile(null);
      setNewNoticeImageBase64('');
      setNoticeModalOpen(false);
      showNotif('Notice broadcasted successfully!');
      loadAllData(role!);
    } catch (err: any) {
      showNotif(err.message || 'Notice addition failed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete notice (Admin/Coach)
  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('Delete this notice? This action cannot be undone.')) return;
    setLoadingAction(`delete_notice_${noticeId}`);
    try {
      await dbService.deleteNotice(noticeId);
      showNotif('Notice deleted.');
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch (err: any) {
      showNotif(err.message || 'Failed to delete notice.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Create calendar event (Admin/Coach)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    setLoadingAction('add_event');
    try {
      await dbService.addEvent({
        title: newEventTitle,
        description: newEventDesc,
        imageUrl: newEventImageBase64 || undefined,
        category: newEventCat,
        eventDate: new Date(newEventDate).toISOString(),
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventImageFile(null);
      setNewEventImageBase64('');
      setEventModalOpen(false);
      showNotif('Calendar event scheduled successfully!');
      loadAllData(role!);
    } catch (err: any) {
      showNotif(err.message || 'Event addition failed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Submit Feedback (Student)
  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbComments) return;
    setLoadingAction('add_feedback');
    try {
      await dbService.addFeedback({
        coachName: fbCoach || undefined,
        rating: fbRating,
        comments: fbComments,
      });
      setFbCoach('');
      setFbRating(5);
      setFbComments('');
      showNotif('Thank you! Your feedback has been registered.');
      loadAllData('student');
    } catch (err: any) {
      showNotif(err.message || 'Feedback submission failed.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Submit Achievement (Student)
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle) return;

    setLoadingAction('add_achievement');
    try {
      const formData = new FormData();
      formData.append('title', achTitle);
      formData.append('description', achDesc);
      if (achDate) formData.append('date', new Date(achDate).toISOString());
      if (achImageFile) {
        formData.append('image', achImageFile);
      }

      await dbService.addAchievement(formData);
      setAchTitle('');
      setAchDesc('');
      setAchDate('');
      setAchImageBase64('');
      setAchImageFile(null);
      setAchModalOpen(false);
      showNotif('Achievement uploaded successfully!');
      loadAllData('student');
    } catch (err: any) {
      showNotif(err.message || 'Failed to upload achievement.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete Achievement (Student)
  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    setLoadingAction(`delete_ach_${id}`);
    try {
      await dbService.deleteAchievement(id);
      showNotif('Achievement deleted.');
      loadAllData('student');
    } catch (err: any) {
      showNotif(err.message || 'Failed to delete achievement.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Log Performance Review (Coach)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentIdForReview) {
      showNotif('Please select a student.', 'error');
      return;
    }
    setLoadingAction('add_review');
    try {
      await dbService.addReview({
        studentId: selectedStudentIdForReview,
        coachName: username,
        battingRating: reviewBatting,
        bowlingRating: reviewBowling,
        fitnessRating: reviewFitness,
        reviewText: reviewText,
      });
      setReviewText('');
      setReviewModalOpen(false);
      showNotif('Performance review logged!');
      loadAllData(role!);
    } catch (err: any) {
      showNotif(err.message || 'Failed to log review.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Toggle testimonial (Admin)
  const handleToggleTestimonial = async (fbId: string, isTestimonial: boolean) => {
    setLoadingAction(`testimonial_${fbId}`);
    try {
      await dbService.adminToggleTestimonial(fbId, isTestimonial);
      showNotif('Testimonial status updated.');
      loadAllData('admin');
    } catch (err: any) {
      showNotif(err.message || 'Failed to toggle status.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Create accounts (Admin)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedCredentialsAlert(null);
    setLoadingAction('create_account');

    try {
      if (createAccountType === 'student') {
        const res = await dbService.adminCreateStudent({
          fullName: newAccName,
          email: newAccEmail,
          phone: newAccPhone,
          primaryCoachId: newAccCoachId || undefined,
          batch: newAccBatch,
          totalFees: newAccTotalFees,
          uniformFees: newAccUniformFees,
          installmentsLimit: newAccInstallmentsLimit,
        });
        setCreatedCredentialsAlert(res);
        showNotif('Student account created successfully!');
      } else {
        const res = await dbService.adminCreateCoach({
          name: newAccName,
          email: newAccEmail,
          phone: newAccPhone,
        });
        setCreatedCredentialsAlert(res);
        showNotif('Coach account created successfully!');
      }

      setNewAccName('');
      setNewAccEmail('');
      setNewAccPhone('');
      setNewAccCoachId('');
      loadAllData('admin');
    } catch (err: any) {
      showNotif(err.message || 'Failed to create account.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Assign Student Coach (Admin)
  const handleAssignCoach = async (studentId: string, coachId: string) => {
    setLoadingAction(`assign_coach_${studentId}`);
    try {
      await dbService.adminAssignCoach(studentId, coachId);
      showNotif('Coach assigned successfully!');
      loadAllData('admin');
    } catch (err: any) {
      showNotif(err.message || 'Failed to assign coach.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Delete Student (Admin)
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Delete student "${studentName}"?\n\nThis will permanently remove the student and all their data (payments, attendance, achievements, feedback).`)) return;
    setLoadingAction(`delete_student_${studentId}`);
    try {
      await dbService.adminDeleteStudent(studentId);
      showNotif(`Student "${studentName}" deleted.`);
      setStudentsList(prev => prev.filter(s => s.id !== studentId));
    } catch (err: any) {
      showNotif(err.message || 'Failed to delete student.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  // Mark student attendance (Coach/Admin)
  const handleToggleStudentAttendance = (studentId: string) => {
    setAttendanceStudents(prev =>
      prev.map(s =>
        s.studentId === studentId
          ? { ...s, attendance: s.attendance ? { ...s.attendance, isPresent: !s.attendance.isPresent } : { isPresent: true } }
          : s
      )
    );
  };

  const handleSaveStudentAttendance = async () => {
    setLoadingAction('save_attendance');
    try {
      const records = attendanceStudents.map(s => ({
        studentId: s.studentId,
        isPresent: s.attendance?.isPresent || false,
        notes: s.attendance?.notes || ''
      }));

      await dbService.markStudentAttendance(attendanceDate, records);
      showNotif('Attendance saved successfully!');
      loadAllData(role!);
    } catch (err: any) {
      showNotif(err.message || 'Failed to save attendance.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: '#ffffff', border: '2px solid #E2E8F0', boxShadow: '0 8px 32px rgba(27,58,140,0.10)' }}
          >
            <Image src="/AscendLogo.webp" alt="Ascend" width={52} height={52} className="object-contain" priority loading="eager" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#1B3A8C] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-[#1B3A8C] animate-bounce" style={{ animationDelay: '120ms' }} />
            <div className="h-2 w-2 rounded-full bg-[#1B3A8C] animate-bounce" style={{ animationDelay: '240ms' }} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8', letterSpacing: '0.15em' }}>Loading ERP Portal...</p>
        </div>
      </div>
    );
  }

  // Define sidebar menu items based on role
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'admin', 'coach'] },
    { id: 'manage_accounts', label: 'Manage Accounts', icon: Shield, roles: ['admin'] },
    { id: 'assigned_students', label: 'Assigned Students', icon: Users, roles: ['coach'] },
    { id: 'personal_detail', label: 'Personal Details', icon: User, roles: ['student', 'coach'] },
    { id: 'coe', label: 'COE (Calendar)', icon: Calendar, roles: ['student', 'admin', 'coach'] },
    { id: 'notice_board', label: 'Notice Board', icon: BookOpen, roles: ['student', 'admin', 'coach'] },
    { id: 'coaches', label: 'Coaches Staff', icon: Users, roles: ['student', 'admin'] },
    { id: 'student_review', label: 'Skill Reviews', icon: Award, roles: ['student', 'coach'] },
    { id: 'payment', label: 'Payment & Fees', icon: CreditCard, roles: ['student', 'admin'] },
    { id: 'feedback', label: 'Feedbacks', icon: MessageSquare, roles: ['student', 'admin'] },
    { id: 'achievements', label: 'Achievements', icon: Award, roles: ['student'] },
    { id: 'attendance', label: 'Attendance logs', icon: CheckSquare, roles: ['student', 'coach', 'admin'] },
    { id: 'contact', label: 'Contact Support', icon: Phone, roles: ['student', 'coach', 'admin'] },
  ].filter(item => item.roles.includes(role || ''));

  // Common Calculations
  const totalFeesCharged = studentDetails?.totalFees || 0;
  const uniformFeesCharged = studentDetails?.uniformFees || 0;
  const totalPaid = studentDetails?.amountPaidTillDate || 0;
  const pendingFees = Math.max(0, totalFeesCharged + uniformFeesCharged - totalPaid);

  // Calculate specific installment approvals
  const academyFeesPaid = transactions
    .filter(t => t.status === 'Approved' && t.type === 'academy_fees')
    .reduce((sum, t) => sum + t.amount, 0);

  const uniformFeesPaid = transactions
    .filter(t => t.status === 'Approved' && t.type === 'uniform_fees')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4FF', fontFamily: 'Inter, sans-serif' }}>
      {/* ─── Sidebar Navigation ──────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col shrink-0" style={{ width: '256px', background: '#ffffff', borderRight: '1px solid #E2E8F0' }}>
        {/* Logo area */}
        <div style={{ height: '72px', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px', borderBottom: '1px solid #E2E8F0' }}>
          <div
            style={{ width: '40px', height: '40px', background: '#ffffff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(27,58,140,0.10)' }}
          >
            <Image src="/AscendLogo.webp" alt="Ascend" width={28} height={28} className="object-contain" priority loading="eager" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ display: 'block', fontWeight: 800, fontSize: '15px', color: '#1B3A8C', letterSpacing: '-0.01em', lineHeight: 1.1 }}>ASCEND</span>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '2px' }}>
              {role === 'admin' ? 'Administration' : role === 'coach' ? 'Coaching Portal' : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* User card */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ height: '38px', width: '38px', background: '#EEF2FF', color: '#1B3A8C', borderRadius: '50%', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', textTransform: 'uppercase', border: '2px solid #C7D2FE', flexShrink: 0 }}>
              {username.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 600, color: '#1B3A8C', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#EEF2FF', borderRadius: '999px', padding: '1px 8px', marginTop: '2px' }}>
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 600,
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isActive ? '#1B3A8C' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 2px 12px rgba(27,58,140,0.18)' : 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#1B3A8C'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Mobile Sidebar Drawer ────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="absolute left-0 top-0 h-full flex flex-col"
            style={{ width: '272px', background: '#ffffff', borderRight: '1px solid #E2E8F0', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
          >
            {/* Logo area */}
            <div style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: '#ffffff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(27,58,140,0.10)' }}>
                  <Image src="/AscendLogo.webp" alt="Ascend" width={24} height={24} className="object-contain" />
                </div>
                <div>
                  <span style={{ display: 'block', fontWeight: 800, fontSize: '15px', color: '#1B3A8C', letterSpacing: '-0.01em', lineHeight: 1.1 }}>ASCEND</span>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '2px' }}>
                    {role === 'admin' ? 'Administration' : role === 'coach' ? 'Coaching Portal' : 'Student Portal'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User card */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ height: '38px', width: '38px', background: '#EEF2FF', color: '#1B3A8C', borderRadius: '50%', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', textTransform: 'uppercase', border: '2px solid #C7D2FE', flexShrink: 0 }}>
                  {username.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '10px', fontWeight: 600, color: '#1B3A8C', textTransform: 'uppercase', letterSpacing: '0.07em', background: '#EEF2FF', borderRadius: '999px', padding: '1px 8px', marginTop: '2px' }}>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as Tab); setSidebarOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 600,
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: isActive ? '#1B3A8C' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      boxShadow: isActive ? '0 2px 12px rgba(27,58,140,0.18)' : 'none',
                    }}
                  >
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0', flexShrink: 0 }}>
              <button
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: '#FEF2F2', border: 'none', cursor: 'pointer', color: '#dc2626' }}
              >
                <LogOut size={16} style={{ flexShrink: 0 }} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}


      <main className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header
          className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 sm:px-7 shrink-0"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              className="lg:hidden"
            >
              <Menu size={22} />
            </button>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize', letterSpacing: '-0.01em', margin: 0 }}>
                {activeTab.replace(/_/g, ' ')}
              </h2>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, background: '#EEF2FF', color: '#1B3A8C', padding: '5px 12px', borderRadius: '999px', border: '1px solid #C7D2FE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {role} portal
            </span>
            <div style={{ width: '34px', height: '34px', background: '#1B3A8C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.02em', flexShrink: 0 }}>
              {username.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-7" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>

          {/* ── Inline notification banner ───────────────────────────────── */}
          <AnimatePresence>
            {notif && (
              <motion.div
                key="notif"
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  boxShadow: notif.type === 'success'
                    ? '0 4px 20px rgba(16,185,129,0.18)'
                    : '0 4px 20px rgba(239,68,68,0.18)',
                  background: notif.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${notif.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                  color: notif.type === 'success' ? '#15803d' : '#dc2626',
                }}
              >
                {notif.type === 'success'
                  ? <CheckCircle2 size={17} style={{ flexShrink: 0 }} />
                  : <XCircle size={17} style={{ flexShrink: 0 }} />}
                <span style={{ flex: 1 }}>{notif.msg}</span>
                <button
                  onClick={() => setNotif(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.5, display: 'flex', alignItems: 'center', padding: '2px' }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* ──────────────────────────────────────────────────────────────── */}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ========================================================================= */}
              {/* DASHBOARD TAB */}
              {/* ========================================================================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Welcome hero banner */}
                  <div
                    className="rounded-2xl text-white relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #0d2260 0%, #1B3A8C 55%, #2a56cc 100%)',
                      padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)',
                      boxShadow: '0 8px 40px rgba(27,58,140,0.28)',
                    }}
                  >
                    {/* Decorative grid */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
                    {/* Accent orb */}
                    <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: '6px' }}>
                        {role === 'admin' ? 'Administration' : role === 'coach' ? 'Coaching Portal' : 'Student Portal'}
                      </p>
                      <h3 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                        Welcome back, {username}!
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontWeight: 500, maxWidth: '480px', lineHeight: 1.6, margin: 0 }}>
                        Manage your profile, keep track of classes, deadlines, and notifications seamlessly.
                      </p>
                    </div>
                  </div>

                  {/* Role Specific Stats */}
                  {role === 'student' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { label: 'Total Fee Paid', value: `₹${totalPaid.toLocaleString('en-IN')}`, sub: `Pending: ₹${pendingFees.toLocaleString('en-IN')}`, color: '#10b981', bg: '#F0FDF4', border: '#D1FAE5' },
                        { label: 'Attendance Rate', value: `${attendanceStats?.percentage || 0}%`, sub: `Classes checked: ${attendanceStats?.total || 0}`, color: '#1B3A8C', bg: '#EEF2FF', border: '#C7D2FE' },
                        { label: 'Assigned Coach', value: studentDetails?.coach?.name || 'Assigned soon', sub: studentDetails?.coach?.specialty || 'General Training', color: '#0f172a', bg: '#F8FAFC', border: '#E2E8F0' },
                      ].map((stat) => (
                        <div key={stat.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</span>
                          <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</span>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {role === 'coach' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { label: 'Assigned Students', value: dashboardData.totalStudents || 0, color: '#1B3A8C' },
                        { label: 'Pending Student Payments', value: dashboardData.pendingPayments || 0, color: '#d97706' },
                        { label: 'Today — Present', value: `${dashboardData.todayAttendance?.presentCount || 0} Students`, color: '#10b981' },
                      ].map((stat) => (
                        <div key={stat.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</span>
                          <span style={{ display: 'block', fontSize: '24px', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {role === 'admin' && dashboardData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                      {[
                        { label: 'Total Students', value: dashboardData.stats?.totalStudents || 0, color: '#1B3A8C' },
                        { label: 'Total Coaches', value: dashboardData.stats?.totalCoaches || 0, color: '#0f172a' },
                        { label: 'Pending Payments', value: dashboardData.stats?.pendingPayments || 0, color: '#d97706' },
                        { label: 'Fees Collected', value: `₹${(dashboardData.stats?.totalFeesCollected || 0).toLocaleString('en-IN')}`, color: '#10b981' },
                      ].map((stat) => (
                        <div key={stat.label} style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                          <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{stat.label}</span>
                          <span style={{ display: 'block', fontSize: '22px', fontWeight: 800, color: stat.color, letterSpacing: '-0.02em' }}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Notices */}
                  <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '18px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Notices</h4>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Latest updates</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {notices.slice(0, 3).map(n => (
                        <div key={n.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.category === 'urgent' ? '#ef4444' : '#1B3A8C', flexShrink: 0, marginTop: '5px' }} />
                          <div>
                            <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                              {n.title}
                              <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginLeft: '8px' }}>({n.category})</span>
                            </h5>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{n.content}</p>
                          </div>
                        </div>
                      ))}
                      {notices.length === 0 && <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No notices yet.</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* MANAGE ACCOUNTS (ADMIN ONLY) */}
              {/* ========================================================================= */}
              {activeTab === 'manage_accounts' && role === 'admin' && (
                <div className="space-y-6">
                  {/* Password Alert */}
                  {createdCredentialsAlert && (
                    <div className="bg-blue-50 border border-blue-200 text-slate-800 rounded-2xl p-6 space-y-3 font-sans">
                      <div className="flex items-center gap-2 text-[#1B3A8C] font-bold">
                        <CheckCircle2 size={20} />
                        Account Created — Invite Sent!
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        A Supabase invite email has been sent to the user. They will receive a magic link to set their own password.
                      </p>
                      {createdCredentialsAlert.student && (
                        <div className="grid grid-cols-1 gap-4 text-xs font-semibold bg-white p-4 rounded-xl border border-blue-100">
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Generated Student ID</span>
                            <span className="font-mono text-base font-bold text-[#1B3A8C]">{createdCredentialsAlert.student.studentId}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Create Student / Coach Account</h3>

                    {/* Toggle */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-60 mb-6 text-xs font-bold">
                      <button
                        onClick={() => setCreateAccountType('student')}
                        className={`flex-1 py-2 rounded-lg ${createAccountType === 'student' ? 'bg-[#1B3A8C] text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        Student Account
                      </button>
                      <button
                        onClick={() => setCreateAccountType('coach')}
                        className={`flex-1 py-2 rounded-lg ${createAccountType === 'coach' ? 'bg-[#1B3A8C] text-white shadow-sm' : 'text-slate-600'}`}
                      >
                        Coach Account
                      </button>
                    </div>

                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={newAccName}
                            onChange={(e) => setNewAccName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={newAccEmail}
                            onChange={(e) => setNewAccEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number (+91)</label>
                          <input
                            type="text"
                            required
                            value={newAccPhone}
                            onChange={(e) => setNewAccPhone(e.target.value)}
                            placeholder="+91 99999 88888"
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                      </div>

                      {createAccountType === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Assign Coach</label>
                            <select
                              value={newAccCoachId}
                              onChange={(e) => setNewAccCoachId(e.target.value)}
                              className="w-full px-4 py-2 bg-white border rounded-xl"
                            >
                              <option value="">No Coach Assigned</option>
                              {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Academy Tuition Fees (₹)</label>
                            <input
                              type="number"
                              value={newAccTotalFees}
                              onChange={(e) => setNewAccTotalFees(parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-white border rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Uniform kit fees (₹)</label>
                            <input
                              type="number"
                              value={newAccUniformFees}
                              onChange={(e) => setNewAccUniformFees(parseInt(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-white border rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Max Installments</label>
                            <input
                              type="number"
                              max={3}
                              min={1}
                              value={newAccInstallmentsLimit}
                              onChange={(e) => setNewAccInstallmentsLimit(parseInt(e.target.value) || 3)}
                              className="w-full px-4 py-2 bg-white border rounded-xl"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loadingAction === 'create_account'}
                        className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2"
                      >
                        {loadingAction === 'create_account' ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : 'Create & Activate Account'}
                      </button>
                    </form>
                  </div>

                  {/* Student List Grid */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Student Directory & Coach Assignments</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">ID</th>
                            <th className="pb-3">Name</th>
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Assigned Coach</th>
                            <th className="pb-3">Tuition / Uniform Fees</th>
                            <th className="pb-3 text-right">Reassign Coach</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {studentsList.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/50">
                              <td className="py-4 font-mono font-bold text-slate-500 uppercase">{student.studentId}</td>
                              <td className="py-4 font-bold text-slate-900">{student.fullName}</td>
                              <td className="py-4">{student.email}</td>
                              <td className="py-4">{student.coach?.name || 'No Coach assigned'}</td>
                              <td className="py-4">₹{student.totalFees.toLocaleString('en-IN')} / ₹{student.uniformFees.toLocaleString('en-IN')}</td>
                              <td className="py-4 text-right">
                                <select
                                  value={student.primaryCoachId || ''}
                                  onChange={(e) => handleAssignCoach(student.id, e.target.value)}
                                  className="px-2 py-1 bg-slate-50 border rounded-lg text-xs"
                                >
                                  <option value="">Choose Coach</option>
                                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleDeleteStudent(student.id, student.fullName)}
                                  disabled={loadingAction === `delete_student_${student.id}`}
                                  title="Delete student"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                                >
                                  {loadingAction === `delete_student_${student.id}` ? <Loader2 size={12} className="animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>}
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ASSIGNED STUDENTS (COACH ONLY) */}
              {/* ========================================================================= */}
              {activeTab === 'assigned_students' && role === 'coach' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Assigned Students</h3>

                  {/* Select Student for Skill Review */}
                  <div className="mb-6 flex gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Submit skill ratings for student</label>
                      <select
                        value={selectedStudentIdForReview}
                        onChange={(e) => setSelectedStudentIdForReview(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border rounded-xl text-xs w-64"
                      >
                        <option value="">Select Student</option>
                        {dashboardData?.assignedStudents?.map((s: any) => <option key={s.id} value={s.id}>{s.fullName} ({s.studentId})</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      disabled={!selectedStudentIdForReview}
                      className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Award size={14} /> Log Skill Review
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b font-bold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3">ID</th>
                          <th className="pb-3">Name</th>
                          <th className="pb-3">Contact</th>
                          <th className="pb-3">Cricket Role</th>
                          <th className="pb-3">Batch</th>
                          <th className="pb-3">Paid amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {dashboardData?.assignedStudents?.map((student: any) => (
                          <tr key={student.id} className="hover:bg-slate-50/50">
                            <td className="py-4 font-mono font-bold text-slate-500 uppercase">{student.studentId}</td>
                            <td className="py-4 font-bold text-slate-900">{student.fullName}</td>
                            <td className="py-4">{student.phone}</td>
                            <td className="py-4">{student.cricketRole}</td>
                            <td className="py-4">{student.batch}</td>
                            <td className="py-4 text-green-600 font-bold">₹{student.amountPaidTillDate.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PERSONAL DETAILS (STUDENT & COACH) */}
              {/* ========================================================================= */}
              {activeTab === 'personal_detail' && (role === 'student' || role === 'coach') && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  {role === 'student' ? (
                    <form onSubmit={handleUpdateStudentProfile} className="space-y-6">
                      <h4 className="text-lg font-bold text-slate-900 border-b pb-2">Student Profile Information</h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Student ID</span>
                          <span className="text-sm font-extrabold text-slate-700 uppercase">{studentDetails?.studentId}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Assigned Batch</span>
                          <span className="text-sm font-extrabold text-slate-700">{studentDetails?.batch}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Primary Coach</span>
                          <span className="text-sm font-extrabold text-slate-700">{studentDetails?.coach?.name || 'None'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">Uniform Size</span>
                          <span className="text-sm font-extrabold text-slate-700 uppercase">{studentDetails?.uniformSize}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.fullName || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, fullName: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date of Birth</label>
                          <input
                            type="date"
                            value={personalDetailsForm?.dob || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, dob: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Number</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.phone || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, phone: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                          <input
                            type="email"
                            value={personalDetailsForm?.email || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, email: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Father Name</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.fatherName || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, fatherName: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mother Name</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.motherName || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, motherName: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emergency Phone</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.emergencyPhone || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, emergencyPhone: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Blood Group</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.bloodGroup || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, bloodGroup: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cricket Playing Role</label>
                          <select
                            value={personalDetailsForm?.cricketRole || 'All-rounder'}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, cricketRole: e.target.value as any } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          >
                            <option value="Batsman">Batsman</option>
                            <option value="Bowler">Bowler</option>
                            <option value="All-rounder">All-rounder</option>
                            <option value="Wicketkeeper">Wicketkeeper</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Uniform size</label>
                          <select
                            value={personalDetailsForm?.uniformSize || 'M'}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, uniformSize: e.target.value as any } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          >
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Residential Address</label>
                          <textarea
                            value={personalDetailsForm?.address || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, address: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            rows={3}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingAction === 'update_profile'}
                        className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2"
                      >
                        {loadingAction === 'update_profile' ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Personal Details'}
                      </button>
                    </form>
                  ) : (
                    // Coach Profile edit form
                    <form onSubmit={handleUpdateCoachProfile} className="space-y-6">
                      <h4 className="text-lg font-bold text-slate-900 border-b pb-2">Coach Profile Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.name || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, name: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Contact Number</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.phone || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, phone: e.target.value } : null)}
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specialty</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.specialty || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, specialty: e.target.value } : null)}
                            placeholder="e.g. Fast Bowling Technique"
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Experience</label>
                          <input
                            type="text"
                            value={personalDetailsForm?.experience || ''}
                            onChange={(e) => setPersonalDetailsForm((prev: any) => prev ? { ...prev, experience: e.target.value } : null)}
                            placeholder="e.g. 10 Years"
                            className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload Profile Avatar</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'avatar')}
                            className="w-full px-4 py-2 bg-slate-50 border rounded-xl"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingAction === 'update_profile'}
                        className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2"
                      >
                        {loadingAction === 'update_profile' ? <><Loader2 size={13} className="animate-spin" /> Updating...</> : 'Update Profile'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* CALENDAR (COE) TAB */}
              {/* ========================================================================= */}
              {activeTab === 'coe' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Calendar of Events</h4>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Academic calendar schedules</p>
                      </div>
                      {(role === 'admin' || role === 'coach') && (
                        <button
                          onClick={() => setEventModalOpen(true)}
                          className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Add Calendar Event
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="flex gap-4 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="bg-blue-50 text-[#1B3A8C] p-2.5 rounded-xl border border-blue-100 flex flex-col items-center shrink-0 w-12 text-center font-sans">
                            <span className="text-xs font-extrabold">{new Date(event.eventDate).getDate()}</span>
                            <span className="text-[9px] font-bold uppercase">{new Date(event.eventDate).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-slate-900">{event.title}</h5>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${event.category === 'match' ? 'bg-red-50 text-red-600' :
                                  event.category === 'holiday' ? 'bg-amber-50 text-amber-600' :
                                    event.category === 'fee_deadline' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#1B3A8C]'
                                }`}>
                                {event.category.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{event.description}</p>
                            {event.imageUrl && (
                              <img src={event.imageUrl} alt={event.title} className="mt-2 w-full max-h-40 object-cover rounded-xl border border-slate-100" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* NOTICE BOARD TAB */}
              {/* ========================================================================= */}
              {activeTab === 'notice_board' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">Broadcast Notice Board</h4>
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Official announcements</p>
                      </div>
                      {(role === 'admin' || role === 'coach') && (
                        <button
                          onClick={() => setNoticeModalOpen(true)}
                          className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <Plus size={14} /> Add notice
                        </button>
                      )}
                    </div>

                    {notices.length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium text-center py-8">No notices posted yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notices.map((notice) => (
                          <div
                            key={notice.id}
                            className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            {/* Image */}
                            <div className="relative h-48 w-full overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={notice.imageUrl || '/news_net_practice.png'}
                                alt={notice.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              {/* Category badge */}
                              <span className={`absolute top-3 left-3 text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${notice.category === 'urgent' ? 'bg-red-500 text-white' :
                                  notice.category === 'event' ? 'bg-[#1B3A8C] text-white' : 'bg-slate-700 text-white'
                                }`}>
                                {notice.category}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-grow">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(notice.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                {(role === 'admin' || role === 'coach') && (
                                  <button
                                    onClick={() => handleDeleteNotice(notice.id)}
                                    disabled={loadingAction === `delete_notice_${notice.id}`}
                                    className="text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50 p-1 rounded-lg hover:bg-red-50"
                                    title="Delete notice"
                                  >
                                    {loadingAction === `delete_notice_${notice.id}`
                                      ? <Loader2 size={13} className="animate-spin" />
                                      : <Trash2 size={13} />}
                                  </button>
                                )}
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#1B3A8C] transition-colors">
                                {notice.title}
                              </h5>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed whitespace-pre-line flex-grow line-clamp-3">
                                {notice.content}
                              </p>
                            </div>

                            {/* Bottom accent */}
                            <div className={`h-[3px] w-0 group-hover:w-full transition-all duration-500 mt-auto ${notice.category === 'urgent' ? 'bg-red-500' :
                                notice.category === 'event' ? 'bg-[#1B3A8C]' : 'bg-slate-400'
                              }`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}


              {/* ========================================================================= */}
              {/* COACHES LIST */}
              {/* ========================================================================= */}
              {activeTab === 'coaches' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-6">Coaching Staff Directory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {coaches.map((coach) => (
                      <div key={coach.id} className="border rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 bg-blue-100 text-[#1B3A8C] rounded-full font-bold flex items-center justify-center text-base">
                              {coach.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">{coach.name}</h5>
                              <p className="text-[10px] font-bold text-[#1B3A8C] uppercase tracking-wider">{coach.specialty}</p>
                            </div>
                          </div>
                          <div className="space-y-1 bg-white p-3 rounded-xl border text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Experience</span>
                              <span className="text-slate-700 font-bold">{coach.experience || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Academy Rating</span>
                              <span className="text-[#1B3A8C] font-bold">★ {coach.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SKILL REVIEWS */}
              {/* ========================================================================= */}
              {activeTab === 'student_review' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-6">Coaching skill reviews</h4>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map(rev => (
                        <div key={rev.id} className="p-4 bg-slate-50 border rounded-2xl space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Evaluated by Coach {rev.coachName}</span>
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed italic text-sm">&ldquo;{rev.reviewText}&rdquo;</p>
                          <div className="flex gap-4 text-xs font-bold text-[#1B3A8C]">
                            <span>Batting Skill: {rev.battingRating}%</span>
                            <span>Bowling Release: {rev.bowlingRating}%</span>
                            <span>Fitness Agility: {rev.fitnessRating}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium">No reviews logged yet.</p>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* PAYMENT & FEES (STUDENT & ADMIN) */}
              {/* ========================================================================= */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  {role === 'student' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tuition Fee</span>
                        <span className="text-2xl font-extrabold text-[#1B3A8C]">₹{totalFeesCharged.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-[#1B3A8C] uppercase">Uniform Kit Fee</span>
                        <span className="text-2xl font-extrabold text-[#1B3A8C]">₹{uniformFeesCharged.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</span>
                        <span className="text-2xl font-extrabold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Remaining balance</span>
                        <span className="text-2xl font-extrabold text-amber-600">₹{pendingFees.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* Student pay button triggers */}
                  {role === 'student' && pendingFees > 0 && (
                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-5 py-3 rounded-xl uppercase tracking-wider shadow-lg flex items-center gap-1.5"
                    >
                      <CreditCard size={14} /> Submit Payment Proof
                    </button>
                  )}

                  {/* Admin Transaction approvals list */}
                  {role === 'admin' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Awaiting payment approvals</h4>
                      {transactions.filter(t => t.status === 'Pending').length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">All clear! No pending payments.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b font-bold text-slate-400 uppercase tracking-wider">
                                <th className="pb-3">Student Name</th>
                                <th className="pb-3">Fee Type</th>
                                <th className="pb-3">UTR Reference</th>
                                <th className="pb-3">Amount</th>
                                <th className="pb-3 text-center">Receipt</th>
                                <th className="pb-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                              {transactions.filter(t => t.status === 'Pending').map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50/50">
                                  <td className="py-4 font-bold text-slate-900">{tx.studentName}</td>
                                  <td className="py-4 capitalize">{tx.type.replace('_', ' ')}</td>
                                  <td className="py-4 font-mono select-all">{tx.utrNumber}</td>
                                  <td className="py-4 font-bold text-[#1B3A8C]">₹{tx.amount.toLocaleString('en-IN')}</td>
                                  <td className="py-4 text-center font-bold">
                                    {tx.proofUrl ? (
                                      <button
                                        type="button"
                                        onClick={() => setActiveReceiptUrl(tx.proofUrl || null)}
                                        className="text-[#1B3A8C] hover:underline bg-blue-50 px-3 py-1 rounded-xl"
                                      >
                                        Inspect
                                      </button>
                                    ) : (
                                      <span className="text-slate-400 font-normal">None</span>
                                    )}
                                  </td>
                                  <td className="py-4 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleRejectTransaction(tx.id)}
                                        disabled={!!loadingAction}
                                        className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-60 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold"
                                      >
                                        {loadingAction === `reject_${tx.id}` ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />} Reject
                                      </button>
                                      <button
                                        onClick={() => handleApproveTransaction(tx.id)}
                                        disabled={!!loadingAction}
                                        className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 disabled:opacity-60 text-green-600 px-3 py-1.5 rounded-xl text-xs font-bold"
                                      >
                                        {loadingAction === `approve_${tx.id}` ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Transaction History */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">Receipt registry logs</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b font-bold text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">Receipt ID</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Mode</th>
                            <th className="pb-3">UTR reference</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/50">
                              <td className="py-4 font-mono text-slate-500 uppercase">{tx.id}</td>
                              <td className="py-4">{new Date(tx.transactionDatetime).toLocaleDateString()}</td>
                              <td className="py-4 capitalize">{tx.type.replace('_', ' ')}</td>
                              <td className="py-4 uppercase">{tx.mode}</td>
                              <td className="py-4 font-mono select-all">{tx.utrNumber || 'N/A'}</td>
                              <td className="py-4 font-bold text-[#1B3A8C]">₹{tx.amount.toLocaleString('en-IN')}</td>
                              <td className="py-4">
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${tx.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                    tx.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* FEEDBACKS (STUDENT & ADMIN) */}
              {/* ========================================================================= */}
              {activeTab === 'feedback' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {role === 'student' && (
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                      {/* Header */}
                      <div className="px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B3A8C, #2a4eb0)' }}>
                            <span className="text-white text-base">✍️</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">Submit Training Feedback</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Share your experience to help us improve</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <form onSubmit={handleAddFeedback} className="space-y-5">
                          {/* Coach select */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Select Coach</label>
                            <div className="relative">
                              <select
                                value={fbCoach}
                                onChange={e => setFbCoach(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/20 focus:border-[#1B3A8C] transition-all cursor-pointer"
                              >
                                <option value="" disabled>— Select a coach —</option>
                                <option value="">No specific coach</option>
                                {coaches.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                              </div>
                            </div>
                          </div>

                          {/* Star rating */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Rating Score</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFbRating(star)}
                                  className="transition-transform hover:scale-110 focus:outline-none"
                                  title={star === 1 ? 'Poor' : star === 2 ? 'Fair' : star === 3 ? 'Average' : star === 4 ? 'Good' : 'Excellent'}
                                >
                                  <span className="text-2xl" style={{ color: star <= fbRating ? '#f59e0b' : '#e2e8f0' }}>★</span>
                                </button>
                              ))}
                              <span className="ml-2 self-center text-xs font-bold" style={{ color: fbRating >= 4 ? '#10b981' : fbRating === 3 ? '#f59e0b' : '#ef4444' }}>
                                {fbRating === 5 ? 'Excellent' : fbRating === 4 ? 'Good' : fbRating === 3 ? 'Average' : fbRating === 2 ? 'Fair' : 'Poor'} ({fbRating}/5)
                              </span>
                            </div>
                          </div>

                          {/* Comments textarea */}
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Constructive Feedback</label>
                            <textarea
                              value={fbComments}
                              onChange={e => setFbComments(e.target.value)}
                              required
                              rows={4}
                              placeholder="Share what went well, what could be improved, or any suggestions for the coaching staff..."
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B3A8C]/20 focus:border-[#1B3A8C] transition-all resize-none"
                            />
                          </div>

                          {/* Submit */}
                          <button
                            type="submit"
                            disabled={loadingAction === 'add_feedback' || !fbComments.trim()}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #1B3A8C 0%, #2a4eb0 100%)', boxShadow: '0 4px 16px rgba(27,58,140,0.25)' }}
                          >
                            {loadingAction === 'add_feedback'
                              ? <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                              : <><span>Submit Feedback</span><span>→</span></>}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Feedback Records */}
                  <div className={`bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm ${role === 'admin' ? 'md:col-span-2' : ''}`}>
                    <div className="px-6 py-5 border-b border-slate-100" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 100%)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B3A8C, #2a4eb0)' }}>
                          <span className="text-white text-base">💬</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">Feedback Records</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{feedbacks.length} {feedbacks.length === 1 ? 'entry' : 'entries'} submitted</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {feedbacks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <span className="text-4xl mb-3">💬</span>
                          <p className="text-sm font-semibold text-slate-500">No feedback submitted yet</p>
                          <p className="text-xs text-slate-400 mt-1">Be the first to share your experience</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {feedbacks.map(fb => (
                            <div key={fb.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                              <div className="flex items-start justify-between gap-3">
                                {/* Avatar + info */}
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #1B3A8C, #2a4eb0)' }}
                                  >
                                    {fb.studentName?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-800">{fb.studentName}</p>
                                    {fb.coachName && (
                                      <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        {fb.coachName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {/* Stars */}
                                <div className="flex flex-col items-end shrink-0">
                                  <span className="text-amber-400 text-sm tracking-tight">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-slate-600 italic leading-relaxed border-l-2 border-indigo-200 pl-3">&ldquo;{fb.comments}&rdquo;</p>
                              {role === 'admin' && (
                                <button
                                  onClick={() => handleToggleTestimonial(fb.id, !fb.isTestimonial)}
                                  disabled={loadingAction === `testimonial_${fb.id}`}
                                  className={`mt-3 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-60 ${fb.isTestimonial
                                      ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                    }`}
                                >
                                  {loadingAction === `testimonial_${fb.id}` ? <Loader2 size={10} className="animate-spin" /> : <span>{fb.isTestimonial ? '✓' : '+'}</span>}
                                  {fb.isTestimonial ? 'Featured as Testimonial' : 'Feature as Testimonial'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ACHIEVEMENTS (STUDENT ONLY) */}
              {/* ========================================================================= */}
              {activeTab === 'achievements' && role === 'student' && (
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between border-b pb-2 mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Personal achievements registry</h4>
                      <button
                        onClick={() => setAchModalOpen(true)}
                        className="bg-[#1B3A8C] text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus size={14} /> Submit achievement
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {achievements.map((ach) => (
                        <div key={ach.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex flex-col justify-between">
                          <div>
                            {ach.imageUrl && (
                              <img src={ach.imageUrl} alt={ach.title} className="h-40 w-full object-cover rounded-xl mb-3 border border-slate-200" />
                            )}
                            <h5 className="font-bold text-slate-800 text-sm">{ach.title}</h5>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{ach.description}</p>
                            {ach.date && (
                              <span className="block text-[10px] text-slate-400 font-bold uppercase mt-2">Date: {new Date(ach.date).toLocaleDateString()}</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteAchievement(ach.id)}
                            disabled={loadingAction === `delete_ach_${ach.id}`}
                            className="text-red-500 hover:text-red-700 disabled:opacity-60 flex items-center justify-center gap-1.5 border border-red-100 bg-red-50 hover:bg-red-100 py-2 rounded-xl mt-4 text-xs font-bold w-full uppercase"
                          >
                            {loadingAction === `delete_ach_${ach.id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Remove achievement
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* ATTENDANCE TAB */}
              {/* ========================================================================= */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {/* Student View own attendance */}
                  {role === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Attendance records</h4>
                        <div className="space-y-3">
                          {attendanceRecords.map((rec) => (
                            <div key={rec.id} className="flex justify-between items-center p-3.5 bg-slate-50 border rounded-xl font-sans text-xs">
                              <div>
                                <span className="font-bold block text-slate-800">{new Date(rec.date).toLocaleDateString()}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{rec.event?.title || 'General practice session'}</span>
                              </div>
                              <span className={`font-bold px-3 py-1 rounded-xl uppercase text-[10px] tracking-wider ${rec.isPresent ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {rec.isPresent ? 'Present' : 'Absent'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-72 flex flex-col justify-between">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Summary rating</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between font-bold text-xs text-slate-700">
                            <span>Attendance percentage</span>
                            <span>{attendanceStats?.percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${attendanceStats?.percentage || 0}%` }} />
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold pt-4">
                            <div className="bg-slate-50 p-2.5 rounded-xl">
                              <span className="text-slate-400 block font-bold text-[10px]">CLASSES</span>
                              <span className="text-slate-800 font-extrabold">{attendanceStats?.total || 0}</span>
                            </div>
                            <div className="bg-green-50/50 p-2.5 rounded-xl text-green-600">
                              <span className="text-green-500 block font-bold text-[10px]">PRESENT</span>
                              <span className="font-extrabold">{attendanceStats?.present || 0}</span>
                            </div>
                            <div className="bg-red-50/50 p-2.5 rounded-xl text-red-600">
                              <span className="text-red-500 block font-bold text-[10px]">ABSENT</span>
                              <span className="font-extrabold">{attendanceStats?.absent || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coach / Admin mark student attendance */}
                  {(role === 'coach' || role === 'admin') && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Mark student attendance</h4>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Scheduled class registers</p>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="px-4 py-2 bg-slate-50 border rounded-xl text-xs"
                          />
                          <button
                            onClick={handleSaveStudentAttendance}
                            disabled={loadingAction === 'save_attendance'}
                            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                          >
                            {loadingAction === 'save_attendance' ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : 'Save Attendance'}
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                          <thead>
                            <tr className="border-b font-bold text-slate-400 uppercase tracking-wider">
                              <th className="pb-3">Student Name</th>
                              <th className="pb-3">Display ID</th>
                              <th className="pb-3 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {attendanceStudents.map((s: any) => (
                              <tr key={s.studentId} className="hover:bg-slate-50/50">
                                <td className="py-4 font-bold text-slate-900">{s.fullName}</td>
                                <td className="py-4 font-mono text-slate-500 uppercase">{s.studentDisplayId}</td>
                                <td className="py-4 text-center">
                                  <button
                                    onClick={() => handleToggleStudentAttendance(s.studentId)}
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${s.attendance?.isPresent
                                        ? 'bg-green-50 text-green-600 border border-green-200'
                                        : 'bg-red-50 text-red-600 border border-red-200'
                                      }`}
                                  >
                                    {s.attendance?.isPresent ? 'Present' : 'Absent'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* CONTACT SUPPORT */}
              {/* ========================================================================= */}
              {activeTab === 'contact' && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
                  <h4 className="text-lg font-bold text-slate-900 border-b pb-2">Support Helpline Desk</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-2xl bg-slate-50">
                      <Phone className="text-[#1B3A8C]" size={24} />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Support Helpline</span>
                        <a href="tel:+919876543210" className="text-sm font-extrabold text-slate-800">+91 98765 43210</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 border rounded-2xl bg-slate-50">
                      <Mail className="text-[#1B3A8C]" size={24} />
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Support Email</span>
                        <a href="mailto:admin@ascendcricketacademy.com" className="text-sm font-extrabold text-slate-800">admin@ascendcricketacademy.com</a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* DIALOG MODALS & OVERLAYS */}
      {/* ========================================================================= */}

      {/* 1. Payment Wizard Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Academy Fee Payment Proof Submission</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Installment Type</label>
                <select value={payType} onChange={(e) => setPayType(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                  <option value="academy_fees">Academy Tuition Fees</option>
                  <option value="uniform_fees">Uniform Kit Fees</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Mode</label>
                <select value={payMode} onChange={(e) => setPayMode(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border rounded-xl">
                  <option value="UPI">UPI Reference</option>
                  <option value="Bank_Transfer">Direct Bank Transfer</option>
                  <option value="Cash">Cash Handover</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">UTR Reference Code / Receipt No.</label>
                <input
                  type="text"
                  placeholder="12-digit transaction number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Date & Time</label>
                <input
                  type="datetime-local"
                  value={paymentDatetime}
                  onChange={(e) => setPaymentDatetime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Upload payment receipt (Screenshot)</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'proof')} className="w-full p-2 bg-slate-50 border rounded-xl" />
              </div>
              <button onClick={handlePaymentSubmit} disabled={loadingAction === 'payment_submit'} className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl uppercase w-full flex items-center justify-center gap-2">
                {loadingAction === 'payment_submit' ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Submit Payment Proof'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notice Modal */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Broadcast Notice Board Alert</h3>
              <button onClick={() => setNoticeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNotice} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Notice Title</label>
                <input type="text" required value={newNoticeTitle} onChange={e => setNewNoticeTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                <select value={newNoticeCategory} onChange={e => setNewNoticeCategory(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs">
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event / Match</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Audience Scope</label>
                <select value={newNoticeVisibility} onChange={e => setNewNoticeVisibility(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs">
                  <option value="ALL">ALL (Students, Coaches, Website)</option>
                  <option value="SELECTED_STUDENTS">Selected Students Only</option>
                  <option value="SELECTED_COACHES">Selected Coaches Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Detailed Content</label>
                <textarea required rows={4} value={newNoticeContent} onChange={e => setNewNoticeContent(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Attach Image (optional)</label>
                <input
                  type="file" accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setNewNoticeImageFile(f);
                    const reader = new FileReader();
                    reader.onloadend = () => setNewNoticeImageBase64(reader.result as string);
                    reader.readAsDataURL(f);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {newNoticeImageBase64 && (
                  <div className="mt-2 relative inline-block">
                    <img src={newNoticeImageBase64} alt="preview" className="h-20 rounded-lg object-cover border" />
                    <button type="button" onClick={() => { setNewNoticeImageFile(null); setNewNoticeImageBase64(''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loadingAction === 'add_notice'} className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl uppercase w-full flex items-center justify-center gap-2">
                {loadingAction === 'add_notice' ? <><Loader2 size={14} className="animate-spin" /> Broadcasting...</> : 'Broadcast Notice'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Add COE Calendar Schedule</h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Event Title</label>
                <input type="text" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select value={newEventCat} onChange={e => setNewEventCat(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs">
                    <option value="practice">Practice Nets</option>
                    <option value="match">Match Tournament</option>
                    <option value="fee_deadline">Fees deadline</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Event Date</label>
                  <input type="date" required value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description / Location Details</label>
                <textarea rows={3} value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Attach Image (optional)</label>
                <input
                  type="file" accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setNewEventImageFile(f);
                    const reader = new FileReader();
                    reader.onloadend = () => setNewEventImageBase64(reader.result as string);
                    reader.readAsDataURL(f);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {newEventImageBase64 && (
                  <div className="mt-2 relative inline-block">
                    <img src={newEventImageBase64} alt="preview" className="h-20 rounded-lg object-cover border" />
                    <button type="button" onClick={() => { setNewEventImageFile(null); setNewEventImageBase64(''); }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loadingAction === 'add_event'} className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl uppercase w-full flex items-center justify-center gap-2">
                {loadingAction === 'add_event' ? <><Loader2 size={14} className="animate-spin" /> Scheduling...</> : 'Schedule Event'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Coach log review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Log Student Skill Evaluation</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddReview} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs font-bold bg-slate-50 p-4 rounded-xl">
                <div>
                  <span>Batting Skill (0-100)</span>
                  <input type="number" min="0" max="100" value={reviewBatting} onChange={e => setReviewBatting(parseInt(e.target.value) || 0)} className="w-full text-center border p-1 rounded mt-1 bg-white" />
                </div>
                <div>
                  <span>Bowling Release (0-100)</span>
                  <input type="number" min="0" max="100" value={reviewBowling} onChange={e => setReviewBowling(parseInt(e.target.value) || 0)} className="w-full text-center border p-1 rounded mt-1 bg-white" />
                </div>
                <div>
                  <span>Fitness Agility (0-100)</span>
                  <input type="number" min="0" max="100" value={reviewFitness} onChange={e => setReviewFitness(parseInt(e.target.value) || 0)} className="w-full text-center border p-1 rounded mt-1 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Feedback Remarks</label>
                <textarea required rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <button type="submit" disabled={loadingAction === 'add_review'} className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl uppercase w-full flex items-center justify-center gap-2">
                {loadingAction === 'add_review' ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Skill Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Student submit achievement modal */}
      {achModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Submit Achievement</h3>
              <button onClick={() => setAchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Achievement Title</label>
                <input type="text" placeholder="e.g. Century in KSCA Under-16 Tournament" required value={achTitle} onChange={e => setAchTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                <textarea rows={3} value={achDesc} onChange={e => setAchDesc(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date achieved</label>
                  <input type="date" value={achDate} onChange={e => setAchDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Award Image</label>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'achievement')} className="w-full p-2 bg-slate-50 border rounded-xl text-xs" />
                </div>
              </div>
              <button type="submit" disabled={loadingAction === 'add_achievement'} className="bg-[#1B3A8C] hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs py-3 rounded-xl uppercase w-full flex items-center justify-center gap-2">
                {loadingAction === 'add_achievement' ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : 'Submit Achievement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Receipt Lightbox */}
      {activeReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="relative max-w-2xl w-full bg-white p-4 rounded-3xl border shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setActiveReceiptUrl(null)}
              className="absolute top-4 right-4 bg-slate-100 text-slate-800 rounded-full p-2"
            >
              <X size={20} />
            </button>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Inspection: Payment Receipt Proof</h4>
            <div className="border rounded-2xl overflow-hidden max-h-[70vh] w-full flex items-center justify-center bg-slate-50">
              <img src={activeReceiptUrl} alt="Inspection Proof" className="max-h-[70vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
