const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');

// @desc    Get all staff (optionally filtered by department)
// @route   GET /api/staff
// @access  Private
const getStaff = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.active !== undefined) {
      filter.active = req.query.active === 'true';
    } else if (req.user?.role === 'student') {
      filter.active = true;
    }

    const staff = await Staff.find(filter)
      .populate('department', 'name description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private
const getStaffById = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id).populate(
      'department',
      'name description'
    );
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }
    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private (Admin only)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, department, role, active } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and department are required',
      });
    }

    const staff = await Staff.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department,
      role: role ? role.trim() : 'Staff Officer',
      active: active !== undefined ? active : true,
    });

    const populatedStaff = await Staff.findById(staff._id).populate(
      'department',
      'name description'
    );

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: populatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin only)
const updateStaff = async (req, res, next) => {
  try {
    const { name, email, department, role, active } = req.body;
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    if (name) staff.name = name.trim();
    if (email) staff.email = email.trim().toLowerCase();
    if (department) staff.department = department;
    if (role !== undefined) staff.role = role.trim();
    if (active !== undefined) staff.active = active;

    await staff.save();

    const populatedStaff = await Staff.findById(staff._id).populate(
      'department',
      'name description'
    );

    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: populatedStaff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    // Check if staff is assigned to active complaints
    const activeComplaints = await Complaint.countDocuments({
      assignedStaff: staff._id,
      status: { $nin: ['Closed', 'Resolved'] },
    });

    if (activeComplaints > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete staff member who is assigned to ${activeComplaints} active complaint(s). Reassign them first or mark staff as inactive.`,
      });
    }

    await staff.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
