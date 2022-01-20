class mining {
  constructor(config={}){
    // Each instance of the class is a different zone and gearset
    this.config = {
      zone: "Volcano",
      level: 200,
      haste: 6,
      gathering: 8,
      superheat: 8,
    }
    for( const [key, value] of Object.entries(config) ){
      this.config[key] = value;
    }
    this.cprom = Promise.all([
      getJSON("https://raw.githubusercontent.com/holychikenz/ISMonkey/main/data/gathering/mining/mining.json"),
      getJSON("https://raw.githubusercontent.com/holychikenz/ISMonkey/main/data/itemsFull.json"),
    ]).then( data=> {
      this.itemNameToID = {}
      this.data = data[0];
      this.items = data[1];
      for( const [id, item] of Object.entries(this.items) ){
        this.itemNameToID[item.name] = id
      }
    });
  }
  async getTrace(market){
    const response = await this.cprom;
    let mine = this.data.zones[this.config.zone]
    let drops = mine.drops
    // All drops are time based, set the initial time array
    let timeArray = undefined
    let actionValue = undefined
    console.log(this.data)
    for( const [itemName, frequency] of Object.entries(drops) ){
      let id = this.itemNameToID[itemName];
      if( typeof(timeArray) === 'undefined' ){
        timeArray = market[id].time;
        actionValue = timeArray.map(x=>0);
      }
      let marketValue = market[id].price; // Array of prices
      // Superheat
      if( 'superheat' in this.data.items[itemName] ){
        let shValue = market[this.itemNameToID[this.data.items[itemName].superheat]].price;
        let SH = this.config.superheat*0.01;
        actionValue = actionValue.map( (x,i) => x + marketValue[i]*frequency*(1-SH) + shValue[i]*SH*frequency );
      } else {
        actionValue = actionValue.map( (x,i) => x + marketValue[i]*frequency )
      }
      // Gathering
      let gather = this.config.gathering*0.1;
      actionValue = actionValue.map( (x,i) => x + marketValue[i]*gather*frequency );
    }
    // Now calculate actions per hour
    let actionsPerHour = 3600/(mine.basetime * (100/(99+this.config.level)) * (1 - this.config.haste*0.04))
    let valuePerHour = actionValue.map(x=>actionsPerHour*x);
    let trace = {
      x: timeArray,
      y: valuePerHour,
      type: 'scatter',
      name: this.config.zone,
    }
    return trace;
  }
  reconfigure(config) {
    for( const [key, value] of Object.entries(config) ){
      this.config[key] = value;
    }
  }
  async getZones(){
    const response = await this.cprom;
    let zoneset = [];
    for( const [key, value] of Object.entries(this.data.zones) ){
      zoneset.push(key);
    }
    return zoneset;
  }
  async getAttributes(){
    let attributes = {...this.config};
    delete attributes.zone;
    return attributes;
  }
}
