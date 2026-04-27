import { LayoutDashboard, Mic, Database, Brain, BarChart3, HelpCircle, LogOut, User, X, Settings, Bell, MessageSquare, Lightbulb, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Play, label: 'Practice Mode', path: '/practice' },
  { icon: Mic, label: 'Mock Interviews', path: '/interviews' },
  { icon: Database, label: 'Question Bank', path: '/questions' },
  { icon: Brain, label: 'AI Coach', path: '/coach' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
  { icon: Lightbulb, label: 'Insights', path: '/insights' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}`;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed left-0 top-0 h-full w-72 bg-[#0a0a0a]/98 backdrop-blur-[30px] border-r border-white/10 flex flex-col py-8 px-4 gap-2 z-40 pt-24 font-body text-sm font-medium shadow-[20px_0_60px_rgba(0,0,0,0.6)]"
        >
          {/* Close Button */}
          <button onClick={onClose}
            className="absolute top-6 right-4 p-2 rounded-xl bg-white/5 text-white/40 hover:text-primary hover:bg-white/10 transition-all active:scale-95">
            <X className="w-5 h-5" />
          </button>

          {/* Brand + User */}
          <div className="px-3 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(129,236,255,0.3)]">
                <Brain className="text-black w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold leading-none font-headline">Forge Intelligence</h3>
                <p className="text-[10px] text-primary mt-0.5 uppercase tracking-wider font-bold">V2.4 Active</p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <img src={avatarSrc} alt={user.name} className="w-8 h-8 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{user.name}</p>
                  <p className="text-white/30 text-[11px] truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/15 to-secondary/10 text-primary border-l-4 border-primary pl-3'
                      : 'text-white/40 hover:text-primary/80 hover:bg-white/5 border-l-4 border-transparent'
                  }`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto space-y-0.5 pt-4 border-t border-white/5">
            <Link to="/notifications" onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-primary/80 hover:bg-white/5 transition-all duration-200 rounded-xl">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </Link>
            <Link to="/settings" onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-primary/80 hover:bg-white/5 transition-all duration-200 rounded-xl">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
            <Link to="/support" onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 text-white/40 hover:text-primary/80 hover:bg-white/5 transition-all duration-200 rounded-xl">
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </Link>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 rounded-xl">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
