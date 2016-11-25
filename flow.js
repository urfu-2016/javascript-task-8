'use strict';

exports.isStar = true;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback – общий callback
 */
exports.serial = function (operations, callback) {
    if (!operations || operations.length === 0) {
        callback(null, null);
    } else {
        operations[0](serialRecursive.bind(null, operations.slice(1), callback));
    }
};

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback – общий callback
 * @param {Object} error – ошибка при вызове одной из функций
 * @param {Object} data – результат вызова предыдущей функции
 */
function serialRecursive(operations, callback, error, data) {
    if (error || operations.length === 0) {
        callback(error);
    } else {
        if (data) {
            operations.shift()(data, serialRecursive.bind(null, operations, callback));
        } else {
            operations.shift()(serialRecursive.bind(null, operations, callback));
        }
    }
}

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback – общий callback
 */
exports.map = function (items, operation, callback) {
    exports.mapLimit(items, Infinity, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback – общий callback
 */
exports.filter = function (items, operation, callback) {
    exports.filterLimit(items, Infinity, operation, callback);
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} – функция, следующая своей судьбе
 */
exports.makeAsync = function (func) {
    return function () {
        setTimeout(function (args) {
            var argsCopy = args.slice();
            var callback = argsCopy.pop();
            var data;
            var error;
            try {
                data = func.apply(null, argsCopy);
            } catch (err) {
                error = err;
            }
            callback(error, data);
        }, 0, Array.from(arguments));
    };
};

function makeTaskExecutor(taskLimit, callback, tasks) {
    var result = [];

    return {
        isDone: false,
        writeIndex: 0,
        taskLeft: tasks.length,
        workersCount: 0,
        queue: tasks.slice(),

        terminate: function (error, data) {
            if (!this.isDone) {
                this.isDone = true;
                this.workersCount = 0;
                this.taskLeft = 0;
                callback(error, data);
            }
        },

        addTask: function (task) {
            var writeId = this.writeIndex;
            if (this.workersCount < taskLimit) {
                this.writeIndex++;
                this.workersCount++;
                task(this.releaseTask.bind(this, writeId));
            } else {
                this.queue.push(task);
            }
        },

        releaseTask: function (taskId, error, data) {
            if (error) {
                this.terminate(error, data);
            } else {
                this.workersCount--;
                result[taskId] = data;
                if (--this.taskLeft === 0) {
                    this.terminate(null, result.filter(function (element) {
                        return element !== null;
                    }));
                }
                if (this.queue.length > 0) {
                    this.addTask(this.queue.shift());
                }
            }
        },

        execute: function () {
            this.queue.splice(0, taskLimit).forEach(this.addTask, this);
        }
    };
}

/**
 * Параллельная обработка элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback – общий callback
 */
exports.mapLimit = function (items, limit, operation, callback) {
    if (items.length === 0) {
        callback(null, []);
    }
    var executor = makeTaskExecutor(limit, callback, items.map(function (item) {
        return operation.bind(null, item);
    }));
    executor.execute();
};

/**
 * Параллельная фильтрация элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback – общий callback
 */
exports.filterLimit = function (items, limit, operation, callback) {
    exports.mapLimit(items, limit,
        function (item, cb) {
            operation(item, function (error, data) {
                cb(error, data ? item : null);
            });
        },
        function (error, data) {
            if (error) {
                callback(error);
            } else {
                callback(null, data.filter(function (element) {
                    return element !== null;
                }));
            }
        }
    );
};
