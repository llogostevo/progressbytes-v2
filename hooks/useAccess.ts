// hooks/useAccess.ts

import { useUser } from '@/hooks/useUser';
import {
  canCreateClass,
  canViewAnswers,
  canUseAI,
  getMaxClasses,
  getMaxStudentsPerClass,
  getMaxQuestionsPerDay,
  getMaxQuestionsPerTopic,
  getAvailableQuestionsForTopic,
  User,
  canAccessFilters,
  canAccessAnalytics,
  isPaidPlan,
  isLockedPlan,
  isSponsoredPlan,
} from '@/lib/access';

interface AccessControl {
  canCreateClass: boolean;
  canViewAnswers: boolean;
  canUseAI: boolean;
  canAccessFilters: boolean;
  canAccessAnalytics: boolean;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxQuestionsPerDay: number;
  maxQuestionsPerTopic: number;
  getAvailableQuestionsForTopic: (topicQuestionCount: number) => number;
  isPaidPlan: boolean;
  isLockedPlan: boolean;
  isSponsoredPlan: boolean;
}

export function useAccess(): AccessControl {
  const { user } = useUser();

  const safeUser: User = user ?? { user_type: 'anonymous' };

  return {
    canCreateClass: canCreateClass(safeUser),
    canViewAnswers: canViewAnswers(safeUser),
    canUseAI: canUseAI(safeUser),
    canAccessFilters: canAccessFilters(safeUser),
    canAccessAnalytics: canAccessAnalytics(safeUser),
    maxClasses: getMaxClasses(safeUser),
    maxStudentsPerClass: getMaxStudentsPerClass(safeUser),
    maxQuestionsPerDay: getMaxQuestionsPerDay(safeUser),
    maxQuestionsPerTopic: getMaxQuestionsPerTopic(safeUser),
    getAvailableQuestionsForTopic: (topicQuestionCount: number) => 
      getAvailableQuestionsForTopic(safeUser, topicQuestionCount),
    isPaidPlan: isPaidPlan(safeUser),
    isLockedPlan: isLockedPlan(safeUser),
    isSponsoredPlan: isSponsoredPlan(safeUser),
  };
}
