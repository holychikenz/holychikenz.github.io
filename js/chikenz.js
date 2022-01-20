const getJSON = async url => {
  try {
    const response = await fetch(url);
    if(!response.ok)
      throw new Error(response.statusText);
    const data = await response.json();
    return data;
  } catch(error) {
    return error;
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timeFormat(time){
  time = Math.floor(time);
  let hours = Math.floor(time/3600);
  let minutes = Math.floor((time-(hours*3600))/60);
  let seconds = time - (hours*3600) - (minutes*60);
  if( hours < 10 ){hours = `0${hours}`;}
  if( minutes < 10 ){minutes = `0${minutes}`;}
  if( seconds < 10 ){seconds = `0${seconds}`;}
  return `${hours}:${minutes}:${seconds}`;
}

function timeFormatFull(time){
  time = Math.floor(time);
  let days = Math.floor(time/86400);
  let rTime = time - days*86400;
  let hours = Math.floor(rTime/3600);
  rTime -= hours*3600;
  let minutes = Math.floor(rTime/60);
  rTime -= minutes*60;
  let seconds = Math.floor(rTime)
  let rString = ""
  if( days > 0 ){rString += `${days}d `;}
  if( hours > 0 || days > 0 ){rString += `${hours}h `;}
  if( minutes > 0 || hours > 0 || days > 0 ){rString += `${minutes}m `;}
  rString += `${seconds}s`;
  return rString;
}

function dnum(num, p) {
  let snum = ""
  if( num >= 1e9 ){
    snum = `${(num/1e9).toFixed(p)} B`;
  }
  else if( num >= 1e6 ){
    snum = `${(num/1e6).toFixed(p)} M`
  }
  else if( num >= 1e3 ){
    snum = `${(num/1e3).toFixed(p)} k`
  }
  else{
    snum = `${(num).toFixed(p)}`
  }
  return snum
}
