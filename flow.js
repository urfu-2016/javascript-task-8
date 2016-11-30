'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = true;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    if (!operations || operations.length === 0) {
        callback(null, null);
    } else {
        var cb = function (error, data) {
            if (error || operations.length === 0) {
                return callback(error, data);
            }
            var operation = operations.shift();
            operation(data, cb);
        };
        operations.shift()(cb);
    }
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    var values = [];
    var hasError = false;
    var startedOperations = 0;
    var finishedOperations = 0;
    var cb = function (index) {
        return function (error, data) {
            if (error || hasError) {
                if (!hasError) {
                    hasError = true;
                    callback(error);
                }
            } else {
                values[index] = data;
                finishedOperations++;
                if (finishedOperations === items.length) {
                    callback(null, values);
                }
            }
        };
    };
    var launchOperations = function () {
        while (startedOperations < items.length) {
            operation(items[startedOperations], cb(startedOperations));
            startedOperations++;
        }
        if (finishedOperations < items.length) {
            setTimeout(launchOperations, 0);
        }
    };
    launchOperations();
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.map(items, operation, function (error, data) {
        if (error) {
            callback(error);
        } else {
            var filteredItems = items.filter(function (item, index) {
                return data[index];
            });
            callback(null, filteredItems);
        }
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
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
