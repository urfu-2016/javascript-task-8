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
        operations[currentOperationIndex++](data || myCallback, myCallback);
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
    items.forEach(function (item, index) {
        setTimeout(function () {
            operation(item, function (err, data) {
                if (err) {
                    callback(err, result);

                    return;
                }
                var res;
                if ((res = rule(item, data))) {
                    if (Array.isArray(res)) {
                        insertElementsInArray(res, result, index);
                    } else {
                        result.splice(index, 0, res);
                    }
                }
                endedOperations++;
                if (endedOperations === items.length) {
                    callback(null, result);
                }
            });
        }, 0);
    });
}

function insertElementsInArray(res, array, index) {
    res.forEach(function (resItem, i) {
        array.splice(index + i, 0, resItem);
    });
}

function returnProcessedItem(item, processedItem) {
    return processedItem;
}

function returnItemIfProcessedItem(item, processedItem) {
    return processedItem ? item : undefined;
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
            runOperation(item, launchedOperations + endedOperations);
        }
    }

    function runOperation(item, index) {
        setTimeout(function () {
            operation(item, function (err, data) {
                if (err) {
                    callback(err, data);

                    return;
                }
                var res;
                if ((res = currentFunction(item, data))) {
                    if (Array.isArray(res)) {
                        res.forEach(function (resItem, i) {
                            result.splice(index + i, 0, resItem);
                        });
                    } else {
                        result.splice(index, 0, res);
                    }
                }
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
