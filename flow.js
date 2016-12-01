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
        throw new TypeError('Empty parameters');

        return;
    }
    var currentOperationIndex = 0;
    operations[0](interiorCallback);
    function interiorCallback(error, data) {
        if (error || currentOperationIndex === operations.length - 1) {
            callback(error, data);

            return;
        }
        operations[++currentOperationIndex](data, interiorCallback);
    }
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    this.mapLimit(items, Infinity, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    this.filterLimit(items, Infinity, operation, callback);
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
            } catch (err) {
                callback(err);
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
    var completedFunctionCount = 0;
    var hasError = false;
    var result = [];
    var startedOperationCount = 0;
    if (!items.length) {
        callback(null, []);

        return;
    }
    function interiorCallback(operationIndex, err, data) {
        if (hasError) {
            return;
        }
        if (err) {
            hasError = true;
            callback(err);

            return;
        }
        result[operationIndex] = data;
        completedFunctionCount++;
        if (completedFunctionCount === items.length) {
            callback(null, result);

            return;
        }
        if (startedOperationCount < items.length) {
            operation(items[startedOperationCount],
                interiorCallback.bind(null, startedOperationCount));
            startedOperationCount++;
        }
    }
    for (var i = 0; i < Math.min(items.length, limit); i++) {
        operation(items[i], interiorCallback.bind(null, i));
        startedOperationCount++;
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
    var filteredItems = [];
    this.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);

            return;
        }
        filteredItems = items.filter(function (item, index) {
            return data[index];
        });
        callback(null, filteredItems);
    });
};
