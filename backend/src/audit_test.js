const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (path, method = 'GET', body = null, token = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      if (typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
};

async function runDeepAudit() {
  console.log('--- STARTING COMPREHENSIVE DEEP AUDIT ---');
  const results = {};

  try {
    // 1. Check CORS headers
    const corsRes = await request('/health', 'OPTIONS');
    results.cors = corsRes.headers['access-control-allow-origin'] !== undefined;

    // 2. Register a new student
    const rand = Math.floor(Math.random() * 10000);
    const regRes = await request('/auth/register', 'POST', {
      fullName: `Test Student ${rand}`,
      email: `audit_student_${rand}@college.edu`,
      studentId: `AUDIT-${rand}`,
      department: 'Computer Science',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    results.studentRegistration = regRes.status === 201 && !!regRes.data?.data?.token;
    const student1Token = regRes.data?.data?.token;
    const student1Id = regRes.data?.data?.user?._id;

    // Register second student
    const regRes2 = await request('/auth/register', 'POST', {
      fullName: `Second Student ${rand}`,
      email: `second_${rand}@college.edu`,
      studentId: `SEC-${rand}`,
      department: 'Civil Engineering',
      password: 'Password@123',
      confirmPassword: 'Password@123',
    });
    const student2Token = regRes2.data?.data?.token;

    // Admin login
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@college.edu',
      password: 'Admin@123456',
    });
    results.adminLogin = adminLogin.status === 200 && !!adminLogin.data?.data?.token;
    const adminToken = adminLogin.data?.data?.token;

    // Student 1 submits complaint
    const newComp = await request('/complaints', 'POST', {
      title: 'Water fountain broken in library 2nd floor',
      category: 'Water / Plumbing',
      location: 'Library Floor 2',
      priority: 'Medium',
      description: 'Water is not dispensing and motor makes a loud buzzing noise.',
    }, student1Token);
    results.complaintSubmission = newComp.status === 201;
    const complaintId = newComp.data?.data?._id;
    const complaintNum = newComp.data?.data?.complaintNumber;

    // Check complaint number format (CMP-YYYY-XXXXXX)
    const match = /^CMP-\d{4}-\d{6}$/.test(complaintNum);
    results.complaintNumberFormat = match;

    // Verify Student 2 CANNOT access Student 1's complaint (Isolation test)
    const isolationTest = await request(`/complaints/${complaintId}`, 'GET', null, student2Token);
    results.studentDataIsolation = isolationTest.status === 403;

    // Verify Student 1 CAN access own complaint
    const ownComp = await request(`/complaints/${complaintId}`, 'GET', null, student1Token);
    results.studentOwnAccess = ownComp.status === 200;

    // Verify Student 1 only sees own complaints in list
    const studentList = await request('/complaints', 'GET', null, student1Token);
    const hasOtherComplaints = studentList.data?.data?.some(c => c.student._id !== student1Id);
    results.studentListIsolation = !hasOtherComplaints;

    // Verify Admin CAN access all complaints
    const adminComp = await request(`/complaints/${complaintId}`, 'GET', null, adminToken);
    results.adminAccess = adminComp.status === 200;

    // Admin triage: Assign Department & Staff
    const depts = await request('/departments', 'GET');
    const staff = await request('/staff', 'GET', null, adminToken);
    const deptId = depts.data?.data?.[0]?._id;
    const staffId = staff.data?.data?.[0]?._id;

    const assignRes = await request(`/complaints/${complaintId}/assignment`, 'PUT', {
      departmentId: deptId,
      staffId: staffId,
      comment: 'Assigned to team lead',
    }, adminToken);
    results.adminAssignment = assignRes.status === 200 && assignRes.data?.data?.status === 'Assigned';

    // Admin updates priority
    const prioRes = await request(`/complaints/${complaintId}/priority`, 'PUT', {
      priority: 'High',
      comment: 'Escalated priority',
    }, adminToken);
    results.adminPriority = prioRes.status === 200 && prioRes.data?.data?.priority === 'High';

    // Admin updates status to In Progress
    const statRes = await request(`/complaints/${complaintId}/status`, 'PUT', {
      status: 'In Progress',
      comment: 'Technician on-site',
    }, adminToken);
    results.adminStatus = statRes.status === 200 && statRes.data?.data?.status === 'In Progress';

    // Admin adds comment
    const commRes = await request(`/complaints/${complaintId}/comments`, 'POST', {
      comment: 'Replacement parts ordered',
    }, adminToken);
    results.adminComment = commRes.status === 201;

    // Student adds follow-up comment
    const stuCommRes = await request(`/complaints/${complaintId}/comments`, 'POST', {
      comment: 'Thank you for the update',
    }, student1Token);
    results.studentComment = stuCommRes.status === 201;

    // Admin resolves complaint
    const resRes = await request(`/complaints/${complaintId}/resolution`, 'PUT', {
      resolutionDetails: 'Replaced water pump filter and tested water flow.',
      status: 'Resolved',
    }, adminToken);
    results.adminResolution = resRes.status === 200 && resRes.data?.data?.status === 'Resolved';

    // Student closes resolved complaint
    const closeRes = await request(`/complaints/${complaintId}/close`, 'PUT', {
      comment: 'Verified working',
    }, student1Token);
    results.studentClose = closeRes.status === 200 && closeRes.data?.data?.status === 'Closed';

    // Verify history audit completeness
    const finalDetails = await request(`/complaints/${complaintId}`, 'GET', null, student1Token);
    const historyEntries = finalDetails.data?.data?.history || [];
    results.historyCount = historyEntries.length;
    results.historyAudit = historyEntries.length >= 6; // submitted, assigned, priority, status, 2 comments, resolved, closed

    // Admin live stats test
    const statsRes = await request('/admin/statistics', 'GET', null, adminToken);
    results.adminStats = statsRes.status === 200 && typeof statsRes.data?.data?.summary?.total === 'number';

    // Department CRUD tests
    const newDept = await request('/departments', 'POST', {
      name: `Test Dept ${rand}`,
      description: 'Audit test department',
    }, adminToken);
    results.deptCreate = newDept.status === 201;
    const testDeptId = newDept.data?.data?._id;

    const editDept = await request(`/departments/${testDeptId}`, 'PUT', {
      description: 'Updated description',
    }, adminToken);
    results.deptUpdate = editDept.status === 200;

    const delDept = await request(`/departments/${testDeptId}`, 'DELETE', null, adminToken);
    results.deptDelete = delDept.status === 200;

    // Staff CRUD tests
    const newStaff = await request('/staff', 'POST', {
      name: `Test Staff ${rand}`,
      email: `staff_${rand}@college.edu`,
      department: deptId,
      role: 'Technician',
    }, adminToken);
    results.staffCreate = newStaff.status === 201;
    const testStaffId = newStaff.data?.data?._id;

    const editStaff = await request(`/staff/${testStaffId}`, 'PUT', {
      role: 'Senior Technician',
    }, adminToken);
    results.staffUpdate = editStaff.status === 200;

    const delStaff = await request(`/staff/${testStaffId}`, 'DELETE', null, adminToken);
    results.staffDelete = delStaff.status === 200;

    // Check password hashes omitted in responses
    results.passwordOmitted = !regRes.data?.data?.user?.passwordHash && !adminLogin.data?.data?.user?.passwordHash;

    console.log('AUDIT RESULTS:', JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Audit execution error:', err);
    process.exit(1);
  }
}

runDeepAudit();
