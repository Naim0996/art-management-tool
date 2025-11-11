'use client';

import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { useLocale } from 'next-intl';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalPersonaggi: number;
  totalRevenue: number;
}

interface SalesDataItem {
  month: string;
  sales: number;
}

interface ActivityItem {
  type: string;
  description: string;
  time: string;
}

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalPersonaggi: number;
  totalRevenue: number;
  salesData?: SalesDataItem[];
  recentActivity?: ActivityItem[];
}

export default function AdminDashboard() {
  const locale = useLocale();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalPersonaggi: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      fill: boolean;
      borderColor: string;
      tension: number;
    }>;
  }>({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        fill: false,
        borderColor: '#8B5CF6',
        tension: 0.4,
      },
    ],
  });
  const [recentActivities, setRecentActivities] = useState<Array<{
    type: string;
    description: string;
    time: string;
  }>>([]);

  const [chartOptions] = useState({
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: '#495057',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#495057',
        },
        grid: {
          color: '#ebedef',
        },
      },
      y: {
        ticks: {
          color: '#495057',
        },
        grid: {
          color: '#ebedef',
        },
      },
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        
        // Fetch all stats from single endpoint
        const response = await fetch('http://giorgiopriviteralab.com:8080/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const data: DashboardData = await response.json();
        
        // Update stats
        setStats({
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalPersonaggi: data.totalPersonaggi || 0,
          totalRevenue: data.totalRevenue || 0,
        });
        
        // Update chart data
        if (data.salesData && data.salesData.length > 0) {
          setChartData({
            labels: data.salesData.map((item: SalesDataItem) => item.month),
            datasets: [
              {
                label: 'Sales',
                data: data.salesData.map((item: SalesDataItem) => item.sales),
                fill: false,
                borderColor: '#8B5CF6',
                tension: 0.4,
              },
            ],
          });
        }
        
        // Update recent activities
        if (data.recentActivity && data.recentActivity.length > 0) {
          setRecentActivities(data.recentActivity.map((activity: ActivityItem) => ({
            type: activity.type,
            description: activity.description,
            time: formatTimeAgo(new Date(activity.time)),
          })));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
    return `${Math.floor(seconds / 2592000)} months ago`;
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: 'pi pi-shopping-cart',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: 'pi pi-list',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Personaggi',
      value: stats.totalPersonaggi,
      icon: 'pi pi-users',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: 'pi pi-dollar',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to the admin panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="shadow-lg border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                {loading ? (
                  <i className="pi pi-spin pi-spinner text-2xl text-gray-400"></i>
                ) : (
                  <h3 className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</h3>
                )}
              </div>
              <div
                className={`w-16 h-16 rounded-full ${stat.bgColor} flex items-center justify-center`}
              >
                <i className={`${stat.icon} text-2xl ${stat.textColor}`}></i>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sales Overview" className="shadow-lg">
          <Chart type="line" data={chartData} options={chartOptions} style={{ height: '300px' }} />
        </Card>

        <Card title="Quick Actions" className="shadow-lg">
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = `/${locale}/admin/personaggi`)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <i className="pi pi-users text-2xl"></i>
                <span className="font-medium">Manage Personaggi</span>
              </div>
              <i className="pi pi-arrow-right"></i>
            </button>

            <button
              onClick={() => (window.location.href = `/${locale}/admin/products`)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <i className="pi pi-shopping-cart text-2xl"></i>
                <span className="font-medium">Manage Products</span>
              </div>
              <i className="pi pi-arrow-right"></i>
            </button>

            <button
              onClick={() => (window.location.href = `/${locale}/admin/orders`)}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <i className="pi pi-list text-2xl"></i>
                <span className="font-medium">View Orders</span>
              </div>
              <i className="pi pi-arrow-right"></i>
            </button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity" className="shadow-lg">
        {loading ? (
          <div className="text-center py-8">
            <i className="pi pi-spin pi-spinner text-3xl text-gray-400"></i>
          </div>
        ) : recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const iconClass = activity.type === 'personaggio' 
                ? 'pi-users text-purple-600 bg-purple-100'
                : 'pi-shopping-cart text-blue-600 bg-blue-100';
              
              return (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass}`}>
                    <i className={`pi ${iconClass.split(' ')[0]}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
          </div>
        )}
      </Card>
    </div>
  );
}
