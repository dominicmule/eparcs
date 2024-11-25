import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { NotificationPanel } from './NotificationPanel';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onNotificationClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 relative">
          {children}
        </main>
        {isNotificationPanelOpen && (
          <NotificationPanel onClose={() => setIsNotificationPanelOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default Layout;