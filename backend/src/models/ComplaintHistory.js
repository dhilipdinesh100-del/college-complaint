const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      default: 'Status Update',
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

complaintHistorySchema.index({ complaint: 1, createdAt: 1 });

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
module.exports = ComplaintHistory;
