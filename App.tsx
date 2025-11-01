import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Redeem from './pages/Redeem';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import { api } from './api';
import type { User } from './types';

// --- ICONS --- //
const DashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const RedeemIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v-.01m0-1.99V12m0-2c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6V4m0 2.01M12 18v-1m0-1v-.01m0-1.99V12" /></svg>);
const ReferralsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a3.004 3.004 0 01-2.71-4.425l.8-2.395A3.004 3.004 0 017.48 4a3 3 0 015.04 0 3.004 3.004 0 012.429 5.332l.8 2.395a3.004 3.004 0 01-2.71 4.425M12 12a3 3 0 110-6 3 3 0 010 6z" /></svg>);
const ProfileIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const HistoryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const MenuIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>);
const Spinner = () => (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>);
const GiftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V6a2 2 0 10-2 2h2zm0 13l-4 1.764a1 1 0 01-1.45-.882l.55-4.542L.65 11.23a1 1 0 01.55-1.706l4.56-.662L8.01 4.93a1 1 0 011.8 0l2.25 4.542 4.56.662a1 1 0 01.55 1.706l-3.45 3.362.55 4.542a1 1 0 01-1.45.882L12 21z" /></svg>);

// --- AUTH CONTEXT --- //
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  showWelcomeModal: boolean;
  closeWelcomeModal: () => void;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await api.getAuthenticatedUser();
                setUser(currentUser);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();
    }, []);

    const login = async (email: string, pass: string) => {
        const loggedInUser = await api.login(email, pass);
        if (loggedInUser.showWelcomeBonus) {
            setShowWelcomeModal(true);
        }
        setUser(loggedInUser);
    };

    const logout = () => {
        api.logout();
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
    }
    
    const closeWelcomeModal = () => {
        setShowWelcomeModal(false);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        showWelcomeModal,
        closeWelcomeModal,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// --- LAYOUT COMPONENTS --- //
const WelcomeBonusModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm relative text-center transform transition-all scale-100 opacity-100">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/50">
                <GiftIcon />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mt-5">Congratulations!</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-base">
                As a welcome gift, we've added a <span className="font-bold text-neutral-700 dark:text-neutral-200">₹50 bonus</span> to your wallet.
            </p>
            <button
                onClick={onClose}
                className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition"
            >
                Start Earning
            </button>
        </div>
    </div>
);

const NavItem: React.FC<{ to: string; icon: React.ReactElement; label: string; onClick?: () => void; }> = ({ to, icon, label, onClick }) => (
  <NavLink to={to} onClick={onClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 text-base font-medium ${isActive ? 'bg-primary-600 text-white shadow-md' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'}`}>
    {icon} <span>{label}</span>
  </NavLink>
);

const Sidebar: React.FC<{ onNavItemClick?: () => void }> = ({ onNavItemClick }) => (
    <aside className="flex flex-col w-64 h-screen px-5 py-8 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">SurveyHub</h2>
        </div>
        <div className="flex flex-col justify-between flex-1 mt-8">
            <nav className="flex flex-col gap-2">
                <NavItem to="/" icon={<DashboardIcon />} label="Dashboard" onClick={onNavItemClick} />
                <NavItem to="/redeem" icon={<RedeemIcon />} label="Redeem" onClick={onNavItemClick} />
                <NavItem to="/referrals" icon={<ReferralsIcon />} label="Referrals" onClick={onNavItemClick} />
                <NavItem to="/history" icon={<HistoryIcon />} label="History" onClick={onNavItemClick} />
                <NavItem to="/profile" icon={<ProfileIcon />} label="Profile" onClick={onNavItemClick} />
            </nav>
        </div>
    </aside>
);

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <header className="w-full h-20 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between lg:justify-end px-6 lg:px-8">
        <button className="lg:hidden text-neutral-600 dark:text-neutral-300" onClick={toggleSidebar}><MenuIcon/></button>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400 font-bold">{user.points.toLocaleString()} Points</p>
            </div>
            <img className="h-11 w-11 rounded-full object-cover ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ring-primary-500" src={user.avatarUrl} alt="User avatar" />
        </div>
    </header>
  );
};

const MainLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const { showWelcomeModal, closeWelcomeModal } = useAuth();

    return (
        <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
            {showWelcomeModal && <WelcomeBonusModal onClose={closeWelcomeModal} />}
            <div className="hidden lg:flex"><Sidebar /></div>
            {isSidebarOpen && (
                <div className="fixed inset-0 flex z-40 lg:hidden">
                    <div className="fixed inset-0 bg-black/60" onClick={toggleSidebar}></div>
                    <div className="relative"><Sidebar onNavItemClick={toggleSidebar} /></div>
                    <button className="absolute top-6 right-6 text-white" onClick={toggleSidebar}><CloseIcon/></button>
                </div>
            )}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="container mx-auto px-6 lg:px-8 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

const AuthLayout: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
        <Outlet />
    </div>
);

// --- ROUTING --- //
const PrivateRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-neutral-900"><Spinner /></div>;
    return isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-neutral-900"><Spinner /></div>;
    return !isAuthenticated ? <AuthLayout /> : <Navigate to="/" replace />;
};

// --- APP --- //
const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
            <Routes>
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/redeem" element={<Redeem />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
            </Routes>
        </HashRouter>
    </AuthProvider>
  );
};

export default App;