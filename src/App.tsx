import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  CheckSquare, 
  MessageCircle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Users,
  Send,
  ChevronRight,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Settings,
  ArrowUpDown,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  where,
  limit,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { format, isWithinInterval, setHours, setMinutes, startOfDay } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-lg',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden', onClick && "cursor-pointer hover:border-blue-200 transition-colors", className)}
  >
    {children}
  </div>
);

const NotificationPopup = ({ notification, onClose }: { notification: any, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] animate-in slide-in-from-top duration-300">
      <Card className="p-4 border-l-4 border-l-blue-600 shadow-2xl bg-white/95 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-blue-600 text-sm flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Thông báo mới
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h5 className="font-bold text-gray-900 text-sm">{notification.title}</h5>
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{notification.body}</p>
      </Card>
    </div>
  );
};

// --- Views ---

const LoginView = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(err => setError(err.message));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để khôi phục mật khẩu');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <CheckSquare className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Lớp 12A12</h1>
          <p className="text-gray-500 text-sm">Hệ thống điểm danh & Trao đổi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
              <label className="block text-xs font-bold text-gray-500 uppercase">Mật khẩu</label>
              {!isRegistering && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold">
            {loading ? 'Đang xử lý...' : (isRegistering ? 'Đăng ký tài khoản' : 'Đăng nhập')}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Hoặc</span>
          </div>
        </div>

        <Button onClick={handleGoogleLogin} variant="outline" className="w-full py-3 rounded-xl flex items-center justify-center gap-2">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
          Google
        </Button>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="ml-1 text-blue-600 font-bold hover:underline"
          >
            {isRegistering ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
          </button>
        </p>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [morningStatus, setMorningStatus] = useState<any>(null);
  const [afternoonStatus, setAfternoonStatus] = useState<any>(null);
  const [showReasonModal, setShowReasonModal] = useState<{ session: 'morning' | 'afternoon' } | null>(null);
  const [reason, setReason] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(collection(db, 'attendance'), where('uid', '==', profile.uid), where('date', '==', today));
    
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(d => d.data());
      setMorningStatus(records.find(r => r.session === 'morning'));
      setAfternoonStatus(records.find(r => r.session === 'afternoon'));
    }, (error) => {
      console.error("Attendance snapshot error:", error);
    });
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(5));
    return onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Notifications snapshot error:", error);
    });
  }, []);

  const handleCheckIn = async (session: 'morning' | 'afternoon', status: 'present' | 'absent', reasonText?: string) => {
    if (!profile) return;
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    
    // Time validation
    if (session === 'morning') {
      const start = setMinutes(setHours(startOfDay(now), 6), 0);
      const end = setMinutes(setHours(startOfDay(now), 9), 0);
      if (!isWithinInterval(now, { start, end })) {
        alert('Đã hết thời gian điểm danh buổi sáng (6:00 - 9:00)');
        return;
      }
    } else {
      const start = setMinutes(setHours(startOfDay(now), 12), 30);
      const end = setMinutes(setHours(startOfDay(now), 14), 0);
      if (!isWithinInterval(now, { start, end })) {
        alert('Đã hết thời gian điểm danh buổi chiều (12:30 - 14:00)');
        return;
      }
    }

    try {
      await addDoc(collection(db, 'attendance'), {
        uid: profile.uid,
        studentName: profile.displayName,
        date: today,
        session,
        status,
        reason: reasonText || '',
        timestamp: now.toISOString()
      });
      setShowReasonModal(null);
      setReason('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Card */}
      <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.displayName}</h2>
            <p className="text-blue-100 text-sm">Lớp 12A12</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium">
              <Clock className="w-3 h-3" />
              Hôm nay: {morningStatus && afternoonStatus ? 'Đã hoàn thành' : 'Chưa điểm danh đủ'}
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Buổi sáng</h3>
                <p className="text-xs text-gray-500">6:00 - 9:00</p>
              </div>
            </div>
            {morningStatus && (
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", morningStatus.status === 'present' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {morningStatus.status === 'present' ? 'Có mặt' : 'Vắng'}
              </span>
            )}
          </div>
          
          {!morningStatus ? (
            <div className="flex gap-2">
              <Button onClick={() => handleCheckIn('morning', 'present')} className="flex-1 bg-green-600 hover:bg-green-700">
                Có mặt
              </Button>
              <Button onClick={() => setShowReasonModal({ session: 'morning' })} variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50">
                Vắng
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Bạn đã điểm danh buổi sáng
            </div>
          )}
        </Card>

        {/* Afternoon */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Buổi chiều</h3>
                <p className="text-xs text-gray-500">12:30 - 14:00</p>
              </div>
            </div>
            {afternoonStatus && (
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold", afternoonStatus.status === 'present' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                {afternoonStatus.status === 'present' ? 'Có mặt' : 'Vắng'}
              </span>
            )}
          </div>
          
          {!afternoonStatus ? (
            <div className="flex gap-2">
              <Button onClick={() => handleCheckIn('afternoon', 'present')} className="flex-1 bg-green-600 hover:bg-green-700">
                Có mặt
              </Button>
              <Button onClick={() => setShowReasonModal({ session: 'afternoon' })} variant="outline" className="flex-1 text-red-600 border-red-100 hover:bg-red-50">
                Vắng
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              Bạn đã điểm danh buổi chiều
            </div>
          )}
        </Card>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            Thông báo mới
          </h3>
        </div>
        {notifications.map((notif) => (
          <Card key={notif.id} className="p-4 border-l-4 border-l-blue-600">
            <h4 className="font-bold text-gray-900 text-sm mb-1">{notif.title}</h4>
            <p className="text-gray-600 text-sm">{notif.body}</p>
            <span className="text-[10px] text-gray-400 mt-2 block">
              {notif.timestamp?.toDate ? format(notif.timestamp.toDate(), 'HH:mm dd/MM') : 'Vừa xong'}
            </span>
          </Card>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm italic">
            Chưa có thông báo nào
          </div>
        )}
      </div>

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Lý do vắng mặt</h3>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do vắng (ví dụ: bị bệnh, có việc gia đình...)"
              className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowReasonModal(null)} variant="ghost" className="flex-1">Hủy</Button>
              <Button 
                onClick={() => handleCheckIn(showReasonModal.session, 'absent', reason)} 
                disabled={!reason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Gửi lý do
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HistoryView = () => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'attendance'),
      where('uid', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(30)
    );

    return onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error("History snapshot error:", error);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Lịch sử điểm danh</h2>
      {loading ? (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-10 text-gray-400 italic">Chưa có dữ liệu lịch sử</div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <Card key={record.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">
                    {format(new Date(record.date), 'dd/MM/yyyy')}
                    {record.timestamp && (
                      <span className="ml-2 text-[10px] font-normal text-gray-400">
                        ({format(new Date(record.timestamp), 'HH:mm')})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">Buổi {record.session === 'morning' ? 'sáng' : 'chiều'}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold",
                    record.status === 'present' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {record.status === 'present' ? 'Có mặt' : 'Vắng'}
                  </span>
                  {record.reason && (
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate">{record.reason}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatView = ({ initialSelectedStudent }: { initialSelectedStudent?: any }) => {
  const { profile, isAdmin } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(initialSelectedStudent || null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (isAdmin) {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      getDocs(q).then(snap => setStudents(snap.docs.map(d => d.data())));
    } else {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'));
      getDocs(q).then(snap => setTeachers(snap.docs.map(d => d.data())));
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!profile?.uid) return;

    let q;
    if (selectedStudent && selectedStudent.uid) {
      // Private chat using participants array
      q = query(
        collection(db, 'messages'),
        where('type', '==', 'private'),
        where('participants', 'array-contains', profile.uid),
        orderBy('timestamp', 'asc'),
        limit(50)
      );
    } else {
      // Group chat
      q = query(
        collection(db, 'messages'),
        where('type', '==', 'group'),
        orderBy('timestamp', 'asc'),
        limit(50)
      );
    }
    
    return onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (selectedStudent && selectedStudent.uid) {
        // Filter for the specific conversation
        docs = docs.filter((m: any) => 
          m.participants?.includes(selectedStudent.uid)
        );
      }
      setMessages(docs);
    }, (error) => {
      console.error("Chat messages snapshot error:", error);
    });
  }, [selectedStudent, profile?.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: profile.uid,
        senderName: profile.displayName,
        receiverId: selectedStudent?.uid || null,
        participants: selectedStudent ? [profile.uid, selectedStudent.uid] : [],
        text: inputText,
        timestamp: serverTimestamp(),
        type: selectedStudent ? 'private' : 'group'
      });
      setInputText('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
      <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold",
            selectedStudent ? "bg-green-600" : "bg-blue-600"
          )}>
            {selectedStudent ? selectedStudent.displayName[0] : "12A"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {selectedStudent ? `Chat với ${selectedStudent.displayName}` : "Nhóm Lớp 12A12"}
            </h3>
            <p className="text-[10px] text-green-500 font-medium">Đang hoạt động</p>
          </div>
        </div>
        {isAdmin ? (
          <select 
            className="text-xs border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0"
            value={selectedStudent?.uid || ""}
            onChange={(e) => {
              const student = students.find(s => s.uid === e.target.value);
              setSelectedStudent(student || null);
            }}
          >
            <option value="">Nhóm lớp</option>
            {students.map(s => (
              <option key={s.uid} value={s.uid}>{s.displayName}</option>
            ))}
          </select>
        ) : (
          <select 
            className="text-xs border-none bg-gray-50 rounded-lg px-2 py-1 focus:ring-0"
            value={selectedStudent?.uid || ""}
            onChange={(e) => {
              if (e.target.value === "") {
                setSelectedStudent(null);
              } else {
                const teacher = teachers.find(t => t.uid === e.target.value);
                setSelectedStudent(teacher || null);
              }
            }}
          >
            <option value="">Nhóm lớp</option>
            {teachers.map(t => (
              <option key={t.uid} value={t.uid}>Giáo viên: {t.displayName}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === profile?.uid;
          const showName = i === 0 || messages[i-1].senderId !== msg.senderId;

          return (
            <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              {showName && !isMe && (
                <span className="text-[10px] text-gray-400 ml-2 mb-1">{msg.senderName}</span>
              )}
              <div className={cn(
                "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-xs italic">
            Chưa có tin nhắn nào
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" className="rounded-xl px-3">
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

const AdminDashboard = ({ onOpenChat }: { onOpenChat: (student: any) => void }) => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ morning: 0, afternoon: 0, total: 39 });
  const [attendance, setAttendance] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [announce, setAnnounce] = useState({ title: '', body: '' });
  
  // Table Customization
  const [showMorning, setShowMorning] = useState(true);
  const [showAfternoon, setShowAfternoon] = useState(true);
  const [showNote, setShowNote] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const q = query(collection(db, 'attendance'), where('date', '==', today));
    
    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setAttendance(records);
      setStats({
        morning: records.filter(r => r.session === 'morning' && r.status === 'present').length,
        afternoon: records.filter(r => r.session === 'afternoon' && r.status === 'present').length,
        total: students.length || 39
      });
    }, (error) => {
      console.error("Admin attendance snapshot error:", error);
    });
  }, [isAdmin, students.length]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    return onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(d => d.data()));
    }, (error) => {
      console.error("Admin students snapshot error:", error);
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      console.error("Admin notifications snapshot error:", error);
    });
  }, [isAdmin]);

  const handleSendAnnouncement = async () => {
    if (!announce.title || !announce.body) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        ...announce,
        timestamp: serverTimestamp(),
        type: 'all',
        senderId: auth.currentUser?.uid
      });
      setShowAnnounceModal(false);
      setAnnounce({ title: '', body: '' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteStudent = async (uid: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      alert('Đã xóa học sinh thành công');
    } catch (error: any) {
      console.error(error);
      alert('Lỗi khi xóa học sinh: ' + (error.message || 'Không có quyền'));
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Xóa thông báo này?')) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      alert('Đã xóa thông báo');
    } catch (error: any) {
      console.error(error);
      alert('Lỗi khi xóa thông báo: ' + (error.message || 'Không có quyền'));
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ thông báo?')) return;
    try {
      const q = query(collection(db, 'notifications'));
      const snap = await getDocs(q);
      const promises = snap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(promises);
      alert('Đã xóa tất cả thông báo');
    } catch (error: any) {
      console.error(error);
      alert('Lỗi khi xóa: ' + error.message);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!confirm('Xóa bản ghi điểm danh này?')) return;
    try {
      await deleteDoc(doc(db, 'attendance', id));
    } catch (error: any) {
      console.error(error);
      alert('Lỗi khi xóa: ' + error.message);
    }
  };

  const handleSeedStudents = async () => {
    const mockNames = [
      'Nguyễn Văn Minh', 'Trần Văn Nam', 'Lê Thị Hoa', 'Phạm Hoàng Anh', 'Đặng Minh Quân',
      'Vũ Thu Hà', 'Bùi Xuân Huấn', 'Ngô Bảo Châu', 'Lý Hải', 'Trương Mỹ Lan',
      'Nguyễn Tất Thành', 'Võ Nguyên Giáp', 'Phan Bội Châu', 'Nguyễn Du', 'Hồ Xuân Hương',
      'Đoàn Thị Điểm', 'Nguyễn Trãi', 'Lê Lợi', 'Trần Hưng Đạo', 'Quang Trung',
      'Nguyễn Huệ', 'Lê Thánh Tông', 'Lý Thái Tổ', 'Đinh Bộ Lĩnh', 'Ngô Quyền',
      'Hai Bà Trưng', 'Bà Triệu', 'Trần Quốc Toản', 'Võ Thị Sáu', 'Nguyễn Văn Trỗi',
      'Kim Đồng', 'Lê Văn Tám', 'Bế Văn Đàn', 'Phan Đình Giót', 'Tô Vĩnh Diện',
      'Cù Chính Lan', 'La Văn Cầu', 'Nguyễn Thị Định', 'Nguyễn Thị Minh Khai'
    ];

    try {
      for (let i = 0; i < mockNames.length; i++) {
        const mockUid = `mock_student_${i}`;
        await setDoc(doc(db, 'users', mockUid), {
          uid: mockUid,
          displayName: mockNames[i],
          email: `student${i}@example.com`,
          role: 'student',
          studentId: `12A12_${i + 1}`
        });
      }
      alert('Đã tạo danh sách 39 học sinh mẫu!');
    } catch (error) {
      console.error(error);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortOrder === 'asc') return a.displayName.localeCompare(b.displayName);
    return b.displayName.localeCompare(a.displayName);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản trị lớp</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="rounded-xl px-3">
            <Settings className="w-5 h-5" />
          </Button>
          {students.length === 0 && (
            <Button onClick={handleSeedStudents} variant="outline" className="rounded-xl">
              Tạo mẫu 39 HS
            </Button>
          )}
          <Button onClick={() => setShowAnnounceModal(true)} className="rounded-xl shadow-lg shadow-blue-100">
            Gửi thông báo
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="p-4 bg-gray-50 border-blue-100 animate-in slide-in-from-top duration-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Tùy chỉnh bảng</h4>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showMorning} onChange={e => setShowMorning(e.target.checked)} className="rounded text-blue-600" />
              Cột Sáng
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showAfternoon} onChange={e => setShowAfternoon(e.target.checked)} className="rounded text-blue-600" />
              Cột Chiều
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={showNote} onChange={e => setShowNote(e.target.checked)} className="rounded text-blue-600" />
              Cột Ghi chú
            </label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs h-8 px-2"
            >
              <ArrowUpDown className="w-3 h-3 mr-1" />
              Tên: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-orange-50 border-orange-100">
          <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Sáng nay</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-orange-700">{stats.morning}</span>
            <span className="text-orange-500 text-sm mb-1">/ {stats.total}</span>
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Chiều nay</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-blue-700">{stats.afternoon}</span>
            <span className="text-blue-500 text-sm mb-1">/ {stats.total}</span>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Danh sách điểm danh</h3>
          <span className="text-[10px] text-gray-400">{format(new Date(), 'dd/MM/yyyy')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Học sinh</th>
                {showMorning && <th className="px-4 py-3 text-center">Sáng</th>}
                {showAfternoon && <th className="px-4 py-3 text-center">Chiều</th>}
                {showNote && <th className="px-4 py-3">Ghi chú</th>}
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedStudents.map((student) => {
                const morning = attendance.find(r => r.uid === student.uid && r.session === 'morning');
                const afternoon = attendance.find(r => r.uid === student.uid && r.session === 'afternoon');
                return (
                  <tr key={student.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{student.displayName}</td>
                    {showMorning && (
                      <td className="px-4 py-3 text-center">
                        {morning ? (
                          <div className="flex flex-col items-center group relative">
                            {morning.status === 'present' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                            {morning.timestamp && (
                              <span className="text-[8px] text-gray-400 mt-0.5">
                                {format(new Date(morning.timestamp), 'HH:mm')}
                              </span>
                            )}
                            <button 
                              onClick={() => handleDeleteAttendance(morning.id)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded-full p-0.5 text-red-400 hover:text-red-600 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : <Clock className="w-4 h-4 text-gray-300 mx-auto" />}
                      </td>
                    )}
                    {showAfternoon && (
                      <td className="px-4 py-3 text-center">
                        {afternoon ? (
                          <div className="flex flex-col items-center group relative">
                            {afternoon.status === 'present' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                            {afternoon.timestamp && (
                              <span className="text-[8px] text-gray-400 mt-0.5">
                                {format(new Date(afternoon.timestamp), 'HH:mm')}
                              </span>
                            )}
                            <button 
                              onClick={() => handleDeleteAttendance(afternoon.id)}
                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-white shadow-sm rounded-full p-0.5 text-red-400 hover:text-red-600 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : <Clock className="w-4 h-4 text-gray-300 mx-auto" />}
                      </td>
                    )}
                    {showNote && (
                      <td className="px-4 py-3 text-[10px] text-gray-500 max-w-[120px] truncate">
                        {morning?.reason || afternoon?.reason || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onOpenChat(student)}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteStudent(student.uid)}
                        className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">
                    Chưa có học sinh nào đăng ký
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Notifications List */}
      <Card>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Thông báo đã gửi</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteAllNotifications}
              className="text-[10px] text-red-500 hover:bg-red-50 h-7 px-2"
            >
              Xóa tất cả
            </Button>
          )}
        </div>
        <div className="divide-y divide-gray-50">
          {notifications.map(n => (
            <div key={n.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-bold text-sm text-gray-900 truncate">{n.title}</h4>
                <p className="text-xs text-gray-500 truncate">{n.body}</p>
                <span className="text-[10px] text-gray-400">
                  {n.timestamp?.toDate ? format(n.timestamp.toDate(), 'HH:mm dd/MM') : 'Đang gửi...'}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteNotification(n.id)}
                className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="p-8 text-center text-gray-400 italic text-sm">
              Chưa có thông báo nào
            </div>
          )}
        </div>
      </Card>

      {/* Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Gửi thông báo lớp</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={announce.title}
                onChange={(e) => setAnnounce({ ...announce, title: e.target.value })}
                placeholder="Tiêu đề thông báo"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <textarea
                value={announce.body}
                onChange={(e) => setAnnounce({ ...announce, body: e.target.value })}
                placeholder="Nội dung chi tiết..."
                className="w-full h-32 p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => setShowAnnounceModal(false)} variant="ghost" className="flex-1">Hủy</Button>
              <Button 
                onClick={handleSendAnnouncement} 
                disabled={!announce.title || !announce.body}
                className="flex-1"
              >
                Gửi ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MainLayout = ({ children, activeTab, setActiveTab }: { children: React.ReactNode, activeTab: string, setActiveTab: (t: string) => void }) => {
  const { profile, isAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: LayoutDashboard },
    { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
    { id: 'history', label: 'Lịch sử', icon: History },
    { id: 'chat', label: 'Tin nhắn', icon: MessageCircle },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Quản trị', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-white/10 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg tracking-tight">LỚP 12A12</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)}>
          <div className="bg-white w-64 h-full p-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-blue-600">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    activeTab === item.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => signOut(auth)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 md:hidden">
        {menuItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              activeTab === item.id ? "text-blue-600" : "text-gray-400"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === 'profile' ? "text-blue-600" : "text-gray-400"
          )}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Tôi</span>
        </button>
      </nav>
    </div>
  );
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activeNotification, setActiveNotification] = useState<any>(null);
  const [selectedStudentForChat, setSelectedStudentForChat] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
    return onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const notif = snapshot.docs[0].data();
        // Only show if it's new (within last 10 seconds)
        const now = new Date().getTime();
        const notifTime = notif.timestamp?.toDate ? notif.timestamp.toDate().getTime() : now;
        if (now - notifTime < 10000) {
          setActiveNotification({ id: snapshot.docs[0].id, ...notif });
        }
      }
    }, (error) => {
      console.error("Global notifications snapshot error:", error);
    });
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-600 font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
      case 'attendance':
        return <StudentDashboard />;
      case 'history':
        return <HistoryView />;
      case 'chat':
        return <ChatView initialSelectedStudent={selectedStudentForChat} />;
      case 'admin':
        if (profile?.role !== 'admin') {
          setActiveTab('home');
          return null;
        }
        return <AdminDashboard onOpenChat={(student) => {
          setSelectedStudentForChat(student);
          setActiveTab('chat');
        }} />;
      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Thông báo</h2>
            <StudentDashboard />
          </div>
        );
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Cá nhân</h2>
            <Card className="p-8 text-center">
              <div className="w-24 h-24 rounded-3xl bg-blue-100 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon className="w-12 h-12 text-blue-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{user.displayName}</h3>
              <p className="text-gray-500 mb-6">{user.email}</p>
              <Button onClick={() => signOut(auth)} variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50">
                Đăng xuất
              </Button>
            </Card>
          </div>
        );
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeNotification && (
        <NotificationPopup 
          notification={activeNotification} 
          onClose={() => setActiveNotification(null)} 
        />
      )}
      {renderContent()}
    </MainLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
