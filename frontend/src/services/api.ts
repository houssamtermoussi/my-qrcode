import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/qr';

export interface QRCodeData {
  id: number;
  title: string;
  type: string;
  content: string;
  qr_image: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * QR Code API Client
 * Wraps endpoint communication cleanly for frontend components.
 */
export const qrApi = {
  /**
   * Fetch all QR codes from the backend history.
   */
  async getQRCodes(): Promise<QRCodeData[]> {
    try {
      const response = await axios.get<ApiResponse<QRCodeData[]>>(API_BASE_URL);
      return response.data.data;
    } catch (error) {
      console.error('API Error in getQRCodes:', error);
      throw error;
    }
  },

  /**
   * Request backend to generate and persist a new QR code.
   * @param title - Human-readable label for the QR code.
   * @param type - Type of payload ('url', 'text', 'email', 'wifi').
   * @param content - Actual text or URL payload.
   */
  async addQRCode(title: string, type: string, content: string): Promise<QRCodeData> {
    try {
      const response = await axios.post<ApiResponse<QRCodeData>>(API_BASE_URL, {
        title,
        type,
        content
      });
      return response.data.data;
    } catch (error) {
      console.error('API Error in addQRCode:', error);
      throw error;
    }
  },

  /**
   * Delete a QR code from the history.
   * @param id - The ID of the QR code record to delete.
   */
  async removeQRCode(id: number): Promise<number> {
    try {
      const response = await axios.delete<ApiResponse<{ id: number }>>(`${API_BASE_URL}/${id}`);
      return response.data.data.id;
    } catch (error) {
      console.error('API Error in removeQRCode:', error);
      throw error;
    }
  }
};
