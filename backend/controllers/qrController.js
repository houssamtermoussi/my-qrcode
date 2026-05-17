const QRCodeModel = require('../models/qrModel');
const QRCodeLib = require('qrcode');

/**
 * Controller to handle all operations related to QR Codes.
 * Inspired by Laravel controllers, keeping logic clean and organized.
 */
class QRController {
  
  /**
   * Display a listing of all QR codes.
   * Route: GET /api/qr
   */
  static async getQRCodes(req, res) {
    try {
      const qrcodes = await QRCodeModel.getAllQRCodes();
      return res.status(200).json({
        success: true,
        message: 'QR Codes retrieved successfully',
        data: qrcodes
      });
    } catch (error) {
      console.error('Error in getQRCodes controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve QR codes',
        error: error.message
      });
    }
  }

  /**
   * Store a newly created QR code in database.
   * Route: POST /api/qr
   */
  static async addQRCode(req, res) {
    try {
      const { title, type, content } = req.body;

      // Basic validation
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }
      if (!type || !type.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Type is required (e.g., url, text, email, wifi)'
        });
      }
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }

      // Generate the QR code image as a base64 Data URL (e.g. data:image/png;base64,...)
      // We customize it slightly with standard formatting options for a premium, clean output
      const qrImageOptions = {
        errorCorrectionLevel: 'H', // High error correction
        type: 'image/png',
        margin: 2,
        width: 400,
        color: {
          dark: '#1e293b',  // Sleek Slate 800 dark color for QR code
          light: '#ffffff'  // Clean white background
        }
      };

      const qr_image = await QRCodeLib.toDataURL(content, qrImageOptions);

      // Save to database
      const newQRCode = await QRCodeModel.createQRCode({
        title: title.trim(),
        type: type.trim().toLowerCase(),
        content: content.trim(),
        qr_image
      });

      return res.status(201).json({
        success: true,
        message: 'QR Code created successfully',
        data: newQRCode
      });
    } catch (error) {
      console.error('Error in addQRCode controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create QR code',
        error: error.message
      });
    }
  }

  /**
   * Remove the specified QR code from database.
   * Route: DELETE /api/qr/:id
   */
  static async removeQRCode(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'QR Code ID is required'
        });
      }

      const isDeleted = await QRCodeModel.deleteQRCode(id);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: `QR Code with ID ${id} not found`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'QR Code deleted successfully',
        data: { id: Number(id) }
      });
    } catch (error) {
      console.error('Error in removeQRCode controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete QR code',
        error: error.message
      });
    }
  }
}

module.exports = QRController;
