import { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi, LineData } from 'lightweight-charts';
import { DataPoint } from '../../api/types';

interface ChartWrapperProps {
  data: DataPoint[];
  color: string;
  height?: number;
  title?: string;
  isArea?: boolean;
}

export function ChartWrapper({ data, color, height = 350, title, isArea = false }: ChartWrapperProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.5)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 1)',
      },
    });

    const formattedData = data.map(d => ({
      time: d.time,
      value: d.value,
    })) as LineData[];

    if (isArea) {
      const series = chart.addAreaSeries({
        lineColor: color,
        topColor: `${color}80`,
        bottomColor: `${color}10`,
        lineWidth: 2,
      });
      series.setData(formattedData);
    } else {
      const series = chart.addLineSeries({
        color,
        lineWidth: 2,
      });
      series.setData(formattedData);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, color, height, isArea]);

  return (
    <div className="relative w-full">
      {title && <h3 className="absolute top-4 left-4 z-10 text-sm font-semibold text-slate-300">{title}</h3>}
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
