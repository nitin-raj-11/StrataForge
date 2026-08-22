import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
} from "lightweight-charts";

interface DrawdownPoint {
  time: string;
  value: number;
}

interface DrawdownChartProps {
  data: DrawdownPoint[];
}

function DrawdownChart({
  data,
}: DrawdownChartProps) {
  const chartContainerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = createChart(
      chartContainerRef.current,
      {
        width: chartContainerRef.current.clientWidth,
        height: 350,

        layout: {
          background: {
            type: ColorType.Solid,
            color: "#11161d",
          },
          textColor: "#8d99a8",
        },

        grid: {
          vertLines: {
            color: "#1d252f",
          },
          horzLines: {
            color: "#1d252f",
          },
        },

        rightPriceScale: {
          borderColor: "#303946",
        },

        timeScale: {
          borderColor: "#303946",
        },
      }
    );

    const series = chart.addSeries(LineSeries, {
      lineWidth: 2,
    });

    series.setData(data);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (!chartContainerRef.current) {
        return;
      }

      chart.applyOptions({
        width:
          chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      chart.remove();
    };
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="chart-container"
    />
  );
}

export default DrawdownChart;