import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  Phone,
  User,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { superAdminApi } from '../services/apiService';
import { AdminRequestStatus, getAdminRequestStatusDisplayName } from '../types';
import '../styles/AdminApprovals.css';

const AdminApprovals = () => {
  const navigate = useNavigate();
  
  // State management - AdminApprovalsPage.java'ya benzer
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminRequests, setAdminRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Admin onay istekleri yükleniyor...');
  
  // Filtreleme state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // AdminApprovalsPage.loadAdminRequests'e benzer
  useEffect(() => {
    loadAdminRequests();
  }, []);

  // Arama ve filtreleme
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, adminRequests]);

  const loadAdminRequests = async () => {
    try {
      setLoading(true);
      setError('');
      setStatusMessage('Admin onay istekleri yükleniyor...');

      // API çağrısı - AdminApprovalsPage'deki parseAdminRequestsResponse mantığına benzer
      const response = await superAdminApi.getPendingAdminRequests(0, 50);
      
      // Debug: Response'u kontrol et
      console.log('Admin onay istekleri response:', response);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        const requests = parseAdminRequestsFromResponse(response);
        console.log('Parse edilen istekler:', requests);
        setAdminRequests(requests);
        
        if (requests.length === 0) {
          setStatusMessage('Bekleyen admin onay isteği bulunmamaktadır.');
        } else {
          setStatusMessage(`${requests.length} adet bekleyen admin onay isteği bulundu.`);
        }
      } else {
        throw new Error(response?.message || 'API yanıtı başarısız');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Admin istekleri yüklenirken hata:', err);
      setError('Admin onay istekleri yüklenemedi');
      setAdminRequests([]);
      setStatusMessage('Admin onay istekleri yüklenemedi');
      setLoading(false);
    }
  };

  // AdminApprovalsPage.parseAdminRequestsResponse'a benzer
  const parseAdminRequestsFromResponse = (response) => {
    const requests = [];
    
    try {
      // Response.data kontrolü - backend'den gelen data field'ı
      const data = response.data;
      console.log('Response data:', data);
      
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          console.log('Parsing item:', item);
          const request = parseAdminRequestObject(item);
          if (request) {
            requests.push(request);
          }
        });
      } else {
        console.warn('Response.data is not an array or is null:', data);
      }
    } catch (error) {
      console.error('Admin requests parse hatası:', error);
    }
    
    return requests;
  };

  // AdminApprovalsPage.parseAdminRequestObject'e benzer
  const parseAdminRequestObject = (requestData) => {
    try {
      const admin = requestData.admin || {};
      const profileInfo = admin.profileInfo || {};
      
      const fullName = `${profileInfo.name || ''} ${profileInfo.surname || ''}`.trim() || 
                      `İsimsiz Admin #${requestData.id}`;
      
      const status = requestData.status === 'APPROVED' ? AdminRequestStatus.APPROVED :
                    requestData.status === 'REJECTED' ? AdminRequestStatus.REJECTED :
                    AdminRequestStatus.PENDING;
      
      const formattedDate = formatDate(requestData.requestedAt || requestData.createdAt);
      
      return {
        id: requestData.id?.toString() || '0',
        adminId: admin.id?.toString() || '0',
        name: fullName,
        email: profileInfo.email || '',
        phone: admin.userNumber || '',
        requestDate: formattedDate,
        status: status
      };
    } catch (error) {
      console.error('Admin request object parse hatası:', error);
      return null;
    }
  };

  // JavaFX'teki formatDate metoduna benzer
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

  const applyFilters = () => {
    let filtered = [...adminRequests];
    
    // Arama filtresi
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.name.toLowerCase().includes(search) ||
        request.email.toLowerCase().includes(search) ||
        request.phone.includes(search)
      );
    }
    
    // Durum filtresi
    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  };

  // AdminApprovalsPage.approveAdminRequest'e benzer
  const handleApprove = async (request) => {
    if (!window.confirm(`"${request.name}" isimli kullanıcının admin hesabını onaylamak istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setStatusMessage('Admin onaylanıyor...');
      
      // Backend implementasyonu adminId'ye göre arama yaptığı için adminId gönderiyoruz
      const response = await superAdminApi.approveAdminRequest(parseInt(request.adminId));
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        // İsteği güncelle
        setAdminRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === request.id 
              ? { ...req, status: AdminRequestStatus.APPROVED }
              : req
          )
        );
        
        setStatusMessage(`Admin onaylandı: ${request.name} - ${new Date().toLocaleString('tr-TR')}`);
        showSuccessAlert('İşlem Başarılı', 'Admin hesabı başarıyla onaylandı.');
        
        // Listeyi yenile
        setTimeout(() => loadAdminRequests(), 1000);
      } else {
        throw new Error(response?.message || 'Onay işlemi başarısız');
      }
    } catch (error) {
      console.error('Admin onay hatası:', error);
      setStatusMessage(`Onay işlemi başarısız: ${error.message}`);
      showErrorAlert('Onay İşlemi Başarısız', `Admin onaylanırken bir hata oluştu: ${error.message}`);
    }
  };

  // AdminApprovalsPage.rejectAdminRequest'e benzer
  const handleReject = async (request) => {
    if (!window.confirm(`"${request.name}" isimli kullanıcının admin hesabını reddetmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      setStatusMessage('Admin reddediliyor...');
      
      const adminId = parseInt(request.adminId);
      const response = await superAdminApi.rejectAdminRequest(adminId);
      
      // Backend'de isSuccess field'ı var, Jackson bunu success veya isSuccess olarak serialize edebilir
      const isSuccess = response?.success !== undefined ? response.success : (response?.isSuccess !== undefined ? response.isSuccess : false);
      if (response && isSuccess) {
        // İsteği güncelle
        setAdminRequests(prevRequests => 
          prevRequests.map(req => 
            req.id === request.id 
              ? { ...req, status: AdminRequestStatus.REJECTED }
              : req
          )
        );
        
        setStatusMessage(`Admin reddedildi: ${request.name} - ${new Date().toLocaleString('tr-TR')}`);
        showSuccessAlert('İşlem Başarılı', 'Admin hesabı başarıyla reddedildi.');
        
        // Listeyi yenile
        setTimeout(() => loadAdminRequests(), 1000);
      } else {
        throw new Error(response?.message || 'Red işlemi başarısız');
      }
    } catch (error) {
      console.error('Admin red hatası:', error);
      setStatusMessage(`Red işlemi başarısız: ${error.message}`);
      showErrorAlert('Red İşlemi Başarısız', `Admin reddedilirken bir hata oluştu: ${error.message}`);
    }
  };

  const showSuccessAlert = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const showErrorAlert = (title, message) => {
    alert(`${title}: ${message}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case AdminRequestStatus.PENDING:
        return <span className="status-badge pending"><Clock size={16} /> Beklemede</span>;
      case AdminRequestStatus.APPROVED:
        return <span className="status-badge approved"><CheckCircle size={16} /> Onaylandı</span>;
      case AdminRequestStatus.REJECTED:
        return <span className="status-badge rejected"><XCircle size={16} /> Reddedildi</span>;
      default:
        return <span className="status-badge">{getAdminRequestStatusDisplayName(status)}</span>;
    }
  };

  const renderActionButtons = (request) => {
    if (request.status === AdminRequestStatus.PENDING) {
      return (
        <div className="action-buttons">
          <button 
            className="btn-approve"
            onClick={() => handleApprove(request)}
            disabled={loading}
          >
            <CheckCircle size={16} />
            Onayla
          </button>
          <button 
            className="btn-reject"
            onClick={() => handleReject(request)}
            disabled={loading}
          >
            <XCircle size={16} />
            Reddet
          </button>
        </div>
      );
    } else {
      return (
        <div className="status-info">
          {getStatusBadge(request.status)}
        </div>
      );
    }
  };

  if (loading && adminRequests.length === 0) {
    return (
      <div className="admin-approvals-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Admin onay istekleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-approvals-container">
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
            <h1 className="page-title">👥 Admin Onay İstekleri</h1>
          </div>
          <div className="header-right">
            <button 
              onClick={loadAdminRequests}
              className="btn btn-primary"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Yenile
            </button>
          </div>
        </div>
        
        <p className="page-description">
          Admin uygulamasından gelen kayıt isteklerini buradan onaylayabilir veya reddedebilirsiniz.
        </p>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={loadAdminRequests} className="retry-btn">
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="İsim, email veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="">Tüm Durumlar</option>
              <option value={AdminRequestStatus.PENDING}>Beklemede</option>
              <option value={AdminRequestStatus.APPROVED}>Onaylandı</option>
              <option value={AdminRequestStatus.REJECTED}>Reddedildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="status-message">
        <p>{statusMessage}</p>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>İsim</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Talep Tarihi</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id} className={`row-status-${request.status.toLowerCase()}`}>
                    <td>{request.id}</td>
                    <td>
                      <div className="user-info">
                        <User size={16} className="user-icon" />
                        {request.name}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <Mail size={16} className="contact-icon" />
                        {request.email}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <Phone size={16} className="contact-icon" />
                        {request.phone}
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={16} className="date-icon" />
                        {request.requestDate}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(request.status)}
                    </td>
                    <td>
                      {renderActionButtons(request)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="no-data-message">
                      <User size={48} className="no-data-icon" />
                      <p>Gösterilecek admin onay isteği bulunmuyor</p>
                      {searchTerm || statusFilter ? (
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('');
                          }}
                          className="btn btn-outline"
                        >
                          Filtreleri Temizle
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredRequests.length > 0 && (
        <div className="summary-section">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Toplam:</span>
              <span className="summary-value">{filteredRequests.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Beklemede:</span>
              <span className="summary-value pending">
                {filteredRequests.filter(r => r.status === AdminRequestStatus.PENDING).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Onaylandı:</span>
              <span className="summary-value approved">
                {filteredRequests.filter(r => r.status === AdminRequestStatus.APPROVED).length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Reddedildi:</span>
              <span className="summary-value rejected">
                {filteredRequests.filter(r => r.status === AdminRequestStatus.REJECTED).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals; 
