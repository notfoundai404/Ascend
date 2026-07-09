'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, Shield, CreditCard, Calendar, BookOpen,
  Users, Award, MessageSquare, LogOut, Menu, X, Check, CheckCircle2,
  XCircle, AlertCircle, Plus, Clock, Upload, Eye, MapPin, Phone, Mail,
  FileText, Activity, Trash2, CheckSquare, Edit3
} from 'lucide-react';
import {
  dbService, Profile, StudentDetails, Transaction, Notice,
  CalendarEvent, Coach, StudentReview, Feedback, Achievement
} from '@/lib/dbService';

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
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventCat, setNewEventCat] = useState<'match' | 'practice' | 'holiday' | 'fee_deadline'>('practice');
  const [newEventDate, setNewEventDate] = useState('');
  const [eventModalOpen, setEventModalOpen] = useState(false);

  // Feedback form
  const [fbCoach, setFbCoach] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbComments, setFbComments] = useState('');
  const [fbMessage, setFbMessage] = useState('');

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

  // Authenticate & Load initial data
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

    loadAllData(storedRole);
  }, [router]);

  const loadAllData = async (userRole: 'student' | 'admin' | 'coach') => {
    try {
      setLoading(true);
      // Get role aggregated dashboard details
      const dashboardRes = await dbService.getDashboardData();
      setDashboardData(dashboardRes);

      // Load notices & events (available to all)
      const noticeList = await dbService.getNotices();
      setNotices(noticeList);

      const eventList = await dbService.getEvents();
      setEvents(eventList);

      const coachList = await dbService.getCoaches();
      setCoaches(coachList);

      if (userRole === 'student') {
        // Load student specific profiles & items
        const details = await dbService.getStudentDetails('me');
        setStudentDetails(details);
        setPersonalDetailsForm({ ...details });

        const txRes = await dbService.getTransactions();
        setTransactions(txRes);

        const revs = await dbService.getReviews('me');
        setReviews(revs);

        const fbs = await dbService.getFeedback();
        setFeedbacks(fbs);

        const achs = await dbService.getAchievements();
        setAchievements(achs);

        const att = await dbService.getMyAttendance();
        setAttendanceStats(att.stats);
        setAttendanceRecords(att.records);
      } else if (userRole === 'coach') {
        // Load coach specific profile
        const details = await dbService.getCoachProfile();
        setCoachDetails(details);
        setPersonalDetailsForm({ ...details });

        const students = await dbService.getTodayAttendance();
        setAttendanceStudents(students);
      } else if (userRole === 'admin') {
        const allStudents = await dbService.adminListStudents();
        setStudentsList(allStudents);

        const txRes = await dbService.getTransactions();
        setTransactions(txRes);

        const adminFeedbacks = await dbService.adminListFeedbacks().catch(() => []);
        setFeedbacks(adminFeedbacks);

        const coachAttendanceData = await dbService.getTodayAttendance().catch(() => []);
        setAttendanceStudents(coachAttendanceData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading portal data:', err);
      setLoading(false);
    }
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
    try {
      const { dob, fatherName, motherName, fatherPhone, motherPhone, fatherEmail, motherEmail, emergencyPhone, address, bloodGroup, cricketRole, uniformSize, batch } = personalDetailsForm;
      const updated = await dbService.updateStudentDetails({
        dob, fatherName, motherName, fatherPhone, motherPhone, fatherEmail, motherEmail, emergencyPhone, address, bloodGroup, cricketRole, uniformSize, batch
      });
      setStudentDetails(updated);
      alert('Personal details saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update details.');
    }
  };

  // Coach updates own profile
  const handleUpdateCoachProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalDetailsForm) return;
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
      
      alert('Profile updated successfully!');
      loadAllData('coach');
    } catch (err: any) {
      alert(err.message || 'Failed to update coach profile.');
    }
  };

  // Submit Payment Proof (Student)
  const handlePaymentSubmit = async () => {
    if (!utrNumber || !paymentDatetime) {
      alert('Please fill out the UTR reference and payment date/time.');
      return;
    }

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
      alert('Payment submitted! Awaiting Admin approval.');
      loadAllData('student');
    } catch (err: any) {
      alert(err.message || 'Error submitting payment.');
    }
  };

  // Approve payment (Admin)
  const handleApproveTransaction = async (txId: string) => {
    try {
      await dbService.updateTransactionStatus(txId, 'Approved', userId);
      alert('Payment approved!');
      loadAllData('admin');
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  // Reject payment (Admin)
  const handleRejectTransaction = async (txId: string) => {
    try {
      await dbService.updateTransactionStatus(txId, 'Rejected', userId);
      alert('Payment rejected.');
      loadAllData('admin');
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  // Create notice (Admin/Coach)
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent) return;

    try {
      await dbService.addNotice({
        title: newNoticeTitle,
        content: newNoticeContent,
        category: newNoticeCategory,
        visibility: newNoticeVisibility,
      });
      setNewNoticeTitle('');
      setNewNoticeContent('');
      setNoticeModalOpen(false);
      alert('Notice broadcasted successfully!');
      loadAllData(role!);
    } catch (err: any) {
      alert(err.message || 'Notice addition failed.');
    }
  };

  // Create calendar event (Admin/Coach)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    try {
      await dbService.addEvent({
        title: newEventTitle,
        description: newEventDesc,
        category: newEventCat,
        eventDate: new Date(newEventDate).toISOString(),
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setEventModalOpen(false);
      alert('Calendar event scheduled successfully!');
      loadAllData(role!);
    } catch (err: any) {
      alert(err.message || 'Event addition failed.');
    }
  };

  // Submit Feedback (Student)
  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbComments) return;
    try {
      await dbService.addFeedback({
        coachName: fbCoach || 'Academy Infrastructure',
        rating: fbRating,
        comments: fbComments,
      });
      setFbCoach('');
      setFbRating(5);
      setFbComments('');
      setFbMessage('Thank you! Your feedback has been registered.');
      setTimeout(() => setFbMessage(''), 4000);
      loadAllData('student');
    } catch (err: any) {
      alert(err.message || 'Feedback submission failed.');
    }
  };

  // Submit Achievement (Student)
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle) return;

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
      alert('Achievement uploaded successfully!');
      loadAllData('student');
    } catch (err: any) {
      alert(err.message || 'Failed to upload achievement.');
    }
  };

  // Delete Achievement (Student)
  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await dbService.deleteAchievement(id);
      alert('Achievement deleted.');
      loadAllData('student');
    } catch (err: any) {
      alert(err.message || 'Failed to delete achievement.');
    }
  };

  // Log Performance Review (Coach)
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentIdForReview) {
      alert('Please select a student.');
      return;
    }
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
      alert('Performance review logged!');
      loadAllData(role!);
    } catch (err: any) {
      alert(err.message || 'Failed to log review.');
    }
  };

  // Toggle testimonial (Admin)
  const handleToggleTestimonial = async (fbId: string, isTestimonial: boolean) => {
    try {
      await dbService.adminToggleTestimonial(fbId, isTestimonial);
      alert(`Testimonial status updated.`);
      loadAllData('admin');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  // Create accounts (Admin)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatedCredentialsAlert(null);

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
        alert('Student account created successfully!');
      } else {
        const res = await dbService.adminCreateCoach({
          name: newAccName,
          email: newAccEmail,
          phone: newAccPhone,
        });
        setCreatedCredentialsAlert(res);
        alert('Coach account created successfully!');
      }

      setNewAccName('');
      setNewAccEmail('');
      setNewAccPhone('');
      setNewAccCoachId('');
      loadAllData('admin');
    } catch (err: any) {
      alert(err.message || 'Failed to create account.');
    }
  };

  // Assign Student Coach (Admin)
  const handleAssignCoach = async (studentId: string, coachId: string) => {
    try {
      await dbService.adminAssignCoach(studentId, coachId);
      alert('Coach assigned successfully!');
      loadAllData('admin');
    } catch (err: any) {
      alert(err.message || 'Failed to assign coach.');
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
    try {
      const records = attendanceStudents.map(s => ({
        studentId: s.studentId,
        isPresent: s.attendance?.isPresent || false,
        notes: s.attendance?.notes || ''
      }));

      await dbService.markStudentAttendance(attendanceDate, records);
      alert('Attendance saved successfully!');
      loadAllData(role!);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-[#1B3A8C]/20 border-t-[#1B3A8C] rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading ERP Portal...</p>
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
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="bg-[#1B3A8C] text-white p-2 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <span className="font-condensed text-2xl font-bold tracking-wide uppercase text-[#1B3A8C] leading-none" style={{ fontFamily: '"League Gothic", sans-serif' }}>
              ASCEND
            </span>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {role === 'admin' ? 'Administration' : role === 'coach' ? 'Coaching Portal' : 'Student Portal'}
            </span>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 text-[#1B3A8C] rounded-full font-bold flex items-center justify-center text-sm uppercase">
              {username.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-bold text-slate-900 truncate">{username}</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {role}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                  activeTab === item.id
                    ? 'bg-[#1B3A8C] text-white shadow-lg shadow-blue-900/10'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight capitalize font-sans">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold bg-blue-50 text-[#1B3A8C] px-3.5 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5 uppercase font-sans">
              {role} portal
            </span>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
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
                  <div className="bg-gradient-to-r from-[#1B3A8C] to-blue-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
                    <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      Welcome Back, {username}!
                    </h3>
                    <p className="text-blue-100 text-sm mt-1 max-w-xl font-medium">
                      Manage your profile, keep track of classes, deadlines, and notifications seamlessly.
                    </p>
                  </div>

                  {/* Role Specific Stats */}
                  {role === 'student' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Fee Paid</span>
                        <span className="text-2xl font-extrabold text-green-600">₹{totalPaid.toLocaleString('en-IN')}</span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">Pending: ₹{pendingFees.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Attendance Rate</span>
                        <span className="text-2xl font-extrabold text-blue-600">{attendanceStats?.percentage || 0}%</span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">Classes Checked: {attendanceStats?.total || 0}</p>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Coach</span>
                        <span className="text-lg font-extrabold text-slate-800">{studentDetails?.coach?.name || 'Assigned soon'}</span>
                        <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase">{studentDetails?.coach?.specialty || 'General Training'}</p>
                      </div>
                    </div>
                  )}

                  {role === 'coach' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Students</span>
                        <span className="text-2xl font-extrabold text-blue-600">{dashboardData.totalStudents || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending student payments</span>
                        <span className="text-2xl font-extrabold text-amber-600">{dashboardData.pendingPayments || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Today marked attendance</span>
                        <span className="text-2xl font-extrabold text-green-600">{dashboardData.todayAttendance?.presentCount || 0} Present</span>
                      </div>
                    </div>
                  )}

                  {role === 'admin' && dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Students</span>
                        <span className="text-2xl font-extrabold text-slate-800">{dashboardData.stats?.totalStudents || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Coaches</span>
                        <span className="text-2xl font-extrabold text-slate-800">{dashboardData.stats?.totalCoaches || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending Payments</span>
                        <span className="text-2xl font-extrabold text-amber-600">{dashboardData.stats?.pendingPayments || 0}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Fees Collected</span>
                        <span className="text-2xl font-extrabold text-green-600">₹{(dashboardData.stats?.totalFeesCollected || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* Notices Overview */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-base font-bold text-slate-800 mb-4 border-b pb-2">Recent notices</h4>
                    <div className="space-y-4">
                      {notices.slice(0, 3).map(n => (
                        <div key={n.id} className="flex gap-4 items-start">
                          <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${n.category === 'urgent' ? 'bg-red-500' : 'bg-blue-600'}`} />
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{n.title} <span className="text-[10px] uppercase font-bold text-slate-400">({n.category})</span></h5>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.content}</p>
                          </div>
                        </div>
                      ))}
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
                        Account Activated! Reference Details Below:
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        The account has been stored securely in the database. An activation email has been automatically generated and triggered via nodemailer/staging to the user.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-white p-4 rounded-xl border border-blue-100">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Temp Password (Plaintext reference)</span>
                          <span className="font-mono text-base font-bold text-[#1B3A8C]">{createdCredentialsAlert.tempPassword}</span>
                        </div>
                        {createdCredentialsAlert.student && (
                          <div>
                            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">Generated Student ID</span>
                            <span className="font-mono text-base font-bold text-[#1B3A8C]">{createdCredentialsAlert.student.studentId}</span>
                          </div>
                        )}
                      </div>
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
                        className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider"
                      >
                        Create & Activate Account
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
                        className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider"
                      >
                        Save Personal Details
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
                        className="bg-[#1B3A8C] hover:bg-blue-800 text-white font-bold text-xs px-6 py-3 rounded-xl uppercase tracking-wider"
                      >
                        Update Profile
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
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                event.category === 'match' ? 'bg-red-50 text-red-600' :
                                event.category === 'holiday' ? 'bg-amber-50 text-amber-600' :
                                event.category === 'fee_deadline' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-[#1B3A8C]'
                              }`}>
                                {event.category.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{event.description}</p>
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

                    <div className="space-y-6">
                      {notices.map((notice) => (
                        <div key={notice.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl relative overflow-hidden transition-all hover:bg-slate-50">
                          <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${
                            notice.category === 'urgent' ? 'bg-red-500' :
                            notice.category === 'event' ? 'bg-blue-600' : 'bg-slate-400'
                          }`} />

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                                notice.category === 'urgent' ? 'bg-red-100 text-red-600' :
                                notice.category === 'event' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {notice.category}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                {new Date(notice.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          
                          <h4 className="text-base font-bold text-slate-900 mb-2">{notice.title}</h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">{notice.content}</p>
                        </div>
                      ))}
                    </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tuition Fee</span>
                        <span className="text-2xl font-extrabold">₹{totalFeesCharged.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-28">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Uniform Kit Fee</span>
                        <span className="text-2xl font-extrabold">₹{uniformFeesCharged.toLocaleString('en-IN')}</span>
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
                                        className="bg-red-50 text-red-600 p-2 rounded-xl"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        onClick={() => handleApproveTransaction(tx.id)}
                                        className="bg-green-50 text-green-600 p-2 rounded-xl"
                                      >
                                        Approve
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
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                  tx.status === 'Approved' ? 'bg-green-50 text-green-600' :
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Submit training feedback</h4>
                      {fbMessage && <p className="text-green-600 text-xs font-bold mb-3">{fbMessage}</p>}
                      <form onSubmit={handleAddFeedback} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Select Coach</label>
                          <select value={fbCoach} onChange={e => setFbCoach(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs">
                            <option value="">General Academy Infrastructure</option>
                            {coaches.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Rating Score</label>
                          <select value={fbRating} onChange={e => setFbRating(parseInt(e.target.value))} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs">
                            <option value={5}>★★★★★ Excellent (5/5)</option>
                            <option value={4}>★★★★☆ Good (4/5)</option>
                            <option value={3}>★★★☆☆ Average (3/5)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Constructive feedback</label>
                          <textarea
                            value={fbComments}
                            onChange={e => setFbComments(e.target.value)}
                            required
                            rows={3}
                            className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                          />
                        </div>
                        <button type="submit" className="bg-[#1B3A8C] text-white font-bold text-xs px-4 py-2.5 rounded-xl uppercase">Submit</button>
                      </form>
                    </div>
                  )}

                  <div className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm ${role === 'admin' ? 'col-span-2' : ''}`}>
                    <h4 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Constructive feedback records</h4>
                    <div className="space-y-4">
                      {feedbacks.map(fb => (
                        <div key={fb.id} className="p-4 bg-slate-50 rounded-2xl border flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between font-bold text-xs mb-1">
                              <span>{fb.studentName} ({fb.coachName})</span>
                              <span className="text-amber-500">{'★'.repeat(fb.rating)}</span>
                            </div>
                            <p className="text-xs text-slate-600 italic font-semibold">&ldquo;{fb.comments}&rdquo;</p>
                          </div>
                          {role === 'admin' && (
                            <button
                              onClick={() => handleToggleTestimonial(fb.id, !fb.isTestimonial)}
                              className={`mt-2 self-start px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                fb.isTestimonial ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-slate-100 text-slate-600 border'
                              }`}
                            >
                              {fb.isTestimonial ? 'Displayed as Testimonial' : 'Promote to Testimonial'}
                            </button>
                          )}
                        </div>
                      ))}
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
                            className="text-red-500 hover:text-red-700 flex items-center justify-center gap-1.5 border border-red-100 bg-red-50 hover:bg-red-100 py-2 rounded-xl mt-4 text-xs font-bold w-full uppercase"
                          >
                            <Trash2 size={12} /> Remove achievement
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
                              <span className={`font-bold px-3 py-1 rounded-xl uppercase text-[10px] tracking-wider ${
                                rec.isPresent ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
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
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5"
                          >
                            Save Attendance
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
                                    className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                                      s.attendance?.isPresent
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
                        <a href="mailto:support@ascendcricket.in" className="text-sm font-extrabold text-slate-800">support@ascendcricket.in</a>
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
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Academy Fee Payment Proof Submission</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
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
              <button onClick={handlePaymentSubmit} className="bg-[#1B3A8C] text-white font-bold text-xs py-3 rounded-xl uppercase w-full">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Notice Modal */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Broadcast Notice Board Alert</h3>
              <button onClick={() => setNoticeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNotice} className="p-6 space-y-4">
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
              <button type="submit" className="bg-[#1B3A8C] text-white font-bold text-xs py-3 rounded-xl uppercase w-full">Broadcast Notice</button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Event Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add COE Calendar Schedule</h3>
              <button onClick={() => setEventModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Event Title</label>
                <input type="text" required value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              <button type="submit" className="bg-[#1B3A8C] text-white font-bold text-xs py-3 rounded-xl uppercase w-full">Schedule Event</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Coach log review modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Log Student Skill Evaluation</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddReview} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold bg-slate-50 p-4 rounded-xl">
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
              <button type="submit" className="bg-[#1B3A8C] text-white font-bold text-xs py-3 rounded-xl uppercase w-full">Save skill review</button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Student submit achievement modal */}
      {achModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Submit Achievement</h3>
              <button onClick={() => setAchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAchievement} className="p-6 space-y-4">
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
              <button type="submit" className="bg-[#1B3A8C] text-white font-bold text-xs py-3 rounded-xl uppercase w-full">Submit achievement</button>
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
