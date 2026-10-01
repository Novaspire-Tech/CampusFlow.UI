import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconField } from "../../../../components";
import { Link } from "react-router-dom";

// Import hooks from all library modules
import { useListBooks } from "../../../../hooks/queries/library/useBookList";
import { useBookIssueReturns } from "../../../../hooks/queries/library/useBookIssueReturn";
import { useAddStudentMembers } from "../../../../hooks/queries/library/useAddStudent";
import { useAddStaffMembers } from "../../../../hooks/queries/library/useAddStaff";
import { getPagesDataText } from "../../../../helpers/useTranslations";

// Quick action card component
const QuickActionCard = ({
  title,
  icon,
  count,
  color,
  link,
  onClick,
  
}: {
  title: string;
  icon: string;
  count?: number;
  color: string;
  link?: string;
  onClick?: () => void;
}) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow duration-300`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {count !== undefined && (
          <p className="text-2xl font-bold text-gray-800">{count}</p>
        )}
      </div>
      <div
        className={`p-3 rounded-full ${color.replace("border-", "bg-").replace("-600", "-100")}`}
      >
        <IconField
          name={icon}
          size={24}
          className={`text-${color.split("-")[1]}-600`}
        />
      </div>
    </div>
    {link && (
      
      <Link to={link} className="block mt-4">
        <div className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
          <span>View Details</span>
          <IconField name="FaArrowRight" size={12} className="ml-1" />
        </div>
      </Link>
    )}
  </div>
);

// Statistic card component
const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = "blue",
}: {
  label: string;
  value: number | string;
  icon: string;
  trend?: "up" | "down";
  trendValue?: string;
  color?: string;
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {trend && trendValue && (
          <p
            className={`text-xs mt-2 flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}
          >
            <IconField
              name={trend === "up" ? "FaArrowUp" : "FaArrowDown"}
              size={10}
              className="mr-1"
            />
            {trendValue}
          </p>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <IconField name={icon} size={20} className={`text-${color}-600`} />
      </div>
    </div>
  </div>
);

// Recent activity component
const RecentActivity = ({
  title,
  items,
  type,
}: {
  title: string;
  items: any[];
  type: "issue" | "return" | "member";
}) => {

  
   const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const getIcon = () => {
    switch (type) {
      case "issue":
        return "FaBook";
      case "return":
        return "FaUndo";
      case "member":
        return "FaUser";
      default:
        return "FaClock";
    }
  };

  const getColor = () => {
    switch (type) {
      case "issue":
        return "text-green-600 bg-green-100";
      case "return":
        return "text-blue-600 bg-blue-100";
      case "member":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
        <span>{title}</span>
        <Link to="/issue---return">
          <span className="text-sm text-blue-600 cursor-pointer hover:underline">
          {Text.View_All}
          </span>
        </Link>
      </h3>
      <div className="space-y-4">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0"
          >
            <div className={`p-2 rounded-full ${getColor().split(" ")[1]}`}>
              <IconField
                name={getIcon()}
                size={14}
                className={getColor().split(" ")[0]}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {type === "issue" && `${item.bookTitle} - ${item.memberName}`}
                {type === "return" &&
                  `${item.bookTitle} returned by ${item.memberName}`}
                {type === "member" &&
                  `${item.name || item.studentName || item.staffName} joined as member`}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {type === "issue" &&
                  item.returnDate &&
                  `Due: ${new Date(item.returnDate).toLocaleDateString()}`}
                {type === "return" &&
                  item.submitDate &&
                  `Submitted: ${new Date(item.submitDate).toLocaleDateString()}`}
                {type === "member" &&
                  `Card: ${item.libraryCardNo || item.cardNo}`}
              </p>
              {type === "issue" && item.fine > 0 && (
                <p className="text-xs text-red-600 mt-1">Fine: ₹{item.fine}</p>
              )}
            </div>
            {type !== "member" && (
              <div className="flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.submitStatus === "SUBMIT"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.submitStatus === "SUBMIT" ? "Submitted" : "Pending"}
                </span>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};


const DueReturnsAlert = ({ issueReturns }: { issueReturns: any[] }) => {

   const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const today = new Date();

  const isBookReturned = (issue: any) => {
    return issue.issueStatus === "RETURNED" || issue.submitStatus === "SUBMIT";
  };

  const dueReturns = issueReturns
    .filter((ir) => {
      if (isBookReturned(ir)) return false;
      const returnDate = new Date(ir.returnDate);
      const daysUntilDue = Math.ceil(
        (returnDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
      );
      return daysUntilDue >= 0 && daysUntilDue <= 3;
    })
    .sort(
      (a, b) =>
        new Date(a.returnDate).getTime() - new Date(b.returnDate).getTime(),
    )
    .slice(0, 3);

  const overdue = issueReturns.filter((ir) => {
    if (isBookReturned(ir)) return false;
    return new Date(ir.returnDate) < today;
  });

  if (dueReturns.length === 0 && overdue.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-800 flex items-center">
          <IconField
            name="FaExclamationTriangle"
            size={20}
            className="text-amber-600 mr-2"
          />
          {Text.Due_Returns_Alert}
        </h3>
        {overdue.length > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
            {overdue.length}{Text.Overdue}
          </span>
        )}
      </div>

      {overdue.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">
            {Text.Overdue_Books}:
          </h4>
          <div className="space-y-2">
            {overdue.slice(0, 3).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-red-50 p-3 rounded-md border border-red-200"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.bookTitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.memberName} ({item.memberType})
                  </p>
                  {item.fine > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                     {Text.Fine}: ₹{item.fine}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{Text.Was_Due}</p>
                  <p className="text-sm font-medium text-red-700">
                    {new Date(item.returnDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dueReturns.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-800 mb-2">
            Due Soon:
          </h4>
          <div className="space-y-2">
            {dueReturns.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-3 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.bookTitle}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.memberName} ({item.memberType})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Due</p>
                  <p className="text-sm font-medium text-amber-700">
                    {new Date(item.returnDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const LibraryDashboard = () => {

   const { t } = useTranslation();
  const Text = getPagesDataText(t);

  // Fetch data from all library modules
  const { data: books = [], isLoading: booksLoading } = useListBooks();
  // const { data: issueReturns = [], isLoading: issueLoading } =
  //   useBookIssueReturns();
  const { data: issueReturnsRaw, isLoading: issueLoading } =
  useBookIssueReturns(0, 100000, "desc");

// Extract the array from the paginated response
const issueReturns: any[] = Array.isArray(issueReturnsRaw)
  ? issueReturnsRaw
  : (issueReturnsRaw as any)?.bookIssueReturns ||
    (issueReturnsRaw as any)?.issueReturns ||
    (issueReturnsRaw as any)?.data ||
    [];
  const { data: studentMembers = [], isLoading: studentLoading } =
    useAddStudentMembers();
  const { data: staffMembers = [], isLoading: staffLoading } =
    useAddStaffMembers();

  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [recentReturns, setRecentReturns] = useState<any[]>([]);
  const [activeIssues, setActiveIssues] = useState<any[]>([]);

  const isBookReturned = (issue: any) => {
    return issue.issueStatus === "RETURNED" || issue.submitStatus === "SUBMIT";
  };

  useEffect(() => {
    const active = issueReturns.filter((ir) => !isBookReturned(ir));
    setActiveIssues(active);

    const issues = issueReturns
      .filter((ir) => ir.issueDate && !isBookReturned(ir))
      .sort(
        (a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
      )
      .slice(0, 5);
    setRecentIssues(issues);

    const returns = issueReturns
      .filter((ir) => ir.submitStatus === "SUBMIT" && ir.submitDate)
      .sort(
        (a, b) =>
          new Date(b.submitDate || 0).getTime() -
          new Date(a.submitDate || 0).getTime(),
      )
      .slice(0, 5);
    setRecentReturns(returns);
  }, [issueReturns]);

  const totalBooks = books.length;
  const totalMembers =
    (studentMembers?.length || 0) + (staffMembers?.length || 0);
  const activeLoans = activeIssues.length;


const recentMembers = [
  ...(studentMembers || []).map((m) => ({
    ...m,
    type: "Student",
    name: m.studentName,
  })),
  ...(staffMembers || []).map((m) => ({
    ...m,
    type: "Staff",
    name: m.firstName,
  })),
]
  .sort((a, b) => {
    const aId = typeof a.id === 'number' ? a.id : parseInt(String(a.id)) || 0;
    const bId = typeof b.id === 'number' ? b.id : parseInt(String(b.id)) || 0;
    return bId - aId;
  })
  .slice(0, 5);

  const isLoading =
    booksLoading || issueLoading || studentLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {Text.Library_Dashboard}
        </h1>
        <p className="text-gray-600">
        {Text.Welcome_To_Your_Library_Management_System}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
         {Text.Quick_Actions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title={Text.Add_New_Book}
            icon="FaBook"
            color="border-green-600"
            link="/book-list"
          />
          <QuickActionCard
            title={Text.Issue_Book}
            icon="FaHandPaper"
            color="border-blue-600"
            link="/issue---return"
          />
          <QuickActionCard
            title={Text.Add_Student_Member}
            icon="FaUserGraduate"
            color="border-purple-600"
            link="/add-student"
          />
          <QuickActionCard
            title={Text.Add_Staff_Member}
            icon="FaUserTie"
            color="border-amber-600"
            link="/add-staff-member"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          label={Text.Total_Books}
          value={totalBooks}
          icon="FaBook"
          trend="up"
          // trendValue={`${books.length} in library`}
          color="blue"
        />
        <StatCard
          label={Text.Active_Loans}
          value={activeLoans}
          icon="FaHandHolding"
          trend={activeLoans > 0 ? "up" : "down"}
          // trendValue={`${activeLoans} currently issued`}
          color="amber"
        />
        <StatCard
          label={Text.Total_Members}
          value={totalMembers}
          icon="FaUsers"
          trendValue={`${studentMembers?.length || 0} Students, ${staffMembers?.length || 0} Staff`}
          color="purple"
        />
      </div>

      {/* Due Returns Alert */}
      <DueReturnsAlert issueReturns={issueReturns} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Recent Issues & Returns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivity
              title={Text.Recent_Issues}
              items={recentIssues}
              type="issue"
            />
            <RecentActivity
              title={Text.Recent_Returns}
              items={recentReturns}
              type="return"
            />
          </div>

          {/* Recent Members */}
          <RecentActivity
            title={Text.Recent_Members}
            items={recentMembers}
            type="member"
          />

          {/* Library Stats Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">{Text.Library_Summary}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{Text.Total_Books}:</span>
                <span className="font-semibold">{totalBooks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{Text.Total_Members}:</span>
                <span className="font-semibold">{totalMembers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{Text.Active_Loans}:</span>
                <span className="font-semibold">{activeLoans}</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-600">{Text.Student_Members}:</span>
                <span className="font-semibold">
                  {studentMembers?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{Text.Staff_Members}:</span>
                <span className="font-semibold">
                  {staffMembers?.length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-gray-600">{Text.Books_Issued}:</span>
                <span className="font-semibold">{issueReturns.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{Text.Books_Returned}:</span>
                <span className="font-semibold">
                  {issueReturns.filter((ir) => isBookReturned(ir)).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;
