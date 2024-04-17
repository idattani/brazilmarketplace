import { ComponentFactoryResolver, Injectable, NgZone } from '@angular/core';
import { User } from '../services/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Supplier } from './supplier';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { getStorage, ref, connectStorageEmulator, UploadTaskSnapshot } from '@firebase/storage';
import { Chat } from './chat';
import { Message } from './message';
import { serverTimestamp } from '@firebase/firestore';
import { getBlob } from '@angular/fire/storage';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { EmailAuthProvider, updateEmail } from '@firebase/auth';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  
  userData: any; // Save logged in user data
  storage = getStorage()

  servicePickerOptions: any;
  certificationOptions: any;

  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning
    public afStorage: AngularFireStorage
  ) {


    if (!environment.production) {
      connectStorageEmulator(this.storage, "localhost", 9199)
    }
    

    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        console.log("updated user from auth")
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        let jsonUser = JSON.parse(localStorage.getItem('user')!);

        afs.collection("users").doc(jsonUser.uid).snapshotChanges().subscribe((data) => {
          localStorage.setItem("userData", JSON.stringify(data.payload.data()))
        })
        
        /*afs.collection("users").doc(jsonUser.uid).ref.get().then((doc) => {
          if (doc.exists) {
            console.log("updated user data from subscribe")
            localStorage.setItem("userData", JSON.stringify(doc.data()))
          }
        })*/
      } else {
        this.userData = null
        localStorage.setItem('user', 'null');
        localStorage.setItem("userData", 'null')
      }
    });
  }

  isLoggedIn () {
    return (localStorage.getItem("user") && this.userData.emailVerified)
  }

  checkServicePickerUniqueness () {
    let values: any = Object.values(this.servicePickerOptions)

    const level3_values = values.map((o: any) => o.level3)
    const unique_values = new Set(level3_values)

    return (values.length == unique_values.size)
  }

  checkServicesAreCompleted () {
    let allServicesComplete = true
    Object.values(this.servicePickerOptions).forEach((service: any) => {
      if (!("level3" in service)) {
        allServicesComplete = false
      }
    })

    return allServicesComplete
  }

  confirmPasswordRetype (password: string, passwordRetype: string) {
    return !(password == passwordRetype)
  }

  updateEmail (newEmail: string, password: string) {
    this.afAuth.currentUser.then((user) => {
      if (user) {
        //Initiate new credential as firebase needs fresh access token for risky transactions
        const credential = EmailAuthProvider.credential(user.email!, password)
        user.reauthenticateWithCredential(credential).then(() => {
          window.alert("Check your inbox to confirm email change!")
          updateEmail(user, newEmail).then(() => {
            this.afAuth.updateCurrentUser(user).then(() => {
              this.updateUser({email: newEmail})
            })
          })
        })
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }


  // Sign in with email/password
  signIn(email: string, password: string) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        //this.SetUserData(result.user);
        this.afAuth.authState.subscribe((user) => {
          if (user) {
            this.router.navigate(['category', 'tier1']);
          }
        });
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  signOut () {
    this.afAuth.signOut().then(() => {
      console.log("user signed out")
      this.router.navigate([''])
    })
  }

  

  // Sign up with email/password
  signUpUser(email: string,
    password: string,
    first_name: string,
    last_name: string,
    company_name: string,
    address: any,
    phone_number: string,
    isSupplier: boolean) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        this.SendVerificationMail();
        this.SetUserData(result.user, first_name, last_name, company_name, address, phone_number, isSupplier);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  sendVerificationEmail () {
    this.afAuth.currentUser.then(user => {
      if (user) {
        user.sendEmailVerification({url: environment.verificationRedirect}).then(() => {
          this.router.navigate(['verify-email-address']);
        })
      }
    })
    .catch(error => console.log(error))
  }

  getCurrentUserDetails () {
    return this.afs.collection('users').doc(this.userData.uid)
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser
      .then((u: any) => u.sendEmailVerification({url: environment.verificationRedirect}))
      .then(() => {
        this.router.navigate(['verify-email-address']);
      });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        window.alert('Password reset email sent, check your inbox.');
      })
      .catch((error) => {
        window.alert(error);
      });
  }
 
  /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any, first_name: string, last_name: string, company_name: string, address: any, phone_number: string, isSupplier: boolean) {
    
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: first_name + " " + last_name,
      photoURL: "null",
      emailVerified: user.emailVerified,
      first_name: first_name,
      last_name: last_name,
      company_name: company_name,
      phone_number: phone_number,
      address: address,
      isSupplier: isSupplier,
      unread_messages: 0,
      image_file: "../../assets/profile.png"
    };

    return userRef.set(userData, {
      merge: true,
    });
  }

  signUpSupplier(email: string,
    password: string,
    contact_name: string,
    company_name: string,
    address: any,
    phone_number: string,
    isSupplier: boolean,
    image_file: string, 
    brief_description: string, 
    long_description: string, 
    company_url: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        /* Call the SendVerificaitonMail() function when new user sign 
        up and returns promise */
        console.log(result.user)
        this.SendVerificationMail();
        this.SetSupplierData(result.user, contact_name, company_name, address, phone_number, isSupplier, image_file,
          brief_description, long_description, company_url);
      })
      .catch((error) => {
        window.alert(error.message);
      });
  }

  SetSupplierData(user: any, contact_name: string, company_name: string, address: any, phone_number: string, isSupplier: boolean,
    image_file: any, brief_description: string, long_description: string, company_url: string) {

    //initiate user reference
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    
    //create fire storage image path
    const image_path = `${user.uid}/images/logo.png`

    //const certificationRefs = this.formatSupplierCertifications(this.certificationUploader.certifications)
    let formattedCerts: any = {} //certifications object to be uploaded

    //certUpload returns a promise array
    this.certUpload(user.uid, this.certificationOptions).then((tasksArray) => {
      const urls = tasksArray.map((task) => task.ref.getDownloadURL()) //resolve all upload tasks and assign promise of string[] to urls
      Promise.all(urls).then((result) => { //wait till urls promise resolves

        var counter = 0 //set up counter

        for (const [key, value] of Object.entries(this.certificationOptions)) { //fill certifications with cert names mapped to download urls
          formattedCerts[key] = result[counter]
          counter++
        }

        let level3Categories = Object.values(this.servicePickerOptions).map((category: any) => {
          return category.level3
        })
    
        this.afStorage.upload(image_path, image_file).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((imageurl) => {
    
              const supplierData: Supplier = {
                uid: user.uid,
                email: user.email,
                displayName: contact_name,
                photoURL: "null",
                emailVerified: user.emailVerified,
                contact_name: contact_name,
                company_name: company_name,
                phone_number: phone_number,
                address: address,
                isSupplier: isSupplier,
                image_file: imageurl,
                brief_description: brief_description,
                long_description: long_description,
                company_url: company_url,
                categories: this.servicePickerOptions,
                certifications: formattedCerts,
                level3_categories: level3Categories,
                unread_messages: 0
              };
    
              userRef.set(supplierData, {
                merge: true,
              });

              console.log("user data ", JSON.stringify(supplierData))
              localStorage.setItem('userData', JSON.stringify(supplierData))
            })
    
          })
      })
    })
  }

  async certUpload(uid: any, data: any): Promise<firebase.default.storage.UploadTaskSnapshot[]> {

      const promises: AngularFireUploadTask[] = [];

      for (const [fileName, file] of Object.entries(data)) {
        if (file) {

          const uploadTask = this.afStorage.ref(`${uid}/certifications/${fileName}`).put(file)
          promises.push(uploadTask)
        }
      }

      return Promise.all(promises)
  }

  getUser (uid: any): Promise<firebase.default.firestore.DocumentSnapshot<unknown>> {
    
    return this.afs.collection("users").doc(uid).ref.get()
  }

  updateUser (updateObject: any) {
    let uid = JSON.parse(localStorage.getItem("user")!)["uid"]

    this.afs.collection("users").doc(uid).ref.update(updateObject)
  }

  updateLogo (uid: any, image_file: any) {
    const image_path = `${uid}/images/logo.png`
    const imageRef = ref(this.storage, image_path)

    this.afStorage.upload(image_path, image_file)
  }

  initialiseChat (senderId: string, receiverId: string, sentMessage: any, sender: string, subject: string) {
    const message: Message = {
      message: sentMessage,
      sender: sender,
      senderId: senderId,
      receiverId: receiverId,
      subject: subject,
      timestamp: serverTimestamp(),
      edited: false,
      participants: [senderId, receiverId]
    }

    //Check to see if a chat already exists with that user
    this.afs.collection('users').doc(senderId).collection("chat_rooms").ref.where("user", "==", receiverId).get().then(data => {

      const chat = data.docs.map(doc => doc.data())[0]

      //If a chat already exists add message to that chat
      if (chat) {
        const chatid = chat["chat_id"]
        console.log(chatid, " exists already. Adding message to chat")

        this.afs.collection("chat_rooms").doc(chatid).collection("messages").add(message)
          .catch((error) => {
            console.log(error)
          })
      }
      //If a chat does not exist create a new one
      else {
        console.log("initialising new chat")

        const chatroomData: Chat = {
          receiverId: receiverId,
          senderId: senderId
        }

        const chatRef = this.afs.collection("chat_rooms")
  
        chatRef.add(chatroomData).then(doc => {
          this.afs.collection("chat_rooms").doc(doc.id).collection("messages").add(message)
          .catch((error) => {
            console.log(error)
          })
        })
      }
    })
  }

  sendMessage (senderId: string, receiverId: string, sentMessage: any, sender: string, subject: string, chatid: string) {
    const message: Message = {
      message: sentMessage,
      sender: sender,
      senderId: senderId,
      receiverId: receiverId,
      subject: subject,
      timestamp: serverTimestamp(),
      edited: false,
      participants: [senderId, receiverId]
    }

    this.afs.collection("chat_rooms").doc(chatid).collection("messages").add(message)
          .catch((error) => {
            console.log(error)
          })
  }

  updateMessage (chatid: string, messageid: string, newMessage: string) {
    const messageRef = this.afs.collection("chat_rooms").doc(chatid).collection("messages").doc(messageid)
    messageRef.update({message: newMessage, edited: true})
  }

  getMessages (chatid: string): Observable<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {
    //receive all messages
    return this.afs.collection("chat_rooms").doc(chatid).collection("messages").get()
  }

  getAllChatRooms (uid: any): Observable<firebase.default.firestore.QuerySnapshot<firebase.default.firestore.DocumentData>> {
    return this.afs.collection("users").doc(uid).collection("chat_rooms").get()
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
    });
  }

  getLogoFromStorage (uid: any): any {
    const storageRef = this.afStorage.storage.ref().child(`${uid}/images/logo.png`)
    return storageRef.getDownloadURL()
  }

  getCertification (refString: string): Promise<Blob> {
    const storageRef = this.afStorage.storage.ref().child(refString)
    return getBlob(storageRef)
  }

  async updateCertifications(uid: any) {

    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${uid}`
    );

    const storageRef = this.afStorage.ref(`${uid}/certifications`)
    storageRef.listAll().subscribe((listResults) => {
      listResults.items.forEach((item) => {
        item.delete();
      })
    })

    let formattedCerts: any = {}

    this.certUpload(uid, this.certificationOptions).then((tasksArray) => {
      const urls = tasksArray.map((task) => task.ref.getDownloadURL()) //resolve all upload tasks and assign promise of string[] to urls
      Promise.all(urls).then((result) => { //wait till urls promise resolves

        var counter = 0 //set up counter

        for (const [key, value] of Object.entries(this.certificationOptions)) { //fill certifications with cert names mapped to download urls
          formattedCerts[key] = result[counter]
          counter++
        }

        console.log(formattedCerts)

        userRef.update({certifications: formattedCerts})

      })
    })
  }

  querySupplierMarket(query: string): any  {
    return this.afs.collection('users').ref.where("level3_categories", "array-contains", query).get()
  }

  markAsRead (chatId: string, messageId: string, readBy: any) {
    console.log(chatId, messageId, readBy)
    const messageRef = this.afs.collection("chat_rooms").doc(chatId).collection("messages").doc(messageId)

    messageRef.update({read_by: readBy})
  }

  updateCategories (uid: string) {
    const userRef = this.afs.collection("users").doc(uid)
    let level3Categories = Object.values(this.servicePickerOptions).map((category: any) => {
      return category.level3
    })

    userRef.update({categories: this.servicePickerOptions})
    userRef.update({level3_categories: level3Categories})
  }
}