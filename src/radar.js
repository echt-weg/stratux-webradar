        var Lat;
        var Long;
        var trafficuri_ws = "ws://192.168.10.1/traffic";

        function init() {
            basics();
            gettraffic();
        }

        function gettraffic() {
            websocket = new WebSocket(trafficuri_ws);
            websocket.onmessage = function(evt) {
                onMessage(evt)
            };
        }

        function onMessage(evt) {
            basics();
            var abstandlat = 0;
            var abstandlng = 0;
			var data = JSON.parse(evt.data);
		

			// Definieren einer sinnvollen Kennung
            var zeichen = data.Tail;
            if (zeichen == "") {
                zeichen = data.Icao_addr;
            }
			
			// Abhängig davon ob das Flugzeug bereits existiert wird es angelegt oder nur ausgewählt
            if (document.getElementById(data.Icao_addr)) {
                var planex = document.getElementById(data.Icao_addr);
            } else {
                var planex = document.createElement("div");
                planex.id = data.Icao_addr;
                document.body.appendChild(planex);
            }

			// Flugzeuge ohne Positionsangaben die Kreise anhand ihrer Stärke erhalten
            if (data.Lat == 0) {
                planex.style.left = "200px";
                planex.style.top = "200px";
                planex.style.width = "50px";
                planex.style.height = "50px";
				planex.className = "planecircle";
				planex.innerHTML = "<div class='planeslabel'>" + zeichen + "<br>" + data.Speed + " kts<br>" + Math.round(data.SignalLevel) + " dB</div>";

            } else {
			// Flugzeuge mit Höhenangaben, die positioniert werden
                abstandlat = Math.round((Lat - data.Lat) * 1000);
                abstandlng = Math.round((Long - data.Lng) * 1000);
                posleft = (335 - abstandlng);
                postop = (650 + abstandlat);
                planex.style.left = posleft;
                planex.style.top = postop;
                planex.style.backgroundImage = "url('img/plane_red.svg')";
				planex.style.transform = "rotate(" + data.Track + "deg)";
				planex.className = "planes";
				planex.innerHTML = "<div class='planeslabel'>" + zeichen + "<br>" + data.Speed + " kts<br>" + data.Alt + " ft</div>";

            }


        }
        window.addEventListener("load", init, false);

        function basics() {

            var requeststatus = new XMLHttpRequest();
            requeststatus.open('GET', 'http://192.168.10.1/getStatus', true);
            requeststatus.onload = function() {
                var datastatus = JSON.parse(this.response);
                document.getElementById('Version').innerHTML = datastatus.Version;
                document.getElementById('GPS').innerHTML = datastatus.GPS_position_accuracy + ' m';
            }
            requeststatus.send();

            var requestsituation = new XMLHttpRequest();
            requestsituation.open('GET', 'http://192.168.10.1/getSituation', true);
            requestsituation.onload = function() {
                var datasituation = JSON.parse(this.response);
                document.getElementById('Groundspeed').innerHTML = Math.round(datasituation.GPSGroundSpeed) + ' kts';
                document.getElementById('Heading').innerHTML = Math.round(datasituation.GPSTrueCourse) + ' °';
                document.getElementById('AHRS').innerHTML = datasituation.AHRSStatus;
                Lat = datasituation.GPSLatitude;
                Long = datasituation.GPSLongitude;
                document.getElementById('GPS-Position').innerHTML = Lat + "/" + Long;
            }
            requestsituation.send();

        }
