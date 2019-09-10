var scene = new THREE.Scene();    
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// * box 1
let cubesize = 1;
var geometry = new THREE.BoxGeometry(cubesize,cubesize,cubesize);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 2;

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
}

animate();