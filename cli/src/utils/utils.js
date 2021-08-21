/**
 * @description: js通用工具类
 *
 */


/**
 * @http工具
*/
 (function ($) {
    var request = function request(url, method, params, body, token) {
        if (!body) {
            body = false;
        }
        return new Promise(function (resolve, reject) {
            let _url= token?url + '?uid=' +JSON.parse(window.localStorage.getItem('user')).uid + '&userType=1':url;
            var aj = {
                url: _url,

                method: method,

                dataType: 'json',

                headers: {
                  'snb-client-type':'web'
                },

                success: function success(returnData) {
                    resolve(returnData);
                },

                error: function error(_error) {
                    if(_error.status == 401&&_error.status == 422){
                      if(JSON.parse(window.localStorage.getItem('user'))){
                        window.localStorage.remove("user");
                       }else if(JSON.parse(window.localStorage.getItem('articlecontent'))){
                        window.localStorage.remove("articlecontent");
                       }                  
                      return  window.location.href = 'login.html'
                    }
                    reject(_error);
                }

            };

            if (params) {
                if (method =='POST'&&body == true) {
                  aj.contentType = false
                  aj.processData = false
                  let formData = new FormData();
                            for(let key in params){
                              formData.append(key, params[key]);
                            }  
                  aj.data = formData
                }
                if(token){
                  aj.headers.Authorization = token
                }
                if(method =='GET' && typeof params == 'object'){
                  let string = ''
                  for(let key in params){
                    string += (key + '=' + params[key] + '&')
                  }
                  string = string.slice(0,-1)
                  aj.data = string;
                }
            }

            $.ajax(aj);
        });
    };

    window.$ajax = {
        get: function get(url, params) {
            return request(url, 'GET', params);
        },
        getToken: function getToken(url, params) {
            if(!JSON.parse(window.localStorage.getItem('user'))){ return window.location.href = 'login.html'} 
            let token = JSON.parse(window.localStorage.getItem('user')).access_token
            return request(url, 'GET', params, false, 'Bearer ' + token);
        },
        post: function post(url, data) {
            return request(url, 'POST', data, true);
        },
        postToken: function postToken(url, params) {    
            if(!JSON.parse(window.localStorage.getItem('user'))){ return window.location.href = 'login.html'}   
              let token = JSON.parse(window.localStorage.getItem('user')).access_token      
            return request(url, 'POST', params, true, 'Bearer ' + token);
        },
        put: function put(url, data) {
            return request(url, 'PUT', data, true);
        }

    };
})(jQuery);

/**
 * @font-size:更改
*/
(function(document){
  var doc =document.body,
      wh;
      function setSize(){
        var win_w=document.body.offsetWidth,
              fontSize;
        if(win_w>640){ fontSize=24; }else{
          win_w=Math.max(320,win_w); fontSize=win_w/320*12 ;
          
        }
        document.getElementsByTagName('html')[0].style.fontSize=fontSize+'px';
      }
      setSize()
      document.addEventListener('DOMContentLoaded',setSize,false);
      window.addEventListener('resize',setSize,false)
})(document)

