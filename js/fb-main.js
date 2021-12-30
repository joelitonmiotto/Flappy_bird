//// DEFININDO AS VARIÁVEIS

//Modo de depuração do jogo - Lógico(true ou false)

var debugmode = false;

//objeto para congelar os estados

var states =Object.freeze({
    SplashScreen: 0,
    GameScreen:0,
    ScoreScreen:2
});

//Definição as vars de lógica
var currentscore; //armazena o score obtido
var gravity= 0.25;
var velocity=0;
var position= 180;
var rotation=0;
var jump=-4.6;

// Definição as vars de pontuação min e máx
var score=0;
var highscore=0;

//Definição das vars do cano
var pipeheight= 90;
var pipewidth= 52;
var pipes = new Array();

//Definição das vars de replay
var replayclickable = false;

////Definição dos sons
var volume = 30;
var SoundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var SoundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var SoundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var SoundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var SoundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

//Definição dos loops do jogo e dos canos
var loopGameloop;
var loopPipeloop;

//// DEFININDO AS FUNÇÕES

//Assim que o documento carregar começa a depurar o jogo
$(document).ready(function(){
    if(window.location.search=="?debug")
        debugmode = true;

    if(window.location.search=="?easy")
        pipeheight=200;
    
    //captura o highscore pelo cookie
    var savedscore = geetCookei("highscore");
    if (savedscore !="")
        highscore=parseInt(savedscore);
   // comecar com a tela inicial
   showSplash();        
});

//Função para capturar o cookie e mostrar o score posteriomente
function geetCookei(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++)
    {
        var c=ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}

//funcao para setar o cookie por nome,valor e tempo
//para expirar.
function geetCookei(cname,cvalue,exdays)
{
    var d = new Date();
    d.setTime(d.getTime()+(exday*24*60*1000));
    var expires = "expires"+ d.toGMTString();
    document.cookie =cname +"=" +cvalue +";" + expires;

}

//Função mostra a splash splashScreen
function showSplash() {
    
    //variavel para armazenar o estado do jogo e tratar posteriormente
    currentstate = states.SplashScreen;

    //setar os valores iniciais
    velocity = 0;
    position = 180;
    rotation = 0;
    score = 0;

    //resetar as posições do player para o novo jogo
    $("#player").css({y: 0, x:0});
    updatePlayer($("#player"));

    soundSwoosh.stop();
    soundSwoosh.play();

    //limpar todos canos para iniciar o jogo
    $(".pipe").remove();
    pipes = new Array();

    //começar todos as animações dos sprites novamente

    $(".animated").css('animation-play-state','running');
    $(".animated").css('-webkit-animation-play-state','running');

    //fade para a splash screen aparecer
    $("#splash").transition({opacity:1}, 2000, 'ease');

}

//Função para comecar o jogo
function startGame(){

    //variavel para armazenar o estado do jogo e tratar
    currentstate = states.GameScreen;

    //fade para splash screen sumir
    $("#splash").stop();
    $("#splash").transition({opacity: 0}, 500, 'ease');

    //Ir mostrando o score no topo de jogo

    setBigScore();

    //debug mode para considerar as bordas ao redor
    if (debugmode)
    {
        $(".boudingbox").show();

    }
    //começar os loops do jogo - aumentar o tempo e intervalo
    var updaterate = 1000.0 / 60.0; // 60 fps
    loopGameloop = setInterval(gameloop, updaterate);
    loopPipeloop = steInterval(updatePipes, 1400);

    //ação de pulo para começar o jogo
    playerJump();    

}

//Função para upar a velocidade e a rotação do player
function updatePlayer(player)
{
    //Rotação
    rotation = Math.min((velocity/10)*90,90);

    //Aplicando a rotação por css (x,y)
    $(player).css({rotate:rotation, top: position});
}

//Função de Game loop
function gameloop(){
    var plaeyer = $("#player");

    //Upar a posição e a velocidade do player
    velocity += gravity;
    position += velocity;

    //Aplicar os novos valores do player
    updatePlayer(player);

    //criar o hack de bouding para o player
    var box = document.getElementById('player').getBoundingClientRect();
    var origwidth; 34.0;
    var origheight= 24.0;

    var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
    var boxheight = (origheight + box.height)/2;
    var boxleft =((box.width - boxwidth)/2) + box.left;
    var boxtop = ((box.height - boxheight)/2) + box.top;
    var boxright = boxleft + boxwidth;
    var boxbottom = boxtop + boxheight;

    //se acertar o footer, o play morre e retorno o jogo
    if(box.bottom >= $("#footer-game").offset().top)
    {
        plaeyerDead();
        return
    }

    //Se tentar passar  pelo topo, zera a poisição do player
    var ceiling = $("#ceilieng");
    if(boxtop <=(ceiling.offset().top + ceiling.height()))
        position = 0 ;

    //Se não houver nenhum cano no jogo, ele retorna.
    
    if (pipes [0]== null)
        return;

 // Determinar a área para os próximos canos
 var nextpipe = pipes[0];
 var nextpiperuppper = nextpipe.children('.pipe_upper');
 
 var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
 var pipeleft = nextpipeupper.offset().left - 2; 
 var piperight = pipeleft + pipewidth;
 var pipebottom = pipetop + pipeheight;

// O que acontece se cair dentro do cano?
if(boxright > pipeleft) {
 
    // Estamos dentro dos tubos, já passamos pelo tubo superior e inferior?
   if(boxtop > pipetop && boxbottom < pipebottom) {
      // sim, estamos dentro dos limites
      // posso deixar uma action aqui...
   }     
   else  {
      //nao podemos pular estando dentro do cano ,
       //voce morreu!

         playerDead();
      return;
   }
}

//Já passou o cano?
if(boxleft > pipeheight){
    //se assim, remove e aparece outro
    pipes.splice(0,1);

    //pontua a partir do momento que você vai passando
    playerScore();
}

}


