'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы mapLimit и filterLimit
 */
exports.isStar = true;

function Iterator(array) {
    this.nextIndex = 0;
    this.array = array;
}

Iterator.prototype.next = function () {
    return this.nextIndex < this.array.length
        ? { value: this.array[this.nextIndex], index: this.nextIndex++ }
        : null;
};

Iterator.prototype.hasAny = function () {
    return this.nextIndex !== this.array.length;
};

/**
 * Последовательное выполнение операций
 * @param {Function[]} operations – функции для выполнения
 * @param {Function} callback
 */
exports.serial = function (operations, callback) {
    var operationsIterator = new Iterator(operations || []);

    (function internalCallback(error, data) {
        if (!operationsIterator.hasAny() || error) {
            callback(error, error ? undefined : data);
        } else {
            operationsIterator.next().value(data || internalCallback, internalCallback);
        }
    }());
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
            try {
                callback(null, func.apply(null, args));
            } catch (e) {
                callback(e);
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
    var itemsIterator = new Iterator(items || []);
    var activeWorkersCount = 0;

    var result = [];
    var isExceptionRaised = false;

    (function run() {
        function internalCallback(index, error, data) {
            if (error || isExceptionRaised) {
                if (!isExceptionRaised) {
                    isExceptionRaised = true;
                    callback(error);
                }
            } else {
                result[index] = data;
                activeWorkersCount--;
                run();
            }
        }

        while (activeWorkersCount < limit && itemsIterator.hasAny()) {
            var nextItem = itemsIterator.next();
            operation(nextItem.value, internalCallback.bind(null, nextItem.index));
            activeWorkersCount++;
        }

        if (!itemsIterator.hasAny() && !activeWorkersCount) {
            callback(null, result);
        }
    }());
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
    exports.mapLimit(items, limit, operation,
        function (error, data) {
            callback(error, error ? undefined : items.filter(function (item, index) {
                return data[index];
            }));
        });
};
