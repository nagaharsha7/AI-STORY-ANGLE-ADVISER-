import React, { useState, useEffect } from 'react';
import { getHistoryLogs } from '../services/api';
import HistoryCard from '../components/HistoryCard';
import OutputCard from '../components/OutputCard';
import { FiSearch, FiFolder, FiX, FiFilter, FiActivity } from 'react-icons/fi';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  // Categories list for filtering
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Politics', label: 'Politics' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Economy', label: 'Economy' },
    { value: 'Crime', label: 'Crime' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Environment', label: 'Environment' }
  ];

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistoryLogs(search, category);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Could not load past strategy analysis records.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch history when search or category selection changes
  useEffect(() => {
    // Implement debounce on search input
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  const handleViewDetails = (id) => {
    const record = history.find(r => r.id === id);
    if (record) {
      // Map history fields to output format required by OutputCard
      setSelectedRecord({
        id: record.id,
        title: record.title,
        category: record.category,
        editor: record.editor,
        ...record.generated_output
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
          <FiFolder className="text-brand" />
          <span>STRATEGY ARCHIVES</span>
        </h2>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Review, export, and search through previously generated story strategies, audience queries, and social threads.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-darkbg-card border border-darkbg-border rounded-xl p-4">
        {/* Search */}
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <FiSearch size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, story title..."
            className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand/50 transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="w-full md:w-64 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
            <FiFilter size={14} />
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-darkbg-deep/50 border border-darkbg-border rounded-lg pl-10 pr-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-brand/50 appearance-none cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-darkbg-card text-gray-200">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Logs Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <FiFolder className="text-gray-600" size={40} />
          <h3 className="font-display font-bold text-gray-300 text-base">No Archival Records Found</h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Try adjusting your search filters, clearing the category tags, or generate a new story analysis on the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((record) => (
            <HistoryCard 
              key={record.id} 
              record={record} 
              onViewDetails={handleViewDetails} 
            />
          ))}
        </div>
      )}

      {/* Detail Overlay Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-deep/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-darkbg-deep border border-darkbg-border rounded-2xl shadow-2xl p-6 md:p-8 my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 bg-darkbg-card border border-darkbg-border rounded-lg transition-colors"
            >
              <FiX size={16} />
            </button>

            {/* Embedded Output Card */}
            <div className="mt-4">
              <OutputCard 
                output={selectedRecord} 
                onRegenerate={() => {
                  alert("Regeneration is disabled inside the archive details. Paste the story on the dashboard to generate a fresh analysis.");
                }}
                isRegenerating={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
