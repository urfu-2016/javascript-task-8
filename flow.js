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
    var pointer = 1;
    var next = function (error, data) {
        if (error || operations.length === pointer) {
            callback(error, data);
        } else {
            operations[pointer++](data, next);
        }
    };
    operations[0](next);
};

function fillNoVisited(count, bool) {
    var isNoVisited = [];
    for (var index = 0; index < count; index++) {
        isNoVisited[index] = bool;
    }

    return isNoVisited;
}

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    if (!items.length) {
        callback(null, []);
    }

    var isNoVisited = fillNoVisited(items.length, true);
    var result = [];
    var errors = fillNoVisited(items.length, false);

    items.forEach(function (element, index) {
        operation(element, function (error, data) {
            isNoVisited[index] = false;
            if (isAll(errors)) {
                return;
            }
            if (error) {
                errors[index] = true;
                callback(error);
            }
            result[index] = data;

            if (isAll(isNoVisited)) {
                return;
            }

            callback(null, result);
        });
    });
};

function isAll(notFinished) {
    var flag = false;
    notFinished.forEach(function (item) {
        if (item) {
            flag = true;
        }
    });

    return flag;
}

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

function filterResult(items, data) {
    var newResult = [];
    for (var index1 = 0; index1 < items.length; index1++) {
        if (data[index1]) {
            newResult.push(items[index1]);
        }
    }

    return newResult;
}

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
