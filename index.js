import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeWebsite() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto('https://listverse.com/2024/03/14/ten-strange-but-true-geography-facts/');

    const detailBlog = await page.evaluate(() => {
        const detailBlog = document.querySelector('.single-article-only');
        const title = detailBlog.querySelector('h1').textContent;
        const subTitles = Array.from(detailBlog.querySelectorAll('h2')).map((subTitle) => subTitle.textContent);
        const videos = Array.from(detailBlog.querySelectorAll('.pL')).map((video) => video.getAttribute('id').slice(5));
        const contentOnly = document.querySelector('#articlecontentonly');

        var blogContents = [];
        var subContent = { array: [], link: ''};
        var checkingElement = contentOnly.querySelector('p');
        while(checkingElement){
            if(checkingElement.tagName === 'P' || checkingElement.tagName === 'p' && checkingElement.classList === undefined){
                if(checkingElement.textContent.length > 100 ){
                    subContent.array.push(checkingElement.textContent);
                }
                if(checkingElement.querySelector('a')){
                    subContent.link = checkingElement.querySelector('a').getAttribute('href');
                    blogContents.push(subContent);
                    subContent = { array: [], link: ''};
                }
                checkingElement = checkingElement.nextElementSibling;
            }
            else{
                checkingElement = checkingElement.nextElementSibling; 
                continue;
            }
        }
        const result = { title, subTitles, videos, blogContents };

        var contentDetails = blogContents.map((blog, index) => {
            let title;
            let editedContent = blog.array.reduce((prev, curr) => prev +`<p> ${curr}</p>`,'');
            const video = `<iframe src="https://www.youtube.com/embed/${result.videos[index]}"></iframe>`;
            if(index === 0) {
                title = `<h1>${result.title}</h1>`;
            }
            else{
                title = `<h2>${result.subTitles[index-1]}</h2>`;
                editedContent = editedContent.slice(0, -8) + `<a href='${blog.link}' rel="noopener noreferrer" target="_blank">[${index}]</a> </p>`;
            }
            return title + video + editedContent;
        })

        var html = `
            <html>
                <head></head>
                <body>
                    ${contentDetails.join('')}                    
                </body>
            </html>
        `
        return html
    });
    
    fs.writeFileSync('output.html', detailBlog);

    await browser.close();
}

scrapeWebsite();
