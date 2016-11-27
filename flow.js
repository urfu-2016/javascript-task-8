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
    var currentIndex = 0;

    (function internalCallback(error, data) {
        if (!operations || currentIndex >= operations.length || error) {
            callback(error, data);
        } else {
            operations[currentIndex++](data || internalCallback, internalCallback);
        }
    }());
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
        setTimeout(function (args) {
            var callback = args.pop();
            var result = null;
            var error = null;
            try {
                result = func.apply(null, args);
            } catch (e) {
                error = e;
            }

            callback(error, result);
        }, 0, [].slice.call(arguments));
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
    items = (items || []).slice();
    var activeWorkersCount = 0;

    var result = [];
    var isExceptionRaised = false;

    function getInternalCallback(index) {
        return function internalCallback(error, data) {
            if (error || isExceptionRaised) {
                if (!isExceptionRaised) {
                    isExceptionRaised = true;
                    callback(error);
                }
            } else {
                result[index] = data;
                activeWorkersCount--;
                run();
            }
        };
    }

    function run() {
        while (activeWorkersCount < limit && items.length && !isExceptionRaised) {
            operation(items.pop(), getInternalCallback(items.length));
            activeWorkersCount++;
        }

        if (!items.length && !activeWorkersCount) {
            callback(null, result);
        }
    }

    run();
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
    exports.mapLimit(items, limit, operation,
        function (error, data) {
            callback(error, error ? null : items.filter(function (item, index) {
                return data[index];
            }));
        });
};
