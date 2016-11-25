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
/* exports.serial = function (operations, callback) {
    var promise = Promise.resolve(null);

    operations.forEach(function (operation) {
        promise = promise.then(function (result) {
            return new Promise(function (resolve, reject) {
                var promiseCallback = function (error, data) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(data);
                    }
                };

                if (result) {
                    operation(result, promiseCallback);
                } else {
                    operation(promiseCallback);
                }
            });
        }, callback);
    });
    promise.then(function (result) {
        callback(null, result);
    });
};*/
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
        } else if (result) {
            operations[currentIndex](result, localCallback);
        } else {
            operations[currentIndex](localCallback);
        }
    };
    operations[currentIndex](localCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
/* exports.map = function (items, operation, callback) {
    var promises = items.map(function (item) {
        return new Promise(function (resolve, reject) {
            operation(item, function (error, data) {
                resolve(data);
            });
        });
    });

    Promise.all(promises).then(function (result) {
        callback(null, result);
    });
};*/
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
        setTimeout(function (args) {
            var callback = args[args.length - 1];
            args = Array.prototype.slice.call(args, 0, -1);
            var result = func.apply(null, args);

            callback(null, result);
        }, 0, arguments);
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
    }

    var finished = 0;
    var activeWorkersCount = 0;
    var results = [];
    var errorHappened = false;
    var workersStarted = 0;
    var localCallback = function (currentIndex) {
        return function (error, result) {
            if (error || errorHappened) {
                if (!errorHappened) {
                    errorHappened = true;
                    callback(error);
                }

                return;
            }

            results[currentIndex] = result;
            finished++;
            activeWorkersCount--;
            if (finished === items.length) {
                callback(null, results);
            }
        };
    };
    var addWorkers = function () {
        while (activeWorkersCount < limit && workersStarted < items.length) {
            operation(items[workersStarted], localCallback(workersStarted));
            activeWorkersCount++;
            workersStarted++;
        }

        if (finished !== items.length && !errorHappened) {
            setTimeout(addWorkers, 10);
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
        }

        callback(null, results.reduce(function (filtered, result, currentIndex) {
            if (result) {
                filtered.push(items[currentIndex]);
            }

            return filtered;
        }, []));
    });
};
