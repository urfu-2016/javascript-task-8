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
    var operationIndex = 0;

    function innerCallback(err, data) {
        if (err) {
            callback(err);
        } else {
            operationIndex++;

            if (operationIndex < operations.length) {
                operations[operationIndex](data, innerCallback);
            } else {
                callback(null, data);
            }
        }
    }

    if (operations && operations.length !== 0) {
        operations[operationIndex](innerCallback);
    } else {
        callback(null, null);
    }
};

function Worker(tasks, callback) {
    this.tasks = tasks;
    this.callback = callback;

    this.results = [];
    this.countOfProcessedItems = 0;
    this.i = 0;
    this.finished = false;
}

Worker.prototype.parallelize = function (taskIndex) {
    var _this = this;
    this.tasks[taskIndex](function (err, data) {
        _this.recursiveСallback(err, data, taskIndex);
    });
};

Worker.prototype.recursiveСallback = function (err, data, resultIndex) {
    if (!this.finished && err) {
        this.finished = true;
        this.callback(err);
    }

    if (!this.finished) {
        if (this.i < this.tasks.length) {
            this.parallelize(this.i);
            this.i++;
        }

        this.results[resultIndex] = data;
        this.countOfProcessedItems++;

        if (this.countOfProcessedItems === this.tasks.length) {
            this.finished = true;
            this.callback(null, this.results);
        }
    }
};

Worker.prototype.startWork = function (limit) {
    for (var i = 0; i < Math.min(limit, this.tasks.length); i++) {
        this.parallelize(i);
    }

    this.i = limit;
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

        var worker = new Worker(tasks, callback);

        worker.startWork(limit);
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
    if (items && items.length !== 0) {
        var tasks = items.map(function (item) {
            return operation.bind(null, item);
        });

        var worker = new Worker(tasks, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback(null, items.filter(function (item, index) {
                    return data[index];
                }));
            }
        });

        worker.startWork(limit);
    } else {
        callback(null, []);
    }
};
