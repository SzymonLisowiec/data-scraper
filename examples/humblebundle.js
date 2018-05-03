const ListScrapper = require('../').List;

class Main {

	constructor () {

		this.scrapper = new ListScrapper({
			url: 'https://www.humblebundle.com/store/api/search?sort=alphabetical&filter=all&request=1&page_size=20',
			type: 'json'
		});

		/**
		 * Set a function to displaying progress of data scraping.
		 */
		this.scrapper.setProgress(data => {

			let page = data.page_index;
			let pages = data.num_pages - 1;

			console.log('Page: ' + page + '/' + pages);

		});

		/**
		 * Set a function to specify next page.
		 */
		this.scrapper.setNextPage(data => {

			let page = data.page_index;
			let pages = data.num_pages - 1;
			let next_page = page + 1;

			if(next_page <= pages)
				return this.scrapper.config.url + '&page=' + next_page;

			return false;
		});

		/**
		 * Set a paraser function. Paraser scraping data from a server response.
		 */
		this.scrapper.setParser(data => {
			return data.results;
		});

		/**
		 * Add a modifier function to modify scraped data.
		 */
		this.scrapper.addModifier(product => {
			let p = {
				name: product.human_name
			};

			if(product.cta_badge){
				p.state = product.cta_badge;
			}else{

				if(product.full_price){
					p.price = parseInt((product.full_price[0]*100).toFixed(0));
					p.price_currency = product.full_price[1];
				}
			}

			return p;
		});

		this.scrapper.on('end', products => {
			//Save all scraped data to file
			require('fs').writeFileSync(__dirname + '/humblebundle.json', JSON.stringify(products, null, 2));
		});
		
		this.scrapper.run();

	}

}

module.exports = new Main();