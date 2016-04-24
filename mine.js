function analyze_csv(in_str){
	var line = read_str.split("\n");
	var res_str = new Array();
	for(var i = 0;i < line.length;i++){
		res_str[i] = line[i].split(",");
	}
	return res_str;
}
function set_bomb(num,size){
	// 盤面の数より爆弾が多い時は瞬殺
	if(num >= (size*size) ){
		console.log("盤面の数より爆弾が多い");
		return null;
	}
	var Ban = new Array();
	for(var i=0;i<size;i++){
		Ban[i] = new Array();
		for(var j=0;j<size;j++){
			Ban[i][j] = 0;
		}
	}
	// 爆弾セット
	for(var i=0;i<num;i++){
		var x,y;
		do{
			x = Math.floor( Math.random() * size );
			y = Math.floor( Math.random() * size );
		}while(Ban[x][y] == 1);
		Ban[x][y] = 1;
	}
	return Ban;
}
function show_ban(ban){
	var out_str = "";
	for(var i = 0;i < ban.length;i++){
		for(var j = 0;j < ban[i].length;j++){
			out_str += "|" + ban[i][j];
		}
		out_str += "\n";
	}
	console.log(out_str);
}
function rensa_search(Tansa,Round,x,y){
	x = Number(x);
	y = Number(y);
	if(Round[y][x] <= 1){
		Tansa[y][x] = 1;
		if((x-1)>=0 && Tansa[y][x-1]==0){
			Tansa = rensa_search(Tansa,Round,x-1,y);
		}
		if((x+1)<Tansa.length && Tansa[y][x+1]==0){
			Tansa = rensa_search(Tansa,Round,x+1,y);
		}
		if((y-1)>=0 && Tansa[y-1][x]==0){
			Tansa = rensa_search(Tansa,Round,x,y-1);
		}
		if((y+1)<Tansa.length && Tansa[y+1][x]==0){
			Tansa = rensa_search(Tansa,Round,x,y+1);
		}
	}
	return Tansa;
}
// Inputテスト
var fs = require('fs');
var buf = fs.readFileSync("ms.txt");
// 一つの集合体として読み込み
var read_str = buf.toString();
var res_str = analyze_csv(read_str);
// Mode
// 0...初期状態
// 1...ゲーム開始中
var mode = res_str[0][0];
var BanSize = 9;
// Bamen
// 0...何もなし
// 1...爆弾
// Tansa
// 0...未探査
// 1...探査済
var Bamen,Tansa;
console.log("Mode:"+mode);
//盤の初期生成
if(mode == 0){
	Bamen = set_bomb(10,BanSize);
	Tansa = new Array();
	for(var i=0;i<BanSize;i++){
		Tansa[i] = new Array();
		for(var j=0;j<BanSize;j++){
			Tansa[i][j] = 0;
		}
	}
	show_ban(Bamen);
	show_ban(Tansa);
	mode = 1;
}
else{
	// 爆弾個数
	var BombNum = 0;
	// 盤サイズ読み込み
	BanSize = Number(res_str[1][0]);
	console.log("BanSize:"+BanSize);
	Bamen = new Array();
	for(var i=0;i<BanSize;i++){
		Bamen[i] = new Array();
		for(var j=0;j<BanSize;j++){
			Bamen[i][j] = res_str[i+2][j];
			if(Bamen[i][j] == 1){
				BombNum++;
			}
		}
	}
	show_ban(Bamen);
	// 閉じている個数
	var CloseNum = 0;
	// 探査状況読み込み
	Tansa = new Array();
	for(var i=0;i<BanSize;i++){
		Tansa[i] = new Array();
		for(var j=0;j<BanSize;j++){
			var ni = Number(i)+Number(BanSize)+2;
			Tansa[i][j] = res_str[ni][j];
			if(Tansa[i][j] == 0){
				CloseNum++;
			}
		}
	}
	show_ban(Tansa);
	// 周辺状況作成
	var Round = new Array();
	for(var i=0;i<BanSize;i++){
		Round[i] = new Array();
		for(var j=0;j<BanSize;j++){
			if(Bamen[i][j] == 1){
				Round[i][j] = "*";
			}
			else{
				var NNum = 0;
				for(var lx = -1;lx<=1;lx++){
					for(var ly = -1;ly<=1;ly++){
						var nx = i + lx;
						var ny = j + ly;
						if(nx >= 0 && nx < BanSize &&
							ny >= 0 && ny < BanSize){
							if(Bamen[nx][ny] == 1){
								NNum++;
							}
						}
					}
				}
				Round[i][j] = NNum;
			}
		}
	}
	show_ban(Round);
	console.log("爆弾個数："+BombNum);
	console.log("残り個数："+CloseNum);
	console.log(process.argv[2]);
	console.log(process.argv[3]);
	// ゲーム処理開始
	var input_x = process.argv[2];
	var input_y = process.argv[3];
	if(input_x >= 0 && (input_x < BanSize) &&
			input_y >= 0 && (input_y < BanSize) ){
		// 盤面表示
		Tansa[input_y][input_x] = 1;
		Tansa = rensa_search(Tansa,Round,input_x,input_y);
		// 地雷を踏んでしまう
		if(Bamen[input_y][input_x] == 1){
			console.log("Bomb!");
			mode = 0;
		}
		// 攻略完了！
		if(CloseNum <= BombNum){
			console.log("攻略完了！");
			mode = 0;
		}
		// 現在盤面表示
		var out_str = " ";
		for(var i = 0;i < BanSize;i++){
			out_str += "|" + i;
		}
		out_str += "|\n";
		for(var i = 0;i < BanSize;i++){
			out_str += i;
			for(var j = 0;j < BanSize;j++){
				if(Tansa[i][j] == 1){
					out_str += "|" + Round[i][j];
				}
				else{
					out_str += "|?";
				}
			}
			out_str += "|\n";
		}
		console.log(out_str);
		//現在盤面表示ここまで
	}
	else{
		console.log("入力が不正");
	}
}
output_str(mode,BanSize,Bamen,Tansa);

function output_str(mode,BanSize,Bamen,Tansa){
	// 出力結果作成
	var out_str = "";
	out_str += mode + "\n";
	out_str += BanSize + "\n";
	for(var i=0;i<BanSize;i++){
		for(var j=0;j<BanSize;j++){
			out_str += Bamen[i][j] + ",";
		}
		out_str += "\n";
	}
	for(var i=0;i<BanSize;i++){
		for(var j=0;j<BanSize;j++){
			out_str += Tansa[i][j] + ",";
		}
		out_str += "\n";
	}
	// 盤の出力
	fs.writeFile('ms.txt', out_str , function (err) {
	});
}
