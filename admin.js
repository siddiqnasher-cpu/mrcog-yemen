/* =========================================
   ADMIN DASHBOARD LOGIC (admin.js)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Authentication Check & Validation
    const authOverlay = document.getElementById('authOverlay');
    const adminLayout = document.getElementById('adminLayout');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    setTimeout(() => {
        // Validate if user has admin privileges
        const admins = ["mohammednasher532@gmail.com", "siddiqnasher@gmail.com"];
        if (userRole === "admin" && admins.includes(userEmail)) {
            // Verified
            authOverlay.style.display = 'none';
            adminLayout.style.display = 'grid'; // Grid is used for the layout
            
            // Dynamically update profile name
            const profileName = document.querySelector('.user-profile .name');
            if(profileName) profileName.textContent = "Mohammed Nasher";

            // Initialize dashboard
            initDashboard();
        } else {
            // Unverified - Redirect away to protect page
            alert("غير مصرح لك بالوصول! هذه الصفحة مخصصة لمديري الموقع.");
            window.location.href = "login.html";
        }
    }, 1000);

    // 2. Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Redirect back to login page
            window.location.href = 'login.html';
        });
    }

    // 3. Tab Switching Logic
    function initDashboard() {
        const navItems = document.querySelectorAll('#adminTabs .nav-item');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const pageTitle = document.querySelector('.admin-topbar .page-title'); // If we had one in topbar

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all tabs and panes
                navItems.forEach(nav => nav.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to clicked tab
                item.classList.add('active');

                // Show target pane
                const targetId = item.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }

                // If on mobile, close sidebar after clicking a tab
                const sidebar = document.querySelector('.admin-sidebar');
                if (window.innerWidth <= 992 && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            });
        });

        // 4. Mobile Sidebar Toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.admin-sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // 5. Populate Mock Data Data
        populateCoursesTable();
        populateUsersTable();
        fetchMessages();
        fetchHelpRequests();
        fetchNews();
        fetchProjects();
        
        // 6. Hook up the Translation
        initAdminI18n();
    }
});

/* =========================================
   MOCK DATA & DOM MANIPULATION
   ========================================= */

const mockCourses = [
    { id: 1, name: "MRCOG Part 2 Regular", instructor: "Dr. Amira", price: "200", status: "نشط" },
    { id: 2, name: "MRCOG Part 2 Crash", instructor: "Dr. Amira", price: "150", status: "نشط" },
    { id: 3, name: "MRCOG Part 2 Revision", instructor: "Dr. Amira", price: "100", status: "نشط" },
    { id: 4, name: "Jan 2026 Regular", instructor: "Dr. Amira", price: "250", status: "مجدول" }
];

const mockUsers = [
    { name: "فاطمة علي", email: "fatima@example.com", phone: "+967...", courses: "2", status: "نشط" },
    { name: "أحمد صالح", email: "ahmed@example.com", phone: "+201...", courses: "1", status: "نشط" },
    { name: "دعاء محمد", email: "doaa@example.com", phone: "+966...", courses: "0", status: "غير نشط" },
];

function populateCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    mockCourses.forEach(course => {
        const badgeClass = course.status === 'نشط' ? 'bg-success' : 'bg-warning';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${course.name}</strong></td>
            <td>${course.instructor}</td>
            <td>$${course.price}</td>
            <td><span class="badge ${badgeClass}">${course.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline"><i class="fas fa-edit"></i> تعديل</button>
                <button class="btn btn-sm btn-outline" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    mockUsers.forEach(user => {
        const badgeClass = user.status === 'نشط' ? 'bg-success' : 'bg-danger';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.courses}</td>
            <td><span class="badge ${badgeClass}">${user.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="openModal('userModal')"><i class="fas fa-user-edit"></i> إدارة الحساب</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================================
   MODAL LOGIC
   ========================================= */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('admin-modal')) {
        event.target.classList.remove('show');
    }
}

// Handle Add Course Form Submit
document.getElementById('courseForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('courseName').value;
    const type = document.getElementById('courseType').value;
    const price = document.getElementById('coursePrice').value;

    // Simulate adding to array
    mockCourses.push({
        id: mockCourses.length + 1,
        name: name + ` (${type})`,
        instructor: "Dr. Amira",
        price: price,
        status: "نشط"
    });

    populateCoursesTable();
    closeModal('courseModal');
    
    // Clear form
    this.reset();
    alert("تم تزويد الكورس بنجاح!");
});

// Handle Add Student Form Submit
document.getElementById('addStudentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('newStudentName').value;
    const email = document.getElementById('newStudentEmail').value;
    const phone = document.getElementById('newStudentPhone').value;
    const status = document.getElementById('newStudentStatus').value;

    // Simulate adding to array
    mockUsers.unshift({
        name: name,
        email: email,
        phone: phone,
        courses: "0",
        status: status
    });

    // Re-render table
    populateUsersTable();
    
    // Close modal and clear form
    closeModal('addStudentModal');
    this.reset();
    
    // Feedback
    alert(adminLang === 'ar' ? "تمت إضافة الطالب بنجاح!" : "Student added successfully!");
});

// News and Projects Submissions
document.getElementById('newsForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;
    const btn = this.querySelector('button');

    if (!window.supabaseClient || window.supabaseClient.supabaseUrl === 'YOUR_SUPABASE_URL') {
        alert("خطأ: لم يتم ضبط إعدادات Supabase بشكل صحيح. يرجى مراجعة ملف supabase-config.js.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "جاري الحفظ...";
        const { error } = await window.supabaseClient.from('news').insert([{ title, content }]);
        if (error) throw error;
        alert("تمت إضافة الخبر بنجاح وسيظهر بعد التحديث!");
        closeModal('newsModal');
        this.reset();
        await fetchNews();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الإضافة: " + (err.message || err));
    } finally {
        btn.disabled = false;
        btn.textContent = "حفظ الخبر";
    }
});

document.getElementById('projectForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;
    const link = document.getElementById('projectLink').value;
    const btn = this.querySelector('button');

    if (!window.supabaseClient || window.supabaseClient.supabaseUrl === 'YOUR_SUPABASE_URL') {
        alert("خطأ: لم يتم ضبط إعدادات Supabase بشكل صحيح. يرجى مراجعة ملف supabase-config.js.");
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = "جاري الحفظ...";
        const { error } = await window.supabaseClient.from('projects').insert([{ name, description, link }]);
        if (error) throw error;
        alert("تمت إضافة المشروع بنجاح وسيظهر بعد التحديث!");
        closeModal('projectModal');
        this.reset();
        await fetchProjects();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الإضافة: " + (err.message || err));
    } finally {
        btn.disabled = false;
        btn.textContent = "حفظ المشروع";
    }
});

async function fetchNews() {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient.from('news').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        tbody.innerHTML = (data && data.length > 0) ? '' : '<tr><td colspan="4" class="text-center">لا توجد أخبار</td></tr>';
        data?.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.title}</strong></td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
                <td><span class="badge ${item.is_published ? 'bg-success' : 'bg-warning'}">${item.is_published ? 'منشور' : 'مسودة'}</span></td>
                <td><button class="btn btn-sm btn-outline"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error('Error fetching news:', err); }
}

async function fetchProjects() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        tbody.innerHTML = (data && data.length > 0) ? '' : '<tr><td colspan="4" class="text-center">لا توجد مشاريع</td></tr>';
        data?.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.description.substring(0, 50)}...</td>
                <td><a href="${item.link || '#'}" target="_blank">${item.link ? 'رابط' : '-'}</a></td>
                <td><button class="btn btn-sm btn-outline"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error('Error fetching projects:', err); }
}

async function fetchMessages() {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient.from('messages').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        tbody.innerHTML = (data && data.length > 0) ? '' : '<tr><td colspan="5" class="text-center">لا توجد استفسارات</td></tr>';
        data?.forEach(msg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${msg.name}</strong></td>
                <td>${msg.email}</td>
                <td>${msg.message.substring(0, 50)}...</td>
                <td>${new Date(msg.created_at).toLocaleDateString()}</td>
                <td><button class="btn btn-sm btn-outline"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error('Error fetching messages:', err); }
}

async function fetchHelpRequests() {
    const tbody = document.getElementById('helpRequestsTableBody');
    if (!tbody) return;
    try {
        const { data, error } = await window.supabaseClient.from('help_requests').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        tbody.innerHTML = (data && data.length > 0) ? '' : '<tr><td colspan="6" class="text-center">لا توجد طلبات مساعدة</td></tr>';
        data?.forEach(req => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${req.student_name}</strong></td>
                <td>${req.student_email}</td>
                <td>${req.subject}</td>
                <td>${req.description.substring(0, 50)}...</td>
                <td>${new Date(req.created_at).toLocaleDateString()}</td>
                <td><span class="badge ${req.status === 'resolved' ? 'bg-success' : 'bg-warning'}">${req.status === 'resolved' ? 'تم الحل' : 'معلق'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) { console.error('Error fetching help requests:', err); }
}

/* =========================================
   I18N LOGIC FOR ADMIN
   ========================================= */

const adminTranslations = {
    "ar": {
        "admin-nav-overview": "نظرة عامة",
        "admin-nav-courses": "إدارة الكورسات",
        "admin-nav-users": "إدارة الطلاب",
        "admin-nav-subs": "إدارة الاشتراكات",
        "admin-nav-doctor": "المدرب / المحتوى",
        "admin-nav-enquiries": "الاستفسارات الواردة",
        "admin-nav-settings": "إعدادات المنصة",
        "admin-logout": "تسجيل الخروج",
        "admin-title-overview": "نظرة عامة / الإحصائيات",
        "admin-stat-users": "إجمالي الطلاب",
        "admin-stat-courses": "الكورسات المفعلة",
        "admin-stat-enroll": "المسجلين اليوم",
        "admin-stat-subs": "الاشتراكات النشطة",
        "admin-activity": "النشاط الأخير",
        "admin-search-student": "ابحث عن طالب...",
        "admin-add-student": "أضف طالب جديد",
        "admin-user-name": "اسم الطالب",
        "admin-user-email": "البريد الإلكتروني",
        "admin-user-phone": "رقم الهاتف (واتس آب)",
        "admin-user-status": "حالة الحساب",
        "admin-save-student": "إضافة الطالب وتأكيد بياناته",
        "admin-nav-help": "طلبات المساعدة",
        "admin-nav-news": "إدارة الأخبار",
        "admin-nav-projects": "إدارة المشاريع"
    },
    "en": {
        "admin-nav-overview": "Overview Summary",
        "admin-nav-courses": "Manage Courses",
        "admin-nav-users": "Manage Students",
        "admin-nav-subs": "Subscriptions",
        "admin-nav-doctor": "Instructor / Content",
        "admin-nav-enquiries": "Enquiries",
        "admin-nav-settings": "Platform Settings",
        "admin-logout": "Logout",
        "admin-title-overview": "Overview / Statistics",
        "admin-stat-users": "Total Students",
        "admin-stat-courses": "Active Courses",
        "admin-stat-enroll": "Enrolled Today",
        "admin-stat-subs": "Active Subs",
        "admin-activity": "Recent Activity",
        "admin-search-student": "Search student...",
        "admin-add-student": "Add New Student",
        "admin-user-name": "Student Name",
        "admin-user-email": "Email Address",
        "admin-user-phone": "Phone Number (WhatsApp)",
        "admin-user-status": "Account Status",
        "admin-save-student": "Confirm & Add Student",
        "admin-nav-help": "Help Requests",
        "admin-nav-news": "Manage News",
        "admin-nav-projects": "Manage Projects"
    }
}

let adminLang = localStorage.getItem("lang") || "ar";

function initAdminI18n() {
    applyAdminLang(adminLang);

    const langBtns = document.querySelectorAll('.lang-switch-admin .lang-switcher');
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            adminLang = adminLang === "ar" ? "en" : "ar";
            localStorage.setItem("lang", adminLang);
            applyAdminLang(adminLang);
        });
    });
}

function applyAdminLang(lang) {
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (adminTranslations[lang] && adminTranslations[lang][key]) {
            if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", adminTranslations[lang][key]);
            } else {
                el.innerHTML = adminTranslations[lang][key];
            }
        }
    });

    const langBtns = document.querySelectorAll('.lang-switch-admin .lang-switcher');
    langBtns.forEach(btn => {
        btn.textContent = lang === "ar" ? "English" : "عربي";
    });
}
