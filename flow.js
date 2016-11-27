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

function allFinished(executionInfos) {
    return executionInfos.filter(function (value) {
        return value.finished;
    }).length === executionInfos.length;
}

function hasErrors(executionInfos) {
    return executionInfos.filter(function (value) {
        return value.error;
    }).length > 0;
}

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    if (operations.length === 0) {
        callback(null, null);

        return;
    }

    var operationsStack = operations.reverse();
    function serialCallback(error, result) {
        if (error || operationsStack.length === 0) {
            callback(error, result);

            return;
        }
        operationsStack.pop()(result, serialCallback);
    }
    operationsStack.pop()(serialCallback);
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
    if (items.length === 0) {
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

        if (error) {
            executionInfo.error = error;
        }

        results[executionInfo.index] = result;

        var nextExecutionInfo = getFirstNotStarted(executionInfos);
        if (nextExecutionInfo) {
            operation(nextExecutionInfo.value, internalCallback.bind(null, nextExecutionInfo));
            nextExecutionInfo.started = true;
        }

        if (!hasErrors(executionInfos) && allFinished(executionInfos)) {
            callback(null, results);
        }
    }

    for (var i = 0; i < Math.min(limit, executionInfos.length); i++) {
        operation(executionInfos[i].value, internalCallback.bind(null, executionInfos[i]));
        executionInfos[i].started = true;
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
