var map;
var isDemo = true;
var reportDialog, addDialog, addIntroDialog;;
var sponsorList = [];
var sponsorIndex = [0,0];

ymaps.ready(yMapsReady);
$(document).ready(jqReady);


function jqReady() {
    /*$.getJSON( "/s.json",function( data ) {
        sponsorList = data.sponsorList;
        updateFooterSponsor();
        var sponsorTimer = setInterval(updateFooterSponsor, 9000);
    });
*/
	new jBox('Modal', {
	  attach: 'a.signup',
	  content: $('form#signup'),
	  maxWidth: 400
	});
	$('form#signup').ajaxForm( {
        target: 'form#signup .result', 
        clearForm:1
    } );	

    $("footer").on("click", "a.login", function(){
        new jBox('Modal', {
          content: $('form#login'),
          maxWidth: 400
        }).open();
        $('form#login').on("submit", function(e){
            pw = $(this).find("input:first").val();
            setCookie("password", pw);
            // just reload this page
            return true;
        });
    });
    
    $("#map").on("click", "a.report", function(e){
        e.preventDefault();
        if(!reportDialog) {
            reportDialog = new jBox('Modal', {
                content: $('form#report'),
                maxWidth: 400,
                onClose: function(){
                    $(reportDialog.content).find(".result").text('');
                    $(reportDialog.content).find("textarea").val('');
                }
            });
        }
        var id = $(this).data('id');
        reportDialog.open();
        $(reportDialog.content).find("input[name=id]").val(id);
        $(reportDialog.content).find("b").text(id);
    });
    $('form#report').ajaxForm( {target: 'form#report .result', clearForm:1} );  

    $("footer").on("click", "a.add", function(e){
        e.preventDefault();

        if(!addDialog) {
            addDialog = new jBox('Modal', {
                content: $('form#add'),
                maxWidth: 400,
                onClose: function(){
                    $(addDialog.content).find(".result").text('');
                        map.toggleMode(1);
                    }
            });
            $('form#add').on("click", "a.close", function(){
                addDialog.close();
            }) ;
        }
        if(!addIntroDialog) { 
            addIntroDialog = new jBox('Modal', {
                content: $('form#addIntro'),
                // attach: 'form#addIntro a.close', 
                maxWidth: 400,
            });
            $('form#addIntro').on("click", "a", function(){
                addIntroDialog.close();
            });
        }
        addIntroDialog.open();
        map.toggleMode(2);
    });

    $('form#add').ajaxForm( {target: 'form#add .result', clearForm:1 } ); 


}

function yMapsReady () {
    map = new ymaps.Map("map", {
            center: [54.65395732812913, 73.55949067809733],
            zoom: 4,
            controls: ['zoomControl', 'typeSelector']
        }, {

        });

    var pointsObjectManager = new ymaps.ObjectManager({
            clusterize: true,
            gridSize: 64
        });

    var password = getCookie("password");
    // console.log("ajax load start");
    $.ajax({
        url: "//api2.ru/gdeplaton/api.php?f=getPoints&password="+password,
        dataType: "json"
    }).done(function(data) {
        pointsObjectManager.removeAll().add(data);  
        
        isDemo = data.features.length < 100;
        $(".demo").toggle(isDemo);

        map.toggleMode(1);
    });     


    // Создание макета содержимого балуна.
    // Макет создается с помощью фабрики макетов с помощью текстового шаблона.
    BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="balloon">' +
        '<h3>Рамка {{properties.id}}</h3>' +
        '<p>{{properties.c}}</p>'+
        '<ul>'+
            '<li class="report"><i class="fa fa-exclamation-triangle"></i> <a href="//docs.google.com/forms/d/e/1FAIpQLSf9nNh5pn5pDnwqC2_fNvJOpYtOtvFjhBOeDCxCMtouNfQY7Q/viewform?usp=pp_url&entry.5250015={{properties.id}}" target="_new"> Сообщить об ошибке</a>' +
            '</ul>'+     
        '</div>'     
        
        , {
        build: function () {
            // Сначала вызываем метод build родительского класса.
            BalloonContentLayout.superclass.build.call(this);
            //$('.balloon .s .t').html(getSponsor(1));
        },
        clear: function () {
            BalloonContentLayout.superclass.clear.call(this);
        },
    });

    // Чтобы задать опции одиночным объектам и кластерам,
    // обратимся к дочерним коллекциям ObjectManager.
    pointsObjectManager.objects.options.set('preset', 'islands#blueIcon');
    pointsObjectManager.clusters.options.set('preset', 'islands#blueClusterIcons');
    pointsObjectManager.objects.options.set('balloonContentLayout', BalloonContentLayout); 


    map.toggleMode = function(mode) {
        if(mode == 1) {
            map.geoObjects.removeAll().add(pointsObjectManager); 
            map.setCenter([54.65395732812913, 73.55949067809733]);
            map.setZoom(4);
            return;
        }

        if(mode == 2) {
            myPlacemark = new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: [60.68, 61.35]
                },
                properties: {
                    iconContent: "Рамка тут",
                    hintContent: 'Перетащите в нужное место, затем нажмите на нее'
                }
            }, {
                preset: 'islands#redStretchyIcon',
                draggable: true,
                //balloonContentLayout: BalloonContentLayout 
            });
            myPlacemark.events.add('dragend', function (e) {
                c = e.get('target').geometry.getCoordinates();
                $("form#add").find("c").text(c[0].toFixed(6) + " "+ c[1].toFixed(6));
                $("form#add").find("input[name=lat]").val(c[0]);
                $("form#add").find("input[name=lon]").val(c[1]);
            });
            myPlacemark.events.add('click', function (e) {
                addDialog.open();
            });
            
            map.geoObjects.removeAll().add(myPlacemark);
            map.setCenter([60.68, 61.35]);
            map.setZoom(5);
            return;
        }
        
    }  
}

/*function updateFooterSponsor(){
    $("footer ul.s span").fadeOut(function(){
        $(this).html(getSponsor());
        $(this).fadeIn(function(){
            if( $("footer ul.s li").is(":hidden") ) {
                $("footer ul.s li").fadeIn()
            }
        });
    });
}*/

/*function getSponsor(type=0) {
    sponsorIndex[type]++;
    if(sponsorIndex[type] >= sponsorList.length) 
        sponsorIndex[type] = 0;
    i = sponsorIndex[type];
    if(typeof sponsorList[i] == "undefined") 
        return "";
    var s = '<a href="'+sponsorList[i][1]+'" target="_new">'+sponsorList[i][0]+'</a>';
    return s;
}*/


function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

