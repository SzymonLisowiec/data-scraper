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
			request: Request.defaults({jar: true}),
			type: 'html'
		}, config);
		
		this.request = this.config.request;
		this.progress = null;
		this.parser = null;
		this.modifiers = [];
		this.next_page = null;

		this.data = [];

		if(typeof this.config.base_url === 'undefined'){
			let url = Url.parse(this.config.url);
			this.config.base_url = url.protocol + '//' + url.host;
		}

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

					switch (this.config.type.toLowerCase()) {

						case 'html':
							source = Cheerio.load(body);
							break;

						case 'json':
							source = JSON.parse(body);
							break;

						default:
							source = body;
							break;

					}
					
					data = source;

					if(this.progress)
						this.progress(data);

					data = this.parser(data);
					
					for(let i in this.modifiers)
						data = data.map(this.modifiers[i]);
					
					this.data = this.data.concat(data);

					let next_page = this.next_page(source, this.end);

					resolve(next_page);
					
					this.emit('data', data);

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
		
		this.do();

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