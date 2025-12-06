import Link from "next/link";

export default function CasesPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-slate-800">Case Spaces</h1>
          <span className="h-6 w-px bg-slate-300"></span>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-slate-400"></i>
            <span>/</span>
            <span>All Cases</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all">
            All Cases
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-circle text-green-500 text-[8px]"></i> Active
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-circle text-yellow-500 text-[8px]"></i> Pending
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-circle text-blue-500 text-[8px]"></i> In Review
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-circle text-slate-400 text-[8px]"></i> Closed
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Sort by:</span>
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 px-3 pr-8 outline-none">
            <option>Last Updated</option>
            <option>Case Name</option>
            <option>Client Name</option>
            <option>Created Date</option>
            <option>Priority</option>
          </select>
          <div className="w-px h-6 bg-slate-300 mx-2"></div>
          <button className="text-slate-500 hover:text-blue-600 transition-colors">
            <i className="fa-solid fa-list-ul text-lg"></i>
          </button>
          <button className="text-blue-600 transition-colors">
            <i className="fa-solid fa-border-all text-lg"></i>
          </button>
        </div>
      </div>

      {/* Recent Cases Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-regular fa-clock text-slate-400"></i> Recent Cases
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Case Card 1 */}
          <Link href="/cases/1" className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-briefcase text-3xl text-blue-600"></i>
              </div>
              <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full">Active</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Smith vs. Construction Co.</h3>
              <p className="text-xs text-slate-500 mb-3">Client: John Smith</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Updated 2 hours ago</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">24 docs</span>
              </div>
            </div>
          </Link>

          {/* Case Card 2 */}
          <Link href="/cases/2" className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-gavel text-3xl text-purple-600"></i>
              </div>
              <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-full">Pending</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Estate of Wilson</h3>
              <p className="text-xs text-slate-500 mb-3">Client: Sarah Wilson</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Updated yesterday</span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">18 docs</span>
              </div>
            </div>
          </Link>

          {/* Case Card 3 */}
          <Link href="/cases/3" className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-file-contract text-3xl text-green-600"></i>
              </div>
              <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full">Active</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Merger Acquisition 2024</h3>
              <p className="text-xs text-slate-500 mb-3">Client: TechCorp Inc.</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Updated 3 days ago</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">42 docs</span>
              </div>
            </div>
          </Link>

          {/* Case Card 4 */}
          <Link href="/cases/4" className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-scale-balanced text-3xl text-orange-600"></i>
              </div>
              <span className="absolute top-3 right-3 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-full">Review</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Martinez Contract Dispute</h3>
              <p className="text-xs text-slate-500 mb-3">Client: Maria Martinez</p>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Updated 1 week ago</span>
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-medium">31 docs</span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* All Cases List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with tabs and actions */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-slate-900">All Cases</h2>
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                All Cases
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Active
              </button>
              <button className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                Archived
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input
                type="text"
                placeholder="Filter by case or firm..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
              <i className="fa-solid fa-plus"></i>
              Create Case Space
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Case Space Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Linked Firm</th>
                <th className="px-6 py-3">Last Updated</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">JD</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Johnson v. Davis Corp</p>
                      <p className="text-xs text-slate-500">Employment Dispute</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <i className="fa-solid fa-circle text-[6px] text-green-500"></i>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">Morrison & Associates</td>
                <td className="px-6 py-4 text-slate-500">2 hours ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">SM</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Smith Medical Malpractice</p>
                      <p className="text-xs text-slate-500">Personal Injury</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <i className="fa-solid fa-circle text-[6px] text-green-500"></i>
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">Henderson Law Group</td>
                <td className="px-6 py-4 text-slate-500">1 day ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">TC</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Taylor Contract Dispute</p>
                      <p className="text-xs text-slate-500">Commercial Law</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <i className="fa-solid fa-circle text-[6px] text-slate-400"></i>
                    Archived
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">—</td>
                <td className="px-6 py-4 text-slate-500">3 weeks ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex items-center justify-center">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/30">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-700">1-3</span> of <span className="font-medium text-slate-700">24</span> cases
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-slate-400 font-medium cursor-not-allowed" disabled>
              Previous
            </button>
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">2</button>
            <button className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

