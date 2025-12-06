import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-2xl font-bold text-slate-800">Global Files</h1>
          <span className="h-6 w-px bg-slate-300"></span>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <i className="fa-solid fa-layer-group text-slate-400"></i>
            <span>/</span>
            <span>All Files</span>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all">
            All Files
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-regular fa-image text-slate-400"></i> Images
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-video text-slate-400"></i> Videos
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-solid fa-music text-slate-400"></i> Audio
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2">
            <i className="fa-regular fa-file-lines text-slate-400"></i> Documents
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">Sort by:</span>
          <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 px-3 pr-8 outline-none">
            <option>Uploaded Date</option>
            <option>File Type</option>
            <option>Case Name</option>
            <option>File Size</option>
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

      {/* Recent Uploads Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fa-regular fa-clock text-slate-400"></i> Recent Uploads
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* File Card 1 (Image) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=300&fit=crop"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Evidence"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all">
                  <i className="fa-regular fa-eye text-xs"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white text-white hover:text-slate-900 flex items-center justify-center transition-all">
                  <i className="fa-solid fa-download text-xs"></i>
                </button>
              </div>
              <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">JPG</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Site_Evidence_001.jpg</h3>
              <p className="text-xs text-slate-500 mb-2 truncate">Case: Smith vs. Construction Co.</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>2.4 MB</span>
                <span>2 mins ago</span>
              </div>
            </div>
          </div>

          {/* File Card 2 (PDF) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-red-50 relative overflow-hidden flex items-center justify-center">
              <i className="fa-regular fa-file-pdf text-5xl text-red-400 group-hover:scale-110 transition-transform duration-300"></i>
              <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white shadow-lg text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all">
                  <i className="fa-solid fa-download text-xs"></i>
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Contract_Final_v2.pdf</h3>
              <p className="text-xs text-slate-500 mb-2 truncate">Case: Merger Acquisition 2024</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>1.8 MB</span>
                <span>1 hour ago</span>
              </div>
            </div>
          </div>

          {/* File Card 3 (Audio) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-purple-50 relative overflow-hidden flex items-center justify-center">
              <div className="w-full px-8 flex items-center justify-center gap-1 h-12">
                <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-8 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                <div className="w-1 h-6 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-1 h-7 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
              </div>
              <span className="absolute top-2 right-2 bg-purple-100 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded">MP3</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Witness_Statement_04.mp3</h3>
              <p className="text-xs text-slate-500 mb-2 truncate">Case: Estate Dispute</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>14.2 MB</span>
                <span>3 hours ago</span>
              </div>
            </div>
          </div>

          {/* File Card 4 (Video) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden">
            <div className="h-40 bg-slate-900 relative overflow-hidden flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=300&fit=crop"
                className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
                alt="Video Thumb"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-play text-white ml-1"></i>
                </div>
              </div>
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">04:23</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-800 truncate mb-1">Surveillance_Cam_02.mp4</h3>
              <p className="text-xs text-slate-500 mb-2 truncate">Case: Theft Investigation</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>128 MB</span>
                <span>Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Files List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">File Library</h2>
          <div className="text-xs text-slate-500">Showing 1-10 of 248 files</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2" />
                </th>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Case</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <i className="fa-regular fa-image text-blue-500"></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Evidence_Photo_A1.jpg</p>
                      <p className="text-xs text-slate-400">Image file</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">Smith vs. Construction</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">Image</span>
                </td>
                <td className="px-6 py-4 text-slate-500">2.4 MB</td>
                <td className="px-6 py-4 text-slate-500">2 mins ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-regular fa-eye text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-solid fa-download text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
                      <i className="fa-regular fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="fa-regular fa-file-pdf text-red-500"></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Contract_Final_v2.pdf</p>
                      <p className="text-xs text-slate-400">PDF document</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">Merger Acquisition 2024</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-red-50 text-red-600 text-xs rounded-full font-medium">Document</span>
                </td>
                <td className="px-6 py-4 text-slate-500">1.8 MB</td>
                <td className="px-6 py-4 text-slate-500">1 hour ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-regular fa-eye text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-solid fa-download text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
                      <i className="fa-regular fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-music text-purple-500"></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Witness_Statement_04.mp3</p>
                      <p className="text-xs text-slate-400">Audio file</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">Estate Dispute</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full font-medium">Audio</span>
                </td>
                <td className="px-6 py-4 text-slate-500">14.2 MB</td>
                <td className="px-6 py-4 text-slate-500">3 hours ago</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-regular fa-eye text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all">
                      <i className="fa-solid fa-download text-sm"></i>
                    </button>
                    <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all">
                      <i className="fa-regular fa-trash-can text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
          <button className="px-4 py-2 text-sm text-slate-400 font-medium cursor-not-allowed" disabled>
            <i className="fa-solid fa-chevron-left mr-2"></i> Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-medium">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">3</button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 text-sm font-medium transition-colors">25</button>
          </div>
          <button className="px-4 py-2 text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Next <i className="fa-solid fa-chevron-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

