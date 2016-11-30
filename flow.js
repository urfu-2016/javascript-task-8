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
    function next(error, data) {
        if (arguments.length === 1) {
            data = error;
            error = undefined;
        }
        if (error) {
            callback(error);
        } else if (operations.length > 0) {
            operations.shift()(data, next);
        } else {
            callback(null, data);
        }
    }

    operations.shift()(next);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    if (items.length === 0) {
        callback(null, items);
    }

    var result = {
        array: [],
        passedItemsCount: 0
    };

    function operationCallback(error, data) {
        var args = [].slice.call(arguments);
        var res = args[0];
        var index = args[1];
        error = args[2];
        data = args[3];

        if (arguments.length === 3) {
            data = error;
            error = undefined;
        }

        if (error) {
            callback(error);
        }

        res.array[index] = data;
        res.passedItemsCount++;

        if (res.passedItemsCount === items.length) {
            res.array = res.array
                .filter(function (element) {
                    return element;
                });

            callback(null, res.array);
        }
    }

    items
        .forEach(function (item, index) {
            operation(item, operationCallback.bind(null, result, index));
        });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    if (items.length === 0) {
        callback(null, items);
    }

    var result = {
        array: [],
        passedItemsCount: 0
    };

    function operationCallback(res, item, index, error) {
        var data = [].slice.call(arguments)[4];
        if (arguments.length === 4) {
            data = error;
            error = undefined;
        }

        if (error) {
            callback(error);
        }

        if (data) {
            res.array[index] = item;
        } else {
            res.array[index] = false;
        }
        res.passedItemsCount++;

        if (res.passedItemsCount === items.length) {
            res.array = res.array
                .filter(function (element) {
                    return element;
                });

            callback(null, res.array);
        }
    }

    items
        .forEach(function (item, index) {
            operation(item, operationCallback.bind(null, result, item, index));
        });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} - ассинхронная версия функции
 */
exports.makeAsync = function (func) {
    return function () {
        var args = [].slice.call(arguments);
        var data = args[0];

        return setTimeout(function () {
            args[1](null, func(data));
        }, 0);
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
