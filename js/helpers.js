// Helper functions
(function() {  
  window.helper = {};
  helper.getQueryParams = function(){
    var url = document.location.search,
        params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
        
    url = url.split("+").join(" ");
  
    while (tokens = re.exec(url)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
  
    return params;
  };
  helper.getQueryParamValue = function(param) {
    var url = document.location.search,
        params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;
        
    url = url.split("+").join(" ");
  
    while (tokens = re.exec(url)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }
  
    return params[param];
  };  
})();
