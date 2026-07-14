export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Metrics Section Skeleton */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engineering Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Repositories Section Skeleton */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Repositories</h2>
          <div className="h-9 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full">
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2" />
              </div>
              <div className="mt-6 flex justify-between items-center">
                <div className="h-5 w-14 bg-gray-100 rounded-full animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
