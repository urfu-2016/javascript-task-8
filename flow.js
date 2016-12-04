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
        callback(null, null);

        return;
    }

    var index = 0;
    var serialCallback = function (error, result) {
        if (error) {
            callback(error, null);

            return;
        }
        index++;
        if (index === operations.length) {
            callback(null, result);

            return;
        }
        operations[index](result, serialCallback);
    };

    operations[index](serialCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    exports.mapLimit(items, null, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.filterLimit(items, null, operation, callback);
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} func – функция
 */
exports.makeAsync = function (func) {
    return function () {
        var wrapperFunction = function (args) {
            var funcArgs = args.slice(0, args.length - 1);
            var callback = args[args.length - 1];
            try {
                var result = func.apply(null, funcArgs);
                callback(null, result);
            } catch (err) {
                callback(err, null);
            }
        };

        var args = [].slice.call(arguments);
        setTimeout(wrapperFunction, 0, args);
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
    if (!items || items.length === 0) {
        callback(null, []);

        return;
    }

    var results = new Array(items.length);
    var fillingResultCells = 0;
    var calledWorkersCount = 0;
    var wasError = false;

    var mapCallback = function (currentWorkerIndex, error, result) {
        if (error) {
            if (!wasError) {
                callback(error, null);
                wasError = true;
            }

            return;
        }

        results[currentWorkerIndex] = result;
        fillingResultCells++;

        if (fillingResultCells === items.length && !wasError) {
            callback(null, results);

            return;
        }

        if (calledWorkersCount < items.length) {
            callNewWorker(calledWorkersCount);
        }
    };

    function callNewWorker(nextIndex) {
        calledWorkersCount++;
        operation(items[nextIndex], mapCallback.bind(null, nextIndex));
    }

    var i = 0;
    while ((!limit || i < limit) && i < items.length) {
        callNewWorker(i);
        i++;
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
    if (!items || items.length === 0) {
        callback(null, []);

        return;
    }

    var filterCallback = function (error, result) {
        if (error) {
            callback(error, null);

            return;
        }
        var filterResult = items.filter(function (item, i) {
            return result[i];
        });
        callback(null, filterResult);
    };

    exports.mapLimit(items, limit, operation, filterCallback);
};
