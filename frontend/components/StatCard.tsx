import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    gradient: 'from-purple-500 to-purple-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    gradient: 'from-orange-500 to-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    gradient: 'from-red-500 to-red-600',
  },
};

export default function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-0 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className={`text-3xl font-bold ${colors.text}`}>{value}</h3>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <i
                className={`pi ${
                  trend.isPositive ? 'pi-arrow-up' : 'pi-arrow-down'
                } text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
              ></i>
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center`}>
          <i className={`${icon} text-2xl ${colors.text}`}></i>
        </div>
      </div>
    </div>
  );
}
