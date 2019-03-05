module.exports = {
	hooks: {
		'page:before': processTitle,
		'finish': makeTitle
	}
};
var titleRule = /^\s*```\s{0,4}title((.*[\r\n]+)+?)?\s*```$/im;

const htmlent = require('html-entities');
const fs = require('fs');

function processTitle(page) {
  console.log("####### process tiltle ####");
  var match;
  if(match = titleRule.exec(page.content)) {
    var rawBlock = match[0];
    var seoBlock = match[1].replace(/[\r\n]/mg, "");
    console.log("rawBlock: "+ rawBlock);	  
    console.log("seoBlock: "+ seoBlock);	  
    //seoBlock = htmlent.Html5Entities.decode(seoBlock);
    page.content = page.content.replace(rawBlock, '<div id="meta-title---">' + seoBlock + '</div>');
    console.log("page.content: "+page.content);	  
  }
  return page;
}
function makeTitle() {
	console.log("####### make tiltle ####");
  var rootDir = this.output.root();
  var ignoreDir = rootDir + "/" + "gitbook";
  console.log("root dir: "+rootDir);	
  var batchModify = function(rootDir){
    console.log("####call batch modify####: "+fs);	  
    fs.readdir(rootDir, function(err,files){
	    console.log("file read err: "+err); 
      console.log("file amount: "+files.length);	    
      for(var i=0; i<files.length; i++) {
	console.log("file index: "+i);      
        var file = files[i];
        var fpath = rootDir + "/" + file;
	console.log("file path: "+fpath);      
        if (/\.html$/.test(file)) {
          var data = fs.readFileSync(fpath, 'utf-8');
	  console.log("#######data begin#########");	
	  console.log(data);	          
          console.log("#######data end#########");	
          var rule =/<title>.*<\/title>/;
          var rule2 = /<div id="meta-title---">([^>]+)?<\/div>/;
          var match1, match2, match3, match4;
          match1 = rule.exec(data);
          console.log("####match1: "+match1);		
          if (match1) {
            match2 = rule2.exec(data, match1[0].index + match1[0].length);
            if (match2) {
	      console.log("####match2: "+match2);		     
              data = data.replace(match2[0], '');
              var seoDesc = '<title>'+htmlent.Html5Entities.decode(match2[1]) + '</title>';
	      console.log("seoDesc:  "+seoDesc);
              data = data.replace(match1[0], seoDesc);
              fs.writeFileSync(fpath, data, 'utf-8');
            }
          } 
        } else if (fpath != "."       && 
                   fpath != ".."      &&
                   fpath != ignoreDir &&
                   fs.lstatSync(fpath).isDirectory()) {
          batchModify(fpath);
        }
      }
    });
  };

  batchModify(rootDir);
}

