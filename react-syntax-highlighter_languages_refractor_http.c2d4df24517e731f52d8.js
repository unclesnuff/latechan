(window.webpackJsonp=window.webpackJsonp||[]).push([[56],{1727:function(t,a,e){"use strict";function n(t){!function(t){t.languages.http={"request-line":{pattern:/^(?:POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\s(?:https?:\/\/|\/)\S+\sHTTP\/[0-9.]+/m,inside:{property:/^(?:POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/,"attr-name":/:\w+/}},"response-status":{pattern:/^HTTP\/1.[01] \d+.*/m,inside:{property:{pattern:/(^HTTP\/1.[01] )\d+.*/i,lookbehind:!0}}},"header-name":{pattern:/^[\w-]+:(?=.)/m,alias:"keyword"}};var a,e=t.languages,n={"application/javascript":e.javascript,"application/json":e.json||e.javascript,"application/xml":e.xml,"text/xml":e.xml,"text/html":e.html,"text/css":e.css},s={"application/json":!0,"application/xml":!0};function i(t){var a=t.replace(/^[a-z]+\//,"");return"(?:"+t+"|"+("\\w+/(?:[\\w.-]+\\+)+"+a+"(?![+\\w.-])")+")"}for(var p in n)if(n[p]){a=a||{};var r=s[p]?i(p):p;a[p]={pattern:RegExp("(content-type:\\s*"+r+"[\\s\\S]*?)(?:\\r?\\n|\\r){2}[\\s\\S]*","i"),lookbehind:!0,inside:{rest:n[p]}}}a&&t.languages.insertBefore("http","header-name",a)}(t)}t.exports=n,n.displayName="http",n.aliases=[]}}]);
//# sourceMappingURL=react-syntax-highlighter_languages_refractor_http.c2d4df24517e731f52d8.js.map