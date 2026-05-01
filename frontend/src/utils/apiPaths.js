export const API_PATHS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        ADMIN_SIGNUP: '/api/auth/admin-signup',
    },
    ADMIN: {
        TEACHERS: '/api/admin/teachers',
        CLASSES: '/api/admin/classes',
        ASSIGNMENTS: '/api/admin/assignments',
        ASSIGN_SUBJECT: '/api/admin/assign-subject',
        STUDENTS_LIST: '/api/admin/students',
    },
    // Primary routes as strings for backward compatibility
    STUDENTS: '/api/students',
    LEAVES: '/api/leaves',
    ATTENDANCE: '/api/attendance',
    TIMETABLE: '/api/timetable',

    // Specific route helpers
    STUDENT: {
        BY_ID: (id) => `/api/students/${id}`,
        LEAVES: (id) => `/api/students/${id}/leaves`,
        ATTENDANCE: (id) => `/api/students/${id}/attendance`,
    },
    TEACHER: {
        ASSIGNMENTS: (id) => `/api/teachers/${id}/assignments`,
        LEAVES: (id) => `/api/teachers/${id}/leaves`,
        ATTENDANCE: (id) => `/api/teachers/${id}/attendance`,
        STUDENTS: (id) => `/api/teachers/${id}/students`,
        TEACHERS_LIST: (id) => `/api/teachers/${id}/teachers`,
        CLASSES: (id) => `/api/teachers/${id}/classes`,
        SUBJECTS: (id) => `/api/teachers/${id}/subjects`,
    },
    ATTENDANCE_DETAILS: {
        BY_ID: (id) => `/api/attendance/${id}`,
    },
    LEAVE_DETAILS: {
        BY_ID: (id) => `/api/leaves/${id}`,
        BY_USER: (id) => `/api/leaves/${id}/leaves`,
        UPDATE_STATUS: (id) => `/api/leaves/${id}/status`,
    },
    STATS: {
        OVERALL: '/api/stats/overall',
        STUDENT: '/api/stats/student',
        TEACHER: '/api/stats/teacher',
    }
};
