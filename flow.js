'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = false;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    // console.info(operations, callback);
    if (operations.length === 0) {
        callback(null, []);

        return;
    }
    var index = 0;
    var cb = function (err, data) {
        if (err || index === operations.length - 1) {
            callback(err, data);
        } else {
            operations[++index](data, cb);
        }
    };
    operations[index](cb);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */

exports.map = function (items, operation, callback) {
    if (!items.length) {
        callback(null, []);

        return;
    }
    var countErrors = null;
    var countStart = items.length;
    var countEnd = 0;
    var result = [countStart];
    var cb = function (index, err, data) {
        if (err || countErrors) {
            countErrors++;
            callback(err);

            return;
        }
        countEnd++;
        result[index] = data;
        if (countStart === countEnd) {
            return callback(null, result);
        }
    };

    items.forEach(function (item, index) {
        operation(item, cb.bind(null, index));
    });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.map(items, operation, function (err, data) {
        if (err) {
            callback(err);

            return;
        }
        callback(null, items.filter(function (item, index) {
            return data[index];
        }));
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 */

 // Делаем из JSON.parse асинхронную
exports.makeAsync = function (func) {
    // console.info(func);
    return function () {
        var args = [].slice.call(arguments);
        var cb = args.pop();
        setTimeout(function () {
            try {
                cb(null, func.apply(null, args));
            } catch (e) {
                cb(e);
            }
        }, 0);
    };
};

/**
 * Параллельная обработка элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
// exports.mapLimit = function (items, limit, operation, callback) {
//     // callback(new Error('Функция mapLimit не реализована'));
// };

/**
 * Параллельная фильтрация элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
// exports.filterLimit = function (items, limit, operation, callback) {
//     // callback(new Error('Функция filterLimit не реализована'));
// };
