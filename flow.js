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
    if (operations.length === 0 || !operations) {
        callback(null, null);

        return;
    }

    var currentIndex = 0;
    function innerCallback(error, data) {
        if (error || currentIndex === operations.length - 1) {
            callback(error, data);

            return;
        }

        currentIndex++;
        operations[currentIndex](data, innerCallback);
    }

    operations[currentIndex](innerCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    if (items.length === 0 || !items) {
        callback(null, null);

        return;
    }
    var result = [];
    var resultCount = 0;

    items.forEach(function (item, i) {
        operation(item, innerCallback.bind(null, i));
    });

    function innerCallback(index, err, data) {
        resultCount++;
        if (err) {
            callback(err);

            return;
        }

        result[index] = data;
        if (resultCount === items.length) {
            callback(null, result);
        }
    }
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    if (items.length === 0 || !items) {
        callback(null, null);

        return;
    }

    exports.map(items, operation, innerCallback);

    function innerCallback(err, data) {
        if (err) {
            callback(err);

            return;
        }

        var result = [];

        data.forEach(function (item, i) {
            if (item === true) {
                result.push(items[i]);
            }
        });

        callback(null, result);
    }
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} func
 */
exports.makeAsync = function (func) {
    return function () {
        setTimeout(function (args) {
            var callback = args[args.length - 1];
            try {
                callback(null, func.apply(null, args.slice(0, args.length - 1)));
            } catch (err) {
                callback(err);
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
