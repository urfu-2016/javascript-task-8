'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = true;

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    if (!operations || operations.length === 0) {
        callback();

        return;
    }

    var index = 0;
    function innerCallback(error, data) {
        if (!error && index !== operations.length) {
            var op = operations[index++];
            if (data) {
                op(data, innerCallback);
            } else {
                op(innerCallback);
            }
        } else {
            callback(error, data);
        }
    }
    operations[index++](innerCallback);
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    exports.mapLimit(items, Infinity, operation, callback);
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    exports.filterLimit(items, Infinity, operation, callback);
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
            var error;
            var data;
            try {
                data = func.apply(null, args);
            } catch (e) {
                error = e;
            }
            callback(error, data);
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
    if (items.length === 0) {
        callback(undefined, []);

        return;
    }

    var index = 0;
    var workers = 0;
    var result = [];
    var error;
    function innerCallback(i, e, data) {
        if (e && !error) {
            error = e;
            callback(error);
        }
        if (e) {
            return;
        }
        result[i] = data;
        workers--;
        run();
    }

    function run() {
        if (index === items.length && !workers) {
            callback(error, result);

            return;
        }

        while (workers < limit && index < items.length) {
            operation(items[index], innerCallback.bind(null, index++));
            workers++;
        }
    }
    run();
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
    exports.mapLimit(items, limit, operation, function (error, data) {
        callback(error, data && items.filter(function (item, i) {
            return data[i];
        }));
    });
};
