import axios from 'axios';

// Cấu hình URL cơ sở của backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * Lấy tất cả các node từ backend
 * @returns {Promise<Array<Object>>} Mảng các node { id, lat, lon, name }
 */
export const getAllNodes = async () => {
  try {
    const response = await apiClient.get('/nodes');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy nodes:', error);
    throw error;
  }
};

/**
 * Tìm đường đi
 * @param {string} startId ID node bắt đầu
 * @param {string} goalId ID node kết thúc
 * @param {string} algorithm Tên thuật toán (vd: 'astar')
 * @returns {Promise<Object>} Kết quả { path, steps }
 */
export const findPath = async (startId, goalId, algorithm = 'astar') => {
  try {
    const response = await apiClient.post('/route', {
      startId,
      goalId,
      algorithm,
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tìm đường:', error);
    throw error;
  }
};
// Dán đoạn code này vào cuối file src/api/apiService.js

/**
 * Lấy danh sách các thuật toán có sẵn từ backend
 * @returns {Promise<Object>}
 */
export const getAlgorithms = async () => {
  try {
    const response = await apiClient.get('/algorithms');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thuật toán:', error);
    throw error;
  }
};