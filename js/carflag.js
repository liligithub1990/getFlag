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
function addHandler(a,c,b){        /*�������������¼�*/
	if(a==null)return;if(a.addEventListener){addHandler=function(d,f,e){if(d==null)return;d.addEventListener(f,e,false)}}else{if(a.attachEvent){addHandler=function(d,f,e){if(d==null)return;d.attachEvent("on"+f,e)}}else{addHandler=function(d,f,e){if(d==null)return;d["on"+f]=e}}}addHandler(a,c,b)
};
//ɾ���¼��������
function removeHandler(element,type,handler){
	if(element.removeEventListener){	// !IE
		element.removeEventListener(type,handler,false);
	} else if(element.detachEvent){	// IE
		element.detachEvent('on'+type,handler,false);
	} else {	//DOM0��
		element['on'+type] = null;
	}
}
//������ά����
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
		this.wayElems = multiArray(this.opts.divW,this.opts.divH); //��Ԫ�����
		this.gamebox = document.getElementById(this.opts.wrapid);
		this.flagnum = document.getElementById(this.opts.flagnumid);
        /**  
        * body: ����  
        * ���ݽṹ{x:x0, y:y0, color:color0},  
        * x,y��ʾ����,color��ʾ��ɫ  
        **/  
		this.cars = {
			player : [],
			enemybody : []
		};
        //��ǰ�ƶ��ķ���,ȡֵ0,1,2,3, �ֱ��ʾ����,��,��,��, �����̷�������Ըı���  
        this.direction = 0; 
		//�з����ƶ��ķ���,ȡֵ0,1,2,3, �ֱ��ʾ����,��,��,��, �����̷�������Ըı���  
		this.otherdir = 0;
        //��ʱ��  
        this.timer=null;  
        //����  
        this.rowCount=11;  
        //����  
        this.colCount=11; 
		//�з�������ҳ��ĵ�ǰλ��
		this.curx = 10;    
		this.cury = 10;
		this.emcurx;
		this.emcury;
		this.flagarr = 0;   //��������
		
		this.emcrossx = 0;   //�з�������
		this.emcrossy = 0;
		this.emxarr = [0];
		this.emyarr = [0];
		this.emcircle = '';
		this.curcircle = '';
		this.paused = false;
		this.cartimer = null;
		this.emcartimer = null;
		
		this.keylock = true;   
		
		//��ҳ��ƶ�������
		this.leftlock = false;
		this.rightlock = false;
		this.uplock = false;
		this.downlock = false;
		//�з����ƶ�������
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
		gamestart : function(){    //��Ϸ��ʼ
			//this.init();
			this.move();
			this.emcarmove();
		},
		gameover : function(){    //��Ϸʧ��
			var _this = this;
			clearInterval(_this.cartimer);
			clearInterval(_this.emcartimer);
			if(typeof this.opts.overfn == "function"){
				this.opts.overfn()
			}
		},
		gamesucc : function(){    //��Ϸ�ɹ�
			var _this = this;
			clearInterval(_this.cartimer);
			clearInterval(_this.emcartimer);
			if(typeof this.opts.succfn == "function"){
				this.opts.succfn()
			}
		},
		init: function(){     //���ɻ���
            this.tbl = document.getElementById(this.opts.mainid);  
			var _this = this;
            var x = 0;  
            var y = 0;  
            //������ʼ�ƶ�����  
            this.direction = 0;  
            //����table  
			for(var i=0;i<this.rowCount;i++){
				var col = document.createElement('div'); 
				for(var j=0;j<this.colCount;j++){
					var row = document.createElement('div');
					this.wayElems[j][i] = col.appendChild(row);  
				}  
				this.tbl.appendChild(col);
			}
			//��������
			for(var i=0;i<this.rowCount;i++){
				for(var j=0;j<this.colCount;j++){
					if(i !=5 && j!=5){
						if(i==10 && j==10){
							//this.wayElems[i][j].setAttribute('flag',true);     //������flag����
						}else{
							this.wayElems[i][j].style.background = 'url('+_this.opts.flagsrc+') center center no-repeat';
						}
					}
					if(j==0 || j==10 || i==0 || i==10){                //������Ȧ��
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
			
            //������ʼλ��  
			x = 10;  
            y = 10;  
			this.wayElems[y][x].style.background = 'url('+_this.opts.plbg0+') left top no-repeat';
			this.cars.player.push({x:x,y:y,color:'url('+_this.opts.plbg0+') left top no-repeat'});    
			//�з�������ʼλ��  
			var dx,dy;
			dx = 0;  
            dy = 10;  
			this.wayElems[dy][dx].style.background = 'url('+_this.opts.embg0+') center center no-repeat';;
			this.cars.enemybody.push({x:dx,y:dy,color:'url('+_this.opts.embg0+') center center no-repeat'}); 
			this.paused = true;  
        }, 
		  
        move: function(){   //  ��ҳ��ƶ�
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
		emcarmove : function(){    //  �з����ƶ�
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
		//�ƶ�һ������  
		keydown : function(){
			var _this = this;
			//��Ӽ����¼� 
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
						  //���û����ͣ����ֹͣ�ƶ�  
							_this.pause();  
						}  
						break;  
					}*/  
                    case 37:{//left  
                        if(_this.direction==1 || _this.direction==3){  //��ֹ�����ߺͿ�����ǰ  
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
                          //��ݼ�������������  
                            if(event.ctrlKey){  
                                  _this.speedUp(-20);  
                                    break;  
                            }  
                        if(_this.direction==2 || _this.direction==0){//��ֹ�����ߺͿ�����ǰ  
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
                        if(_this.direction==3 || _this.direction==1){//��ֹ�����ߺͿ�����ǰ  
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
                        if(_this.direction==0 || _this.direction==2){//��ֹ�����ߺͿ�����ǰ  
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
		ememyturn : function(){              //���˳�״̬�ı�
			var _this = this;
			this.emcurx = _this.cars.enemybody[0].x;  
			this.emcury = _this.cars.enemybody[0].y; 
			var emcircle = this.wayElems[_this.emcury][_this.emcurx].getAttribute('circle');   //�з������ڳ���
			var curcircle = this.wayElems[_this.cury][_this.curx].getAttribute('circle');      //��ҳ����ڳ���
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
		turnleft : function(){       //���˳�����
			this.otherdir = 3;
		},
		turnright : function(){      //���˳�����
			this.otherdir = 1;
		},
		turnup : function(){         //���˳�����
			this.otherdir = 0;
		},
		turndown : function(){       //���˳�����
			this.otherdir = 2;
		},
		enemymove: function(){        //���˳��ƶ�
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
            //������һ�ڵ���ɫ  
            var color = _this.cars.enemybody[0].color;
            //��ɫ��ǰ�ƶ�  
            for(var i=0; i<_this.cars.enemybody.length-1; i++){  
                 _this.cars.enemybody[i].color = _this.cars.enemybody[i+1].color;  
            } 
			//��β��һ�ڣ� ��β��һ�ڣ����ֳ�ǰ����Ч��  
			_this.cars.enemybody.pop(); 
            _this.cars.enemybody.unshift({x:point.x,y:point.y,color:color});
			this.emcurx = _this.cars.enemybody[0].x;  
			this.emcury = _this.cars.enemybody[0].y;		
			if(this.emcury == 5 && (this.emcurx ==9 || this.emcurx ==8 || this.emcurx ==7 || this.emcurx ==6)){   //����
				_this.otherdir = 2;
			}else if((this.emcury == 1 || this.emcury == 2 || this.emcury == 3 || this.emcury == 4) && this.emcurx==5){    //����
				_this.otherdir = 1;
			}else if(this.emcury == 5 && (this.emcurx ==1 || this.emcurx ==2 || this.emcurx ==3 || this.emcurx ==4)){           //����
				_this.otherdir = 0;
			}else if((this.emcury == 10 || this.emcury == 9 || this.emcury == 8 || this.emcury == 7 || this.emcury == 6) && this.emcurx==5){      //����
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
        moveOneStep: function(){           //��ҳ��ƶ�
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
            //������һ�ڵ���ɫ
            var color = _this.cars.player[0].color;
            //��ɫ��ǰ�ƶ�  
            for(var i=0; i<_this.cars.player.length-1; i++){  
                 _this.cars.player[i].color = _this.cars.player[i+1].color;  
            } 
			//��β��һ�ڣ� ��β��һ�ڣ����ֳ�ǰ����Ч��  
			_this.cars.player.pop(); 
            _this.cars.player.unshift({x:point.x,y:point.y,color:color});
			
			this.curx = _this.cars.player[0].x;  
			this.cury = _this.cars.player[0].y; 
			if(this.cury == 5 && (this.curx ==10 || this.curx ==9 || this.curx ==8 || this.curx ==7 || this.curx ==6)){   //����
				_this.direction = 0;
			}else if((this.cury == 1 || this.cury == 2 || this.cury == 3 || this.cury == 4) && this.curx==5){    //����
				_this.direction = 3;
			}else if(this.cury == 5 && (this.curx ==1 || this.curx ==2 || this.curx ==3 || this.curx ==4)){           //����
				_this.direction = 2;
			}else if((this.cury == 10 || this.cury == 9 || this.cury == 8 || this.cury == 7 || this.cury == 6) && this.curx==5){      //����
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
			_this.flagnum.innerHTML = this.flagarr;//��ȡ���ӵ�����
			if(this.flagarr == 100){
				this.gamesucc();
			}
			
				 			
        },
		//��ͣ  
        pause: function(){  
			clearInterval(this.cartimer);  
			clearInterval(this.emcartimer); 
			this.paint(0);  
			this.paint(1); 
			this.paused = false;
        }, 
		//���Ƴ���  
        paint: function(car){ 
			var body;
			if(car==0){
				body=this.cars.player;
			}else if(car==1){
				body=this.cars.enemybody;
			}
			this.wayElems[body[0].y][body[0].x].style.background = body[0].color;  
        },	
		//��������  
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
				//����  
				if(this.direction==0){  
					y--;  
				}  
				//����  
				else if(this.direction==1){  
					x++;  
				}  
				//����  
				else if(this.direction==2){  
					y++;  
				}  
				//����  
				else{  
					x--;  
				}  
			}else if(car==1){
				body=this.cars.enemybody;
				var x = body[0].x;  
				var y = body[0].y;  
				var color = body[0].color;
				//����  
				if(this.otherdir==0){  
					y--;  
				}  
				//����  
				else if(this.otherdir==1){  
					x++;  
				}  
				//����  
				else if(this.otherdir==2){  
					y++;  
				}  
				//����  
				else{  
					x--;  
				}  
			}
            //����һ������  
            return {x:x,y:y};  
        },  
        //��齫Ҫ�ƶ�������һ����ʲô  
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
                return -1;//���߽�  
            }  	
        }		
	};