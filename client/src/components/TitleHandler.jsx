import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_NAME, ROUTE_TITLE_MAP } from '../utils/titleConfig';

const TitleHandler = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        const title = ROUTE_TITLE_MAP[path];

        if (title) {
            document.title = title === 'Home' ? APP_NAME : `${title} | ${APP_NAME}`;
        } else if (path === '/') {
            document.title = APP_NAME;
        } else {
            document.title = `Page Not Found | ${APP_NAME}`;
        }
    }, [location]);

    return null;
};

export default TitleHandler;
