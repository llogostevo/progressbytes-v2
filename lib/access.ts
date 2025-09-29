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
  | 'studentSponsoredRevision' // student, sponsored premium
  | 'teacherPlanSponsored' 
  | 'teacherPremiumSponsored';


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
  isTeacher: boolean;
  isPaid: boolean;
  isSponsored: boolean;
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
    maxStudentsPerClass: 0,
    sponsoredStudents: 0,
    showProgressBoost: false,
    isTeacher: false,
    isPaid: false,
    isSponsored: false
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
    maxStudentsPerClass: 0, 
    sponsoredStudents: 0,
    showProgressBoost: false,
    isTeacher: false,
    isPaid: false,
    isSponsored: false
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
    maxStudentsPerClass: 0,
    sponsoredStudents: 0,
    showProgressBoost: true,
    isTeacher: false,
    isPaid: true,
    isSponsored: false
  },
  studentSponsoredRevision:{ // free student sponsored revision plan, set by teachers as part of their paid access plan
    canCreateClass: false,
    canViewAnswers: true,
    canUseAI: false,
    maxQuestionsPerDay: Infinity,
    maxQuestionsPerTopic: Infinity,
    canAccessFilters: true,
    canSkipQuestions: true,
    canAccessAnalytics: false,
    maxClasses: 0,
    maxStudentsPerClass: 0,
    sponsoredStudents: 0,
    showProgressBoost: true,
    isTeacher: false,
    isPaid: false,
    isSponsored: true
  } , 
  revisionAI: { // student ai premium plan with ai feedback
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
    sponsoredStudents: 0,
    showProgressBoost: true,
    isTeacher: false,
    isPaid: true,
    isSponsored: false
  },
  teacherBasic: { // teacher basic plan with free access (1 class, 5-10 students)
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
    sponsoredStudents: 0, // can provide free access to students
    showProgressBoost: false,
    isTeacher: true,
    isPaid: false,
    isSponsored: false
  },
  teacherPlan: { // teacher plan with paid access (1 class, 10 students)
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
    sponsoredStudents: 10, // can provide free access to students
    showProgressBoost: false,
    isTeacher: true,
    isPaid: true,
    isSponsored: false
  },
  teacherPlanSponsored: { // free access plan assigned by admin
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
    sponsoredStudents: 10, // can provide free access to students
    showProgressBoost: false,
    isTeacher: true,
    isPaid: false,
    isSponsored: true
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
    sponsoredStudents: 30, // can provide free access to students
    showProgressBoost: false,
    isTeacher: true,
    isPaid: true,
    isSponsored: false
  },
  teacherPremiumSponsored: { // free access plan assigned by admin
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
    sponsoredStudents: 30, // can provide free access to students
    showProgressBoost: false,
    isTeacher: true,
    isPaid: false,
    isSponsored: true
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
    showProgressBoost: false,
    isTeacher: true,
    isPaid: true,
    isSponsored: false
  }
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

export const getMaxSponsoredStudents = (user: User): number =>
  userAccessLimits[user.user_type]?.sponsoredStudents ?? 0;

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
export const isTeacherPlan = (user: User): boolean => {
  return userAccessLimits[user.user_type]?.isTeacher ?? false;
};

// New helper function to check if user is a teacher
export const isAdmin = (role: string | null | undefined): boolean => {
  return role?.startsWith('admin') ?? false;
};

// New helper function to check if user can see progress boost
export const canShowProgressBoost = (user: User): boolean => {
  return userAccessLimits[user.user_type]?.showProgressBoost ?? false;
};


// Helper function to check if user is on a paid plan
export const isPaidPlan = (user: User): boolean => {
  return userAccessLimits[user.user_type]?.isPaid ?? false;
};

// Helper function to check if user is on a locked plan (cannot be downgraded to free)
export const isLockedPlan = (user: User): boolean => {
  const lockedPlans: UserType[] = [
    'revision',
    'revisionAI', 
    'teacherBasic',
    'teacherPlan',        
    'teacherPremium', 
    'admin',
    'teacherPlanSponsored',
    'teacherPremiumSponsored' 
  ];
  
  return lockedPlans.includes(user.user_type);
};

// Helper function to check if user is on a sponsored plan
export const isSponsoredPlan = (user: User): boolean => {
  return userAccessLimits[user.user_type]?.isSponsored ?? false;
};
