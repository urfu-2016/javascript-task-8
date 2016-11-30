'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = false;


function makeAsync(func) {
    return function (args, callback) {
        setTimeout(function () {
            var error = null;
            var res = null;
            try {
                res = func(args);
            } catch (err) {
                error = err;
                callback(err);
            }
            callback(error, res);
        }, 0);
    };
}

function serial(operations, callback) {
    var nextData;
    var index = 0;
    var nextFunc = function (err, data) {
        if (err) {
            callback(err);
        } else {
            nextData = data;
            index++;
            nextOperation();
        }
    };
    function nextOperation() {
        if (index >= operations.length) {
            callback(null, nextData);
        } else {
            operations[index](nextData, nextFunc);
        }
    }
    operations[0](nextFunc);
}

function myMap(items, operation, callback) {
    var resultArray = [];
    var sum = 0;
    var returnedError = null;
    items.forEach(function (item, index) {
        operation(item, function (err, data) {
            if (!returnedError) {
                if (err) {
                    returnedError = err;
                } else {
                    resultArray[index] = data;
                    sum++;
                }
            }
            if (sum === items.length || returnedError) {
                callback(returnedError, resultArray);
            }
        });
    });
}

function myFilter(items, operation, callback) {
    myMap(items, operation, function (err, data) {
        if (err) {
            callback(err);
        } else {
            var filtered = items.filter(function (item, index) {
                return data[index];
            });
            callback(null, filtered);
        }
    });
}

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    console.info('serial');
    console.info(operations, callback);
    serial(operations, callback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    console.info('map');
    console.info(items, operation, callback);
    myMap(items, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    console.info('filtr');
    console.info(items, operation, callback);
    myFilter(items, operation, callback);
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {function} async func
 */
exports.makeAsync = function (func) {
    console.info('asynx');
    console.info(func);

    return makeAsync(func);
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
    callback(new Error('Функция mapLimit не реализована'));
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
    callback(new Error('Функция filterLimit не реализована'));
};
