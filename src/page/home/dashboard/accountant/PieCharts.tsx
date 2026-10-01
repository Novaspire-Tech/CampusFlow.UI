import React, { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'
import { feeTransactionService } from '../../../../services/feesCollection/feeTransactionService'
import { useTranslation } from 'react-i18next'
import { accountTranslation } from '../../../../helpers/useTranslations'

interface FeeIncomeData {
  feeType: string
  amount: number
  color?: string
}

interface FeeExpenseData {
  expenseType: string
  amount: number
  color?: string
}

const PieCharts: React.FC = () => {
  const { t } = useTranslation()
  const texts = accountTranslation(t)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feeIncomeData, setFeeIncomeData] = useState<FeeIncomeData[]>([])
  const [feeExpenseData, setFeeExpenseData] = useState<FeeExpenseData[]>([])
  const [currentMonth, setCurrentMonth] = useState<string>('')

  const incomeColors = [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#F44336',
    '#00BCD4',
    '#FFC107',
    '#3F51B5',
    '#E91E63',
    '#009688',
  ]

  const expenseColors = [
    '#F44336',
    '#E91E63',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
  ]

  const getCurrentMonthName = (): string => {
    const now = new Date()
    return now.toLocaleString('default', { month: 'long' })
  }

  const getCurrentYear = (): number => {
    return new Date().getFullYear()
  }

  const parseDate = (dateString: string): Date => {
    try {
      if (!dateString) return new Date(0)

      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/').map(Number)
        return new Date(year, month - 1, day)
      }

      if (dateString.includes('-')) {
        return new Date(dateString)
      }

      return new Date(dateString)
    } catch (e) {
      console.warn('Failed to parse date:', dateString, e)
      return new Date(0)
    }
  }

  const isCurrentMonth = (date: Date): boolean => {
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true)
        setError(null)

        const monthName = getCurrentMonthName()
        setCurrentMonth(monthName)

        const transactionsResponse = await feeTransactionService.getAll(0, 10000, 'desc')
        const transactions = transactionsResponse.feeTransactions || []

        const feeIncomeMap = new Map<string, number>()

        transactions.forEach((transaction: any) => {
          try {
            const date = parseDate(transaction.date)

            // Filter for current month only
            if (isCurrentMonth(date)) {
              const feeType = transaction.feeTypeName || 'Other Fees'
              const amount = parseFloat(transaction.amount) || 0

              if (feeIncomeMap.has(feeType)) {
                feeIncomeMap.set(feeType, feeIncomeMap.get(feeType)! + amount)
              } else {
                feeIncomeMap.set(feeType, amount)
              }
            }
          } catch (e) {
            console.warn('Error processing transaction:', transaction, e)
          }
        })

        const feeIncomeArray = Array.from(feeIncomeMap, ([feeType, amount]) => ({
          feeType,
          amount,
        })).sort((a, b) => b.amount - a.amount)

        const feeIncomeWithColors = feeIncomeArray.map((item, index) => ({
          ...item,
          color: incomeColors[index % incomeColors.length],
        }))

        setFeeIncomeData(feeIncomeWithColors)

        const feeExpenseMap = new Map<string, number>()

        transactions.forEach((transaction: any) => {
          try {
            const date = parseDate(transaction.date)

            if (isCurrentMonth(date)) {
              // Track fines as expense
              const fine = parseFloat(transaction.fine) || 0
              if (fine > 0) {
                const fineType = 'Fines Charged'
                if (feeExpenseMap.has(fineType)) {
                  feeExpenseMap.set(fineType, feeExpenseMap.get(fineType)! + fine)
                } else {
                  feeExpenseMap.set(fineType, fine)
                }
              }

              const discount = parseFloat(transaction.discountAmount) || 0
              if (discount > 0) {
                const discountType = 'Discounts Given'
                if (feeExpenseMap.has(discountType)) {
                  feeExpenseMap.set(discountType, feeExpenseMap.get(discountType)! + discount)
                } else {
                  feeExpenseMap.set(discountType, discount)
                }
              }
            }
          } catch (e) {
            console.warn('Error processing expense:', transaction, e)
          }
        })
        const feeExpenseArray = Array.from(feeExpenseMap, ([expenseType, amount]) => ({
          expenseType,
          amount,
        })).sort((a, b) => b.amount - a.amount)

        const feeExpenseWithColors = feeExpenseArray.map((item, index) => ({
          ...item,
          color: expenseColors[index % expenseColors.length],
        }))

        setFeeExpenseData(feeExpenseWithColors)

        console.log('Fee income data:', feeIncomeWithColors)
        console.log('Fee expense data:', feeExpenseWithColors)
      } catch (err: any) {
        console.error('Error fetching fee data for pie charts:', err)

        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.')
        } else if (err.response?.status === 403) {
          setError("You don't have permission to access this data.")
        } else if (err.message?.includes('Network Error')) {
          setError('Network error. Please check your connection.')
        } else {
          setError('Failed to load fee data: ' + (err.message || 'Unknown error'))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFeeData()
  }, [])

  // Prepare fee income chart data
  const feeIncomeChart = {
    series: feeIncomeData.map((item) => item.amount),
    options: {
      chart: {
        type: 'donut',
        animations: {
          enabled: true,
          speed: 800,
        },
        toolbar: {
          show: false,
        },
      },
      labels: feeIncomeData.map((item) => item.feeType),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 700,
                color: '#333',
                formatter: function (val: string) {
                  return (
                    '₹' +
                    parseFloat(val).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  )
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Fee Collection',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return (
                    '₹' +
                    total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  )
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        fontWeight: 500,
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex]
          return (
            seriesName +
            ': ₹' +
            value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          )
        },
      },
      colors: feeIncomeData.map((item) => item.color || incomeColors[0]),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return (
              '₹' +
              val.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            )
          },
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: 300 },
            legend: { position: 'bottom' },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: { width: 250 },
            legend: {
              position: 'bottom',
              fontSize: '10px',
            },
          },
        },
      ],
    } as ApexCharts.ApexOptions,
  }

  const feeExpensesChart = {
    series: feeExpenseData.map((item) => item.amount),
    options: {
      chart: {
        type: 'donut',
        animations: {
          enabled: true,
          speed: 800,
        },
        toolbar: {
          show: false,
        },
      },
      labels: feeExpenseData.map((item) => item.expenseType),
      plotOptions: {
        pie: {
          startAngle: 0,
          endAngle: 360,
          offsetY: 0,
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              },
              value: {
                show: true,
                fontSize: '18px',
                fontWeight: 700,
                color: '#333',
                formatter: function (val: string) {
                  return (
                    '₹' +
                    parseFloat(val).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  )
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: 'Total Deductions',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                formatter: function (w: any) {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return (
                    '₹' +
                    total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  )
                },
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        position: 'bottom',
        fontSize: '12px',
        fontWeight: 500,
        formatter: function (seriesName: string, opts: any) {
          const value = opts.w.globals.series[opts.seriesIndex]
          return (
            seriesName +
            ': ₹' +
            value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          )
        },
      },
      colors: feeExpenseData.map((item) => item.color || expenseColors[0]),
      tooltip: {
        y: {
          formatter: function (val: number) {
            return (
              '₹' +
              val.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            )
          },
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: 300 },
            legend: { position: 'bottom' },
          },
        },
        {
          breakpoint: 640,
          options: {
            chart: { width: 250 },
            legend: {
              position: 'bottom',
              fontSize: '10px',
            },
          },
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
          <p className="text-red-500 font-semibold mb-2">{texts.Error_Loading_Fee_Data}</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {texts.Retry}
          </button>
        </div>
      </div>
    )
  }

  if (feeIncomeData.length === 0 && feeExpenseData.length === 0) {
    return (
      <div className="flex flex-wrap justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6">
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {texts.Fee_Collection} - {currentMonth} {getCurrentYear()}
          </h3>
          <p className="text-gray-500 text-center">
            {texts.No_fee_collection_data_found_for_current_month}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {texts.Fee_Deductions} - {currentMonth} {getCurrentYear()}
          </h3>
          <p className="text-gray-500 text-center">
            {texts.No_fee_deductions_fines_discounts_found_for_current_month}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:flex  justify-center md:justify-between gap-6 md:gap-8 w-full px-4 py-6 ">
      {/* Fee Income Pie Chart */}
      {feeIncomeData.length > 0 && (
        <div className="bg-white shadow-md mt-1 rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {texts.Fee_Collection_by_Type} - {currentMonth} {getCurrentYear()}
          </h3>
          <Chart
            options={feeIncomeChart.options}
            series={feeIncomeChart.series}
            type="donut"
            height={350}
            width="100%"
          />
          <div className="mt-4 text-sm text-gray-600 text-center">
            {texts.Total_Collection}: ₹
            {feeIncomeData
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        </div>
      )}

      {/* Fee Expenses/Deductions Pie Chart */}
      {feeExpenseData.length > 0 && (
        <div className="bg-white mt-1 shadow-md rounded-xl p-6 border border-gray-200 w-full sm:w-[90%] max-w-full flex flex-col items-center">
          <h3 className="text-base md:text-lg font-semibold text-center mb-4">
            {texts.Fee_Deductions} - {currentMonth} {getCurrentYear()}
          </h3>
          <Chart
            options={feeExpensesChart.options}
            series={feeExpensesChart.series}
            type="donut"
            height={350}
            width="100%"
          />
          <div className="mt-4 text-sm text-gray-600 text-center">
            {texts.Total_Deductions}: ₹
            {feeExpenseData
              .reduce((sum, item) => sum + item.amount, 0)
              .toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default PieCharts
