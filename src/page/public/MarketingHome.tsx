import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaArrowRight,
  FaBookOpen,
  FaCalendarCheck,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaGraduationCap,
  FaMoneyBillWave,
  FaStar,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa'
import CampusFlowLogo from '../../assets/campusflow-logo.svg'
import {
  useAllPackages,
  useBestSellingPackages,
} from '../../hooks/queries/superAdmin/usePackage'
import type { Package } from '../../types/superAdmin/Package'

const modules = [
  {
    icon: FaUsers,
    title: 'Know every student',
    description:
      'Keep admissions, student profiles, family contacts, class assignments, and session history together.',
    number: '01',
  },
  {
    icon: FaMoneyBillWave,
    title: 'Bring fees into focus',
    description:
      'Organize fee structures, payments, receipts, outstanding balances, and finance workflows in one place.',
    number: '02',
  },
  {
    icon: FaCalendarCheck,
    title: 'Make the school day flow',
    description:
      'Coordinate attendance, examinations, timetables, staff, and academic routines without scattered records.',
    number: '03',
  },
  {
    icon: FaChartLine,
    title: 'Turn records into insight',
    description:
      'Give school teams clear dashboards and reports to understand what needs attention and act sooner.',
    number: '04',
  },
]

const workflows = [
  'Student information and admissions',
  'Classes, sections, subjects, and sessions',
  'Fees, receipts, and payment tracking',
  'Attendance, exams, and academic records',
  'Staff, leave, and role-based access',
  'Library, transport, hostel, and inventory',
]

const formatPrice = (amount: number): string =>
  amount === 0 ? 'Contact us' : `₹${amount.toLocaleString('en-IN')}`

const BestSellingPlanCard: React.FC<{ plan: Package; index: number }> = ({ plan, index }) => {
  const features = plan.features.filter((feature) => feature.isEnabled)

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        index === 0 ? 'border-[#109982] ring-1 ring-[#109982]/20' : 'border-slate-200'
      }`}
    >
      {index === 0 && (
        <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-[#109982] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <FaStar /> Popular choice
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#15364c]">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {plan.billingPeriod.toLowerCase().replace(/_/g, ' ')}
          </p>
        </div>
        {plan.recommended && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Recommended
          </span>
        )}
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-[#15364c]">
        {formatPrice(plan.basePrice)}
      </p>
      {plan.setupFee != null && plan.setupFee > 0 && (
        <p className="mt-1 text-xs text-slate-500">
          + ₹{plan.setupFee.toLocaleString('en-IN')} setup fee
        </p>
      )}
      <p className="mt-4 min-h-[3rem] text-sm leading-6 text-slate-600">
        {plan.description || 'A set of tools to support your school’s daily operations.'}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          What’s included
        </p>
        <ul className="mt-3 space-y-2.5">
          {(features.length ? features.slice(0, 4) : []).map((feature) => (
            <li key={feature.packageFeatureId ?? `${feature.scope}-${feature.featureName}`} className="flex items-start gap-2.5 text-sm text-slate-700">
              <FaCheck className="mt-1 shrink-0 text-[#109982]" />
              <span>{feature.featureName}</span>
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-xs font-medium text-slate-500">+{features.length - 4} more features</li>
          )}
          {!features.length && (
            <li className="text-sm text-slate-500">Package features are available after selection.</li>
          )}
        </ul>
      </div>

      <div className="mt-auto pt-6">
        <Link
          to="/registration"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
            index === 0
              ? 'bg-[#15364c] text-white hover:bg-[#214b64]'
              : 'border border-slate-300 text-[#213448] hover:bg-slate-50'
          }`}
        >
          Choose {plan.name} <FaArrowRight />
        </Link>
      </div>
    </article>
  )
}

const MarketingHome: React.FC = () => {
  const [showAllPlans, setShowAllPlans] = useState(false)
  const backendConfigured = Boolean(import.meta.env.VITE_API_BASE_URL)
  const {
    data: bestSellingPlans = [],
    isLoading: plansLoading,
    isError: plansError,
    error: plansQueryError,
    refetch: refetchPlans,
  } = useBestSellingPackages(backendConfigured)
  const {
    data: allPackagesData,
    isLoading: allPackagesLoading,
    isError: allPackagesError,
    error: allPackagesQueryError,
    refetch: refetchAllPackages,
  } = useAllPackages(showAllPlans && backendConfigured)
  const displayedPlans = showAllPlans
    ? allPackagesData?.packages ?? bestSellingPlans
    : bestSellingPlans

  return (
  <div className="min-h-screen overflow-hidden bg-[#f7f9fc] text-[#182d40]">
    <header className="relative z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" aria-label="CampusFlow home" className="shrink-0">
          <img src={CampusFlowLogo} alt="CampusFlow" className="w-[145px] sm:w-[194px]" />
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          <a className="text-sm font-medium text-slate-600 hover:text-[#0e927e]" href="#platform">
            Platform
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#0e927e]" href="#why-campusflow">
            Why CampusFlow
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#0e927e]" href="#for-schools">
            For schools
          </a>
          <a className="text-sm font-medium text-slate-600 hover:text-[#0e927e]" href="#plans">
            Plans
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/login"
            className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-semibold text-[#213448] hover:bg-slate-100 sm:px-4 sm:text-sm"
          >
            Sign in
          </Link>
          <Link
            to="/registration"
            className="whitespace-nowrap rounded-lg bg-[#15364c] px-2.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#214b64] sm:px-4 sm:text-sm"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>

    <main>
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_74%_36%,rgba(18,168,145,0.12),transparent_33%),radial-gradient(ellipse_at_4%_0%,rgba(52,120,197,0.09),transparent_34%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#12a891]" />
              School management, connected
            </div>
            <h1 className="mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-[-0.045em] text-[#15364c] sm:text-5xl lg:text-[4.15rem]">
              More time for
              <span className="block text-[#109982]">the work that</span>
              <span className="block">moves students forward.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              CampusFlow brings the essential work of running a school into one connected platform,
              so your team can spend less time chasing records and more time supporting learning.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/registration"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#15364c] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#214b64]"
              >
                Get started with CampusFlow <FaArrowRight />
              </Link>
              <a
                href="#platform"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-[#213448] hover:border-slate-400 hover:bg-slate-50"
              >
                Explore the platform <FaChevronDown className="text-xs" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <FaCheck className="text-[#109982]" /> One connected school workspace
              </span>
              <span className="inline-flex items-center gap-2">
                <FaCheck className="text-[#109982]" /> Access shaped by roles and permissions
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[610px]">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100 opacity-80 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(21,54,76,0.16)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#109982]">
                    <FaGraduationCap />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#15364c]">School overview</p>
                    <p className="text-xs text-slate-500">A clearer view of the day</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Connected workspace
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
                {[
                  { label: 'Students', value: 'Student records', icon: FaUsers, tone: 'blue' },
                  { label: 'Attendance', value: 'Daily insights', icon: FaCalendarCheck, tone: 'green' },
                  { label: 'Fees', value: 'Payments & dues', icon: FaMoneyBillWave, tone: 'amber' },
                ].map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div
                      className={`mb-5 flex h-9 w-9 items-center justify-center rounded-lg ${
                        tone === 'blue'
                          ? 'bg-blue-50 text-blue-700'
                          : tone === 'green'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <Icon />
                    </div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-bold text-[#213448]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 px-5 pb-5 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#213448]">School operations</p>
                    <span className="text-xs text-slate-400">At a glance</span>
                  </div>
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {[36, 54, 42, 73, 61, 88, 68, 94, 76, 100, 81, 92].map((height, index) => (
                      <span
                        key={`${height}-${index}`}
                        className={`flex-1 rounded-t-sm ${
                          index === 9 ? 'bg-[#12a891]' : 'bg-[#dcebe9]'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                    <span>Plan</span>
                    <span>Coordinate</span>
                    <span>Review</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#15364c] p-4 text-white">
                  <FaShieldAlt className="text-emerald-300" />
                  <p className="mt-4 text-sm font-bold">The right access for every role</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    Keep teams focused with permissions matched to their responsibilities.
                  </p>
                  <div className="mt-4 flex -space-x-2">
                    {['A', 'T', 'F', 'S'].map((initial, index) => (
                      <span
                        key={initial}
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#15364c] text-[10px] font-bold ${
                          index % 2 === 0 ? 'bg-emerald-400 text-[#15364c]' : 'bg-sky-200 text-[#15364c]'
                        }`}
                      >
                        {initial}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
                <FaBookOpen className="text-[#109982]" />
                Students · Academics · Finance · Operations
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              A product illustration — your workspace reflects your school’s setup.
            </p>
          </div>
        </div>
      </section>

      <section id="plans" className="scroll-mt-8 border-y border-slate-200 bg-[#f1f7f6]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#109982]">
              Plans schools choose
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-[#15364c] sm:text-4xl">
              Find the right tools for your school.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Explore our best-selling packages, with features and descriptions provided by
              CampusFlow.
            </p>
          </div>

          {!backendConfigured ? (
            <p className="mx-auto mt-10 max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Plan information will be available when the backend is connected.
            </p>
          ) : plansLoading ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : plansError ? (
            <div role="alert" className="mx-auto mt-10 max-w-xl rounded-xl border border-red-200 bg-white p-6 text-center">
              <p className="text-sm text-red-800">
                {plansQueryError instanceof Error
                  ? plansQueryError.message
                  : 'Unable to load best-selling plans right now.'}
              </p>
              <button
                type="button"
                onClick={() => void refetchPlans()}
                className="mt-4 rounded-lg bg-[#15364c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#214b64]"
              >
                Try again
              </button>
            </div>
          ) : bestSellingPlans.length ? (
            <>
              <div className="mt-10 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
                {displayedPlans.map((plan, index) => (
                  <BestSellingPlanCard key={plan.packageId} plan={plan} index={index} />
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center gap-3">
                {showAllPlans && allPackagesLoading && (
                  <p role="status" className="text-sm text-slate-600">
                    Loading all plans…
                  </p>
                )}
                {showAllPlans && allPackagesError && (
                  <div role="alert" className="text-center">
                    <p className="text-sm text-red-800">
                      {allPackagesQueryError instanceof Error
                        ? allPackagesQueryError.message
                        : 'Unable to load all plans right now.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetchAllPackages()}
                      className="mt-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
                    >
                      Try again
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowAllPlans((current) => !current)}
                  disabled={allPackagesLoading}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#213448] hover:border-[#109982] hover:text-[#0e927e] disabled:cursor-wait disabled:opacity-60"
                >
                  {showAllPlans ? 'Show best-selling plans' : 'More plans'}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-10 rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              Best-selling plans will appear here when they are available.
            </p>
          )}
        </div>
      </section>

      <section id="platform" className="scroll-mt-8 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#109982]">
                One platform, many connected workflows
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] text-[#15364c] sm:text-4xl">
                School work shouldn’t live in separate silos.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600">
                When student, academic, and administrative information is easier to find, everyday
                decisions become easier too. CampusFlow gives teams a shared foundation for the
                routines that keep a school moving.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, description, number }) => (
                <article key={number} className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#109982]">
                      <Icon />
                    </span>
                    <span className="text-xs font-semibold tracking-wider text-slate-300">{number}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[#213448]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why-campusflow" className="scroll-mt-8 bg-[#102c40] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
              Why schools need CampusFlow
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
              Less time coordinating systems. More time caring for your school community.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              A school runs on hundreds of small handoffs. Disconnected spreadsheets, paper trails,
              and repeated data entry make those handoffs harder than they need to be. CampusFlow
              helps bring the work together in a place your team can return to.
            </p>
            <Link
              to="/registration"
              className="mt-8 inline-flex items-center gap-3 rounded-lg bg-[#13ad96] px-5 py-3.5 text-sm font-semibold text-[#0d2b3c] hover:bg-emerald-300"
            >
              Bring your workflows together <FaArrowRight />
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <h3 className="text-lg font-bold">One connected foundation for:</h3>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {workflows.map((workflow) => (
                <li key={workflow} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300">
                    <FaCheck className="text-[10px]" />
                  </span>
                  {workflow}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-start gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">
              <FaShieldAlt className="mt-0.5 shrink-0 text-emerald-300" />
              Scope- and operation-based permissions help administrators control access across
              school workflows.
            </div>
          </div>
        </div>
      </section>

      <section id="for-schools" className="scroll-mt-8 bg-[#f7f9fc]">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#109982]">
            Built around school operations
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-[-0.035em] text-[#15364c] sm:text-4xl">
            Give every team a clearer way to do their part.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            From the front office to the classroom and finance desk, CampusFlow helps school teams
            work from shared information while using the tools that fit their responsibilities.
          </p>
          <div className="mx-auto mt-9 grid max-w-4xl gap-3 text-left sm:grid-cols-3">
            {[
              ['Administrators', 'Coordinate school-wide operations and keep an eye on progress.'],
              ['Teachers & staff', 'Find the records and workflows needed for their daily work.'],
              ['School teams', 'Collaborate with clearer processes and fewer repeated handoffs.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-[#213448]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl bg-[#eaf5f3] px-6 py-8 sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0e927e]">
              Ready to make school work flow?
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#15364c]">
              Start building a more connected school workspace.
            </h2>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/registration"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#15364c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#214b64]"
            >
              Get started <FaArrowRight />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-[#213448] hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <img src={CampusFlowLogo} alt="CampusFlow" className="h-8 w-auto" />
        <p className="text-xs text-slate-500">
          A connected platform for the people and processes that power your school.
        </p>
        <div className="flex gap-5 text-sm font-medium text-slate-600">
          <Link to="/login" className="hover:text-[#0e927e]">
            Sign in
          </Link>
          <Link to="/registration" className="hover:text-[#0e927e]">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  </div>
  )
}

export default MarketingHome
