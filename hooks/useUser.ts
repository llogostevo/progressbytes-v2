'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@/lib/access';

export function useUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const { data: authUser, error: userError } = await supabase.auth.getUser();

      if (userError || !authUser?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .single(); // RLS ensures they only get their own row

      if (profileError) {
        console.error(profileError);
        setUser(null);
      } else {
        setUser(profile);
      }

      setLoading(false);
    };

    getUserData();
  }, []);

  return { user, loading, userType: user?.user_type };
}
