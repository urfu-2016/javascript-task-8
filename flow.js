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
    var currentOperationIndex = 0;
    function next(err, data) {
        if (err || currentOperationIndex === operations.length) {
            callback(err, data);
        } else {
            operations[currentOperationIndex++](data, next);
        }
    }
    if (operations || operations.length !== 0) {
        operations[currentOperationIndex++](next);
    } else {
        callback(null, null);
    }
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
 * @returns {Function} - асинхронный вариант исходной функции
 */
exports.makeAsync = function (func) {
    return function () {
        setTimeout(function (args) {
            var callback = args.pop();
            try {
                callback(null, func.apply(null, args));
            } catch (error) {
                callback(error);
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
    var result = [];
    var itemIndex = 0;
    var workersCount = 0;
    tryAddWorkers();

    function tryAddWorkers() {
        if (!workersCount && itemIndex === items.length) {
            callback(null, result);

            return;
        }

        while (workersCount < limit && itemIndex < items.length) {
            workersCount++;
            operation(items[itemIndex], finishWork.bind(null, itemIndex++));
        }
    }

    function finishWork(index, err, data) {
        if (err) {
            callback(err);

            return;
        }
        result[index] = data;
        workersCount--;
        tryAddWorkers();
    }
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
    exports.mapLimit(items, limit, operation, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(err, items.filter(function (item, index) {
                return data[index];
            }));
        }
    });
};
