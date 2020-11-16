/** Загружаем базовый класс приложения */
import { Application } from 'raccoon-sanctuary';
/** Загружаем константы.
 * DEFAULT_NAME - имя приложения по умолчанию
 * PISTACHIO_INDEX - индекс плаигна Pistachio
 */
import  { PISTACHIO_INDEX } from './src/constants.mjs';

 /** Подключаем вспомогательные функци/утилиты
 * preparePluginsOptions - функция подготовки опций плагинов
 */
import { prepareSuperOptions } from './src/utils.mjs';

/**
 * @class
 * @name HttpApplication
 * @description Класс, который реализует простое HTTP приложение
 * @extends Application
 * @author Dmitrii Shevelev<igrave1988@gmail.com>
 * @public
 */
export default class HttpApplication extends Application {

    #port

    /**
     * @name port
     * @description Гетер для свойства порта приложения
     * @returns {number} порт приложения
     * @memberof HttpApplication
     * @readonly
     * @public
     */
    get port() {
        return this.#port;
    }

    /**
     * @name pistachio
     * @description Гетер объекта фреймворка Pistachio
     * @memberof HttpApplication
     * @readonly
     * @public
     */
    get pistachio() {
        return this.plugins[PISTACHIO_INDEX];
    }

    /**
     * @method
     * @name start
     * @description Метод, который запускает HTTP приложение
     * @memberof HttpApplication
     * @public
     */
    start() {
        this.pistachio.start();
    }

    /**
     * @method
     * @name stop
     * @description Метод, который останавливает HTTP сервер
     * @memberof HttpApplication
     * @public
     */
    stop() {
        this.pistachio.stop();
    }

    /**
     * @method
     * @name prepareInstanceProperties 
     * @description Метод подготавливает свойста текущего инстанса объекта
     * @returs {void}
     * @memberof HttpApplication
     * @private
     */
    #prepareInstanceProperties() {
        if (this.pistachio) {
            this.#port = this.pistachio.port;
        }

        this.plugins.forEach(plugin => {
            plugin.registerApplication(this);
        });
    }

    /**
     * @constructor
     * @description Конструктор класса HTTP приложения
     * @param {object} options опции, которые необходимы для создания HTTP приожения
     * @memberof HttpApplication
     * @public
     */
    constructor(options) {
        const superOptions = prepareSuperOptions(options);
        super(superOptions);
        this.#prepareInstanceProperties();
    }
}