'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export function PdfButton({ filename }: { filename: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const element = document.getElementById('invoice-print-area');
    if (!element) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Błąd podczas generowania PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className="bg-black flex gap-2 items-center text-white px-4 py-2 rounded text-sm hover:bg-gray-800 cursor-pointer"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? 'Generowanie...' : 'Pobierz PDF'}
    </button>
  );
}
