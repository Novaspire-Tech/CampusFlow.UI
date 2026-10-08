import React from "react";
import Chart from "react-apexcharts";
import { useAllSubscriptions } from "../../../../hooks/queries/superAdmin/useSubscription";

// ── Constants ──────────────────────────────────────────────────────────────
const SUBSCRIPTION_COLORS = ["#10B981", "#F59E0B", "#EF4444"];
const PACKAGE_COLORS      = ["#3B82F6", "#8B5CF6", "#EC4899"];

// ── Status categorization ──────────────────────────────────────────────────
const getStatusCategory = (s: any): "active" | "inactive" | "expired" => {
  const status = (s.subscriptionStatus ?? "").toString().toUpperCase().trim();

  if (status === "ACTIVE" || status === "TRIALING") return "active";
  if (status === "SUSPENDED" || status === "CANCELLED" || status === "CANCELED") return "expired";
  return "inactive";
};

// ── Shared chart option builder ────────────────────────────────────────────
const buildDonutOptions = (
  labels: string[],
  colors: string[],
  centerLabel: string,
  tooltipSuffix: string,
): ApexCharts.ApexOptions => ({
  chart: { type: "donut", animations: { enabled: true, speed: 800 } },
  labels,
  colors,
  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        labels: {
          show: true,
          name:  { show: true, fontSize: "14px", fontWeight: 600, color: "#333" },
          value: {
            show: true, fontSize: "22px", fontWeight: 700, color: "#333",
            formatter: (val: string) => val,
          },
          total: {
            show: true, showAlways: true,
            label: centerLabel,
            fontSize: "14px", fontWeight: 600, color: "#333",
            formatter: (w: any) =>
              w.globals.seriesTotals
                .reduce((a: number, b: number) => a + b, 0)
                .toString(),
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  legend: {
    position: "bottom", fontSize: "12px", fontWeight: 600,
    formatter: (seriesName: string, opts: any) =>
      `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`,
  },
  tooltip: { y: { formatter: (val: number) => `${val} ${tooltipSuffix}` } },
  responsive: [
    { breakpoint: 1024, options: { chart: { width: 300 }, legend: { position: "bottom" } } },
    { breakpoint: 640,  options: { chart: { width: 250 }, legend: { position: "bottom", fontSize: "10px" } } },
  ],
});

// ── UI helpers ─────────────────────────────────────────────────────────────
const ChartSkeleton: React.FC = () => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
    <div className="h-6 bg-gray-200 animate-pulse rounded w-48 mx-auto mb-6" />
    <div className="flex justify-center items-center h-[350px]">
      <div className="w-52 h-52 rounded-full bg-gray-200 animate-pulse" />
    </div>
    <div className="flex justify-center gap-4 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
  </div>
);

const ErrorCard: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-red-200 flex flex-col items-center justify-center min-h-[300px]">
    
    <h3 className="text-lg font-bold text-gray-800 mb-1">Failed to Load</h3>
    <p className="text-sm text-red-400">{title}</p>
  </div>
);

const EmptyCard: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center min-h-[300px]">
    <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-4">{title}</h3>
    <p className="text-gray-500 text-center">{message}</p>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const SuperAdminPieCharts: React.FC = () => {

  const {
    data:      paginatedData,
    isLoading: subscriptionsLoading,
    isError:   subscriptionsError,
  } = useAllSubscriptions();

  // ── Subscription counts ───────────────────────────────────────────────────
  const subscriptions: any[] = paginatedData?.subscriptions ?? [];

  let activeCount   = 0;
  const inactiveCount = 0;
  let expiredCount  = 0;

  subscriptions.forEach((s) => {
    const cat = getStatusCategory(s);
    if      (cat === "active")   activeCount++;
    else if (cat === "expired")  expiredCount++;
    // else                         inactiveCount++;
  });

  const hasSubscriptionData = (activeCount + inactiveCount + expiredCount) > 0;
  const packageCounts = subscriptions.reduce<Record<string, number>>((counts, subscription) => {
    const packageName = String(subscription.packageName ?? "").trim();
    if (packageName) counts[packageName] = (counts[packageName] ?? 0) + 1;
    return counts;
  }, {});
  const packageLabels = Object.keys(packageCounts);
  const packageSeries = packageLabels.map((packageName) => packageCounts[packageName]);
  const hasPackageData = packageSeries.some((v) => v > 0);
  const packageColors = packageLabels.map(
    (_, index) => PACKAGE_COLORS[index % PACKAGE_COLORS.length],
  );

  // ── Chart configs ─────────────────────────────────────────────────────────
  const subscriptionOptions = buildDonutOptions(
    ["Active", "Expired"],
    SUBSCRIPTION_COLORS,
    "Total Schools",
    "schools",
  );

  const packageOptions = buildDonutOptions(
    packageLabels,
    packageColors,
    "Total Schools",
    "schools",
  );

  if (subscriptionsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Subscription Status Chart — Active / Inactive / Expired */}
      {subscriptionsError ? (
        <ErrorCard title="Could not fetch subscription data" />
      ) : hasSubscriptionData ? (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-6">
            Subscription Status Distribution
          </h3>
          <div className="flex justify-center">
            <Chart
              options={subscriptionOptions}
              series={[activeCount,  expiredCount]}
              type="donut"
              height={350}
            />
          </div>
        </div>
      ) : (
        <EmptyCard
          title="Subscription Status Distribution"
          message="No subscription data available"
        />
      )}
      {subscriptionsError ? (
        <ErrorCard title="Could not fetch package data" />
      ) : hasPackageData ? (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
          <h3 className="text-base md:text-lg font-bold text-gray-800 text-center mb-6">
            Package Distribution
          </h3>
          <div className="flex justify-center">
            <Chart
              options={packageOptions}
              series={packageSeries}
              type="donut"
              height={350}
            />
          </div>
        </div>
      ) : (
        <EmptyCard
          title="Package Distribution"
          message="No package data available"
        />
      )}

    </div>
  );
};

export default SuperAdminPieCharts;