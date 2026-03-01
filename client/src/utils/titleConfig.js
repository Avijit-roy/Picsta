export const APP_NAME = 'Picsta';

export const ROUTE_TITLE_MAP = {
    '/login': 'Login',
    '/register': 'Register',
    '/verify-email': 'Verify Email',
    '/verify-email-pending': 'Verify Email Pending',
    '/forgot-password': 'Reset Password',
    '/new-password': 'New Password',
    '/main': 'Home',
};

export const getTitle = (path) => {
    return ROUTE_TITLE_MAP[path] || 'Page Not Found';
};
