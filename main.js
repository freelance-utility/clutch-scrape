const { JSDOM } = require("jsdom")
const fetch = require("node-fetch-commonjs")
const path = require("path")
const fs = require("fs");
const http = require("http");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const main = async () => {
		
	const baseurl = "https://clutch.co"
	// load base url
	page = (await (await fetch("https://clutch.co/us/web-developers")).text());
	console.log(page)
	const dom = new JSDOM(page);
	// get total page count
	pages = dom.window.document.querySelector(".page-item.last > a")//.attributes['data-page'].textContent;
	
	// for in pages
	iPage = 1;
	do {
		// get company urls
		urls = []
		dom.window.document.querySelectorAll(".company_title.directory_profile").forEach(e=>path.join(baseurl,e.textContent));

		for (iCompany =0; iCompany<urls.length; iCompany++)
		{
			var company = {}
			await delay(3000+Math.random()*10000);
			cdom = new JSDOM((await (await fetch(urls[iCompany])).text()));
			// company title
			company.name = cdom.window.document.querySelector(".header-company--title").innerText;
			fs.mkdirSync("./portfolios"+company.name);

			// location
			cdom.window.document.querySelectorAll(".address").forEach(location=>{
				company.location = []
				detail = location.innerText.split();
				compoany.location.push({
					street: detail[0],
					city: detail[1],
					country: detail[2]
				})
			})

			// founded
			company.founded = Number.parseInt(cdom.window.document.querySelector("[data-content=\"<i>Founded</i>\"]").innerText.split(" ")[1]);

			// description
			company.description = cdom.window.document.querySelector(".field-name-profile-summary").innerText

			// portfolio
			company.portfolio = []

			cdom.window.document.querySelectorAll(".p-element").forEach(async (element) => {
				company.portfolio.push({
					title: element.querySelector(".item-title").innerText,
					description: element.querySelector(".project-description").innerText,
					image: element.querySelector(".image-source").attributes['data-source'].textContent
				})

				const file = fs.createWriteStream("./portfolio/"+company.name+"/file.jpg");
				await delay(3000+Math.random()*10000);
				await (await http.get(element.querySelector(".image-source").attributes['data-source'].textContent).pipe(file));
			})
			
			// get review page count
			reviewcnt = cdom.window.document.querySelector(".page-item.last > a").attributes['data-page'].textContent;
			iReview = 1;
			company.review = [];
			do {
				cdom.querySelectorAll(".views-row").forEach(reviewitem => {
					company.review.push({
						title: reviewitem.querySelector(".h2_title").innerText,
						desc: reviewitem.querySelector(".field-name-proj-description .field-item").innerText,
						comment: reviewitem.querySelector(".field-name-comments .field-item").innerText,
						background: reviewitem.querySelector(".full-review [id^='background']").innerText,
						challenge: reviewitem.querySelector(".full-review [id^='challenge']").innerText,
						solution: reviewitem.querySelector(".full-review [id^='solution']").innerText,
						result: reviewitem.querySelector(".full-review [id^='result']").innerText,
					})
				})
				await delay(3000+Math.random()*10000);
				cdom = new JSDOM((await (await fetch(urls[iCompany]+"?page="+iReview)).text()));
				iReview++;
			} while (iReview < reviewcnt);

			fs.writeFileSync("./portfolio/"+company.name+"/info.txt", JSON.stringify(company, null, "\t"));
		}
		await delay(3000+Math.random()*10000);
		dom = new JSDOM((await (await fetch("https://clutch.co/us/web-developers?page="+iPage)).text()));
		iPage++;
	} while (iPage < pages);
}

main()
