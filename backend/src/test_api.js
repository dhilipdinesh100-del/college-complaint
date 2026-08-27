const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING AUTOMATED SYSTEM & API VERIFICATION TESTS');
  console.log('====================================================\n');

  try {
    // 1. Health check
    console.log('[TEST 1] Testing Health Endpoint...');
    const health = await request('/health');
    console.log(`Status: ${health.status} - ${health.data?.service || 'OK'}`);
    if (health.status !== 200) throw new Error('Health check failed');
    console.log('✓ Health check PASSED\n');

    // 2. Admin Login
    console.log('[TEST 2] Testing Admin Login (admin@college.edu)...');
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@college.edu',
      password: 'Admin@123456',
    });
    console.log(`Status: ${adminLogin.status}, Success: ${adminLogin.data?.success}`);
    if (adminLogin.status !== 200 || !adminLogin.data?.data?.token) {
      throw new Error('Admin login failed');
    }
    const adminToken = adminLogin.data.data.token;
    console.log('✓ Admin login PASSED\n');

    // 3. Student Login
    console.log('[TEST 3] Testing Student Login (student@college.edu)...');
    const studentLogin = await request('/auth/login', 'POST', {
      email: 'student@college.edu',
      password: 'Student@123456',
    });
    console.log(`Status: ${studentLogin.status}, Success: ${studentLogin.data?.success}`);
    if (studentLogin.status !== 200 || !studentLogin.data?.data?.token) {
      throw new Error('Student login failed');
    }
    const studentToken = studentLogin.data.data.token;
    console.log('✓ Student login PASSED\n');

    // 4. Role Authorization Check (Student accessing admin stats should get 403)
    console.log('[TEST 4] Testing Security Authorization (Student -> Admin Stats)...');
    const forbiddenCheck = await request('/admin/statistics', 'GET', null, studentToken);
    console.log(`Status: ${forbiddenCheck.status} (Expected 403 Forbidden)`);
    if (forbiddenCheck.status !== 403) {
      throw new Error(`Security failed: Student was able to call admin stats with code ${forbiddenCheck.status}`);
    }
    console.log('✓ Security Role Authorization PASSED\n');

    // 5. Student Creates Complaint
    console.log('[TEST 5] Testing Student Complaint Submission...');
    const newComplaint = await request(
      '/complaints',
      'POST',
      {
        title: 'Projector HDMI port damaged in Lab 102',
        category: 'Classroom',
        location: 'Building B, Room 102',
        priority: 'High',
        description: 'The HDMI connector pins are bent preventing video output during classes.',
      },
      studentToken
    );
    console.log(`Status: ${newComplaint.status}, Ticket Number: ${newComplaint.data?.data?.complaintNumber}`);
    if (newComplaint.status !== 201 || !newComplaint.data?.data?._id) {
      throw new Error('Complaint submission failed');
    }
    const complaintId = newComplaint.data.data._id;
    const ticketNumber = newComplaint.data.data.complaintNumber;
    console.log(`✓ Complaint creation PASSED: ${ticketNumber}\n`);

    // 6. Student views complaint details & history
    console.log('[TEST 6] Testing Complaint Details & History Retrieval...');
    const details = await request(`/complaints/${complaintId}`, 'GET', null, studentToken);
    console.log(`Status: ${details.status}, History count: ${details.data?.data?.history?.length}`);
    if (details.status !== 200 || !details.data?.data?.history) {
      throw new Error('Complaint details retrieval failed');
    }
    console.log('✓ Complaint details & history PASSED\n');

    // 7. Admin updates assignment
    console.log('[TEST 7] Testing Admin Department & Staff Assignment...');
    const depts = await request('/departments', 'GET');
    const staff = await request('/staff', 'GET', null, adminToken);
    const targetDeptId = depts.data?.data[0]?._id;
    const targetStaffId = staff.data?.data[0]?._id;

    const assignRes = await request(
      `/complaints/${complaintId}/assignment`,
      'PUT',
      {
        departmentId: targetDeptId,
        staffId: targetStaffId,
        comment: 'Assigned to field technician for repair',
      },
      adminToken
    );
    console.log(`Status: ${assignRes.status}, Current Status: ${assignRes.data?.data?.status}`);
    if (assignRes.status !== 200) throw new Error('Assignment failed');
    console.log('✓ Admin Assignment PASSED\n');

    // 8. Admin updates status to In Progress
    console.log('[TEST 8] Testing Admin Status Transition to In Progress...');
    const statusRes = await request(
      `/complaints/${complaintId}/status`,
      'PUT',
      {
        status: 'In Progress',
        comment: 'Technician on-site testing replacement cable',
      },
      adminToken
    );
    console.log(`Status: ${statusRes.status}, Status: ${statusRes.data?.data?.status}`);
    if (statusRes.status !== 200) throw new Error('Status transition failed');
    console.log('✓ Status transition PASSED\n');

    // 9. Admin adds resolution
    console.log('[TEST 9] Testing Admin Resolution Recording...');
    const resolveRes = await request(
      `/complaints/${complaintId}/resolution`,
      'PUT',
      {
        resolutionDetails: 'Replaced damaged HDMI wall box and tested with 1080p display signal.',
        status: 'Resolved',
        comment: 'Resolution verified by tech lead',
      },
      adminToken
    );
    console.log(`Status: ${resolveRes.status}, ResolvedAt: ${resolveRes.data?.data?.resolvedAt}`);
    if (resolveRes.status !== 200) throw new Error('Resolution recording failed');
    console.log('✓ Resolution PASSED\n');

    // 10. Student closes the ticket
    console.log('[TEST 10] Testing Student Closing Resolved Ticket...');
    const closeRes = await request(
      `/complaints/${complaintId}/close`,
      'PUT',
      { comment: 'Verified HDMI display is working properly now. Thank you.' },
      studentToken
    );
    console.log(`Status: ${closeRes.status}, Final Status: ${closeRes.data?.data?.status}`);
    if (closeRes.status !== 200 || closeRes.data?.data?.status !== 'Closed') {
      throw new Error('Student close ticket failed');
    }
    console.log('✓ Student ticket closure PASSED\n');

    // 11. Admin Statistics Live Aggregation
    console.log('[TEST 11] Testing Admin Dashboard Statistics Aggregation...');
    const statsRes = await request('/admin/statistics', 'GET', null, adminToken);
    console.log(`Status: ${statsRes.status}`);
    console.log(`Total Complaints: ${statsRes.data?.data?.summary?.total}`);
    console.log(`Resolution Rate: ${statsRes.data?.data?.summary?.resolutionRate}%`);
    console.log(`Students: ${statsRes.data?.data?.counts?.students}`);
    if (statsRes.status !== 200 || typeof statsRes.data?.data?.summary?.total !== 'number') {
      throw new Error('Admin statistics failed');
    }
    console.log('✓ Admin Statistics PASSED\n');

    console.log('====================================================');
    console.log('ALL 11 AUTOMATED TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

// Run if invoked directly
if (require.main === module) {
  runTests();
}

module.exports = runTests;
