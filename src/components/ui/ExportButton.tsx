'use client';

import { Download, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ExportButton({ companyId }: { companyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [year, setYear] = useState(currentYear.toString());
  const [month, setMonth] = useState(currentMonth.toString());
  const [status, setStatus] = useState('ALL');

  // Zamknięcie po kliknięciu na zewnątrz
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Obsługa eksportu przez fetch, by mieć prawdziwy stan ładowania
  const handleExport = async () => {
    setIsExporting(true);

    const queryParams = new URLSearchParams({
      companyId,
      year,
      month,
      status,
    });

    try {
      const response = await fetch(
        `/api/invoices/export?${queryParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error('Błąd podczas generowania pliku');
      }

      // Pobranie pliku jako Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Tworzenie tymczasowego linku do pobrania
      const link = document.createElement('a');
      link.href = url;

      // Jeśli twój serwer zwraca nagłówek Content-Disposition z nazwą,
      // przeglądarka i tak jej użyje. To jest fallback:
      link.download = `eksport_${year}_${month}.csv`;

      document.body.appendChild(link);
      link.click();

      // Sprzątanie po pobraniu
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsOpen(false);
    } catch (error) {
      console.error('Błąd eksportu:', error);
      // Tutaj w przyszłości możesz dodać notyfikację (toast) o błędzie
    } finally {
      setIsExporting(false); // Zdjęcie loadingu zawsze po faktycznym zakończeniu
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Download className="w-4 h-4" />
        Eksport
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Parametry eksportu
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rok</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Miesiąc
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-green-500 outline-none"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date(2024, i, 1);
                    const monthName = date.toLocaleString('pl-PL', {
                      month: 'long',
                    });
                    // Powiększamy pierwszą literę (np. styczeń -> Styczeń)
                    const capitalizedMonth =
                      monthName.charAt(0).toUpperCase() + monthName.slice(1);

                    return (
                      <option key={i + 1} value={i + 1}>
                        {capitalizedMonth}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Status dokumentów
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md py-1.5 px-2 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="ALL">Wszystkie</option>
                <option value="PAID">Tylko opłacone</option>
                <option value="PENDING">Oczekujące / Nieopłacone</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Generowanie...' : 'Pobierz plik CSV'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
