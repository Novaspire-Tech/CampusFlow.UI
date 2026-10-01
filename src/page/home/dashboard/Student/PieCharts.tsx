import React, { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import { useTranslation } from 'react-i18next'
import { getDashboardText } from '../../../../helpers/useTranslations'
import { financeApi } from '../../../../services/apis/financeApi'

interface IncomeHeadData {
  incomeHead: string
  amount: number
  color?: string
}

interface ExpenseHeadData {
  expenseHead: string
  amount: number
  color?: string
}

interface PieChartsProps {
  allSchoolsData?: any | null
}

const PieCharts: React.FC<PieChartsProps> = ({ allSchoolsData }) => {
  const { t } = useTranslation()
  const dashboardText = getDashboardText(t)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [incomeHeadData, setIncomeHeadData] = useState<IncomeHeadData[]>([])
  const [expenseHeadData, setExpenseHeadData] = useState<ExpenseHeadData[]>([])
  const [currentMonth, setCurrentMonth] = useState<string>('')

  const incomeColors = [
    '#8BC34A',
    '#FFEB3B',
    '#4CAF50',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B',
  ]

  const expenseColors = [
    '#AB47BC',
    '#1E88E5',
    '#5C6BC0',
    '#26A69A',
    '#FFA726',
    '#EC407A',
    '#7E57C2',
    '#42A5F5',
    '#66BB6A',
    '#FF7043',
  ]

  const getCurrentMonthName = (): string => {
    const now = new Date()
    return now.toLocaleString('default', { month: 'long' })
  }

  const getCurrentYear = (): number => new Date().getFullYear()

  const parseDate = (dateString: string): Date => {
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number)
        return new Date(year, month - 1, day)
      }
      return new Date(dateString)
    } catch (e) {
      console.warn('Failed to parse date:', dateString, e)
      return new Date()
    }
  }

  const isCurrentMonth = (date: Date): boolean => {
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  useEffect(() => {
    const monthName = getCurrentMonthName()
    setCurrentMonth(monthName)

    if (allSchoolsData) {
      const incomeMap = allSchoolsData.monthlyTotalIncome || {}
      const expenseMap = allSchoolsData.monthlyTotalExpense || {}

      const incomeArr: IncomeHeadData[] = Object.entries(incomeMap).map(([key, val], idx) => ({
        incomeHead: key,
        amount: Number(val) || 0,
        color: incomeColors[idx % incomeColors.length],
      }))

      const expenseArr: ExpenseHeadData[] = Object.entries(expenseMap).map(([key, val], idx) => ({
        expenseHead: key,
        amount: Number(val) || 0,
        color: expenseColors[idx % expenseColors.length],
      }))

      setIncomeHeadData(incomeArr)
      setExpenseHeadData(expenseArr)
      setLoading(false)
      setError(null)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const schoolCode = localStorage.getItem('schoolCode')
        const token = localStorage.getItem('accessToken')

        if (!schoolCode) {
          setError(dashboardText.School_Code_Not_Found)
          setLoading(false)
          return
        }

        if (!token) {
          setError(dashboardText.Token_Not_Found)
          setLoading(false)
          return
        }

        const [incomeResponse, expenseResponse] = await Promise.all([
          financeApi.getIncome(),
          financeApi.getExpenses(),
        ])

        const incomeHeadsMap = new Map<string, number>()

        if (incomeResponse?.data?.addIncomes) {
          incomeResponse.data.addIncomes.forEach((income: any) => {
            try {
              const date = parseDate(income.date)
              if (isCurrentMonth(date)) {
                const incomeHead =
                  income.incomeHead?.incomeHead || dashboardText.Unknown_Income_Head
                const amount = parseFloat(income.amount) || 0
                if (incomeHeadsMap.has(incomeHead)) {
                  incomeHeadsMap.set(incomeHead, incomeHeadsMap.get(incomeHead)! + amount)
                } else {
                  incomeHeadsMap.set(incomeHead, amount)
                }
              }
            } catch (e) {
              console.warn('Error processing income record:', income, e)
            }
          })
        }

        const incomeHeadsArray = Array.from(incomeHeadsMap, ([incomeHead, amount]) => ({
          incomeHead,
          amount,
        })).sort((a, b) => b.amount - a.amount)

        const incomeDataWithColors = incomeHeadsArray.map((item, index) => ({
          ...item,
          color: incomeColors[index % incomeColors.length],
        }))

        setIncomeHeadData(incomeDataWithColors)

        const expenseHeadsMap = new Map<string, number>()

        if (expenseResponse?.data?.addExpenses) {
          expenseResponse.data.addExpenses.forEach((expense: any) => {
            try {
              const date = parseDate(expense.date)
              if (isCurrentMonth(date)) {
                const expenseHead =
                  expense.expenseHead?.expenseHead || dashboardText.Unknown_Expense_Head
                const amount = parseFloat(expense.amount) || 0
                if (expenseHeadsMap.has(expenseHead)) {
                  expenseHeadsMap.set(expenseHead, expenseHeadsMap.get(expenseHead)! + amount)
                } else {
                  expenseHeadsMap.set(expenseHead, amount)
                }
              }
            } catch (e) {
              console.warn('Error processing expense record:', expense, e)
            }
          })
        }

        const expenseHeadsArray = Array.from(expenseHeadsMap, ([expenseHead, amount]) => ({
          expenseHead,
          amount,
        })).sort((a, b) => b.amount - a.amount)

        const expenseDataWithColors = expenseHeadsArray.map((item, index) => ({
          ...item,
          color: expenseColors[index % expenseColors.length],
        }))

        setExpenseHeadData(expenseDataWithColors)
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError(dashboardText.Authentication_Failed)
        } else if (err.response?.status === 403) {
          setError(dashboardText.No_Permission)
        } else if (err.message?.includes('Network Error')) {
          setError(dashboardText.Network_Error)
        } else {
          setError(
            `${dashboardText.Failed_To_Load_Finance_Data}: ${err.message || 'Unknown error'}`,
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [allSchoolsData])

  const incomeChart = {
    series: incomeHeadData.map((item) => item.amount),
    options: {
      chart: { type: 'donut', animations: { enabled: true, speed: 800 } },
      labels: incomeHeadData.map((item) => item.incomeHead),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: true, fontSize: '14px', fontWeight: 600, color: '#333' },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                color: '#333',
                formatter: function (val: string) {
                  return '₹' + parseFloat(val).toFixed(2)
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: dashboardText.Total_Income,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return '₹' + total.toFixed(2)
                },
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
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex]
          return seriesName + ': ₹' + value.toFixed(2)
        },
      },
      colors: incomeHeadData.map((item) => item.color || '#8BC34A'),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return '₹' + val.toFixed(2)
          },
        },
      },
      responsive: [
        { breakpoint: 1024, options: { chart: { width: 300 }, legend: { position: 'bottom' } } },
        {
          breakpoint: 640,
          options: { chart: { width: 250 }, legend: { position: 'bottom', fontSize: '10px' } },
        },
      ],
    } as ApexCharts.ApexOptions,
  }

  const expensesChart = {
    series: expenseHeadData.map((item) => item.amount),
    options: {
      chart: { type: 'donut', animations: { enabled: true, speed: 800 } },
      labels: expenseHeadData.map((item) => item.expenseHead),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: { show: true, fontSize: '14px', fontWeight: 600, color: '#333' },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: 700,
                color: '#333',
                formatter: function (val: string) {
                  return '₹' + parseFloat(val).toFixed(2)
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: dashboardText.Total_Expenses,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return '₹' + total.toFixed(2)
                },
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
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex]
          return seriesName + ': ₹' + value.toFixed(2)
        },
      },
      colors: expenseHeadData.map((item) => item.color || '#AB47BC'),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return '₹' + val.toFixed(2)
          },
        },
      },
      responsive: [
        { breakpoint: 1024, options: { chart: { width: 300 }, legend: { position: 'bottom' } } },
        {
          breakpoint: 640,
          options: { chart: { width: 250 }, legend: { position: 'bottom', fontSize: '10px' } },
        },
      ],
    } as ApexCharts.ApexOptions,
  }

  if (loading) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-64 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-6"></div>
            <div className="h-64 bg-gray-200 rounded w-64"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full text-center">
          <p className="text-red-500 font-semibold mb-2">{dashboardText.Error_Loading_Data}</p>{' '}
          <p className="text-gray-600 text-sm">{error}</p>
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

  if (incomeHeadData.length === 0 && expenseHeadData.length === 0) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {dashboardText.income || 'Income'}
          </h3>
          <p className="text-gray-500 text-center">{dashboardText.No_Income_Data}</p>{' '}
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {dashboardText.monthly_expenses || 'Monthly Expenses'}
          </h3>
          <p className="text-gray-500 text-center">{dashboardText.No_Expense_Data}</p>{' '}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
      {incomeHeadData.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {dashboardText.income} - {currentMonth} {getCurrentYear()}
          </h3>
          <Chart
            options={incomeChart.options}
            series={incomeChart.series}
            type="donut"
            height={300}
          />
        </div>
      )}

      {expenseHeadData.length > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {dashboardText.monthly_expenses} - {currentMonth} {getCurrentYear()}
          </h3>
          <Chart
            options={expensesChart.options}
            series={expensesChart.series}
            type="donut"
            height={300}
          />
        </div>
      )}

      {incomeHeadData.length === 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            Income - {currentMonth} {getCurrentYear()}
          </h3>
          <p className="text-gray-500 text-center">No income data found for current month</p>
        </div>
      )}

      {expenseHeadData.length === 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            Expenses - {currentMonth} {getCurrentYear()}
          </h3>
          <p className="text-gray-500 text-center">No expense data found for current month</p>
        </div>
      )}
    </div>
  )
}

export default PieCharts
