import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAction() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const executionAction = async <
    T extends { success?: boolean; error?: string },
  >(
    actionPromise: Promise<T>,
    onSuccess: () => void,
  ) => {
    setIsPending(true);
    const result = await actionPromise;
    setIsPending(false);

    if (result.success) {
      onSuccess();
      router.refresh();
    } else {
      alert(result.error || 'Wystąpił błąd podczas zapisywania.');
    }
  };

  return {
    executionAction,
    isPending,
  };
}
