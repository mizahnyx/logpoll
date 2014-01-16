
(function () {
    var readConfig = function () {
        var d = $.Deferred();
        $.ajax("list").done(function (data) {
            var fileNames = data.split("|");
            var fileSeeks = [];
            $.each(fileNames, function (i, v) {
                fileSeeks.push(0);
            });
            d.resolve({
                files: fileNames,
                seeks: fileSeeks
            });
        });
        return d.promise();
    };

    var initInterface = function (config) {
        var $tabs = $('#log-tabs');
        var $content = $('#log-content');
        var d = $.Deferred();
        $.each(config.files, function (i, file) {
            if (i == 0) {
                $tabs.append(
                    '<li class="active"><a href="#log-'+i+'" data-toggle="tab">'+file+'</a></li>');
                $content.append(
                    '<div class="tab-pane active" id="log-'+i+'"></div>');
            } else {
                $tabs.append(
                    '<li><a href="#log-'+i+'" data-toggle="tab">'+file+'</a></li>');
                $content.append(
                    '<div class="tab-pane" id="log-'+i+'"></div>');
            }
        });
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var targetSelector = $(e.target).attr('href');
            var $table = $(targetSelector).find('table');
            if ($table[0]) {
                $table[0].scrollTop = $table[0].scrollHeight;
            }
        });
        d.resolve(config);
        return d.promise();
    };

    var loadInitialFiles = function (config) {
        var $deferreds = [];
        var d = $.Deferred();
        $.each(config.files, function (i, file) {
            var $content = $('#log-'+i);
            var $table = $(
                '<table class="table table-striped table-condensed"></table>');
            $content.append(
                '<p><a href="full/'+i+'">Descargar '+file+'</a></p>');
            $content.append($table);
            $deferred = $.ajax("full/"+i);
            $deferred.done(function (rawData) {
                var data = $.trim(rawData);
                config.seeks[i] = rawData.length;
                $.each(data.split("\n"), function (j, line) {
                    var escapedLine =
                        $('<div/>').text(line).html();
                    $table.append('<tr><td>'+escapedLine+'</td></tr>');
                });
                $table[0].scrollTop = $table[0].scrollHeight;
            });
            $deferreds.push($deferred);
        });
        $.when.apply($, $deferreds).then(function () {
            d.resolve(config);
        });
        return d.promise();
    };

    var updateLogs = function (config) {
        setInterval(function () {
            $.each(config.files, function (i, file) {
                var $content = $('#log-'+i);
                var $table = $('#log-'+i+'>table');
                $.ajax("incremental/"+i+"/"+config.seeks[i])
                    .done(function (rawData) {
                        var data = $.trim(rawData);
                        config.seeks[i] += rawData.length;
                        if (data.length > 0) {
                            $.each(data.split("\n"), function (j, line) {
                                var escapedLine =
                                    $('<div/>').text(line).html();
                                $table.append('<tr><td>'+escapedLine+'</td></tr>');
                            });
                            $table[0].scrollTop = $table[0].scrollHeight;
                        }
                    });
            });
        }, 500);
    };


    readConfig()
        .pipe(initInterface)
        .pipe(loadInitialFiles)
        .pipe(updateLogs);
})();
