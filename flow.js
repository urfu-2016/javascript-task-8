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
    var length = operations.length;
    if (!length) {
        callback(new SyntaxError('\'operations\' must not be empty'));

        return;
    }
    var index = 0;
    var next = function (err, data) {
        if (length === index || err) {
            callback(err, data);
        } else {
            operations[index++](data, next);
        }
    };
    operations[index++](next);
};

/**
 * Паралельное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} callback
 */
var parallel = function (operations, limit, callback) {
    var length = operations.length;
    var nextOperations = operations.splice(limit);
    var result = [];
    var processId = 0;
    var completedProcess = 0;
    var error = null;
    var next = function (id) {
        return function (err, data) {
            if (err) {
                error = error || err;
            } else {
                result[id] = data;
            }
            completedProcess++;
            var nextOperation = nextOperations.shift();
            if (nextOperation) {
                nextOperation(next(processId++));
            }
            if (completedProcess === length) {
                callback(error, result);
            }
        };
    };
    operations.forEach(function (operation) {
        operation(next(processId++));
    });
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
        setTimeout(function (args) {
            var callback = args.pop();
            try {
                callback(null, func.apply(null, args));
            } catch (err) {
                callback(err);
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
    if (!items.length) {
        callback(null, []);

        return;
    }
    var operations = items.map(function (item) {
        return function (cb) {
            operation(item, cb);
        };
    });
    parallel(operations, limit, callback);
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
    this.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);
        } else {
            data = items.filter(function (item, index) {
                return data[index];
            });
            callback(null, data);
        }
    });
};
