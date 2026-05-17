const db = require('../config/db');

class QRCode {
  /**
   * Helper to ensure the qrcodes table exists in MySQL.
   * This provides a robust, self-healing setup.
   */
  static async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS qrcodes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        qr_image LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await db.query(sql);
    } catch (error) {
      // If db connection isn't established yet, it will fail gracefully and try next time.
      console.warn('Could not initialize table yet. Ensure MySQL database is created and running.');
    }
  }

  /**
   * Fetch all QR codes from the database.
   * @returns {Promise<Array>} List of QR code records.
   */
  static async getAllQRCodes() {
    await this.initTable();
    try {
      const [rows] = await db.query('SELECT * FROM qrcodes ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      console.error('Error in getAllQRCodes:', error.message);
      throw error;
    }
  }

  /**
   * Create a new QR code in the database.
   * @param {Object} data - { title, type, content, qr_image }
   * @returns {Promise<Object>} The created QR code record with its generated ID.
   */
  static async createQRCode(data) {
    await this.initTable();
    const { title, type, content, qr_image } = data;

    if (!title || !type || !content || !qr_image) {
      throw new Error('Missing required fields: title, type, content, qr_image');
    }

    try {
      const [result] = await db.query(
        'INSERT INTO qrcodes (title, type, content, qr_image) VALUES (?, ?, ?, ?)',
        [title, type, content, qr_image]
      );
      return {
        id: result.insertId,
        title,
        type,
        content,
        qr_image,
        created_at: new Date()
      };
    } catch (error) {
      console.error('Error in createQRCode:', error.message);
      throw error;
    }
  }

  /**
   * Delete a QR code by its ID.
   * @param {number|string} id - The ID of the QR code to delete.
   * @returns {Promise<boolean>} True if a row was deleted, false otherwise.
   */
  static async deleteQRCode(id) {
    await this.initTable();
    try {
      const [result] = await db.query('DELETE FROM qrcodes WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in deleteQRCode:', error.message);
      throw error;
    }
  }
}

module.exports = QRCode;
