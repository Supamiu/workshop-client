function Home(){
  this.model = {
      player1 : new PlayerForm(),
      player2 : new PlayerForm()
    }
  
  this.play = function(){
    let game = {
      player1 : this.model.player1.model.toDict(),
      player2 : this.model.player2.model.toDict()
    }
    router.go("/game", game)
  }

  return {
    template : () => `
      <h1>Pente !</h1>
      <section class="form">
        ${this.model.player1.template()}
        <div>VS</div>
        ${this.model.player2.template()}
      </section>
      <button id="play">play</button>
    `,
    initialiseEvents: function(){
      console.log(this)
      document.getElementById("play").onclick = this.play.bind(this);
    }.bind(this)
  }
  
}