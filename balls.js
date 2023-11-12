var canvas = document.querySelector("#myCanvas");

import * as THREE from "three";

// サイズを指定
const width = 960;
const height = 960;

var vel = new THREE.Vector3(0, 0, 0);
var force = 0.0;

const DIV_COUNT = 1;
const DTIME = 0.01333 / DIV_COUNT;
const GRAVITY = new THREE.Vector3(0, 900 / DIV_COUNT, 0);
const MASS = 1.0;
var sample = 1;

const RADIUS = 20;

class Point{
  constructor(x, y){
    this.pos = new THREE.Vector3(x, y, 1);
    this.pos_old = new THREE.Vector3(x + 10, y, 1);
  }
  update(){
    var FORCE = new THREE.Vector3(0.0, 0);

    FORCE.copy(GRAVITY);
    FORCE.divideScalar(MASS);
    const velocity = this.velocity;
    this.pos_old.copy(this.pos);

    console.log(velocity.length());
    this.pos.add(velocity).addScaledVector(FORCE, DTIME*DTIME);
  }
  update_constraints()
  {
    const CENTER = new THREE.Vector3(width/2, height/2, 1);
    const T_RADIUS = 450.0;

    const diff = new THREE.Vector3(0,0,0);
    diff.copy(this.pos);
    diff.sub(CENTER);

    if (diff.length() > T_RADIUS)
    {
      const diff_pos = this.pos.clone();
      diff_pos.sub(this.pos_old);
      const len = diff_pos.length();
      this.pos.copy(diff.normalize().multiplyScalar(T_RADIUS).add(CENTER));
    }
  }

  get velocity() {
    const v = new THREE.Vector3(0,0,0);
    v.copy(this.pos);
    v.sub(this.pos_old);
    return v;
  }

  get getPos(){
    return this.pos;
  }

  set_pos(x, y)
  {
    this.pos.x = x;
    this.pos.y = y;
    this.pos_old.x = x;
    this.pos_old.y = y;
  }
  
  check_collision(point){

    var diff = new THREE.Vector3(0,0,0);
    diff.copy(this.pos);
    diff.sub(point.getPos);
    var len = diff.length();
    if (len < RADIUS*2){
      diff.normalize().multiplyScalar((2*RADIUS - len)/2.0);
      this.pos.add(diff);
      point.getPos.sub(diff);
    }
  }
}


var p = new Point(width/2, height/2);
var points = [];
var circles= [];

render();

function render(){
  // レンダラーを作成

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  //const camera = new THREE.PerspectiveCamera(45, width / height);
  const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.001, 3000);
  camera.position.set(0, 0, +2000);
  camera.lookAt(new THREE.Vector3(0,0,0));

  var circle_color = 0xAA9900;

  // const box = addCircle();
  function addCircle(){
    // 箱を作成
    // const geometry = new THREE.BoxGeometry(400, 400, 400);
    // const geometry = new THREE.SphereGeometry(50);
    const geometry = new THREE.CircleGeometry(RADIUS, 32);

    // const material = new THREE.MeshNormalMaterial();
    //const material = new THREE.MeshNormalMaterial({color: 0x6699FF});
    // const material = new THREE.MeshLambertMaterial({color: 0xAA99FF});
    // const material = new THREE.MeshPhongMaterial({color: 0xAA99FF});
    const material = new THREE.MeshToonMaterial({color: circle_color});
    //const material = new THREE.MeshStandardMaterial({color: 0xAA99FF, roughness: 0.5});
    // const material = new THREE.MeshDepthMaterial();

    const box = new THREE.Mesh(geometry, material);
    box.position.set(width / 2, height / 2, 1);
    box.rotation.set(0, Math.PI, 0);
    scene.add(box);
    circle_color += 0x8050a0;
    circle_color = circle_color % 0x1000000;
    return box;
  }

  const light1 = new THREE.AmbientLight(0xFFFFFF);
  light1.position.set(1, 1, 1).normalize();
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0x00FFFF, 0.5);
  light2.position.set(1, 1, 1).normalize();
  scene.add(light2);

  tick();

  // 毎フレーム時に実行されるループイベントです
  function tick() {
    for(var count = 0; count < DIV_COUNT; count++){
      for(var i = 0; points.length > i; i++){
        for(var j = i + 1; points.length > j; j++){
          points[i].check_collision(points[j]);
          //console.log(j, points[j].getPos);
        }
      }

      for(var i = 0; points.length > i; i++){
        points[i].update_constraints();
      }

      for(var i = 0; points.length > i; i++){
        points[i].update();
      }
    }
    for(var i = 0; points.length > i; i++){
        circles[i].position.copy(points[i].getPos);
      }
    //p.update();
    //p.update_constraints();

    //box.position.copy(p.getPos);
    //box.rotation.y += 0.01;
    //box.position.set(width / 2, height / 2, 1);
    renderer.render(scene, camera); // レンダリング

    requestAnimationFrame(tick);
  }

  
  canvas.addEventListener('click', on_click_k, false);
  function on_click_k(e){
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    points.push(new Point(x, y));
    circles.push(addCircle());
    //p.set_pos(x, y);
    //alert(rect.left);
  }
}