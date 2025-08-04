import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/EnhancedAuthContext';
import ThemeToggle from '../components/ThemeToggle';
import {
  FileText,
  Plus,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Eye,
  Filter,
  Search,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { contractApi } from '../services/apiService';
import '../styles/ContractManagement.css';

const ContractManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'create', 'edit'
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    version: '',
    type: 'KULLANIM_KOSULLARI',
    mandatory: false,
    active: true
  });

  // Contract types mapping
  const contractTypes = {
    KULLANIM_KOSULLARI: 'Kullanım Koşulları',
    GIZLILIK_POLITIKASI: 'Gizlilik Politikası',
    VERI_ISLEME_IZNI: 'Kişisel Verilerin İşlenmesine İlişkin Açık Rıza',
    PAZARLAMA_IZNI: 'Pazarlama Amaçlı Açık Rıza',
    CEREZ_POLITIKASI: 'Çerez Politikası',
    HIZMET_SOZLESMESI: 'Hizmet Sözleşmesi',
    LOYALTY_PROGRAMI_KOSULLARI: 'Sadakat Programı Katılım Koşulları',
    UYELIK_SOZLESMESI: 'Üyelik Sözleşmesi',
    KAMPANYA_KATILIM_KOSULLARI: 'Kampanya Katılım Koşulları',
    AYDINLATMA_METNI: 'KVKK Aydınlatma Metni',
    DIGER: 'Diğer'
  };

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchQuery, filterType, filterStatus]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await contractApi.getAllContracts();
      console.log('Contracts loaded:', response);
      
      if (Array.isArray(response)) {
        setContracts(response);
      } else {
        setContracts([]);
      }
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError('Sözleşmeler yüklenirken hata oluştu');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = [...contracts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contract.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contractTypes[contract.type].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(contract => contract.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'ACTIVE') {
        filtered = filtered.filter(contract => contract.active);
      } else if (filterStatus === 'INACTIVE') {
        filtered = filtered.filter(contract => !contract.active);
      } else if (filterStatus === 'MANDATORY') {
        filtered = filtered.filter(contract => contract.mandatory);
      }
    }

    setFilteredContracts(filtered);
  };

  const handleCreateContract = () => {
    setFormData({
      title: '',
      content: '',
      version: '',
      type: 'KULLANIM_KOSULLARI',
      mandatory: false,
      active: true
    });
    setModalType('create');
    setShowModal(true);
  };

  const handleEditContract = (contract) => {
    setFormData({
      title: contract.title,
      content: contract.content,
      version: contract.version,
      type: contract.type,
      mandatory: contract.mandatory,
      active: contract.active
    });
    setSelectedContract(contract);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewContract = (contract) => {
    setSelectedContract(contract);
    setModalType('view');
    setShowModal(true);
  };

  const handleSaveContract = async () => {
    try {
      setLoading(true);
      
      if (modalType === 'create') {
        await contractApi.createContract(formData);
      } else if (modalType === 'edit') {
        await contractApi.updateContract(selectedContract.id, formData);
      }
      
      setShowModal(false);
      loadContracts();
      
    } catch (err) {
      console.error('Error saving contract:', err);
      setError('Sözleşme kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (contract) => {
    try {
      if (contract.active) {
        await contractApi.deactivateContract(contract.id);
      } else {
        await contractApi.activateContract(contract.id);
      }
      loadContracts();
    } catch (err) {
      console.error('Error toggling contract status:', err);
      setError('Sözleşme durumu değiştirilirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="contract-management">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft size={24} />
          </button>
          <h1>
            <FileText size={28} />
            Sözleşme Yönetimi
          </h1>
        </div>
        
        <div className="header-right">
          <ThemeToggle />
          <button 
            className="refresh-button"
            onClick={loadContracts}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="controls-left">
          <button 
            className="create-button"
            onClick={handleCreateContract}
          >
            <Plus size={20} />
            Yeni Sözleşme Ekle
          </button>
        </div>

        <div className="controls-right">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Sözleşme ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tüm Tipler</option>
            {Object.entries(contractTypes).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Pasif</option>
            <option value="MANDATORY">Zorunlu</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Content */}
      <div className="content">
        {loading ? (
          <div className="loading">
            <RefreshCw size={32} className="spinning" />
            <p>Sözleşmeler yükleniyor...</p>
          </div>
        ) : (
          <div className="contracts-table">
            <table>
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Tip</th>
                  <th>Versiyon</th>
                  <th>Durum</th>
                  <th>Zorunlu</th>
                  <th>Oluşturulma</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredContracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>
                      <div className="contract-title">
                        <FileText size={16} />
                        {contract.title}
                      </div>
                    </td>
                    <td>
                      <span className="contract-type">
                        {contractTypes[contract.type]}
                      </span>
                    </td>
                    <td>
                      <span className="version-badge">
                        v{contract.version}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${contract.active ? 'active' : 'inactive'}`}>
                        {contract.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      {contract.mandatory ? (
                        <span className="mandatory-badge">
                          <AlertCircle size={14} />
                          Zorunlu
                        </span>
                      ) : (
                        <span className="optional-badge">İsteğe Bağlı</span>
                      )}
                    </td>
                    <td>{formatDate(contract.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewContract(contract)}
                          title="Görüntüle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => handleEditContract(contract)}
                          title="Düzenle"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className={`action-btn toggle ${contract.active ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(contract)}
                          title={contract.active ? 'Deaktive Et' : 'Aktive Et'}
                        >
                          {contract.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContracts.length === 0 && (
              <div className="no-data">
                <FileText size={48} />
                <p>Henüz sözleşme bulunmuyor</p>
                <button 
                  className="create-button"
                  onClick={handleCreateContract}
                >
                  <Plus size={20} />
                  İlk Sözleşmeyi Oluştur
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === 'create' && 'Yeni Sözleşme Oluştur'}
                {modalType === 'edit' && 'Sözleşme Güncelle'}
                {modalType === 'view' && 'Sözleşme Detayları'}
              </h3>
              <button 
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {modalType === 'view' ? (
                <div className="contract-details">
                  <div className="detail-group">
                    <label>Başlık:</label>
                    <p>{selectedContract?.title}</p>
                  </div>
                  <div className="detail-group">
                    <label>Tip:</label>
                    <p>{contractTypes[selectedContract?.type]}</p>
                  </div>
                  <div className="detail-group">
                    <label>Versiyon:</label>
                    <p>{selectedContract?.version}</p>
                  </div>
                  <div className="detail-group">
                    <label>İçerik:</label>
                    <div className="content-preview">
                      {selectedContract?.content}
                    </div>
                  </div>
                  <div className="detail-group">
                    <label>Durum:</label>
                    <span className={`status-badge ${selectedContract?.active ? 'active' : 'inactive'}`}>
                      {selectedContract?.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <div className="detail-group">
                    <label>Zorunlu:</label>
                    <p>{selectedContract?.mandatory ? 'Evet' : 'Hayır'}</p>
                  </div>
                  <div className="detail-group">
                    <label>Oluşturulma:</label>
                    <p>{formatDate(selectedContract?.createdAt)}</p>
                  </div>
                  <div className="detail-group">
                    <label>Oluşturan:</label>
                    <p>{selectedContract?.createdByUsername || 'Bilinmiyor'}</p>
                  </div>
                </div>
              ) : (
                <div className="contract-form">
                  <div className="form-group">
                    <label>Başlık *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Sözleşme başlığı"
                      maxLength={200}
                    />
                  </div>

                  <div className="form-group">
                    <label>Tip *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      {Object.entries(contractTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Versiyon *</label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                      placeholder="1.0.0"
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label>İçerik *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="Sözleşme içeriği..."
                      rows={10}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.mandatory}
                        onChange={(e) => setFormData({...formData, mandatory: e.target.checked})}
                      />
                      <span>Zorunlu sözleşme</span>
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      />
                      <span>Aktif durumda başlat</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {modalType !== 'view' && (
              <div className="modal-footer">
                <button 
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  İptal
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveContract}
                  disabled={!formData.title || !formData.content || !formData.version}
                >
                  <Save size={16} />
                  {modalType === 'create' ? 'Oluştur' : 'Güncelle'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;