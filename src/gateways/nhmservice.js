/* NHM Service module */

//import {router} from '../main'

// URL and endpoint constants
//const API_URL = 'http://127.0.0.1:8000/resources/';
//const BASE_URL = 'http://127.0.0.1:8000/';
const API_URL = 'http://104.236.119.135/resources/'
const BASE_URL = 'http://104.236.119.135/'

const LOGIN_URL = BASE_URL + 'account/authenticate/';
const SIGNUP_URL = BASE_URL + 'account/register/';
const FILE_UPLOAD_URL = BASE_URL + 'account/media-push/';
const UPDATE_CREDENTIALS_URL = BASE_URL + 'account/credentials-update/';

export default {
	// User object will let us check authentication status
	// Test: "token":"a1af18a0e116f7d39aa39048875b977f86e7ca7e"
	user: {
		authenticated: false
	},

	// Send a request to the login URL and save the returned JWT
	login(context, creds, redirect) {
		return context.$http.post(LOGIN_URL, creds);
	},

	/*
	signup(context, creds, redirect) {
		context.$http.post(SIGNUP_URL, creds, (data) => {
			localStorage.setItem('id_token', data.id_token)

			this.user.authenticated = true

			if(redirect) {
				//router.go(redirect)        
			}

		}).error((err) => {
			context.error = err
		})
	},
	*/

	// To log out, we just need to remove the token
	logout() {
		//localStorage.removeItem('id_token')
		this.user.authenticated = false
	},

	checkAuth() {
		var jwt = localStorage.getItem('id_token')
		if(jwt) {
			this.user.authenticated = true
		}
		else {
			this.user.authenticated = false      
		}
	},

	// The object to be passed as a header for authenticated requests
	getAuthHeader() {
		return {
			'Authorization': 'Bearer ' + localStorage.getItem('id_token')
		}
	},

	// Provider--Request Access
	providerRequestAccess(context, params) {
		console.log(params);
		const endpoint = BASE_URL + 'account/request-access/';
		return context.$http.post(endpoint, params);
	},

	/* *************** read endpoint wrappers ***************** */
	getServices(context) {
		const endpoint = API_URL + 'services/';
		return context.$http.get(endpoint);
	},

	getClientTypes(context) {
		const endpoint = API_URL + 'client-types/';
		return context.$http.get(endpoint);
	},

	getLanguages(context) {
		const endpoint = API_URL + 'languages/';
		return context.$http.get(endpoint);
	},

	getFaqs(context) {
		const endpoint = API_URL + 'faq/';
		return context.$http.get(endpoint);
	},

	searchResources(context, params) {
		let endpoint = API_URL + 'providers?search=' + (params.search ? params.search: '');
		if(params.service && parseInt(params.service)) {
			endpoint += '&service=' + params.service;
		}
		if(params.clienttype && parseInt(params.clienttype)) {
			endpoint += '&clienttype=' + params.clienttype;
		}
		return context.$http.get(endpoint);
	},

	searchEvents(context, params) {
		let endpoint = API_URL + 'events?search=' + (params.search ? params.search: '');
		if(params.startDate) {
			let sdate = new Date(params.startDate);
			endpoint += '&start=' + sdate.toISOString();
		}
		if(params.endDate) {
			let edate = new Date(params.endDate);
			endpoint += '&end=' + edate.toISOString();
		}
		console.log('pinging ... ' + endpoint);
		return context.$http.get(endpoint);
	},

	searchUrgentNeeds(context, params) {
		let endpoint = API_URL + 'urgent-needs?search=' + (params.search ? params.search: '');
		if(params.urgentNeedDate) {
			let udate = new Date(params.urgentNeedDate);
			endpoint += '&end=' + udate.toISOString();
		}
		console.log('pinging ... ' + endpoint);
		return context.$http.get(endpoint);
	},

	getProvider(context, id) {
		const endpoint = API_URL + 'providers/' + id;
		return context.$http.get(endpoint);
	},

	updatePassword(context, provider_id, passdata) {
		var self = this;
		const endpoint = UPDATE_CREDENTIALS_URL;  
		const key = window.localStorage.getItem('nhmtoken');

		passdata.provider = provider_id;

		return context.$http.post(endpoint, passdata, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
		});
		
	},

	updateProvider(context, provider) {
		let params = Object.assign({}, provider);
		delete params.locations;
		delete params.services;
		delete params.client_types;
		delete params.avatar;
		const key = window.localStorage.getItem('nhmtoken');
		//console.log(key);

		const endpoint = API_URL + 'providers/' + params.id;
		return context.$http.patch(endpoint, params, {
			headers: {
				Authorization: 'Token ' + key
			}
		});
	},

	updateProviderServices(context, provider) {
		//provider = { id: #, services: [], client_types: [] }
		let params = Object.assign({}, provider);
		const key = window.localStorage.getItem('nhmtoken');

		const endpoint = API_URL + 'providers/' + params.id;
		return context.$http.patch(endpoint, params, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		});
	},

	addProviderLocation(context, provider) {
		//provider = { id: #, location: [] }
		var self = this;
		let params = Object.assign({}, provider);
		const key = window.localStorage.getItem('nhmtoken');
		const locationEndpoint = API_URL + 'locations/';
		//const providerEndpoint = API_URL + 'providers/' + params.id;

		return context.$http.post(locationEndpoint, params.location, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		}).then((response) => {
			var location = response.data;
			console.log("location in service: ", location);
			return self.updateProviderLocations(context, {id: params.id, locations: [location]}, {
				headers: {
					Authorization: 'Token ' + key,
					'Content-Type': 'application/json'
				},
				emulateJSON: false
			});
		});
	},

	updateProviderLocations(context, provider) {
		//provider = { id: #, locations: [] }
		let params = Object.assign({}, provider);
		const key = window.localStorage.getItem('nhmtoken');

		const endpoint = API_URL + 'providers/' + params.id;
		return context.$http.patch(endpoint, params, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		});
	},

	deleteLocation(context, options) {
		//options = { id: #, location: [] }
		var self = this;
		let params = Object.assign({}, options);
		const key = window.localStorage.getItem('nhmtoken');
		const locationEndpoint = API_URL + 'locations/' + params.location.id;
		//const providerEndpoint = API_URL + 'providers/' + params.id;

		return context.$http.delete(locationEndpoint, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		}).then((response) => {
			var deletedLocation = response.data;
			console.log("location in service: ", deletedLocation);
			return self.getProvider(context, params.id);
		});
	},

	uploadMediaFile(context, provider_id, formdata) {
		var self = this;
		const endpoint = FILE_UPLOAD_URL;  
		const key = window.localStorage.getItem('nhmtoken');

		return context.$http.post(endpoint, formdata, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
		}).then( (response) => { 
			console.log("looks like uploaded went ok...", response.data);
			return self.getProvider(context, provider_id);
		});
		
	},

	deleteLogo(context, provider_id) {
		//let params = Object.assign({}, provider);
		//delete params.locations;
		//delete params.services;
		const key = window.localStorage.getItem('nhmtoken');
		//console.log(key);

		const endpoint = API_URL + 'providers/' + provider_id;
		return context.$http.patch(endpoint, {id: provider_id, avatar: ''}, {
			headers: {
				Authorization: 'Token ' + key
			}
		});
	},

	getEvents(context, provider_id) {
		//const key = window.localStorage.getItem('nhmtoken');
		const endpoint = API_URL + 'events/?provider=' + provider_id;
		return context.$http.get(endpoint);
	},

	createEvent(context, event) {
		const key = window.localStorage.getItem('nhmtoken');
		//console.log(key);

		const endpoint = API_URL + 'events/';
		return context.$http.post(endpoint, event, {
			headers: {
				Authorization: 'Token ' + key
			}
		});
	},

	deleteEvent(context, event_id) {
		//options = { id: #, location: [] }
		const key = window.localStorage.getItem('nhmtoken');
		const endpoint = API_URL + 'events/' + event_id;

		return context.$http.delete(endpoint, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		});
	},

	getNeeds(context, provider_id) {
		//const key = window.localStorage.getItem('nhmtoken');
		const endpoint = API_URL + 'urgent-needs/?provider=' + provider_id;
		return context.$http.get(endpoint);
	},

	createNeed(context, need) {
		const key = window.localStorage.getItem('nhmtoken');
		//console.log(key);

		const endpoint = API_URL + 'urgent-needs/';
		return context.$http.post(endpoint, need, {
			headers: {
				Authorization: 'Token ' + key
			}
		});
	},

	deleteNeed(context, need_id) {
		//options = { id: #, location: [] }
		const key = window.localStorage.getItem('nhmtoken');
		const endpoint = API_URL + 'urgent-needs/' + need_id;

		return context.$http.delete(endpoint, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
			emulateJSON: false
		});
	},

	decodeBookmark(context, bookmark) {
		var self = this;
		const endpoint = BASE_URL + 'bookmarks/decode/';  
		const key = window.localStorage.getItem('nhmtoken');

		return context.$http.post(endpoint, {bookmark: bookmark}, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
		});
		
	},

	encodeBookmark(context, params) {
		var self = this;
		const endpoint = BASE_URL + 'bookmarks/encode/';
		const key = window.localStorage.getItem('nhmtoken');

		return context.$http.post(endpoint, params, {
			headers: {
				Authorization: 'Token ' + key,
				'Content-Type': 'application/json'
			},
		});
		
	},

	googleTranslate(context, params, callback) {
		const endpoint = "https://translation.googleapis.com/language/translate/v2";
		if(!params.key) {
			params.key = 'AIzaSyB6L-gd4MueuPig0CtU6He3nf9lebyfYwI';
		}
		if(!params.source) {
			params.source = 'en';
		}

		context.$http.post(endpoint, params)
			.then((resp) => {
				var transText = resp.data.data.translations[0].translatedText;
				if(typeof callback === 'function') {
					callback(transText);
				}
			}, (err) => {
				console.log("whoops...Error: ", err);
			});
	}
}
