// lib/access.ts

// Types for the user_type values
export type UserType =
  | 'basic'
  | 'revision'
  | 'revisionAI'
  | 'teacher_premium';

// The user object as expected by the access helpers
export interface User {
  user_type: UserType;
  // optionally include other common fields if needed:
  // role?: 'student' | 'teacher' | 'admin';
  // id?: string;
}

interface AccessLimits {
  canCreateClass: boolean;
  maxClasses?: number;
  maxStudentsPerClass?: number;
  canViewAnswers: boolean;
  canUseAI: boolean;
}

// Centralised access config
export const userAccessLimits: Record<UserType, AccessLimits> = {
  basic: {
    canCreateClass: true,
    maxClasses: 1,
    maxStudentsPerClass: 5,
    canViewAnswers: false,
    canUseAI: false,
  },
  revision: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: false,
  },
  revisionAI: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: true,
  },
  teacher_premium: {
    canCreateClass: true,
    maxClasses: Infinity,
    maxStudentsPerClass: 30,
    canViewAnswers: true,
    canUseAI: true,
  },
};

// === Helper Functions ===

// Basic feature access
export const canCreateClass = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canCreateClass ?? false;

export const canViewAnswers = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canViewAnswers ?? false;

export const canUseAI = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canUseAI ?? false;

// Limits
export const getMaxClasses = (user: User): number =>
  userAccessLimits[user.user_type]?.maxClasses ?? 0;

export const getMaxStudentsPerClass = (user: User): number =>
  userAccessLimits[user.user_type]?.maxStudentsPerClass ?? 0;

// Combined logic
export const canCreateAnotherClass = (
  user: User,
  currentClassCount: number
): boolean =>
  canCreateClass(user) && currentClassCount < getMaxClasses(user);

export const canAddStudentToClass = (
  user: User,
  currentStudentCount: number
): boolean =>
  userAccessLimits[user.user_type]?.maxStudentsPerClass === undefined
    ? false
    : currentStudentCount < getMaxStudentsPerClass(user);
