/* eslint-disable linebreak-style  */
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

    operations.reverse();

    function serialCallback(error, result) {
        if (error || !operations.length) {
            callback(error, result);

            return;
        }
        operations.pop()(result, serialCallback);
    }
    operations.pop()(serialCallback);
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
    if (!items.length) {
        callback(null, []);

        return;
    }

    var results = [];
    var errorInChain = false;
    var totalCount = items.length;
    var executionInfos = items.map(function (value, index) {
        return {
            'value': value,
            'index': index
        };
    });
    executionInfos.reverse();
    var finishedInfos = [];

    function internalCallback(executionInfo, error, result) {
        finishedInfos.push(executionInfo);

        if (errorInChain) {
            return;
        }

        if (error) {
            callback(error);
            errorInChain = true;

            return;
        }

        results[executionInfo.index] = result;

        if (executionInfos.length > 0) {
            var nextExecutionInfo = executionInfos.pop();
            operation(nextExecutionInfo.value, internalCallback.bind(null, nextExecutionInfo));
        }

        if (finishedInfos.length === totalCount) {
            callback(null, results);
        }
    }

    for (var i = 0; i < Math.min(limit, totalCount); i++) {
        var executionInfo = executionInfos.pop();
        operation(executionInfo.value, internalCallback.bind(null, executionInfo));
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
    exports.mapLimit(items, limit, operation, function (error, results) {
        if (error) {
            callback(error);

            return;
        }

        callback(null, items.filter(function (_, index) {
            return results[index];
        }));
    });
};
