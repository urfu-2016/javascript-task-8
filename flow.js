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

    var index = 0;
    var opLen = operations.length - 1;

    function serialCallback(error, data) {
        if (!error && index !== opLen) {
            if (data) {
                operations[++index](data, serialCallback);
            } else {
                operations[++index](serialCallback);
            }
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
 * @returns {Function} func - функция попадающая в очередь событий
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
    var operationsKeeper = items.map(function (item, index) {
        return { 'op': operation.bind(null, item), 'index': index };
    });

    var opQueue = operationsKeeper.slice();
    var doneCount = 0;
    var activeCount = 0;
    var resultDict = {};
    function execOperation(index, error, data) {

        if (error) {
            callback(error, data);

            return;
        }
        resultDict[index] = data;
        doneCount++;
        activeCount--;
        if (doneCount === items.length) {
            var result = [];
            for (var i = 0; i < items.length; i++) {
                result.push(resultDict[i]);
            }
            callback(error, result);

            return;
        }
        if (opQueue.length) {
            handleOperation(opQueue.shift());
        }
    }

    function handleOperation(op) {
        if (activeCount < limit) {
            activeCount++;
            op.op(execOperation.bind(null, op.index));
        } else {
            opQueue.unshift(op);
        }
    }
    handleOperation(opQueue.shift());
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
