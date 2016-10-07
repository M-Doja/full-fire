var app = angular.module('sampleApp', ['firebase']);

app.controller('SampleCtrl', function($scope, $firebaseObject, $firebaseArray, $firebaseAuth){


  var auth = $firebaseAuth();
  var FBprovider = new firebase.auth.FacebookAuthProvider();
  var TWprovider = new firebase.auth.TwitterAuthProvider();
  var user = firebase.auth().currentUser;
  var uploadsMetadata = {
    cacheControl: "max-age=" + (60 * 60 * 24* 365) //one yr of seconds
  };
  var ref = firebase.database().ref();
  // File or Blob named mountains.jpg


  // setInterval(function(){
  //   testRef.push({
  //     date: (new Date()).toString(),
  //     text: "some text here",
  //     username: 'Micah'
  //   });
  // }, 2000);

  // testRef.orderByKey().limitToLast(1).on('child_added', function(snap) {
  //   console.log(snap.val());
  // });
// var uploadFile = function(file) {
//   // Upload file
//   var uploadTask = storageRef.child(file.name).put(file, uploadsMetadata);
//
//   return new Promise(function(resolve, reject) {
//     uploadTask.on('state_changed', function(snap) {
//       console.log('Progress: ', snap.byteTransferred, '/', snap.totalBytes, ' bytes');
//     }, function(err){
//       console.log('upload error', err);
//       reject(err);
//     }, function(){
//       var metadata = uploadTask.snaplshot.metadata;
//       var key = metadata.md5Hash.replace(/\//g, ':');
//       var fileRecord = {
//         downloadURL: uploadTask.snapshot.downloadURL,
//         key: key,
//         metadata: {
//           fullPath: metadata.fullPath,
//           md5Hash: metadata.md5Hash,
//           name: metadata.name
//         }
//       };
//       uploadRef.child(key).set(fileRecord).then(resolve, reject);
//     });
//   });
// };

// LOGIN WITH FACEBOOK
  $scope.fbLogin = function(){
    firebase.auth().signInWithPopup(FBprovider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user);
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
      });
    }

// LOGIN WITH TWITTER
  $scope.twLogin = function(){
    firebase.auth().signInWithPopup(TWprovider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log(user);
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
      });
    }

// LOGOUT USER
 $scope.logout = function(){
   firebase.auth().signOut().then(function() {
      console.log('Sign-out successful');
      document.location.href = 'index.html';
    }, function(error) {
      console.log('An error happened. - ' + error);
    });
  }

  // DELETE USER ACCOUNT
  $scope.deleteUser = function() {
    var user = firebase.auth().currentUser;
    user.delete().then(function() {
      console.log('User deleted');
      document.location.href = 'index.html';
    }, function(error) {
      console.log('An error happened. - ' + error);
    });
  }

$scope.isRegistered = false;

// ADD USER DATA TO DB ON BTN CLICK
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.uid);
      console.log(user.displayName + " is signed in");

      var userKey = user.uid;
      var userRef = ref.child('users/'+ userKey);
      console.log(userKey);
      $scope.user = $firebaseArray(userRef);
      var UserPic = user.photoURL;
      var UserName = user.displayName;
      var pic = "<img src='"+UserPic+"' alt='' width='100' id='pix'/>";
      document.getElementById('pic').innerHTML = pic;
      document.getElementById('name').innerHTML = user.displayName;

      $scope.register = function(){
          if ($scope.user) {
            $scope.user.$add({
              userName: user.displayName,
              email: user.email,
              photo: user.photoURL
            });
            alert('saved!');
          }else {
            console.log('I\'m sorry but there was a problem with your request.');
          }
        }
          // ========  SAVING MESSAGES  ========= //

          var msgRef = ref.child('userMessages/'+userKey);
          $scope.messages = $firebaseArray(msgRef);
          $scope.addMessage = function() {
            $scope.messages.$add({
              text: $scope.newMessageText,
              body: $scope.newMessageBody,
              author: $scope.newMessageAuthor,
              note: $scope.newMessageNote
            });
            // clear form fields
            $scope.newMessageText = '';
            $scope.newMessageBody = '';
            $scope.newMessageAuthor = '';
            $scope.newMessageNote = '';
          };

          //  ================  SAVING PHOTOS  =============== //
          var storageRef = firebase.storage().ref();
          var imagesRef = storageRef.child('images');
          function previewFile(){
            var file =document.querySelector('input[type=file]').files[0];
            var metadata = {
            contentType: 'image/jpeg'
            };
            var uploadTask = storageRef.child('images/' + file.name).put(file, metadata);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
            function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        console.log('Upload is running');
                        break;
                      }
                  }, function(error) {
                  console.log('error while uploading')
                  }, function() {
                  var starsRef = storageRef.child('images/'+ file.name);
                  starsRef.getDownloadURL().then(function(url) {
                      document.querySelector('#preview').src=url;
                      var t=document.querySelector('p')
                      t.innerHTML ='firebase storage path URL: '+url
                  }).catch(function(error) {
                      console.log('error while downloading file');
                  });
              });
          }



      } else {
        console.log('no user is logged in');
     }
  });


/*
  =======================  SECOND EXAMPLE OF ABOVE =================
*/
    var ref = firebase.database().ref();
    var userRef = ref.child('users');
    var userRef = userRef.push();
    var userKey = userRef.key;
    var msgRef = ref.child(userRef.key +'/messages');
    var messageRef = msgRef.push();
    var messageKey = messageRef.key;
    var payload = {};
     // create a synchronized array
     $scope.messages = $firebaseArray(msgRef);
     payload['userMessages/' + messageKey] = $scope.message;
    //  ref.update(payload);

     // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.addMessage = function() {
      $scope.messages.$add({
        text: $scope.newMessageText,
        body: $scope.newMessageBody,
        author: $scope.newMessageAuthor,
        note: $scope.newMessageNote,
        image: $scope.newMessageImg
      });
      // clear form fields
      $scope.newMessageText = '';
      $scope.newMessageBody = '';
      $scope.newMessageAuthor = '';
      $scope.newMessageNote = '';
       $scope.newMessageImg = '';
    };
    /*
      ======================= EXAMPLE ABOVE ==========================
    */



});
