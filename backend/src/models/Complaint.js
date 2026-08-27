const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      enum: [
        'Classroom',
        'Laboratory',
        'Hostel',
        'Wi-Fi / Internet',
        'Infrastructure',
        'Transportation',
        'Cleanliness',
        'Electrical',
        'Water / Plumbing',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Complaint location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    attachment: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
      ],
      default: 'Submitted',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    resolutionDetails: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for sorting & searching
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ student: 1, createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;
