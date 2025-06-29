// lib/access.ts

// Types for user_type values
export type UserType =
  | 'anonymous'
  | 'basic'
  | 'revision'
  | 'revisionAI'
  | 'teacher'
  | 'teacher_premium';

// User object passed into access functions
export interface User {
  user_type: UserType;
  role?: 'student' | 'teacher' | 'admin';
}

// What each tier can access
interface AccessLimits {
  canCreateClass: boolean;
  maxClasses?: number;
  maxStudentsPerClass?: number;
  canViewAnswers: boolean;
  canUseAI: boolean;
  maxQuestionsPerDay: number;
}

// Centralised access limits
export const userAccessLimits: Record<UserType, AccessLimits> = {
  anonymous: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: 0, // 0 enforced, but you manually allow 1 per topic
  },
  basic: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: 5,
  },
  revision: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
  },
  revisionAI: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
  },

  teacher: {
    canCreateClass: true,
    maxClasses: 1,
    maxStudentsPerClass: 10,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: 5,
  },

  teacher_premium: {
    canCreateClass: true,
    maxClasses: Infinity,
    maxStudentsPerClass: 30,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
  },
};

// === Helper Functions ===

// Access checks
export const canCreateClass = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canCreateClass ?? false;

export const canViewAnswers = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canViewAnswers ?? false;

export const canUseAI = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canUseAI ?? false;

export const getMaxQuestionsPerDay = (user: User): number =>
  userAccessLimits[user.user_type]?.maxQuestionsPerDay ?? 0;

// Class limits
export const getMaxClasses = (user: User): number =>
  userAccessLimits[user.user_type]?.maxClasses ?? 0;

export const getMaxStudentsPerClass = (user: User): number =>
  userAccessLimits[user.user_type]?.maxStudentsPerClass ?? 0;

export const canCreateAnotherClass = (
  user: User,
  currentClassCount: number
): boolean =>
  canCreateClass(user) && currentClassCount < getMaxClasses(user);

export const canAddStudentToClass = (
  user: User,
  currentStudentCount: number
): boolean =>
  getMaxStudentsPerClass(user) > currentStudentCount;
