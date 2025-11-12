// src/services/routeService.js

// 1. THAY ĐỔI: Sử dụng đường dẫn tương đối (relative path)
// Điều này hoạt động vì chúng ta đã thêm "proxy" vào package.json
const BACKEND_API_URL = '/api/route';
const ALGORITHMS_API_URL = '/api/algorithms';

/**
 * Tìm đường đi giữa 2 điểm sử dụng thuật toán được chọn
 * @param {Array} startPoint - [lat, lng]
 * @param {Array} endPoint - [lat, lng]
 * @param {string} algorithm - 'astar' hoặc 'dijkstra'
 * @returns {Promise<Object>} - Route data
 */
export const findRoute = async (startPoint, endPoint, algorithm = 'astar') => {
  if (!startPoint || !endPoint) {
    throw new Error('Vui lòng chọn cả điểm bắt đầu và điểm kết thúc');
  }

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 2. SỬA LỖI QUAN TRỌNG: Gửi đúng cấu trúc mà backend mong đợi
      body: JSON.stringify({
        startPoint: startPoint, // Gửi mảng [lat, lng]
        endPoint: endPoint,     // Gửi mảng [lat, lng]
        algorithm: algorithm
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Ném lỗi chính xác mà backend trả về
      throw new Error(errorData.error || 'Không thể kết nối đến dịch vụ tìm đường');
    }

    const data = await response.json();

    if (!data.path || data.path.length === 0) {
      throw new Error('Không tìm thấy đường đi. Vui lòng thử lại với các điểm khác.');
    }

    // 3. SỬA LỖI: Xử lý response khớp với backend
    return {
      coordinates: data.path, // [[lat, lng], [lat, lng], ...]
      distance: data.distance,  // Backend đã trả về (km), không cần xử lý
      // duration: ... // Backend hiện chưa trả về duration
      algorithm: data.algorithm,
      steps: data.steps,
      startPoint: data.startPoint, // Tọa độ node gốc
      goalPoint: data.goalPoint,   // Tọa độ node đích
      raw: data
    };
  } catch (error) {
    console.error('Route finding error:', error);
    // Ném lỗi lên để component App.js có thể bắt
    throw error;
  }
};

/**
 * Lấy danh sách thuật toán có sẵn từ backend
 */
export const getAvailableAlgorithms = async () => {
  try {
    const response = await fetch(ALGORITHMS_API_URL);
    if (!response.ok) {
      throw new Error('Không thể tải danh sách thuật toán');
    }
    const data = await response.json();
    return data.availableAlgorithms || [];
  } catch (error) {
    console.error('Error fetching algorithms:', error);
    return ['astar', 'dijkstra']; // fallback
  }
};

// Hàm này không cần thiết nếu App.js đã xử lý
/*
export const validatePoints = (startPoint, endPoint) => {
  if (!startPoint || !Array.isArray(startPoint) || startPoint.length !== 2) {
    return { valid: false, message: 'Điểm bắt đầu không hợp lệ' };
  }
  
  if (!endPoint || !Array.isArray(endPoint) || endPoint.length !== 2) {
    return { valid: false, message: 'Điểm kết thúc không hợp lệ' };
  }

  return { valid: true };
};
*/