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
    console.info(operations, callback);
    if (!operations || !operations.length) {
        callback(null, null);

        return;
    }
    var nextOperation = function (error, data) {
        if (error || !operations.length) {
            callback(error, data);

            return;
        }
        operations.shift()(data, nextOperation);
    };
    operations.shift()(nextOperation);
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

    var countUsedItems = items.length;
    var isError = false;
    var result = [];

    items.forEach(function (element, index) {
        operation(element, function (error, data) {
            countUsedItems--;
            if (isError) {
                return;
            }
            if (error) {
                isError = true;
                callback(error);

                return;
            }
            result[index] = data;

            if (countUsedItems > 0) {
                return;
            }
            callback(null, result);
        });
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
    exports.map(items, operation, function (error, data) {
        if (error) {
            callback(error, null);
        } else {
            callback(null, filterResult(items, data));
        }
    });
};

/**
 * Берем элементы по таким индексам, где в data они true
 * @param {Array} items – элементы для фильтрация
 * @param {Array} data - элементы, индексы которых надо брать
 * @returns {Array}
 */
function filterResult(items, data) {
    return items.filter(function (item, index) {
        return data[index];
    });
}

function callAsync(func) {
    var args = [].slice.call(arguments, 1);
    var callback = args.pop();
    var value = null;
    var result;

    try {
        result = func.apply(null, args);
    } catch (error) {
        value = error;
    }
    callback(value, result);
}

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function}
 */
exports.makeAsync = function (func) {
    return callAsync.bind(null, func);
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
