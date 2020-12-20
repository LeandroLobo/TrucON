  
// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var app = new Framework7({
    // App root element
    root: '#app',
    // App Name
    name: 'TrucOn',
    // App id
    id: 'com.TrucOn.test',
    // Enable swipe panel
    panel: {
      swipe: 'left',
    },
    // Add default routes
    routes: [
      {
        path: '/index/',
        url: 'index.html',
      },
      {
        path: '/mesa/',
        url: 'mesa.html',
      },
    ],
    // ... other parameters
    popup: {
        closeByBackdropClick: false,
    },
    popover: {
        closeByBackdropClick: false,
        closeByOutsideClick: false,
    },
    dialog: {
        buttonCancel: 'Cancelar',
        title: 'TrucOn',
      },
  });

var mainView = app.views.create('.view-main');
var email='', email2='', password, partida, user, NJ, nombre, nombre2, errorLogin=0, modeloNaipes=0, palitos=0, MN=0;

/************ DEVICE READY *************/
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    var abrirPopupInicio=app.popup.open(".popup-inicio");
});


$$(document).on('page:init', function (e) {
    console.log(e);
});

/**************** INDEX **************/
$$(document).on('page:init', '.page[data-name="index"]', function (e) {
    console.log('index');
    $$('#email-registro').val(email);
    //cerrar popovers y alerts
    cerrarTruco=app.popover.close(".popover-respuesta-truco");
    cerrarEnvido=app.popover.close(".popover-respuesta-envido");
    app.dialog.close();
    $$('.jugar-truco').on('click',function(){
        NJ=0;datos.salir=false;salir=false;
        datos.jugador[NJ].nombre=nombre;
        partida=db.collection("partida").doc(email);
        partida.set(datos).then(function(){
            app.views.main.router.navigate('/mesa/');
            app.dialog.preloader('Esperando oponente');
            setTimeout(function () {
                app.dialog.close();
            }, 20000);
        })
        .catch(function(error){
            console.log(error);
            app.dialog.alert('Error de conexión. Volvé a intentar.');
        });
    });

    $$('#unirse').on('click',function(){
        NJ=1;datos.salir=false;salir=false;
        email2=$$('.email-partida').val();
        partida=db.collection("partida").doc(email2);
        getDatosUnirse();
    });

    $$('.abrir-login').on('click', function(){
        var abrirPopupLogin=app.popup.open(".popup-login");
    });
    $$('.login').on('click',login);

    $$('.abrir-registro').on('click', function(){
        var abrirPopupRegistro=app.popup.open(".popup-registro");
    });
    $$('.registrar').on('click',crearUsuario);

    $$('.logout').on('click', function(){
        firebase.auth().signOut()
        .then(function(){
            abrirPopupInicio=app.popup.open(".popup-inicio");
        });
    });
})

/************** MESA *************/
$$(document).on('page:init', '.page[data-name="mesa"]', function (e) {
    partida.onSnapshot(function(){
        getDatos();
    });

    $$('.terminar-partida').on('click',function(){
        app.dialog.confirm('¿Seguro que querés abandonar la partida?',function(){
            datos.total=[0,0];
            datos.salir=true;
            datos.codigo=999;
            nombre2=datos.jugador[(NJ+1)%2].nombre;
            partida.set(datos);
        },function(){
            app.dialog.close();
        });        
    });

    $$('.en-mano').on('click', function(){
        if(datos.jugando==false){
            jugarCarta(parseInt(this.id[1]));
        }
    });
    $$('.T').on('click', function(){
        if(datos.jugando==false){
            cantarTruco();
        }else{
            app.fab.close('.T');
        }
        if(EEP==true){
            app.fab.open('.E');
        }
    });
    $$('.E').on('click', function(){
        if(datos.jugando==false){
            cantarEnvido();
        }else{
            app.fab.close('.E');
        }
        if(EEP==true){
            app.fab.open('.E');
        }
    });
    $$('.M').on('click', function(){
        if(EEP==true){
            app.fab.close('.M');
            app.fab.open('.E');
        }
    });
    $$('#n0').on('click', function(){
        if(modeloNaipes==0){
            app.fab.close('.M');
        }else{
            modeloNaipes=0;
            app.dialog.alert('Esperá que se repartan las cartas de nuevo para usar el nuevo mazo.');
            app.fab.close('.M');
        }
        
    });
    $$('#n1').on('click', function(){
        if(modeloNaipes==1){
            app.fab.close('.M');
        }else{
            modeloNaipes=1;
            app.dialog.alert('Esperá que se repartan las cartas de nuevo para usar el nuevo mazo.');
            app.fab.close('.M');
        }
    });
    $$('#cambiar-anotador').on('click', function(){
        palitos=(palitos+1)%2;
        actualizarAnotador();
    });
})

/********** FUNCIONES *************/
function crearUsuario(){
    email=$$('#email-registro').val();
    password=$$('#password-registro').val();
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(){
        var cerrarPopupRegistro = app.popup.close(".popup-registro");
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(){
            user = firebase.auth().currentUser;
            user.updateProfile({
                displayName: $$('#nickName').val(),
            })
            nombre = $$('#nickName').val();
        });
    })
    .catch(function(error){
        if(error.code=="auth/email-already-in-use"){
            app.dialog.alert('Ya hay un usuario registrado con este Email.');
        }
        else if(error.code=="auth/invalid-email"){
            app.dialog.alert('El formato de Email no es válido.');
        }
        else if(error.code=='auth/weak-password') {
            app.dialog.alert('La contraseña es demasiado débil.');
        }
        else{
            app.dialog.alert(error.message);
        }
    });
}

function login(){
    email=$$('#email-login').val();
    password=$$('#password-login').val();
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(){
        var cerrarPopupLogin=app.popup.close(".popup-login");
        user = firebase.auth().currentUser;
        nombre = user.displayName;
        errorLogin=0;
    })
    .catch(function(error) {
        alert(error.message);
        if(errorLogin==0){
            errorLogin++;
            $$('#ul-login').append('<li class="row display-flex justify-content-center">'
            +'<p class="col text-align-center">¿No tenes una cuenta?</p></li>'
            +'<li class="row display-flex justify-content-center">'
            +'<input type="button" value="Registrate" class="margin popup-close loginToRegistro"></li>');
        }
        $$('.loginToRegistro').on('click',function(){
            abrirPopupRegistro=app.popup.open(".popup-registro");
        });
    });
}

function getDatos(){
    partida.get().then(function(doc) {
            if (doc.exists) {
                datos=doc.data();
                console.log("datos:", datos);
                setTimeout(function(){
                    analizarPartida();
                },300);
                return 0;
            } else {
                // partida='';
                // app.dialog.alert('Finalizó la Partida','TrucOn',function(){
                //     app.views.main.router.navigate('/index/');
                // });
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
}

function getDatosUnirse(){
    $$('.email-partida').val('');
    partida.get().then(function(doc) {
            if (doc.exists) {
                datos=doc.data();
                console.log("datos:", datos);
                setTimeout(function(){
                    datos.jugador[NJ].nombre=nombre;
                    repartirCartas();
                    $$('#total0').html(datos.jugador[0].nombre);
                    $$('#total1').html(datos.jugador[1].nombre);
                },1500);
                app.views.main.router.navigate('/mesa/');
                return 0;
            } else {
                app.dialog.alert('La partida solicitada no está creada.'
                    +' Podés intentar otra vez, verificá que el mail de tu oponente este escrito de forma correcta',
                    email2+' no está conectado');
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
}
