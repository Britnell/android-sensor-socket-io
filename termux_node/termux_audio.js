/*
*	  This runs the node script to read android IMU sensor stream and sends it 
*   over socket.io when a client connects.
*/


//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// * Sensor Data Stream spawn process
var cmd=require('node-cmd');
const {spawn} = require('child_process');
var proc;
var dataStreamOn = false;


//      *	*    *    *    *    Termux sensor stream    *    *    *    *    *    *    

// running standalone socket.io server
const io = require('socket.io')();
var clients = [];

io.on('connection', client => { 
	console.log("connected to ", client.id );
	clients.push(client.id);

	io.emit('msg', 'welcome to the sokcet-world');

	client.on('msg',(data)=>{
		console.log(' msg : ', data );
	});

	client.on('disconnect',()=>{
		console.log(" client disconnected. Stopping data stream");
		clients.pop();
	});


	// Eo disconnect
});

// io.listen(3000);
// console.log(" socket.io listening on port 3000 ");


function record_audio(){
	let date = new Date();
	let time_str = date.getDate() +'_'+date.getHours() +'-'+date.getMinutes() +'-'+date.getSeconds() ;
	console.log( 'time : ', time_str );

	let dur = 10;

	cmd.get('termux-microphone-record -l '+dur.toString()
			+' -f ' +time_str +'.m4a',
		function(err,data,stderr){
			console.log(' now check / wait for end .......');
			wait_record_end();

		});
	// Eo func
}

var recordedfile='';
function wait_record_end(){

	// check
	cmd.get('termux-microphone-record -i ',function(error,data,stderror){
		
	let json;
	try{
		json = JSON.parse(data);	
	} 
	catch(e){
		//
	}

	if(json){
		// console.log(" RECORDING : ", json.isRecording, json.outputFile );
		if(json.isRecording){
			// restart
			// console.log(' re-checking ');
			recordedfile = json.outputFile;
			wait_record_end();
		}
		else{
			console.log(' FINISHED recording! ', recordedfile );
		}
	}
	else{
		console.log(' error waiting for end, recording?? ' , data );	
	}
	
		

	});


	// Eo func
}
	

record_audio();