import React, { useMemo, useState } from 'react'
import { FaCheckCircle, FaEnvelope, FaGlobe, FaPhoneAlt, FaTimesCircle } from 'react-icons/fa'
import { useAllPackages } from '../../../hooks/queries/superAdmin/usePackage'
import { useSchoolGroup } from '../../../hooks/queries/superAdmin/useschoolGroup'
import type { Package, PackageFeature } from '../../../types/superAdmin/Package'
import { hasScopePermission } from '../../../utils/permissions'

const resolveAllowedOperations = (feature: PackageFeature): string[] => {
  if (!feature.isEnabled) return []
  return feature.operations.filter((operation) => hasScopePermission(feature.scope, operation))
}

const formatBillingPeriod = (period: string): string =>
  period
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

const FeatureCard: React.FC<{
  feature: PackageFeature
  operations: string[]
}> = ({ feature, operations }) => (
  <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="font-semibold text-slate-800">{feature.featureName}</h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          {feature.scope.replace(/_/g, ' ')}
        </p>
      </div>
      {operations.length ? (
        <FaCheckCircle className="mt-1 shrink-0 text-emerald-600" aria-label="Included" />
      ) : (
        <FaTimesCircle className="mt-1 shrink-0 text-slate-400" aria-label="Not included" />
      )}
    </div>

    <p className="mt-3 min-h-10 text-sm leading-6 text-slate-600">
      {feature.description?.trim() || 'No additional description is available for this feature.'}
    </p>

    {operations.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {operations.map((operation) => (
          <span
            key={operation}
            className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
          >
            {operation}
          </span>
        ))}
      </div>
    )}

    {feature.limitType !== 'NONE' && (
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        Limit: {feature.limitValue}
        {feature.unit ? ` ${feature.unit}` : ''} ({feature.limitType.toLowerCase()})
      </p>
    )}
  </article>
)

export default function PackageDetails(): React.JSX.Element {
  const [showAllFeatures, setShowAllFeatures] = useState(false)
  const schoolGroupCode =
    localStorage.getItem('schoolGroupCode') || localStorage.getItem('code') || ''
  const {
    data: packagesData,
    isLoading: packagesLoading,
    isError: packagesError,
    error: packagesQueryError,
  } = useAllPackages()
  const {
    data: schoolGroup,
    isLoading: groupLoading,
    isError: groupError,
    error: groupQueryError,
  } = useSchoolGroup(schoolGroupCode)

  const activePackage = useMemo<Package | undefined>(() => {
    const planName = schoolGroup?.planName.trim().toLocaleLowerCase()
    if (!planName) return undefined
    return packagesData?.packages.find((item) => item.name.trim().toLocaleLowerCase() === planName)
  }, [packagesData, schoolGroup?.planName])

  const features = useMemo(
    () =>
      [...(activePackage?.features ?? [])]
        .filter((feature) => feature.isEnabled)
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [activePackage],
  )
  const visibleFeatures = showAllFeatures ? features : features.slice(0, 3)

  const loading = packagesLoading || groupLoading
  const errorMessage =
    (packagesError ? packagesQueryError?.message : null) ||
    (groupError ? groupQueryError?.message : null)

  return (
    <main className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
            CampusFlow
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Package &amp; Access Details
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Review your current package, the features it includes, and the operations available to
            your school group.
          </p>
        </header>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Loading package information…
          </div>
        ) : errorMessage ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
            Unable to load package information: {errorMessage}
          </div>
        ) : (
          <>
            {activePackage ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-[#213448] px-6 py-6 text-white sm:px-8">
                  <p className="text-sm font-medium text-blue-100">Current package</p>
                  <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold sm:text-3xl">{activePackage.name}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                        {activePackage.description || 'No package description is available.'}
                      </p>
                    </div>
                    <p className="text-xl font-bold">
                      {activePackage.basePrice === 0
                        ? 'Free'
                        : `${activePackage.basePrice.toLocaleString('en-IN')} / ${formatBillingPeriod(activePackage.billingPeriod)}`}
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 border-b border-slate-100 px-6 py-5 sm:grid-cols-3 sm:px-8">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Billing period</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {formatBillingPeriod(activePackage.billingPeriod) || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Package duration</p>
                    <p className="mt-1 font-medium text-slate-800">
                      {activePackage.packageDays} days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">Trial period</p>
                    <p className="mt-1 font-medium text-slate-800">{activePackage.trialDays} days</p>
                  </div>
                </div>

                <div className="px-6 py-6 sm:px-8">
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Included features</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Available actions are determined by the package scopes and operations.
                      </p>
                    </div>
                    <span className="text-sm text-slate-500">
                      {features.length} {features.length === 1 ? 'feature' : 'features'}
                    </span>
                  </div>

                  {features.length ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {visibleFeatures.map((feature) => (
                        <FeatureCard
                          key={feature.packageFeatureId ?? `${feature.scope}-${feature.featureName}`}
                          feature={feature}
                          operations={resolveAllowedOperations(feature)}
                        />
                        ))}
                      </div>
                      {features.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setShowAllFeatures((current) => !current)}
                          aria-expanded={showAllFeatures}
                          className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          {showAllFeatures ? 'Show less' : 'More...'}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                      This package has no feature descriptions available.
                    </p>
                  )}
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                <h2 className="font-semibold">Current package details are unavailable</h2>
                <p className="mt-2 text-sm">
                  {schoolGroup?.planName
                    ? `We could not find package “${schoolGroup.planName}” in the packages list.`
                    : 'No current package is associated with this school group.'}
                </p>
              </section>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">School group contact details</h2>
              <p className="mt-1 text-sm text-slate-600">
                Contact details registered for {schoolGroup?.schoolGroupName || 'your school group'}.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <a
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-slate-700 hover:bg-slate-100"
                  href={schoolGroup?.email ? `mailto:${schoolGroup.email}` : undefined}
                >
                  <FaEnvelope className="shrink-0 text-blue-700" />
                  <span className="break-all text-sm">{schoolGroup?.email || 'Email not provided'}</span>
                </a>
                <a
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-slate-700 hover:bg-slate-100"
                  href={schoolGroup?.phoneNumber ? `tel:${schoolGroup.phoneNumber}` : undefined}
                >
                  <FaPhoneAlt className="shrink-0 text-blue-700" />
                  <span className="text-sm">{schoolGroup?.phoneNumber || 'Phone not provided'}</span>
                </a>
                <a
                  className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-slate-700 hover:bg-slate-100"
                  href={
                    schoolGroup?.webSite
                      ? `${/^https?:\/\//i.test(schoolGroup.webSite) ? '' : 'https://'}${schoolGroup.webSite}`
                      : undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaGlobe className="shrink-0 text-blue-700" />
                  <span className="break-all text-sm">{schoolGroup?.webSite || 'Website not provided'}</span>
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
