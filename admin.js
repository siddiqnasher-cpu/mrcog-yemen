/* =========================================
   ADMIN DASHBOARD LOGIC (admin.js)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('authOverlay');
    const adminLayout = document.getElementById('adminLayout');
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    setTimeout(() => {
        const admins = ["mohammednasher532@gmail.com", "siddiqnasher@gmail.com"];

        if (userRole === "admin" && admins.includes(userEmail)) {
            if (authOverlay) authOverlay.style.display = 'none';
            if (adminLayout) adminLayout.style.display = 'grid';

            const profileName = document.querySelector('.user-profile .name');
            if (profileName) profileName.textContent = "Mohammed Nasher";

            initDashboard();
        } else {
            alert("غير مصرح لك بالوصول! هذه الصفحة مخصصة لمديري الموقع.");
            window.location.href = "login.html";
        }
    }, 1000);

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
});

function initDashboard() {
    const navItems = document.querySelectorAll('#adminTabs .nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }

            const sidebar = document.querySelector('.admin-sidebar');
            if (window.innerWidth <= 992 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    populateCoursesTable();
    populateUsersTable();
    fetchMessages();
    fetchHelpRequests();
    fetchNews();
    fetchProjects();

    initAdminI18n();
}

/* =========================================
   HELPERS
   ========================================= */

function isSupabaseReady() {
    return !!window.supabaseClient;
}

function formatDate(dateValue) {
    if (!dateValue) return '-';
    try {
        return new Date(dateValue).toLocaleDateString();
    } catch {
        return '-';
    }
}

function safeText(value) {
    return value ?? '-';
}

/* =========================================
   DATA LOADERS
   ========================================= */

async function populateCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد كورسات</td></tr>';
            return;
        }

        data.forEach(course => {
            const badgeClass = course.status === 'نشط' ? 'bg-success' : 'bg-warning';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(course.name)}</strong></td>
                <td>${safeText(course.instructor)}</td>
                <td>$${safeText(course.price)}</td>
                <td><span class="badge ${badgeClass}">${safeText(course.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" disabled><i class="fas fa-edit"></i> تعديل</button>
                    <button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="deleteCourse(${course.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching courses:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">خطأ في تحميل الكورسات</td></tr>';
    }
}

async function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('students')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">لا يوجد طلاب</td></tr>';
            return;
        }

        data.forEach(user => {
            const badgeClass = user.status === 'نشط' ? 'bg-success' : 'bg-danger';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(user.name)}</strong></td>
                <td>${safeText(user.email)}</td>
                <td>${safeText(user.phone)}</td>
                <td>${safeText(user.courses)}</td>
                <td><span class="badge ${badgeClass}">${safeText(user.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" disabled><i class="fas fa-user-edit"></i> إدارة الحساب</button>
                    <button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="deleteStudent(${user.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching students:', err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">خطأ في تحميل الطلاب</td></tr>';
    }
}

async function fetchNews() {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد أخبار</td></tr>';
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(item.title)}</strong></td>
                <td>${formatDate(item.created_at)}</td>
                <td><span class="badge ${item.is_published ? 'bg-success' : 'bg-warning'}">${item.is_published ? 'منشور' : 'مسودة'}</span></td>
                <td><button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="deleteNews(${item.id})"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching news:', err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">خطأ في تحميل الأخبار</td></tr>';
    }
}

async function fetchProjects() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">لا توجد مشاريع</td></tr>';
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(item.name)}</strong></td>
                <td>${item.description ? item.description.substring(0, 50) : '-'}${item.description && item.description.length > 50 ? '...' : ''}</td>
                <td><a href="${item.link || '#'}" target="_blank">${item.link ? 'رابط' : '-'}</a></td>
                <td><button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="deleteProject(${item.id})"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching projects:', err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">خطأ في تحميل المشاريع</td></tr>';
    }
}

async function fetchMessages() {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">لا توجد استفسارات</td></tr>';
            return;
        }

        data.forEach(msg => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(msg.name)}</strong></td>
                <td>${safeText(msg.email)}</td>
                <td>${msg.message ? msg.message.substring(0, 50) : '-'}${msg.message && msg.message.length > 50 ? '...' : ''}</td>
                <td>${formatDate(msg.created_at)}</td>
                <td><button class="btn btn-sm btn-outline" style="color:var(--danger)" onclick="deleteMessage(${msg.id})"><i class="fas fa-trash"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">خطأ في تحميل الاستفسارات</td></tr>';
    }
}

async function fetchHelpRequests() {
    const tbody = document.getElementById('helpRequestsTableBody');
    if (!tbody) return;

    if (!isSupabaseReady()) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Supabase غير متصل</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('help_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">لا توجد طلبات مساعدة</td></tr>';
            return;
        }

        data.forEach(req => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${safeText(req.student_name)}</strong></td>
                <td>${safeText(req.student_email)}</td>
                <td>${safeText(req.subject)}</td>
                <td>${req.description ? req.description.substring(0, 50) : '-'}${req.description && req.description.length > 50 ? '...' : ''}</td>
                <td>${formatDate(req.created_at)}</td>
                <td><span class="badge ${req.status === 'resolved' ? 'bg-success' : 'bg-warning'}">${req.status === 'resolved' ? 'تم الحل' : 'معلق'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error fetching help requests:', err);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">خطأ في تحميل طلبات المساعدة</td></tr>';
    }
}

/* =========================================
   MODAL LOGIC
   ========================================= */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
}

window.onclick = function (event) {
    if (event.target.classList.contains('admin-modal')) {
        event.target.classList.remove('show');
    }
};

/* =========================================
   FORM SUBMISSIONS
   ========================================= */

document.getElementById('courseForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('courseName').value;
    const type = document.getElementById('courseType').value;
    const price = document.getElementById('coursePrice').value;

    if (!isSupabaseReady()) {
        alert("خطأ: Supabase غير متصل.");
        return;
    }

    try {
        const { error } = await window.supabaseClient.from('courses').insert([{
            name: `${name} (${type})`,
            instructor: "Dr. Amira",
            price: price,
            status: "نشط"
        }]);

        if (error) throw error;

        await populateCoursesTable();
        closeModal('courseModal');
        this.reset();
        alert("تمت إضافة الكورس بنجاح!");
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء حفظ الكورس: " + (err.message || err));
    }
});

document.getElementById('addStudentForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('newStudentName').value;
    const email = document.getElementById('newStudentEmail').value;
    const phone = document.getElementById('newStudentPhone').value;
    const status = document.getElementById('newStudentStatus').value;

    if (!isSupabaseReady()) {
        alert("خطأ: Supabase غير متصل.");
        return;
    }

    try {
        const { error } = await window.supabaseClient.from('students').insert([{
            name,
            email,
            phone,
            courses: "0",
            status
        }]);

        if (error) throw error;

        await populateUsersTable();
        closeModal('addStudentModal');
        this.reset();
        alert(adminLang === 'ar' ? "تمت إضافة الطالب بنجاح!" : "Student added successfully!");
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء حفظ الطالب: " + (err.message || err));
    }
});

document.getElementById('newsForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('newsTitle').value;
    const content = document.getElementById('newsContent').value;
    const btn = this.querySelector('button');

    if (!isSupabaseReady()) {
        alert("خطأ: Supabase غير متصل.");
        return;
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "جاري الحفظ...";
        }

        const { error } = await window.supabaseClient.from('news').insert([{
            title,
            content,
            is_published: true
        }]);

        if (error) throw error;

        alert("تمت إضافة الخبر بنجاح!");
        closeModal('newsModal');
        this.reset();
        await fetchNews();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الإضافة: " + (err.message || err));
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "حفظ الخبر";
        }
    }
});

document.getElementById('projectForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;
    const link = document.getElementById('projectLink').value;
    const btn = this.querySelector('button');

    if (!isSupabaseReady()) {
        alert("خطأ: Supabase غير متصل.");
        return;
    }

    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = "جاري الحفظ...";
        }

        const { error } = await window.supabaseClient.from('projects').insert([{
            name,
            description,
            link
        }]);

        if (error) throw error;

        alert("تمت إضافة المشروع بنجاح!");
        closeModal('projectModal');
        this.reset();
        await fetchProjects();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الإضافة: " + (err.message || err));
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "حفظ المشروع";
        }
    }
});

/* =========================================
   DELETE FUNCTIONS
   ========================================= */

async function deleteNews(id) {
    if (!confirm("هل تريد حذف هذا الخبر؟")) return;
    try {
        const { error } = await window.supabaseClient.from('news').delete().eq('id', id);
        if (error) throw error;
        await fetchNews();
    } catch (err) {
        console.error(err);
        alert("فشل حذف الخبر");
    }
}

async function deleteProject(id) {
    if (!confirm("هل تريد حذف هذا المشروع؟")) return;
    try {
        const { error } = await window.supabaseClient.from('projects').delete().eq('id', id);
        if (error) throw error;
        await fetchProjects();
    } catch (err) {
        console.error(err);
        alert("فشل حذف المشروع");
    }
}

async function deleteCourse(id) {
    if (!confirm("هل تريد حذف هذا الكورس؟")) return;
    try {
        const { error } = await window.supabaseClient.from('courses').delete().eq('id', id);
        if (error) throw error;
        await populateCoursesTable();
    } catch (err) {
        console.error(err);
        alert("فشل حذف الكورس");
    }
}

async function deleteStudent(id) {
    if (!confirm("هل تريد حذف هذا الطالب؟")) return;
    try {
        const { error } = await window.supabaseClient.from('students').delete().eq('id', id);
        if (error) throw error;
        await populateUsersTable();
    } catch (err) {
        console.error(err);
        alert("فشل حذف الطالب");
    }
}

async function deleteMessage(id) {
    if (!confirm("هل تريد حذف هذه الرسالة؟")) return;
    try {
        const { error } = await window.supabaseClient.from('messages').delete().eq('id', id);
        if (error) throw error;
        await fetchMessages();
    } catch (err) {
        console.error(err);
        alert("فشل حذف الرسالة");
    }
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
};

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