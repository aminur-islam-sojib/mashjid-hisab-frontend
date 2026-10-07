"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck } from "lucide-react";

interface AddMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (member: { name: string; email: string }) => void;
}

export function AddMemberDialog({ isOpen, onClose, onSuccess }: AddMemberDialogProps) {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    category: "General Member",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess({ name: formData.fullName, email: formData.email });
      }
      onClose();
      setFormData({ fullName: "", email: "", phone: "", category: "General Member" });
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Community Member"
      description="Register a new member to Al-Noor Mosque directory."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            required
            placeholder="e.g. Tariq Mansoor"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Email Address <span className="text-destructive">*</span>
            </label>
            <Input
              required
              type="email"
              placeholder="e.g. tariq@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+880 1712-345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Membership Type
          </label>
          <select
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-xs"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="General Member">General Member</option>
            <option value="Family Head">Family Head</option>
            <option value="Active Volunteer">Active Volunteer</option>
            <option value="Elder / Advisor">Elder / Advisor</option>
            <option value="Student">Student (Hifz / Islamic Studies)</option>
          </select>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <UserCheck className="w-4 h-4" />
            {isSubmitting ? "Saving..." : "Add Member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

