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
    if (!operations.length) {
        callback(null, null);

        return;
    }
    var index = 0;

    function localCallback(error, data) {
        if (index === operations.length - 1) {
            callback(null, data);

            return;
        }
        if (error) {
            callback(error, null);

            return;
        }
        index++;
        operations[index](data, localCallback);
    }

    operations[index](localCallback);
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

        try {
            callback(null, func.apply(null, args));
        } catch (error) {
            callback(error, null);
        }
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
    if (!items.length) {
        callback(null, []);

        return;
    }

    var result = [];
    var wasError = false;
    var finished = 0;
    var next = 0;

    function localCallback(ind, error, data) {
        finished++;
        if (wasError) {
            return;
        }
        if (error) {
            callback(error, null);
            wasError = true;

            return;
        }
        result[ind] = data;
        if (finished === items.length) {
            callback(null, result);

            return;
        }

        if (next < items.length) {
            operation(items[next],
                localCallback.bind(null, next));
            next++;
        }
    }
    var currentLimit = Math.min(items.length, limit);
    next = currentLimit;

    for (var i = 0; i < currentLimit; i++) {
        operation(items[i], localCallback.bind(null, i));
    }
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
            callback(error, null);

            return;
        }
        var result = items.filter(function (item, index) {
            return data[index];
        });
        callback(null, result);
    });
};
