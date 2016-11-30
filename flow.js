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
    var currentOperationIndex = 0;

    (function myCallback(error, data) {
        if (error || operations.length === currentOperationIndex) {
            callback(error, data);

            return;
        }

        if (data === undefined) {
            operations[currentOperationIndex++](myCallback);
        } else {
            operations[currentOperationIndex++](data, myCallback);
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
    runAsyncFunctions(items, operation, callback, returnProcessedItem);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    runAsyncFunctions(items, operation, callback, returnItemIfProcessedItem);
};

function runAsyncFunctions(items, operation, callback, rule) {
    var endedOperations = 0;
    var result = [];
    items.forEach(function (item) {
        setTimeout(function () {
            operation(item, function (err, data) {
                if (err) {
                    callback(err, result);

                    return;
                }
                endedOperations++;
                result = result.concat(rule(item, data));
                if (endedOperations === items.length) {
                    callback(null, result);
                }
            });
        }, 0);
    });
}

function returnProcessedItem(item, processedItem) {
    return processedItem;
}

function returnItemIfProcessedItem(item, processedItem) {
    return processedItem ? item : [];
}

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {
    return function (files, next) {
        setTimeout(function () {
            var temp = func(files);
            next(null, temp);
        }, 0);
    };
};

var currentFunction;

/**
 * Параллельная обработка элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.mapLimit = function (items, limit, operation, callback) {
    currentFunction = returnProcessedItem;
    runAsyncLimitFunctions(items, limit, operation, callback);
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
    currentFunction = returnItemIfProcessedItem;
    runAsyncLimitFunctions(items, limit, operation, callback);
};

function runAsyncLimitFunctions(items, limit, operation, callback) {
    var endedOperations = 0;
    var launchedOperations = 0;
    var result = [];
    launchMoreOperations();

    function launchMoreOperations() {
        while (launchedOperations < limit && items.length > launchedOperations + endedOperations) {
            var item = items[++launchedOperations + endedOperations - 1];
            runOperation(item);
        }
    }

    function runOperation(element) {
        setTimeout(function () {
            operation(element, function (err, data) {
                if (err) {
                    callback(err, data);

                    return;
                }
                result = result.concat(currentFunction(element, data));
                launchedOperations--;
                endedOperations++;
                launchMoreOperations();
                if (endedOperations === items.length) {
                    callback(null, result);
                }
            });
        }, 0);
    }
}
