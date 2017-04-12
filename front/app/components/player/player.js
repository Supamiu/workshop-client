function PlayerForm(){
  this.id = Math.random() * 100 + 1;

  this.model = {
      name : () => document.getElementById(`name-${this.id}`).value,
      ip : () => document.getElementById(`ip-${this.id}`).value,
      toDict : () => ['name', 'ip'].reduce((object, key) => {
        object[key] = this.model[key]()
        return object;
      }, {})
    }

  this.template = function(){
    return ` 
    <form>
      <p>
        <label for="name-${this.id}"> Nom : </label>
        <input type="text" name="name" id="name-${this.id}" placeholder="Jean Charle" />
      </p>
      <p>
        <label for="ip-${this.id}">IP : </label>
        <input type="text" name="ip" id="ip-${this.id}" placeholder="10.0.0.1" />
      </p>
    </form>
    `
  }

  return this;
}


