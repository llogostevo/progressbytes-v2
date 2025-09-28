"use server";

import { createClient } from "@/utils/supabase/server";

// Types for params and return
type ToggleSponsorshipParams = {
  classId: string;
  studentId: string;
  enable: boolean;
};

type ToggleSponsorshipResult = {
  usedSponsored: number;
  capSponsored: number;
};

export async function toggleSponsorship({
  classId,
  studentId,
  enable,
}: ToggleSponsorshipParams): Promise<ToggleSponsorshipResult> {
  const supabase = await createClient()

  // Get the caller (teacher) id from auth (important so RPC can verify auth.uid()).
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");
  const teacherId = user.id;

  // Call appropriate RPC
  if (enable) {
    const { error } = await supabase.rpc("sponsor_student", {
      teacher_id_input: teacherId,
      student_id_input: studentId,
      class_id_input: classId,
    });

    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.rpc("unsponsor_student", {
      teacher_id_input: teacherId,
      student_id_input: studentId,
      class_id_input: classId,
    });

    if (error) throw new Error(error.message);
  }

  // Fetch cap (max sponsored seats)
  const { data: capRow, error: capError } = await supabase
    .from("profiles")
    .select("max_sponsored_seats")
    .eq("userid", teacherId)
    .single();

  if (capError) throw new Error(capError.message);

  // Get all class IDs for this teacher
  const { data: teacherClasses, error: classError } = await supabase
    .from("classes")
    .select("id")
    .eq("teacher_id", teacherId);

  if (classError) throw new Error(classError.message);

  let used = 0;
  if (teacherClasses && teacherClasses.length > 0) {
    const classIds = teacherClasses.map((c: { id: string }) => c.id);

    const { count, error: countError } = await supabase
      .from("class_members")
      .select("student_id", { head: true, count: "exact" })
      .in("class_id", classIds)
      .eq("is_sponsored", true);

    if (countError) throw new Error(countError.message);

    used = count ?? 0;
  }

  return {
    usedSponsored: used,
    capSponsored: capRow?.max_sponsored_seats ?? 0,
  };
}
