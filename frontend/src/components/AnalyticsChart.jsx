import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';

// Custom Tooltip component for dark mode styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-darkbg-card border border-darkbg-border p-3 rounded-lg shadow-xl font-mono text-xs">
        <p className="text-gray-400 font-semibold mb-1">{label}</p>
        <p className="text-brand font-bold">Generations: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const DailyUsageChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
        No daily usage data available.
      </div>
    );
  }

  // Format date labels nicely (e.g. "Jun 05")
  const formattedData = data.map(item => {
    try {
      const date = new Date(item.date);
      return {
        ...item,
        formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
      };
    } catch {
      return item;
    }
  });

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff5722" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ff5722" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
          <XAxis 
            dataKey="formattedDate" 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#ff5722" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
        No category distribution data available.
      </div>
    );
  }

  // Color palette for bars (orange accents ranging to dark coral/yellow)
  const COLORS = ['#ff5722', '#ff8a50', '#e64a19', '#ffb74d', '#ff9800'];

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 87, 34, 0.05)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-darkbg-card border border-darkbg-border p-3 rounded-lg shadow-xl font-mono text-xs">
                    <p className="text-gray-400 font-semibold mb-1">{label}</p>
                    <p className="text-brand font-bold">Stories: {payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
