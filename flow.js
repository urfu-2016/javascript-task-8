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
    var result = null;

    function innerOperation(operation, innerCallback) {
        function cb(err, data) {
            if (!err) {
                result = data;
            }

            innerCallback(err);
        }

        if (operation.length === 1) {
            operation(cb);
        } else {
            operation(result, cb);
        }
    }

    exports.mapLimit(operations, 1, innerOperation, function (err) {
        callback(err, result);
    });
};

function doWork(tasks, callback, limit) {
    var results = [];
    var countOfProcessedTasks = 0;
    var countOfStartedProcessedTasks = 0;
    var finished = false;

    function parallelize(taskIndex) {
        tasks[taskIndex](function (err, data) {
            recursiveСallback(err, data, taskIndex);
        });
    }

    function recursiveСallback(err, data, resultIndex) {
        if (finished) {
            return;
        }

        if (err) {
            finished = true;
            callback(err);

            return;
        }

        if (countOfStartedProcessedTasks < tasks.length) {
            parallelize(countOfStartedProcessedTasks);
            countOfStartedProcessedTasks++;
        }

        results[resultIndex] = data;
        countOfProcessedTasks++;

        if (countOfProcessedTasks === tasks.length) {
            finished = true;
            callback(null, results);
        }
    }

    for (var i = 0; i < Math.min(limit, tasks.length); i++) {
        parallelize(i);
    }

    countOfStartedProcessedTasks = limit;
}

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
        setTimeout(function (args) {
            var callback = args.pop();
            var error = null;
            var result;

            try {
                result = func.apply(null, args);
            } catch (e) {
                error = e;
            }

            callback(error, result);
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
    if (items && items.length !== 0) {
        var tasks = items.map(function (item) {
            return operation.bind(null, item);
        });

        doWork(tasks, callback, limit);
    } else {
        callback(null, []);
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
    exports.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(null, items.filter(function (item, index) {
                return data[index];
            }));
        }
    });
};
