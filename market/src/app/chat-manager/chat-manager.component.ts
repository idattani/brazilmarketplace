import { Component, OnInit } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { AuthService } from '../shared/services/auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { doc, increment, Timestamp } from '@angular/fire/firestore';
import { KeyValue } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-chat-manager',
  templateUrl: './chat-manager.component.html',
  styleUrls: ['./chat-manager.component.css'],
  animations: [trigger('entrance', [
    transition('void => *', [
      query(":enter", style({opacity: 0}), {optional: true}),
      query(":enter", stagger("150ms", [
        style({transform: "translateX(-250px)"}),
        animate("500ms ease")
      ]), {optional: true})
    ])
  ])
]
})
export class ChatManagerComponent implements OnInit {

  chatsCollection!: AngularFirestoreCollection<any>
  chats: Map<string, any> = new Map<string, any>()

  messagesCollection!: AngularFirestoreCollection<any>
  //messages: any[] = []

  constructor(public authService: AuthService, public afs: AngularFirestore, private translate: TranslateService) {   }

  ngOnInit(): void {
    this.uid = JSON.parse(localStorage.getItem("userData")!).uid
    this.sender = JSON.parse(localStorage.getItem("userData")!).displayName

    this.chatsCollection = this.afs.collection('users').doc(this.uid).collection<any>('chat_rooms')
    this.chatsCollection.stateChanges().subscribe(data => {
      const docMap = data.map(data => data.payload.doc.data())

      docMap.forEach((doc) => {

        this.authService.getUser(doc['user']).then((user) => {
          if (user.exists) {
            let user_data: any = user.data()

            if (typeof user_data.displayName === 'string' && typeof user_data.image_file === 'string') {

              let chat_info = {
                name: user_data.displayName,
                image: user_data.image_file,
                user: user_data.uid,
                id: doc['chat_id'],
                unread: doc['unread_messages']
              }
  
              this.chats.set(chat_info.id, chat_info)
            }
          }
        })
      })
    })
  }
  
  //messages: Map<string, any> = new Map<string, any>()
  messages: any[] = []
  
  listenToMessages(chat_id: string, recipientId: string, is_chat_unread: boolean) {
    if (is_chat_unread) {
      const userRef = this.afs.collection("users").doc(this.uid)
      userRef.collection("chat_rooms").doc(chat_id).update({unread_messages: false})
      userRef.update({unread_messages: increment(-1)})
    }

    /*this.messagesCollection = this.afs.collection('chat_rooms').doc(chat_id).collection<any>('messages', ref => ref.orderBy("timestamp", "desc"))
    this.messagesCollection.snapshotChanges().subscribe(data => {
      this.messages = data.map(data => Object.assign({}, data.payload.doc.data(), {id: data.payload.doc.id}))
    })*/

    this.authService.afAuth.currentUser.then((user) => {
      this.afs.collection("chat_rooms").doc(chat_id).collection<any>('messages', ref => ref.where("participants", "array-contains", user!.uid).orderBy("timestamp", "asc")).stateChanges().subscribe((data) => {
        data.forEach(data => {
          //this.messages.set(data.payload.doc.id, Object.assign({}, data.payload.doc.data(), {id: data.payload.doc.id}))
  
          const message = Object.assign({}, data.payload.doc.data(), {id: data.payload.doc.id})
  
          const messageSearch = this.messages.filter(messages => messages.id === message.id)[0]
  
          if (messageSearch) {
            const messageIndex = this.messages.indexOf(messageSearch)
            this.messages[messageIndex] = message
          }
          else {
            this.messages.unshift(message)
          }
        })
      })
    })

    this.currentRecipientId =  recipientId
    this.chatId = chat_id
  }

  uid = ""
  sender = ""
  reply = ""
  subject = ""
  currentRecipientId = ""
  chatId = ""
  editMode = false

  current_message: {id: string, sender: string, senderId: string, timestamp: Timestamp, subject: string, message: string} = {
    id: "-1",
    sender: "",
    senderId: "",
    timestamp: new Timestamp(0, 0),
    subject: "",
    message: "",
  }
  is_message_hidden = true


  loadCurrentMessage (loaded_message: any) {
    this.current_message = loaded_message;
    this.subject = loaded_message.subject
    this.is_message_hidden = false
    this.editMode = false
  }

  getMesssages(chatid: string) {
    this.authService.getMessages(chatid)
  }

  showEditIcon () {
    return (this.current_message.senderId == this.uid)
  }

  convertTimestamp (timestamp: Timestamp) {
    return timestamp.toDate()
  }

  getReplyTitle() {
    if (this.editMode) {
      return this.translate.instant("chat.edit")
    }
    else {
      return this.translate.instant("chat.reply")
    }
  }

  getButtonText () {
    if (this.editMode) {
      return this.translate.instant("chat.edit-button")
    }
    else {
      return this.translate.instant("chat.reply-button")
    }
  }

  toggleEditMode () {
    this.editMode = !this.editMode
    
    if (this.editMode) {
      this.reply = this.current_message.message
    }
    else {
      this.reply = ""
    }
  }

  processMessage () {
    if (this.reply && this.messages.length != 0) {
      if (this.editMode) {
        this.current_message.message = this.reply
        this.authService.updateMessage(this.chatId, this.current_message.id, this.reply)
      }
      else {
        this.authService.sendMessage(this.uid, this.currentRecipientId, this.reply, this.sender, this.subject, this.chatId)
      }
      this.reply = ""
    }
    else {
      window.alert(this.translate.instant("notifications.Please select a chat and fill out the reply box!"))
    }
  }

  deleteMessage () {
    const response = confirm(this.translate.instant("notifications.Are you sure you want to delete this message?"))

    if (response) {
      const delete_message = "***Message was deleted by user***"
      this.current_message.message = delete_message
      this.authService.updateMessage(this.chatId, this.current_message.id, delete_message)
    }
  }

  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0
  }




}
