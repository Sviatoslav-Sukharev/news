function customHttp() {
  return {
    get(url, callback) {
      try {
        let xhr = new XMLHttpRequest();
        xhr.open("get", url);
        xhr.send();

        xhr.addEventListener("load", (e) => {
          if(Math.floor(xhr.status / 100) != 2) {
            callback("status error");
            return;
          }
          let response = JSON.parse(xhr.responseText);
          callback(null, response);
        });

        xhr.addEventListener("error", (e) => {
          callback("server error");
        });
      } catch(error) {
        callback(error);
      }
    },

    post(url, body, headers, callback) {
      try {
        let xhr = new XMLHttpRequest();
        xhr.open("post", url);
        Object.entries(headers).forEach(([header, value]) => {
          xhr.setRequestHeader(header, value);
        });
        xhr.send(JSON.stringify(body));

        xhr.addEventListener("load", (e) => {
          if(Math.floor(xhr.status / 100) != 2) {
            callback("status error");
            return;
          }
          let response = JSON.parse(xhr.responseText);
          callback(null, response);
        });

        xhr.addEventListener("error", (e) => {
          callback("server error");
        });
      } catch(error) {
        callback(error);
      }
    },
  };
}

let http = customHttp();
let form = document.forms["getNews"];
let selectCountry = form.elements["country"];
let selectCategory = form.elements["category"];
let input = form.elements["search"];

let serviceNews = (function() {
  let apiKey = "1754366a8e0a4a38bc6db2198a98a8ed";
  let apiUrl = "https://news-api-v2.herokuapp.com";
  return {
    topHeadlines(country, category, callback) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, callback);
    },
    everything(query, callback) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, callback);
    }
  }
})();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addLoader();

  let country = selectCountry.value;
  let category = selectCategory.value;
  let query = input.value;
  if(!query) {
    serviceNews.topHeadlines(country, category, onGetResponse);
  } else {
    serviceNews.everything(query, onGetResponse);
  }

  input.value = "";
});

document.addEventListener("DOMContentLoaded", (e) => {
  addLoader();
  serviceNews.topHeadlines(selectCountry.value, selectCategory.value, onGetResponse);
});

function onGetResponse(error, response) {
  removeLoader();

  if(error) {
    alert(error);
    return;
  }

  if(!response.articles.length) {
    let container = document.querySelector(".listOfNews__container");
    let emptyMsg = document.createElement("div");
    emptyMsg.textContent = "We cannot find any news...";
    emptyMsg.style.fontSize = "30px";
    emptyMsg.style.fontWeight = "700";
    emptyMsg.style.margin = "0px auto";

    container.innerHTML = "";
    container.insertAdjacentElement("afterbegin", emptyMsg);
    return;
  }

  renderNews(response.articles);
}

function renderNews(news) {
  let container = document.querySelector(".listOfNews__container");
  container.innerHTML = "";
  let fragment = "";
  news.forEach((item) => {
    fragment += createNewCardHtml(item);
    container.insertAdjacentHTML("afterbegin", fragment);
  });
}

function createNewCardHtml({title, description, url, urlToImage}) {
  return `
    <div class="card">
      <div class="card__img"><img src="${urlToImage || 'https://www.baumer.com/medias/sys_master/images/images/hd7/h06/8982008070174/mamfile-148657-720Wx540H-c.png'}" alt="image"></div>
      <div class="card__title">${title || ''}</div>
      <div class="card__description">${description || ''}</div>
      <div class="card__source"><a href="${url || ''}" target="_blank">Read more</a></div>
    </div>
  `
}

function addLoader() {
  let loader = document.createElement("div");
  loader.classList.add("loader");
  document.body.appendChild(loader);
}

function removeLoader() {
  let loader = document.querySelector(".loader");
  loader.remove();
}


