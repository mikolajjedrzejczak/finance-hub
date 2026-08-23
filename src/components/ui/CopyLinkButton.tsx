'use client';

import { useState } from 'react';
import { LinkIcon, Check } from 'lucide-react';

type CopyLinkButtonProps = {
  invoiceId: string;
};

export function CopyLinkButton({ invoiceId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/public/invoice/${invoiceId}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          textArea.remove();
          throw new Error('execCommand copy failed');
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    } catch (err) {
      console.error('Nie udało się skopiować linku', err);

      const url = `${window.location.origin}/public/invoice/${invoiceId}`;
      if (window.prompt) {
        window.prompt('Skopiuj ten link ręcznie (Ctrl+C):', url);
      } else {
        alert(`Link: ${url}`);
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Kopiuj publiczny link"
      className={`p-2 rounded-md transition-colors cursor-pointer ${
        copied
          ? 'text-green-600 bg-green-50'
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <LinkIcon className="w-4 h-4" />
      )}
    </button>
  );
}
