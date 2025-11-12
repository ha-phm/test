import React from 'react';
import './RouteInfo.css';

const ALGORITHM_NAMES = {
  'astar': 'A* (A-Star)',
  'dijkstra': 'Dijkstra',
  'osrm-default': 'OSRM Default'
};

const RouteInfo = ({ route, error, selectingPoint }) => {
  if (error) {
    return (
      <div className="info-box error">
        <p>{error}</p>
      </div>
    );
  }

  if (selectingPoint) {
    return (
      <div className="info-box instruction">
        <p>
          👆 Click vào bản đồ để chọn {selectingPoint === 'start' ? 'điểm bắt đầu (A)' : 'điểm kết thúc (B)'}
        </p>
      </div>
    );
  }

  if (route) {
    return (
      <div className="info-box success">
        <h3>Thông tin lộ trình:</h3>
        <div className="route-details">
          <div className="detail-item">
            <span className="label">Thuật toán:</span>
            <span className="value algorithm">{ALGORITHM_NAMES[route.algorithm] || route.algorithm}</span>
          </div>
          <div className="detail-item">
            <span className="label">Khoảng cách:</span>
            <span className="value">{route.distance} km</span>
          </div>
          <div className="detail-item">
            <span className="label">Thời gian:</span>
            <span className="value">~{route.duration} phút</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RouteInfo;