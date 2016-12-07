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
    operations = operations || [];
    callback = callback || [];
    if (!operations.length) {
        callback(null);
    } else {
        var currentOperation = operations.shift();
        var funcCallback = function (error, result) {
            if (error) {
                callback(error, null);
            } else if (!operations.length) {
                callback(null, result);
            } else {
                currentOperation = operations.shift();
                currentOperation(result, funcCallback);
            }
        };
        currentOperation(funcCallback);
    }
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    var newArray = [];
    var featuredItems = 0;
    var itemsLength = items.length;
    var errorHappened = false;

    function mapping(index) {
        operation(items[index], function (error, data) {
            if (!errorHappened) {
                if (error) {
                    callback(error, null);
                    errorHappened = true;

                    return;
                }
                newArray[index] = data;
                featuredItems++;
                if (featuredItems === itemsLength) {
                    console.info(newArray);
                    callback(null, newArray);
                }
            }
        });
    }

    for (var index = 0; index < items.length; index++) {
        mapping(index);
    }
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.map(items, operation, function (error, appropriateIndexes) {
        items = items.filter(function (item, index) {
            return appropriateIndexes[index];
        });
        if (error) {
            callback(error, null);
        } else {
            callback(null, items);
        }
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {
    return function () {
        var args = [].slice.call(arguments);
        var callback = args[args.length - 1];
        args = args.splice(0, args.length - 1);
        try {
            callback(null, func.apply(null, args));
        } catch (error) {
            callback(error, null);
        }
    };
};
