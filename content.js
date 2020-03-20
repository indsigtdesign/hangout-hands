var meet_id;
var your_id;
var hand_raised;
var hand_btn;
var people_state;

console.log("Welcome to Hangout hands");

var url = window.location.href;

meet_id = url.split('/').pop().split('?')[0];

console.log("meeting url : " + meet_id)

var people = document.querySelectorAll('[title]');

for (var i = 0; i < people.length; i++) {
	if(people[i].innerText != ""){
		your_id = people[i].title
		console.log("your name " + your_id)
	}
}

// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  };

firebase.initializeApp(config);
var db = firebase.firestore();
var docRef = db.collection("hangout_meeting").doc(meet_id);

var _timer

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
		if(button[i].innerText == "Join now" || button[i].innerText == "Ask to join" || button[i].innerText == "Deltag nu"){
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

function update_firestore_data(hand_state) {
	hand_raised = hand_state;

	var setWithMerge = docRef.set({
	    [your_id]: hand_state
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

			        console.log(key + " -> " + data[key]);

			        if (data[key] == true) {
			        	var textNode = document.createTextNode(key + " raised their hand");
			        	var elem = document.createElement('div');
				        elem.className ="the_people"
				        elem.appendChild(textNode);
				        document.getElementById("people").appendChild(elem);
			        } else {
			        }
			    }
			}
        }
    });
}

function change_hand_state() {
	if (hand_raised) {
		update_firestore_data(false);
		hand_btn.innerHTML = "Raise hand"
	} else {
		update_firestore_data(true);
		hand_btn.innerHTML = "Lower hand"
	}
}