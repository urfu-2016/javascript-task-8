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
        if (error || operations.length === 0) {
            callback(error, data);
        } else {
            operations.shift()(data, next);
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
        limit: arguments[3]
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
        limit: arguments[3]
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
    var currentState = getCurrentStatePattern();

    if (items.length === 0) {
        callback(null, items);
    } else {
        for (var i = 0; i < items.length && currentState.progressCount < limit; i++) {
            callOperation(operation, items, operationCallback, currentState);
        }
    }

    function operationCallback(index, error, data) {
        currentState.progressCount--;
        currentState.passedItemsCount++;

        if (error && !currentState.errorOccurred) {
            callback(error, data);
            currentState.errorOccurred = true;
        } else {
            currentState.values[index] = data;

            if (currentState.progressCount <= limit && currentState.currentIndex < items.length) {
                callOperation(operation, items, operationCallback, currentState);
            } else if (currentState.passedItemsCount === items.length) {
                callback(null, resultedMap(currentState.values, items));
            }
        }
    }
}

function callOperation(operation, items, operationCallback, currentState) {
    currentState.progressCount++;
    var index = currentState.currentIndex++;
    operation(items[index], operationCallback.bind(null, index));
}

function getCurrentStatePattern() {
    return {
        values: [],
        errorOccurred: false,
        passedItemsCount: 0,
        progressCount: 0,
        currentIndex: 0
    };
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
            var currentState = null;
            try {
                currentState = func.apply(null, args);
            } catch (err) {
                error = err;
            }

            callback(error, currentState);
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
