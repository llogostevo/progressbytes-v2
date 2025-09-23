// lib/access.ts

  export type UserType =
  | 'anonymous'         // no login
  | 'basic'             // student, free
  | 'revision'          // student, paid
  | 'revisionAI'        // student, premium
  | 'teacherBasic'      // teacher with free access (1 class, 5-10 students)
  | 'teacherPlan'       // teacher with paid access (1 class, 10 students)
  | 'teacherPremium'    // paid teacher, multiple classes
  | 'admin'            // internal use only (site owner)
  | 'studentSponsoredRevision'; // student, sponsored premium


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
  sponsoredStudents?: number;
  showProgressBoost?: boolean;
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
    maxClasses: 0,
    maxStudentsPerClass: 0
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
    maxClasses: 0,
    maxStudentsPerClass: 0
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
    maxClasses: 0,
    maxStudentsPerClass: 0
  },
  studentSponsoredRevision:{} as AccessLimits, // free sponsored revision plan, set by teachers to be paid for by the school
  revisionAI: {
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: true,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: false,
    maxClasses: 0,
    maxStudentsPerClass: 0,
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
    maxStudentsPerClass: 30,
    sponsoredStudents: 0 // can provide free access to students
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
    maxStudentsPerClass: 30,
    sponsoredStudents: 10 // can provide free access to students
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
    sponsoredStudents: 30 // can provide free access to students
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
    maxStudentsPerClass: Infinity
  }
};

// set the sponsored access limits
userAccessLimits.studentSponsoredRevision = {
  ...userAccessLimits.revision,
  showProgressBoost: true
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

// New helper function to check if user can see progress boost
export const canShowProgressBoost = (user: User): boolean => {
  return userAccessLimits[user.user_type]?.showProgressBoost ?? false;
};