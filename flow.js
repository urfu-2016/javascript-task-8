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
    if (!operations || operations.length === 0) {
        callback(null, []);
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
    var completedFunctionCount = 0;
    var errorCount = 0;
    var result = [];
    items.forEach(function (item, index) {
        operation(item, function (opIndex, err, data) {
            if (err) {
                callback(err);
            }
            if (errorCount > 0) {
                return;
            }
            result[opIndex] = data;
            completedFunctionCount++;
            if (completedFunctionCount === items.length) {
                callback(null, result);
            }
        }.bind(null, index));
    });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    var filteredItems = [];
    this.map(items, operation, function (err, data) {
        if (err) {
            callback(err);
        }
        filteredItems = items.filter(function (item, index) {
            return data[index];
        });
        callback(null, filteredItems);
    });
    // var completedFunctionCount = 0;
    // var result = [];
    // var timer = setInterval(function () {
    //     if (completedFunctionCount === items.length) {
    //         clearInterval(timer);
    //         result = items.filter(function (item, index) {
    //             return result[index] === true;
    //         });
    //         callback(null, result);
    //     }
    // }, 0);
    // items.forEach(function (item) {
    //     operation(item, function (err, data) {
    //         if (err) {
    //             clearInterval(timer);
    //             callback(err);
    //         } else {
    //             result[completedFunctionCount++] = data;
    //         }
    //     });
    // });
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
