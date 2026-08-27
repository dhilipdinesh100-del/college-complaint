const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const Staff = require('../models/Staff');

// @desc    Get system-wide analytics and dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin only)
const getStatistics = async (req, res, next) => {
  try {
    const [
      totalComplaints,
      submittedCount,
      underReviewCount,
      assignedCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalStudents,
      totalDepartments,
      totalStaff,
      categoryStats,
      departmentStats,
      recentComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Submitted' }),
      Complaint.countDocuments({ status: 'Under Review' }),
      Complaint.countDocuments({ status: 'Assigned' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: 'Closed' }),
      Complaint.countDocuments({ priority: 'Critical' }),
      Complaint.countDocuments({ priority: 'High' }),
      Complaint.countDocuments({ priority: 'Medium' }),
      Complaint.countDocuments({ priority: 'Low' }),
      User.countDocuments({ role: 'student' }),
      Department.countDocuments(),
      Staff.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.aggregate([
        {
          $match: { assignedDepartment: { $ne: null } },
        },
        {
          $group: { _id: '$assignedDepartment', count: { $sum: 1 } },
        },
        {
          $lookup: {
            from: 'departments',
            localField: '_id',
            foreignField: '_id',
            as: 'departmentInfo',
          },
        },
        { $unwind: '$departmentInfo' },
        {
          $project: {
            _id: 1,
            name: '$departmentInfo.name',
            count: 1,
          },
        },
        { $sort: { count: -1 } },
      ]),
      Complaint.find()
        .populate('student', 'fullName email studentId')
        .populate('assignedDepartment', 'name')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const activeCount = submittedCount + underReviewCount + assignedCount + inProgressCount;
    const resolutionRate =
      totalComplaints > 0
        ? Math.round(((resolvedCount + closedCount) / totalComplaints) * 100)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalComplaints,
          active: activeCount,
          submitted: submittedCount,
          underReview: underReviewCount,
          assigned: assignedCount,
          inProgress: inProgressCount,
          resolved: resolvedCount,
          closed: closedCount,
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          resolutionRate,
        },
        counts: {
          students: totalStudents,
          departments: totalDepartments,
          staff: totalStaff,
        },
        byCategory: categoryStats.map((item) => ({
          category: item._id,
          count: item.count,
        })),
        byDepartment: departmentStats,
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatistics,
};
