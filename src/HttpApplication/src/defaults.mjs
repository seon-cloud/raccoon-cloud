export const DEFAULT_NAME = 'HttpApplication';
export const DEFAULT_PISTACHIO_NAME = 'HTTP';
export const DEFAULT_PORT = 8080;

/**
 * @function
 * @name DEFAULT_PAGE_ANSWER
 * @description Функция, которая подготавливает ответ для HTML страницы
 * @param {object} data функция с рендером страницы
 * @param {object} _errors массив ошибок (не используется)
 * @param {object} _meta метаданные (не используется)
 * @returns {string} рендер страницы
 * @public
 */
export const DEFAULT_PAGE_ANSWER = function(data, _errors, _meta) {
    return data;
};