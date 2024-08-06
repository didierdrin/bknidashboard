import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'yearly';

type MockDataType = {
  [key in TimeFrame]: {
    labels: any;
    data: any;
  };
};

const Overview = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('daily');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  });

  useEffect(() => {
    // Mock data - replace with actual data fetching logic
    const mockData: MockDataType = {
      daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12, 19, 3, 5, 2, 3, 9],
      },
      weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [65, 59, 80, 81],
      },
      monthly: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [65, 59, 80, 81, 56, 55],
      },
      yearly: {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        data: [300, 450, 400, 500, 550],
      },
    };

    setChartData({
      labels: mockData[timeFrame].labels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: mockData[timeFrame].data,
        },
      ],
    });
  }, [timeFrame]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sales Over Time',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Sales Overview</h3>
      <div className="mb-4">
        <label htmlFor="timeFrame" className="mr-2">Select time frame:</label>
        <select
          id="timeFrame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="border rounded p-1"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default Overview;