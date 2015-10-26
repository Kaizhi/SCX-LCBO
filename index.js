var express = require('express');
var router = express.Router();
var request = require('superagent');
var async = require('async');
var app = express();
var cache = require('memory-cache');
var exphbs = require('express-handlebars');

app.set('access_key', 'MDowMDYwY2RlNi03YjYwLTExZTUtOTQ0Ni01Zjk3YzRjNGJkMzI6czB6amthYW13dVZmM3NyNlIxQTNtYVNndHhzVXNqbGptNWJr');
app.set('api_url', 'https://lcboapi.com/stores/511/products/?q=Beer&where_not=is_dead,is_discontinued&per_page=100&access_key=' + app.get('access_key'));

app.get('/', function(req, res, next) {
	res.render('home');
});

app.get('/beers', function (req, res, next) {

	var asyncTasks = [],
		urls = [],
		baseURL = app.get('api_url');

	// If we have the results cached, return those and skip the fetch step
	if (cache.get('beers')) {
		res.json(cache.get('beers'));
		return;
	}

	// Have to make this initial request to check the total number of pages
	request('GET', app.get('api_url'))
	.end(function(err, response) {

		// Once we have the total pages, we can set up a list of requests to execute in parallel in order to fetch
		// all the pages at once
		res.locals.totalPages = response.body.pager.total_pages;
		for (var i=1; i <= res.locals.totalPages; i++) {
			urls.push(baseURL + '&page=' + i);
		}

		urls.forEach(function(url, index) {
			asyncTasks[index] = function(callback) {
				request('GET', url)
				.end(function(err, result) {
					callback(null, result.body.result);
				});
			}
		});

		async.parallel(asyncTasks, function(err, results) {
			var merged = [].concat.apply([], results); // Flatten our pages of results into one array
			// Reduce the data down to only what we need
			merged = merged.map(function(beer) {
				return {
					id: beer.id,
					name: beer.name
				};
			});
			// Cache the results in memory
			cache.put('beers', merged);
			res.json(merged);
		});
	});
});

var hbs = exphbs.create({
	defaultLayout: 'home',
	layoutsDir: __dirname + '/views'
});

app.use(require('compression')()); // gzip compression
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});