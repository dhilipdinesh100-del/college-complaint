const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Department = require('../models/Department');
const Staff = require('../models/Staff');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Counter = require('../models/Counter');

const seedData = async (isManual = false) => {
  try {
    const userCount = await User.countDocuments();
    if (!isManual && userCount > 0) {
      console.log(`Database already has ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('Seeding demo accounts and initial dataset...');

    if (isManual) {
      await Promise.all([
        User.deleteMany({}),
        Department.deleteMany({}),
        Staff.deleteMany({}),
        Complaint.deleteMany({}),
        ComplaintHistory.deleteMany({}),
        Counter.deleteMany({}),
      ]);
    }

    console.log('Creating Admin & Student Accounts...');
    const adminPasswordHash = await User.hashPassword('Admin@123456');
    const studentPasswordHash = await User.hashPassword('Student@123456');

    const admin = await User.create({
      fullName: 'Chief Administrative Officer',
      email: 'admin@college.edu',
      department: 'Administration',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const student1 = await User.create({
      fullName: 'Alex Morgan',
      email: 'student@college.edu',
      studentId: 'CS-2026-089',
      department: 'Computer Science',
      passwordHash: studentPasswordHash,
      role: 'student',
    });

    const student2 = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya@college.edu',
      studentId: 'EE-2026-104',
      department: 'Electrical Engineering',
      passwordHash: studentPasswordHash,
      role: 'student',
    });

    console.log('Creating Departments...');
    const departmentsData = [
      { name: 'IT & Campus Wi-Fi', description: 'Campus network, servers, Wi-Fi access points, and computer labs' },
      { name: 'Electrical & Power', description: 'Air conditioning, lighting, backup generators, and power outlets' },
      { name: 'Cleanliness & Sanitation', description: 'Waste disposal, restroom sanitization, and campus hygiene' },
      { name: 'Civil & Infrastructure', description: 'Building repairs, plumbing, doors, windows, and structural fixes' },
      { name: 'Hostel & Residence', description: 'Student living quarters, mess hall, laundry, and dormitory facilities' },
      { name: 'Laboratory & Equipment', description: 'Lab instrumentation, safety gears, and experiment workbenches' },
      { name: 'Academic & Classrooms', description: 'Projectors, smartboards, desks, chairs, and lecture audio' },
      { name: 'Transportation & Fleet', description: 'College buses, parking permits, and campus shuttle services' },
    ];

    const createdDepartments = await Department.insertMany(departmentsData);
    const deptMap = {};
    createdDepartments.forEach((dept) => {
      deptMap[dept.name] = dept._id;
    });

    console.log('Creating Staff Members...');
    const staffData = [
      { name: 'Robert Chen', email: 'robert.it@college.edu', department: deptMap['IT & Campus Wi-Fi'], role: 'Network Administrator', active: true },
      { name: 'Sara Jenkins', email: 'sara.it@college.edu', department: deptMap['IT & Campus Wi-Fi'], role: 'Hardware Specialist', active: true },
      { name: 'Marcus Brody', email: 'marcus.elec@college.edu', department: deptMap['Electrical & Power'], role: 'Lead Electrician', active: true },
      { name: 'Elena Gomez', email: 'elena.civil@college.edu', department: deptMap['Civil & Infrastructure'], role: 'Infrastructure Supervisor', active: true },
      { name: 'David Kumar', email: 'david.hostel@college.edu', department: deptMap['Hostel & Residence'], role: 'Hostel Warden', active: true },
      { name: 'Sunita Rao', email: 'sunita.clean@college.edu', department: deptMap['Cleanliness & Sanitation'], role: 'Sanitation Officer', active: true },
      { name: 'Dr. Arthur Vance', email: 'arthur.lab@college.edu', department: deptMap['Laboratory & Equipment'], role: 'Lab In-Charge', active: true },
      { name: 'Nancy Miller', email: 'nancy.acad@college.edu', department: deptMap['Academic & Classrooms'], role: 'AV Coordinator', active: true },
    ];

    const createdStaff = await Staff.insertMany(staffData);
    const staffMap = {};
    createdStaff.forEach((s) => {
      staffMap[s.name] = s._id;
    });

    console.log('Creating Sample Complaints across lifecycle...');
    const year = new Date().getFullYear();

    const complaintsData = [
      {
        complaintNumber: `CMP-${year}-000001`,
        student: student1._id,
        title: 'High-speed Wi-Fi not working in CS Lab 3',
        category: 'Wi-Fi / Internet',
        description: 'The primary access point in CS Lab 3 (Block B, 2nd Floor) has been disconnecting frequently and throughput has dropped below 1 Mbps.',
        location: 'Block B, Lab 302',
        priority: 'High',
        status: 'In Progress',
        assignedDepartment: deptMap['IT & Campus Wi-Fi'],
        assignedStaff: staffMap['Robert Chen'],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        complaintNumber: `CMP-${year}-000002`,
        student: student1._id,
        title: 'Ceiling projector flickering in Lecture Hall A1',
        category: 'Classroom',
        description: 'During morning lectures the HDMI input to the Epson ceiling projector keeps blacking out every few minutes.',
        location: 'Main Academic Block, Lecture Hall A1',
        priority: 'Medium',
        status: 'Resolved',
        assignedDepartment: deptMap['Academic & Classrooms'],
        assignedStaff: staffMap['Nancy Miller'],
        resolutionDetails: 'Replaced faulty HDMI switch and updated firmware on the ceiling projector unit. Tested with 3 laptops, working seamlessly.',
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        complaintNumber: `CMP-${year}-000003`,
        student: student2._id,
        title: 'Water leakage in Hostel Block C 3rd Floor Restroom',
        category: 'Water / Plumbing',
        description: 'Pipe under sink #2 has ruptured causing water stagnation across the floor. Needs urgent plumbing attention.',
        location: 'Hostel Block C, 3rd Floor Washroom',
        priority: 'Critical',
        status: 'Assigned',
        assignedDepartment: deptMap['Civil & Infrastructure'],
        assignedStaff: staffMap['Elena Gomez'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        complaintNumber: `CMP-${year}-000004`,
        student: student2._id,
        title: 'Flickering LED tube lights in Electrical Machine Lab',
        category: 'Electrical',
        description: 'Two tube lights near workbench 4 are constantly flickering making reading instruments difficult.',
        location: 'Engineering Workshop 1',
        priority: 'Low',
        status: 'Submitted',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        complaintNumber: `CMP-${year}-000005`,
        student: student1._id,
        title: 'Broken desk handle and chair wheel in Seminar Room 4',
        category: 'Infrastructure',
        description: 'Row 3 chair wheels are broken and damaged desk trim is catching on clothing.',
        location: 'Seminar Hall 4, West Wing',
        priority: 'Medium',
        status: 'Closed',
        assignedDepartment: deptMap['Civil & Infrastructure'],
        assignedStaff: staffMap['Elena Gomez'],
        resolutionDetails: 'Replaced damaged ergonomic chair with new spare and repaired the wooden trim.',
        resolvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        closedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdComplaints = await Complaint.insertMany(complaintsData);

    // Create history logs
    for (const c of createdComplaints) {
      await ComplaintHistory.create({
        complaint: c._id,
        status: 'Submitted',
        action: 'Complaint Submitted',
        comment: 'Complaint registered by student',
        updatedBy: c.student,
        createdAt: c.createdAt,
      });

      if (c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Resolved' || c.status === 'Closed') {
        await ComplaintHistory.create({
          complaint: c._id,
          status: 'Assigned',
          action: 'Department and Staff Assigned',
          comment: 'Assigned to field staff for on-site inspection',
          updatedBy: admin._id,
          createdAt: new Date(c.createdAt.getTime() + 4 * 60 * 60 * 1000),
        });
      }

      if (c.status === 'In Progress') {
        await ComplaintHistory.create({
          complaint: c._id,
          status: 'In Progress',
          action: 'Status changed to In Progress',
          comment: 'Technician on-site troubleshooting access point firmware and wiring',
          updatedBy: admin._id,
          createdAt: new Date(c.createdAt.getTime() + 24 * 60 * 60 * 1000),
        });
      }

      if (c.status === 'Resolved' || c.status === 'Closed') {
        await ComplaintHistory.create({
          complaint: c._id,
          status: 'Resolved',
          action: 'Complaint Resolved',
          comment: c.resolutionDetails || 'Issue successfully rectified',
          updatedBy: admin._id,
          createdAt: c.resolvedAt || new Date(c.createdAt.getTime() + 48 * 60 * 60 * 1000),
        });
      }

      if (c.status === 'Closed') {
        await ComplaintHistory.create({
          complaint: c._id,
          status: 'Closed',
          action: 'Complaint Closed',
          comment: 'Student verified the resolution and closed the ticket',
          updatedBy: c.student,
          createdAt: c.closedAt || new Date(c.createdAt.getTime() + 72 * 60 * 60 * 1000),
        });
      }
    }

    // Set counter sequence
    await Counter.create({
      name: `complaint_${year}`,
      seq: complaintsData.length,
    });

    console.log('Database seeded successfully!');
    console.log('--------------------------------------------------');
    console.log('DEMO ACCOUNTS READY:');
    console.log('ADMIN:   admin@college.edu   / Admin@123456');
    console.log('STUDENT: student@college.edu / Student@123456');
    console.log('STUDENT: priya@college.edu   / Student@123456');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedData(true);
    await disconnectDB();
    process.exit(0);
  });
}

module.exports = { seedData };
