#! /usr/local/bin/node

var download = require('./download');
var argv = process.argv.slice(2);
var mkdirp = require('mkdirp');




var file=argv[0];//file 
var folder=argv[1]||'./';// folder to save file

mkdirp(folder, function(err) { 
	if (err){
		 console.error(err);	
	}else{
		download(file, folder).then(function(id){
	    	console.log('completed... file %s', id);
		}).catch(function(err){
		    console.log('error occured..',file);
		    console.log(err.stack);
		});
	} 
});



