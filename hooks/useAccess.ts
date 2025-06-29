// hooks/useAccess.ts

import { useUser } from '@/hooks/useUser';
import {
  canCreateClass,
  canViewAnswers,
  canUseAI,
  getMaxClasses,
  getMaxStudentsPerClass,
  getMaxQuestionsPerDay,
  User,
} from '@/lib/access';

interface AccessControl {
  canCreateClass: boolean;
  canViewAnswers: boolean;
  canUseAI: boolean;
  maxClasses: number;
  maxStudentsPerClass: number;
  maxQuestionsPerDay: number;
}

export function useAccess(): AccessControl {
  const { user } = useUser();

  const safeUser: User = user ?? { user_type: 'anonymous' };

  return {
    canCreateClass: canCreateClass(safeUser),
    canViewAnswers: canViewAnswers(safeUser),
    canUseAI: canUseAI(safeUser),
    maxClasses: getMaxClasses(safeUser),
    maxStudentsPerClass: getMaxStudentsPerClass(safeUser),
    maxQuestionsPerDay: getMaxQuestionsPerDay(safeUser),
  };
}
