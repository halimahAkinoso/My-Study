import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function ProgressChart({
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri"],
  values = [20, 35, 50, 70, 90],
}) {
  const data = {
    labels,
    datasets: [
      {
        label: "Progress",
        data: values,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.16)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default ProgressChart;
