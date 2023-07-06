// グローバル変数
let scene, camera, renderer, ambientLight, directionalLight, floor, room;
let cameraPositions = [
	[
		// スマホ
		[32, 28, 32],
		[0.5, 4, 6],
		[1.5, 4, 3.5],
		[40, 40, 40],
	],
	[
		// PC
		[16, 14, 16],
		[2.5, 5, 3],
		[-0.5, 4.5, 2.5],
		[20, 7, 20],
	],
];
let lookAtPositions = [
	[
		// スマホ
		[0, 4, 0],
		[0.5, 4, -3],
		[-3.5, 3, 3.5],
		[0, -10, 0],
	],
	[
		// PC
		[0, 4, 0],
		[2.5, 5, -3],
		[-5.5, 3.5, 2.5],
		[4, 4, -8],
	],
];
let scrollPercent = 0;
let nowPage = 0;
let animState = 0;
let isPC = true;
let lookAtPos = new THREE.Vector3(
	lookAtPositions[Number(isPC)][nowPage][0],
	lookAtPositions[Number(isPC)][nowPage][1],
	lookAtPositions[Number(isPC)][nowPage][2]
);

// イニシャライザ
function init() {
	// シーン
	scene = new THREE.Scene();

	// カメラ
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(
		cameraPositions[Number(isPC)][nowPage][0],
		cameraPositions[Number(isPC)][nowPage][1],
		cameraPositions[Number(isPC)][nowPage][2]
	);
	camera.lookAt(lookAtPos);

	checkWindowSize();

	// レンダラー
	renderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});

	renderer.physicallyCorrectLights = true;
	// レンダラーのシャドウを有効にする
	renderer.shadowMap.enabled = true;
	renderer.outputEncoding = THREE.GammaEncoding;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;

	renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(renderer.domElement);

	// 環境光
	ambientLight = new THREE.AmbientLight(0xffffff, 3);
	scene.add(ambientLight);

	// 平行光
	directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(0, 5, 0);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.set(4096, 4096);
	scene.add(directionalLight);

	// 3Dモデルの読み込み
	const loader = new THREE.GLTFLoader();

	loader.load("./Models/Room.gltf", function (gltf) {
		room = gltf.scene;
		scene.add(room);
	});

	// 現在の位置を元に説明欄を表示する
	$(".side").eq(nowPage).addClass("fadeIn");
}

// アニメーション
function animate() {
	requestAnimationFrame(animate);
	pageScroll();
	TWEEN.update();
	renderer.render(scene, camera);
}

// ページスクロールに関する処理
function pageScroll() {
	nowPage = Math.floor(Math.abs(scrollPercent - 1) / 25);
	if (animState != nowPage) {
		$(".side").each(function (i, elem) {
			if (i == nowPage) {
				$(elem).addClass("fadeIn");
				$(elem).removeClass("fadeOut");
			} else {
				$(elem).removeClass("fadeIn");
				$(elem).addClass("fadeOut");
			}
		});
		animState = nowPage;
		changeCameraPos(animState);
	}
}

// カメラの位置を変更する関数
function changeCameraPos(place) {
	/*
	// 各軸に対して回転する量
	let rx = 0,
		ry = 0,
		rz = 0;
	switch (number) {
		case 1:
			rx += Math.PI * 2;
			ry += Math.PI * 2;
			rz += Math.PI * 2;
			break;
		case 2:
			rx -= Math.PI / 2;
			ry += Math.PI * 2;
			rz += Math.PI * 2;
			break;
		case 3:
			//room.rotation.set(0, 0, Math.PI / 2);
			rx += Math.PI * 2;
			ry += Math.PI * 2;
			rz += Math.PI / 2;
			break;
		case 4:
			//room.rotation.set(0, 0, - Math.PI / 2);
			rx += Math.PI * 2;
			ry += Math.PI * 2;
			rz -= Math.PI / 2;
			break;
		case 5:
			//room.rotation.set(Math.PI / 2, 0, 0);
			rx += Math.PI / 2;
			ry += Math.PI * 2;
			rz += Math.PI * 2;
			break;
		case 6:
			//room.rotation.set(Math.PI, 0, 0);
			rx += Math.PI;
			ry += Math.PI * 2;
			rz += Math.PI * 2;
			break;
	}
	*/

	TWEEN.removeAll();

	// 移動のアニメーション
	new TWEEN.Tween(camera.position)
		.to(
			{
				x: cameraPositions[Number(isPC)][place][0],
				y: cameraPositions[Number(isPC)][place][1],
				z: cameraPositions[Number(isPC)][place][2],
			},
			1000
		)
		.easing(TWEEN.Easing.Linear.None)
		.start();

	new TWEEN.Tween(lookAtPos)
		.to(
			{
				x: lookAtPositions[Number(isPC)][place][0],
				y: lookAtPositions[Number(isPC)][place][1],
				z: lookAtPositions[Number(isPC)][place][2],
			},
			1000
		)
		.onUpdate(function () {
			camera.lookAt(lookAtPos);
		})
		.easing(TWEEN.Easing.Linear.None)
		.start();
}

// ウィンドウ変更時にサイズを維持する処理
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// PC画面かスマホ画面かの判定処理
function checkWindowSize() {
	if (window.matchMedia("(max-width: 767px)").matches) {
		//スマホ画面
		isPC = false;
	} else if (window.matchMedia("(min-width:768px)").matches) {
		//PC画面
		isPC = true;
	}
	console.log(isPC);
	changeCameraPos(nowPage);
}

// 画面のスクロール率を計算する
document.body.onscroll = () => {
	//現在のスクロール率をパーセントで計算する
	scrollPercent =
		(document.documentElement.scrollTop /
			(document.documentElement.scrollHeight - document.documentElement.clientHeight)) *
		100;
};

// イベント
window.addEventListener("resize", onWindowResize);
window.addEventListener("resize", checkWindowSize);
window.addEventListener("load", checkWindowSize);
init();
animate();
