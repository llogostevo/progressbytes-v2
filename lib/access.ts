// lib/access.ts

  export type UserType =
  | 'anonymous'         // no login
  | 'basic'             // student, free
  | 'revision'          // student, paid
  | 'revisionAI'        // student, premium
  | 'teacherBasic'      // teacher with free access (1 class, 5-10 students)
  | 'teacherPlan'       // teacher with paid access (1 class, 10 students)
  | 'teacherPremium'    // paid teacher, multiple classes
  | 'admin';            // internal use only (site owner)

// User object passed into access functions
export interface User {
  user_type: UserType;
  email?: string;
  role?: 'regular' | 'admin';
  ai_interest_banner?: boolean;
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
  canAccessAnalytics: boolean;

}

// Centralised access limits 
// TODO: need to ensure these are in the DB and eventaually we can remove this section
export const userAccessLimits: Record<UserType, AccessLimits> = {
  anonymous: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: Infinity, 
    maxQuestionsPerTopic: 1,
    canAccessFilters: false,
    canSkipQuestions: false,
    canAccessAnalytics: false,
  },
  basic: {
    canCreateClass: false,
    canViewAnswers: false,
    canUseAI: false,
    maxQuestionsPerDay: 5,
    maxQuestionsPerTopic: 5,
    canAccessFilters: false,
    canSkipQuestions: false,
    canAccessAnalytics: false,
  },
  revision: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: false,
  },
  revisionAI: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: false,
  },

  teacherBasic: {
    canCreateClass: true,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: 5,
    maxQuestionsPerTopic: 5,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: true,
    maxClasses: 1,
    maxStudentsPerClass: 2,
  },
  teacherPlan: {
    canCreateClass: true,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: true,
    maxClasses: 1,
    maxStudentsPerClass: 10,
  },
  teacherPremium: {
    canCreateClass: true,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: true,
    maxClasses: Infinity,
    maxStudentsPerClass: 30,
  },
  admin: {
    canCreateClass: true,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: true,
    maxClasses: Infinity,
    maxStudentsPerClass: Infinity,
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

export const canAccessAnalytics = (user: User): boolean =>
  userAccessLimits[user.user_type]?.canAccessAnalytics ?? false;

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

// New helper function to check if user is a teacher
export const isTeacher = (userType: string | null | undefined): boolean => {
  return userType?.startsWith('teacher') ?? false;
};

// New helper function to check if user is a teacher
export const isAdmin = (role: string | null | undefined): boolean => {
  return role?.startsWith('admin') ?? false;
};