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
    if (operations.length) {
        var operationIndex = 0;
        var myCallback = function (error, data) {
            if (error || operationIndex === operations.length) {
                callback(error, data);
            } else {
                operations[operationIndex++](data, myCallback);
            }
        };
        operations[operationIndex++](myCallback);
    } else {
        callback(null, null);
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
 * @returns {Function} func
 */
exports.makeAsync = function (func) {
    return function () {
        setTimeout(function (args) {
            var callback = args.pop();
            try {
                callback(null, func.apply(null, args));
            } catch (error) {
                callback(error, null);
            }
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
    if (items.length === 0) {
        callback(null, []);

        return;
    }

    var operations = items.map(function (item) {
        return operation.bind(null, item);
    });

    var operationIndex = 0;
    var finishIndex = 0;
    var isError = false;

    var operationsBeyondLimit = operations.splice(limit);

    var resultData = [];

    var myCallback = function (index, error, data) {
        if (error && !isError) {
            callback(error, data);
            isError = true;
        } else {
            resultData[index] = data;

            var _operation = operationsBeyondLimit.shift();
            if (_operation) {
                _operation(myCallback.bind(null, operationIndex));
                operationIndex++;
            }

            if (++finishIndex === operationIndex) {
                callback(error, resultData);
            }
        }
    };

    operations.forEach(function (_operation) {
        _operation(myCallback.bind(null, operationIndex));
        operationIndex++;
    });

    // for (var i = 0; i < operations.length; i++) {
        // operations[i](myCallback.bind(null, operationIndex));
        // operationIndex++;
    // }
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
        } else {
            callback(null, items.filter(function (item, i) {
                return data[i];
            }));
        }
    });
};
