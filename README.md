# Задача «Котофайлы»

Перед выполнением задания внимательно прочитайте:

- [О всех этапах проверки задания](https://github.com/urfu-2016/guides/blob/master/workflow/overall.md)
- [Как отправить пулл](https://github.com/urfu-2016/guides/blob/master/workflow/pull.md)
- [Как пройти тесты](https://github.com/urfu-2016/guides/blob/master/workflow/test.md)
- Правила оформления [javascript](https://github.com/urfu-2016/guides/blob/master/codestyle/js.md), [HTML](https://github.com/urfu-2016/guides/blob/master/codestyle/html.md) и [CSS](https://github.com/urfu-2016/guides/blob/master/codestyle/css.md) кода

## Основное задание

> Мы очень хотим, чтобы код вы написали сами, а не пользовались внешними библиотеками.

Интернет-магазин бабуленьки набирает популярность, количество котиков
непрерывно растёт и пора начать где-то хранить данные о них. Бабуленька любит
всё старомодное, поэтому хранить мы будем в старых-добрых файлах в папке `/data`.

Вот, например, данные о коте «Батончике»:

```js
{
    "name": "batonchik",
    "price": 99000
}
```

К счастью, в Node.JS много методов для работы с файлами:

- [fs.readFile](https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback)
- [fs.readdir](https://nodejs.org/api/fs.html#fs_fs_readdir_path_callback)
- [fs.stat](https://nodejs.org/api/fs.html#fs_fs_stat_path_callback)

Но они асинхронные, а значит нужна библиотека для удобной работы с ними `flow.js`:

__flow.serial([func1, func2], callback)__  
`serial` запускает асинхронные функции в массиве последовательно. Результат одной функции передаётся в следующую. Помимо результата функция получает колбэк. Колбэк принимает первым параметром ошибку, а вторым – данные для следующей функции. Если любая из функций передает в колбэк ошибку, то следующая не выполняется, а вызывается основной `callback`.

__flow.map(['value1', 'value2'], func, callback)__  
`map` запускает функцию `func` с каждым значением параллельно. Эта функция принимает значение из массива и колбэк. Значения обрабатываются функцией и собираются в массив, который передается в основной `callback` при завершении всех запусков.

__flow.filter(['value1', 'value2'], func, callback)__  
`filter` запускает функцию с каждым значением параллельно. Функция принимает значение из массива и колбэк. Значения фильтруются функцией и собираются в массив, который передается в основной `callback` при завершении всех запусков.

__flow.makeAsync(func)__
Функция превращает синхронную функцию в асинхронную. Например:

```js
flow.serial([
    function (next) {
        fs.readFile('./cats/barsik.json', next);
    },
    flow.makeAsync(JSON.parse)
], function (err, parsedJson) {
    console.info(parsedJson);
});
```

Пример работы с подробными комментариями можно традиционно найти в __index.js__ и в тестах.

## Дополнительное задание (+27 к концентрации)

> Перед выполнением внимательно прочитайте [про особенности](https://github.com/urfu-2016/guides/blob/master/workflow/extra.md)

Ещё парочка полезных методов:

__flow.mapLimit(['value1', 'value2'], limit, func, callback)__  
Аналог `map`, но ограничивает количество одновременно выполняемых операций параметром `limit`.

__flow.filterLimit(['value1', 'value2'], limit, func, callback)__  
Аналог `filter`, но ограничивает количество одновременно выполняемых операций параметром `limit`.

Примеры использования этих методов можно посмотреть в __index.js__ и в тестах.

![](https://cloud.githubusercontent.com/assets/4534405/11371012/0275bd18-92e8-11e5-8b65-08bc10d6d5bf.jpg)
