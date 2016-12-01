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
    function next(error, data) {
        if (arguments.length === 1) {
            data = error;
            error = undefined;
        }

        if (error) {
            callback(error, data);
        } else if (operations.length > 0) {
            operations.shift()(data, next);
        } else {
            callback(null, data);
        }
    }

    if (operations.length > 0) {
        operations.shift()(next);
    } else {
        callback();
    }
};

/**
 * Параллельная обработка элементов
 * @param {Array} items – элементы для итерации
 * @param {Function} operation – функция для обработки элементов
 * @param {Function} callback
 */
exports.map = function (items, operation, callback) {
    baseMap(items, operation, callback, {
        resultedMap: mapResultedMap,
        limit: [].slice.call(arguments)[3]
    });
};

function mapResultedMap(resultValues) {
    return resultValues;
}

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    baseMap(items, operation, callback, {
        resultedMap: filterResultedMap,
        limit: [].slice.call(arguments)[3]
    });
};

function filterResultedMap(resultValues, inputItems) {
    return resultValues
        .reduce(function (filteredItems, value, index) {
            if (value) {
                filteredItems.push(inputItems[index]);
            }

            return filteredItems;
        }, []);
}

function baseMap(items, operation, callback, additionalParameters) {
    var resultedMap = additionalParameters.resultedMap;
    var limit = additionalParameters.limit ? additionalParameters.limit : Infinity;
    var result = {
        values: [],
        errorOccurred: false,
        passedItemsCount: 0,
        calledFunctionsCount: 0,
        currentIndex: 0
    };

    if (items.length === 0) {
        callback(null, items);
    } else {
        for (var i = 0; i < items.length && result.calledFunctionsCount < limit; i++) {
            result.calledFunctionsCount++;
            operation(items[i], operationCallback.bind(null, i));
            result.currentIndex++;
        }
    }

    function operationCallback(index, error, data) {
        if (arguments.length === 2) {
            data = error;
            error = undefined;
        }

        if (error && !result.errorOccurred) {
            callback(error, data);
            result.errorOccurred = true;
        } else {
            result.values[index] = data;
            result.passedItemsCount++;

            if (result.passedItemsCount === items.length) {
                callback(null, resultedMap(result.values, items));
            }

            result.calledFunctionsCount--;
            if (result.calledFunctionsCount <= limit && result.currentIndex < items.length) {
                var j = result.currentIndex++;
                operation(items[j], operationCallback.bind(null, j));
                result.calledFunctionsCount++;
            }
        }
    }
}

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} - ассинхронная версия функции
 */
exports.makeAsync = function (func) {
    return function () {
        setTimeout(function (args) {
            var callback = args.pop();
            var error = null;
            var result = null;
            try {
                result = func.apply(null, args);
            } catch (err) {
                error = err;
            }

            callback(error, result);
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
    exports.map(items, operation, callback, limit);
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
    exports.filter(items, operation, callback, limit);
};
