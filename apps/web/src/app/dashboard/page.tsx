export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Your Repositories</h2>
      <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
        <p className="text-gray-500 mb-6">You haven't synced any repositories yet.</p>
        <button className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors">
          Sync GitHub Repositories
        </button>
      </div>
    </div>
  );
}
