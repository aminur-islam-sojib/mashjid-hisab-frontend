"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarPlus } from "lucide-react";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (event: { title: string; date: string; time: string }) => void;
}

export function ScheduleEventDialog({
  isOpen,
  onClose,
  onSuccess,
}: ScheduleEventDialogProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    category: "Islamic Lecture",
    date: "",
    time: "06:00 PM - 07:30 PM",
    venue: "Main Prayer Hall",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess({
          title: formData.title,
          date: formData.date || "Next Week",
          time: formData.time,
        });
      }
      onClose();
      setFormData({
        title: "",
        category: "Islamic Lecture",
        date: "",
        time: "06:00 PM - 07:30 PM",
        venue: "Main Prayer Hall",
      });
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Community Event"
      description="Create a new program, seminar, or youth activity at the mosque."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Event Title <span className="text-destructive">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Seerah of Prophet Muhammad (PBUH) Seminar"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Category
            </label>
            <select
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-xs"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Friday Jummah">Friday Jummah Khutbah</option>
              <option value="Islamic Lecture">Islamic Lecture / Halaqah</option>
              <option value="Quran Hifz Class">Quran Hifz / Tajweed Class</option>
              <option value="Community Iftar">Community Iftar / Dinner</option>
              <option value="Youth Activity">Youth Sports & Workshop</option>
              <option value="Sister Circle">Sisters Weekly Halaqah</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Venue / Room
            </label>
            <select
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-xs"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            >
              <option value="Main Prayer Hall">Main Prayer Hall</option>
              <option value="Classroom 1 (Upper Floor)">Classroom 1 (Upper Floor)</option>
              <option value="Classroom 2 (Library)">Classroom 2 (Library)</option>
              <option value="Community Hall">Community Hall</option>
              <option value="Courtyard">Courtyard</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Date <span className="text-destructive">*</span>
            </label>
            <Input
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Time Slot
            </label>
            <Input
              placeholder="e.g. 5:30 PM - 7:00 PM"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <CalendarPlus className="w-4 h-4" />
            {isSubmitting ? "Scheduling..." : "Schedule Event"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

