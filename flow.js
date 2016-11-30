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
        callback();

        return;
    }
    var i = 0;
    function innerCallback(error, data) {
        i++;
        if (i === operations.length || error) {
            callback(error, data);
        } else {
            operations[i](data, innerCallback);
        }
    }
    operations[i](innerCallback);
    console.info(operations, callback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    var results = [];
    var notFinished = [];
    for (var k = 0; k < items.length; k++) {
        notFinished[k] = true;
    }

    if (items.length === 0) {
        callback(null, []);
    }

    function innerCallback(i, error, result) {
        if (error) {
            callback(error);
            
            return;
        }
        results[i] = result;
        notFinished[i] = false;
        for (var l = 0; l < notFinished.length; l++) {
            if (notFinished[l]) {
                return;
            }
        }
        callback(null, results);
    }

    for (var i = 0; i < items.length; i++) {
        operation(items[i], innerCallback.bind(null, i));
    }
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
        var filteredResults = [];
        for (var i = 0; i < items.length; i++) {
            if (results[i]) {
                filteredResults.push(items[i]);
            }
        }
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
        var arguments2 = [].slice.call(arguments, 1);
        setTimeout(function () {
            try {
                arguments2[arguments2.length - 1](null,
                    func.apply(null, arguments2.slice(0, arguments2.length - 1)));
            } catch (error) {
                arguments2[arguments2.length - 1](error);
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
