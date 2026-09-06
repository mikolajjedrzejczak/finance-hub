import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export function useAction() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const executionAction = useCallback(
    async <T extends { success?: boolean; error?: string }>(
      actionPromise: Promise<T>,
      onSuccess: () => void,
    ) => {
      setIsPending(true);
      try {
        const result = await actionPromise;

        if (result.success) {
          onSuccess();
          router.refresh();
        } else {
          alert(result.error || 'Wystąpił błąd podczas zapisywania.');
        }
      } catch (error: unknown) {
        console.error(error);
        alert('Wystąpił nieoczekiwany błąd połączenia z serwerem.');
      } finally {
        setIsPending(false);
      }
    },
    [router],
  );

  return {
    executionAction,
    isPending,
  };
}
