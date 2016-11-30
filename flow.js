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
    var index = 0;
    var cb = function (error, result) {
        index++;
        if (error || index === operations.length) {
            callback(error, result);
        } else {
            operations[index](result, cb);
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
    var count = items.length;
    var errorCallback = false;
    var results = [];
    var cb = function (index, err, result) {
        if (err) {
            errorCallback = true;

            return callback(err);
        }
        if (errorCallback) {
            return;
        }
        count--;
        results[index] = result;
        if (count === 0) {
            return callback(null, results);
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
    exports.map(items, operation, function (err, result) {
        if (err) {
            callback(err);
        }
        callback(null, items.filter(function (item, index) {
            return result[index];
        }));
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 */

exports.makeAsync = function (func) {
    return function () {
        var args = [].slice.call(arguments);
        var callback = args.pop();
        setTimeout(function () {
            try {
                callback(null, func.apply(null, args));
            } catch (error) {
                callback(error);
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
exports.mapLimit = function (items, limit, operation, callback) {
    callback(new Error('Функция mapLimit не реализована'));
};

/**
 * Параллельная фильтрация элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.filterLimit = function (items, limit, operation, callback) {
    callback(new Error('Функция filterLimit не реализована'));
};
