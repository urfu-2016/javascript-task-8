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
        var index = 0;
        var cb = function (error, data) {
            index++;
            if (error || operations.length === index) {
                return callback(error, data);
            }
            operations[index](data, cb);
        };
        operations[index](cb);
    }
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    exports.mapLimit(items, Infinity, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.filterLimit(items, Infinity, operation, callback);
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
    if (items.length === 0) {
        callback(null, []);

        return;
    }
    var values = [];
    var hasError = false;
    var activeOperations = 0;
    var startedOperations = 0;
    var launchOperations = function (cb) {
        while (startedOperations < items.length && activeOperations < limit) {
            operation(items[startedOperations], cb(startedOperations));
            startedOperations++;
            activeOperations++;
        }
    };
    var localCallback = function (index) {
        return function (error, data) {
            if (error || hasError) {
                if (!hasError) {
                    hasError = true;
                    callback(error);
                }
            } else {
                values[index] = data;
                activeOperations--;
                if (startedOperations === items.length && !activeOperations) {
                    callback(null, values);
                } else {
                    launchOperations(localCallback);
                }
            }
        };
    };
    launchOperations(localCallback);
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
    exports.mapLimit(items, limit, operation, function (error, data) {
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
