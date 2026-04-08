import React, { useState, useEffect, useCallback } from 'react';
import { FiHome, FiCalendar, FiUser, FiSettings, FiPackage, FiImage, FiBarChart2, FiClock, FiDollarSign, FiStar, FiCheck, FiX, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { getStylistBookings, getServices, updateBooking } from '../tools/apiService';
import { useAuth } from '../tools/AuthContext';
import { useCurrency } from '../tools/CurrencyContext';
import '../styles/pages/coiffeurdashboard.scss';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CoiffeurDashboard = () => {
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  // ✅ CHARGEMENT DES DONNÉES (DÉJÀ DYNAMIQUE !)
  const loadData = useCallback(async () => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Charge UNIQUEMENT les bookings de CE stylist
      const bookingsData = await getStylistBookings(currentUser.uid);
      setBookings(bookingsData || []);
      
      // Charge tous les services
      const servicesData = await getServices();
      setServices(servicesData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]); // ✅ Dépend de currentUser.uid

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ VÉRIFICATION : Si pas de currentUser, afficher message (APRÈS les hooks)
  if (!currentUser) {
    return (
      <div className="coiffeur-dashboard">
        <div className="loading-container">
          <p>Please sign in to access your dashboard</p>
        </div>
      </div>
    );
  }

  // CALCULATE STATS (sur les bookings DÉJÀ FILTRÉS)
  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Today's bookings
    const todayBookings = bookings.filter(b => b.date === today && b.status !== 'cancelled').length;

    // This week's bookings
    const thisWeekBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= sevenDaysAgo && bookingDate <= currentDate && b.status !== 'cancelled';
    }).length;

    // Last week's bookings (for growth calculation)
    const lastWeekBookings = bookings.filter(b => {
      const bookingDate = new Date(b.date);
      return bookingDate >= fourteenDaysAgo && bookingDate < sevenDaysAgo && b.status !== 'cancelled';
    }).length;

    const weekGrowth = lastWeekBookings > 0 ? ((thisWeekBookings - lastWeekBookings) / lastWeekBookings * 100).toFixed(1) : 0;

    // Monthly revenue
    const monthlyRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === currentMonth && 
               bookingDate.getFullYear() === currentYear && 
               b.status === 'confirmed';
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    // Last month revenue (for growth calculation)
    const lastMonthRevenue = bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate.getMonth() === lastMonth && 
               bookingDate.getFullYear() === lastMonthYear && 
               b.status === 'confirmed';
      })
      .reduce((sum, b) => sum + (b.price || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    // Average rating (mock for now)
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

  // GET UPCOMING BOOKINGS (next 5)
  const getUpcomingBookings = () => {
    const today = new Date();
    return bookings
      .filter(b => new Date(b.date) >= today && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  // GET FILTERED BOOKINGS
  const getFilteredBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }

    // Filter by date
    const today = new Date();
    if (filterDate === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.date) >= today);
    } else if (filterDate === 'past') {
      filtered = filtered.filter(b => new Date(b.date) < today);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // HANDLE ACCEPT BOOKING
  const handleAcceptBooking = async (bookingId) => {
    try {
      await updateBooking(bookingId, { status: 'confirmed' });
      setBookings(prevBookings =>
        prevBookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
      );
    } catch (err) {
      console.error('Error accepting booking:', err);
      alert('Failed to accept booking. Please try again.');
    }
  };

  // HANDLE DECLINE BOOKING
  const handleDeclineBooking = async (bookingId) => {
    try {
      await updateBooking(bookingId, { status: 'cancelled' });
      setBookings(prevBookings =>
        prevBookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err) {
      console.error('Error declining booking:', err);
      alert('Failed to decline booking. Please try again.');
    }
  };

  // GET DAYS WITH BOOKINGS (for calendar)
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

  // GENERATE CALENDAR
  const generateCalendar = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysWithBookings = getDaysWithBookings();

    const weeks = [];
    let days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasBooking = daysWithBookings.includes(day);
      days.push(
        <div key={day} className={`calendar-day ${hasBooking ? 'has-booking' : ''}`}>
          {day}
        </div>
      );
      
      // Start new week
      if ((firstDay + day) % 7 === 0) {
        weeks.push(<div key={`week-${weeks.length}`} className="calendar-week">{days}</div>);
        days = [];
      }
    }
    
    // Add remaining days
    if (days.length > 0) {
      weeks.push(<div key={`week-${weeks.length}`} className="calendar-week">{days}</div>);
    }
    
    return weeks;
  };

  // ========================================
  // STATISTICS DATA CALCULATIONS
  // (Tous basés sur les bookings DÉJÀ FILTRÉS par stylistId)
  // ========================================
  
  // Revenue by month (last 6 months)
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

  // Bookings by service (top 5)
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

  // Status distribution
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
      { name: 'Confirmed', value: statusCounts.confirmed, color: '#10b981' },
      { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
    ];
  };

  // Bookings over time (last 30 days)
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

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="content-left">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon today">
                <FiCalendar />
              </div>
              <span className="stat-label">Today</span>
            </div>
            <div className="stat-value">{stats.todayBookings}</div>
            <div className="stat-description">
              <span>Bookings today</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon week">
                <FiClock />
              </div>
              <span className="stat-label">This Week</span>
            </div>
            <div className="stat-value">{stats.thisWeekBookings}</div>
            <div className="stat-description">
              <span>Last 7 days</span>
              <span className={`stat-growth ${stats.weekGrowth >= 0 ? 'positive' : ''}`}>
                {stats.weekGrowth >= 0 ? '+' : ''}{stats.weekGrowth}% vs last week
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon revenue">
                <FiDollarSign />
              </div>
              <span className="stat-label">Monthly Revenue</span>
            </div>
            <div className="stat-value">{formatPrice(stats.monthlyRevenue)}</div>
            <div className="stat-description">
              <span>This month</span>
              <span className={`stat-growth ${stats.revenueGrowth >= 0 ? 'positive' : ''}`}>
                {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth}% vs last month
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon rating">
                <FiStar />
              </div>
              <span className="stat-label">Rating</span>
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
              <span>Average rating</span>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Bookings</h2>
          <div className="bookings-list">
            {getUpcomingBookings().length === 0 ? (
              <div className="no-bookings">
                <p>No upcoming bookings</p>
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
                    <button className="btn-view-details">View Details</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => setActiveMenu('bookings')}>View All Bookings</button>
            <button className="action-btn" onClick={() => setActiveMenu('services')}>Manage Services</button>
            <button className="action-btn" onClick={() => setActiveMenu('statistics')}>View Reports</button>
          </div>
        </div>
      </div>

      <div className="content-right">
        {/* Calendar */}
        <div className="calendar-widget">
          <h3 className="calendar-title">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-grid">
            {generateCalendar()}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot"></div>
              <span>Has bookings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bookings-page">
      <h1 className="page-title-section">My Bookings</h1>
      
      <div className="filters">
        <select 
          className="filter-select" 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        <select 
          className="filter-select"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

      <div className="bookings-table">
        {getFilteredBookings().length === 0 ? (
          <div className="no-bookings-large">
            <p>No bookings found</p>
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
                <div className="service-duration">{booking.duration} min</div>
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
                      title="Accept"
                    >
                      <FiCheck />
                    </button>
                    <button 
                      className="btn-icon-danger"
                      onClick={() => handleDeclineBooking(booking.id)}
                      title="Decline"
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
      <h1 className="page-title-section">My Profile</h1>
      
      <div className="profile-card">
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {currentUser?.displayName?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h3>{currentUser?.displayName || 'Stylist'}</h3>
            <p>Professional Stylist</p>
          </div>
          <button className="btn-edit-profile">
            <FiEdit /> Edit Profile
          </button>
        </div>
        
        <div className="profile-body">
          <div className="profile-section">
            <h4>Contact Information</h4>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{currentUser?.email || 'stylist@lyamalbeautys.com'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value">{currentUser?.uid || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">Stylist</span>
            </div>
          </div>
          
          <div className="profile-section">
            <h4>Statistics</h4>
            <div className="info-row">
              <span className="info-label">Total Bookings</span>
              <span className="info-value">{bookings.length}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Confirmed Bookings</span>
              <span className="info-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Total Revenue</span>
              <span className="info-value">{formatPrice(bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.price || 0), 0))}</span>
            </div>
          </div>
          
          <div className="profile-section">
            <h4>Bio</h4>
            <p className="bio-text">
              Passionate about creating stunning transformations. Specializing in precision cuts, 
              creative coloring, and personalized styling that brings out the best in every client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="services-page">
      <div className="page-header-section">
        <h1 className="page-title-section">My Services</h1>
        <button className="btn-add">
          <FiPlus /> Add Service
        </button>
      </div>
      
      <div className="services-grid-dash">
        {services.slice(0, 6).map(service => (
          <div key={service.id} className="service-card-dash">
            <img src={service.image} alt={service.name} className="service-image-dash" />
            <div className="service-content-dash">
              <h3>{service.name}</h3>
              <p className="service-duration-dash">{service.duration} min</p>
              <p className="service-price-dash">{formatPrice(service.priceFrom)}</p>
              <div className="service-actions-dash">
                <button className="btn-edit-small">
                  <FiEdit /> Edit
                </button>
                <button className="btn-delete-small">
                  <FiTrash2 /> Delete
                </button>
              </div>
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
          <h1 className="page-title-section">My Portfolio</h1>
          <button className="btn-add">
            <FiPlus /> Add Photo
          </button>
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
                <h4 className="portfolio-title">Work {index + 1}</h4>
                <button className="btn-delete-overlay">
                  <FiTrash2 /> Delete
                </button>
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
    
    // Calculate total stats (sur les bookings DÉJÀ FILTRÉS)
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.price || 0), 0);
    const uniqueClients = new Set(bookings.map(b => b.clientId)).size;
    const avgRating = 4.8;

    return (
      <div className="statistics-page">
        <h1 className="page-title-section">Statistics</h1>
        
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-box">
            <FiCalendar className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{totalBookings}</div>
              <div className="stat-box-label">Total Bookings</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiDollarSign className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{formatPrice(totalRevenue)}</div>
              <div className="stat-box-label">Total Revenue</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiUser className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{uniqueClients}</div>
              <div className="stat-box-label">Unique Clients</div>
            </div>
          </div>
          
          <div className="stat-box">
            <FiStar className="stat-box-icon" />
            <div>
              <div className="stat-box-value">{avgRating}</div>
              <div className="stat-box-label">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Revenue Line Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Revenue Overview</h3>
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

          {/* Services Bar Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Top Services</h3>
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

          {/* Status Pie Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Booking Status</h3>
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

          {/* Timeline Area Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Bookings Timeline (Last 30 Days)</h3>
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
      <h1 className="page-title-section">Settings</h1>
      
      <div className="settings-card">
        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <span>Email notifications</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>SMS notifications</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Booking reminders</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Availability</h3>
          <div className="setting-item">
            <span>Accept new bookings</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Show profile publicly</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Danger Zone</h3>
          <button className="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  );

  // MAIN RENDER LOGIC
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
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
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-logo">LYAMAL</h1>
          <p className="sidebar-subtitle">Stylist Dashboard</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <FiHome className="nav-icon" />
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('bookings')}
          >
            <FiCalendar className="nav-icon" />
            <span>My Bookings</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveMenu('profile')}
          >
            <FiUser className="nav-icon" />
            <span>My Profile</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'services' ? 'active' : ''}`}
            onClick={() => setActiveMenu('services')}
          >
            <FiPackage className="nav-icon" />
            <span>My Services</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveMenu('portfolio')}
          >
            <FiImage className="nav-icon" />
            <span>My Portfolio</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveMenu('statistics')}
          >
            <FiBarChart2 className="nav-icon" />
            <span>Statistics</span>
          </button>
          
          <button 
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu('settings')}
          >
            <FiSettings className="nav-icon" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">
              {activeMenu === 'dashboard' && 'Dashboard'}
              {activeMenu === 'bookings' && 'My Bookings'}
              {activeMenu === 'profile' && 'My Profile'}
              {activeMenu === 'services' && 'My Services'}
              {activeMenu === 'portfolio' && 'My Portfolio'}
              {activeMenu === 'statistics' && 'Statistics'}
              {activeMenu === 'settings' && 'Settings'}
            </h1>
            <p className="header-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default CoiffeurDashboard;