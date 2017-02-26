'use strict';

const unirest = require('unirest');

class Instagrao {
  constructor(username, password) {
    Object.assign(this, {username, password, unirest});

    // instagram api credentials
    this.csrftoken = '';
    this.sessionid = '';

    // instagram endpoints
    this.url = 'https://www.instagram.com/';
    this.urlLogin = 'https://www.instagram.com/accounts/login/ajax/';
    this.urlLogout = 'https://www.instagram.com/accounts/logout/';

    // unirest default params
    this.reqHeaders = {
      "x-requested-with": "XMLHttpRequest",
      "x-instagram-ajax": "1",
      "user-agent": 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.103 Safari/537.36',
      "referer": "https://www.instagram.com/",
      "pragma": "no-cache",
      "origin": "https://www.instagram.com",
      "accept-language": 'en-US;q=0.6,en;q=0.4'
    };

    this.reqCookies = this.unirest.jar();

    if (this.username && this.password) {
      this.login(this.username, this.password);
    }
  }

  login(username, password) {
    Object.assign(this, {username, password});

    return new Promise((resolve, reject) => {
      this.unirest
        .get(this.url)
        .headers(this.reqHeaders)
        .end(res => {
          if (res.error) throw new Error(res.error);

          // updating cookies
          this.reqCookies.add(`csrftoken=${res.cookie('csrftoken')}`, this.url);
          this.reqCookies.add(`mid=${res.cookie('mid')}`, this.url);

          // updating headers
          Object.assign(this.reqHeaders, {'x-csrftoken': res.cookie('csrftoken')});

          // resolve(res.body);

          this.unirest
            .post(this.urlLogin)
            .jar(this.reqCookies)
            .headers(this.reqHeaders)
            .form({'username': this.username, 'password': this.password})
            .end(res => {
              if (res.error) throw new Error(res.error);

              // updating cookies
              this.reqCookies.add(`csrftoken=${res.cookie('csrftoken')}`, this.url);
              this.reqCookies.add(`mid=${res.cookie('mid')}`, this.url);

              // updating headers
              Object.assign(this.reqHeaders, {'x-csrftoken': res.cookie('csrftoken')});

              Object.assign(this, {
                sessionid: res.cookie('sessionid'),
                csrftoken: res.cookie('csrftoken')
              });

              resolve(res.body);
            });
        });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.unirest
        .post(this.urlLogout)
        .jar(this.reqCookies)
        .headers(this.reqHeaders)
        .form({'csrfmiddlewaretoken': this.csrftoken})
        .end(res => {
          if (res.error) throw new Error(res.error);

          // erasing credentials
          this.reqCookies = this.unirest.jar();
          Object.assign(this.reqHeaders, {'x-csrftoken': ''});
          Object.assign(this, {
            sessionid: '',
            csrftoken: '',
            username: '',
            password: ''
          });

          resolve();
        });
    });
  }
}

module.exports = Instagrao;
