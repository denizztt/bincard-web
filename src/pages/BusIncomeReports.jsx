import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  BarChart3,
  FileText
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import '../styles/BusIncomeReports.css';

const BusIncomeReports = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, daily, weekly, monthly
  
  // Summary data
  const [summaryData, setSummaryData] = useState(null);
  
  // Daily data
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);
  
  // Weekly data
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [weeklyData, setWeeklyData] = useState(null);
  
  // Monthly data
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);

  useEffect(() => {
    if (activeTab === 'summary') {
      loadSummaryData();
    }
  }, [activeTab]);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.getIncomeSummary();
      
      if (response && response.success) {
        setSummaryData(response.data);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Gelir özeti yüklenirken hata:', err);
      setError('Gelir özeti yüklenemedi');
      setSummaryData(null);
      setLoading(false);
    }
  };

  const loadDailyData = async () => {
    if (!dailyDate) {
      alert('Lütfen tarih seçin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.getDailyBusIncome(dailyDate);
      
      if (response && response.success) {
        setDailyData(response.data);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Günlük gelir yüklenirken hata:', err);
      setError('Günlük gelir yüklenemedi');
      setDailyData(null);
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    if (!startDate || !endDate) {
      alert('Lütfen tarih aralığı seçin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.getWeeklyBusIncome(startDate, endDate);
      
      if (response && response.success) {
        setWeeklyData(response.data);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Haftalık gelir yüklenirken hata:', err);
      setError('Haftalık gelir yüklenemedi');
      setWeeklyData(null);
      setLoading(false);
    }
  };

  const loadMonthlyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await superAdminApi.getMonthlyBusIncome(selectedYear, selectedMonth);
      
      if (response && response.success) {
        setMonthlyData(response.data);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Aylık gelir yüklenirken hata:', err);
      setError('Aylık gelir yüklenemedi');
      setMonthlyData(null);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₺0,00';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const renderSummaryView = () => {
    if (!summaryData) return null;

    const items = Object.entries(summaryData).map(([key, value]) => ({
      plate: key,
      income: value
    }));

    const totalIncome = items.reduce((sum, item) => sum + parseFloat(item.income || 0), 0);

    return (
      <div className="summary-view">
        <div className="summary-header">
          <div className="summary-total">
            <DollarSign size={32} />
            <div>
              <h3>Toplam Gelir</h3>
              <p className="total-amount">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <table className="income-table">
            <thead>
              <tr>
                <th>Plaka</th>
                <th>Gelir</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.plate}</td>
                  <td className="income-cell">{formatCurrency(item.income)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <FileText size={48} />
            <p>Gelir verisi bulunmuyor</p>
          </div>
        )}
      </div>
    );
  };

  const renderDailyView = () => (
    <div className="daily-view">
      <div className="filters-section">
        <div className="filter-group">
          <label>Tarih:</label>
          <input
            type="date"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
          />
          <button onClick={loadDailyData} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Yükle
          </button>
        </div>
      </div>

      {dailyData && (
        <div className="data-display">
          <h3>{dailyDate} Günlük Gelir</h3>
          {Object.entries(dailyData).length > 0 ? (
            <table className="income-table">
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Gelir</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(dailyData).map(([plate, income]) => (
                  <tr key={plate}>
                    <td>{plate}</td>
                    <td className="income-cell">{formatCurrency(income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <FileText size={48} />
              <p>Bu tarihe ait gelir verisi bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderWeeklyView = () => (
    <div className="weekly-view">
      <div className="filters-section">
        <div className="filter-group">
          <label>Başlangıç:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Bitiş:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={loadWeeklyData} className="btn btn-primary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Yükle
        </button>
      </div>

      {weeklyData && (
        <div className="data-display">
          <h3>{startDate} - {endDate} Haftalık Gelir</h3>
          {Object.entries(weeklyData).length > 0 ? (
            <table className="income-table">
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Gelir</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(weeklyData).map(([plate, income]) => (
                  <tr key={plate}>
                    <td>{plate}</td>
                    <td className="income-cell">{formatCurrency(income)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">
              <FileText size={48} />
              <p>Bu tarih aralığına ait gelir verisi bulunmuyor</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMonthlyView = () => {
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    return (
      <div className="monthly-view">
        <div className="filters-section">
          <div className="filter-group">
            <label>Yıl:</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min="2020"
              max={new Date().getFullYear()}
            />
          </div>
          <div className="filter-group">
            <label>Ay:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <button onClick={loadMonthlyData} className="btn btn-primary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Yükle
          </button>
        </div>

        {monthlyData && (
          <div className="data-display">
            <h3>{months[selectedMonth - 1]} {selectedYear} Aylık Gelir</h3>
            {Object.entries(monthlyData).length > 0 ? (
              <table className="income-table">
                <thead>
                  <tr>
                    <th>Plaka</th>
                    <th>Gelir</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyData).map(([plate, income]) => (
                    <tr key={plate}>
                      <td>{plate}</td>
                      <td className="income-cell">{formatCurrency(income)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data">
                <FileText size={48} />
                <p>Bu ay için gelir verisi bulunmuyor</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bus-income-reports-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <div className="header-left">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <h1 className="page-title">💰 Gelir Raporları</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={() => {
                if (activeTab === 'summary') loadSummaryData();
                else if (activeTab === 'daily') loadDailyData();
                else if (activeTab === 'weekly') loadWeeklyData();
                else if (activeTab === 'monthly') loadMonthlyData();
              }}
              className="btn btn-primary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-section">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <BarChart3 size={16} />
            Genel Özet
          </button>
          <button 
            className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <Calendar size={16} />
            Günlük
          </button>
          <button 
            className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <TrendingUp size={16} />
            Haftalık
          </button>
          <button 
            className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            <FileText size={16} />
            Aylık
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        {loading && activeTab !== 'summary' && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Veriler yükleniyor...</p>
          </div>
        )}

        {activeTab === 'summary' && renderSummaryView()}
        {activeTab === 'daily' && renderDailyView()}
        {activeTab === 'weekly' && renderWeeklyView()}
        {activeTab === 'monthly' && renderMonthlyView()}
      </div>
    </div>
  );
};

export default BusIncomeReports;

