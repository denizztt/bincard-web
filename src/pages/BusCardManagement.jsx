import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  CreditCard, 
  Shield, 
  ShieldOff, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Filter,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { busCardApi } from '../services/apiService';
import '../styles/BusCardManagement.css';

const BusCardManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadCards();
  }, [page, size]);

  useEffect(() => {
    filterCards();
  }, [searchQuery, cards]);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('📋 Kartlar yükleniyor...', { page, size });
      
      const response = await busCardApi.getAllCards(page, size);
      
      // Backend'den Page<BusCardDTO> dönüyor
      if (response && response.content) {
        setCards(response.content);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        console.log('📋 Kartlar başarıyla yüklendi:', {
          content: response.content,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        });
      } else if (response && Array.isArray(response)) {
        // Eğer direkt array dönerse
        setCards(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setCards([]);
        setTotalPages(0);
        setTotalElements(0);
        console.log('📋 Kart bulunamadı');
      }
      
    } catch (err) {
      console.error('Kartlar yüklenirken hata:', err);
      setError('Kartlar yüklenirken hata oluştu');
      setCards([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const filterCards = () => {
    if (!searchQuery.trim()) {
      setFilteredCards(cards);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = cards.filter(card => {
      const uid = (card.uid || card.cardNumber || '').toLowerCase();
      const fullName = (card.fullName || '').toLowerCase();
      const cardType = (card.cardType || card.type || '').toLowerCase();
      return uid.includes(query) || fullName.includes(query) || cardType.includes(query);
    });
    setFilteredCards(filtered);
  };

  const handleBlockCard = async (card) => {
    try {
      setActionLoading(true);
      setError('');
      
      const cardUid = card.uid || card.cardNumber;
      console.log('🔒 Kart bloklama işlemi başlatılıyor:', { 
        uid: cardUid, 
        reason: blockReason 
      });
      
      const response = await busCardApi.blockCard(cardUid);
      
      console.log('🔒 Backend response:', response);
      
      // Backend'den gelen response'u kontrol et
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        console.log('✅ Backend bloklama başarılı');
        
        // Local state'i güncelle
        const cardUid = card.uid || card.cardNumber;
        setCards(prevCards => 
          prevCards.map(c => {
            const cUid = c.uid || c.cardNumber;
            return cUid === cardUid 
              ? { ...c, status: 'BLOCKED', active: false }
              : c;
          })
        );
        
        setSuccess(`${card.fullName} adlı kullanıcının kartı başarıyla bloklandı`);
      } else {
        console.warn('⚠️ Backend bloklama başarısız:', response);
        setError('Kart bloklanırken backend hatası oluştu');
        return;
      }
      
      setShowBlockModal(false);
      setBlockReason('');
    } catch (err) {
      console.error('❌ Kart bloklama hatası:', err);
      setError('Kart bloklanırken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockCard = async (card) => {
    try {
      setActionLoading(true);
      setError('');
      
      const cardUid = card.uid || card.cardNumber;
      await busCardApi.unblockCard(cardUid);
      
      // Local state'i güncelle
      setCards(prevCards => 
        prevCards.map(c => {
          const cUid = c.uid || c.cardNumber;
          return cUid === cardUid 
            ? { ...c, status: 'ACTIVE', active: true }
            : c;
        })
      );
      
      setSuccess(`${card.fullName} adlı kullanıcının kartı başarıyla aktif edildi`);
      setShowUnblockModal(false);
    } catch (err) {
      console.error('Kart aktif etme hatası:', err);
      setError('Kart aktif edilirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReadCard = async (card) => {
    try {
      setLoading(true);
      setError('');
      
      const cardUid = card.uid || card.cardNumber;
      console.log('🔍 Kart okuma işlemi başlatılıyor:', { uid: cardUid });
      
      const response = await busCardApi.readCard(cardUid);
      console.log('✅ Kart okuma başarılı:', response);
      
      setSelectedCard({ ...card, ...response });
      setShowCardDetails(true);
    } catch (err) {
      console.error('❌ Kart okuma hatası:', err);
      
      // Hata detaylarını göster
      let errorMessage = 'Kart okunurken hata oluştu';
      
      if (err.response?.status === 401) {
        errorMessage = 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Geçersiz kart bilgisi veya authentication hatası.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#10b981';
      case 'BLOCKED':
        return '#ef4444';
      case 'INACTIVE':
        return '#6b7280';
      case 'EXPIRED':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Aktif';
      case 'BLOCKED':
        return 'Bloklu';
      case 'INACTIVE':
        return 'Pasif';
      case 'EXPIRED':
        return 'Süresi Dolmuş';
      default:
        return 'Bilinmiyor';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleDeleteCard = async (card) => {
    try {
      setActionLoading(true);
      setError('');
      
      const cardUid = card.uid || card.cardNumber;
      await busCardApi.deleteCard(cardUid);
      
      setSuccess(`${card.fullName} adlı kullanıcının kartı başarıyla silindi`);
      loadCards(); // Listeyi yenile
    } catch (err) {
      console.error('Kart silme hatası:', err);
      setError('Kart silinirken hata oluştu');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPage(0); // Sayfa boyutu değiştiğinde ilk sayfaya dön
  };

  return (
    <div className="buscard-management-container">
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
            <h1>Kart Yönetimi</h1>
            <p>Kartları blokla, aktif et ve detaylarını görüntüle</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-button"
            onClick={loadCards}
            disabled={loading}
            title="Yenile"
          >
            <RefreshCw className={loading ? 'spinning' : ''} size={20} />
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
            placeholder="UID, isim veya kart tipi ile ara..."
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
          <button className="export-button">
            <Download size={20} />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="cards-table-container">
        <div className="table-header">
          <h3>Kart Listesi ({totalElements} toplam, {filteredCards.length} gösteriliyor)</h3>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/buscard-register')}
            title="Yeni Kart Ekle"
          >
            <Plus size={16} />
            Yeni Kart Ekle
          </button>
        </div>
        
        {loading ? (
          <div className="loading-container">
            <RefreshCw className="spinning" size={32} />
            <p>Kartlar yükleniyor...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="empty-state">
            <CreditCard size={48} />
            <h3>Kart bulunamadı</h3>
            <p>Arama kriterlerinize uygun kart bulunmuyor</p>
          </div>
        ) : (
          <div className="cards-table">
            <div className="table-header-row">
              <div className="col-uid">UID</div>
              <div className="col-name">Ad Soyad</div>
              <div className="col-type">Kart Tipi</div>
              <div className="col-status">Durum</div>
              <div className="col-balance">Bakiye</div>
              <div className="col-actions">İşlemler</div>
            </div>
            
            {filteredCards.map((card) => (
              <div key={card.id} className="table-row">
                <div className="col-uid">
                  <code>{card.uid || card.cardNumber || '-'}</code>
                </div>
                <div className="col-name">
                  <div className="name-cell">
                    <span className="name">{card.fullName || '-'}</span>
                    <span className="date">Kayıt: {formatDate(card.issueDate)}</span>
                  </div>
                </div>
                <div className="col-type">
                  <span className="card-type-badge">{card.cardType || card.type || '-'}</span>
                </div>
                <div className="col-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(card.status) }}
                  >
                    {getStatusText(card.status)}
                  </span>
                </div>
                <div className="col-balance">
                  <span className="balance-amount">{formatCurrency(card.balance)}</span>
                </div>
                <div className="col-actions">
                  <div className="action-buttons">
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleReadCard(card)}
                      title="Kart Detayları"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      className="action-btn edit-btn"
                      onClick={() => navigate(`/buscard-edit/${card.uid || card.cardNumber}`)}
                      title="Kartı Düzenle"
                    >
                      <Edit size={16} />
                    </button>
                    
                    {card.status === 'ACTIVE' ? (
                      <button
                        className="action-btn block-btn"
                        onClick={() => {
                          setSelectedCard(card);
                          setShowBlockModal(true);
                        }}
                        title="Kartı Blokla"
                      >
                        <ShieldOff size={16} />
                      </button>
                    ) : (
                      <button
                        className="action-btn unblock-btn"
                        onClick={() => {
                          setSelectedCard(card);
                          setShowUnblockModal(true);
                        }}
                        title="Kartı Aktif Et"
                      >
                        <Shield size={16} />
                      </button>
                    )}
                    
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        if (window.confirm(`${card.fullName} adlı kullanıcının kartını silmek istediğinize emin misiniz?`)) {
                          handleDeleteCard(card);
                        }
                      }}
                      title="Kartı Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span>
                Sayfa {page + 1} / {totalPages} (Toplam {totalElements} kayıt)
              </span>
              <select 
                value={size} 
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="page-size-select"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(0)}
                disabled={page === 0}
              >
                İlk
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
                Önceki
              </button>
              <span className="page-numbers">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (page < 3) {
                    pageNum = i;
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Sonraki
                <ChevronRight size={16} />
              </button>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                Son
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card Details Modal */}
      {showCardDetails && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Kart Detayları</h3>
              <button 
                className="close-button"
                onClick={() => setShowCardDetails(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="card-details-grid">
                <div className="detail-item">
                  <label>UID</label>
                  <span className="detail-value">{selectedCard.uid || selectedCard.cardNumber || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Ad Soyad</label>
                  <span className="detail-value">{selectedCard.fullName || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Kart Tipi</label>
                  <span className="detail-value">{selectedCard.cardType || selectedCard.type || '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Durum</label>
                  <span 
                    className="detail-value status"
                    style={{ color: getStatusColor(selectedCard.status) }}
                  >
                    {getStatusText(selectedCard.status)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Bakiye</label>
                  <span className="detail-value balance">{formatCurrency(selectedCard.balance)}</span>
                </div>
                <div className="detail-item">
                  <label>Kayıt Tarihi</label>
                  <span className="detail-value">{formatDate(selectedCard.issueDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Son Kullanma</label>
                  <span className="detail-value">{formatDate(selectedCard.expiryDate)}</span>
                </div>
                <div className="detail-item">
                  <label>Son İşlem Tutarı</label>
                  <span className="detail-value">{formatCurrency(selectedCard.lastTransactionAmount)}</span>
                </div>
                <div className="detail-item">
                  <label>Son İşlem Tarihi</label>
                  <span className="detail-value">{formatDate(selectedCard.lastTransactionDate)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCardDetails(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Card Modal */}
      {showBlockModal && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Kartı Blokla</h3>
              <button 
                className="close-button"
                onClick={() => setShowBlockModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <AlertTriangle size={24} />
                <p>
                  <strong>{selectedCard.fullName}</strong> adlı kullanıcının kartını bloklamak üzeresiniz.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="blockReason">Bloklama Sebebi</label>
                <textarea
                  id="blockReason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Bloklama sebebini giriniz..."
                  rows={3}
                  className="form-textarea"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowBlockModal(false)}
                disabled={actionLoading}
              >
                İptal
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleBlockCard(selectedCard)}
                disabled={actionLoading || !blockReason.trim()}
              >
                {actionLoading ? 'Bloklanıyor...' : 'Kartı Blokla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock Card Modal */}
      {showUnblockModal && selectedCard && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Kartı Aktif Et</h3>
              <button 
                className="close-button"
                onClick={() => setShowUnblockModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="success-message">
                <CheckCircle size={24} />
                <p>
                  <strong>{selectedCard.fullName}</strong> adlı kullanıcının kartını aktif etmek üzeresiniz.
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowUnblockModal(false)}
                disabled={actionLoading}
              >
                İptal
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleUnblockCard(selectedCard)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Aktif Ediliyor...' : 'Kartı Aktif Et'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusCardManagement;
