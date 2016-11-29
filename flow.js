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
    if (operations.length === 0) {
        callback(null, null);

        return;
    }
    var operationNumber = 0;
    var localCallback = function (error, data) {
        if (error) {
            callback(error);

            return;
        }
        operationNumber++;
        if (operationNumber === operations.length) {
            callback(error, data);
        } else if (data) {
            operations[operationNumber](data, localCallback);
        } else {
            operations[operationNumber](localCallback);
        }
    };
    operations[operationNumber](localCallback);
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
            var callback = args[args.length - 1];
            args = Array.prototype.slice.call(args, 0, -1);
            try {
                callback(null, func.apply(null, args));
            } catch (err) {
                callback(err);
            }
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

        return;
    }
    var itemsCopy = items.slice();
    var count = limit === Infinity ? items.length : limit;
    var resultData = [];
    var errCb = false;
    var limitItems = itemsCopy.splice(0, limit);
    var funcNum = 0;
    var cb = function (err, data) {
        count--;
        if (err && !errCb) {
            callback(err);
            errCb = true;
        } else {
            resultData[funcNum] = data;
            funcNum++;
            limitItems.shift();
            if (limitItems.length === 0 && itemsCopy.length !== 0) {
                limitItems = itemsCopy.splice(0, limit);
                limitItems.forEach(function (item) {
                    operation(item, cb);
                });
            }
        }
        if (count === 0) {
            callback(null, resultData);
        }
    };
    limitItems.forEach(function (item) {
        operation(item, cb);
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
    exports.mapLimit(items, limit, operation,
        function (err, data) {
            callback(err, err ? undefined : items.filter(function (item, index) {
                return data[index];
            }));
        });
};
