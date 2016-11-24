/* eslint-disable no-shadow */
'use strict';

// Модуль для работы с путями до файлов и папок
var path = require('path');

// Модуль для работы с файловой системой
var fs = require('fs');

var flow = require('./flow.js');
var directory = './data/';

// Делаем из JSON.parse асинхронную
var jsonParseAsync = flow.makeAsync(JSON.parse);

// Последовательно выполняем операции
flow.serial([
    // Вначале читаем список файлов директории
    // `next` – классический колбэк всегда принимает два аргумента:
    //    - `error` - ошибка
    //    - `data` - результат
    function (next) {
        // Часть методов в Node.js уже умеет принимать такие специальные колбэки
        fs.readdir(directory, function (error, data) {
            next(error, data);
        });
    },

    // В качестве первого аргумента следующей функции передаётся результат предыдущей функции
    // Этот аргумент не обязательный (смотри первую функцию)
    flow.makeAsync(function (files) {
        return files.map(function (dir) {
            // Работать с файловыми путями правильнее через модуль path
            return path.join(directory, dir);
        });
    }),

    // Фильтруем пустые файлы
    function (files, next) {
        flow.filter(files, function (file, next) {
            fs.stat(file, function (err, stat) {
                if (err) {
                    return next(err);
                }

                // Первый аргумент соответствует ошибке
                next(null, stat.size > 0);
            });
        }, next);
    },

    // Читаем содержимое файлов
    function (files, next) {
        flow.map(files, fs.readFile, next);
    },

    // Парсим содержимое файлов
    function (files, next) {
        flow.map(files, jsonParseAsync, next);
    }

// Результат последней функции передаётся в этот (главный) колбэк
], function (error, contents) {
    // Если в одной из асинхронных операции произошла ошибка – выводим её
    if (error) {
        console.error(error.message);
        console.error(error.stack);

        return;
    }

    // Высчитываем суммарную стоимость
    var total = contents.reduce(function (sum, content) {
        return sum + content.price;
    }, 0);

    console.info(total);
});

if (flow.isStar) {
    // Сделаем тоже самое, что и в предыдущем примере, но с новыми функциями

    // Последовательно выполняем операции
    flow.serial([
        // Читаем директорию
        function (next) {
            fs.readdir(directory, next);
        },

        // Формируем пути до файлов
        flow.makeAsync(function (files) {
            return files.map(function (dir) {
                // Работать с файловыми путями правильнее через модуль path
                return path.join(directory, dir);
            });
        }),

        // Фильтруем пустые файлы
        function (files, next) {
            // Ограничиваем одновременное выполнение функции fs.stat
            flow.filterLimit(files, 2, function (file, next) {
                fs.stat(file, function (err, stat) {
                    next(err, stat && stat.size > 0);
                });
            }, next);
        },

        // Читаем содержимое файлов
        function (files, next) {
            // Ограничиваем одновременное выполнение функции fs.readFile
            flow.mapLimit(files, 2, fs.readFile, next);
        },

        // Парсим содержимое файлов
        function (files, next) {
            flow.map(files, jsonParseAsync, next);
        },

        // Вычисляем total
        flow.makeAsync(function (contents) {
            return contents.reduce(function (sum, content) {
                return sum + content.price;
            }, 0);
        })

    ], function (error, total) {
        if (error) {
            console.error(error.message);
            console.error(error.stack);

            return;
        }

        console.info(total);
    });
}
