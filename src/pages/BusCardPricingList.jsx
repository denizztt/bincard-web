import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { busCardApi } from '../services/apiService';
import '../styles/BusCardPricingList.css';

const BusCardPricingList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pricingList, setPricingList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('cardType');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadPricingList();
  }, []);

  useEffect(() => {
    filterAndSortList();
  }, [searchQuery, pricingList, sortBy, sortOrder]);

  const loadPricingList = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📋 Kart fiyatları listesi yükleniyor...');
      
      // Gerçek API çağrısı yapalım
      const response = await busCardApi.getAllCardPricing();
      console.log('✅ Kart fiyatları listesi başarıyla yüklendi:', response);
      
      // Backend'den gelen data'yı frontend formatına çevir
      const formattedData = response.map((item, index) => ({
        id: index + 1, // Backend'de id yoksa index kullan
        cardType: item.cardType,
        price: parseFloat(item.price), // String'i number'a çevir
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
        changePercent: 0, // Backend'de yoksa 0
        previousPrice: null // Backend'de yoksa null
      }));
      
      console.log('🔄 Formatted data:', formattedData);
      setPricingList(formattedData);
      
    } catch (err) {
      console.error('❌ Fiyatlandırma listesi yüklenirken hata:', err);
      setError('Fiyatlandırma listesi yüklenirken hata oluştu');
      
      // Hata durumunda boş liste göster
      setPricingList([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortList = () => {
    let filtered = [...pricingList];

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pricing => 
        pricing.cardType.toLowerCase().includes(query) ||
        pricing.price.toString().includes(query)
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'cardType':
          aValue = a.cardType;
          bValue = b.cardType;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          aValue = a.cardType;
          bValue = b.cardType;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredList(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewDetails = (pricing) => {
    setSelectedPricing(pricing);
    setShowDetails(true);
  };

  const getCardTypeLabel = (cardType) => {
    const typeLabels = {
      'TAM': 'Tam Bilet',
      'ÖĞRENCİ': 'Öğrenci',
      'ÖĞRETMEN': 'Öğretmen',
      'YAŞLI': 'Yaşlı',
      'ENGELLİ': 'Engelli',
      'ÇOCUK': 'Çocuk',
      'TURİST': 'Turist',
      'ABONMAN': 'Abonman',
      'ÖĞRENCİ_AKTARMA': 'Öğrenci Aktarma',
      'ENGELLİ_AKTARMA': 'Engelli Aktarma'
    };
    return typeLabels[cardType] || cardType;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeIcon = (changePercent) => {
    if (changePercent > 0) return <TrendingUp size={16} className="trend-up" />;
    if (changePercent < 0) return <TrendingDown size={16} className="trend-down" />;
    return <Minus size={16} className="trend-neutral" />;
  };

  const getChangeColor = (changePercent) => {
    if (changePercent > 0) return '#ef4444';
    if (changePercent < 0) return '#10b981';
    return '#6b7280';
  };

  return (
    <div className="buscard-pricing-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
            title="Dashboard'a Dön"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <h1>Fiyatlandırma Listesi</h1>
            <p>Tüm kart tiplerinin fiyatlarını görüntüle ve analiz et</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={loadPricingList}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw className={loading ? 'spinning' : ''} size={20} />
          </button>
          <button 
            className="export-button"
            title="Dışa Aktar"
          >
            <Download size={20} />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Kart tipi veya fiyat ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-actions">
          <button className="filter-button">
            <Filter size={20} />
            Filtrele
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Toplam Kart Tipi</h3>
            <div className="stat-number">{pricingList.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Ortalama Fiyat</h3>
            <div className="stat-number">
              {formatCurrency(
                pricingList.reduce((sum, p) => sum + p.price, 0) / pricingList.length || 0
              )}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>Son Güncelleme</h3>
            <div className="stat-number">
              {pricingList.length > 0 ? 
                formatDate(Math.max(...pricingList.map(p => new Date(p.updatedAt)))) : 
                '-'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Table */}
      <div className="pricing-table-container">
        <div className="table-header">
          <h3>Fiyatlandırma Detayları ({filteredList.length})</h3>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="spinning" size={32} />
            <p>Fiyatlandırma listesi yükleniyor...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>Sonuç bulunamadı</h3>
            <p>Arama kriterlerinize uygun fiyatlandırma bulunmuyor</p>
          </div>
        ) : (
          <div className="pricing-table">
            <div className="table-header-row">
              <div 
                className="col-type sortable"
                onClick={() => handleSort('cardType')}
              >
                Kart Tipi
                {sortBy === 'cardType' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div 
                className="col-price sortable"
                onClick={() => handleSort('price')}
              >
                Fiyat
                {sortBy === 'price' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="col-change">Değişim</div>
              <div 
                className="col-updated sortable"
                onClick={() => handleSort('updatedAt')}
              >
                Son Güncelleme
                {sortBy === 'updatedAt' && (
                  <span className="sort-indicator">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
              <div className="col-actions">İşlemler</div>
            </div>
            
            {filteredList.map((pricing) => (
              <div key={pricing.id} className="table-row">
                <div className="col-type">
                  <span className="type-badge">{getCardTypeLabel(pricing.cardType)}</span>
                </div>
                <div className="col-price">
                  <span className="price-amount">{formatCurrency(pricing.price)}</span>
                </div>
                <div className="col-change">
                  <div className="change-info">
                    {getChangeIcon(pricing.changePercent || 0)}
                    <span 
                      className="change-percent"
                      style={{ color: getChangeColor(pricing.changePercent || 0) }}
                    >
                      {(pricing.changePercent || 0) > 0 ? '+' : ''}{(pricing.changePercent || 0).toFixed(1)}%
                    </span>
                    {pricing.previousPrice && pricing.previousPrice !== pricing.price && (
                      <span className="previous-price">
                        ({formatCurrency(pricing.previousPrice)})
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-updated">
                  <span className="date-value">{formatDate(pricing.updatedAt)}</span>
                </div>
                <div className="col-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewDetails(pricing)}
                    title="Detayları Görüntüle"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedPricing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Fiyatlandırma Detayları</h3>
              <button 
                className="close-button"
                onClick={() => setShowDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Kart Tipi</label>
                  <span className="detail-value">{getCardTypeLabel(selectedPricing.cardType)}</span>
                </div>
                <div className="detail-item">
                  <label>Güncel Fiyat</label>
                  <span className="detail-value price">{formatCurrency(selectedPricing.price)}</span>
                </div>
                <div className="detail-item">
                  <label>Önceki Fiyat</label>
                  <span className="detail-value">{formatCurrency(selectedPricing.previousPrice)}</span>
                </div>
                <div className="detail-item">
                  <label>Değişim Oranı</label>
                  <span 
                    className="detail-value change"
                    style={{ color: getChangeColor(selectedPricing.changePercent) }}
                  >
                    {getChangeIcon(selectedPricing.changePercent)}
                    {selectedPricing.changePercent > 0 ? '+' : ''}{selectedPricing.changePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="detail-item">
                  <label>Oluşturulma Tarihi</label>
                  <span className="detail-value">{formatDate(selectedPricing.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <label>Son Güncelleme</label>
                  <span className="detail-value">{formatDate(selectedPricing.updatedAt)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDetails(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCardPricingList;
