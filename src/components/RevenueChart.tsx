import { FC, useMemo } from "react"

interface RevenueChartProps {
  data?: Array<{ day: string; revenue: number }>
  height?: number
}

const RevenueChart: FC<RevenueChartProps> = ({ data, height = 200 }) => {
  // Use provided data or generate sample data for demonstration
  const chartData = useMemo(() => {
    if (data && data.length > 0) {
      return data
    }
    
    // If no data provided, show empty state instead of random data
    return []
  }, [data])
  
  // Show empty state if no data
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="text-lg mb-2">No revenue data available</p>
        {/* <p className="text-sm text-gray-400">Data will appear once transactions are recorded</p> */}
      </div>
    )
  }

  // Calculate chart dimensions
  const width = 600
  const padding = { top: 20, right: 40, bottom: 30, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Find min and max values for scaling
  const maxRevenue = Math.max(...chartData.map(d => d.revenue))
  const minRevenue = Math.min(...chartData.map(d => d.revenue))
  const revenueRange = maxRevenue - minRevenue || maxRevenue || 100 // Prevent zero range
  
  // Add some padding to the range
  const maxY = maxRevenue > 0 ? maxRevenue + revenueRange * 0.1 : 100
  const minY = 0 // Always start from 0 for revenue
  const range = maxY - minY

  // Calculate points for the path
  const points = chartData.map((item, index) => {
    const x = padding.left + (index * chartWidth) / (Math.max(chartData.length - 1, 1))
    const y = padding.top + chartHeight - ((item.revenue - minY) / range) * chartHeight
    return { x, y, revenue: item.revenue, day: item.day }
  })

  // Create the line path
  const linePath = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
  ).join(' ')

  // Create the area path
  const firstPoint = points[0]!
  const lastPoint = points[points.length - 1]!
  const areaPath = `
    M ${firstPoint.x},${padding.top + chartHeight}
    L ${firstPoint.x},${firstPoint.y}
    ${points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}
    L ${lastPoint.x},${padding.top + chartHeight}
    Z
  `

  // Generate Y-axis labels
  const yAxisSteps = 5
  const yLabels = Array.from({ length: yAxisSteps }, (_, i) => {
    const value = maxY - (i * range) / (yAxisSteps - 1)
    return {
      value,
      y: padding.top + (i * chartHeight) / (yAxisSteps - 1),
      label: value >= 1000 ? `₹${(value / 1000).toFixed(0)}k` : `₹${value.toFixed(0)}`,
    }
  })

  // Find the point with highest revenue for tooltip
  const maxPoint = points.reduce((max: { x: number; y: number; revenue: number; day: string }, p) => 
    p.revenue > max.revenue ? p : max, 
    points[0]!
  )

  return (
    <div className="relative w-full" style={{ height: `${height + 40}px` }}>
      <svg
        viewBox={`0 0 ${width} ${height + 20}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={label.y}
              x2={width - padding.right}
              y2={label.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 10}
              y={label.y + 4}
              fontSize="10"
              fill="#9ca3af"
              textAnchor="end"
            >
              {label.label}
            </text>
          </g>
        ))}

        {/* Area gradient */}
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Area path */}
        <path
          d={areaPath}
          fill="url(#revenueGradient)"
          stroke="none"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#fb923c"
          strokeWidth="2.5"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="white"
            stroke="#fb923c"
            strokeWidth="2"
            className="hover:r-5 transition-all cursor-pointer"
          />
        ))}

        {/* Highlight max point */}
        <circle
          cx={maxPoint.x}
          cy={maxPoint.y}
          r="5"
          fill="#fb923c"
          stroke="white"
          strokeWidth="2"
        />

        {/* Tooltip for max point */}
        <g>
          <rect
            x={maxPoint.x - 40}
            y={maxPoint.y - 40}
            width="80"
            height="30"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
            rx="4"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <text
            x={maxPoint.x}
            y={maxPoint.y - 28}
            fontSize="9"
            fill="#6b7280"
            textAnchor="middle"
          >
            Revenue
          </text>
          <text
            x={maxPoint.x}
            y={maxPoint.y - 16}
            fontSize="11"
            fontWeight="bold"
            fill="#16a34a"
            textAnchor="middle"
          >
            ₹{maxPoint.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </text>
        </g>

        {/* X-axis labels */}
        {points.map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={height}
            fontSize="11"
            fill="#6b7280"
            textAnchor="middle"
          >
            {chartData[i]?.day || ''}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default RevenueChart
