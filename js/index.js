var styles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "administrative.neighborhood",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
]

var map;
var eventsObj = [];
var eventmarks = [];
moment.lang('es');

//GOOGLE MAPS
function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {lat: 41.3866722, lng: 2.1671486},
    disableDefaultUI: true
  });
  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow;

  map.setOptions({styles: styles});

  document.getElementById('submit').addEventListener('click', function() {
    searchEvents(geocoder, map, infowindow);
    getEvents();
  });
}

function setEvents(res){
  eventsObj = res.events;
}

function getEvents(){
  return eventsObj;
}

function searchEvents(geocoder, map, infowindow){

    var token = 'J5673XJGW5P5EOVV32OY';
    var $events = $("#events");
    var address = document.getElementById('address').value;
    var latitude = 0;
    var longitude = 0;
    var keyword = document.getElementById('keyword').value;
    var radius = document.getElementById('radius').value;

    //Limpiamos marcadores anteriores
    for (var i = 0; i < eventmarks.length; i++) {
        eventmarks[i].setMap(null);
    }
    eventmarks = [];

    //Actualiza Google MAPS con posición de búsqueda
    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(11);

          //Preparados para mapear origen y posicionar eventos de búsqueda
          var origin = new google.maps.Marker({
            position: results[0].geometry.location,
            title: "Origen"
          });

          origin.setMap(map);

          //Actualizamos coordenadas de localización
          latitude = origin.position.lat();
          longitude = origin.position.lng();

          //Request a Eventbrite
          $.get('https://www.eventbriteapi.com/v3/events/search/?token='+token+'&location.latitude='+latitude+'&location.longitude='+longitude+'&location.within='+radius+'km&q='+keyword+'&expand=venue', function(res) {
              if(res.events.length) {
                  eventmarks = [res.events.length];
                  var s = "<ul class='eventList'>";
                  for(var i=0;i<res.events.length;i++) {
                      var event = res.events[i];
                      var eventTime = moment(event.start.local).format('LLLL');
                      console.dir(event);

                      s += "<li><a href='" + event.url + "'>" + event.name.text + "</a> - " + "<time datetime='" + event.start.local + "'>" + eventTime + "</time>" + "</li>";

                      //Situamos Marker para cada evento localizado
                      var latlng = {lat: parseFloat(event.venue.latitude), lng: parseFloat(event.venue.longitude)};
                      eventmarks[i] = new google.maps.Marker({
                        position: latlng,
                        title: event.name.text
                      });

                      var marker = eventmarks[i];
                      marker.setMap(map);

                      //Añadimos evento de obertura de markers
                      marker.addListener('click', function() {
                        var title = this.getTitle();
                        infowindow.setContent(title);
                        infowindow.open(map, this);
                      });
                  }
                  s += "</ul>";


                  $events.html(s);
              } else {
                  $events.html("<p>No hay ningún evento disponible.</p>");
              }
              setEvents(res);
          });
        } else {
          window.alert('No se han encontrado resultados');
        }
      } else {
        window.alert('Error de búsqueda, por favor, introduzca datos válidos');
      }
    });
};
