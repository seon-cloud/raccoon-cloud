/** Импортируем значения по умолчанию
 * DEFAULT_NAME - имя по усмолчанию приложения
 * DEFAULT_PISTACHIO_NAME - имя плагина фреймворка по умолчанию
 * DEFAULT_PORT - порт HTTP сервера по умолчанию */
import { 
    DEFAULT_NAME,
    DEFAULT_PISTACHIO_NAME,
    DEFAULT_PORT,
    DEFAULT_PAGE_ANSWER
} from './defaults.mjs';
/** Импортируем значение констант
 * OPTIONS_FIELDS - словарь полей опций */
import {
    OPTIONS_FIELDS,
    PAGE_BUILDER_NAME,
} from './constants.mjs';

import { Archibald, Pistachio } from 'raccoon-ark';

/**
 * @function
 * @name checkHasByKey
 * @description Функция, которая возвращает результат проверки наличия маршрутов и
 *              обработчиков по заданному ключу
 * @param {string} key имя ключа в объете опций
 * @param {object} options объект опций
 * @returns {boolean} результат проверки
 * @private 
 */
const checkHasByKey = (key, options) => {
    let result;
    const hasKey = options.hasOwnProperty(key);
    if (hasKey) {
        result = ((options[key]?.routes && options[key]?.handlers) ||
                    (options[key]?.errors && options[key]?.handlers))
            ? true
            : false;
    } else {
        result = false;
    }
    return result;
};

/**
 * @function
 * @name getCorrectApiRoutes
 * @description Функция, которая готови корректный объект маршрутов для API
 * @param {object} routes объект с маршрутами для API
 * @returns {object} объект с маршрутами API с исправленными URL
 * @private 
 */
const getCorrectApiRoutes = routes => {
    const apiRoutes = {};
    Object.keys(routes).forEach(route => {
        apiRoutes[`/api${route}`] = routes[route];
    });
    return apiRoutes;
};

/**
 * @function
 * @name getFromApiAndPages
 * @description Функция которая формирует правильные опции для Pistachio 
 *              из api и pages объектов опций приложения 
 * @param {object} options объект опций приложения
 * @returns {object} объект корректных опций для Pistachio
 * @private
 */
const getFromApiAndPages = options => {
    let actions = {};
    let routes = {};
    let errors = {};
    let answers = {};
    const hasApi = checkHasByKey(OPTIONS_FIELDS.API, options);
    const hasPages = checkHasByKey(OPTIONS_FIELDS.PAGES, options);

    if (hasApi) {
        const { api } = options;
        actions = { ...actions, ...api.handlers }; 
        if (api?.routes) {
            routes = { ...routes, ...getCorrectApiRoutes(api.routes) };
        }
        if (api?.errors) {
            errors = { ...errors, ...api.errors };
        }
    }

    if (hasPages) {
        const { pages } = options;

        /** Небольшой хак, для того, чтобы в обработчиках страниц не было нужно
         * возвращать JSON объект (его требует Pistachio для того, чтобы в ответе задать
         * заголовок для возвращаемого типа).
         * Что оно делает - перебирает все обработчики страниц и декарирует их перед
         * добавлением в объект action функцией, которая возвращает нужный объект.
         * Это единственный способ сделать это без доработки Pistachio, является
         * скорее единичным случаем, частой практикой.
         */
        Object.keys(pages.handlers).forEach(hName => {
            actions[hName] = function(req, res) {
                const binded = pages.handlers[hName].bind(this);
                return { data: binded(req, res),  headers: { 'Content-Type': 'text/html; charset=utf-8'} };
            }
        });

        if (pages?.routes) {
            routes = { ...routes, ...pages.routes };
            Object.keys(pages.routes).forEach(url => {
                answers[url] = PAGE_BUILDER_NAME;
            });
        }
        if (pages?.errors) {
            errors = { ...errors, ...pages.errors };
        }
    }

    return { actions, routes, errors, answers };
};

/**
 * @function
 * @name preparePistachioOptions
 * @description Функция, которая из объекта опций приложения формирует
 *              объект опций плагина Pistachio
 * @param {object} options объект опций приложения
 * @returns {object} объект опция для плагина Pistachio
 * @private 
 */
const preparePistachioOptions = options => {
    const name = `${(options?.name) ? options.name : DEFAULT_NAME}_${DEFAULT_PISTACHIO_NAME}`;
    
    const port = options?.port
        ? options.port
        : DEFAULT_PORT;

    const {
        routes,
        actions,
        errors,
        answers
    } = getFromApiAndPages (options);


    actions[PAGE_BUILDER_NAME] = DEFAULT_PAGE_ANSWER;

    const pistachioOption = {
        name,
        port,
        actions,
        answers,
        errors,
        routes
    };

    if (options?.uses) {
        pistachioOption.uses = options.uses;
    }

    return pistachioOption;
};

/**
 * @function
 * @name prepareArchibaldOptions
 * @description
 * @param {object} options 
 * @returns {object}
 * @private
 */
const prepareArchibaldOptions = options => {
    const archibaldOptions = {};
    const field = OPTIONS_FIELDS.TEMPLATES;
    if (options.hasOwnProperty(field)) {
        archibaldOptions[field] = options[field];
    }
    return archibaldOptions;
};

/**
 * @function
 * @name preparePluginsOptions
 * @description Функция, которая подгатавливает опции плагинов на основе
 *              опций приложения
 * @param {object} options опции приложения
 * @returns {object} объект опций плагинов
 * @public
 */
const preparePluginsOptions = options => {
    const pluginsOptions = {};

    pluginsOptions.Pistachio = preparePistachioOptions(options);
    pluginsOptions.Archibald = prepareArchibaldOptions(options);
    Object.keys(pluginsOptions).forEach(opt => {
        if (options?.packages) {
            pluginsOptions[opt].packages = options.packages;
        }
    });

    const additionalsPlugins = (options?.plugins)
        ? (options.plugins)
        : undefined

    return { pluginsOptions, additionalsPlugins };
};


/** 
 * @function
 * @name prepareSuperOptions
 * @description Функция, которая готовит объект для инициализации 
 *              родительского класса
 * @param   {object} options объект опций
 * @returns {object} объект опций для инициализации родителя
 * @public
 */
export const prepareSuperOptions = (options) => {
    const name = options?.name ? options.name : DEFAULT_NAME;
    const plugins = [Pistachio, Archibald];
    const { pluginsOptions, additionalsPlugins } = preparePluginsOptions(options);
    return { name, plugins, pluginsOptions, additionalsPlugins };
};
