class income {
  constructor(data){
    this.data = data;
    getJSON("https://raw.githubusercontent.com/holychikenz/ISMonkey/main/data/itemsFull.json").then(
      data => {
        this.items = data; 
        this.setupUI();
      });
  }
  setupUI(){
    let self = this
    self.plotlyData = [];
    self.traceClasses = [];

    // Mining test
    //self.addTraceClass(self, new mining({zone:"Clay Pit"}));
    //self.addTraceClass(self, new mining({zone:"Desert"}));
    //self.addTraceClass(self, new mining({zone:"Volcano"}));
    //self.addTraceClass(self, new mining({zone:"Deep Pit"}));
    // Defaults
    self.createPlot(self);
    self.updatePlot(self);
    // Buttons
    let incomeDiv = document.getElementById("incomeAddition");
    incomeDiv.addEventListener('click',()=>self.modifyIncomeSource(self))
  }
  createPlot(self){
    let traces = [];
    self.plotlyData = traces;
    var updatemenus = [{
      y: 0.4,
      yanchor: 'top',
      buttons: [{
        method: 'relayout',
        args: [{'yaxis.type': 'linear'}],
        label: 'Scale: Linear',
      },{
        method: 'relayout',
        args: [{'yaxis.type': 'log'}],
        label: 'Scale: Log',
      }],
    }]
    var layout = {
      //title: `${self.items[choice].name}`,
      plot_bgcolor: "rgb(66 66 66 / 66%)",
      paper_bgcolor: "rgb(66 66 66 / 66%)",
      font: {color: "#fff",},
      showlegend: true,
      updatemenus: updatemenus,
      yaxis: {
        rangemode: 'nonnegative',
        range: [0, 20e6],
      },
    }

    Plotly.newPlot('plot', traces, layout, {responsive:true});
  }
  async updatePlot(self){
    Plotly.deleteTraces('plot', [...Array(self.plotlyData.length).keys()]);
    let traces = [];
    for( let tc of self.traceClasses ){
      let newTrace = await tc.getTrace(self.data)
      traces.push(newTrace);
    }
    self.plotlyData = traces;
    Plotly.addTraces('plot', self.plotlyData);
  }
  addTraceClass(self, tc){
    self.traceClasses.push(tc)
    self.displayTraceClasses(self);
  }
  displayTraceClasses(self){
    let incomeList = document.getElementById("incomeList");
    incomeList.innerHTML='';
    for( let index=0; index < self.traceClasses.length; index++ ){
      let tc = self.traceClasses[index];
      let incomeEntry = document.createElement("div");
      incomeEntry.className = 'incomeEntry';
      // Edit, colorbox, summary text
      incomeEntry.innerText=`${index}: Action: ${tc.constructor.name} Zone: ${tc.config.zone}`
      incomeList.append(incomeEntry);
    }
  }
  modifyIncomeSource(self, sourceid=undefined){
    let typeOptions = {
      'Mining': mining
    }
    // We will select a type; mining/foraging/combat etc.
    // Select a zone
    // Select attributes (gear/levels/enchants)
    let incomeObject;
    let selectionModal = document.createElement("div");
    selectionModal.className="modal";
    let backdrop = document.createElement("div");
    backdrop.className="modal-backdrop";
    let paper = document.createElement("div");
    paper.className="modal-paper";
    selectionModal.append(backdrop);
    backdrop.append(paper);
    function clean(event){
      if( event.target == backdrop ){
        selectionModal.remove();
      }
    }
    backdrop.addEventListener('click', clean);
    document.body.append(selectionModal);
    // Lets create the base form
    let typeSelect = document.createElement("select");
    for( const [key, value] of Object.entries(typeOptions) ){
      let newoption = document.createElement("option")
      newoption.value = key
      newoption.innerText = key
      typeSelect.append(newoption)
    }
    typeSelect.value = 'Select Action';
    let zoneSelect = document.createElement("select");
    typeSelect.onchange = async function(){
      incomeObject = new typeOptions[typeSelect.value];
      let zones = await incomeObject.getZones();
      zoneSelect.innerHTML='';
      for( let z of zones ){
        let newoption = document.createElement("option");
        newoption.value = z;
        newoption.innerText = z;
        zoneSelect.append(newoption);
      }
      zoneSelect.value = 'Select'
      console.log("get zones", zones)
    }
    let attributeDiv = document.createElement("div");
    // Set attributes based on source as well, but wait for zone
    zoneSelect.onchange = async function(){
      let attributes = await incomeObject.getAttributes();
      incomeObject.config.zone = zoneSelect.value;
      attributeDiv.innerHTML='';
      for( const [key, value] of Object.entries(attributes) ){
        let newlabel = document.createElement("div")
        newlabel.className = "modal-paper-label";
        newlabel.innerText = key.replace(/(^\w{1})|(\s+\w{1})/g, x=>x.toUpperCase());;
        let newinput = document.createElement("input");
        newinput.type="number";
        newinput.value=value;
        newinput.onchange = function(){
          incomeObject.config[key] = newinput.value;
        }
        let attributeRow = document.createElement("div");
        attributeRow.className="modal-paper-row";
        attributeRow.append(newlabel);
        attributeRow.append(newinput);
        attributeDiv.append(attributeRow);
      }
    }
    // ACTION TYPE
    let typeLabel = document.createElement("div")
    typeLabel.className="modal-paper-label";
    typeLabel.innerText = "Action"
    let typeRow = document.createElement("div");
    typeRow.className="modal-paper-row";
    typeRow.append(typeLabel);
    typeRow.append(typeSelect);
    // ZONE CHOICE
    let zoneLabel = document.createElement("div")
    zoneLabel.className="modal-paper-label";
    zoneLabel.innerText = "Zone"
    let zoneRow = document.createElement("div");
    zoneRow.className="modal-paper-row";
    zoneRow.append(zoneLabel);
    zoneRow.append(zoneSelect);
    // Accept / Reject Buttons
    let selectionRow = document.createElement("div");
    let selectionAccept = document.createElement("button");
    let selectionReject = document.createElement("button");
    selectionRow.className = "modal-button-row";
    selectionAccept.className = "modal-button modal-accept";
    selectionReject.className = "modal-button modal-reject";
    selectionAccept.innerText = "Accept"
    selectionReject.innerText = "Reject"
    selectionRow.append(selectionReject)
    selectionRow.append(selectionAccept)
    // Build the sheet
    paper.append(typeRow)
    paper.append(zoneRow);
    paper.append(attributeDiv);
    paper.append(selectionRow);
    // Submit
    selectionAccept.addEventListener('click', ()=>{
      console.log(incomeObject);
      self.addTraceClass(self, incomeObject);
      self.updatePlot(self);
      selectionModal.remove();
    });
    selectionReject.addEventListener('click', ()=>{
      selectionModal.remove();
    });
  }
};
