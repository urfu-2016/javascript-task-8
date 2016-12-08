'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
var isStar = false;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
var serial = function (operations, callback) {
    if (!operations.length) {
        callback(null, operations);

        return;
    }

    var currentOperation = operations.shift();
    var funcCallback = function (error, result) {
        if (error) {
            callback(error, null);

            return;
        }
        if (!operations.length) {
            callback(null, result);

            return;
        }
        currentOperation = operations.shift();
        currentOperation(result, funcCallback);
    };

    currentOperation(funcCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
var map = function (items, operation, callback) {
    if (!items.length) {
        callback(null, items);

        return;
    }

    var resultArray = [];
    var featuredItems = 0;
    var itemsLength = items.length;
    var errorHappened = false;
    var runOperation = function (index) {
        operation(items[index], function (error, data) {
            if (errorHappened) {

                return;
            }
            if (error) {
                callback(error, null);
                errorHappened = true;

                return;
            }
            resultArray[index] = data;
            featuredItems++;
            if (featuredItems === itemsLength) {
                callback(null, resultArray);
            }
        });
    };

    for (var index = 0; index < itemsLength; index++) {
        runOperation(index);
    }
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
var filter = function (items, operation, callback) {
    map(items, operation, function (error, appropriateIndexes) {
        if (error) {
            callback(error, null);

            return;
        }
        items = items.filter(function (item, index) {
            return appropriateIndexes[index];
        });
        callback(null, items);
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
var makeAsync = function (func) {
    return function () {
        var args = [].slice.call(arguments);
        var callback = args.pop();
        try {
            callback(null, func.apply(null, args));
        } catch (error) {
            callback(error, null);
        }
    };
};

module.exports = {
    isStar: isStar,
    serial: serial,
    map: map,
    filter: filter,
    makeAsync: makeAsync
};
