
$(function () {

    //size the map appropriately

    $(window).resize(function () { resizeWindow() });
    resizeWindow();
    function resizeWindow() {
        var height = $(window).height() - 40 - $('#toolbar').height() - $('#subToolbar').height() - $('#footer').height();
        var width = $(window).width();
        var scale = width > height ? height / 840 : width / 1030;

        $('#content').css('left', (width / 2 - 931 / 2) + 'px');
        $('#content').css('transform', 'scale(' + scale + ')');
    }

    if (mode == 1)
        $('#subToolbar').css('visibility', 'hidden')

    GetLot();

    //get data from server
    function GetLot() {
        $.ajax({
            url: GetLotURL,
            success: function (lot) {
                buildLot();
                renderLot(lot);
            },
            error: function () {
                alert("error");
            }
        });
    }

    //bind data to real-time connection
    var me = $.connection.lotHub;
    $.connection.hub.start().done();
    me.client.render = function (lot) { renderLot(lot.Data); }

    //render lot function
    function renderLot(lot) {
        var total = 210
        var totalTaken = 0;

        var minAge;
        var maxAge = lot.Age[0];
        var minHist = lot.History[0];
        var maxHist = lot.History[0];

        for (var i = 0; i < 210; i++) {

            if (lot.Occupancy[i] == 1) {
                if (minAge == null && lot.Age[i] != 0) minAge = lot.Age[i];
                if (!$('#car' + i).hasClass('taken')) {
                    $('#car' + i).fadeTo(300, 1);
                    $('#car' + i).addClass('taken');
                }
                totalTaken++;
            }
            else {
                if ($('#car' + i).hasClass('taken')) {
                    $('#car' + i).removeClass('taken');
                    for (j = 0; j < 3; j++) {
                        $('#car' + i).fadeTo(300, 1).fadeTo(300, 0.0);
                    }
                }
            }

            minAge = lot.Age[i] < minAge && lot.Age[i] != 0 ? lot.Age[i] : minAge;
            maxAge = lot.Age[i] > maxAge ? lot.Age[i] : maxAge;
            minHist = lot.History[i] < minHist ? lot.History[i] : minHist;
            maxHist = lot.History[i] > maxHist ? lot.History[i] : maxHist;

            $('#car' + i).data('age', lot.Age[i] ? lot.Age[i] : 0);
            $('#car' + i).data('history', lot.History[i] ? lot.History[i] : 0);
        }

        if (mode == 2)
            buildHeatMap('history', minHist, maxHist)
        if (mode == 3)
            buildHeatMap('age', minAge, maxAge)

        //change and animate counts
        $('#total').html('<span class="yellow">' + totalTaken + '</span><span>/' + total + '</span>');
        $('#capacity').width((totalTaken / total * 100) - 1 + "%");
        $('#capacity-neg').width(((1 - totalTaken / total) * 100) - 1 + "%");
        if (totalTaken >= total) {
            $('#capacity').addClass('lot-full');
            $('#total').children().addClass('red-text');
        } else {
            $('#capacity').removeClass('lot-full');
            $('#total').children().removeClass('red-text')
        }

    }

    function buildHeatMap(data, min, max) {
        if (min == max) max++;
        $('.car').each(function () {
            if (data == 'history') $(this).css('opacity', 1);
            var c = ($(this).data(data) - min) / (max - min);
            $(this).css("background", 'hsl(' + ((c * -100) + 100) + ',100%,50%)');
        });

        $('#capacity').remove();
        $('#capacity-neg').remove();

        var str = '<div class="heatmap-container"><span>car ' + data + " heat map</span>"
        str+='<div class="heatmap"><span>';
        str += (data == 'history' ? 'Low Freq.' : 'Recent') + '</span><span>';
        str += (data == 'history' ? 'High Freq.' : 'Older') + '</span></div></div>';
        $('#lotTitle').html(str);
    }


    //buid spots
    function buildLot() {
        var index = 0;
        var str = "";
        for (var r = 0; r < rows.length; r++) {
            str += '<div class="row ' + rows[r].direction + '" style="';
            str += rows[r].style + '">';

            for (var i = 0; i < rows[r].spots; i++) {
                str += '<div id="car' + index + '" class="car';
                str += handicaps.indexOf(index) > -1 ? ' handicap' : '';

                var margin = gaps[index] ? gaps[index] : 7.9;
                str += '" style="margin-' + rows[r].direction + ': ' + margin + 'px" ';
                str += 'data-history data-age>';

                if (handicaps.indexOf(index) > -1) {
                    var faRotate = rows[r].direction == "left" ? "fa-rotate-180" : "fa-rotate-90";
                    str += '<i class="fa fa-wheelchair ' + faRotate + '"></i>';
                }

                str += '</div>';
                index++;
            }
            str += '</div>';
        }
        $('#Lot').html(str);
    }

    //structure uf parking lot----------------------

    //10 rows
    var rows = [
        { spots: 24, style: "top: 623px; right: 185px; -webkit-flex-direction: row-reverse", direction: 'left' },
        { spots: 19, style: "bottom: 110px; left: 54px; -webkit-flex-direction: column-reverse", direction: 'top' },
        { spots: 28, style: "top: 27px; left: 184px; -webkit-flex-direction: row", direction: 'right' },
        { spots: 18, style: "top: 84px; right: 56px; -webkit-flex-direction: column", direction: 'bottom' },
        { spots: 26, style: "top: 512px; right: 173px; -webkit-flex-direction: row-reverse", direction: 'left' },
        { spots: 11, style: "top: 460px; left: 170px; -webkit-flex-direction: row", direction: 'right' },
        { spots: 12, style: "top: 350px; right: 173px; -webkit-flex-direction: row-reverse", direction: 'left' },
        { spots: 24, style: "top: 298px; left: 171px; -webkit-flex-direction: row", direction: 'right' },
        { spots: 23, style: "top: 190px; right: 173px; -webkit-flex-direction: row-reverse", direction: 'left' },
        { spots: 25, style: "top: 137px; left: 171px; -webkit-flex-direction: row", direction: 'right' },
    ]

    //handicap spot0
    var handicaps = [22, 23, 71, 72, 73, 74, 75, , 76, 77, 78];

    //margins for gaps
    var gaps = [];
    gaps[22] = 28;
    gaps[27] = 15;
    gaps[32] = 64;
    gaps[38] = 24;
    gaps[71] = 21;
    gaps[73] = 30;
    gaps[74] = 21;
    gaps[76] = 21;
    gaps[78] = 45;
    gaps[84] = 27;
    gaps[121] = 353;
    gaps[130] = 329;
    gaps[140] = 54;
    gaps[182] = 78;
    gaps[189] = 32;
});