var scene = new THREE.Scene();    
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// * box 1
let cubesize = 1;
var geometry = new THREE.BoxGeometry(3,1,5);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var ctrng = [0,0,0]; // for centering 

//    ***  * * * * * *   socket
var click = false;
document.addEventListener( 'mousedown', function(event){
	console.log("CLICK");
	click = true;
}, false );

const socket = io('http://192.168.178.21:3000');

socket.on('connect', ()=>{
	console.log(" SOCKET CONNECTED ");
	socket.emit('msg', 'hi socket its browser here');
});

socket.on('msg',(data)=>{
	console.log("socket-msg",data);
});

socket.on('euler',(data)=>{
	
	let heading = data['heading']  - ctrng[0]; // -pi to pi
	let pitch = data['pitch'] -ctrng[1];
	let roll = data['roll'] - ctrng[2];
	// console.log(heading,pitch,roll);

	if(click){
		ctrng[0] += heading;
		ctrng[1] += pitch;
		ctrng[2] += roll;
		click = false;
	}
	cube.rotation.y = heading;
	cube.rotation.z = -(pitch );
	cube.rotation.x = (roll );
	// console.log(cube.rotation.x);
});

socket.on('disconnect',()=>{
	console.log(" !    !    ! DIS - CONNECTED ");
});

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  // cube.rotation.x += 0.01;
  
  // cube.rotation.y += 0.01;
}

animate();