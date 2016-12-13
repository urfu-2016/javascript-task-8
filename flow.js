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
        callback(null);

        return;
    }
    var functionIndex = 0;
    function nextFunction(error, result) {
        if (error || operations.length === functionIndex) {
            callback(error, result);
        } else {
            operations[functionIndex++](result, nextFunction);
        }
    }
    operations[functionIndex++](nextFunction);
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
    var itemIndex = 0;
    var results = [];
    var callbackError = false;
    function nextFunction(currentFunction, error, result) {
        if (!callbackError && error) {
            callback(error);
            callbackError = true;
        } else {
            itemIndex++;
            results[currentFunction] = result;
            if (itemIndex !== items.length) {
                return;
            }
            callback(null, results);
        }
    }
    items.forEach(function (item, index) {
        operation(item, nextFunction.bind(null, index));
    });
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    function mapCallback(error, result) {
        if (error) {
            callback(error);

            return;
        }
        callback(null, items.filter(function (item, index) {
            return result[index];
        }));
    }
    exports.map(items, operation, mapCallback);
};

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {

    return function () {
        var args = [].slice.call(arguments);
        var callback = args.pop();
        try {
            callback(null, func.apply(null, args));
        } catch (error) {
            callback(error);
        }
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
