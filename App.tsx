
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBox from './components/ChatBox';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import Loading from './components/Loading';
import MaintenanceWrapper from './components/MaintenanceWrapper';
import ErrorBoundary from './components/ErrorBoundary';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Core Pages (Eagerly imported for Instant 0ms Navigation)
import Home from './pages/Home';
import Products from './pages/Products';
import Projects from './pages/Projects';
import News from './pages/News';
import Contact from './pages/Contact';
import About from './pages/About';
import Solutions from './pages/Solutions';

// Secondary Pages (Lazy Loaded)
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const SolutionRooftop = lazy(() => import('./pages/SolutionRooftop'));
const SolutionFarm = lazy(() => import('./pages/SolutionFarm'));
const SolutionFloating = lazy(() => import('./pages/SolutionFloating'));
const SolutionElectrical = lazy(() => import('./pages/SolutionElectrical'));
const SolutionDataCenter = lazy(() => import('./pages/SolutionDataCenter'));
const SolutionConstruction = lazy(() => import('./pages/SolutionConstruction'));
const SolutionDetail = lazy(() => import('./pages/SolutionDetail'));
const Resources = lazy(() => import('./pages/Resources'));
const Cart = lazy(() => import('./pages/Cart'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const Search = lazy(() => import('./pages/Search'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin (Lazy Loaded)
const AdminDashboard = lazy(() => import('./admin/Dashboard'));
const Login = lazy(() => import('./admin/Login'));

// Layout wrapper for public pages
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="flex-grow w-full dark:text-gray-100">
        <Suspense fallback={<Loading fullScreen={false} />}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <ChatBox />
      <BackToTopButton />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SettingsProvider>
          <LanguageProvider>
            <ToastProvider>
              <CartProvider>
                <AuthProvider>
                  <PermissionProvider>
                  <Router>
                    <ScrollToTop />
                    <MaintenanceWrapper>
                      <Routes>
                      {/* Admin Login - Public */}
                      <Route 
                        path="/admin/login" 
                        element={
                          <Suspense fallback={<Loading />}>
                            <Login />
                          </Suspense>
                        } 
                      />

                      {/* Protected Admin Routes */}
                      <Route 
                        path="/admin/*" 
                        element={
                          <ProtectedRoute>
                            <Suspense fallback={<Loading />}>
                              <AdminDashboard />
                            </Suspense>
                          </ProtectedRoute>
                        } 
                      />

                      {/* Public Routes */}
                      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                      <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                      
                      {/* Solutions Routes */}
                      <Route path="/solutions" element={<PublicLayout><Solutions /></PublicLayout>} />
                      <Route path="/solutions/rooftop" element={<PublicLayout><SolutionRooftop /></PublicLayout>} />
                      <Route path="/solutions/farm" element={<PublicLayout><SolutionFarm /></PublicLayout>} />
                      <Route path="/solutions/floating" element={<PublicLayout><SolutionFloating /></PublicLayout>} />
                      <Route path="/solutions/electrical" element={<PublicLayout><SolutionElectrical /></PublicLayout>} />
                      <Route path="/solutions/datacenter" element={<PublicLayout><SolutionDataCenter /></PublicLayout>} />
                      <Route path="/solutions/construction" element={<PublicLayout><SolutionConstruction /></PublicLayout>} />
                      <Route path="/solutions/:slug" element={<PublicLayout><SolutionDetail /></PublicLayout>} />

                      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
                      <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
                      
                      <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
                      <Route path="/projects/:id" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
                      
                      <Route path="/news" element={<PublicLayout><News /></PublicLayout>} />
                      <Route path="/news/:id" element={<PublicLayout><NewsDetail /></PublicLayout>} />
                      <Route path="/resources" element={<PublicLayout><Resources /></PublicLayout>} />
                      <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                      <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                      <Route path="/track-order" element={<PublicLayout><TrackOrder /></PublicLayout>} />
                      <Route path="/search" element={<PublicLayout><Search /></PublicLayout>} />

                      {/* 404 Route */}
                      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                      </Routes>
                    </MaintenanceWrapper>
                  </Router>
                  </PermissionProvider>
                </AuthProvider>
              </CartProvider>
            </ToastProvider>
          </LanguageProvider>
        </SettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
