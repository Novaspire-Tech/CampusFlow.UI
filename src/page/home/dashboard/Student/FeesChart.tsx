import React, { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import { getDashboardText } from '../../../../helpers/useTranslations'
import { useTranslation } from 'react-i18next'
import { feeTransactionService } from '../../../../services/feesCollection/feeTransactionService'
import { financeApi } from '../../../../services/apis/financeApi'

interface BarChartProps {
  title: string
  chartData: {
    series: ApexAxisChartSeries
    options: ApexCharts.ApexOptions
  }
}

interface FeesChartProps {
  onMonthlyDataUpdate?: (feesData: number[], expensesData: number[]) => void
  allSchoolsData?: any | null
}

const generateChartData = (
  feesData: number[],
  expensesData: number[],
  categories: string[],
  colors: string[],
  feesLabel: string,
  expLabel: string,
  xAxisTitle?: string,
  monthName?: string,
  year?: number,
): { series: ApexAxisChartSeries; options: ApexCharts.ApexOptions } => ({
  series: [
    { name: feesLabel, data: feesData },
    { name: expLabel, data: expensesData },
  ],
  options: {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: '60%',
        distributed: false,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: {
        text: xAxisTitle || 'Timeline',
        style: { fontSize: '12px', fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return '₹' + val.toFixed(0)
        },
      },
      title: {
        text: 'Amount (₹)',
        style: { fontSize: '12px', fontWeight: 600 },
      },
      min: 0,
      tickAmount: 5,
    },
    colors,
    legend: {
      position: 'top',
      fontSize: '14px',
      labels: { colors: '#333' },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return '₹' + val.toFixed(2)
        },
      },
      x: {
        formatter: function (_, { dataPointIndex, w }) {
          const label = w.config.xaxis.categories[dataPointIndex]
          const yearNum = year || new Date().getFullYear()
          if (monthName) {
            return `${label} ${monthName} ${yearNum}`
          } else {
            return `${label} ${yearNum}`
          }
        },
      },
    },
    stroke: {
      width: 1,
      colors: ['transparent'],
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 320 },
          legend: { position: 'top' },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: { height: 300 },
          legend: { position: 'bottom' },
          xaxis: {
            labels: { rotate: -30, style: { fontSize: '10px' } },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 280 },
          legend: { position: 'bottom' },
          xaxis: {
            labels: { rotate: -20, style: { fontSize: '9px' } },
          },
        },
      },
    ],
  },
})

const BarChart: React.FC<BarChartProps> = ({ title, chartData }) => (
  <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 w-full sm:w-[90%] max-w-full">
    <h3 className="text-base md:text-lg font-semibold text-center text-gray-800 mb-4">{title}</h3>
    <Chart
      options={chartData.options}
      series={chartData.series}
      type="bar"
      height={(chartData.options.chart as any)?.height || 350}
    />
  </div>
)

const FeesChart: React.FC<FeesChartProps> = ({ onMonthlyDataUpdate, allSchoolsData }) => {
  const { t } = useTranslation()
  const dashboardText = getDashboardText(t)
  const fees = dashboardText.feesCollected
  const exp = dashboardText.expenses

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthlyFeesData, setMonthlyFeesData] = useState<number[]>([])
  const [monthlyExpensesData, setMonthlyExpensesData] = useState<number[]>([])
  const [yearlyFeesData, setYearlyFeesData] = useState<number[]>([])
  const [yearlyExpensesData, setYearlyExpensesData] = useState<number[]>([])
  const [chartDays, setChartDays] = useState<string[]>([])
  const [dataMonth, setDataMonth] = useState<string>('')
  const [dataYear, setDataYear] = useState<number>(new Date().getFullYear())

  const getCurrentDateInfo = () => {
    const now = new Date()
    return {
      currentDay: now.getDate(),
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
      monthName: now.toLocaleString('default', { month: 'long' }),
    }
  }

  const parseDate = (dateString: string): Date => {
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number)
        return new Date(year, month - 1, day)
      } else if (dateString.includes('-')) {
        return new Date(dateString)
      }
      return new Date()
    } catch (e) {
      console.warn('Failed to parse date:', dateString, e)
      return new Date()
    }
  }

  const isCurrentMonth = (date: Date): boolean => {
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  const isCurrentYear = (date: Date): boolean => {
    const now = new Date()
    return date.getFullYear() === now.getFullYear()
  }

  const getDayOfMonth = (date: Date): number => date.getDate()
  const getMonthOfYear = (date: Date): number => date.getMonth()

  const processData = (data: any[], type: 'fees' | 'expenses') => {
    const currentDateInfo = getCurrentDateInfo()
    const { currentDay } = currentDateInfo
    const chartDaysCount = Math.min(currentDay, 31)
    const dailyData = Array(chartDaysCount).fill(0)
    const monthlyData = Array(12).fill(0)

    data.forEach((item: any) => {
      try {
        const date = parseDate(item.date)
        const amount = parseFloat(item.amount) || 0

        if (isCurrentMonth(date)) {
          const day = getDayOfMonth(date)
          if (day >= 1 && day <= chartDaysCount) {
            dailyData[day - 1] += amount
          }
        }

        if (isCurrentYear(date)) {
          const month = getMonthOfYear(date)
          if (month >= 0 && month <= 11) {
            monthlyData[month] += amount
          }
        }
      } catch (e) {
        console.warn(`Error processing ${type} data:`, item, e)
      }
    })

    return { dailyData, monthlyData }
  }

  const processFromFinancialReports = (financialReports: any) => {
    const currentDateInfo = getCurrentDateInfo()
    const { currentDay, monthName, currentYear } = currentDateInfo

    const chartDaysCount = Math.min(currentDay, 31)
    const dayLabels = Array.from({ length: chartDaysCount }, (_, i) =>
      (i + 1).toString().padStart(2, '0'),
    )

    const dailyFeesMap = financialReports.dailyFeesTransaction || {}
    const dailyExpMap = financialReports.dailyExpense || {}

    const monthlyFeesArr = dayLabels.map((d) => Number(dailyFeesMap[d]) || 0)
    const monthlyExpArr = dayLabels.map((d) => Number(dailyExpMap[d]) || 0)

    const yearlyIncomeMap = financialReports.yearlyIncome || {}
    const yearlyExpMap = financialReports.yearlyExpense || {}

    const yearlyFeesArr = Array.from({ length: 12 }, (_, i) => {
      const entry = yearlyIncomeMap[String(i + 1)]
      return Array.isArray(entry) ? Number(entry[1]) || 0 : Number(entry) || 0
    })

    const yearlyExpArr = Array.from({ length: 12 }, (_, i) => {
      const entry = yearlyExpMap[String(i + 1)]
      return Array.isArray(entry) ? Number(entry[1]) || 0 : Number(entry) || 0
    })

    setDataMonth(monthName)
    setDataYear(currentYear)
    setChartDays(dayLabels)
    setMonthlyFeesData(monthlyFeesArr)
    setMonthlyExpensesData(monthlyExpArr)
    setYearlyFeesData(yearlyFeesArr)
    setYearlyExpensesData(yearlyExpArr)

    if (onMonthlyDataUpdate) {
      onMonthlyDataUpdate(monthlyFeesArr, monthlyExpArr)
    }

    setLoading(false)
    setError(null)
  }

  useEffect(() => {
    if (allSchoolsData) {
      processFromFinancialReports(allSchoolsData)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const currentDateInfo = getCurrentDateInfo()
        const { currentDay, monthName, currentYear } = currentDateInfo

        const token = localStorage.getItem('accessToken')
        const schoolCode = localStorage.getItem('schoolCode')

        if (!schoolCode || !token) {
          setError(dashboardText.Authentication_Required)
          setLoading(false)
          return
        }

        const [feeTransactions, expensesResponse] = await Promise.all([
          feeTransactionService.getAll(0, 10000, 'asc'),
          financeApi.getExpenses(),
        ])

        const expensesData = expensesResponse?.data?.addExpenses || []

        console.log(`Fetched ${feeTransactions.feeTransactions?.length || 0} fee transactions`)
        console.log(`Fetched ${expensesData.length} expenses`)

        const feesProcessed = processData(feeTransactions.feeTransactions || [], 'fees')
        const expensesProcessed = processData(expensesData, 'expenses')

        const chartDaysCount = Math.min(currentDay, 31)
        const dayLabels = Array.from({ length: chartDaysCount }, (_, i) =>
          (i + 1).toString().padStart(2, '0'),
        )

        setDataMonth(monthName)
        setDataYear(currentYear)
        setChartDays(dayLabels)
        setMonthlyFeesData(feesProcessed.dailyData)
        setMonthlyExpensesData(expensesProcessed.dailyData)

        if (onMonthlyDataUpdate) {
          onMonthlyDataUpdate(feesProcessed.dailyData, expensesProcessed.dailyData)
        }

        setYearlyFeesData(feesProcessed.monthlyData)
        setYearlyExpensesData(expensesProcessed.monthlyData)
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message || dashboardText.Failed_To_Load_Data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [allSchoolsData])

  const monthlyChartTitle = `${dashboardText.Fees_Collection_Expenses_For} ${dataMonth} ${dataYear}`
  const monthlyChartData = generateChartData(
    monthlyFeesData,
    monthlyExpensesData,
    chartDays,
    ['#E91E63', '#00C853'],
    fees,
    exp,
    `${dashboardText.Days_Of} ${dataMonth}`,
    dataMonth,
    dataYear,
  )

  const yearlyChartTitle = `${dashboardText.Income_Expenses} - ${dataYear}`
  const yearlyChartData = generateChartData(
    yearlyFeesData,
    yearlyExpensesData,
    [
      dashboardText.Jan,
      dashboardText.Feb,
      dashboardText.Mar,
      dashboardText.Apr,
      dashboardText.May,
      dashboardText.Jun,
      dashboardText.Jul,
      dashboardText.Aug,
      dashboardText.Sep,
      dashboardText.Oct,
      dashboardText.Nov,
      dashboardText.Dec,
    ],
    ['#FFC107', '#795548'],
    fees,
    exp,
    dashboardText.Months_Of_Year,
    undefined,
    dataYear,
  )

  if (loading) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 w-full sm:w-[90%] max-w-full">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 w-full sm:w-[90%] max-w-full">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 w-full sm:w-[90%] max-w-full text-center">
          <p className="text-red-500 font-semibold mb-2">{dashboardText.Error_Loading_Data}</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <div className="mt-3 text-sm text-gray-500">
            <p>
              {dashboardText.Current_Month}: {dataMonth} {dataYear}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {dashboardText.Retry}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
      <BarChart title={monthlyChartTitle} chartData={monthlyChartData} />
      <BarChart title={yearlyChartTitle} chartData={yearlyChartData} />
    </div>
  )
}

export default FeesChart
