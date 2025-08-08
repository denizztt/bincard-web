import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { GOOGLE_MAPS_CONFIG, DEFAULT_MAP_OPTIONS, createMarkerIcon, MARKER_COLORS } from '../config/googleMaps';

// Google Maps component wrapper
const MapComponent = ({ 
  stations = [], 
  buses = [], 
  routes = [],
  onStationClick = () => {},
  onBusClick = () => {},
  center = DEFAULT_MAP_OPTIONS.center,
  zoom = DEFAULT_MAP_OPTIONS.zoom,
  height = '500px'
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        ...DEFAULT_MAP_OPTIONS,
        center,
        zoom
      });
      setMap(googleMap);
    }
  }, [mapRef, map, center, zoom]);

  // Add station markers
  useEffect(() => {
    if (!map || !stations.length) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    
    const newMarkers = stations.map(station => {
      const marker = new window.google.maps.Marker({
        position: { lat: station.latitude, lng: station.longitude },
        map: map,
        title: station.name,
        icon: createMarkerIcon(MARKER_COLORS.STATION),
        animation: window.google.maps.Animation.DROP
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${station.name}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
              ${station.address || 'Adres bilgisi yok'}
            </p>
            <div style="margin-top: 8px;">
              <small style="color: #999;">
                Lat: ${station.latitude.toFixed(6)}, 
                Lng: ${station.longitude.toFixed(6)}
              </small>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onStationClick(station);
      });

      return marker;
    });

    setMarkers(newMarkers);
  }, [map, stations, onStationClick]);

  // Add bus markers
  useEffect(() => {
    if (!map || !buses.length) return;

    buses.forEach(bus => {
      if (bus.currentLatitude && bus.currentLongitude) {
        const busMarker = new window.google.maps.Marker({
          position: { lat: bus.currentLatitude, lng: bus.currentLongitude },
          map: map,
          title: `Otobüs ${bus.numberPlate}`,
          icon: createMarkerIcon(
            bus.isActive ? MARKER_COLORS.BUS_ACTIVE : MARKER_COLORS.BUS_INACTIVE,
            'arrow'
          )
        });

        const busInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #333;">🚌 ${bus.numberPlate}</h3>
              <p style="margin: 4px 0; color: #666;">
                <strong>Durum:</strong> ${bus.isActive ? 'Aktif' : 'Pasif'}
              </p>
              <p style="margin: 4px 0; color: #666;">
                <strong>Şoför:</strong> ${bus.driverName || 'Atanmamış'}
              </p>
              <p style="margin: 4px 0; color: #666;">
                <strong>Rota:</strong> ${bus.assignedRouteName || 'Atanmamış'}
              </p>
              <p style="margin: 4px 0; color: #666;">
                <strong>Doluluk:</strong> ${bus.currentPassengerCount || 0}/${bus.capacity || 0}
              </p>
            </div>
          `
        });

        busMarker.addListener('click', () => {
          busInfoWindow.open(map, busMarker);
          onBusClick(bus);
        });
      }
    });
  }, [map, buses, onBusClick]);

  return <div ref={mapRef} style={{ height, width: '100%' }} />;
};

// Loading component
const MapLoadingComponent = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>Harita Yükleniyor...</h3>
    <p style={{ margin: 0, color: '#666' }}>Google Maps başlatılıyor</p>
  </div>
);

// Error component
const MapErrorComponent = ({ error }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '500px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
    <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Harita Yüklenemedi</h3>
    <p style={{ margin: '0 0 16px 0', color: '#991b1b', textAlign: 'center' }}>
      {error === Status.FAILURE ? 'Google Maps API yüklenemedi' : 
       error === Status.LOADING ? 'Yükleniyor...' : 
       'Bilinmeyen hata oluştu'}
    </p>
    <p style={{ margin: 0, color: '#7f1d1d', fontSize: '14px', textAlign: 'center' }}>
      Google Maps API anahtarınızı kontrol edin veya internet bağlantınızı kontrol edin.
    </p>
  </div>
);

// Status render
const renderMapStatus = (status) => {
  switch (status) {
    case Status.LOADING:
      return <MapLoadingComponent />;
    case Status.FAILURE:
      return <MapErrorComponent error={status} />;
    case Status.SUCCESS:
      return null; // Map will render
    default:
      return <MapLoadingComponent />;
  }
};

// Main Map Wrapper Component
const GoogleMapWrapper = (props) => {
  // API anahtarı kontrolü
  if (!GOOGLE_MAPS_CONFIG.apiKey || GOOGLE_MAPS_CONFIG.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: props.height || '500px',
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '24px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
        <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Google Maps API Anahtarı Gerekli</h3>
        <p style={{ margin: '0 0 16px 0', color: '#b45309', textAlign: 'center' }}>
          Google Maps özelliklerini kullanmak için API anahtarı gereklidir.
        </p>
        <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '4px', fontSize: '14px' }}>
          REACT_APP_GOOGLE_MAPS_API_KEY environment variable'ını ekleyin
        </div>
      </div>
    );
  }

  return (
    <Wrapper apiKey={GOOGLE_MAPS_CONFIG.apiKey} render={renderMapStatus} libraries={GOOGLE_MAPS_CONFIG.libraries}>
      <MapComponent {...props} />
    </Wrapper>
  );
};

export default GoogleMapWrapper;
