const rp = require("request-promise");
const cheerio = require("cheerio");
const request = require('request');
const fs = require("fs");
const { post } = require("request");
 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
 
//file chứa ds link
const dslink = "list-Link-Crawler.txt";
 
//lưu danh sách link thành mảng
var arrayLink = fs.readFileSync(dslink).toString().split("\n");

let STT = 0;

async function analysisInfo(link) {
    await sleep(0);
    try {
        const options = {
            uri: link,
            transform: function (body) {
                //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
                return cheerio.load(body);
            },
        };
        var dataweb = await rp(options);
    } catch (error) {
        console.log("Link dang dung:" + arrayLink[i]);
        return error;
    }
    // console.log(link);
    let output = "";
    const sotapchi = dataweb(".panel-body").find(".title").text().trim();
    let datePublished = dataweb(".list-group").find(".date-published").text().trim();
    datePublished = datePublished.replace("Đã đăng:", "");
    // console.log(datePublished.search('\n'));
    datePublished = datePublished.replace('\n', "");
    // datePublished = datePublished.replace(',', '');
    datePublished = datePublished.toString().replace(/\t/g, '').split('\r\n');
    // console.log(datePublished.toString());
    output += datePublished + "; " + sotapchi;
    return output;
}

async function analysis(link) {
    await sleep(0);
    try {
        const options = {
            uri: link,
            transform: function (body) {
                //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
                return cheerio.load(body);
            },
        };
        var dataweb = await rp(options);
    } catch (error) {
        console.log("Link dang dung:" + arrayLink[i]);
        return error;
    }
    const tableContent = dataweb(".col-md-10");
    const chaperLink = tableContent.find("a");
    
    let output = "";
    // console.log(link);
    // output += link + '\n';
    for (let i = 0; i < chaperLink.length; ++i) {
        const post = dataweb(chaperLink[i]);
        const postLink = post.attr('href');
        const listAuthor = tableContent.find(".authors");
        let author = dataweb(listAuthor[i]).text().trim();
        // while (author.search(",") != -1) {
        //     author = author.replace(",", " - ");
        // }
        while (author.search(";") != -1) {
            author = author.replace(";", ", ");
        }
        STT++;
        let namePost = post.text().trim();
        while (namePost.search("\n") != -1) {
            namePost = namePost.replace('\n', "");
        }
        while (namePost.search("\t") != -1) {
            namePost = namePost.replace('\t', " ");
        }
        let info = STT.toString() + ";" +  namePost + "; " + author + "; " + await analysisInfo(postLink) + "\n";
        info = info.toString().replace(/\t/g, '').split('\r\n').toString();
        console.log(info);
        output += info;
    }
    output = output.toString().replace(/\t/g, '').split('\r\n').toString();
    await sleep(0);
    return output;
}

async function crawlerLink(link) {
    await sleep(0);
    try {
        const options = {
            uri: link,
            transform: function (body) {
                //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
                return cheerio.load(body);
            },
        };
        var dataweb = await rp(options);
    } catch (error) {
        console.log("Link dang dung:" + arrayLink[i]);
        return error;
    }

    const tableContent = dataweb(".media-body");
    let data = [];

    let chaperTitle = tableContent.find("a").text().trim();

    const chaperLink = tableContent.find("a");
    // console.log(chaperLink.length);

    let outputFile = "";
    outputFile += "Số thứ tự;Tên bài báo;Tác giả;Ngày xuất bản;Tên số báo\n";

    for (let i = 0; i < chaperLink.length; i++) {
        const post = dataweb(chaperLink[i]);
        const postLink = post.attr('href');
        outputFile += await analysis(postLink);
        // break;
    }

    console.log(outputFile);
    fs.writeFile('resultCrawler.csv', outputFile, (err) => {
        if (err) throw err;
    })

    fs.writeFile('resultCrawler.txt', outputFile, (err) => {
        if (err) throw err;
    })
}

async function crawler() {
    for (i in arrayLink) {
        const link = arrayLink[i];
        crawlerLink(link);
        break;        
    } 
};

//call crawler
crawler();

// analysis("https://jprp.vn/index.php/JPRP/issue/view/6");

// analysisInfo("https://jprp.vn/index.php/JPRP/article/view/438");
 
//call download file
var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
 
        request(uri).pipe(fs.createWriteStream('./images/' + filename)).on('close', callback);
    });
};

