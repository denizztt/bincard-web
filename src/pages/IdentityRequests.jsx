import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { identityRequestsApi } from '../services/apiService';
import { 
  RequestStatus, 
  getRequestStatusDisplayName
} from '../types';
import '../styles/IdentityRequests.css';

const IdentityRequests = () => {
  const navigate = useNavigate();
  
  // State management - IdentityRequestsPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Filtreleme state
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedImage, setSelectedImage] = useState({ url: '', title: '' });
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processType, setProcessType] = useState('approve'); // 'approve' or 'reject'
  const [adminNote, setAdminNote] = useState('');

  // IdentityRequestsPage.loadIdentityRequests'e benzer
  useEffect(() => {
    loadIdentityRequests();
  }, [statusFilter, startDate, endDate]);

  // Arama filtresi
  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, allRequests]);

  const loadIdentityRequests = async () => {
    try {
      setLoading(true);
      setError('');

      // API çağrısı - IdentityRequestsPage'deki parseIdentityRequestsFromJson mantığına benzer
      const response = await identityRequestsApi.getIdentityRequests(
        statusFilter, startDate, endDate, 0, 100, 'requestedAt', 'desc'
      );
      
      if (response && response.success) {
        const requests = parseIdentityRequestsFromResponse(response);
        setAllRequests(requests);
        updateStatistics(requests);
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Kimlik istekleri yüklenirken hata:', err);
      setError('Kimlik istekleri yüklenemedi');
      setAllRequests([]);
      setLoading(false);
    }
  };

  // IdentityRequestsPage.parseIdentityRequestsFromJson'a benzer
  const parseIdentityRequestsFromResponse = (response) => {
    const requests = [];
    
    try {
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        response.data.content.forEach(item => {
          const request = parseIdentityRequestFromItem(item);
          if (request) {
            requests.push(request);
          }
        });
      }
    } catch (error) {
      console.error('Identity requests parse hatası:', error);
    }
    
    return requests;
  };

  // IdentityRequestsPage.parseIdentityRequestFromJsonItem'a benzer
  const parseIdentityRequestFromItem = (item) => {
    try {
      const identityInfo = item.identityInfo ? {
        id: item.identityInfo.id,
        frontCardPhoto: item.identityInfo.frontCardPhoto,
        backCardPhoto: item.identityInfo.backCardPhoto,
        nationalId: item.identityInfo.nationalId,
        serialNumber: item.identityInfo.serialNumber,
        birthDate: item.identityInfo.birthDate,
        gender: item.identityInfo.gender,
        motherName: item.identityInfo.motherName,
        fatherName: item.identityInfo.fatherName,
        approvedByPhone: item.identityInfo.approvedByPhone,
        approved: item.identityInfo.approved,
        approvedAt: item.identityInfo.approvedAt,
        userPhone: item.identityInfo.userPhone
      } : null;

      const status = item.status === 'APPROVED' ? RequestStatus.APPROVED :
                    item.status === 'REJECTED' ? RequestStatus.REJECTED :
                    RequestStatus.PENDING;

      return {
        id: item.id,
        identityInfo,
        requestedByPhone: item.requestedByPhone,
        requestedAt: item.requestedAt,
        status,
        adminNote: item.adminNote,
        reviewedByPhone: item.reviewedByPhone,
        reviewedAt: item.reviewedAt
      };
    } catch (error) {
      console.error('Identity request item parse hatası:', error);
      return null;
    }
  };

  const updateStatistics = (requests) => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === RequestStatus.PENDING).length;
    const approved = requests.filter(r => r.status === RequestStatus.APPROVED).length;
    const rejected = requests.filter(r => r.status === RequestStatus.REJECTED).length;

    setStats({ total, pending, approved, rejected });
  };

  const applySearchFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredRequests(allRequests);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = allRequests.filter(request => {
      const info = request.identityInfo;
      const searchableText = [
        info?.nationalId,
        info?.serialNumber,
        info?.userPhone,
        request.requestedByPhone
      ].filter(Boolean).join(' ').toLowerCase();

      return searchableText.includes(search);
    });

    setFilteredRequests(filtered);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return isoDate;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case RequestStatus.PENDING:
        return <span className="status-badge pending"><Clock size={16} /> Beklemede</span>;
      case RequestStatus.APPROVED:
        return <span className="status-badge approved"><CheckCircle size={16} /> Onaylandı</span>;
      case RequestStatus.REJECTED:
        return <span className="status-badge rejected"><XCircle size={16} /> Reddedildi</span>;
      default:
        return <span className="status-badge">{getRequestStatusDisplayName(status)}</span>;
    }
  };

  const handleShowDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleShowImage = (imageUrl, title) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const handleProcessRequest = (request, approve) => {
    setSelectedRequest(request);
    setProcessType(approve ? 'approve' : 'reject');
    setAdminNote('');
    setShowProcessModal(true);
  };

  const confirmProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      setLoading(true);
      
      const response = await identityRequestsApi.processIdentityRequest(
        selectedRequest.id,
        processType === 'approve',
        adminNote
      );

      if (response && response.success) {
        // İsteği güncelle
        setAllRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === selectedRequest.id 
              ? {
                  ...req,
                  status: processType === 'approve' ? RequestStatus.APPROVED : RequestStatus.REJECTED,
                  adminNote,
                  reviewedByPhone: '+90555999888', // Mevcut admin telefonu
                  reviewedAt: new Date().toISOString()
                }
              : req
          )
        );

        setShowProcessModal(false);
        alert(`İstek başarıyla ${processType === 'approve' ? 'onaylandı' : 'reddedildi'}.`);
        
        // İstatistikleri güncelle
        const updatedRequests = allRequests.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: processType === 'approve' ? RequestStatus.APPROVED : RequestStatus.REJECTED }
            : req
        );
        updateStatistics(updatedRequests);
      } else {
        throw new Error(response?.message || 'İşlem başarısız');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('İstek işleme hatası:', error);
      alert(`İşlem sırasında bir hata oluştu: ${error.message}`);
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const blob = await identityRequestsApi.exportIdentityRequests(
        statusFilter, startDate, endDate
      );
      
      // Dosyayı indir
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `kimlik_istekleri_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      setLoading(false);
    } catch (error) {
      console.error('Export hatası:', error);
      alert('Excel raporu indiriliyor... (Demo)');
      setLoading(false);
    }
  };

  const renderStatsCards = () => {
    const cards = [
      { title: 'Toplam İstekler', value: stats.total, color: '#6C757D', icon: FileText },
      { title: 'Bekleyen', value: stats.pending, color: '#868E96', icon: Clock },
      { title: 'Onaylanan', value: stats.approved, color: '#495057', icon: CheckCircle },
      { title: 'Reddedilen', value: stats.rejected, color: '#e74c3c', icon: XCircle }
    ];

    return (
      <div className="stats-grid">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="stats-card">
              <div className="stats-icon" style={{ color: card.color }}>
                <IconComponent size={32} />
              </div>
              <div className="stats-content">
                <div className="stats-value" style={{ color: card.color }}>
                  {card.value.toLocaleString()}
                </div>
                <div className="stats-title">{card.title}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && allRequests.length === 0) {
    return (
      <div className="identity-requests-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Kimlik doğrulama istekleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="identity-requests-container">
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
            <h1 className="page-title">🆔 Kimlik Doğrulama İstekleri</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={handleExport}
              className="btn btn-success"
              disabled={loading}
            >
              <Download size={16} />
              Excel'e Aktar
            </button>
            <button 
              onClick={loadIdentityRequests}
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
          <button onClick={loadIdentityRequests} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-section">
        {renderStatsCards()}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3>Filtreleme ve Arama</h3>
        </div>
        <div className="filters-content">
          <div className="filters-row-1">
            <div className="filter-group">
              <label>Durum:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">Tüm Durumlar</option>
                <option value={RequestStatus.PENDING}>Beklemede</option>
                <option value={RequestStatus.APPROVED}>Onaylandı</option>
                <option value={RequestStatus.REJECTED}>Reddedildi</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tarih Aralığı:</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                  placeholder="Başlangıç"
                />
                <span>-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                  placeholder="Bitiş"
                />
              </div>
            </div>
          </div>

          <div className="filters-row-2">
            <div className="search-group">
              <label>Arama:</label>
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="TC No, Seri No veya Telefon ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button 
                onClick={clearFilters}
                className="btn btn-outline"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="identity-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>TC No</th>
                <th>Seri No</th>
                <th>Doğum Tarihi</th>
                <th>Telefon</th>
                <th>Başvuru Tarihi</th>
                <th>Durum</th>
                <th>Değerlendiren</th>
                <th>Eylemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className={`row-status-${request.status.toLowerCase()}`}>
                    <td>{request.id}</td>
                    <td>{request.identityInfo?.nationalId || '-'}</td>
                    <td>{request.identityInfo?.serialNumber || '-'}</td>
                    <td>{request.identityInfo?.birthDate || '-'}</td>
                    <td>{request.requestedByPhone}</td>
                    <td>{formatDate(request.requestedAt)}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{request.reviewedByPhone || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-detail"
                          onClick={() => handleShowDetail(request)}
                          title="Detay Görüntüle"
                        >
                          <Eye size={16} />
                        </button>
                        {request.status === RequestStatus.PENDING && (
                          <>
                            <button 
                              className="btn-approve"
                              onClick={() => handleProcessRequest(request, true)}
                              disabled={loading}
                              title="Onayla"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleProcessRequest(request, false)}
                              disabled={loading}
                              title="Reddet"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="no-data-message">
                      <Users size={48} className="no-data-icon" />
                      <p>Gösterilecek kimlik doğrulama isteği bulunmuyor</p>
                      {(searchTerm || statusFilter || startDate || endDate) && (
                        <button 
                          onClick={clearFilters}
                          className="btn btn-outline"
                        >
                          Filtreleri Temizle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Kimlik Doğrulama İsteği Detayı</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {selectedRequest.identityInfo && (
                <div className="identity-info-section">
                  <h4>Kimlik Bilgileri</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>TC No:</label>
                      <span>{selectedRequest.identityInfo.nationalId}</span>
                    </div>
                    <div className="info-item">
                      <label>Seri No:</label>
                      <span>{selectedRequest.identityInfo.serialNumber}</span>
                    </div>
                    <div className="info-item">
                      <label>Doğum Tarihi:</label>
                      <span>{selectedRequest.identityInfo.birthDate}</span>
                    </div>
                    <div className="info-item">
                      <label>Cinsiyet:</label>
                      <span>{selectedRequest.identityInfo.gender}</span>
                    </div>
                    <div className="info-item">
                      <label>Anne Adı:</label>
                      <span>{selectedRequest.identityInfo.motherName}</span>
                    </div>
                    <div className="info-item">
                      <label>Baba Adı:</label>
                      <span>{selectedRequest.identityInfo.fatherName}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="request-info-section">
                <h4>Başvuru Bilgileri</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Telefon:</label>
                    <span>{selectedRequest.requestedByPhone}</span>
                  </div>
                  <div className="info-item">
                    <label>Başvuru Tarihi:</label>
                    <span>{formatDate(selectedRequest.requestedAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Durum:</label>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  {selectedRequest.reviewedByPhone && (
                    <>
                      <div className="info-item">
                        <label>Değerlendiren:</label>
                        <span>{selectedRequest.reviewedByPhone}</span>
                      </div>
                      <div className="info-item">
                        <label>Değerlendirme Tarihi:</label>
                        <span>{formatDate(selectedRequest.reviewedAt)}</span>
                      </div>
                    </>
                  )}
                  {selectedRequest.adminNote && (
                    <div className="info-item full-width">
                      <label>Admin Notu:</label>
                      <span>{selectedRequest.adminNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.identityInfo && (selectedRequest.identityInfo.frontCardPhoto || selectedRequest.identityInfo.backCardPhoto) && (
                <div className="documents-section">
                  <h4>Belge Fotoğrafları</h4>
                  <div className="image-buttons">
                    {selectedRequest.identityInfo.frontCardPhoto && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleShowImage(selectedRequest.identityInfo.frontCardPhoto, 'Kimlik Belgesi Ön Yüz')}
                      >
                        <ImageIcon size={16} />
                        Ön Yüz Fotoğrafı
                      </button>
                    )}
                    {selectedRequest.identityInfo.backCardPhoto && (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleShowImage(selectedRequest.identityInfo.backCardPhoto, 'Kimlik Belgesi Arka Yüz')}
                      >
                        <ImageIcon size={16} />
                        Arka Yüz Fotoğrafı
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage.url && (
        <div className="modal-overlay image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedImage.title}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowImageModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body image-modal-body">
              <div className="image-container">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title}
                  className="modal-image"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content process-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>İsteği {processType === 'approve' ? 'Onayla' : 'Reddet'}</h3>
              <button 
                className="modal-close"
                onClick={() => setShowProcessModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>{selectedRequest.identityInfo?.nationalId}</strong> TC numaralı kimlik doğrulama isteğini 
                <strong>{processType === 'approve' ? ' onaylamak' : ' reddetmek'}</strong> istediğinize emin misiniz?
              </p>
              
              <div className="note-section">
                <label htmlFor="adminNote">Admin Notu (opsiyonel):</label>
                <textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Değerlendirme notu..."
                  rows={4}
                  className="note-textarea"
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => setShowProcessModal(false)}
                  className="btn btn-secondary"
                >
                  İptal
                </button>
                <button 
                  onClick={confirmProcessRequest}
                  className={`btn ${processType === 'approve' ? 'btn-success' : 'btn-danger'}`}
                  disabled={loading}
                >
                  {processType === 'approve' ? 'Onayla' : 'Reddet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentityRequests; 