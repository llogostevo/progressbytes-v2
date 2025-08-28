import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { userAccessLimits } from '@/lib/access';
import type { UserType } from '@/lib/access';
import type { SupabaseClient } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CleanupResults {
  classesDeleted: number;
  studentsRemoved: number;
  classesChecked: number;
}

/**
 * Clean up excess classes and students when a user changes plans
 * This function can be used by both the Stripe webhook and the UpgradePageClient
 */
export async function cleanupExcessResources(
  supabase: SupabaseClient,
  userId: string, 
  newPlanSlug: string
): Promise<CleanupResults> {
  try {
    console.log(`Starting cleanup for user ${userId} to plan ${newPlanSlug}`);
    const newPlanLimits = userAccessLimits[newPlanSlug as UserType];
    if (!newPlanLimits) {
      console.error('Invalid plan slug for cleanup:', newPlanSlug);
      return { classesDeleted: 0, studentsRemoved: 0, classesChecked: 0 };
    }
    console.log('New plan limits:', newPlanLimits);

    const cleanupResults: CleanupResults = {
      classesDeleted: 0,
      studentsRemoved: 0,
      classesChecked: 0
    };

    // Only perform cleanup for teacher plans (plans with class limits)
    if (newPlanLimits.maxClasses !== undefined) {
      // Get all classes for this teacher
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('teacher_id', userId)
        .order('created_at', { ascending: true });

      if (classesError) {
        console.error('Error fetching classes for cleanup:', classesError);
        return cleanupResults;
      }

      if (classes && classes.length > 0) {
        cleanupResults.classesChecked = classes.length;
        console.log(`Found ${classes.length} classes for user ${userId}`);

        // If teacher has more classes than allowed, delete excess classes
        if (classes.length > newPlanLimits.maxClasses) {
          const classesToDelete = classes.slice(newPlanLimits.maxClasses);
          const classIdsToDelete = classesToDelete.map((c: { id: string }) => c.id);

          console.log(`Deleting ${classesToDelete.length} excess classes:`, classIdsToDelete);

          // Delete class members for these classes first (due to foreign key constraints)
          const { error: membersDeleteError } = await supabase
            .from('class_members')
            .delete()
            .in('class_id', classIdsToDelete);

          if (membersDeleteError) {
            console.error('Error deleting class members during cleanup:', membersDeleteError);
            return cleanupResults;
          }

          // Delete the excess classes
          const { error: classesDeleteError } = await supabase
            .from('classes')
            .delete()
            .in('id', classIdsToDelete);

          if (classesDeleteError) {
            console.error('Error deleting classes during cleanup:', classesDeleteError);
            return cleanupResults;
          }

          cleanupResults.classesDeleted = classesToDelete.length;
        }

        // Check remaining classes for excess students
        const remainingClasses = classes.slice(0, newPlanLimits.maxClasses);
        
        for (const classItem of remainingClasses) {
          // Get current student count for this class
          const { data: classMembers, error: membersError } = await supabase
            .from('class_members')
            .select('student_id')
            .eq('class_id', classItem.id);

          if (membersError) {
            console.error('Error fetching class members during cleanup:', membersError);
            continue;
          }

          const currentStudentCount = classMembers?.length || 0;
          const maxStudentsPerClass = newPlanLimits.maxStudentsPerClass || 0;
          console.log(`Class ${classItem.id} has ${currentStudentCount} students, max allowed: ${maxStudentsPerClass}`);

          // If class has more students than allowed, remove excess students
          if (currentStudentCount > maxStudentsPerClass) {
            console.log(`Removing ${currentStudentCount - maxStudentsPerClass} excess students from class ${classItem.id}`);
            const studentsToRemove = currentStudentCount - maxStudentsPerClass;
            
            // Get the most recently added students to remove
            const { data: recentMembers, error: recentError } = await supabase
              .from('class_members')
              .select('student_id')
              .eq('class_id', classItem.id)
              .order('joined_at', { ascending: false })
              .limit(studentsToRemove);

            if (recentError) {
              console.error('Error fetching recent members during cleanup:', recentError);
              continue;
            }

            if (recentMembers && recentMembers.length > 0) {
              const studentIdsToRemove = recentMembers.map((m: { student_id: string }) => m.student_id);
              console.log(`Removing students:`, studentIdsToRemove);
              
              const { error: removeError } = await supabase
                .from('class_members')
                .delete()
                .eq('class_id', classItem.id)
                .in('student_id', studentIdsToRemove);

              if (removeError) {
                console.error('Error removing students from class during cleanup:', removeError);
                continue;
              }

              cleanupResults.studentsRemoved += studentIdsToRemove.length;
            }
          }
        }
      }
    }

    console.log(`Cleanup completed for user ${userId}:`, cleanupResults);
    return cleanupResults;
  } catch (error) {
    console.error('Error in cleanupExcessResources:', error);
    return { classesDeleted: 0, studentsRemoved: 0, classesChecked: 0 };
  }
}
