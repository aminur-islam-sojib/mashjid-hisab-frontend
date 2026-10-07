"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HandCoins } from "lucide-react";

interface RecordDonationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (donation: { donor: string; amount: number; fund: string }) => void;
}

export function RecordDonationDialog({
  isOpen,
  onClose,
  onSuccess,
}: RecordDonationDialogProps) {
  const [formData, setFormData] = React.useState({
    donorName: "",
    amount: "",
    fund: "General Mosque Fund",
    paymentMethod: "Cash",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) {
        onSuccess({
          donor: formData.donorName || "Anonymous Donor",
          amount: parseFloat(formData.amount) || 0,
          fund: formData.fund,
        });
      }
      onClose();
      setFormData({
        donorName: "",
        amount: "",
        fund: "General Mosque Fund",
        paymentMethod: "Cash",
        notes: "",
      });
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Donation / Sadaqah"
      description="Enter donation details received for mosque maintenance or community funds."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Donor Name (Optional)
          </label>
          <Input
            placeholder="e.g. Brother Kamal or Leave blank for Anonymous"
            value={formData.donorName}
            onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Amount ($ USD) <span className="text-destructive">*</span>
            </label>
            <Input
              required
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 250"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Payment Method
            </label>
            <select
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-xs"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
            >
              <option value="Cash">Cash (Mosque Donation Box)</option>
              <option value="Credit / Debit Card">Credit / Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="bKash / Mobile Banking">Mobile Banking</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Designated Fund <span className="text-destructive">*</span>
          </label>
          <select
            className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-xs"
            value={formData.fund}
            onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
          >
            <option value="General Mosque Fund">General Mosque Maintenance</option>
            <option value="Zakat Fund">Zakat Fund (Eligible Recipients)</option>
            <option value="Sadaqah Jariyah">Sadaqah Jariyah</option>
            <option value="Mosque Expansion">Mosque Expansion & Construction</option>
            <option value="Iftar & Food Program">Ramadan / Community Iftar</option>
            <option value="Orphan & Needy Family">Orphan & Needy Support</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Remarks / Receipt Note
          </label>
          <Input
            placeholder="Optional receipt notes or donor request"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <HandCoins className="w-4 h-4" />
            {isSubmitting ? "Processing..." : "Record Donation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

