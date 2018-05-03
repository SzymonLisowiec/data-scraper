const ListScrapper = require('../').List;

class Main {

	constructor () {

		this.scrapper = new ListScrapper({
			url: 'https://www.g2a.com/new/api/products/filter?category_id=games&changeType=PAGINATION&currency=EUR&store=english',
			type: 'json'
		});

		/**
		 * Set a function to displaying progress of data scraping.
		 */
		this.scrapper.setProgress(data => {
			console.log('Page: ' + data.currentPage + '/' + data.totalPages);
		});

		/**
		 * Set a function to specify next page.
		 */
		this.scrapper.setNextPage(data => {

			if(data.nextPage)
				return this.scrapper.config.url + '&page=' + data.nextPage

			return false;
		});

		/**
		 * Set a paraser function. Paraser scraping data from a server response.
		 */
		this.scrapper.setParser(data => {
			return data.products;
		});

		/**
		 * Add a modifier function to modify scraped data.
		 */
		this.scrapper.addModifier(product => {
			return {
				name: product.name,
				slug: product.slug,
				min_price: product.minPrice ? parseInt(product.minPrice.replace(/\,/g, '').replace('.', '')) : null,
				max_price: product.maxPrice ? parseInt(product.maxPrice.replace(/\,/g, '').replace('.', '')) : null,
				quantity: product.quantity,
				region: product.region
			};
		});

		this.scrapper.on('end', products => {
			//Save all scraped data to file
			require('fs').writeFileSync(__dirname + '/g2a.json', JSON.stringify(products, null, 2));
		});

		this.scrapper.run();

	}

}

module.exports = new Main();