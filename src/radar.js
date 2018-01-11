var Lat;
var Long;
var trafficuri_ws = "ws://192.168.10.1/traffic";

function init()
{
   basics();
   gettraffic();
}

function gettraffic()
{
   websocket = new WebSocket(trafficuri_ws);
   websocket.onmessage = function(evt)
   {
      onMessage(evt)
   };
}

function onMessage(evt)
{
   basics();
   var abstandlat = 0;
   var abstandlng = 0;
   var data = JSON.parse(evt.data);

   // Definieren einer sinnvollen Kennung
   var zeichen = data.Tail;
   if (zeichen == "")
   {
      zeichen = data.Icao_addr;
   }

   // Abhängig davon ob das Flugzeug bereits existiert wird es angelegt oder nur ausgewählt
   if (document.getElementById(data.Icao_addr))
   {
      var planex = document.getElementById(data.Icao_addr);
   }
   else
   {
      var planex = document.createElement("div");
      planex.id = data.Icao_addr;
      maincircle.appendChild(planex);
   }

   // Flugzeuge ohne Positionsangaben die Kreise anhand ihrer Stärke erhalten
   if (data.Lat == 0)
   {
      planex.className = "planecircle";
      planex.style.width = (Math.round(data.SignalLevel) * (-20));
      planex.style.height = (Math.round(data.SignalLevel) * (-20));
      planex.style.left = (400 - (Math.round(data.SignalLevel) * (-20) / 2));
      planex.style.top = (400 - (Math.round(data.SignalLevel) * (-20) / 2));
      planex.innerHTML = "<div class='planecirclelabel'>" + zeichen + "<br>" + data.Speed + " kts<br>" + Math.round(data.SignalLevel) + " dB</div>";

   }
   else
   {
      // Flugzeuge mit Höhenangaben, die positioniert werden
      planex.className = "planes";
      abstandlat = Math.round((Lat - data.Lat) * 1000);
      abstandlng = Math.round((Long - data.Lng) * 1000);
      posleft = (350 - abstandlng);
      postop = (350 + abstandlat);
      planex.style.left = posleft;
      planex.style.top = postop;
      // Fallback auf 70x140er Breite wenn ein Flugzeug plötzlich doch eine Position sendet
      planex.style.width = 70;
      planex.style.height = 140;
      planex.style.backgroundImage = "url('img/plane_red.svg')";
      planex.style.transform = "rotate(" + data.Track + "deg)";
      planex.innerHTML = "<div class='planeslabel'>" + zeichen + "<br>" + data.Speed + " kts<br>" + data.Alt + " ft</div>";

   }

}
window.addEventListener("load", init, false);

function basics()
{

   var requeststatus = new XMLHttpRequest();
   requeststatus.open('GET', 'http://192.168.10.1/getStatus', true);
   requeststatus.onload = function()
   {
      var datastatus = JSON.parse(this.response);
      document.getElementById('Version').innerHTML = "Version: " + datastatus.Version;
      document.getElementById('GPS').innerHTML = "GPS Accouracy: " + datastatus.GPS_position_accuracy + ' m';
   }
   requeststatus.send();

   var requestsituation = new XMLHttpRequest();
   requestsituation.open('GET', 'http://192.168.10.1/getSituation', true);
   requestsituation.onload = function()
   {
      var datasituation = JSON.parse(this.response);
      document.getElementById('Groundspeed').innerHTML = "Groundspeed: " + Math.round(datasituation.GPSGroundSpeed) + ' kts';
      document.getElementById('Heading').innerHTML = "Heading: " + Math.round(datasituation.GPSTrueCourse) + ' °';
      document.getElementById('AHRSMagHeading').innerHTML = "AHRSMagHeading: " + Math.round(datasituation.GPSTrueCourse) + ' °';
      document.getElementById('BaroPressureAltitude').innerHTML = "BaroPressureAltitude: " + Math.round(datasituation.BaroPressureAltitude) + ' ';
      document.getElementById('AHRSGLoad').innerHTML = "AHRSGLoad: " + Math.round(datasituation.AHRSGLoad) + ' G';
      Lat = datasituation.GPSLatitude;
      Long = datasituation.GPSLongitude;
      document.getElementById('GPS-Position').innerHTML = "Position: " + Lat + "/" + Long;
      document.getElementById('maincircle').style.transform = "rotate(" + datasituation.GPSTrueCourse + "deg)";

   }
   requestsituation.send();

}