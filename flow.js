'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = false;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {

    var index = 0;
    var opLen = operations.length - 1;

    function serialCallback(error, data) {
        if (!error && index !== opLen) {
            operations[++index](data, serialCallback);
        } else {
            callback(error, data);
        }
    }
    if (opLen >= 0) {
        operations[0](serialCallback);
    } else {
        callback(null, null);
    }
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
 func - функция попадающая в очередь событий
 */
exports.makeAsync = function (func) {

    return function () {
        setTimeout(function (args) {
            var cb = args.pop();
            try {
                cb(null, func.apply(null, args));
            } catch (err) {
                cb(err, null);
            }
        }, 0, Array.prototype.slice.call(arguments));
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

        return;
    }
    var operations = items.map(function (item) {

        return operation.bind(null, item);
    });
    var opQueue = operations.slice();
    var doneCount = 0;
    var activeCount = 0;
    var execDoneCount = 0;
    var result = [];
    function execOperation(error, data) {
        if (error) {
            callback(error, null);
        }
        result.push(data);
        doneCount++;
        execDoneCount++;
        if (doneCount === items.length) {
            callback(null, result);
        } else if (execDoneCount === limit) {
            activeCount = 0;
            execDoneCount = 0;
            opQueue.splice(0, limit).forEach(handleOperation);
        }

    }

    function handleOperation(op) {
        if (activeCount < limit) {
            activeCount++;
            op(execOperation);
        } else {
            opQueue.unshift(op);
        }
    }
    opQueue.splice(0, limit).forEach(handleOperation);
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
    this.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);
        } else {
            data = items.filter(function (item, index) {

                return data[index];
            });
            callback(null, data);
        }
    });
};
