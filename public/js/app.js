(function($) {
	var getRandomBeer = function(beers) {
		return beers[Math.floor(Math.random() * beers.length)];
	};

	$(document).ready(function() {
		$.get('/beers')
		.then(function(data) {
			// Generate an array of Ids and a has of id:names for convenience
			var beerIds = data.map(function(item){
					return item.id;
				}),
				beers = {},
				chosenBeerId;

			data.forEach(function(item) {
				beers[item.id] = item.name;
			});

			// If we have previously shown beers, grab them from localstorage
			if (localStorage.getItem('shownBeers')) {
				var shownBeers = JSON.parse(localStorage.getItem('shownBeers'));
				// Remove the previously shown beerIds from the total list of ids
				beerIds = beerIds.filter(function(obj) {
					return shownBeers.indexOf(obj) == -1;
				});
				//Pick a new one at random and add it to shown localstorage
				var chosenBeerId = getRandomBeer(beerIds);
				shownBeers.push(chosenBeerId);
				localStorage.setItem('shownBeers', JSON.stringify(shownBeers));
			} else {
				localStorage.setItem('shownBeers', JSON.stringify([item.id]));
			}

			$('.spinner').hide();
			$('.beer-name').text(beers[chosenBeerId]).addClass('show');
		});
	});
})($);