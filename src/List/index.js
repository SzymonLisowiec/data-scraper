const EventEmitter = require('events');
const Request = require('request');
const Cheerio = require('cheerio');
const Url = require('url');

class List extends EventEmitter {

	constructor (config) {
		super(config);

		this.config = Object.assign({
			url: false,
			delay: 1000,
			request: Request.defaults({jar: true})
		}, config);
		
		this.validateConfig();
		
		this.request = this.config.request;
		this.progress = null;
		this.parser = null;
		this.modifiers = [];
		this.filters = [];
		this.next_page = null;

		this.data = [];

		if(typeof this.config.base_url === 'undefined'){
			let url = Url.parse(this.config.url);
			this.config.base_url = url.protocol + '//' + url.host;
		}

	}

	validateConfig () {
		
		if(typeof this.config.url != 'string' || !Url.parse(this.config.url).hostname)
			throw new Error('`url` must be valid url.');

		if(this.config.base_url && (typeof this.config.base_url != 'string' || !Url.parse(this.config.url).base_url))
			throw new Error('`base_url` must be valid url.');
		
		if(!Number.isInteger(this.config.delay))
			throw new Error('`delay` must be integer.');

		if(!this.config.request instanceof Request)
			throw new Error('`request` must be instance of https://github.com/request/request');

	}

	setOption (option, value) {
		this.config[option] = value;
	}

	setNextPage (fn) {
		this.next_page = fn;
	}

	setProgress (fn) {
		this.progress = fn;
	}

	setParser (fn) {
		this.parser = fn;
	}

	addModifier (fn) {
		this.modifiers.push(fn);
	}

	addFilter (fn) {
		this.filters.push(fn);
	}

	loadPage (next_url) {

		return new Promise(resolve => {

			let req = {};

			if(next_url){

				req.url = next_url;
				if(!Url.parse(next_url).protocol)
					req.baseUrl = this.config.base_url;

			}else{

				req.url = this.config.url;
				
			}

			Request(req, (err, response, body) => {

				if(err){

					console.log(err);

				}else if(response.statusCode === 200){

					let source, data;

					if(response.headers && response.headers['content-type']){
						
						let content_type = response.headers['content-type'].split(';')[0].trim().toLowerCase();

						switch (content_type) {

							case 'text/html':
								source = Cheerio.load(body);
								break;

							case 'application/json':
								source = JSON.parse(body);
								break;

							default:
								source = body;
								break;

						}

					}else source = body;
					
					data = source;
					
					if(this.progress)
						this.progress(data);

					data = this.parser(data);
					
					for(let i in this.modifiers)
						data = data.map(this.modifiers[i].bind(this));

					for(let i in this.filters)
						data = data.filter(this.filters[i].bind(this));

					this.data = this.data.concat(data);
					this.emit('data', data);

					let next_page = this.next_page(source, this.end);

					resolve(next_page);

				}else{

					console.log('Unexpected response status code (' + response.statusCode + ').');

				}

			});
			
		});

	}

	async do (next_page) {

		next_page = await this.loadPage(next_page);
		
		if(next_page === false){

			this.end();

		}else{

			if(this.config.delay)
				await this.wait(this.config.delay);

			this.do(next_page);

		}

	}

	run () {
		return new Promise(resolve => {

			this.do();

			this.once('end', data => {
				resolve(data);
			});

		});
	}

	end () {

		this.emit('end', this.data);

	}

	wait (time) {
		return new Promise(resolve => {
			let wait = setTimeout(_ => {
				clearTimeout(wait);
				resolve();
			}, time);
		});
	}

}

module.exports = List;