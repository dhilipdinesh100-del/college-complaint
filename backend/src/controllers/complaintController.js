const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Counter = require('../models/Counter');
const Department = require('../models/Department');
const Staff = require('../models/Staff');

// Helper to generate unique human-readable complaint numbers (e.g. CMP-2026-000001)
const generateComplaintNumber = async () => {
  const year = new Date().getFullYear();
  const counterName = `complaint_${year}`;
  const seq = await Counter.getNextSequence(counterName);
  const formattedSeq = String(seq).padStart(6, '0');
  return `CMP-${year}-${formattedSeq}`;
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const { title, category, description, location, priority } = req.body;

    if (!title || !category || !description || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category, description, and location',
      });
    }

    const complaintNumber = await generateComplaintNumber();

    let attachmentData = null;
    if (req.file) {
      const baseUrl =
        process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      attachmentData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `${baseUrl}/uploads/${req.file.filename}`,
      };
    }

    const complaint = await Complaint.create({
      complaintNumber,
      student: req.user._id,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      priority: priority || 'Medium',
      status: 'Submitted',
      attachment: attachmentData,
    });

    // Create initial audit history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      status: 'Submitted',
      action: 'Complaint Submitted',
      comment: 'Complaint registered by student',
      updatedBy: req.user._id,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints (students get only their own, admins get all with search/filters)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      department,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    // Strict access control: students only see their own complaints
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    // Filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (department && department !== 'All') {
      query.assignedDepartment = department;
    }

    // Search keyword across complaintNumber, title, description, location
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { complaintNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID with history
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name description')
      .populate('assignedStaff', 'name email role active');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Access control: Verify student ownership if not admin
    if (
      req.user.role === 'student' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this complaint',
      });
    }

    // Fetch chronological timeline history
    const history = await ComplaintHistory.find({ complaint: complaint._id })
      .populate('updatedBy', 'fullName role email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        ...complaint.toObject(),
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint details
// @route   PUT /api/complaints/:id
// @access  Private (Admin / Owner student if Submitted)
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (
      req.user.role === 'student' &&
      complaint.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this complaint',
      });
    }

    // Students can only edit when complaint is in Submitted status
    if (req.user.role === 'student' && complaint.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a complaint that is already being processed',
      });
    }

    const { title, category, description, location } = req.body;
    if (title) complaint.title = title.trim();
    if (category) complaint.category = category;
    if (description) complaint.description = description.trim();
    if (location) complaint.location = location.trim();

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: 'Details Updated',
      comment: `Details updated by ${req.user.role}`,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin only)
const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;

    const validStatuses = [
      'Submitted',
      'Under Review',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;

    if (status === 'Resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }
    if (status === 'Closed' && !complaint.closedAt) {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    // Create history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      status,
      action: `Status changed from ${oldStatus} to ${status}`,
      comment: comment ? comment.trim() : `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name email');

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint priority
// @route   PUT /api/complaints/:id/priority
// @access  Private (Admin only)
const updatePriority = async (req, res, next) => {
  try {
    const { priority, comment } = req.body;
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];

    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const oldPriority = complaint.priority;
    complaint.priority = priority;
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: `Priority updated from ${oldPriority} to ${priority}`,
      comment: comment ? comment.trim() : `Priority set to ${priority}`,
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: `Priority updated to ${priority}`,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign department and/or staff
// @route   PUT /api/complaints/:id/assignment
// @access  Private (Admin only)
const updateAssignment = async (req, res, next) => {
  try {
    const { departmentId, staffId, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    let deptName = '';
    let staffName = '';

    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Department not found' });
      }
      complaint.assignedDepartment = dept._id;
      deptName = dept.name;
    } else if (departmentId === null) {
      complaint.assignedDepartment = null;
    }

    if (staffId) {
      const staff = await Staff.findById(staffId);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff not found' });
      }
      complaint.assignedStaff = staff._id;
      staffName = staff.name;
    } else if (staffId === null) {
      complaint.assignedStaff = null;
    }

    // Automatically transition to Assigned if currently Submitted or Under Review
    if (['Submitted', 'Under Review'].includes(complaint.status) && (departmentId || staffId)) {
      complaint.status = 'Assigned';
    }

    await complaint.save();

    const actionText = departmentId && staffId
      ? `Assigned to ${deptName} (${staffName})`
      : departmentId
      ? `Assigned to Department: ${deptName}`
      : staffId
      ? `Assigned to Staff: ${staffName}`
      : 'Assignment updated';

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: actionText,
      comment: comment ? comment.trim() : actionText,
      updatedBy: req.user._id,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name description')
      .populate('assignedStaff', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add resolution details and mark as resolved
// @route   PUT /api/complaints/:id/resolution
// @access  Private (Admin only)
const updateResolution = async (req, res, next) => {
  try {
    const { resolutionDetails, status = 'Resolved', comment } = req.body;

    if (!resolutionDetails || !resolutionDetails.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Resolution details are required',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.resolutionDetails = resolutionDetails.trim();
    complaint.status = status;
    complaint.resolvedAt = new Date();

    if (status === 'Closed') {
      complaint.closedAt = new Date();
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status,
      action: 'Complaint Resolved',
      comment: comment ? comment.trim() : resolutionDetails.trim(),
      updatedBy: req.user._id,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'fullName email studentId department')
      .populate('assignedDepartment', 'name')
      .populate('assignedStaff', 'name email');

    res.status(200).json({
      success: true,
      message: 'Complaint resolution recorded successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment/update to complaint
// @route   POST /api/complaints/:id/comments
// @access  Private (Admin or Student owner)
const addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (
      req.user.role === 'student' &&
      complaint.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have access to this complaint',
      });
    }

    const historyEntry = await ComplaintHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      action: req.user.role === 'admin' ? 'Admin Note Added' : 'Student Comment Added',
      comment: comment.trim(),
      updatedBy: req.user._id,
    });

    const populatedHistory = await ComplaintHistory.findById(historyEntry._id).populate(
      'updatedBy',
      'fullName role email'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Close a resolved complaint
// @route   PUT /api/complaints/:id/close
// @access  Private (Student owner or Admin)
const closeComplaint = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (
      req.user.role === 'student' &&
      complaint.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this complaint',
      });
    }

    complaint.status = 'Closed';
    complaint.closedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      status: 'Closed',
      action: 'Complaint Closed',
      comment: comment ? comment.trim() : 'Complaint closed and verified by user',
      updatedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint closed successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Admin only, or Student if Submitted)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (req.user.role === 'student') {
      if (complaint.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden',
        });
      }
      if (complaint.status !== 'Submitted') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a complaint that has already entered review or processing',
        });
      }
    }

    // Remove complaint and its history
    await ComplaintHistory.deleteMany({ complaint: complaint._id });
    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
