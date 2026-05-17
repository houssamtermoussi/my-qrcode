const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');

/**
 * QR Code Routes
 * Base route: /api/qr
 */

// Route to fetch all QR codes
router.get('/', QRController.getQRCodes);

// Route to create a new QR code
router.post('/', QRController.addQRCode);

// Route to delete a QR code by its ID
router.delete('/:id', QRController.removeQRCode);


module.exports = router;
