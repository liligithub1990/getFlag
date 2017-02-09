	
	var time;
	var timer;
	var n=60;
	var ofailwindow=document.getElementById('gamePopLoser');
	var osuccwindow=document.getElementById('gamePopWinner');
	var gamebox=document.getElementById('game_box');
	var oStart=document.getElementById('gameStart');
	var gameLoad = document.getElementById('gameLoad');		/* 倒计时 */
	var gameMask = document.getElementById('gameMask');		/* 遮罩层 */
	var main= document.getElementById('main');
	var lifebox = document.getElementById('lifebox');
	var lives = lifebox.children;
	var color='#eee';
	var isStart = true;
	//var oBgimg=document.getElementById('bg_img');
	carflagfn();
	var failcont = 0;
	addHandler(oStart,'click',function(){
		if(isStart){
			oStart.style.display='none';
			time=n;
			gameLoad.style.display = 'block';
			gameLoad.className = 'game_num_desc game_num_3';
			setTimeout(function(){
				gameLoad.className = 'game_num_desc game_num_2';
				setTimeout(function(){
					gameLoad.className = 'game_num_desc game_num_1';
					setTimeout(function(){
						gameLoad.className = 'game_num_desc game_num_go';
						setTimeout(function(){
							gameLoad.style.display = 'none';
							gameMask.style.display = 'none';
							gameLoad.className = 'game_num_desc game_num_3';
							//oBgimg.style.display='none';
							gameMask.style.display='none';
							//carflagfn();
							carflag.gamestart();
						},1000);
					},1000);
				},1000);
			},1000);
		}else{
			alert('您今天已经玩儿够次数啦。。明天再来玩儿吧（ps：这个版本其实刷新也可以）')
		}
	})
	var aReplaybtn=getByClass(document,'game_btn');   /*重玩按钮*/
	for(var i=0;i<aReplaybtn.length;i++){
		addHandler(aReplaybtn[i],'click',function(){
			ofailwindow.style.display='none';
			oStart.style.display='block';
			gameover();
			carflagfn();
			//pick.start();
			//gamebox.innerHTML=gamestr;
		})
	}
	var aClose=getByClass(document,'game_pop_close');     /*关闭按钮*/
	for(var i=0;i<aClose.length;i++){
		addHandler(aClose[i],'click',function(){
			if(ofailwindow.style.display=='block'){
				ofailwindow.style.display='none';
			}else if(osuccwindow.style.display=='block'){
				osuccwindow.style.display='none';
			}
			gameover();
			oStart.style.display='block';
			carflagfn();
		})
	}
	function gameover(){           /*游戏结束*/
		ofailwindow.style.display='none';
		osuccwindow.style.display='none';
		while(main.hasChildNodes()){
			main.removeChild(main.firstChild);
		}
		flagnum.innerHTML = 0;
		//oBgimg.style.display='block';
	}
	var carflag;
	var flagnum = document.getElementById('gameTime');
	function carflagfn(){
		carflag = new Car_getpoint({
			wrapid : 'game_box',
			flagnumid : 'gameTime',
			mainid : 'main',
			divW : 40,
			divH : 40,
			flagsrc :'images/mark.png',
			embg0 : 'http://js.xcar.com.cn/liyan_game/getflag/images/emcar0.png',
			embg1 : 'http://js.xcar.com.cn/liyan_game/getflag/images/emcar1.png',
			embg2 : 'http://js.xcar.com.cn/liyan_game/getflag/images/emcar2.png',
			embg3 : 'http://js.xcar.com.cn/liyan_game/getflag/images/emcar3.png',
			plbg0 : 'http://js.xcar.com.cn/liyan_game/getflag/images/player0.png',
			plbg1 : 'http://js.xcar.com.cn/liyan_game/getflag/images/player1.png',
			plbg2 : 'http://js.xcar.com.cn/liyan_game/getflag/images/player2.png',
			plbg3 : 'http://js.xcar.com.cn/liyan_game/getflag/images/player3.png',
			overfn : function(){
				failcont ++ ;
				if(ofailwindow){
					ofailwindow.style.display='block';
					ofailwindow.style.zIndex=100;
				}
				switch(failcont){
					case 1:	
						for(var i=3;i<lives.length;i++){
							lives[i].className = 'nolife';
						}
					break;
					case 2:	
						for(var i=2;i<lives.length;i++){
							lives[i].className = 'nolife';
						}
					break;
					case 3:	
						for(var i=1;i<lives.length;i++){
							lives[i].className = 'nolife';
						}
					break;
					case 4:	
						for(var i=0;i<lives.length;i++){
							lives[i].className = 'nolife';
						}
						isStart = false;
					break;
				}
				gameMask.style.display = 'block';
			},
			succfn : function(){
				if(osuccwindow){
					osuccwindow.style.display='block';
					osuccwindow.style.zIndex=100;
				}
				gameMask.style.display = 'block';
				failcont = 0;
				isStart = true;
				for(var i=0;i<lives.length;i++){
					lives[i].className = 'havelife';
				}
			}
		});
		carflag.init();
	}