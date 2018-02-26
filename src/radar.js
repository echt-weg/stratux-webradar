// Definieren einiger Basisvariablen
var Lat;
var Long;
var stratuxip = "192.168.10.1";
var trafficuri_ws = "ws://" + stratuxip + "/traffic";
var statusuri = "http://" + stratuxip + "/getStatus";
var situationuri = "http://" + stratuxip + "/getSituation";

// Laden der Init-Funktion nach Laden der Seite, Interval für Akutalisierungen
window.addEventListener("load", init, false);
window.setInterval(basics, 500);


// Ein- und Ausklappen der Details
function collapseupperbox(mode)
{
  if (mode==1)
  {
    document.getElementById('upperbox').style.height = 40;
    document.getElementById('upperboxcontrol').innerHTML = '<a onclick="collapseupperbox(0);">&#128470;</a>';
  }
  if (mode==0)
  {
    document.getElementById('upperbox').style.height = 300;
    document.getElementById('upperboxcontrol').innerHTML = '<a onclick="collapseupperbox(1);">&#128469;</a>';
  }
}

// Initalisierung / Hauptfunktion beim Laden der Seite
function init()
{
   collapseupperbox(1);
   basics();
   gettraffic();
}

// Definieren des Trafficempfängers
function gettraffic()
{
   websocket = new WebSocket(trafficuri_ws);
   websocket.onmessage = function(evt)
   {
      onMessage(evt)
   };
}

// Empfang von Traffic via WS
function onMessage(evt)
{
 
   // Abstand nullen
   var abstandlat = 0;
   var abstandlng = 0;
   var data = JSON.parse(evt.data);

   // Definieren einer sinnvollen Kennung
   var zeichen = data.Tail;
   if (zeichen == "")
   {
	   zeichen = data.Icao_addr.toString(16).toUpperCase();
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
	  // Fallback auf genulltes Hintergrundbild falls ein Flugzeug plötzlich keine Posiion mehr sendet
      planex.style.backgroundImage = "";
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

// Abfrage der eigenen Daten und drehen des Radars
function basics()
{
   var requeststatus = new XMLHttpRequest();
   requeststatus.open('GET', statusuri, true);
   requeststatus.onload = function()
   {
      var datastatus = JSON.parse(this.response);
      document.getElementById('Version').innerHTML = "Version: " + datastatus.Version;
      document.getElementById('GPS').innerHTML = "GPS Accouracy: " + datastatus.GPS_position_accuracy + ' m';
   }
   requeststatus.send();
   var requestsituation = new XMLHttpRequest();
   requestsituation.open('GET', situationuri, true);
   requestsituation.onload = function()
   {
      var datasituation = JSON.parse(this.response);
      document.getElementById('Groundspeed').innerHTML = "Groundspeed: " + Math.round(datasituation.GPSGroundSpeed) + ' kts';
      document.getElementById('Heading').innerHTML = "Heading: " + Math.round(datasituation.GPSTrueCourse) + ' °';
      document.getElementById('AHRSMagHeading').innerHTML = "AHRSMagHeading: " + Math.round(datasituation.GPSTrueCourse) + ' °';
      document.getElementById('BaroPressureAltitude').innerHTML = "BaroPressureAltitude: " + Math.round(datasituation.BaroPressureAltitude) + ' ';
      document.getElementById('GPSAltitude').innerHTML = "GPSAltitude: " + Math.round(datasituation.GPSHeightAboveEllipsoid) + ' ';
      document.getElementById('AHRSGLoad').innerHTML = "AHRSGLoad: " + Math.round(datasituation.AHRSGLoad) + ' G';
      Lat = datasituation.GPSLatitude;
      Long = datasituation.GPSLongitude;
      document.getElementById('GPS-Position').innerHTML = "Position: " + Lat + "/" + Long;
      document.getElementById('maincircle').style.transform = "rotate(" + -datasituation.GPSTrueCourse + "deg)";
   }
   requestsituation.send();
}