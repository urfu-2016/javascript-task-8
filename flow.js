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
        if (!data) {
            data = error;
            error = undefined;
        }

        if (error) {
            callback(error, data);
        } else if (operations.length > 0) {
            operations.shift()(data, next);
        } else {
            callback(null, data);
        }
    }

    if (operations.length > 0) {
        operations.shift()(next);
    } else {
        callback();
    }
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

        return;
    }

    var errorOccurred = false;
    var result = {
        array: [],
        passedItemsCount: 0
    };

    function operationCallback(res, index, error, data) {
        if (arguments.length === 3) {
            data = error;
            error = undefined;
        }

        if (error && !errorOccurred) {
            callback(error, data);
            errorOccurred = true;

            return;
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

    for (var i = 0; i < items.length; i++) {
        operation(items[i], operationCallback.bind(null, result, i));
    }

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

        return;
    }

    var errorOccurred = false;
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

        if (error && !errorOccurred) {
            callback(error, data);
            errorOccurred = true;

            return;
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

    for (var i = 0; i < items.length; i++) {
        operation(items[i], operationCallback.bind(null, result, items[i], i));
    }
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} - ассинхронная версия функции
 */
exports.makeAsync = function (func) {
    return function () {
        return setTimeout(function (args) {
            var callback = args.pop();
            var error = null;
            var result = null;
            try {
                result = func.apply(null, args);
            } catch (err) {
                error = err;
            }

            callback(error, result);
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