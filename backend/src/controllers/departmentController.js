const Department = require('../models/Department');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public / Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }
    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A department with this name already exists',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    if (name) {
      const existing = await Department.findOne({
        _id: { $ne: department._id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Another department with this name already exists',
        });
      }
      department.name = name.trim();
    }

    if (description !== undefined) {
      department.description = description.trim();
    }

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Check if staff are assigned to this department
    const staffCount = await Staff.countDocuments({ department: department._id });
    if (staffCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${staffCount} assigned staff member(s). Reassign or remove staff first.`,
      });
    }

    // Check if active complaints are assigned
    const complaintCount = await Complaint.countDocuments({
      assignedDepartment: department._id,
      status: { $nin: ['Closed', 'Resolved'] },
    });
    if (complaintCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${complaintCount} active complaint(s).`,
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
