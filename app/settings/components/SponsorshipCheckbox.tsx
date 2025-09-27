// components/SponsorshipCheckbox.tsx
"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { toggleSponsorship } from "../actions/sponsorship"; // your server action

type UserType = string;

export type SupabaseMember = {
  student_id: string;
  joined_at: string;
  is_sponsored: boolean;
  student: {
    userid?: string; // optional if you didn’t include it everywhere yet
    email: string;
    full_name: string;
    user_type: UserType;
  };
};

type Props = {
  member: SupabaseMember;
  selectedClassId: string;
  setSelectedClassMembers: React.Dispatch<React.SetStateAction<SupabaseMember[] | null>>;
};

export default function SponsorshipCheckbox({
  member,
  selectedClassId,
  setSelectedClassMembers,
}: Props) {
  // const isSponsored = member.student.user_type === "studentSponsoredRevision";
  // const [checked, setChecked] = useState<boolean>(isSponsored);

  const isSponsoredForThisClass = member.is_sponsored;
  const [checked, setChecked] = useState<boolean>(isSponsoredForThisClass);
  const [isPending, startTransition] = useTransition();

  const onToggle = (next: boolean) => {
    // optimistic UI
    setChecked(next);

    startTransition(async () => {
      try {
        await toggleSponsorship({
          classId: selectedClassId,
          studentId: member.student_id,
          enable: next,
        });

        // reflect the new user_type in local state
        setSelectedClassMembers((prev) =>
          (prev || []).map((m) =>
            m.student_id === member.student_id
              ? {
                ...m,
                student: {
                  ...m.student,
                  user_type: next ? "studentSponsoredRevision" : "basic",
                },
              }
              : m
          )
        );

        toast.success(next ? "Sponsorship enabled" : "Sponsorship removed", {
          duration: 7000,
          closeButton: true,
        });
      } catch (err: any) {
        // rollback UI if server failed
        setChecked(!next);
        toast.error(err?.message || "Failed to update sponsorship", {
          duration: 7000,
          closeButton: true,
        });
      }
    });
  };

  return (
    <Label className="mt-2 hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-2 w-48 cursor-pointer has-[[aria-checked=true]]:border-green-600 has-[[aria-checked=true]]:bg-green-50 dark:has-[[aria-checked=true]]:border-green-900 dark:has-[[aria-checked=true]]:bg-green-950">
      <Checkbox
        id={`toggle-${member.student_id}`}
        checked={checked}
        disabled={isPending}
        onCheckedChange={(val) => onToggle(Boolean(val))}
        className="cursor-pointer data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
      />
      <div className="grid gap-1.5 font-normal">
        <div className="text-sm leading-none font-medium">Enable free access</div>
      </div>
    </Label>
  );
}
