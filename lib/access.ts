// lib/access.ts

  export type UserType =
  | 'anonymous'         // no login
  | 'basic'             // student, free
  | 'revision'          // student, paid
  | 'revisionAI'        // student, premium
  | 'teacherBasic'      // teacher with free access (1 class, 5-10 students)
  | 'teacherPremium'    // paid teacher, multiple classes
  | 'admin';            // internal use only (site owner)

// User object passed into access functions
export interface User {
  user_type: UserType;
  email?: string;
  role?: 'student' | 'teacher' | 'admin';
}

// What each tier can access
interface AccessLimits {
  canCreateClass: boolean;
  maxClasses?: number;
  maxStudentsPerClass?: number;
  canViewAnswers: boolean;
  canUseAI: boolean;
  canAccessFilters: boolean; 
  canSkipQuestions: boolean;
  maxQuestionsPerDay: number;
  maxQuestionsPerTopic: number;
}

// Centralised access limits
export const userAccessLimits: Record<UserType, AccessLimits> = {
  anonymous: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: 0, // 0 enforced, but you manually allow 1 per topic
    maxQuestionsPerTopic: 1,
    canAccessFilters: false,
    canSkipQuestions: false,
  },
  basic: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: 5,
    maxQuestionsPerTopic: 5,
    canAccessFilters: false,
    canSkipQuestions: false,
  },
  revision: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
  },
  revisionAI: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
  },

  teacherBasic: {
    canCreateClass: true,
    maxClasses: 1,
    maxStudentsPerClass: 10,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: 5,
    maxQuestionsPerTopic: 5,
    canAccessFilters: false,
    canSkipQuestions: false,
  },

  teacherPremium: {
    canCreateClass: true,
    maxClasses: Infinity,
    maxStudentsPerClass: 30,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
  },
  admin: {
    canCreateClass: true,
    maxClasses: Infinity,
    maxStudentsPerClass: Infinity,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
  },
};

// === Helper Functions ===

// Access checks
export const canCreateClass = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canCreateClass ?? false;

export const canAccessFilters = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canAccessFilters ?? false;

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

// New helper function for topic question limits
export const getMaxQuestionsPerTopic = (user: User): number =>
  userAccessLimits[user.user_type]?.maxQuestionsPerTopic ?? 5;

export const getAvailableQuestionsForTopic = (
  user: User,
  topicQuestionCount: number
): number => {
  const maxQuestions = getMaxQuestionsPerTopic(user);
  return Math.min(maxQuestions, topicQuestionCount);
};

// New helper function to check if user can skip questions
export const canSkipQuestions = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canSkipQuestions ?? false;
