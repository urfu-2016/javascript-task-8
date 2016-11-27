/* eslint-env mocha */
/* eslint-disable no-shadow */
/* eslint-disable max-nested-callbacks  */
/* eslint-disable no-empty-function  */
/* eslint-disable handle-callback-err  */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var flow = require('./flow');
var directory = './data/';

describe('flow', function () {
    describe('serial', function () {
        it('должен правильно посчитать суммарную стоимость [*]', function (done) {
            var jsonParseAsync = flow.makeAsync(JSON.parse);

            flow.serial([
                function (next) {
                    fs.readdir(directory, next);
                },

                flow.makeAsync(function (files) {
                    return files.map(function (dir) {
                        return path.join(directory, dir);
                    });
                }),

                function (files, next) {
                    flow.filterLimit(files, 2, function (file, next) {
                        fs.stat(file, function (err, stat) {
                            next(err, stat && stat.size > 0);
                        });
                    }, next);
                },

                function (files, next) {
                    flow.mapLimit(files, 2, fs.readFile, next);
                },

                function (files, next) {
                    flow.map(files, jsonParseAsync, next);
                },

                flow.makeAsync(function (contents) {
                    return contents.reduce(function (sum, content) {
                        return sum + content.price;
                    }, 0);
                })

            ], function (error, total) {
                assert.ifError(error);
                assert.strictEqual(total, 111000);

                done();
            });
        });

        it('should stop on exception', function (done) {
            flow.serial([
                function (next) {
                    setTimeout(function () {
                        next(new TypeError(), 123);
                    }, 0);
                },
                function (data, next) {
                    setTimeout(function () {
                        next(new RangeError(), 324);
                    });
                }
            ], function (error, data) {
                assert.strictEqual(data, undefined);
                assert.ok(error instanceof TypeError);

                done();
            });
        });

        it('should stop on falsy operations', function (done) {
            flow.serial(undefined,
                function (error, data) {
                    assert.strictEqual(error, undefined);
                    assert.strictEqual(data, undefined);
                    done();
                });
        });
    });

    describe('makeAsync', function () {
        var asyncConcat = flow.makeAsync(function (a, b) {
            return a.concat(b);
        });

        it('should make synchronous function asynchronous (1)', function (done) {
            asyncConcat([3], [4], function (error, data) {
                assert.ifError(error);
                assert.deepEqual(data, [3, 4]);

                done();
            });
        });

        it('should make synchronous function asynchronous (2)', function (done) {
            asyncConcat(null, [3], function (error) {
                assert.ok(error instanceof TypeError);

                done();
            });
        });
    });

    describe('mapLimit', function () {
        function mapIteratee(callOrder, x, callback) {
            setTimeout(function () {
                callOrder.push(x);
                callback(null, x * 2);
            }, x * 25);
        }

        it('should make correct mapping, i.e. save the order', function (done) {
            var asyncSum = flow.makeAsync(function (a) {
                return a + 5;
            });
            flow.mapLimit([1, 2, 3, 4], 3, asyncSum,
                function (error, result) {
                    assert.ifError(error);
                    assert.deepEqual(result, [6, 7, 8, 9]);

                    done();
                });
        });

        it('should stop on first exception', function (done) {
            flow.mapLimit([1, 2, 3, 4], 2,
                flow.makeAsync(function (item) {
                    if (item === 3) {
                        throw new TypeError();
                    }

                    return 10 - item;
                }),
                function (error, data) {
                    assert.ok(error instanceof TypeError);
                    assert.ok(!data);

                    done();
                }
            );
        });

        it('mapLimit does not continue replenishing after error', function (done) {
            var started = 0;
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var delay = 10;
            var limit = 3;
            var maxTime = 10 * arr.length;

            flow.mapLimit(arr, limit, function (x, callback) {
                started++;
                if (started === 3) {
                    return callback(new Error ('Test Error'));
                }
                setTimeout(function () {
                    callback();
                }, delay);
            }, function () {});

            setTimeout(function () {
                assert.strictEqual(started, 3);
                done();
            }, maxTime);
        });

        it('mapLimit error', function (done) {
            var arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            var callOrder = [];

            flow.mapLimit(arr, 3, function (x, callback) {
                callOrder.push(x);
                if (x === 2) {
                    callback('error');
                }
            }, function (err) {
                assert.deepEqual(callOrder, [0, 1, 2]);
                assert.strictEqual(err, 'error');
            });
            setTimeout(done, 25);
        });

        it('mapLimit zero limit', function (done) {
            flow.mapLimit([0, 1, 2, 3, 4, 5], 0, function (x, callback) {
                assert(false, 'iteratee should not be called');
                callback();
            }, function (err, results) {
                assert.deepEqual(results, []);
                assert(true, 'should call callback');
            });
            setTimeout(done, 25);
        });

        it('mapLimit limit equal size', function (done) {
            var callOrder = [];
            flow.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 10, mapIteratee.bind(null, callOrder),
                function (err, results) {
                    assert.deepEqual(callOrder, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    assert.deepEqual(results, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
                    done();
                });
        });

        it('map original untouched', function (done) {
            var a = [1, 2, 3];
            flow.map(a, function (x, callback) {
                callback(null, x * 2);
            }, function (err, results) {
                assert.deepEqual(results, [2, 4, 6]);
                assert.deepEqual(a, [1, 2, 3]);
                done();
            });
        });

        it('map error', function (done) {
            flow.map([1, 2, 3], function (x, callback) {
                callback('error');
            }, function (err) {
                assert.strictEqual(err, 'error');
            });
            setTimeout(done, 50);
        });

        it('map undefined array', function (done) {
            flow.map(undefined, function (x, callback) {
                callback();
            }, function (err, result) {
                assert.strictEqual(err, null);
                assert.deepEqual(result, []);
            });
            setTimeout(done, 50);
        });

        it('mapLimit', function (done) {
            var callOrder = [];
            flow.mapLimit([2, 4, 3], 2, mapIteratee.bind(null, callOrder), function (err, results) {
                assert(err === null, err + ' passed instead of "null"');
                assert.deepEqual(callOrder, [2, 4, 3]);
                assert.deepEqual(results, [4, 8, 6]);
                done();
            });
        });

        it('mapLimit empty array', function (done) {
            flow.mapLimit([], 2, function (x, callback) {
                assert(false, 'iteratee should not be called');
                callback();
            }, function (err) {
                if (err) {
                    throw err;
                }
                assert(true, 'should call callback');
            });
            setTimeout(done, 25);
        });

        it('mapLimit undefined array', function (done) {
            flow.mapLimit(undefined, 2, function (x, callback) {
                callback();
            }, function (err, result) {
                assert.strictEqual(err, null);
                assert.deepEqual(result, []);
            });
            setTimeout(done, 50);
        });

        it('mapLimit limit exceeds size', function (done) {
            var callOrder = [];
            flow.mapLimit([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 20, mapIteratee.bind(null, callOrder),
                function (err, results) {
                    assert.deepEqual(callOrder, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    assert.deepEqual(results, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
                    done();
                });
        });
    });
});
