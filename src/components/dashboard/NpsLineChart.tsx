// src/components/dashboard/NpsLineChart.tsx

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
interface NpsTrendData {
  day: string;
  nps_score: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface NpsLineChartProps {
  chartData: NpsTrendData[];
}

export const NpsLineChart: React.FC<NpsLineChartProps> = ({ chartData }) => {
  const data = {
    labels: chartData.map(d => d.day),
    datasets: [
      {
        label: 'NPS',
        data: chartData.map(d => d.nps_score),
        borderColor: '#DDF247',
        backgroundColor: 'rgba(221, 242, 71, 0.2)',
        tension: 0.4, // Deixa a linha curvada, como antes
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: -100,
        max: 100,
        ticks: { color: '#9ca3af' },
        grid: { color: '#404040' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(0,0,0,0)' },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#ffffff'
        }
      },
    },
  };

  return <Line options={options} data={data} />;
};