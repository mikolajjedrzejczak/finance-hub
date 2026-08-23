"use client";

import { useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { companySchema, type CompanyInput } from "@/schemas/company.schema";
import { fetchCompanyFromGusAction } from "@/app/actions/gus.actions";
import { createCompanyAction } from "@/app/actions/company.actions";
import Input from "../ui/Input";




export function CompanyForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isFetchingGus, setIsFetchingGus] = useState(false);

  const { register, handleSubmit, reset, getValues, setValue, formState: { errors, isSubmitting } } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", nip: "", city: "", postal: "", address: "", email: "", phone: "", bankAccount: "" },
  });

  const handleFetchGus = async () => {
    const nip = getValues("nip");
    if (!nip || nip.length < 10) return setServerError("Wpisz poprawny NIP.");
    setServerError(null); setIsFetchingGus(true);
    const result = await fetchCompanyFromGusAction(nip);
    if (result.error) setServerError(result.error);
    else if (result.data) {
      setValue("name", result.data.name, { shouldValidate: true });
      setValue("address", result.data.address, { shouldValidate: true });
      setValue("postal", result.data.postal, { shouldValidate: true });
      setValue("city", result.data.city, { shouldValidate: true });
    }
    setIsFetchingGus(false);
  };

  const onSubmit = async (data: CompanyInput) => {
    setServerError(null);
    const result = await createCompanyAction(data);
    if (result.error) setServerError(result.error);
    else if (result.success) {
      reset();
      router.refresh();
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Dodaj profil swojej firmy</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input id="name" label="Nazwa firmy" register={register} error={errors.name} required />
          </div>
          <Input id="nip" label="NIP" register={register} error={errors.nip} required actionButton={
              <button type="button" onClick={handleFetchGus} disabled={isFetchingGus || isSubmitting} className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-blue-600 hover:bg-gray-100 disabled:text-gray-400">
                {isFetchingGus ? "Szukam..." : "GUS"}
              </button>
            } />
          <Input id="bankAccount" label="Konto bankowe" register={register} error={errors.bankAccount} />
          <div className="md:col-span-2">
            <Input id="address" label="Ulica i numer" register={register} error={errors.address} required />
          </div>
          <Input id="postal" label="Kod pocztowy" placeholder="00-000" register={register} error={errors.postal} required />
          <Input id="city" label="Miasto" register={register} error={errors.city} required />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-300">
            {isSubmitting ? "Zapisywanie..." : "Dodaj firmę"}
          </button>
        </div>
      </form>
    </div>
  );
}