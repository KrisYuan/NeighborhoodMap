//Oriental Pearl TV Tower
var initLocation = {lat: 31.245, lng: 121.506};
var defaultLocations = [
	{
    	title: "Shanghai Science and Technology Museum",
		position: {lat: 31.222, lng: 121.553},
	},
  {
    	title: "Jinmao Building",
		position: {lat: 31.240, lng: 121.511},
	},
  {
    	title: "People's Square",
		position: {lat: 31.238, lng: 121.479},
	},
  {
    	title: "Jing An Temple",
		position: {lat: 31.229, lng: 121.452},
	},
  {
    	title: "Shanghai Jiaotong University",
		position: {lat: 31.205, lng: 121.441},
	}];


var map;
function initMap() {
	// Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(31.2, 121.5),
        zoom: 12
    });

    ko.applyBindings(new ViewModel());
}

var wikiURL ='https://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=wikiCallBack&search=';

// LocationItem Model
var LocationItem = function (data) {
  var location = this;

	this.title = ko.observable(data.title);
	this.lat = ko.observable(data.position.lat);
	this.lng = ko.observable(data.position.lng);
	this.marker = new google.maps.Marker({
         position: new google.maps.LatLng(location.lat(), location.lng()),
         map: map,
         title: String(location.title())
     });
	var displayTitle, contentStr, wikiLink;
  var searchWiki = location.title();
  var contentTemplete;
	$.ajax({
  		url: wikiURL + searchWiki,
  		dataType: 'jsonp',
  		jsonp: "callback"
    }).done(function (response) {
  			//The response is an array which contains four objects.
  			// Object in index 1 is title. Display the first title.
  			displayTitle = response[1][0];
  			// Object in index 2 is detail information. Display the first detal information.
  			contentStr = response[2][0];
  			// Object in index 3 is link array. Display the first link.
  			wikiLink = response[3][0];

        contentTemplete = '<div id="content">'+
      '<h1 id="headline">'+ displayTitle +'</h1>'+
      '<div id="bodyContent">'+
      '<p>'+ contentStr +'</p>'+
      '<p>WikiLink: <a href="'+ wikiLink +'">'+ wikiLink +'</a> '+
      '</p>'+
      '</div>'+
      '</div>';
        location.infowindow = new google.maps.InfoWindow({content: contentTemplete});
  		}).fail(function (e) {
  			contentTemplete = '<p>Sorry, no information avaliable, please try again later.<p>';
        location.infowindow = new google.maps.InfoWindow({content: contentTemplete});
  		});

	// Add listener to animate and open infoWindow upon click
  this.marker.addListener('click', function toggleBounce() {

      // Open infoWindow
      location.infowindow.open(map, location.marker);

      // Close window after 5 seconds
      setTimeout(function () {
        location.infowindow.close();
      }, 5000);

      location.marker.setAnimation(google.maps.Animation.BOUNCE);
      
      // Add timeout function to have marker bounce once
      setTimeout(function () {
        location.marker.setAnimation(null);
      }, 700);
    });
  this.marker.setMap(map);
};


var ViewModel = function() {
	// Make ViewModel Accessible
	var self = this;
  	// Store all locations in locationArray
  	this.locationArray = ko.observableArray([]);
	// Create location item for each location in defaultLocations
	// Store newly created item in locationArray
	defaultLocations.forEach(function(data) {
		self.locationArray.push(new LocationItem(data));
	});
  	// console.log(self.locationArray());

  this.filter = ko.observable('');
  this.filteredItems = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      for(var i = 0; i < self.locationArray().length; i++){
        self.locationArray()[i].marker.setVisible(true);
      }
      return self.locationArray();
    } else {
      return ko.utils.arrayFilter(self.locationArray(), function(item){
        var visible = item.title().toLowerCase().indexOf(filter) > -1;
        item.marker.setVisible(visible);
        return visible;
      });
    }
  });

  this.listItemClicked = function(location) {
    google.maps.event.trigger(location.marker,'click');
  }

  this.showSidebar = ko.observable();
  this.sideContent = document.getElementById('side-content');
  this.toggleSidebar = function(){
    self.showSidebar(!self.showSidebar());
    self.sideContent.style.display = self.showSidebar() === true ? "inline-block" : "none";
   }
};


function handleError() {
	//Handle Load Map Error
	$('#error-handling').html('Failed to load Google Maps. Please check your network and try again.');
}







