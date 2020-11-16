# raccoon-cloud
Main platform module
# HttpApplication
Класс дял разработки HTTP серверов на базе фреймворка Raccoon. Может быть использован как универсальный фреймворк для разработки любых по сложности сервисов.
Является обёрткой для библиотеки Pistachio и не может работать в отрыве от неё.
Так же как и Pistacio полностью совместим с middlewares фреймворка ExpressJS.
## Общая техническая информация
* Родительский класс: Application
* Версия: 0.1.0
* Плагины по умолчанию: Pistachio, Archibald
## Описание
HttpApplication - класс приложения, которое отдаёт/принимает запросы через HTTP, является наследником базового класса Application.
HttpAppilcation в основе своей работы использует два плагина по умолчанию:
* Pistachio - плагин для работы с HTTP запросами.
* Archibaldd - плагин для работы с шаблонизатором Pug.
Является базовым классом для работы со всеми сервисами Seon.
## Важно! Преде использованием прочитать
Как и весь фреймворк Raccoon класс HttpApplication только начал разрабатываться. Он может быть использован для написания реальных приложений и web-сервисов (в том числе и с server side рендером).
Следует помнить, что API продукта может меняться с выходом новых версий, а сам HttpApplication будет обрастать плагинами и возможностями.
## Пример использования
```js
// Импотируем стандартный middlware CORS от ExpressJS
import cors from 'cors';
// Импотируем body parser middleware от ExpressJS
import bodyParser from 'body-parser';
// Импотируем middleware для отдачи статики от ExpressJS
import serveStatic from 'serve-static';
// Импортируем класс HttpApplication
import { HttpApplication } from 'raccoon-cloud';
// Импортируем библиотеку для работы с путями из стандартной
// библиотеки NodeJS
import path from 'path';
// Собираем путь до папки со статкой
const servepath = path.join('./', 'public');
// Импортирум плагин Archibald (для создания дополнительного экземпляра)
import { Archibald } from 'raccoon-ark';

// Создаем экземпляр HttpApplication с настройками
const app = new HttpApplication({
    // Имя приложения
    name: 'examples',
    // Порт приложения
    port: 5050,
    // Middleware общего уровня, совместимы с ExpressJS
    uses: [ serveStatic(servepath), cors(), bodyParser.json() ],
    // Задаём пакеты, которые должны быть добавлены во все плагины
    packages: { cors },
    // Задаём список кастомных плагинов, которые треубется зарегистрировать
    // в экземпляре приложения
    plugins: [
        { 
            plugin: Archibald, 
            options: { name: 'Archibald2' }
        }
    ],
    // Задаём пути до шпаблонов страниц 
    templates: {
        index: './templates/index.pug'
    },
    // Задаём роутинг для обработки в режиме API сервера
    api: {
        // Задаём маршруты и их обработчики
        routes: {
            '/test': 'testHandler'
        },
        // Задаём фукцнии обработчики маршрутов API
        handlers: {
            testHandler: function() {
                return { msg: 'Test' };
            }
        }
    },
    // Задаём роутинг для обработки в режиме server side render
    pages: {
        // Задаём маршруты и их обработчики
        routes: {
            '/test': 'pagesHandler'
        },
        // Задаём функции обработчики маршрутов страниц
        handlers: {
            pagesHandler(req) {
                return this.call.Archibald.compiled.index();
            }
        }
    }
});
// Запускаем сервер приложения
app.start();
```