function getPos(obj){
	var l=0;
	var t=0;
	while(obj){
		l+=obj.offsetLeft;
		t+=obj.offsetTop;
		obj=obj.offsetParent;
	}
	return {left:l, top:t};
};
function getByClass(oParent,sClass){
	if(oParent.getElementsByClassName){
		return oParent.getElementsByClassName(sClass);
	}else{
		sClass=sClass.replace(/^\s+|\s+$/g,'');
		var reg=new RegExp('\\b'+sClass+'\\b');
		var arr=[];
		var aEle=oParent.getElementsByTagName('*');
		for(var i=0; i<aEle.length; i++){
			if(reg.test(aEle[i].className)){
				arr.push(aEle[i]);	
			}
		}
		return arr;
	}
};
function addHandler(a,c,b){        /*公共函数：绑定事件*/
	if(a==null)return;if(a.addEventListener){addHandler=function(d,f,e){if(d==null)return;d.addEventListener(f,e,false)}}else{if(a.attachEvent){addHandler=function(d,f,e){if(d==null)return;d.attachEvent("on"+f,e)}}else{addHandler=function(d,f,e){if(d==null)return;d["on"+f]=e}}}addHandler(a,c,b)
};
//删除事件处理程序
function removeHandler(element,type,handler){
	if(element.removeEventListener){	// !IE
		element.removeEventListener(type,handler,false);
	} else if(element.detachEvent){	// IE
		element.detachEvent('on'+type,handler,false);
	} else {	//DOM0级
		element['on'+type] = null;
	}
}
//创建二维数组
function multiArray(m,n) {
	var arr =  new Array(n);
	for(var i=0; i<m; i++) 
		arr[i] = new Array(m);
	return arr;
};
	var Car_getpoint = function(options){
		this.opts = {
			wrapid : 'game_box',
			flagnumid : 'gameTime',
			mainid : 'main',
			divW : 30,
			divH : 30,
			flagsrc :'',
			embg0 : '',
			embg1 : '',
			embg2 : '',
			embg3 : '',
			plbg0 : '',
			plbg1 : '',
			plbg2 : '',
			plbg3 : '',
			overfn : null,
			succfn : null
		};
		this.wayElems = multiArray(this.opts.divW,this.opts.divH); //单元格对象
		this.gamebox = document.getElementById(this.opts.wrapid);
		this.flagnum = document.getElementById(this.opts.flagnumid);
        /**  
        * body: 车身，  
        * 数据结构{x:x0, y:y0, color:color0},  
        * x,y表示坐标,color表示颜色  
        **/  
		this.cars = {
			player : [],
			enemybody : []
		};
        //当前移动的方向,取值0,1,2,3, 分别表示向上,右,下,左, 按键盘方向键可以改变它  
        this.direction = 0; 
		//敌方车移动的方向,取值0,1,2,3, 分别表示向上,右,下,左, 按键盘方向键可以改变它  
		this.otherdir = 0;
        //定时器  
        this.timer=null;  
        //行数  
        this.rowCount=11;  
        //列数  
        this.colCount=11; 
		//敌方车和玩家车的当前位置
		this.curx = 10;    
		this.cury = 10;
		this.emcurx;
		this.emcury;
		this.flagarr = 0;   //旗子数组
		
		this.emcrossx = 0;   //敌方车拐弯
		this.emcrossy = 0;
		this.emxarr = [0];
		this.emyarr = [0];
		this.emcircle = '';
		this.curcircle = '';
		this.paused = false;
		this.cartimer = null;
		this.emcartimer = null;
		
		this.keylock = true;   
		
		//玩家车移动车道锁
		this.leftlock = false;
		this.rightlock = false;
		this.uplock = false;
		this.downlock = false;
		//敌方车移动车道锁
		this.emleftlock = false;
		this.emrightlock = false;
		this.emuplock = false;
		this.emdownlock = false;
		
		if(typeof options == "object"){
			this.setOptions(options);
		};
	};
	Car_getpoint.prototype = {
		constructor : Car_getpoint,
		setOptions  : function(options){
			var _this = this;
			(function(){for(var i in options){
				_this.opts[i] = options[i];
			}})();
		},
		gamestart : function(){    //游戏开始
			//this.init();
			this.move();
			this.emcarmove();
		},
		gameover : function(){    //游戏失败
			var _this = this;
			clearInterval(_this.cartimer);
			clearInterval(_this.emcartimer);
			if(typeof this.opts.overfn == "function"){
				this.opts.overfn()
			}
		},
		gamesucc : function(){    //游戏成功
			var _this = this;
			clearInterval(_this.cartimer);
			clearInterval(_this.emcartimer);
			if(typeof this.opts.succfn == "function"){
				this.opts.succfn()
			}
		},
		init: function(){     //生成画布
            this.tbl = document.getElementById(this.opts.mainid);  
			var _this = this;
            var x = 0;  
            var y = 0;  
            //产生初始移动方向  
            this.direction = 0;  
            //构造table  
			for(var i=0;i<this.rowCount;i++){
				var col = document.createElement('div'); 
				for(var j=0;j<this.colCount;j++){
					var row = document.createElement('div');
					this.wayElems[j][i] = col.appendChild(row);  
				}  
				this.tbl.appendChild(col);
			}
			//产生旗子
			for(var i=0;i<this.rowCount;i++){
				for(var j=0;j<this.colCount;j++){
					if(i !=5 && j!=5){
						if(i==10 && j==10){
							//this.wayElems[i][j].setAttribute('flag',true);     //给旗子flag属性
						}else{
							this.wayElems[i][j].style.background = 'url('+_this.opts.flagsrc+') center center no-repeat';
						}
					}
					if(j==0 || j==10 || i==0 || i==10){                //给车道圈数
						this.wayElems[i][j].setAttribute('circle',0);
					}else if(j==1 || j==9 || i==1 || i==9){
						this.wayElems[i][j].setAttribute('circle',1);
					}else if(j==2 || j==8 || i==2 || i==8){
						this.wayElems[i][j].setAttribute('circle',2);
					}else if(j==3 || j==7 || i==3 || i==7){
						this.wayElems[i][j].setAttribute('circle',3);
					}else if(j==4 || j==6 || i==4 || i==6){
						this.wayElems[i][j].setAttribute('circle',4);
					}
				}  
			}
			
            //汽车初始位置  
			x = 10;  
            y = 10;  
			this.wayElems[y][x].style.background = 'url('+_this.opts.plbg0+') left top no-repeat';
			this.cars.player.push({x:x,y:y,color:'url('+_this.opts.plbg0+') left top no-repeat'});    
			//敌方汽车初始位置  
			var dx,dy;
			dx = 0;  
            dy = 10;  
			this.wayElems[dy][dx].style.background = 'url('+_this.opts.embg0+') center center no-repeat';;
			this.cars.enemybody.push({x:dx,y:dy,color:'url('+_this.opts.embg0+') center center no-repeat'}); 
			this.paused = true;  
        }, 
		  
        move: function(){   //  玩家车移动
			var _this = this;
            _this.cartimer = setInterval(function(){
				_this.erase(0); 
				_this.moveOneStep();  
				_this.paint(0);
				if(typeof _this.curx != 'undefined' && typeof _this.emcurx != 'undefined'){
					if(_this.curx == _this.emcurx && _this.cury == _this.emcury){
						_this.gameover();
					}
				}
				_this.keydown();
            }, 160);  
			
        }, 
		emcarmove : function(){    //  敌方车移动
			var _this = this;
			_this.emcartimer = setInterval(function(){
				_this.erase(1); 
				_this.ememyturn();
				_this.enemymove();  
				_this.paint(1);
				if(typeof _this.curx != 'undefined' && typeof _this.emcurx != 'undefined'){
					if(_this.curx == _this.emcurx && _this.cury == _this.emcury){
						_this.gameover();
					}
				}
            }, 380);
		},
		//移动一节身体  
		keydown : function(){
			var _this = this;
			//添加键盘事件 
			addHandler(document,'keydown',function(e){
				if (!e)e=window.event;  
                switch(e.keyCode | e.which | e.charCode){ 
					/*case 32: {  
						if(!_this.paused){  
							_this.move();  
							_this.emcarmove();  
							_this.paused = true;  
						}  
						else{  
						  //如果没有暂停，则停止移动  
							_this.pause();  
						}  
						break;  
					}*/  
                    case 37:{//left  
                        if(_this.direction==1 || _this.direction==3){  //阻止倒退走和快速向前  
                            break;  
                        }
						if(_this.cury==5 && _this.curx != 5 && _this.curx != 6){
							if(!_this.leftlock){
							_this.direction = 3;
							_this.leftlock = true;
							}
						}
                        break;  
                    }  
                    case 38:{//up  
                          //快捷键在这里起作用  
                            if(event.ctrlKey){  
                                  _this.speedUp(-20);  
                                    break;  
                            }  
                        if(_this.direction==2 || _this.direction==0){//阻止倒退走和快速向前  
                            break;  
                        }  
						if(!_this.uplock){
							if(_this.curx == 5 && _this.cury != 5 && _this.cury != 6){
								 _this.direction = 0; 
								_this.uplock = true;
							}
						}
                        break;  
                    }  
                    case 39:{//right  
                        if(_this.direction==3 || _this.direction==1){//阻止倒退走和快速向前  
                            break;  
                        }  
						if(!_this.rightlock){
							if(_this.cury == 5 && _this.curx != 5 && _this.curx != 4){
								_this.direction = 1;  
								_this.rightlock = true;
							}
						}
                        break;  
                    }  
                    case 40:{//down  
                        if(_this.direction==0 || _this.direction==2){//阻止倒退走和快速向前  
                            break;  
                        }  
                        if(!_this.downlock){
							if(_this.curx == 5  && _this.cury != 5 && _this.cury != 4){
								_this.direction = 2;    
								_this.downlock = true;
							}
						}
                        break;  
                    }  
                }  
			})
		},
		ememyturn : function(){              //敌人车状态改变
			var _this = this;
			this.emcurx = _this.cars.enemybody[0].x;  
			this.emcury = _this.cars.enemybody[0].y; 
			var emcircle = this.wayElems[_this.emcury][_this.emcurx].getAttribute('circle');   //敌方车所在车道
			var curcircle = this.wayElems[_this.cury][_this.curx].getAttribute('circle');      //玩家车所在车道
			if(_this.emcury == 5){
				if(emcircle != curcircle){
					this.emcrossy++;
					if(this.emcrossx!=this.emxarr[0]){
						if(emcircle - curcircle < 0){
							if(_this.emcurx <= 4){
								if(!_this.emrightlock){
									_this.turnright();
									_this.emrightlock = true;
								}
							}else if(_this.emcurx >= 6){
								if(!_this.emleftlock){
									_this.turnleft();
									_this.emleftlock = true;	
								}
							}
						}else if(emcircle - curcircle > 0){
							if(_this.emcurx <= 4){
								if(!_this.emleftlock){
									_this.turnleft();
									_this.emleftlock = true;	
								}
							}else if(_this.emcurx >= 6){
								if(!_this.emrightlock){
									_this.turnright();
									_this.emrightlock = true;	
								}
							}
							this.emxarr.push(this.emcrossx);
							this.emxarr.pop();
						}
					}
				}
			}else if(_this.emcurx == 5){
				if(emcircle != curcircle){	
					this.emcrossx++;
					if(this.emcrossy!=this.emyarr[0]){
						if(emcircle - curcircle < 0){
							if(_this.emcury <= 4){
								if(!_this.emdownlock){
									_this.turndown();
									_this.emdownlock = true;	
								}
								
							}else if(_this.emcury >= 6){
								if(!_this.emuplock){
									_this.turnup();
									_this.emuplock = true;	
								}
								
							}
						}else if(emcircle - curcircle > 0){
							if(_this.emcury <= 4){
								if(!_this.emuplock){
									_this.turnup();
									_this.emuplock = true;	
								}
							}else if(_this.emcury >= 6){
								if(!_this.emdownlock){
									_this.turndown();
									_this.emdownlock = true;	
								}
							}
						}
						this.emyarr.push(this.emcrossy);
						this.emyarr.pop();
					}
				}
			}
			
		},
		turnleft : function(){       //敌人车向左
			this.otherdir = 3;
		},
		turnright : function(){      //敌人车向右
			this.otherdir = 1;
		},
		turnup : function(){         //敌人车向上
			this.otherdir = 0;
		},
		turndown : function(){       //敌人车向下
			this.otherdir = 2;
		},
		enemymove: function(){        //敌人车移动
			var _this = this;
            if(_this.checkNextStep(1)==-1){  
				if(this.otherdir == 0){
					_this.cars.enemybody[0].color = 'url('+_this.opts.embg1+') center center no-repeat';
					this.otherdir = 1;
				}else if(this.otherdir == 1){
					_this.cars.enemybody[0].color = 'url('+_this.opts.embg2+') center center no-repeat';
					this.otherdir = 2;
				}else if(this.otherdir == 2){
					_this.cars.enemybody[0].color = 'url('+_this.opts.embg3+') center center no-repeat';
					this.otherdir = 3;
				}else if(this.otherdir == 3){
					_this.cars.enemybody[0].color = 'url('+_this.opts.embg0+') center center no-repeat';
					this.otherdir = 0;
				}
            }   			
            var point = this.getNextPos(1);  
            //保留第一节的颜色  
            var color = _this.cars.enemybody[0].color;
            //颜色向前移动  
            for(var i=0; i<_this.cars.enemybody.length-1; i++){  
                 _this.cars.enemybody[i].color = _this.cars.enemybody[i+1].color;  
            } 
			//车尾减一节， 车尾加一节，呈现车前进的效果  
			_this.cars.enemybody.pop(); 
            _this.cars.enemybody.unshift({x:point.x,y:point.y,color:color});
			this.emcurx = _this.cars.enemybody[0].x;  
			this.emcury = _this.cars.enemybody[0].y;		
			if(this.emcury == 5 && (this.emcurx ==9 || this.emcurx ==8 || this.emcurx ==7 || this.emcurx ==6)){   //向左
				_this.otherdir = 2;
			}else if((this.emcury == 1 || this.emcury == 2 || this.emcury == 3 || this.emcury == 4) && this.emcurx==5){    //向下
				_this.otherdir = 1;
			}else if(this.emcury == 5 && (this.emcurx ==1 || this.emcurx ==2 || this.emcurx ==3 || this.emcurx ==4)){           //向右
				_this.otherdir = 0;
			}else if((this.emcury == 10 || this.emcury == 9 || this.emcury == 8 || this.emcury == 7 || this.emcury == 6) && this.emcurx==5){      //向上
				_this.otherdir = 3;
			}
			if(_this.emcurx != 5){
				this.emuplock = false;
				this.emdownlock = false;
				
			}else if(_this.emcury != 5){
				this.emleftlock = false;
				this.emrightlock = false;
				
			} 
        },
        moveOneStep: function(){           //玩家车移动
			var _this = this;
            if(_this.checkNextStep(0)==-1){  
				if(this.direction == 0){
					this.direction = 3;
					_this.cars.player[0].color = 'url('+_this.opts.plbg3+') center center no-repeat';
				}else if(this.direction == 1){
					_this.cars.player[0].color = 'url('+_this.opts.plbg0+') center center no-repeat';
					this.direction = 0;
				}else if(this.direction == 2){
					this.direction = 1;
					_this.cars.player[0].color = 'url('+_this.opts.plbg1+') center center no-repeat';
				}else if(this.direction == 3){
					_this.cars.player[0].color = 'url('+_this.opts.plbg2+') center center no-repeat';
					this.direction = 2;
				}
				
            }   			
            var point = this.getNextPos(0);  
            //保留第一节的颜色
            var color = _this.cars.player[0].color;
            //颜色向前移动  
            for(var i=0; i<_this.cars.player.length-1; i++){  
                 _this.cars.player[i].color = _this.cars.player[i+1].color;  
            } 
			//车尾减一节， 车尾加一节，呈现车前进的效果  
			_this.cars.player.pop(); 
            _this.cars.player.unshift({x:point.x,y:point.y,color:color});
			
			this.curx = _this.cars.player[0].x;  
			this.cury = _this.cars.player[0].y; 
			if(this.cury == 5 && (this.curx ==10 || this.curx ==9 || this.curx ==8 || this.curx ==7 || this.curx ==6)){   //向左
				_this.direction = 0;
			}else if((this.cury == 1 || this.cury == 2 || this.cury == 3 || this.cury == 4) && this.curx==5){    //向下
				_this.direction = 3;
			}else if(this.cury == 5 && (this.curx ==1 || this.curx ==2 || this.curx ==3 || this.curx ==4)){           //向右
				_this.direction = 2;
			}else if((this.cury == 10 || this.cury == 9 || this.cury == 8 || this.cury == 7 || this.cury == 6) && this.curx==5){      //向上
				_this.direction = 1;
			}			
            
			if(this.curx!=5 && this.cury!=5){
				if(this.wayElems[this.cury][this.curx].getAttribute('flag') == 'true'){
				}else{
					this.flagarr++;
					this.wayElems[this.cury][this.curx].setAttribute('flag',true);
				}
				
			}
			//console.log(this.flagarr.length)
			this.curcircle = this.wayElems[_this.cury][_this.curx].getAttribute('circle');
			if(_this.cury != 5){
				this.leftlock = false;
				this.rightlock = false;
				
			}else if(_this.curx != 5){
				this.uplock = false;
				this.downlock = false;
			}
			_this.flagnum.innerHTML = this.flagarr;//获取旗子的数量
			if(this.flagarr == 100){
				this.gamesucc();
			}
			
				 			
        },
		//暂停  
        pause: function(){  
			clearInterval(this.cartimer);  
			clearInterval(this.emcartimer); 
			this.paint(0);  
			this.paint(1); 
			this.paused = false;
        }, 
		//绘制车身  
        paint: function(car){ 
			var body;
			if(car==0){
				body=this.cars.player;
			}else if(car==1){
				body=this.cars.enemybody;
			}
			this.wayElems[body[0].y][body[0].x].style.background = body[0].color;  
        },	
		//擦除车身  
        erase: function(car){  
			var body;
			if(car==0){
				body=this.cars.player;
				this.wayElems[body[0].y][body[0].x].style.background = ""; 
				
			}else if(car==1){
				body=this.cars.enemybody;
				if(body[0].y == 5 || body[0].x == 5){
					this.wayElems[body[0].y][body[0].x].style.background = '';
				}else{
					if(this.wayElems[body[0].y][body[0].x].getAttribute('flag')=='true'){
						this.wayElems[body[0].y][body[0].x].style.background = '';
					}else{
						this.wayElems[body[0].y][body[0].x].style.background = 'url('+this.opts.flagsrc+') center center no-repeat';
					}
				}	
			}
        },
        getNextPos: function(car){
			var body;
			if(car==0){
				body=this.cars.player;
				var x = body[0].x;  
				var y = body[0].y;  
				var color = body[0].color;
				//向上  
				if(this.direction==0){  
					y--;  
				}  
				//向右  
				else if(this.direction==1){  
					x++;  
				}  
				//向下  
				else if(this.direction==2){  
					y++;  
				}  
				//向左  
				else{  
					x--;  
				}  
			}else if(car==1){
				body=this.cars.enemybody;
				var x = body[0].x;  
				var y = body[0].y;  
				var color = body[0].color;
				//向上  
				if(this.otherdir==0){  
					y--;  
				}  
				//向右  
				else if(this.otherdir==1){  
					x++;  
				}  
				//向下  
				else if(this.otherdir==2){  
					y++;  
				}  
				//向左  
				else{  
					x--;  
				}  
			}
            //返回一个坐标  
            return {x:x,y:y};  
        },  
        //检查将要移动到的下一步是什么  
        checkNextStep: function(car){ 
			var body;
			if(car==0){
				body=this.cars.player;
			}else if(car==1){
				body=this.cars.enemybody;
			}
            var point = this.getNextPos(car);  
            var x = point.x;  
            var y = point.y; 
			var curx = body[0].x;  
            var cury = body[0].y; 		
            if(x<0||x>=this.colCount||y<0||y>=this.rowCount || (curx==9&&cury==1) ||(curx==1&&cury==1) || (curx==1&&cury==9) || (curx==9&&cury==9) || (curx==8&&cury==2) ||(curx==2&&cury==2) || (curx==2&&cury==8) || (curx==8&&cury==8) ||(curx==7&&cury==3) ||(curx==3&&cury==3) || (curx==3&&cury==7) || (curx==7&&cury==7) || (curx==6&&cury==4) ||(curx==4&&cury==4) || (curx==4&&cury==6) || (curx==6&&cury==6)){  
                return -1;//触边界  
            }  	
        }		
	};