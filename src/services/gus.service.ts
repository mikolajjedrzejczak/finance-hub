import { DomainError, NotFoundError } from "@/errors/domain.errors";

export const gusService = {
  async fetchCompanyByNip(nip: string) {
    const cleanNip = nip.replace(/[^0-9]/g, '');
    if (cleanNip.length !== 10) throw new DomainError('NIP musi mieć 10 cyfr');

    const today = new Date().toISOString().split('T')[0];
    const url = `https://wl-api.mf.gov.pl/api/search/nip/${cleanNip}?date=${today}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new DomainError('Błąd łączenia z bazą Ministerstwa Finansów');
    }

    const data = await response.json();
    const subject = data.result.subject;

    if (!subject) {
      throw new NotFoundError('Nie znaleziono fimy o podanym NIP w rejestrze VAT');
    }

    const rawAddress = subject.workingAddress || subject.residenceAddress || '';
    let postal = '';
    let city = '';
    let address = '';

    const postalMatch = rawAddress.match(/\b\d{2}-\d{3}\b/);
    if (postalMatch) {
      postal = postalMatch[0];
      const parts = rawAddress.split(postal);
      address = parts[0].replace(/, $/, '').trim();
      city = parts[1] ? parts[1].trim() : '';
    }

    return {
      name: subject.name,
      nip: subject.nip,
      address,
      postal,
      city,
    };
  },
};
