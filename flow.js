'use strict';

/*
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = false;

/*
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    if (!operations || !operations.length) {
        callback();

        return;
    }
    var operationIndex = 1;
    function nextFunction(error, data) {
        if (!error && operations[operationIndex]) {
            operations[operationIndex++](data, nextFunction);
        } else {
            callback(error, data);
        }
    }
    operations[0](nextFunction);
};

/*
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    if (!items || !items.length) {
        callback(null, []);

        return;
    }
    var result = [];
    var countExited = 0;
    items.forEach(function (item, itemIndex) {
        operation(item, function (error, data) {
            if (error) {
                callback(error);

                return;
            }
            countExited++;
            result[itemIndex] = data;
            if (countExited === items.length) {
                callback(null, result);
            }
        });
    });
};

/*
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    var result = [];
    exports.map(items, operation, function (error, data) {
        if (error) {
            callback(error);

            return;
        }
        data.forEach(function (boolValue, valueIndex) {
            if (boolValue) {
                result.push(items[valueIndex]);
            }
        });
        callback(null, result);
    });
};

/*
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 */
exports.makeAsync = function (func) {
    return function () {
        var allArgs = [].slice.call(arguments);
        var args = allArgs.slice(0, -1);
        setTimeout(function () {
            var functionResult;
            var cb = allArgs[allArgs.length - 1];
            try {
                functionResult = func.apply(null, args);
            } catch (e) {
                cb(e);
            }
            cb(null, functionResult);
        }, 0);
    };
};


/*
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

/*
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
