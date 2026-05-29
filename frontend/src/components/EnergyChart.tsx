import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TimelinePoint } from '../types/energy'

type EnergyChartProps = {
  timeline: TimelinePoint[]
  currentTimeIndex: number
}

export function EnergyChart({ timeline, currentTimeIndex }: EnergyChartProps) {
  const activePoint = timeline[currentTimeIndex]

  return (
    <section className="panel chart-panel">
      <div className="panel-title">
        <span>Actual vs Predicted Energy</span>
        <strong>{activePoint?.timeLabel}</strong>
      </div>

      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeline} margin={{ top: 8, right: 10, bottom: 16, left: -18 }}>
            <CartesianGrid stroke="#203749" strokeDasharray="3 3" />
            <XAxis dataKey="timeLabel" interval={5} tick={{ fill: '#8fa8b7', fontSize: 10 }} />
            <YAxis tick={{ fill: '#8fa8b7', fontSize: 10 }} width={48} />
            <Tooltip
              contentStyle={{
                background: '#07131d',
                border: '1px solid #244357',
                borderRadius: 6,
                color: '#d8eef7',
              }}
            />
            {/* 선 색상의 의미입니다. 백엔드 연결 후에도 dataKey만 유지하면 범례는 자동 갱신. */}
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="line"
              wrapperStyle={{
                color: '#9fb6c4',
                fontSize: 11,
                paddingTop: 4,
              }}
            />
            <ReferenceLine y={activePoint?.threshold} stroke="#f0c84b" strokeDasharray="5 5" />
            <ReferenceLine x={activePoint?.timeLabel} stroke="#72f3ff" strokeOpacity={0.7} />
            <Line
              dataKey="actualConsumption"
              name="Actual"
              type="monotone"
              stroke="#77d7ff"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="predictedConsumption"
              name="Predicted"
              type="monotone"
              stroke="#f6c34a"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
