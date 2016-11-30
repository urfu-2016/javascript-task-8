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
    }
    var index = 0;
    var cb = function (err, data) {
        index++;
        if (err || index === operations.length) {
            callback(err, data);
        }
        // console.info(data);
        operations[index](data, cb);
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
    // console.info(items, operation, callback);
    var countErrors = 0;
    var countSrart = items.length;
    var countEnd = 0;
    var result = [countSrart];
    var cb = function (index, err, data) {
        if (err) {
            countErrors++;

            return callback(err);
        }
        if (countErrors > 0) {
            return;
        }
        countEnd++;
        result[index] = data;
        if (countSrart === countEnd) {
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
    // console.info(items, operation, callback);
    exports.map(items, operation, function (err, data) {
        if (err) {
            callback(err);
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
        var callback = args.pop();
        setTimeout(function () {
            try {
                callback(null, func.apply(null, args));
            } catch (e) {
                console.info(e);
                callback(e);
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
