/*
*  v1 with {spawn}
*/

console.log(" ==> HELLOOOO\n\n");

// cmdstr = 'termux-sensor -s accel -d 4 -n 400 '; // -d 500 -n 3
var cmd=require('node-cmd');
// var lastframe=Date.now();
// var proc=cmd.get(cmdstr);


// * Sensor Data Stream spawn process
const {spawn} = require('child_process');
function start_sensor_stream(){
	console.log("NEW STREAM");
	var frame=0;
	var frames = 100;
	var proc = spawn( 'termux-sensor',['-s','accel','-n',frames.toString(),'-d','5'] );
	proc.stdout.on('data',function(data){
		// let t=Date.now();
		console.log(frame, data.toString() );
		// lastframe = t;
		frame++;
		if(frame==frames){
			console.log(` FRAME ${frames} \t `);
			// cmd.run('termux-sensor -c ');
			// setTimeout(start_sensor_stream,2000);
			start_sensor_stream();
		}
	});
	// Eo funct
}

// Start once
start_sensor_stream();


// setTimeout(function(){
// 	console.log("#\n#\n#\n#\n#\n KILLING ",proc.pid,"\n #\n#\n#\n# ");
// 	process.kill(-proc.pid);
// 	// spawn("taskkill", ["/pid", proc.pid, '/f', '/t']);
// 	// proc.kill();
// 	// kill(proc.pid);
// }, 5000);

// *