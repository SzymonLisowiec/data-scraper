const ListScrapper = require('../').List;

class Main {

	constructor () {

		this.scrapper = new ListScrapper({
			url: 'https://www.mediaexpert.pl/gry-pc/',
			type: 'html'
		});

		/**
		 * Set a function to displaying progress of data scraping.
		 */
		this.scrapper.setProgress(($) => {

			let page = $('.list_nav .jumpToPage');

			if(page.length > 0){

				console.log('Current page: ' + page.val().trim());

			}

		});

		/**
		 * Set a function to specify next page.
		 */
		this.scrapper.setNextPage(($) => {

			let btn_next = $('.list_nav a[rel="next"]');

			if(btn_next.length > 0){

				return btn_next.eq(0).attr('href');

			}else return false;

		});

		/**
		 * Set a paraser function. Paraser scraping data from a server response.
		 */
		this.scrapper.setParser($ => {

			let products = [];
			let list = $('#ajaxContentList');

			list.find('article.m-product').each((i, item) => {
				
				item = $(item);
				let name = item.data('gtm-product-name');
				let price = item.data('gtm-product-price');
				let avaible = item.find('.product_prices.is-not-avaible').length > 0 ? false : true;

				products.push({
					name,
					price,
					avaible
				});

			});

			return products;
		});

		/**
		 * Add a modifier function to modify scraped data.
		 */
		this.scrapper.addModifier(product => {

			product.name = product.name.replace('Gra PC ', '');
			product.price = parseInt(String(product.price).replace(',', '').replace('.', ''));

			return product;
		});

		this.scrapper.on('end', products => {
			//Save all scraped data to file
			require('fs').writeFileSync(__dirname + '/mediaexpert.json', JSON.stringify(products, null, 2));
		});

		this.scrapper.run();

	}

}

module.exports = new Main();