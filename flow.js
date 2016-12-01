/* eslint-disable linebreak-style  */
'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = true;

function getFirstNotStarted(executionInfos) {
    for (var i = 0; i < executionInfos.length; i++) {
        if (!executionInfos[i].started) {
            return executionInfos[i];
        }
    }

    return null;
}

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

    function serialCallback(error, result) {
        if (error || !operations.length) {
            callback(error, result);

            return;
        }
        operations.shift()(result, serialCallback);
    }
    operations.shift()(serialCallback);
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

function executeAsync(func) {
    var args = [].slice.call(arguments, 1);
    var callback = args.pop();
    setTimeout(function () {
        try {
            callback(null, func.apply(null, args));
        } catch (error) {
            callback(error);
        }
    }, 0);
}

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {
    return executeAsync.bind(null, func);
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
    var executionInfos = items.map(function (value, index) {
        return {
            'value': value,
            'index': index,
            'started': false,
            'finished': false,
            'error': null
        };
    });

    function internalCallback(executionInfo, error, result) {
        executionInfo.finished = true;

        if (executionInfos.some(function (info) {
            return info.error;
        })) {
            return;
        }

        if (error) {
            executionInfo.error = error;
            callback(error);
        }

        results[executionInfo.index] = result;

        var nextExecutionInfo = getFirstNotStarted(executionInfos);
        if (nextExecutionInfo) {
            operation(nextExecutionInfo.value, internalCallback.bind(null, nextExecutionInfo));
            nextExecutionInfo.started = true;
        }

        if (executionInfos.every(function (info) {
            return info.finished;
        })) {
            callback(null, results);
        }
    }

    executionInfos.slice(0, limit).forEach(function (executionInfo) {
        operation(executionInfo.value, internalCallback.bind(null, executionInfo));
        executionInfo.started = true;
    });
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
