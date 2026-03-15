export type UserRole = 'admin' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentId?: string;
  photoURL?: string;
}

export interface AttendanceRecord {
  id?: string;
  uid: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  session: 'morning' | 'afternoon';
  status: 'present' | 'absent';
  reason?: string;
  timestamp: string;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string | null;
  text: string;
  timestamp: any;
  type: 'group' | 'private';
}

export interface AppNotification {
  id?: string;
  title: string;
  body: string;
  timestamp: any;
  type: 'all' | 'individual';
  targetUid?: string;
  senderId: string;
}
