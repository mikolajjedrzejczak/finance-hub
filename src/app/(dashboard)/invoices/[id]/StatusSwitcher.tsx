'use client';

import { updateInvoiceStatusAction } from '@/app/actions/invoice.actions';
import { StatusSelect } from '@/components/ui/StatusSelect';
import { useState, useTransition } from 'react';

export function StatusSwitcher({
  invoiceId,
  currentStatus,
  showLabel = true,
}: {
  invoiceId: string;
  currentStatus: string;
  showLabel?: boolean;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateInvoiceStatusAction(invoiceId, newStatus);
    });
  };

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm font-medium text-gray-500">Status:</span>
      )}
      <StatusSelect
        value={status}
        onChange={handleStatusChange}
        disabled={isPending}
      />
    </div>
  );
}
