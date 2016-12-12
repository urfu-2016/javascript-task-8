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
    if (!items.length) {
        callback(null, []);

        return;
    }
    var result = [];
    var wasError = false;
    var count = 0;
    function localCallback(ind, error, data) {
        count++;
        if (wasError) {
            return;
        }
        if (error) {
            callback(error, null);
            wasError = true;

            return;
        }
        result[ind] = data;
        if (count === items.length) {
            callback(null, result);
        }
    }

    items.forEach(function (item, index) {
        operation(item, localCallback.bind(null, index));
    });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.map(items, operation, function (error, results) {
        if (error) {
            callback(error, null);

            return;
        }
        var result = items.filter(function (item, index) {
            return results[index];
        });
        callback(null, result);
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
