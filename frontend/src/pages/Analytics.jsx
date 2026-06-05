import React, { useState, useEffect } from 'react';
import { getAnalyticsStats } from '../services/api';
import { DailyUsageChart, CategoryChart } from '../components/AnalyticsChart';
import { FiTrendingUp, FiCpu, FiStar, FiFileText, FiRefreshCw } from 'react-icons/fi';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    
    try {
      const data = await getAnalyticsStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError("Unable to compile newsroom operations metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
            <FiTrendingUp className="text-brand" />
            <span>NEWSROOM PERFORMANCE METRICS</span>
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Real-time analytics tracking system utilization, editor feedback ratings, and top interest category distributions.
          </p>
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={loading || refreshing}
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-darkbg-border bg-darkbg-card px-3 text-xs font-semibold text-gray-300 hover:text-brand hover:border-brand/40 transition-all disabled:opacity-50"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin text-brand' : ''} size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Generations */}
            <div className="glass-panel rounded-2xl p-5 glow-orange flex items-center gap-4 border border-darkbg-border">
              <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                <FiCpu size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium font-mono uppercase">Total Generations</p>
                <h3 className="text-2xl font-display font-extrabold text-white mt-1 leading-none">
                  {stats?.totalGenerations || 0}
                </h3>
              </div>
            </div>

            {/* Average Rating */}
            <div className="glass-panel rounded-2xl p-5 glow-orange flex items-center gap-4 border border-darkbg-border">
              <div className="h-12 w-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                <FiStar className="fill-yellow-500/20" size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium font-mono uppercase">Average Advisor Rating</p>
                <h3 className="text-2xl font-display font-extrabold text-white mt-1 leading-none">
                  {stats?.averageRating ? `${stats.averageRating} / 5` : 'N/A'}
                </h3>
              </div>
            </div>

            {/* Analytics Date Span */}
            <div className="glass-panel rounded-2xl p-5 glow-orange flex items-center gap-4 border border-darkbg-border">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <FiFileText size={22} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium font-mono uppercase">Reporting window</p>
                <h3 className="text-sm font-display font-bold text-white mt-1.5 leading-tight">
                  Past 30 Days
                </h3>
              </div>
            </div>

            {/* System Status */}
            <div className="glass-panel rounded-2xl p-5 glow-orange flex items-center gap-4 border border-darkbg-border">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
                <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium font-mono uppercase">AI API Status</p>
                <h3 className="text-sm font-display font-bold text-white mt-1.5 leading-tight">
                  Online & Active
                </h3>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Daily Usage Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-darkbg-border">
              <h3 className="font-display font-bold text-gray-200 text-sm tracking-wider uppercase">
                Daily System Usage (Last 14 Days)
              </h3>
              <DailyUsageChart data={stats?.dailyUsage} />
            </div>

            {/* Category Distribution Chart */}
            <div className="glass-panel rounded-2xl p-6 border border-darkbg-border">
              <h3 className="font-display font-bold text-gray-200 text-sm tracking-wider uppercase">
                Story Category Spread
              </h3>
              <CategoryChart data={stats?.topCategories} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
