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

function ProgressChart() {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Progress",
        data: [20, 35, 50, 70, 90],
      },
    ],
  };

  return <Line data={data} />;
}

export default ProgressChart;