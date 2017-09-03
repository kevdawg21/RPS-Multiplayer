  var config = {
    apiKey: "AIzaSyBnFN7Eu-jAYa1EhqkBn74dmLPxouB1pAU",
    authDomain: "rps-multi-17dc2.firebaseapp.com",
    databaseURL: "https://rps-multi-17dc2.firebaseio.com",
    projectId: "rps-multi-17dc2",
    storageBucket: "rps-multi-17dc2.appspot.com",
    messagingSenderId: "877543347718"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  var data = database.ref('data');
  var turn = data.child('turn');
  var playerFB = data.child('players');
  var play1 = playerFB.child('1');
  var play2 = playerFB.child('2');
  var p1Seated;
  var p2Seated;
  var name;
  var opted = false;
  var rpsMaster = {
    userId: "",
    name: "",
    pick: "",
    wins: 0,
    losses: 0,
    name2: "",
    pick2: "",
    wins2: 0,
    losses2: 0,
    turn: 0,
  };

  $('#submit-btn').on('click', function(){
    name = $('#name').val();
    seatPlayer(name);
    $('#name').hide();
    $('#submit-btn').hide();
  });

  data.onDisconnect().update({turn: 0});
  data.child('chat').onDisconnect().set({});
  data.on('value', function(snapshot){
    p1Seated = snapshot.child('players').child('1').exists();
    p2Seated = snapshot.child('players').child('2').exists();
  });

data.child('gameOn').on('value', function(snapshot){
    if(snapshot.val() == true){
      gamePlay();
    } else{
      console.log("peanut")
    }
  });

  turn.on('value', function(snapshot){
    if(snapshot.val() == 1){
      rpsMaster.turn = 1;
      player1Opt();
    } else if (snapshot.val() == 2){
      rpsMaster.turn = 2;
      player2Opt();
    } else if(snapshot.val() == 3){
      rpsMaster.turn = 3;
      resolveGame();
    } else if(snapshot.val() == 0){
      rpsMaster.turn = 0;
    }
  });

  function seatPlayer(){
    if(!p1Seated){
      rpsMaster.userId = 1;
      rpsMaster.name = name;
      play1.set({
        name: name,
        pick: '',
        wins: 0,
        losses: 0,
      });
      $('#signin').text('Hello ' + name + '. You are player 1.');
      $('#chat-window').append('<p class="text-center">You can chat with your opponent here when they join the game.</p>');
      $("#player1").text(name);
      $("#rock1").text("Rock");
      $("#paper1").text("Paper");
      $("#scissors1").text("Scissors");
      $("#wins1").text('Wins: ' + rpsMaster.wins);
      $("#losses1").text('Losses: ' + rpsMaster.losses);
      playerFB.once("value", function(snapshot) {
          if (p2Seated) {
            data.update({turn: 1});
            data.update({gameOn: true});
          }
      });
      play1.onDisconnect().remove();
    } else if (p1Seated && !p2Seated){
        rpsMaster.userId = 2;
        rpsMaster.name2 = name;
        play2.set({
          name: name,
          pick2: '',
          wins: 0,
          losses: 0,
      });
      play1.once('value', function(snapshot){
        rpsMaster.name = snapshot.val().name;
        rpsMaster.wins = snapshot.val().wins;
        rpsMaster.losses = snapshot.val().losses;
        $('#signin').text('Hello ' + name + '. You are player 2.');
        $('#instructions').text("Waiting for Player 1 to choose an option");
        $('#chat-window').append('<p class="text-center">You are playing against ' + rpsMaster.name + '. You can chat here.</p>');
        $("#player2").text(name);
        $("#rock2").text("Rock");
        $("#paper2").text("Paper");
        $("#scissors2").text("Scissors");
        $("#wins2").text('Wins: ' + rpsMaster.wins2);
        $("#losses2").text('Losses: ' + rpsMaster.losses2);
        $("#player1").text(rpsMaster.name);
        $("#wins1").text('Wins: ' + rpsMaster.wins);
        $("#losses1").text('Losses: ' + rpsMaster.losses);
      });
      data.update({turn: 1});
      data.update({gameOn: true})
      play2.onDisconnect().remove();
    } 
  }

    function gamePlay(){
      if(rpsMaster.userId == '1'){
        play2.once("value", function(snapshot) {
          rpsMaster.name2 = snapshot.val().name;
          rpsMaster.wins2 = snapshot.val().wins;
          rpsMaster.losses2 = snapshot.val().losses;
          $("#player2").text(rpsMaster.name2);
          $('#instructions').text('It is your turn. Choose rock, paper, or scissors by clicking an option in your player console.');
          $('#chat-window').empty();
          $('#chat-window').append('<p class="text-center">You are playing against ' + rpsMaster.name2 + '. You can chat here.</p>');
          $("#wins2").text('Wins: ' + snapshot.val().wins);
          $("#losses2").text('Losses: ' + snapshot.val().losses);
      });
      data.update({gameOn: false});
    }
  }

  function player1Opt(){
    if(rpsMaster.userId == '1' && rpsMaster.turn == 1){
      $("#instructions").text('It is your turn. Choose rock, paper, or scissors by clicking an option in your player console.');
      $('.opt').on('click', function(){
          rpsMaster.pick = $(this).data('opt');
          play1.update({pick: rpsMaster.pick});
          data.update({turn: 2});
          $('#instructions').text('You chose ' + rpsMaster.pick + '. Waiting for player 2 to make their choice.');})
    } 
  }

  function player2Opt(){
      if(rpsMaster.userId == '2' && rpsMaster.turn == 2){
          console.log("u2" + rpsMaster.turn);
          $('#instructions').text("Player 1 has selected. It is your turn to select one of Rock, Paper or Scissors.");
          $('.opt').on('click', function(){
            rpsMaster.pick2 = $(this).data('opt');
            play2.update({pick2: rpsMaster.pick2});
            data.update({turn: 3});
          });
      }
  }

  function p1Wins() {
    $("#verdict").html(rpsMaster.name + " WINS!");
    if (rpsMaster.userId == '1') {
      $("#selection2").html(rpsMaster.pick2)
    } else {$("#selection1").html(rpsMaster.pick)}
    rpsMaster.wins++;
    play1.update({
      wins: rpsMaster.wins
    });
    rpsMaster.losses2++;
    play2.update({
      losses: rpsMaster.losses2
    });
    data.update({turn: 1});
  }

  function p2Wins() {
    $("#verdict").html(rpsMaster.name2 + "WINS!");
    rpsMaster.wins2++;
    play2.update({
      wins: rpsMaster.wins2
    });
    rpsMaster.losses++;
    play1.update({
      losses: rpsMaster.losses
    });
    data.update({turn: 1});
  }
  
  function resolveGame(){
    if(rpsMaster.turn == 3 && opted == false){
      opted = true;
     data.update({turn: 0});
      playerFB.once('value', function(snapshot){
        var p1 = snapshot.child('1').val().pick;
        var p2 = snapshot.child('2').val().pick2;
        if (rpsMaster.userId == '1'){$("#selection2").html(p2);}
        else {$("#selection1").html(p1)}
        if (p1 == p2) {
          $('#instructions').text('It\'s a tie!');
        } else if(p1 == 'rock'){
            if(p2 == 'scissors'){
              $('#instructions').text("Get ready for the next round!");
              p1Wins();
          } else{
            $('#instructions').text("Get ready for the next round!");
            p2Wins();
          }
        } else if(p1 == 'paper'){
          if(p2 == 'rock'){
            $('#instructions').text("Get ready for the next round!");
            p1Wins();
          } else{
            $('#instructions').text("Get ready for the next round!");
            p2Wins();
          }
        } else if(p1 == 'scissors'){
          if(p2 == 'paper'){
            $('#instructions').text("Get ready for the next round!");
            p1Wins();
          } else{
            $('#instructions').text("Get ready for the next round!");
            p2Wins();
            }
        }
        $("#wins1").text('Wins: ' + rpsMaster.wins);
        $("#losses1").text('Losses: ' + rpsMaster.losses);
        $("#wins2").text('Wins: ' + rpsMaster.wins2);
        $("#losses2").text('Losses: ' + rpsMaster.losses2);
      });
    }
  setTimeout(reset, 2000);
  }

  function reset(){opted = false;
    rpsMaster.pick = "";
    play1.update({pick: rpsMaster.pick});
    rpsMaster.pick2 = "";
    play2.update({pick2: rpsMaster.pick2});
    $("#verdict").html("");
    if(rpsMaster.userId == '2'){
      $('#instructions').text('Waiting for ' + rpsMaster.name + ' to make a choice.');
      $("#wins1").text('Wins: ' + rpsMaster.wins);
      $("#losses1").text('Losses: ' + rpsMaster.losses);
      $("#wins2").text('Wins: ' + rpsMaster.wins2);
      $("#losses2").text('Losses: ' + rpsMaster.losses2);
      $("#selection1").html("");
    } else {$('#instructions').text('It is your turn. Choose rock, paper, or scissors by clicking an option in your player console.');
      $("#wins1").text('Wins: ' + rpsMaster.wins);
      $("#losses1").text('Losses: ' + rpsMaster.losses);
      $("#wins2").text('Wins: ' + rpsMaster.wins2);
      $("#losses2").text('Losses: ' + rpsMaster.losses2);
      $("#selection2").html("");}

    playerFB.once('value', function(snapshot){
      if(snapshot.numChildren() != 2){
        data.update({turn: 0});
      }
    });
  }

  $('#send-button').on('click', function(){
    var chat = $('#chat').val();
    sendChat(chat);
    $('#chat').val('');
  })

  function sendChat(chat){
    if(p1Seated && p2Seated){
      if(rpsMaster.userId == '1'){
        data.child('chat').push({message: rpsMaster.name + ': ' + chat});
        var log = $('#chat-window');
        log.animate({ scrollTop: log.prop('scrollHeight')}, 1000);
      } else if(rpsMaster.userId == '2'){
        data.child('chat').push({message: rpsMaster.name2 + ': ' + chat});
        var log = $('#chat-window');
        log.animate({ scrollTop: log.prop('scrollHeight')}, 1000);
      }
    } else{
      console.log("peanut2");
    }
  }

  data.child('chat').on("value", function(snapshot) {
    $('#chat-window').empty();
    snapshot.forEach(function(childSnap) {
      if(rpsMaster.userId == '1' || rpsMaster.userId == '2'){
        var p = $('<p>')
        p.text(childSnap.val().message);
        $('#chat-window').append(p);
      }
    });
  });

    data.child('players').on('child_removed', function(){
    data.once('value', function(snapshot){
      if(p1Seated && !p2Seated){
        $('#instructions').text('Oops. It looks like player 2 has left the game. Waiting for a new player to join.');
        $('#chat-window').empty();
        $('#chat-window').append('<p>Player 2 has disconnected.');
        $('#player2').text('');
        $('#wins2').text('');
        $('#losses2').text('');
      } else if (p2Seated && !p1Seated){
        $('#instructions').text('Oops. It looks like player 1 has left the game. Waiting for a new player to join.');
        $('#chat-window').empty();
        $('#chat-window').append('<p>Player 1 has disconnected.');
        $('#player1').text('');
        $('#wins1').text('');
        $('#losses1').text('');
      } else{
        console.log("peanut3")
      }
    });
    data.child('players').on('child_added', function(){
      data.once('value', function(snapshot){
        if(p1Seated && rpsMaster.userId == '2'){
          play1.once('value', function(snapshot){
            rpsMaster.name = snapshot.val().name;
            rpsMaster.wins = snapshot.val().wins;
            rpsMaster.losses = snapshot.val().losses;
            $('#instructions').text('You are playing against ' + rpsMaster.name + '. Waiting for their choice.');
            $('#chat-window').empty();

            $("#player1").text(rpsMaster.name);
            $("#wins1").text('Wins: ' + rpsMaster.wins);
            $("#losses1").text('Losses: ' + rpsMaster.losses);
          });
        }
      });
    });
  });

