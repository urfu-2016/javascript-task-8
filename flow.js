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

    if (!operations || operations.length === 0) {
        callback(null, []);

        return;
    }

    var nextCallback = function (error, data) {
        if (error || operations.length === 0) {
            callback(error, data);
        } else {
            operations.shift()(data, nextCallback);
        }
    };

    operations.shift()(nextCallback);
};

var executeConcurrent = function (operations, callback) {
    var errorFound = false;
    var operationQueue = [];

    if (operations.length === 0) {
        callback(null, []);
    }

    operations.forEach (function (func, index) {
        if (!errorFound) {
            func(function (error, data) {
                if (error) {
                    errorFound = true;
                    callback(error, data);
                } else {
                    operationQueue.push(data);
                }
                if (index === operations.length - 1) {
                    callback(null, operationQueue);
                }
            });
        }
    });
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {

    if (items.length === 0) {
        callback(null, []);

        return;
    }

    var operations = items.map(function (item) {
        return function (cb) {
            operation(item, cb);
        };
    });

    executeConcurrent(operations, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {

    var func = function (error, data) {
        if (error) {
            callback(error);
        } else {
            callback(null, items.filter(function (item, index) {
                return data[index];
            }));
        }
    };

    exports.map(items, operation, func);
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
            try {
                callback(null, func.apply(null, args));
            } catch (error) {
                callback(error);
            }
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
/*
 exports.mapLimit = function (items, limit, operation, callback) {
 callback(new Error('Функция mapLimit не реализована'));
 };
 */
/**
 * Параллельная фильтрация элементов с ограничением
 * @star
 * @param {Array} items – элементы для итерации
 * @param {Number} limit – максимальное количество выполняемых параллельно операций
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
/*
 exports.filterLimit = function (items, limit, operation, callback) {
 callback(new Error('Функция filterLimit не реализована'));
 };
 */
