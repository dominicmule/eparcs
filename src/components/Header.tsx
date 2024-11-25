import { Menu, Bell } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onNotificationClick: () => void;
}

export function Header({ onMenuClick, onNotificationClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold">Ranger Monitoring System</h1>
        </div>
        <button
          onClick={onNotificationClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}