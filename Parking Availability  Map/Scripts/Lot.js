
$(function () {

    $('#content').width(931);
    $('#lotContainer').width(931);
    $('#lotContainer').height(700);
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
        var total = lot.Occupancy.length;
        var totalTaken = 0;
        var minAge = lot.Age[0];
        var maxAge = lot.Age[0];
        var minHist = lot.History[0];
        var maxHist = lot.History[0];
        for (var i = 0; i < 210; i++) {
            if (mode <= 1) {
                if (lot.Occupancy[i] == '1') {
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
            }

            minAge = lot.Age[i] < minAge ? lot.Age[i] : minAge;
            maxAge = lot.Age[i] > maxAge ? lot.Age[i] : maxAge;
            minHist = lot.History[i] < minHist ? lot.History[i] : minHist;
            maxHist = lot.History[i] > maxHist ? lot.History[i] : maxHist;

            $('#car' + i).data('age', lot.Age[i] ? lot.Age[i] : 0);
            $('#car' + i).data('history', lot.History[i] ? lot.History[i] : 0);
        }

        if (mode == 2)
            $('.car').each(function () {
                $(this).css('opacity', 1);
                var c = ($(this).data('history') - minHist) / (maxHist - minHist);
                $(this).css("background", 'hsl(' + ((c * -100) + 100) + ',100%,50%)');
            });
        if (mode == 3)
            $('.car').each(function () {
                $(this).css('opacity', 1);
                var c = ($(this).data('age') - minAge) / (maxAge - minAge);
                $(this).css("background", 'hsl(' + ((c * -100) + 100) + ',100%,50%)');
            });

        $('#total').html('<span class="red">' + totalTaken + '</span>/' + total + '</span>');
        $('#capacity').width((totalTaken / total * 100) - 1 + "%");
        $('#capacity-neg').width(((1 - totalTaken / total) * 100) - 1 + "%");
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
                str += '" style="margin-' + rows[r].direction + ': ' + margin + 'px">';

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
        { spots: 24, style: "top: 623px; right: 185px; flex-direction: row-reverse", direction: 'left' },
        { spots: 19, style: "bottom: 106px; left: 54px; flex-direction: column-reverse", direction: 'top' },
        { spots: 28, style: "top: 27px; left: 184px; flex-direction: row", direction: 'right' },
        { spots: 18, style: "top: 84px; right: 56px; flex-direction: column", direction: 'bottom' },
        { spots: 26, style: "top: 512px; right: 173px; flex-direction: row-reverse", direction: 'left' },
        { spots: 11, style: "top: 460px; left: 170px; flex-direction: row", direction: 'right' },
        { spots: 12, style: "top: 350px; right: 173px; flex-direction: row-reverse", direction: 'left' },
        { spots: 24, style: "top: 298px; left: 170px; flex-direction: row", direction: 'right' },
        { spots: 23, style: "top: 190px; right: 173px; flex-direction: row-reverse", direction: 'left' },
        { spots: 25, style: "top: 137px; left: 170px; flex-direction: row", direction: 'right' },
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