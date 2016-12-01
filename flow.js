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
    var operationsLen = operations.length - 1;
    function serialCallback(error, data) {
        if (!error && operationIndex !== operationsLen) {
            if (data) {
                operations[++operationIndex](data, serialCallback);
            } else {
                operations[++operationIndex](serialCallback);
            }
        } else {
            callback(error, data);
        }
    }
    if (operationsLen >= 0) {
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

    var operationsKeeper = items.map(function (item, operationIndex) {

        return { 'operation': operation.bind(null, item), 'operationIndex': operationIndex };
    });

    var operationsQueue = operationsKeeper.slice();
    var doneCount = 0;
    var activeCount = 0;
    var resultDict = {};
    var isError = false;
    function execOperation(operationIndex, error, data) {
        if (error && !isError) {
            callback(error, data);
            isError = true;

            return;
        }

        resultDict[operationIndex] = data;
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
        if (operationsQueue.length) {
            operationsQueue.splice(0, limit).forEach(function (keeper) {
                handleOperation(keeper);
            });
        }
    }

    function handleOperation(keeper) {
        if (activeCount < limit) {
            activeCount++;
            keeper.operation(execOperation.bind(null, keeper.operationIndex));
        } else {
            operationsQueue.unshift(keeper);
        }
    }
    operationsQueue.splice(0, limit).forEach(function (keeper) {
        handleOperation(keeper);
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
    this.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);

        } else {
            data = items.filter(function (item, operationIndex) {

                return data[operationIndex];
            });
            callback(null, data);
        }
    });
};
