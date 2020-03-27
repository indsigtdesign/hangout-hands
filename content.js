var meet_id;
var your_id;
var hand_raised;
var hand_btn;
var link_btn;
var dislike_btn;
var emoji_btn;

var people_state;
var emoji_mode = false;

console.log("Welcome to Hangout hands");

var url = window.location.href;

meet_id = url.split('/').pop().split('?')[0];

console.log("meeting url : " + meet_id)

var people = document.querySelectorAll('[title]');

var fb_obj = {
	"hand":false,
	"like":false,
	"dislike":false
}

for (var i = 0; i < people.length; i++) {
	if(people[i].innerText != ""){
		your_id = people[i].title
		console.log("your name " + your_id)
	}
}

// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCiF2IHWrccvu-I4KARVoauPLbbS7C1gyc",
    authDomain: "hangout-hands.firebaseapp.com",
    databaseURL: "https://hangout-hands.firebaseio.com",
    projectId: "hangout-hands",
    storageBucket: "hangout-hands.appspot.com",
    messagingSenderId: "896474921970",
    appId: "1:896474921970:web:1aee69a912da44e015096b",
    measurementId: "G-6672SMQ4JS"
  };

firebase.initializeApp(config);
var db = firebase.firestore();
var docRef = db.collection("hangout_meeting").doc(meet_id);

var _timer, _rest_like, _rest_dislike

function initApp() {
	_timer = setInterval(look_for_btn, 750);
		
	console.log("attach_firestore_listener")
	attach_firestore_listener();
}

window.onload = function() {
  initApp();
};



function look_for_btn() {
	var join_btn = false;
	var button = document.querySelectorAll('[role="button"]');

	for (var i = 0; i < button.length; i++) {

		if(window.getComputedStyle(button[i]).backgroundColor == "rgb(0, 121, 107)"){
			console.log("Join btn found")
			join_btn = true;
		}
	}

	if (!join_btn) {
		console.log("clearInterval")
		clearInterval(_timer);

		console.log("update_firestore_data")
		update_firestore_data(false);

		var elem = document.createElement('div');
		elem.id = "raise_hand"
		var textNode = document.createTextNode("Raise hand");
		elem.appendChild(textNode);
		elem.addEventListener("click", change_hand_state);
		document.body.appendChild(elem);
		hand_btn = document.getElementById("raise_hand");

		var elem = document.createElement('div');
		elem.id = "like"
		var textNode = document.createTextNode("Like that");
		elem.appendChild(textNode);
		elem.addEventListener("click", like_that);
		document.body.appendChild(elem);
		like_btn = document.getElementById("like");

		var elem = document.createElement('div');
		elem.id = "dislike"
		var textNode = document.createTextNode("Dislike that");
		elem.appendChild(textNode);
		elem.addEventListener("click", dislike_that);
		document.body.appendChild(elem);
		dislike_btn = document.getElementById("dislike");
		
		var elem = document.createElement('div');
		elem.id = "emoji"
		var textNode = document.createTextNode("emoji on");
		elem.appendChild(textNode);
		elem.addEventListener("click", emoji_mode_switch);
		document.body.appendChild(elem);
		emoji_btn = document.getElementById("emoji");

		var elem = document.createElement('div');
		elem.id = "people"
		document.body.appendChild(elem);
		people_state = document.getElementById("people");
	}
}

function get_firestore_data() {
	docRef.get().then(function(doc) {
	    if (doc.exists) {
	        console.log("Document data:", doc.data());
	    } else {
	        // doc.data() will be undefined in this case
	        console.log("No such document!");
	    }
	}).catch(function(error) {
	    console.log("Error getting document:", error);
	});
}

function update_firestore_data() {

	var setWithMerge = docRef.set({
	    [your_id]: fb_obj
	}, { merge: true })
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});
}

function attach_firestore_listener(){
	docRef.onSnapshot(function(doc) {
        console.log("Current data: ", doc.data());
        console.log(people_state);
        if (people_state) {
        	$( "#people" ).remove();
	    	var elem = document.createElement('div');
			elem.id = "people"
			document.body.appendChild(elem);

        	const data = doc.data();
			for (var key in data) {
			    if (data.hasOwnProperty(key)) {

			        console.log(key + " -> ");
			        console.log(data[key])

			        if (data[key].hand == true) {
			        	if (emoji_mode) {
			        		var textNode = document.createTextNode(key + " ✋");
			        	} else var textNode = document.createTextNode(key + " raised their hand");
			        	var elem = document.createElement('div');
				        elem.className ="the_people"
				        elem.appendChild(textNode);
				        document.getElementById("people").appendChild(elem);
			        }

			        if (data[key].like == true) {
			        	if (emoji_mode) {
			        		var textNode = document.createTextNode(key + " 👍");
			        	} else var textNode = document.createTextNode(key + " liked that");
			        	var elem = document.createElement('div');
			        	elem.id = "like_bubble"
				        elem.className ="the_people"
				        elem.appendChild(textNode);
				        document.getElementById("people").appendChild(elem);
			        }

			        if (data[key].dislike == true) {
			        	if (emoji_mode) {
			        		var textNode = document.createTextNode(key + " 👎");
			        	} else var textNode = document.createTextNode(key + " disliked that");
			        	var elem = document.createElement('div');
			        	elem.id = "dislike_bubble"
				        elem.className ="the_people"
				        elem.appendChild(textNode);
				        document.getElementById("people").appendChild(elem);
			        }
			    }
			}
        }
    });
}

function like_that(){
	if (fb_obj.like == false) {
		fb_obj.like = true;
		$("#like").fadeTo("slow", 0.25);
		_rest_like = setInterval(rest_like, 2500);

		update_firestore_data();
	}
}

function rest_like() {
	clearInterval(_rest_like);
	console.log("rest like")
	fb_obj.like = false;
	update_firestore_data();
	$("#like").fadeTo("slow", 1);
}

function dislike_that(){
	if (fb_obj.dislike == false) {
		fb_obj.dislike = true;
		$("#dislike").fadeTo("slow", 0.25);
		_rest_dislike = setInterval(rest_dislike, 2500);

		update_firestore_data();
	}
}

function rest_dislike() {
	clearInterval(_rest_dislike);
	console.log("rest dislike")
	fb_obj.dislike = false;
	update_firestore_data();
	$("#dislike").fadeTo("slow", 1);
}

function change_hand_state() {
	if (fb_obj.hand) {
		fb_obj.hand = false;
		if (emoji_mode) {
			hand_btn.innerHTML = "✋"
		} else hand_btn.innerHTML = "Raise hand"
	} else {
		fb_obj.hand = true;
		if (emoji_mode) {
			hand_btn.innerHTML = "✊"
		} else hand_btn.innerHTML = "Lower hand"
	}
	update_firestore_data();
}

function emoji_mode_switch() {
	if (emoji_mode) {
		emoji_mode = false;
		emoji_btn.innerHTML = "emoji on"
	} else {
		emoji_mode = true;
		emoji_btn.innerHTML = "emoji off"
	}
	emoji_mode_update()
}

function emoji_mode_update(){
	if (emoji_mode) {
		if (fb_obj.hand) {
			hand_btn.innerHTML = "✋"
		} else {
			hand_btn.innerHTML = "✊"
		}
		dislike_btn.innerHTML = "👎"
		like_btn.innerHTML = "👍"
	} else {
		if (fb_obj.hand) {
			hand_btn.innerHTML = "Raise hand"
		} else {
			hand_btn.innerHTML = "Lower hand"
		}

		dislike_btn.innerHTML = "Dislike that"
		like_btn.innerHTML = "Like that"
	}
}