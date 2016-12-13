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
    if (!operations.length) {
        callback(null, null);

        return;
    }

    operations = operations.slice();

    function executeNext(previousResult) {
        operations.shift()(previousResult, innerCallback);
    }

    function innerCallback(error, previousResult) {
        if (error) {
            callback(error);
        } else if (!operations.length) {
            callback(null, previousResult);
        } else {
            executeNext(previousResult);
        }
    }

    operations.shift()(innerCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    if (!items.length) {
        callback(null, []);

        return;
    }

    var results = [];
    var mappedItems = 0;
    var hasErrors = false;
    function innerCallback(index, error, result) {
        if (hasErrors) {
            return;
        }
        if (error) {
            hasErrors = true;
            callback(error);
        }

        results[index] = result;
        mappedItems++;

        if (mappedItems === items.length) {
            callback(null, results);
        }
    }

    items.forEach(function (item, index) {
        operation(item, innerCallback.bind(null, index));
    });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.map(items, operation, function (err, acceptedIndexes) {
        if (err) {
            callback(err);

            return;
        }

        var filtred = items.filter(function (item, index) {
            return acceptedIndexes[index];
        });
        callback(null, filtred);
    });
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} асинхронная функция
 */
exports.makeAsync = function (func) {
    var asyncFunc = function () {
        var args = [].slice.call(arguments);
        var callback = args.pop();

        setTimeout(function () {
            try {
                callback(null, func.apply(null, args));
            } catch (err) {
                callback(err, null);
            }
        }, 0);
    };

    return asyncFunc;
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
