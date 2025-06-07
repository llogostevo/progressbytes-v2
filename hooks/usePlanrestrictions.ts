import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface PlanRestrictions {
  canAccessQuestion: boolean;
  dailyQuestionsRemaining: number;
  totalQuestionsRemaining: number;
  hasAiFeedback: boolean;
}

export function usePlanRestrictions() {
  const [restrictions, setRestrictions] = useState<PlanRestrictions>({
    canAccessQuestion: true,
    dailyQuestionsRemaining: 0,
    totalQuestionsRemaining: 0,
    hasAiFeedback: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRestrictions = async () => {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRestrictions({
          canAccessQuestion: false,
          dailyQuestionsRemaining: 0,
          totalQuestionsRemaining: 0,
          hasAiFeedback: false
        });
        setIsLoading(false);
        return;
      }

      // Get user's subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans (
            daily_question_limit,
            total_question_limit,
            has_ai_feedback
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        // User is on free plan
        const { data: plan } = await supabase
          .from('plans')
          .select('*')
          .eq('slug', 'basic')
          .single();

        // Count today's questions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: dailyCount } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('event', 'submitted_question')
          .gte('created_at', today.toISOString());

        // Count total questions
        const { count: totalCount } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .eq('event', 'submitted_question');

        setRestrictions({
          canAccessQuestion: (dailyCount || 0) < (plan.daily_question_limit || 0),
          dailyQuestionsRemaining: (plan.daily_question_limit || 0) - (dailyCount || 0),
          totalQuestionsRemaining: (plan.total_question_limit || 0) - (totalCount || 0),
          hasAiFeedback: plan.has_ai_feedback
        });
      } else {
        // User has an active subscription
        setRestrictions({
          canAccessQuestion: true,
          dailyQuestionsRemaining: -1, // unlimited
          totalQuestionsRemaining: -1, // unlimited
          hasAiFeedback: subscription.plans.has_ai_feedback
        });
      }

      setIsLoading(false);
    };

    checkRestrictions();
  }, []);

  return { restrictions, isLoading };
}