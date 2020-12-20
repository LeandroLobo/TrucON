
/* palos: espada=1, oro=2, copa=3, basto=4 */
/* numeros: del 1 al 7, además la sota=8, caballo =9 y rey=10 */
/* TABLA DE VALORES */
/* el menor valor es 4, el mayor es 17 */
/* del 4 al 10 valen igual que el numero */
/* 1, 2 y 3 valen 11, 12 y 13 respectivamente (numero+10)*/
/* 7 de oro vale 14 */
/* 7 de espada vale 15 */
/* 1 de basto vale 16 */
/* 1 de espada vale 17 */

var datos={
	total: [0,0],
	turno:0,
	mano: 0,
	contCartas: 0,
	contVueltas: 0,
	enMesa: [0,0],
	equipoA: 0,
	equipoB: 0,
	parda: 0,
	nivelTruco: 1,
	esTruco: 0,
	nivelEnvido: 1,
	q: 0,
	qe: 0,
	ultimo: 0,
	primera: 0,
	codigo: 0,
	pregunta: -1,
	ganadorEnvido: -1,
	carta: -1,
	jugando: false,
	meVoy: 0,
	revancha: [0,0],
	salir: false,
	jugador:[
	{
		nombre: 'jug0',
		numero: [],
		palo: [],
		envido: 0,
		flor: 0,
		valor: [],
	},
	{
		nombre: 'jug1',
		numero: [],
		palo: [],
		envido: 0,
		flor: 0,
		valor: [],
	}],
}

var vuelta=0, EEP=false, salir=false;

/* el if(numero<8) es para evitar la suma de las negras (8,9 y 10) */
function contarEnvido(x){
	envido=0;
	flor=0;
	if(datos.jugador[x].palo[0]==datos.jugador[x].palo[1]){
		if(datos.jugador[x].palo[1]==datos.jugador[x].palo[2]){
			/* hay FLOR, devolver la suma de todos siempre que no sean las negras y sumar 20 */
			for(i=0; i<3; i++){
				if(datos.jugador[x].numero[i]<8){
					envido+=datos.jugador[x].numero[i];
				}
			}
			envido+=20;
			flor=1;
		}
		else{
			/* iguales 0 y 1, devolver la suma siempre que no sean las negras y sumar 20 */
			if(datos.jugador[x].numero[0]<8){
				envido+=datos.jugador[x].numero[0];
			}
			if(datos.jugador[x].numero[1]<8){
				envido+=datos.jugador[x].numero[1];
			}
			envido+=20;
		}
	}
	else{
		if(datos.jugador[x].palo[1]==datos.jugador[x].palo[2]){
			/* iguales 1 y 2, devolver la suma siempre que no sean las negras y sumar 20 */
			if(datos.jugador[x].numero[1]<8){
				envido+=datos.jugador[x].numero[1];
			}
			if(datos.jugador[x].numero[2]<8){
				envido+=datos.jugador[x].numero[2];
			}
			envido+=20;
		}
		else{
			if(datos.jugador[x].palo[0]==datos.jugador[x].palo[2]){
				/* iguales 0 y 2, devolver la suma siempre que no sean las negras y sumar 20 */
				if(datos.jugador[x].numero[0]<8){
					envido+=datos.jugador[x].numero[0];
				}
				if(datos.jugador[x].numero[2]<8){
					envido+=datos.jugador[x].numero[2];
				}
				envido+=20;
			}
			else{
				/* todos diferentes, devolver el mayor numero, las negras no suman */
				for(i=0; i<3; i++){
					if(datos.jugador[x].numero[i]<8 && envido<datos.jugador[x].numero[i]){
						envido=datos.jugador[x].numero[i];
					}
				}
			}
		}
	}
	datos.jugador[x].envido=envido;
	datos.jugador[x].flor=flor;
}

function valorCartas(x){
	valor=[];
	for(i=0; i<3; i++){
		/* ver tabla de valores */
		if(datos.jugador[x].numero[i]<4){
			/* 1, 2 y 3 */
			valor[i]=datos.jugador[x].numero[i]+10;
		}
		else{
			/* cartas comunes y las negras */
			valor[i]=datos.jugador[x].numero[i];
		}
		/* 7 de oro */
		if(datos.jugador[x].numero[i]==7 && datos.jugador[x].palo[i]==2){
			valor[i]=14;
		}
		/* 7 de espada */
		if(datos.jugador[x].numero[i]==7 && datos.jugador[x].palo[i]==1){
			valor[i]=15;
		}
		/* 1 de basto */
		if(datos.jugador[x].numero[i]==1 && datos.jugador[x].palo[i]==4){
			valor[i]=16;
		}
		/* 1 de espada */
		if(datos.jugador[x].numero[i]==1 && datos.jugador[x].palo[i]==1){
			valor[i]=17;
		}
		datos.jugador[x].valor[i]=valor[i];
	}
}

function mostrarUnaCarta(i,c,x,p) {
	return new Promise(resolve => {
		var naipeRef = storageRef.child('naipes'+MN+'/'+datos.jugador[x].palo[i]+datos.jugador[x].numero[i]+'.png');
		naipeRef.getDownloadURL().then(function(url){
			$$('#'+c+p).attr('src',url);
		});
	});
}

function mostrarCartas(){
	for(i=0; i<3; i++){
		mostrarUnaCarta(i,'c',NJ,i);
	}
}

function hayFlor(){
	$$('.E').removeClass('color-yellow').addClass('color-green');
	f=0;
	for(i=0; i<2; i++){
		if(datos.jugador[i].flor==1){
			datos.nivelEnvido=3;
			f++;
			ii=i;
		}
	}
	if(f==0){
		$$('.textoEnvido').html('E');
	}else{
		if(f==1){
			/* sin opcion a replica */
			if(NJ==ii){
				$$('.textoEnvido').html('F');
				$$('.E').removeClass('color-green').addClass('color-yellow');	
				$$('#lie').html('<a class="flor"><div class="fab-text">Flor</div></a>');
				$$('.flor').on('click',function(){
					EEP=false;
					datos.jugando=true;
					app.fab.close('.E');
					$$('.textoEnvido').html('');
					datos.codigo=30;
					datos.pregunta=(ii+1)%2;
					partida.set(datos);
				});	
			}else{
				$$('.textoEnvido').html('E');
				$$('#liRE').html('<li><a class="list-button item-link popover-close anotate3">Anotate 3 nomás...</a></li>');
				$$('.anotate3').on('click',function(){
					datos.jugando=false;
					$$('.textoEnvido').html('');
					datos.total[ii]+=datos.nivelEnvido;
					datos.codigo=300;
					datos.pregunta=(NJ+1)%2;
					partida.set(datos);
				});
			}
		}
		else{
			/* opciones de contraflor */
			$$('.textoEnvido').html('F');
			$$('.E').removeClass('color-green').addClass('color-yellow');
			$$('#lie').html('<a href=""><div class="fab-text flor">Flor</div></a>');
			$$('.flor').on('click',function(){
				EEP=false;
				app.fab.close('.E');
				$$('.textoEnvido').html('');
				datos.jugando=true;
				datos.codigo=31;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
		}
	}
}

function repartirCartas(){
	/* reset de las cartas */
	for(i=0; i<2; i++){
		for(j=0; j<3; j++){
			datos.jugador[i].numero[j]=datos.jugador[i].palo[j]=0;
		}
	}
	/* reparte cartas aleatoriamente, y verifica que no se repitan valores */
	for(c=0; c<6; c++){
		k=0;
		while(k==0){
			h=0;
			n=parseInt(Math.random()*10+1);
			p=parseInt(Math.random()*4+1);
			for(i=0; i<2; i++){
				for(j=0; j<3; j++){
					if(n==datos.jugador[i].numero[j] && p==datos.jugador[i].palo[j]){
						h++;
					}
				}
			}
			if(h==0){
				k=1;
			}
		}
		datos.jugador[c%2].numero[parseInt(c/2)]=n;
		datos.jugador[c%2].palo[parseInt(c/2)]=p;
	}
	/* definir valor envido/flor y valor de cartas para el truco */
	for(x=0; x<2; x++){
	 	contarEnvido(x);
		valorCartas(x);
	}
	/* reset valores para analisis de las jugadas */
	datos.enMesa=[0,0];
	datos.turno=datos.mano%2;
	datos.contCartas=0;
	datos.contVueltas=0;
	datos.parda=0;
	datos.equipoA=0;
	datos.equipoB=0;
	datos.nivelTruco=1;
	datos.nivelEnvido=1;
	datos.q=0;
	datos.qe=0;
	datos.primera=-1;
	datos.ultimo=-1;
	datos.codigo=1;
	datos.esTruco=0;
	datos.meVoy=0;
	datos.jugando=false;
	actualizarAnotador();
	partida.set(datos);
}

function jugarCarta(carta){
	if(NJ==datos.turno){
		datos.jugando=true;
		datos.carta=carta;
		$$('.textoEnvido').html('');
		$$('#c'+carta).attr('src','');
		mostrarUnaCarta(carta,'y',NJ,datos.contVueltas);
		datos.codigo=90;
		datos.pregunta=(NJ+1)%2;
		datos.enMesa[datos.turno]=datos.jugador[NJ].valor[carta];
		datos.turno++;
		datos.contCartas++;
		datos.q=0;
		if(datos.turno==2){
			datos.turno=0;
		}
		if(datos.contCartas==2){
			datos.contCartas=0;
			datos.contVueltas++;
			analizarMano();
		}
		if(datos.contCartas==0){
			datos.enMesa=[0,0];
		}
		partida.set(datos);
	}else if(NJ!=datos.turno){
		app.dialog.alert('Esperá tu turno', 'TrucOn');
		return;
	}
}

function analizarMano(){
	A=datos.enMesa[0];
	B=datos.enMesa[1]
	if(datos.parda==1){
		if(A>B){
			anotarTruco(0);
			return;
		}
		if(B>A){
			anotarTruco(1);
			return;
		}
	}
	if(A>B){
		datos.equipoA++;
		if(datos.contVueltas==1){
			datos.primera=0;
		}
	}
	if(B>A){
		datos.equipoB++;
		if(datos.contVueltas==1){
			datos.primera=1;
		}
	}
	if(A==B){
		datos.parda=1;
		if(datos.contVueltas==2){
			if(datos.equipoA>datos.equipoB){
				anotarTruco(0);
				return;
			}
			if(datos.equipoB>datos.equipoA){
				anotarTruco(1);
				return;
			}
		}
		if(datos.contVueltas==3){
			if(datos.primera==0){
				anotarTruco(0);
				return;
			}
			if(datos.primera==1){
				anotarTruco(1);
				return;
			}
			if(datos.mano%2==0){
				anotarTruco(0);
				return;
			}
			else{
				anotarTruco(1);
				return;
			}
		}
	}
	if(datos.parda==0 && datos.equipoA==2){
		anotarTruco(0);
		return;
	}
	if(datos.parda==0 && datos.equipoB==2){
		anotarTruco(1);
		return;
	}
	if(A>B){
		datos.turno=0;
	}
	if(B>A){
		datos.turno=1;
	}
}

function anotarTruco(xx){
	datos.total[xx]+=datos.nivelTruco;
	datos.mano++;
	datos.codigo=2;
	datos.esTruco=1;
	partida.set(datos);
}

function cantarTruco(){
	/* si no es el turno cerrar inmediatamente el popover */
	if((datos.turno!=NJ && datos.q!=1) || datos.nivelTruco==4 || (datos.turno==NJ && datos.q==-1 && datos.nivelTruco!=3) || NJ==datos.ultimo){
		app.fab.close('.T');
		return;
	}
	$$('#lit').html('');
	/* Según el nivel de truco actual serán las opciones que se muestran en el popover */
	if(datos.nivelTruco==1){
		$$('#lit').html('<a class="truco"><div class="fab-text">Truco</div></a>'
			+'<a class="meVoy"><div class="fab-text">Retirarse</div></a>');
		$$('.truco').on('click',function(){
			$$('.textoEnvido').html('');
			datos.jugando=true;
			app.fab.close('.T');
			datos.codigo=70;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		$$('.meVoy').on('click',function(){
			datos.jugando=true;
			app.fab.close('.T');
			datos.meVoy=1;
			datos.codigo=400;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		return;
	}
	if(datos.nivelTruco==2){
		$$('.textoEnvido').html('');
		$$('#lit').html('<a class="truco"><div class="fab-text">Re Truco</div></a>'
			+'<a class="meVoy"><div class="fab-text">Retirarse</div></a>');
		if(datos.q==1){/* realiza la pregunta sin esperar el click, porque q==1 significa que retrucó sin esperar jugar cartas */
			datos.codigo=71;
			datos.pregunta=NJ;
			partida.set(datos);
		}else{
			$$('.truco').on('click',function(){
				datos.jugando=true;
				app.fab.close('.T');
				datos.codigo=71;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
			$$('.meVoy').on('click',function(){
				datos.jugando=true;
				app.fab.close('.T');
				datos.meVoy=1;
				datos.codigo=400;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
		}
		return;
	}
	if(datos.nivelTruco==3){
		$$('#lit').html('<a class="truco"><div class="fab-text">Vale 4</div></a>'
			+'<a class="meVoy"><div class="fab-text">Retirarse</div></a>');
		if(datos.q==1){
			datos.codigo=72;
			datos.pregunta=NJ;
			partida.set(datos);
		}else{
			$$('.truco').on('click',function(){
				datos.jugando=true;
				app.fab.close('.T');
				datos.codigo=72;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
			$$('.meVoy').on('click',function(){
				datos.jugando=true;
				app.fab.close('.T');
				datos.meVoy=1;
				datos.codigo=400;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
		}
		return;
	}
}

function anotarEnvido(){
	if(datos.jugador[0].envido>datos.jugador[1].envido){
		datos.total[0]+=datos.nivelEnvido;
		datos.ganadorEnvido=0;
	}else if(datos.jugador[1].envido>datos.jugador[0].envido){
		datos.total[1]+=datos.nivelEnvido
		datos.ganadorEnvido=1;
	}else{
		if(datos.mano%2==0){
			datos.total[0]+=datos.nivelEnvido;
			datos.ganadorEnvido=0;
		}else{
			datos.total[1]+=datos.nivelEnvido;
			datos.ganadorEnvido=1;
		}
	}
	datos.codigo=3;
	datos.qe=0;
	partida.set(datos);
}

function cantarEnvido(){
	if((NJ!=datos.turno && datos.qe==0) || datos.jugador[NJ].flor==1 || (datos.qe==0 && !$$('.textoEnvido').html())){
		if(datos.jugador[NJ].flor==1 && datos.turno==NJ && $$('.textoEnvido').html()){
			return;
		}
		app.fab.close('.E');
		return;
	}
	$$('#lie').html('');
	if(datos.nivelEnvido==1 || (datos.nivelEnvido==3 && datos.jugador[NJ].flor==0)){
		$$('#lie').html('<a class="envido"><div class="fab-text">Envido</div></a>'
			+'<a class="realEnvido"><div class="fab-text">Real Envido</div></a>'
			+'<a class="faltaEnvido"><div class="fab-text">Falta Envido</div></a>');
		$$('.envido').on('click',function(){
			EEP=false;
			datos.jugando=true;
			$$('.textoEnvido').html('');
			app.fab.close('.E');
			datos.codigo=40;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		$$('.realEnvido').on('click',function(){
			EEP=false;
			datos.jugando=true;
			$$('.textoEnvido').html('');
			app.fab.close('.E');
			datos.codigo=41;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		$$('.faltaEnvido').on('click',function(){
			EEP=false;
			datos.jugando=true;
			app.fab.close('.E');
			$$('.textoEnvido').html('');
			datos.codigo=60;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		return;
	}
	if(datos.nivelEnvido==2){
		if(datos.qe==1){
			$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Envido!!');
			$$('#liRE').html('<li><a class="list-button item-link quieroDoble popover-close">Quiero</a></li>'
				+'<li><a class="list-button item-link realEnvido popover-close">Real Envido</a></li>'
				+'<li><a class="list-button item-link faltaEnvido popover-close">Falta Envido</a></li>'
				+'<li><a class="list-button item-link noQuieroDoble popover-close">No Quiero</a></li>');
			abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
			$$('.quieroDoble').on('click',function(){
				datos.jugando=false;
				datos.nivelEnvido=4;
				anotarEnvido();
			});
			$$('.realEnvido').on('click',function(){
				datos.jugando=true;
				datos.nivelEnvido=4;
				datos.codigo=50;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
			$$('.noQuieroDoble').on('click',function(){
				datos.jugando=false;
				datos.total[(NJ+1)%2]+=datos.nivelEnvido;
				datos.pregunta=(NJ+1)%2;
				datos.codigo=301;
				partida.set(datos);
			});
			$$('.faltaEnvido').on('click',function(){
				datos.jugando=true;
				datos.nivelEnvido=4;
				datos.codigo=60;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
		}
		if(datos.qe==2){
			$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Real Envido!');
			$$('#liRE').html('<li><a class="list-button item-link quieroReal popover-close">Quiero</a></li>'
				+'<li><a class="list-button item-link faltaEnvido popover-close">Falta Envido</a></li>'
				+'<li><a class="list-button item-link noQuieroReal popover-close">No Quiero</a></li>');
			abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
			$$('.quieroReal').on('click',function(){
				datos.jugando=false;
				datos.nivelEnvido=5;
				anotarEnvido();
			});
			$$('.noQuieroReal').on('click',function(){
				datos.jugando=false;
				datos.total[(NJ+1)%2]+=datos.nivelEnvido;
				datos.pregunta=(NJ+1)%2;
				datos.codigo=301;
				partida.set(datos);
			});
			$$('.faltaEnvido').on('click',function(){
				datos.jugando=true;
				datos.nivelEnvido=5;
				datos.codigo=60;
				datos.pregunta=(NJ+1)%2;
				partida.set(datos);
			});
		}
		return;
	}
	if(datos.nivelEnvido==4){
		$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Real Envido!');
		$$('#liRE').html('<li><a class="list-button item-link quieroDR popover-close">Quiero</a></li>'
			+'<li><a class="list-button item-link faltaEnvido popover-close">Falta Envido</a></li>'
			+'<li><a class="list-button item-link noQuieroDR popover-close">No Quiero</a></li>');
		abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
		$$('.quieroDR').on('click',function(){
			datos.jugando=false;
			datos.nivelEnvido=7;
			anotarEnvido();
		});
		$$('.noQuieroDR').on('click',function(){
			datos.jugando=false;
			datos.total[(NJ+1)%2]+=datos.nivelEnvido;
			datos.pregunta=(NJ+1)%2;
			datos.codigo=301;
			partida.set(datos);
		});
		$$('.faltaEnvido').on('click',function(){
			datos.nivelEnvido=7;
			datos.codigo=60;
			datos.pregunta=(NJ+1)%2;
			partida.set(datos);
		});
		return;
	}
}

function faltaEnvido(){
	/* en las malas se gana el partido */
	if(datos.total[0]<15 && datos.total[1]<15){
		datos.nivelEnvido=30;
	}else{
		/* en las buenas se ganan lo que le falta al que va ganando */
		if(datos.total[0]>datos.total[1]){
			datos.nivelEnvido=30-datos.total[0];
		}else{
			datos.nivelEnvido=30-datos.total[1];
		}
	}
	anotarEnvido();
}

function hayGanador(){
	if(datos.turno==NJ && datos.esTruco==1 && datos.meVoy==0){
		mostrarUnaCarta(datos.carta,'o',(NJ+1)%2,vuelta);
	}
	ganador=-1;
	if(datos.total[1]>=30){
		datos.total[1]=30;
		ganador=1;
	}
	if(datos.total[0]>=30){
		datos.total[0]=30;
		ganador=0;
	}
	if(ganador!=-1){
		actualizarAnotador();
		nombre2=datos.jugador[(NJ+1)%2].nombre;
		$$('#total0').html(datos.jugador[0].nombre);
		$$('#total1').html(datos.jugador[1].nombre);
		if(ganador==NJ){
			datos.total=[0,0];
			app.dialog.alert('¡Ganaste el partido!', 'TrucOn',function(){
				app.dialog.confirm('¿Querés Jugar la Revancha?', 'TrucOn', function(){
					app.dialog.preloader('Esperando oponente');
					setTimeout(function(){
	                    datos.revancha[NJ]=1;
						datos.codigo=999;
						if(salir==true){
							app.dialog.close();
							return;
						}else{
							partida.set(datos);
						}
	                },12000);
				}, function(){
					app.dialog.close();
					datos.revancha=[0,0];
					datos.salir=true;
					datos.codigo=999;
					partida.set(datos);
				});
			});
		}else{
			datos.total=[0,0];
			app.dialog.alert('Perdiste el partido', 'TrucOn',function(){
				app.dialog.confirm('¿Querés Jugar la Revancha?', 'TrucOn', function(){
					app.dialog.preloader('Esperando oponente');
					setTimeout(function(){
	                    datos.revancha[NJ]=1;
						datos.codigo=999;
						if(partida=='cerrada'){
							app.dialog.close();
							return;
						}else{
							partida.set(datos);
						}
	                },12000);
				}, function(){
					app.dialog.close();
					datos.revancha=[0,0];
					datos.salir=true;
					datos.codigo=999;
					partida.set(datos);
				});
			});
		}
	}else{
		actualizarAnotador();
		$$('#total0').html(datos.jugador[0].nombre);
		$$('#total1').html(datos.jugador[1].nombre);
		if(NJ!=datos.mano%2 && datos.esTruco==1){
			setTimeout(function(){
		            app.dialog.alert('Repartir', 'TrucOn',function(){repartirCartas();});
		        },1500);
		}
	}
}

function mostrarGanadorEnvido(){
	datos.jugando=false;
	actualizarAnotador();
	$$('#total0').html(datos.jugador[0].nombre);
	$$('#total1').html(datos.jugador[1].nombre);
	if(datos.ganadorEnvido==NJ){
		app.dialog.alert('Vos '+datos.jugador[NJ].envido+' ... '+datos.jugador[(NJ+1)%2].nombre+' '+datos.jugador[(NJ+1)%2].envido, 'Ganaste');
	}else{
		app.dialog.alert('Vos '+datos.jugador[NJ].envido+' ... '+datos.jugador[(NJ+1)%2].nombre+' '+datos.jugador[(NJ+1)%2].envido, 'Perdiste');
	}
	setTimeout(function(){
        datos.codigo=2;
		partida.set(datos);
    },700);
}

function analizarPartida(){
	switch(datos.codigo){
		/* casos comunes para ambos jugadores */
		case 1:	MN=modeloNaipes;
				vuelta=0;
				datos.jugando=false;
				app.dialog.close();
				actualizarAnotador();
				for(j=0; j<3; j++){
					$$('#y'+j).attr('src','img/naipes0/vacio.png');
					$$('#o'+j).attr('src','img/naipes'+MN+'/00.png');
				}
				mostrarCartas(); hayFlor(); break;
		case 2: EEP=false; hayGanador(); break;
		case 3: mostrarGanadorEnvido(); break;
		/* casos individuales de la Flor */
		case 30: if(NJ==datos.pregunta){
					abrirRespFlor=app.popover.open(".popover-respuesta-envido");
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  FLOR');
				}; break;
		case 31: if(NJ==datos.pregunta){
					abrirRespFlor=app.popover.open(".popover-respuesta-envido");
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  FLOR');
					$$('#liRE').html('<li><a class="list-button item-link quieroFlor popover-close">Con Flor Quiero</a></li>'
						+'<li><a class="list-button item-link noQuieroFlor popover-close">Con Flor Me Achico</a></li>'
						+'<li><a class="list-button item-link contraFlor popover-close">Contra Flor</a></li>'
						+'<li><a class="list-button item-link contraFlorResto popover-close">Contra FLor al Resto</a></li>');		
					$$('.quieroFlor').on('click',function(){
						datos.jugando=false;
						$$('.textoEnvido').html('');
						datos.nivelEnvido=4;
						anotarEnvido();
					});
					$$('.noQuieroFlor').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						$$('.textoEnvido').html('');
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
					$$('.contraFlor').on('click',function(){
						$$('.textoEnvido').html('');
						datos.nivelEnvido=4;
						datos.codigo=32;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
					});
					$$('.contraFlorResto').on('click',function(){
						$$('.textoEnvido').html('');
						datos.nivelEnvido=4;
						datos.codigo=33;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
					});
				}; break;
		case 32: if(NJ==datos.pregunta){
					abrirRespFlor=app.popover.open(".popover-respuesta-envido");
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Contra FLOR');
					$$('#liRE').html('<li><a class="list-button item-link quieroContra popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link noQuieroContra popover-close">No Quiero</a></li>');
					$$('.quieroContra').on('click',function(){
						datos.jugando=false;
						datos.nivelEnvido=6;
						anotarEnvido();
					});
					$$('.noQuieroContra').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
				}; break;
		case 33: if(NJ==datos.pregunta){
					abrirRespFlor=app.popover.open(".popover-respuesta-envido");
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Contra FLOR al Resto');
					$$('#liRE').html('<li><a class="list-button item-link quieroResto popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link noQuieroResto popover-close">No Quiero</a></li>');
					$$('.quieroResto').on('click',function(){
						datos.jugando=false;
						if(datos.total[0]>datos.total[1]){
								datos.nivelEnvido=30-datos.total[0];
							}else{
								datos.nivelEnvido=30-datos.total[1];
							}
							anotarEnvido();
					});
					$$('.noQuieroResto').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
				}; break;
		/* casos inidividuales del Envido */
		case 40: if(NJ==datos.pregunta){
					if(datos.nivelEnvido==3){
						$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+': Envido!');
						$$('#liRE').html('<li><a class="list-button item-link Flor popover-close">Flor</a></li>');
						abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
						$$('.Flor').on('click',function(){
							datos.jugando=true;
							$$('.textoEnvido').html('');
							datos.codigo=30;
							datos.pregunta=(NJ+1)%2;
							partida.set(datos);
						});	
						return;
					}
					$$('.textoEnvido').html('');
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+': Envido!');
					$$('#liRE').html('<li><a class="list-button item-link quieroEnvido popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link dobleEnvido popover-close">Envido</a></li>'
						+'<li><a class="list-button item-link realEnvido popover-close">Real Envido</a></li>'
						+'<li><a class="list-button item-link faltaEnvido popover-close">Falta Envido</a></li>'
						+'<li><a class="list-button item-link noQuieroEnvido popover-close">No Quiero</a></li>');
					abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
					$$('.quieroEnvido').on('click',function(){
						datos.jugando=false;datos.qe=0;
						datos.nivelEnvido=2;
						anotarEnvido();
					});
					$$('.dobleEnvido').on('click',function(){
						datos.qe=1;
						datos.nivelEnvido=2;
						datos.codigo=50;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.realEnvido').on('click',function(){
						datos.qe=2;
						datos.nivelEnvido=2;
						datos.codigo=50;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.noQuieroEnvido').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
					$$('.faltaEnvido').on('click',function(){
						nivelEnvido=2;
						datos.codigo=60;datos.qe=0;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
				}; break;
		case 41: if(NJ==datos.pregunta){
					if(datos.nivelEnvido==3){
						$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+': Real Envido!');
						$$('#liRE').html('<li><a class="list-button item-link Flor popover-close">Flor</a></li>');
						abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
						$$('.Flor').on('click',function(){
							$$('.textoEnvido').html('');
							datos.codigo=30;
							datos.pregunta=(ii+1)%2;
							partida.set(datos);
						});	
						return;
					}
					$$('.textoEnvido').html('');
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Real Envido!');
					$$('#liRE').html('<li><a class="list-button item-link quieroReal popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link faltaEnvido popover-close">Falta Envido</a></li>'
						+'<li><a class="list-button item-link noQuieroReal popover-close">No Quiero</a></li>');
					abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
					$$('.quieroReal').on('click',function(){
						datos.jugando=false;
						datos.nivelEnvido=3;
						anotarEnvido();
					});
					$$('.faltaEnvido').on('click',function(){
						datos.nivelEnvido=3;
						datos.codigo=60;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.noQuieroReal').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
				}; break;
		case 50: if(NJ==datos.pregunta){
					cantarEnvido();
				};break;
		case 60: if(NJ==datos.pregunta){
					if(datos.nivelEnvido==3 && datos.jugador[NJ].flor==1){
						$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+': Falta Envido!');
						$$('#liRE').html('<li><a class="list-button item-link Flor popover-close">Flor</a></li>');
						abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
						$$('.Flor').on('click',function(){
							$$('.textoEnvido').html('');
							datos.codigo=30;
							datos.pregunta=(ii+1)%2;
							partida.set(datos);
						});	
						return;
					}
					$$('.textoEnvido').html('');
					$$('.mensajeRE').html(datos.jugador[(NJ+1)%2].nombre+':  Falta Envido!');
					$$('#liRE').html('<li><a class="list-button item-link quieroFalta popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link noQuieroFalta popover-close">No Quiero</a></li>');
					abrirRespEnvido=app.popover.open(".popover-respuesta-envido");
					$$('.quieroFalta').on('click',function(){
						datos.jugando=false;
						datos.qe=0;
						faltaEnvido();
					});
					$$('.noQuieroFalta').on('click',function(){
						datos.jugando=false;
						datos.total[(NJ+1)%2]+=datos.nivelEnvido;
						datos.pregunta=(NJ+1)%2;
						datos.codigo=301;
						partida.set(datos);
						return;
					});
				}; break;
		/* casos inidividuales del Truco */
		case 70: if(NJ==datos.pregunta){
					$$('.mensajeRT').html(datos.jugador[(NJ+1)%2].nombre+': Truco!');
					$$('#liRT').html('<li><a class="list-button item-link quiero popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link quieroRe popover-close">Quiero Re Truco!</a></li>'
						+'<li><a class="list-button item-link noQuiero popover-close">No Quiero</a></li>');
					/* Chequear si no se a cantado envido para darle la oportunidad al contrario de hacerlo */
					if($$('.textoEnvido').html() && datos.contCartas==0){
						$$('#liRT').append('<li><a class="list-button item-link envidoPrimero popover-close">El Envido está Primero</a></li>');
					}
					abrirRespTruco=app.popover.open(".popover-respuesta-truco");
					$$('.envidoPrimero').on('click',function(){
						datos.jugando=false;
						datos.qe=1;
						EEP=true;
						setTimeout( function() { cantarEnvido();app.fab.open('.E'); }, 500  );
					});
					$$('.quiero').on('click',function(){
						datos.jugando=false;
						datos.nivelTruco=2;
						datos.q=-1;
						datos.ultimo=(NJ+1)%2;
						$$('.textoEnvido').html('');
						datos.codigo=402;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.quieroRe').on('click',function(){
						datos.nivelTruco=2;
						datos.q=1;
						datos.ultimo=NJ;
						datos.codigo=80;
						datos.pregunta=(NJ+1)%2;
						$$('.textoEnvido').html('');
						partida.set(datos);
						return;
					});
					$$('.noQuiero').on('click',function(){
						datos.jugando=false;
						datos.codigo=401;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
				}; break;
		case 71: if(NJ==datos.pregunta){
					$$('.mensajeRT').html(datos.jugador[(NJ+1)%2].nombre+': Re Truco!');
					$$('#liRT').html('<li><a class="list-button item-link quiero popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link quieroVale4 popover-close">Quiero Vale 4!</a></li>'
						+'<li><a class="list-button item-link noQuiero popover-close">No Quiero</a></li>');
					abrirRespTruco=app.popover.open(".popover-respuesta-truco");
					$$('.quiero').on('click',function(){
						datos.jugando=false;
						datos.nivelTruco=3;
						datos.q=-1;
						datos.ultimo=(NJ+1)%2;
						datos.codigo=402;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.quieroVale4').on('click',function(){
						datos.nivelTruco=3; datos.q=1;
						datos.ultimo=NJ;
						datos.codigo=80;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.noQuiero').on('click',function(){
						datos.jugando=false;
						datos.codigo=401;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
				}; break;
		case 72: if(NJ==datos.pregunta){
					$$('.mensajeRT').html(datos.jugador[(NJ+1)%2].nombre+': Quiero Vale 4');
					$$('#liRT').html('<li><a class="list-button item-link quiero popover-close">Quiero</a></li>'
						+'<li><a class="list-button item-link noQuiero popover-close">No Quiero</a></li>');
					abrirRespTruco=app.popover.open(".popover-respuesta-truco");
					$$('.quiero').on('click',function(){
						datos.jugando=false;
						datos.nivelTruco=4; datos.q=0;
						datos.codigo=402;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
					$$('.noQuiero').on('click',function(){
						datos.jugando=false;
						datos.codigo=401;
						datos.pregunta=(NJ+1)%2;
						partida.set(datos);
						return;
					});
				}; break;
		case 80: if(NJ==datos.pregunta){
					cantarTruco();
				}; break;
		case 90: if(NJ==datos.pregunta){
					mostrarUnaCarta(datos.carta,'o',(NJ+1)%2,vuelta);
					vuelta++;
					datos.jugando=false;
					datos.codigo=0;
					datos.pregunta=-1;
					partida.set(datos);
					return;
				}; break;
		case 300: if(NJ==datos.pregunta){
					app.dialog.alert('Anotate 3 nomás...',datos.jugador[(NJ+1)%2].nombre+' dice:' );
					datos.codigo=2;
					datos.qe=0;
					partida.set(datos);
					return;
				}; break;
		case 301: if(NJ==datos.pregunta){
					app.dialog.alert('No quiero.',datos.jugador[(NJ+1)%2].nombre+' dice:' );
					datos.codigo=2;
					datos.qe=0;
					partida.set(datos);
					return;
				}; break;
		case 400: if(NJ==datos.pregunta){
					app.dialog.alert('Me voy al mazo...',datos.jugador[(NJ+1)%2].nombre+' dice:' );
					anotarTruco(NJ);
				}; break;
		case 401: if(NJ==datos.pregunta){
					app.dialog.alert('No quiero.',datos.jugador[(NJ+1)%2].nombre+' dice:' );
					anotarTruco(NJ);
				}; break;
		case 402: if(NJ==datos.pregunta){
					app.dialog.alert('¡Quiero!',datos.jugador[(NJ+1)%2].nombre+' dice:' );
				}; break;
		case 999: if(datos.salir==true){
					getSalir();break;
				}
				app.dialog.close();
				if(datos.revancha[0]==1 && datos.revancha[1]==1){
					repartirCartas();
					datos.revancha=[0,0];
				}; break;
		default: break;
	}
	datos.codigo=0;
	datos.pregunta=-1;
}

function getSalir(){
    partida.get().then(function(doc) {
        if (doc.exists) {
            partida.delete().then(function() {
            	app.dialog.alert('Finalizó la Partida','TrucOn',function(){
                	app.views.main.router.navigate('/index/');
                });
                salir=true;
	        }).catch(function(error) {
	            console.log(error);
	        });
            return 0;
        } else {
            app.dialog.alert('Finalizó la Partida','TrucOn',function(){
            	app.views.main.router.navigate('/index/');
            });
            salir=true;
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function actualizarAnotador(){
	for(p=0; p<6; p++){
        $$('.f0'+p).attr('src','img/trazos/00.png');
        $$('.f1'+p).attr('src','img/trazos/00.png');
    }
	div0=parseInt(datos.total[0]/5);
	res0=datos.total[0]%5;
	div1=parseInt(datos.total[1]/5);
	res1=datos.total[1]%5;
	for(p=0; p<div0; p++){
		$$('.f0'+p).attr('src','img/trazos/'+palitos+'5.png');
	}
	$$('.f0'+div0).attr('src','img/trazos/'+palitos+res0+'.png');
	for(p=0; p<div1; p++){
		$$('.f1'+p).attr('src','img/trazos/'+palitos+'5.png');
	}
	$$('.f1'+div1).attr('src','img/trazos/'+palitos+res1+'.png');
}
