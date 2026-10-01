import React from 'react'
import Chart from 'react-apexcharts'

interface ChartsSectionProps {
  purposeDistribution: { name: string; value: number }[]
  sourceDistribution: { name: string; value: number }[]
  complaintTypes: { name: string; value: number }[]
  callTypes: { name: string; value: number }[]
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  purposeDistribution,
  sourceDistribution,
  complaintTypes,
  callTypes,
}) => {
  const makeDonut = (
    data: { name: string; value: number }[],
    colors: string[],
    totalLabel: string,
  ): { series: number[]; options: ApexCharts.ApexOptions } => ({
    series: data.map((d) => d.value),
    options: {
      chart: {
        type: 'donut',
        animations: { enabled: true, speed: 800 },
      },
      labels: data.map((d) => d.name),
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                color: '#111827',
                formatter: (val: string) => val,
              },
              total: {
                show: true,
                showAlways: true,
                label: totalLabel,
                fontSize: '12px',
                fontWeight: 600,
                color: '#6b7280',
                formatter: (w: any) =>
                  w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        fontWeight: 600,
        formatter: (seriesName: string, opts: any) =>
          `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`,
      },
      colors,
      tooltip: {
        y: { formatter: (val: number) => `${val}` },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { width: 240 },
            legend: { fontSize: '10px' },
          },
        },
      ],
    },
  })

  const charts = [
    {
      title: 'Purpose Distribution',
      data: purposeDistribution,
      chart: makeDonut(
        purposeDistribution.slice(0, 6),
        ['#3B82F6', '#60A5FA', '#93C5FD', '#1D4ED8', '#2563EB', '#BFDBFE'],
        'Total Visits',
      ),
    },
    {
      title: 'Source Distribution',
      data: sourceDistribution,
      chart: makeDonut(
        sourceDistribution.slice(0, 6),
        ['#10B981', '#34D399', '#6EE7B7', '#059669', '#047857', '#A7F3D0'],
        'Total Enquiries',
      ),
    },
    {
      title: 'Call Types',
      data: callTypes,
      chart: makeDonut(callTypes, ['#8B5CF6', '#A78BFA', '#C4B5FD', '#7C3AED'], 'Total Calls'),
    },
    {
      title: 'Complaint Types',
      data: complaintTypes,
      chart: makeDonut(
        complaintTypes.slice(0, 6),
        ['#F59E0B', '#FBBF24', '#FCD34D', '#D97706', '#B45309', '#FDE68A'],
        'Total Complaints',
      ),
    },
  ]

  const hasData = (data: { name: string; value: number }[]) =>
    data.length > 0 && data.some((d) => d.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {charts.map(({ title, data, chart }) => (
        <div
          key={title}
          className="bg-white shadow-lg rounded-xl p-6 border border-gray-200
                     hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-6">{title}</h3>
          {hasData(data) ? (
            <div className="flex justify-center">
              <Chart options={chart.options} series={chart.series} type="donut" height={300} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-400 text-sm">No data available</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChartsSection
