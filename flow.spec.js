/* eslint-env mocha */
/* eslint-disable no-shadow */
/* eslint-disable max-nested-callbacks  */
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
    });
});
