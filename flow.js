'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = false;


function makeAsync(func) {
    return function () {
        setTimeout(function (args) {
            var error = null;
            var res = null;
            var callback = args.pop();
            try {
                res = func.apply(null, args);
            } catch (err) {
                error = err;
            }
            callback(error, res);
        }, 0, [].slice.call(arguments));
    };
}

function serial(operations, callback) {
    var nextData;
    var index = 0;
    var nextFunc = function (err, data) {
        if (err) {
            callback(err);

            return;
        }
        nextData = data;
        index++;
        nextOperation();
    };
    operations[index](nextFunc);
    function nextOperation() {
        if (index >= operations.length) {
            callback(null, nextData);
        } else {
            operations[index](nextData, nextFunc);
        }
    }
}

function myMap(items, operation, callback) {
    if (items.length === 0) {
        callback(null, []);

        return;
    }
    var resultArray = [];
    var handleItemsCount = 0;
    var returnedError = null;
    items.forEach(function (item, index) {
        operation(item, function (err, data) {
            if (!returnedError) {
                if (err) {
                    returnedError = err;
                    callback(err);

                    return;
                }
                resultArray[index] = data;
                handleItemsCount++;
                if (handleItemsCount === items.length) {
                    callback(returnedError, resultArray);
                }
            }
        });
    });
}

function myFilter(items, operation, callback) {
    if (items.length === 0) {
        callback(null, []);
    }
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
    if (operations && operations.length > 0) {
        serial(operations, callback);
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
