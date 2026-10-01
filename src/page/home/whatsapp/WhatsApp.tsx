import React, { useState } from "react";
import {
  LayoutDashboard,
  Send,
  History,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";
 
// Import pages (you'll have these as separate files)
import WhatsAppDashboard from "../../../features/whatsapp/pages/WhatsAppDashboard";
import SendMessage from "../../../features/whatsapp/pages/SendMessage";
import MessageHistory from "../../../features/whatsapp/pages/MessageHistory";
import Templates from "../../../features/whatsapp/pages/Templates";
import Configuration from "../../../features/whatsapp/pages/Configuration";
 
type PageType =
  | "dashboard"
  | "send"
  | "history"
  | "templates"
  | "configuration"
  | "analytics";
 
const WhatsApp: React.FC = () => {
  const [activePage, setActivePage] = useState<PageType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "send", name: "Send Message", icon: Send },
    { id: "history", name: "Message History", icon: History },
    { id: "templates", name: "Templates", icon: FileText },
    { id: "configuration", name: "Configuration", icon: Settings },
  ];
 
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <WhatsAppDashboard />;
      case "send":
        return <SendMessage />;
      case "history":
        return <MessageHistory />;
      case "templates":
        return <Templates />;
      case "configuration":
        return <Configuration />;
      default:
        return <WhatsAppDashboard />;
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      {/* Sidebar */}
      <aside
        className={`
    fixed top-20 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
    transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:top-20 lg:left-84
  `}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  WhatsApp
                </h2>
                <p className="text-xs text-gray-600">Business API</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
 
        {/* Navigation */}
        <nav className="p-3 sm:p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
 
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as PageType);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
                  transition-colors duration-150
                  ${
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>
 
        {/* Connection Status */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-800">
                Connected
              </span>
            </div>
            <p className="text-xs text-green-700">WhatsApp API Active</p>
          </div>
        </div>
      </aside>
 
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar (Mobile) */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
            <h1 className="font-bold text-gray-800 text-sm sm:text-base">
              WhatsApp
            </h1>
            <div className="w-5 sm:w-6"></div>
          </div>
        </header>
 
        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{renderPage()}</main>
      </div>
    </div>
  );
};
 
export default WhatsApp;
 
 