import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';

// Fix icon leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function ShippingAddressSelector({ orderId, onShipmentCreated }) {
  const [position, setPosition] = useState({ lat: 10.762622, lng: 106.660172 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shipmentInfo, setShipmentInfo] = useState(null);

  const createShipment = async () => {
    if (!position) {
      setError("Vui lòng chọn vị trí khách hàng trên bản đồ.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const customerLocation = {
        latitude: position.lat,
        longitude: position.lng
      };
        console.log(customerLocation);
        console.log(token);
        const orderId='661c00000000000000030001'
        console.log(orderId);
        
        
        
      const response = await axios.post(
        `http://localhost:5000/api/shipping/create/${orderId}`,
        { customerLocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
      
        if (onShipmentCreated) {
          onShipmentCreated(response.data.shipment);
        }

     
        setShipmentInfo(response.data.shipment);

      } else {
        setError(response.data.message || "Có lỗi xảy ra khi tạo vận đơn.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo vận đơn.");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shipping-address-selector">
      <h3>Chọn địa chỉ giao hàng</h3>

      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      <div className="mt-3">
        <button
          className="btn btn-success"
          onClick={createShipment}
          disabled={loading}
        >
          {loading ? 'Đang tạo vận đơn...' : 'Tạo vận đơn'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3">
          {error}
        </div>
      )}

      {shipmentInfo && (
        <div className="alert alert-success mt-3">
          <h5>Thông tin vận đơn:</h5>
          <p><strong>Mã vận đơn:</strong> {shipmentInfo.trackingNumber}</p>
          <p><strong>Trạng thái:</strong> {shipmentInfo.status}</p>
          <p><strong>Dự kiến giao:</strong> {new Date(shipmentInfo.estimatedDelivery).toLocaleString()}</p>
          <p><strong>Khoảng cách:</strong> {shipmentInfo.distance} km</p>
        </div>
      )}
    </div>
  );
}

export default ShippingAddressSelector;
