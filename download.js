var request = require('request');
var progress = require('request-progress');
var fs = require('fs'); 
var Puid = require('puid');
var puid = new Puid(); 
var path = require('path');
var Promise = require('bluebird');

var msg_received='received %s bytes';
var msg_process='progress: %s % ';
var msg_total='total size %s bytes';

var download = function(file, folder, callback){
    var p = new Promise(function(resolve, reject){
        var id ;
        var extname=path.extname(file);    
        if(extname){
            id=path.basename(file);
        }else{
           id = puid.generate();
        }
        var dest = path.join(folder,id);
        if(fs.existsSync(dest)){
            id=path.basename(file).replace(extname,'')+'-'+puid.generate()+extname;
            dest = path.join(folder,id);
        }

        
        // start the downloading and file writing
        var writeStream = fs.createWriteStream(dest);
        writeStream.on('finish', function(){
            resolve(id);   
        });
        writeStream.on('error', function(err){
            fs.unlink(dest, reject.bind(null, err));
        });

        // Note that the options argument is optional 
        progress(request.get(file), {
            //throttle: 200,  // Throttle the progress event to 2000ms, defaults to 1000ms 
            delay: 10      // Only start to emit after 1000ms delay, defaults to 0ms 
        })
        .on('progress', function (state) {
            showProgess(state);
        })
        .on('error', function (err) {
            fs.unlink(dest, reject.bind(null, err));
        })
        .pipe(writeStream)
    });
    if(!callback)
        return p;

    p.then(function(id){
        callback(null, id);
    }).catch(function(err){
        callback(err);
    });
};
function showProgess(state){
    var msgs=[];
    var args=[];
    if(state.received){
        msgs.push(msg_received);
        args.push(state.received);
    }
    if(state.total){
        msgs.push(msg_total);
        args.push(state.total);
    }
    if(state.percent){
        msgs.push(msg_process);
        args.push(state.percent);
    }
    args.unshift(msgs.toString());
    console.log.apply(null,args);
}

module.exports = download;

 
