/* eslint-env mocha */
/* eslint-disable no-shadow */
'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');

var flow = require('./flow');
var directory = './data/';

describe('flow', function () {
    it('должен правильно посчитать суммарную стоимость', function (done) {
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
                flow.filter(files, function (file, next) {
                    fs.stat(file, function (err, stat) {
                        if (err) {
                            return next(err);
                        }

                        // Первый аргумент соответствует ошибке
                        next(null, stat.size > 0);
                    });
                }, next);
            },

            function (files, next) {
                flow.map(files, fs.readFile, next);
            },

            function (files, next) {
                flow.map(files, jsonParseAsync, next);
            }

        ], function (error, contents) {
            assert.ifError(error);

            var total = contents.reduce(function (sum, content) {
                return sum + content.price;
            }, 0);

            assert.strictEqual(total, 111000);

            done();
        });
    });

    if (flow.isStar) {
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
    }
});
