import { useEffect } from 'react';
import { APP_NAME } from '../utils/titleConfig';

/**
 * Custom hook to set the page title.
 * @param {string} title - The specific page or dynamic title segment.
 * @param {boolean} isDynamic - If true, formats as [Dynamic] | Page | App. Otherwise [Page] | App.
 */
export const usePageTitle = (title, isDynamic = false) => {
    useEffect(() => {
        if (!title) {
            document.title = APP_NAME;
            return;
        }

        if (isDynamic) {
            // title is already formatted or needs to be prepended
            document.title = `${title} | ${APP_NAME}`;
        } else {
            document.title = `${title} | ${APP_NAME}`;
        }
    }, [title, isDynamic]);
};

export default usePageTitle;
