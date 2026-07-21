export default function InvoicesLoading() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="h-64 bg-gray-200 rounded-xl mb-6" />
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}
