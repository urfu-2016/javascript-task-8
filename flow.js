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
    function next(error, data) {
        if (!data) {
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
    // function resultedMap(resultValues) {
    //     return resultValues;
    // }

    // baseMap(items, operation, callback, resultedMap);

    var result = {
        values: [],
        passedItemsCount: 0,
        errorOccurred: false
    };

    var errorOccurred = false;

    if (items.length === 0) {
        callback(null, items);
    } else {
        for (var i = 0; i < items.length; i++) {
            operation(items[i], operationCallback.bind(null, i));
        }
    }

    function operationCallback(index, error, data) {
        if (!data) {
            data = error;
            error = undefined;
        }

        if (error && !errorOccurred) {
            callback(error, data);
            errorOccurred = true;
        } else {
            result.values[index] = data;
            result.passedItemsCount++;

            if (result.passedItemsCount === items.length) {
                var mappedArray = result.values
                    .filter(function (element) {
                        return element;
                    });

                callback(null, mappedArray);
            }
        }
    }
};

/**
 * Параллельная фильтрация элементов
 * @param {Array} items – элементы для фильтрация
 * @param {Function} operation – функция фильтрации элементов
 * @param {Function} callback
 */
exports.filter = function (items, operation, callback) {
    // function resultedMap(resultValues, inputItems) {
    //     return resultValues
    //         .reduce(function (filteredItems, value, index) {
    //             if (value) {
    //                 filteredItems.push(inputItems[index]);
    //             }

    //             return filteredItems;
    //         }, []);
    // }

    // baseMap(items, operation, callback, resultedMap);

    var result = {
        values: [],
        passedItemsCount: 0,
        errorOccurred: false
    };

    var errorOccurred = false;

    if (items.length === 0) {
        callback(null, items);
    } else {
        for (var i = 0; i < items.length; i++) {
            operation(items[i], operationCallback.bind(null, items[i], i));
        }
    }

    function operationCallback(item, index, error, data) {
        if (!data) {
            data = error;
            error = undefined;
        }

        if (error && !errorOccurred) {
            callback(error, data);
            errorOccurred = true;
        } else {
            result.values[index] = data ? item : false;
            result.passedItemsCount++;

            if (result.passedItemsCount === items.length) {
                result.values = result.values
                    .filter(function (element) {
                        return element;
                    });

                callback(null, result.values);
            }
        }
    }
};


// function baseMap(items, operation, callback, resultedMap) {
//     var result = {
//         values: [],
//         passedItemsCount: 0,
//         errorOccurred: false
//     };

//     if (items.length === 0) {
//         callback(null, items);
//     } else {
//         for (var i = 0; i < items.length && !result.errorOccurred; i++) {
//             operation(items[i], operationCallback.bind(null, i));
//         }
//     }

//     function operationCallback(index, error, data) {
//         if (!data) {
//             data = error;
//             error = undefined;
//         }

//         if (error && !result.errorOccurred) {
//             callback(error, data);
//             result.errorOccurred = true;
//         } else {
//             result.values[index] = data;
//             result.passedItemsCount++;

//             if (result.passedItemsCount === items.length) {
//                 var resultForCallback = resultedMap(result.values, items);
//                 callback(null, resultForCallback);
//             }
//         }
//     }
// }

/**
 * Асинхронизация функций
 * @param {Function} func – функция, которой суждено стать асинхронной
 * @returns {Function} - ассинхронная версия функции
 */
exports.makeAsync = function (func) {
    return function () {
        return setTimeout(function (args) {
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
