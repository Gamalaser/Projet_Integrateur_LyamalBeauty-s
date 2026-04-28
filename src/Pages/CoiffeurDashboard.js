import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome, FiCalendar, FiUser, FiSettings, FiPackage, FiImage, FiBarChart2, FiClock, FiDollarSign, FiStar, FiCheck, FiX, FiFileText } from 'react-icons/fi';
import { getStylistBookings, getServices, updateBooking } from '../tools/apiService';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import '../styles/pages/coiffeurdashboard.scss';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CoiffeurDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadData = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const bookingsData = await getStylistBookings(currentUser.uid);
      setBookings(bookingsData || []);
      
      const servicesData = await getServices();
      setServices(servicesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(t('dashboard.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentUser) {
    return (
      <div className="coiffeur-dashboard">
        <div className="loading-container">
          <p>{t('dashboard.error.signInRequired')}</p>
        </div>
      </div>
    );
  }

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseBookingDetails = () => {
    setSelectedBooking(null);
  };

  const handleDeleteAccount = () => {
    if (window.confirm(t('dashboard.settings.deleteConfirm'))) {
      alert(t('dashboard.settings.deleteNotImplemented'));
    }
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled').length;

    const thisWeekBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= sevenDaysAgo && bookingDate <= currentDate && b.status !== 'cancelled';
    }).length;

    const lastWeekBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= fourteenDaysAgo && bookingDate < sevenDaysAgo && b.status !== 'cancelled';
    }).length;

    const weekGrowth = lastWeekBookings > 0 ? ((thisWeekBookings - lastWeekBookings) / lastWeekBookings * 100).toFixed(1) : 0;

    const monthlyRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear && 
               b.status === 'confirmed';
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const lastMonthRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === lastMonth && 
               bookingDate.getFullYear() === lastMonthYear && 
               b.status === 'confirmed';
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    const avgRating = 4.8;

    return {
      todayBookings,
      thisWeekBookings,
      weekGrowth,
      monthlyRevenue,
      revenueGrowth,
      avgRating
    };
  };

  const stats = calculateStats();

  const getUpcomingBookings = () => {
    const today = new Date();
    return bookings
      .filter(b => new Date(b.date) >= today && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const getFilteredBookings = () => {
    let filtered = [...bookings];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    const today = new Date();
    if (filterDate === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.date) >= today);
    } else if (filterDate === 'past') {
      filtered = filtered.filter(b => new Date(b.date) < today);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await updateBooking(bookingId, { status: 'confirmed' });
      setBookings(prevBookings =>
        prevBookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
      );
      alert(t('dashboard.bookings.acceptSuccess'));
    } catch (err) {
      console.error('Error accepting booking:', err);
      alert(t('dashboard.bookings.acceptError'));
    }
  };

  const handleDeclineBooking = async (bookingId) => {
    if (window.confirm(t('dashboard.bookings.declineConfirm'))) {
      try {
        await updateBooking(bookingId, { status: 'cancelled' });
        setBookings(prevBookings =>
          prevBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
        );
        alert(t('dashboard.bookings.declineSuccess'));
      } catch (err) {
        console.error('Error declining booking:', err);
        alert(t('dashboard.bookings.declineError'));
      }
    }
  };

  const getDaysWithBookings = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear &&
               b.status !== 'cancelled';
      })
      .map(b => parseInt(b.date.split('-')[2]));
  };

  const generateCalendar = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysWithBookings = getDaysWithBookings();

    const weeks = [];
    let days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const hasBooking = daysWithBookings.includes(day);
      days.push(
        <div key={day} className={`calendar-day ${hasBooking ? 'has-booking' : ''}`}>
          {day}
        </div>
      );
      
      if ((firstDay + day) % 7 === 0) {
        weeks.push(<div key={`week-${weeks.length}`} className="calendar-week">{days}</div>);
        days = [];
      }
    }
    
    if (days.length > 0) {
      weeks.push(<div key={`week-${weeks.length}`} className="calendar-week">{days}</div>);
    }
    
    return weeks;
  };

  const getRevenueByMonth = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const revenue = bookings
        .filter(b => {
          const bookingDate = new Date(b.date);
          return bookingDate.getMonth() === month && 
                 bookingDate.getFullYear() === year && 
                 b.status === 'confirmed';
        })
        .reduce((sum, b) => sum + (b.price || 0), 0);
      
      months.push({
        month: monthName,
        revenue: revenue
      });
    }
    
    return months;
  };

  const getBookingsByService = () => {
    const serviceCounts = {};
    
    bookings.forEach(b => {
      if (b.status !== 'cancelled') {
        const serviceName = b.serviceName || 'Unknown';
        serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      }
    });
    
    return Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  const getStatusDistribution = () => {
    const statusCounts = {
      confirmed: 0,
      pending: 0,
      cancelled: 0
    };
    
    bookings.forEach(b => {
      if (statusCounts.hasOwnProperty(b.status)) {
        statusCounts[b.status]++;
      }
    });
    
    return [
      { name: t('account.bookings.status.confirmed'), value: statusCounts.confirmed, color: '#10b981' },
      { name: t('account.bookings.status.pending'), value: statusCounts.pending, color: '#f59e0b' },
      { name: t('account.bookings.status.cancelled'), value: statusCounts.cancelled, color: '#ef4444' }
    ];
  };

  const getBookingsOverTime = () => {
    const days = [];
    const currentDate = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      const count = bookings.filter(b => b.date === dateString && b.status !== 'cancelled').length;
      
      days.push({
        date: dayName,
        bookings: count
      });
    }
    
    return days;
  };

  const getServiceImage = (service) => {
    if (service.image && service.image.startsWith('http')) {
      return service.image;
    }
    
    const serviceImages = {
      "Men's Haircut": 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
      "Women's Haircut": 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'Hair Coloring': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80',
      'Balayage': 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=400&q=80',
      'Blowout': 'https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400&q=80',
      'Keratin Treatment': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80',
      'Hair Extensions': 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
      'Deep Conditioning': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
      'Updo Styling': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
      'Bridal Hair': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
      'Beard Trim': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
      'Hot Towel Shave': 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
      'Hair Highlights': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
      'Ombre': 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=80',
      'Root Touch-Up': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80',
      'Perm': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
      'Japanese Straightening': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80',
      'Scalp Treatment': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
      'Kids Haircut': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
      'Bang Trim': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'Consultation': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
      'Olaplex Treatment': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
      'Makeup Application': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80'
    };
    
    if (serviceImages[service.name]) {
      return serviceImages[service.name];
    }
    
    const categoryImages = {
      'Hair': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'Styling': 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80',
      'Treatment': 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80',
      'Grooming': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&q=80',
      'Makeup': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
      'Consultation': 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80'
    };
    
    return categoryImages[service.category] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80';
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="content-left">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon today">
                <FiCalendar />
              </div>
              <span className="stat-label">{t('dashboard.stats.today')}</span>
            </div>
            <div className="stat-value">{stats.todayBookings}</div>
            <div className="stat-description">
              <span>{t('dashboard.stats.bookingsToday')}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon week">
                <FiClock />
              </div>
              <span className="stat-label">{t('dashboard.stats.thisWeek')}</span>
            </div>
            <div className="stat-value">{stats.thisWeekBookings}</div>
            <div className="stat-description">
              <span>{t('dashboard.stats.last7Days')}</span>
              <span className={`stat-growth ${stats.weekGrowth >= 0 ? 'positive' : ''}`}>
                {stats.weekGrowth >= 0 ? '+' : ''}{stats.weekGrowth}% {t('dashboard.stats.vsLastWeek')}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <FiDollarSign />
              </div>
              <span className="stat-label">{t('dashboard.stats.monthlyRevenue')}</span>
            </div>
            <div className="stat-value">{formatPrice(stats.monthlyRevenue)}</div>
            <div className="stat-description">
              <span>{t('dashboard.stats.thisMonth')}</span>
              <span className={`stat-growth ${stats.revenueGrowth >= 0 ? 'positive' : ''}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% {t('dashboard.stats.vsLastMonth')}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon rating">
                <FiStar />
              </div>
              <span className="stat-label">{t('dashboard.stats.rating')}</span>
            </div>
            <div className="stat-value">
              {stats.avgRating}
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="star-filled" />
                ))}
              </div>
            </div>
            <div className="stat-description">
              <span>{t('dashboard.stats.averageRating')}</span>
            </div>
          </div>
        </div>

        <div className="upcoming-section">
          <h2 className="section-title">{t('dashboard.upcomingBookings')}</h2>
          <div className="bookings-list">
            {getUpcomingBookings().length === 0 ? (
              <div className="no-bookings">
                <p>{t('dashboard.noUpcoming')}</p>
              </div>
            ) : (
              getUpcomingBookings().map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-photo">
                    <img src={`https://i.pravatar.cc/150?u=${booking.clientId}`} alt={booking.clientName} />
                  </div>
                  <div className="booking-info">
                    <h3 className="booking-client">{booking.clientName}</h3>
                    <p className="booking-service">{booking.serviceName}</p>
                    <div className="booking-details">
                      <span><FiCalendar /> {new Date(booking.date).toLocaleDateString()}</span>
                      <span><FiClock /> {booking.time}</span>
                      <span><FiDollarSign /> {formatPrice(booking.price)}</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    <span className={`booking-status ${booking.status}`}>{booking.status}</span>
                    <button 
                      className="btn-view-details"
                      onClick={() => handleViewBookingDetails(booking)}
                    >
                      {t('dashboard.viewDetails')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">{t('dashboard.quickActions')}</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setActiveMenu('bookings')}>{t('dashboard.viewAllBookings')}</button>
            <button className="action-btn" onClick={() => setActiveMenu('services')}>{t('dashboard.manageServices')}</button>
            <button className="action-btn" onClick={() => setActiveMenu('statistics')}>{t('dashboard.viewReports')}</button>
          </div>
        </div>
      </div>

      <div className="content-right">
        <div className="calendar-widget">
          <h3 className="calendar-title">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div className="calendar-weekdays">
            {[
              t('dashboard.calendar.sun'),
              t('dashboard.calendar.mon'),
              t('dashboard.calendar.tue'),
              t('dashboard.calendar.wed'),
              t('dashboard.calendar.thu'),
              t('dashboard.calendar.fri'),
              t('dashboard.calendar.sat')
            ].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {generateCalendar()}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot"></div>
              <span>{t('dashboard.calendar.hasBookings')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bookings-page">
      <h1 className="page-title-section">{t('dashboard.bookings.title')}</h1>
      
      <div className="filters">
        <select 
          className="filter-select" 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t('dashboard.bookings.allStatus')}</option>
          <option value="pending">{t('account.bookings.status.pending')}</option>
          <option value="confirmed">{t('account.bookings.status.confirmed')}</option>
          <option value="cancelled">{t('account.bookings.status.cancelled')}</option>
        </select>
        
        <select 
          className="filter-select"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="all">{t('dashboard.bookings.allDates')}</option>
          <option value="upcoming">{t('dashboard.bookings.upcoming')}</option>
          <option value="past">{t('dashboard.bookings.past')}</option>
        </select>
      </div>

      <div className="bookings-table">
        {getFilteredBookings().length === 0 ? (
          <div className="no-bookings-large">
            <p>{t('dashboard.bookings.noBookings')}</p>
          </div>
        ) : (
          getFilteredBookings().map(booking => (
            <div key={booking.id} className="booking-row">
              <div className="booking-col-client">
                <img 
                  src={`https://i.pravatar.cc/150?u=${booking.clientId}`} 
                  alt={booking.clientName}
                  className="client-avatar-small"
                />
                <div>
                  <div className="client-name">{booking.clientName}</div>
                  <div className="client-email">{booking.clientEmail}</div>
                </div>
              </div>
              
              <div className="booking-col-service">
                <div className="service-name">{booking.serviceName}</div>
                <div className="service-duration">{booking.duration} {t('dashboard.bookings.minutes')}</div>
              </div>
              
              <div className="booking-col-datetime">
                <div className="booking-date-text">
                  <FiCalendar /> {new Date(booking.date).toLocaleDateString()}
                </div>
                <div className="booking-time-text">
                  <FiClock /> {booking.time}
                </div>
              </div>
              
              <div className="booking-col-price">
                {formatPrice(booking.price)}
              </div>
              
              <div className="booking-col-status">
                <span className={`status-badge-large ${booking.status}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="booking-col-actions">
                {booking.status === 'pending' && (
                  <>
                    <button 
                      className="btn-icon-success"
                      onClick={() => handleAcceptBooking(booking.id)}
                      title={t('dashboard.bookings.accept')}
                    >
                      <FiCheck />
                    </button>
                    <button 
                      className="btn-icon-danger"
                      onClick={() => handleDeclineBooking(booking.id)}
                      title={t('dashboard.bookings.decline')}
                    >
                      <FiX />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-page">
      <h1 className="page-title-section">{t('dashboard.profile.title')}</h1>
      
      <div className="profile-card">
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h3>{currentUser?.displayName || 'Stylist'}</h3>
            <p>{t('dashboard.profile.professionalStylist')}</p>
          </div>
        </div>
        
        <div className="profile-body">
          <div className="profile-section">
            <h4>{t('dashboard.profile.contactInfo')}</h4>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.email')}</span>
              <span className="info-value">{currentUser?.email || 'stylist@lyamalbeautys.com'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.userId')}</span>
              <span className="info-value">{currentUser?.uid || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.role')}</span>
              <span className="info-value">{t('dashboard.profile.stylist')}</span>
            </div>
          </div>
          
          <div className="profile-section">
            <h4>{t('dashboard.profile.statistics')}</h4>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.totalBookings')}</span>
              <span className="info-value">{bookings.length}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.confirmedBookings')}</span>
              <span className="info-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{t('dashboard.profile.totalRevenue')}</span>
              <span className="info-value">{formatPrice(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.price || 0), 0))}</span>
            </div>
          </div>
          
          <div className="profile-section">
            <h4>{t('dashboard.profile.bio')}</h4>
            <p className="bio-text">
              {t('dashboard.profile.bioText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="services-page">
      <div className="page-header-section">
        <h1 className="page-title-section">{t('dashboard.services.title')}</h1>
      </div>
      
      <div className="services-grid-dash">
        {services.slice(0, 6).map(service => (
          <div key={service.id} className="service-card-dash">
            <img 
              src={getServiceImage(service)} 
              alt={service.name} 
              className="service-image-dash" 
            />
            <div className="service-content-dash">
              <h3>{service.name}</h3>
              <p className="service-duration-dash">{service.duration} {t('dashboard.bookings.minutes')}</p>
              <p className="service-price-dash">{formatPrice(service.priceFrom)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPortfolio = () => {
    const portfolioImages = [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80',
      'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&q=80',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&q=80',
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&q=80'
    ];

    return (
      <div className="portfolio-page">
        <div className="page-header-section">
          <h1 className="page-title-section">{t('dashboard.portfolio.title')}</h1>
        </div>
        
        <div className="portfolio-grid">
          {portfolioImages.map((imageUrl, index) => (
            <div key={index} className="portfolio-item">
              <img 
                src={imageUrl}
                alt={`Portfolio ${index + 1}`}
                className="portfolio-image"
              />
              <div className="portfolio-overlay">
                <h4 className="portfolio-title">{t('dashboard.portfolio.work')} {index + 1}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatistics = () => {
    const revenueData = getRevenueByMonth();
    const servicesData = getBookingsByService();
    const statusData = getStatusDistribution();
    const timelineData = getBookingsOverTime();
    
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const uniqueClients = new Set(bookings.map(b => b.clientId)).size;
    const avgRating = 4.8;

    return (
      <div className="statistics-page">
        <h1 className="page-title-section">{t('dashboard.statistics.title')}</h1>
        
        <div className="stats-overview">
          <div className="stat-box">
            <FiCalendar className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{totalBookings}</div>
              <div className="stat-box-label">{t('dashboard.statistics.totalBookings')}</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiDollarSign className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{formatPrice(totalRevenue)}</div>
              <div className="stat-box-label">{t('dashboard.statistics.totalRevenue')}</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiUser className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{uniqueClients}</div>
              <div className="stat-box-label">{t('dashboard.statistics.uniqueClients')}</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiStar className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{avgRating}</div>
              <div className="stat-box-label">{t('dashboard.statistics.averageRating')}</div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">{t('dashboard.statistics.revenueOverview')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => formatPrice(value)}
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#d4af37" 
                  strokeWidth={3}
                  dot={{ fill: '#d4af37', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">{t('dashboard.statistics.topServices')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={servicesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="bookings" fill="#d4af37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">{t('dashboard.statistics.bookingStatus')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">{t('dashboard.statistics.bookingsTimeline')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="settings-page">
      <h1 className="page-title-section">{t('dashboard.settings.title')}</h1>
      
      <div className="settings-card">
        <div className="settings-section">
          <h3>{t('dashboard.settings.notifications')}</h3>
          <div className="setting-item">
            <span>{t('dashboard.settings.emailNotifications')}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>{t('dashboard.settings.smsNotifications')}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>{t('dashboard.settings.bookingReminders')}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>{t('dashboard.settings.availability')}</h3>
          <div className="setting-item">
            <span>{t('dashboard.settings.acceptNewBookings')}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>{t('dashboard.settings.showPublicly')}</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>{t('dashboard.settings.dangerZone')}</h3>
          <button 
            className="btn-danger"
            onClick={handleDeleteAccount}
          >
            {t('dashboard.settings.deleteAccount')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderBookingDetailsModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="booking-modal-overlay" onClick={handleCloseBookingDetails}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
          <div className="booking-modal-header">
            <h2>{t('dashboard.modal.bookingDetails')}</h2>
            <button className="booking-modal-close" onClick={handleCloseBookingDetails}>
              <FiX />
            </button>
          </div>

          <div className="booking-modal-body">
            <div className="booking-modal-section">
              <h3><FiUser /> {t('dashboard.modal.clientInfo')}</h3>
              <div className="booking-modal-client">
                <img 
                  src={`https://i.pravatar.cc/150?u=${selectedBooking.clientId}`} 
                  alt={selectedBooking.clientName}
                  className="booking-modal-avatar"
                />
                <div>
                  <p className="booking-modal-client-name">{selectedBooking.clientName}</p>
                  <p className="booking-modal-client-email">{selectedBooking.clientEmail}</p>
                </div>
              </div>
            </div>

            <div className="booking-modal-section">
              <h3><FiPackage /> {t('dashboard.modal.serviceDetails')}</h3>
              <div className="booking-modal-info-grid">
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.service')}</span>
                  <span className="booking-modal-value">{selectedBooking.serviceName}</span>
                </div>
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.duration')}</span>
                  <span className="booking-modal-value">{selectedBooking.duration} {t('dashboard.modal.minutes')}</span>
                </div>
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.price')}</span>
                  <span className="booking-modal-value">{formatPrice(selectedBooking.price)}</span>
                </div>
              </div>
            </div>

            <div className="booking-modal-section">
              <h3><FiCalendar /> {t('dashboard.modal.appointment')}</h3>
              <div className="booking-modal-info-grid">
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.date')}</span>
                  <span className="booking-modal-value">{new Date(selectedBooking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.time')}</span>
                  <span className="booking-modal-value">{selectedBooking.time}</span>
                </div>
                <div className="booking-modal-info-item">
                  <span className="booking-modal-label">{t('dashboard.modal.status')}</span>
                  <span className={`booking-modal-status ${selectedBooking.status}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="booking-modal-section">
                <h3><FiFileText /> {t('dashboard.modal.notes')}</h3>
                <p className="booking-modal-notes">{selectedBooking.notes}</p>
              </div>
            )}
          </div>

          <div className="booking-modal-footer">
            {selectedBooking.status === 'pending' && (
              <>
                <button 
                  className="booking-modal-btn booking-modal-btn-success"
                  onClick={() => {
                    handleAcceptBooking(selectedBooking.id);
                    handleCloseBookingDetails();
                  }}
                >
                  <FiCheck /> {t('dashboard.modal.acceptBooking')}
                </button>
                <button 
                  className="booking-modal-btn booking-modal-btn-danger"
                  onClick={() => {
                    handleDeclineBooking(selectedBooking.id);
                    handleCloseBookingDetails();
                  }}
                >
                  <FiX /> {t('dashboard.modal.declineBooking')}
                </button>
              </>
            )}
            <button 
              className="booking-modal-btn booking-modal-btn-secondary"
              onClick={handleCloseBookingDetails}
            >
              {t('dashboard.modal.close')}
            </button>
          </div>
        </div>

        <style jsx>{`
          .booking-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }

          .booking-modal {
            background: white;
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .booking-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px 32px;
            border-bottom: 1px solid #e5e7eb;
          }

          .booking-modal-header h2 {
            margin: 0;
            font-size: 24px;
            color: #111827;
          }

          .booking-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            transition: color 0.2s;
          }

          .booking-modal-close:hover {
            color: #111827;
          }

          .booking-modal-body {
            padding: 32px;
          }

          .booking-modal-section {
            margin-bottom: 32px;
          }

          .booking-modal-section:last-child {
            margin-bottom: 0;
          }

          .booking-modal-section h3 {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 16px 0;
            font-size: 16px;
            font-weight: 600;
            color: #374151;
          }

          .booking-modal-client {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .booking-modal-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
          }

          .booking-modal-client-name {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 600;
            color: #111827;
          }

          .booking-modal-client-email {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }

          .booking-modal-info-grid {
            display: grid;
            gap: 16px;
          }

          .booking-modal-info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .booking-modal-label {
            font-size: 12px;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .booking-modal-value {
            font-size: 16px;
            color: #111827;
            font-weight: 500;
          }

          .booking-modal-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            text-transform: capitalize;
          }

          .booking-modal-status.pending {
            background: #fef3c7;
            color: #92400e;
          }

          .booking-modal-status.confirmed {
            background: #d1fae5;
            color: #065f46;
          }

          .booking-modal-status.cancelled {
            background: #fee2e2;
            color: #991b1b;
          }

          .booking-modal-notes {
            margin: 0;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            color: #374151;
            line-height: 1.6;
          }

          .booking-modal-footer {
            padding: 24px 32px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .booking-modal-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .booking-modal-btn-success {
            background: #10b981;
            color: white;
          }

          .booking-modal-btn-success:hover {
            background: #059669;
          }

          .booking-modal-btn-danger {
            background: #ef4444;
            color: white;
          }

          .booking-modal-btn-danger:hover {
            background: #dc2626;
          }

          .booking-modal-btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }

          .booking-modal-btn-secondary:hover {
            background: #e5e7eb;
          }
        `}</style>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('dashboard.loading')}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadData}>{t('dashboard.error.retry')}</button>
        </div>
      );
    }

    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'bookings':
        return renderBookings();
      case 'profile':
        return renderProfile();
      case 'services':
        return renderServices();
      case 'portfolio':
        return renderPortfolio();
      case 'statistics':
        return renderStatistics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="coiffeur-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">LYAMAL</h1>
          <p className="sidebar-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <FiHome className="nav-icon" />
            <span>{t('dashboard.nav.dashboard')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('bookings')}
          >
            <FiCalendar className="nav-icon" />
            <span>{t('dashboard.nav.bookings')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <FiUser className="nav-icon" />
            <span>{t('dashboard.nav.profile')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => setActiveMenu('services')}
          >
            <FiPackage className="nav-icon" />
            <span>{t('dashboard.nav.services')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveMenu('portfolio')}
          >
            <FiImage className="nav-icon" />
            <span>{t('dashboard.nav.portfolio')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('statistics')}
          >
            <FiBarChart2 className="nav-icon" />
            <span>{t('dashboard.nav.statistics')}</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('settings')}
          >
            <FiSettings className="nav-icon" />
            <span>{t('dashboard.nav.settings')}</span>
          </button>
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">
              {t('dashboard.welcome')}, {currentUser?.displayName || 'Stylist'}!
            </h1>
            <p className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {renderContent()}
      </div>

      {renderBookingDetailsModal()}
    </div>
  );
};

export default CoiffeurDashboard;