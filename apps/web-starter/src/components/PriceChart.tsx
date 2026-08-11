'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BaselineSeries,
  ColorType,
  CrosshairMode,
  LineStyle,
  createChart,
  type BaselineData,
  type IChartApi,
  type ISeriesApi,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import {
  RANGE_LABELS,
  type HistoryRange,
  type PricePoint,
} from '@/lib/api/contracts';
import { chartPriceDomain, chartPriceScale, describeSeries } from '@/lib/chart';
import { formatPrice } from '@/lib/format';

function formatTick(time: Time, range: HistoryRange) {
  const seconds =
    typeof time === 'number' ? time : Date.parse(String(time)) / 1000;
  const date = new Date(seconds * 1000);
  if (range === '1h' || range === '24h') {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }).format(date);
  }
  if (range === '7d') {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }
  if (range === '30d' || range === '90d') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

function formatTooltipTime(time: Time) {
  const seconds =
    typeof time === 'number' ? time : Date.parse(String(time)) / 1000;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(seconds * 1000));
}

export function PriceChart({
  points,
  range,
  symbol,
}: {
  points: PricePoint[];
  range: HistoryRange;
  symbol: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Baseline'> | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    price: number;
    time: Time;
  } | null>(null);
  const summary = useMemo(() => describeSeries(points), [points]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !summary) return;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9391a1',
        fontFamily: "Haffer, Inter, 'Segoe UI', sans-serif",
        fontSize: 12,
      },
      localization: { priceFormatter: (price: number) => formatPrice(price) },
      grid: {
        vertLines: {
          color: 'rgba(255,255,255,0.065)',
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: 'rgba(255,255,255,0.065)',
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#5d5768', labelBackgroundColor: '#292532' },
        horzLine: { color: '#5d5768', labelBackgroundColor: '#292532' },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.12 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: range === '1h' || range === '24h',
        secondsVisible: false,
        rightOffset: 2,
        tickMarkFormatter: (time: Time) => formatTick(time, range),
      },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: {
        mouseWheel: false,
        pinch: true,
        axisPressedMouseMove: false,
      },
    });
    const series = chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: summary.open },
      topLineColor: '#57d314',
      topFillColor1: 'rgba(87,211,20,0.10)',
      topFillColor2: 'rgba(87,211,20,0)',
      bottomLineColor: '#ff707d',
      bottomFillColor1: 'rgba(255,112,125,0)',
      bottomFillColor2: 'rgba(255,112,125,0.10)',
      lineWidth: 2,
      priceLineVisible: false,
      baseLineVisible: true,
      baseLineColor: 'rgba(255,255,255,0.20)',
      baseLineStyle: LineStyle.Dotted,
      lastValueVisible: true,
      pointMarkersVisible: points.length === 1,
      pointMarkersRadius: 4,
      priceFormat: { type: 'price', ...chartPriceScale(summary.close) },
      autoscaleInfoProvider: () => ({
        priceRange: chartPriceDomain(summary.low, summary.high),
      }),
    });
    const data: BaselineData[] = points.map((point) => ({
      time: point.time as UTCTimestamp,
      value: point.price,
    }));
    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = series;

    const crosshair = (param: MouseEventParams<Time>) => {
      if (!param.point || !param.time) {
        setTooltip(null);
        return;
      }
      const datum = param.seriesData.get(series);
      if (!datum || !('value' in datum) || typeof datum.value !== 'number') {
        setTooltip(null);
        return;
      }
      setTooltip({
        x: Math.min(
          param.point.x + 14,
          Math.max(8, container.clientWidth - 150),
        ),
        y: param.point.y,
        price: datum.value,
        time: param.time,
      });
    };
    chart.subscribeCrosshairMove(crosshair);
    const observer = new ResizeObserver(([entry]) => {
      chart.applyOptions({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      chart.unsubscribeCrosshairMove(crosshair);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [points, range, summary]);

  if (!summary) return null;
  return (
    <figure aria-labelledby="price-chart-caption">
      <figcaption id="price-chart-caption" className="sr-only">
        {symbol} {RANGE_LABELS[range]} price chart in UTC.{' '}
        {summary.pointCount.toLocaleString()} points. Open{' '}
        {formatPrice(summary.open)}, close {formatPrice(summary.close)}, high{' '}
        {formatPrice(summary.high)}, low {formatPrice(summary.low)}. Price
        finished {summary.direction}.
      </figcaption>
      <div className="relative h-[432px] w-full">
        <div
          ref={containerRef}
          className="absolute inset-0"
          aria-hidden="true"
        />
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 min-w-32 rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl"
            style={{
              left: tooltip.x,
              top: Math.max(8, tooltip.y - 58),
            }}
          >
            <p className="tabular font-medium">{formatPrice(tooltip.price)}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {formatTooltipTime(tooltip.time)} UTC
            </p>
          </div>
        )}
      </div>
    </figure>
  );
}
