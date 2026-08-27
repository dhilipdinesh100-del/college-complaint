const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  updateStatus,
  updatePriority,
  updateAssignment,
  updateResolution,
  addComment,
  closeComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .post(protect, upload.single('attachment'), createComplaint)
  .get(protect, getComplaints);

router
  .route('/:id')
  .get(protect, getComplaintById)
  .put(protect, updateComplaint)
  .delete(protect, deleteComplaint);

router.post('/:id/comments', protect, addComment);
router.put('/:id/status', protect, authorize('admin'), updateStatus);
router.put('/:id/priority', protect, authorize('admin'), updatePriority);
router.put('/:id/assignment', protect, authorize('admin'), updateAssignment);
router.put('/:id/resolution', protect, authorize('admin'), updateResolution);
router.put('/:id/close', protect, closeComplaint);

module.exports = router;
