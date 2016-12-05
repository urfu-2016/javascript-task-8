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

    if (operations.length === 0) {
        callback(null, null);

        return;
    }
    var index = 0;
    function innerCallback(error, data) {
        index++;
        if (index === operations.length || error) {
            callback(error, data);
        } else {
            operations[index](data, innerCallback);
        }
    }
    operations[index](innerCallback);
    console.info(operations, callback);
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
    }
    var results = [];
    var handledItems = 0;
    var detectedError = false;

    function innerCallback(i, error, result) {
        handledItems++;
        if (detectedError) {

            return;
        }
        if (error) {
            detectedError = true;
            callback(error);
        }
        results[i] = result;
        if (handledItems !== items.length) {
            return;
        }
        callback(null, results);
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
    console.info(items, operation, callback);
    exports.map(items, operation, function (error, results) {
        if (error) {
            callback(error, null);

            return;
        }
        var filteredResults = items.filter(function (item, index) {
            return results[index];
        });
        callback(null, filteredResults);
    });

};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {
    return function () {
        var params = [].slice.call(arguments, 1);
        var pointer = params.length - 1;
        setTimeout(function () {
            try {
                params[pointer](null,
                    func.apply(null, params.slice(0, pointer)));
            } catch (error) {
                params[pointer](error);
            }
        }, 0);
    }.bind(null, func);
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
