export default function RepositoryLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-4 w-full max-w-md bg-gray-100 rounded animate-pulse mt-4" />
        </div>

        {/* Health Score Skeleton */}
        <div className="shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-4 w-48 text-center">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-9 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mx-auto mt-1" />
        </div>

        {/* Bus Factor Skeleton */}
        <div className="shrink-0 bg-red-50/50 border border-gray-200 rounded-lg p-4 w-48 text-center">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-9 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse mx-auto mt-1" />
        </div>

        {/* Resilience Skeleton */}
        <div className="shrink-0 bg-blue-50/50 border border-gray-200 rounded-lg p-4 w-48 text-center">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
          <div className="h-9 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mx-auto mt-1" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        ))}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2 flex justify-between items-center">
          <div>
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="text-right">
            <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
      </div>

      {/* Evidence Panels Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3 animate-pulse" />
              <div className="space-y-1">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-3/5 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        <ul className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="px-6 py-4 flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-50 rounded animate-pulse mt-1" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
