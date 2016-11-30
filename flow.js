'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = true;

var WORKER_SPAWN_TIMEOUT = 10;

function callOperation(operation, result, callback) {
    if (operation.length === 2) {
        operation(result, callback);
    } else {
        operation(callback);
    }
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

    var currentIndex = 0;
    var localCallback = function (error, result) {
        if (error) {
            callback(error);

            return;
        }

        currentIndex++;
        if (currentIndex === operations.length) {
            callback(error, result);

            return;
        }

        callOperation(operations[currentIndex], result, localCallback);
    };

    callOperation(operations[currentIndex], null, localCallback);
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
    var asyncFunc = function () {
        setTimeout(function (args) {
            var callback = args.pop();

            try {
                callback(null, func.apply(global, args));
            } catch (error) {
                callback(error);
            }
        }, 0, Array.prototype.slice.call(arguments));
    };

    Object.defineProperty(asyncFunc, 'length', {
        value: func.length + 1,
        'writable': false
    });

    return asyncFunc;
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
    }

    var activeWorkersCount = 0;
    var results = [];
    var errorHappened = false;
    var workersStarted = 0;
    var localCallback = function (index) {
        return function (error, result) {
            if (error || errorHappened) {
                if (!errorHappened) {
                    errorHappened = true;
                    callback(error);
                }

                return;
            }

            results[index] = result;
            activeWorkersCount--;
            if (activeWorkersCount === 0 && workersStarted === items.length) {
                callback(null, results);
            }
        };
    };
    var addWorkers = function () {
        if (errorHappened) {
            return;
        }

        while (activeWorkersCount < limit && workersStarted < items.length) {
            operation(items[workersStarted], localCallback(workersStarted));
            activeWorkersCount++;
            workersStarted++;
        }

        if (workersStarted < items.length) {
            setTimeout(addWorkers, WORKER_SPAWN_TIMEOUT);
        }
    };

    addWorkers();
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
        } else {
            callback(null, items.filter(function (item, index) {
                return results[index];
            }));
        }
    });
};
