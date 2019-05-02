import React, { Component } from "react";
import ReactDOM from 'react-dom';
import YouTube from 'react-youtube';
import axios from 'axios';
import fs from 'fs'; 
import sun from './sun.png';
import $ from 'jquery';
import youtube from './youtube';
import readline from 'readline';
import google from 'googleapis';

const monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
const relatedVidId = "RL8-fCEtFTM";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

export default class Home extends Component {
	constructor(props) {
		super(props);
        this.state = {youtubeId : "",
			tempSet : false, 
			wImage : sun,
			wTemp : 'idk',
			wDesc : 'Something went wrong send help',
			events: [],
			eventSet : false};
	this.readFile();
    }
	authorize(credentials, callback) {
		let that = this;
  		const {client_secret, client_id, redirect_uris} = credentials.installed;
  		const oAuth2Client = new google.auth.OAuth2(
      					client_id, client_secret, redirect_uris[0]);

  		// Check if we have previously stored a token.
  		fs.readFile(TOKEN_PATH, (err, token) => {
    		if (err) return that.getAccessToken(oAuth2Client, callback);
   			 oAuth2Client.setCredentials(JSON.parse(token));
    			callback(oAuth2Client);
  		});
	}

	getAccessToken(oAuth2Client, callback) {
  		const authUrl = oAuth2Client.generateAuthUrl({
    					access_type: 'offline',
    					scope: SCOPES,
  				});
  		console.log('Authorize this app by visiting this url:', authUrl);
  		const rl = readline.createInterface({
    			input: process.stdin,
    			output: process.stdout,
  		});
  		rl.question('Enter the code from that page here: ', (code) => {
    		rl.close();
    		oAuth2Client.getToken(code, (err, token) => {
      			if (err) return console.error('Error retrieving access token', err);
      				oAuth2Client.setCredentials(token);
      			// Store the token to disk for later program executions
      			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        			if (err) return console.error(err);
        			console.log('Token stored to', TOKEN_PATH);
      			});
      			callback(oAuth2Client);
    		});
  		});
	}

	listEvents(auth) {
  		const calendar = google.calendar({version: 'v3', auth});
  		calendar.events.list({
    			calendarId: 'primary',
    			timeMin: (new Date()).toISOString(),
    			maxResults: 10,
    			singleEvents: true,
    			orderBy: 'startTime',
  		}, (err, res) => {
    			if (err) return console.log('The API returned an error: ' + err);
    			const events = res.data.items;
    			if (events.length) {
      				console.log('Upcoming 10 events:');
      				events.map((event, i) => {
        				const start = event.start.dateTime || event.start.date;
        				console.log(`${start} - ${event.summary}`);
      				});
   			 } else {
      				console.log('No upcoming events found.');
		 	 }
  		});
	}
    
	readFile() {
		let that = this;
		fs.readFile('credentials.json', (err, content) => {
  			if (err) return console.log('Error loading client secret file:', err);
  			// Authorize a client with credentials, then call the Google Calendar API.
  			that.authorize(JSON.parse(content), that.listEvents);
		});
	}

    componentDidMount() {
        if (this.state.youtubeId === "") {
            this.getYoutubeId();
        }
	if (!this.state.tempSet) {
        	this.getTemp();
	}
	if (!this.state.eventSet) {
		this.getEvents();
	}
    }
	getEvents(){
		
	}


    getTemp() : String {
        var that = this;
        if (this.state.tempSet == false) {
                    axios.get('https://api.openweathermap.org/data/2.5/weather?q=Lansing,US&appid=826a43399932cec0eccdf4a79709b4d1')
          .then(function (response) {
            var kelvin = parseFloat(response.data.main.temp);
            var fahren = (kelvin * (9.0/5.0)) -459.67;
            var degreeOut = Math.floor(fahren);
            var degreeStr = degreeOut.toString() + ' °F';

            var desc = response.data.weather[0].description;
            that.setState({wTemp:degreeStr, wDesc:desc, tempSet:true});

            var weather = response.data.weather[0].main;
            document.getElementById('weatherSymbol').src = "http://openweathermap.org/img/w/" +response.data.weather[0].icon + ".png";
          })
          .catch(function (error) {
            console.log(error);
            that.setState({wTemp:"70", wDesc:"sunny", tempSet:true})
          });
        }

        return 'idk';
    }

    getDate() : String {
        this.getYoutubeId();
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!

        var yyyy = today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd;
        } 
        var today = monthNames[today.getMonth()] + ' ' + dd + ', ' + yyyy;
        return today;
    }

    getYoutubeId = async () => {
        //fetch a videoId from googleapi related to a video id (i think its a news vid)
        if (this.state.youtubeId == "") {
            const response = await youtube.get('./search', {
                params: {
                    //relatedToVideoId: relatedVidId,
                    chart:'mostPopular',
                    regionCode:'US',
                    type: 'video'
                }
            })
            console.log(response);
            if (response !== undefined) {
                this.setState({youtubeId: response.data.items[0].id.videoId })
            } else {
                console.log('response was undefined');
            }
        }

    };

    render () {
    	    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
        origin :'http://localhost:3000'
      }
    };

  

    	return (
              <div id="HomeWrapper">
                  <div id="top">
		    <div id="weather">
                       <p>{this.getDate()}</p>
                       <p>
                          <img id="weatherSymbol" src={this.state.wImage}/>
		 	  <div id="temp">
                            <p id="tempVal">{this.state.wTemp}</p>
                            <p id="desc">{this.state.wDesc}</p>
                          </div>
                       </p>
		   </div>
		   <div id="reminders">
		      Reminders
		   </div>
                  </div>
                  <YouTube
                    videoId={this.state.youtubeId}
                    opts={opts}
                    onReady={this._onReady}
                  />
              </div>
    	)
    }

}
