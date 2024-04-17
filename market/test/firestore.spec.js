const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');

const { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');

const { beforeEach } = require('mocha');
const { readFileSync, createWriteStream } = require('fs');
const http = require("http");

let testEnv;

before(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "cybermarket-2fd55",
        firestore: {
            rules: readFileSync("firestore.rules", "utf8"),
        }
    });
});

beforeEach(async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/exampleuser'), {
        uid: "exampleuser",
        email: "quandingle@example.com",
        displayName: "Quandale Dingle",
        photoURL: "../../assets/placeholder.png",
        emailVerified: false,
        first_name: "Quandale",
        last_name: "Dingle",
        address: {
            street_name: "Dinglestreet",
            building_name: "Quandome",
            street_number: "123",
            city_name: "Quantopia",
            country_name: "Quandalia",
            post_code: "P45 LL2"
        },
        phone_number: "00000 000000",
        company_name: "Doogle",
        isSupplier: false,
        unread_messages: 0,
        image_file: "placeholder.png",
    });
  })

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/nefarious'), {
      uid: "nefarious",
      email: "nefarious@example.com",
      displayName: "Nefarious Dingle",
      photoURL: "../../assets/placeholder.png",
      emailVerified: false,
      first_name: "Nefarious",
      last_name: "Dingle",
      address: {
          street_name: "Nefariousstreet",
          building_name: "Neridom",
          street_number: "123",
          city_name: "Nefarious City",
          country_name: "Nefarious Country",
          post_code: "P45 LL2"
      },
      phone_number: "00000 000000",
      company_name: "Noodle",
      isSupplier: false,
      unread_messages: 0,
      image_file: "placeholder.png",
  });
  })

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'users/examplesupplier'), {
      uid: "examplesupplier",
      email: "supplier@email.com",
      displayName: "John Doe",
      photoURL: "downloadUrl",
      emailVerified: false,
      contact_name: "John Doe",
      address: {
        street_name: "Supplier Street",
        building_name: "Supplier Dome",
        street_number: "123",
        city_name: "Supplier City",
        country_name: "Supplier Country",
        post_code: "P45 LL2"
      },
      phone_number: "0800 001066",
      company_name: "Best Company",
      isSupplier: true,
      image_file: "downloadUrl",
      brief_description: "I am a supplier doing supplier things",
      long_description: "Wowee it sure is supplying time",
      company_url: "www.example.com",
      categories: {
        cat_0: {
          level1: "level1",
          level2: "level2",
          level3: "level3"
        }
      },
      certifications: [
        {ISO: "downloadUrl"}
      ],
      level3_categories: [
        "level3"
      ],
      unread_messages: 0,
  });
  })
})

after(async () => {
    // Delete all the FirebaseApp instances created during testing.
    // Note: this does not affect or clear any data.
    await testEnv.cleanup()
  
    // Write the coverage report to a file
    const coverageFile = 'firestore-coverage.html';
    const fstream = createWriteStream(coverageFile);
    await new Promise((resolve, reject) => {
      const { host, port } = testEnv.emulators.firestore;
      const quotedHost = host.includes(':') ? `[${host}]` : host;
      http.get(`http://${quotedHost}:${port}/emulator/v1/projects/${testEnv.projectId}:ruleCoverage.html`, (res) => {
        res.pipe(fstream, { end: true });
  
        res.on("end", resolve);
        res.on("error", reject);
      });
    });
  
    console.log(`View firestore rule coverage information at ${coverageFile}\n`);
  });

  describe("User permissions", () => {
    it("Unauthenticated users should not be able to read, write, update or delete from the database", async () => {
        // Setup: Create documents in DB for testing (bypassing Security Rules).
  
        const unauthedDb = testEnv.unauthenticatedContext().firestore();
  
        // Then test security rules by trying to read it using the client SDK.
        await assertFails(getDoc(doc(unauthedDb, 'users/exampleuser')));

        await assertFails(setDoc(doc(unauthedDb, "users/unauthed"), {
          uid: "unauthed",
          email: "nefarious@example.com",
          displayName: "Nefarious Dingle",
          photoURL: "null",
          emailVerified: false,
          first_name: "Nefarious",
          last_name: "Dingle",
          address: {
            street_name: "Nefariousstreet",
            building_name: "Neridom",
            street_number: "123",
            city_name: "Nefarious City",
            country_name: "Nefarious Country",
            post_code: "P45 LL2"
          },
          phone_number: "00000 000000",
          company_name: "Noodle",
          isSupplier: false,
          unread_messages: 0,
          image_file: "../../assets/placeholder.png",
        }))

        await assertFails(updateDoc(doc(unauthedDb, "users/exampleuser"), {uid: "hackeduser"}))

        await assertFails(deleteDoc(doc(unauthedDb, "users/exampleuser")))
    });

    it("Authed and verified users should be allowed to read any user data", async () => {

      const authedUser = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertSucceeds(getDoc(doc(authedUser, "users/exampleuser")))
      await assertSucceeds(getDoc(doc(authedUser, "users/examplesupplier")))
    })

    it("Unverified users should only be able to access their own data", async () => {

      const unverifiedAuth = testEnv.authenticatedContext("exampleuser", {email_verified: false}).firestore()

      await assertSucceeds(getDoc(doc(unverifiedAuth, "users/exampleuser")))
      await assertFails(getDoc(doc(unverifiedAuth, "users/examplesupplier")))
    })

    it("Authed users should only be allowed to create accounts with their ID", async () => {
      
      const authedAttacker = testEnv.authenticatedContext("exampleAttacker").firestore()

      await assertFails(setDoc(doc(authedAttacker, "users/exampleVictim"), {
        uid: "authedAttacker",
        email: "nefarious@example.com",
        displayName: "Nefarious Dingle",
        photoURL: "null",
        emailVerified: false,
        first_name: "Nefarious",
        last_name: "Dingle",
        address: {
          street_name: "Nefariousstreet",
          building_name: "Neridom",
          street_number: "123",
          city_name: "Nefarious City",
          country_name: "Nefarious Country",
          post_code: "P45 LL2"
        },
        phone_number: "00000 000000",
        company_name: "Noodle",
        isSupplier: false,
        unread_messages: 0,
        image_file: "../../assets/placeholder.png",
      }))
    })

    it("Authed users should be able to update and delete their own data", async () => {
      const authed = testEnv.authenticatedContext("exampleuser").firestore()

      await assertSucceeds(updateDoc(doc(authed, "users/exampleuser"), {displayName: "userexample"}))
      await assertSucceeds(deleteDoc(doc(authed, "users/exampleuser")))
    })

    it("Authed users should not be able to update and delete other user's data", async () => {
      const authed = testEnv.authenticatedContext("exampleuser").firestore()

      await assertFails(updateDoc(doc(authed, "users/examplesupplier"), {displayName: "userexample"}))
      await assertFails(deleteDoc(doc(authed, "users/examplesupplier")))
    })

    it("Authed users should be required to fill in the correct fields to create a user doc", async () => {
      const authed = testEnv.authenticatedContext("examplesignup").firestore()

      await assertFails(setDoc(doc(authed, "users/examplesignup"), {notCorrectFields: "example"}))
    })

    it("Authed suppliers need to be able to signup with extra fields that aren't required", async () => {
      const authed = testEnv.authenticatedContext("examplesuppliersignup").firestore()

      await assertSucceeds(setDoc(doc(authed, 'users/examplesuppliersignup'), {
        uid: "examplesuppliersignup",
        email: "supplier@email.com",
        displayName: "John Doe",
        photoURL: "downloadUrl",
        emailVerified: false,
        contact_name: "John Doe",
        address: {
          street_name: "Supplier Street",
          building_name: "Supplier Dome",
          street_number: "123",
          city_name: "Supplier City",
          country_name: "Supplier Country",
          post_code: "P45 LL2"
        },
        phone_number: "0800 001066",
        company_name: "Best Company",
        isSupplier: true,
        image_file: "downloadUrl",
        brief_description: "I am a supplier doing supplier things",
        long_description: "Wowee it sure is supplying time",
        company_url: "www.example.com",
        categories: {
          cat_0: {
            level1: "level1",
            level2: "level2",
            level3: "level3"
          }
        },
        certifications:
          {ISO: "downloadUrl"},
        level3_categories: [
          "level3"
        ],
        unread_messages: 0,
      }))
    })

    it("The user fields need has the correct data type", async () => {
      const authed = testEnv.authenticatedContext("examplesignup").firestore()

      await assertFails(setDoc(doc(authed, "users/examplesignup"), {
        uid: "examplesignup",
        email: 3728,
        displayName: "Nefarious Dingle",
        photoURL: "null",
        emailVerified: false,
        first_name: "Nefarious",
        last_name: "Dingle",
        address: {
          street_name: "Nefariousstreet",
          building_name: "Neridom",
          street_number: "123",
          city_name: "Nefarious City",
          country_name: "Nefarious Country",
          post_code: "P45 LL2"
        },
        phone_number: "00000 000000",
        company_name: "Noodle",
        isSupplier: false,
        unread_messages: 0,
        image_file: "../../assets/placeholder.png",
      }))
    })

    it("The supplier fields need has the correct data type", async () => {
      const authed = testEnv.authenticatedContext("examplesignup").firestore()

      await assertFails(setDoc(doc(authed, "users/examplesignup"), {
        uid: "examplesignup",
        email: "supplier@email.com",
        displayName: "John Doe",
        photoURL: 8934769,
        emailVerified: false,
        contact_name: "John Doe",
        address: {
          street_name: "Supplier Street",
          building_name: "Supplier Dome",
          street_number: "123",
          city_name: "Supplier City",
          country_name: "Supplier Country",
          post_code: "P45 LL2"
        },
        phone_number: "0800 001066",
        company_name: "Best Company",
        isSupplier: true,
        image_file: "downloadUrl",
        brief_description: "I am a supplier doing supplier things",
        long_description: "Wowee it sure is supplying time",
        company_url: "www.example.com",
        categories: {
          cat_0: {
            level1: "level1",
            level2: "level2",
            level3: "level3"
          }
        },
        certifications: [
          {ISO: "downloadUrl"}
        ],
        level3_categories: [
          "level3"
        ],
        unread_messages: 0,
      }))
    })
  });

  describe("Chat permissions", () => {
    it("Authed and verified users should be able to create chat rooms and messages", async () => {

      const authed = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertSucceeds(setDoc(doc(authed, "chat_rooms/goodChat"), {senderId: "exampleuser", receiverId: "examplesupplier"}))
      await assertSucceeds(setDoc(doc(authed, "chat_rooms/goodChat/messages/goodMessage"), {
        message: "hello there",
        sender: "Quandale Dingle",
        senderId: "exampleuser",
        receiverId: "examplesupplier",
        subject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))

      await new Promise(resolve => setTimeout(resolve, 3000))
    })

    it("Users must create chat rooms with the correct fields and field types", async () => {
      const authed = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(setDoc(doc(authed, "chat_rooms/goodChat"), {senderI: "exampleuser", receiverI: "examplesupplier"}))
      await assertFails(setDoc(doc(authed, "chat_rooms/goodChat"), {senderId: 4, receiverId: "examplesupplier"}))
    })

    it("Non-verified users should not be able to create chat rooms and send messages", async () => {
      const authed = testEnv.authenticatedContext("exampleunverified", {email_verified: false}).firestore()

      await assertFails(setDoc(doc(authed, "chat_rooms/badChat"), {senderId: "exampleunverified", receiverId: "examplesupplier"}))
      await assertFails(setDoc(doc(authed, "chat_rooms/badChat/messages/badMessage"), {
        message: "hello there",
        sender: "Quandale Dingle",
        senderId: "exampleunverified",
        receiverId: "examplesupplier",
        subject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))
    })

    it("Only participants of a chat_rooms should be able to read that chat room and the messages within that chat", async () => {
      const participant1 = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertSucceeds(getDoc(doc(participant1, "chat_rooms/goodChat")))
      await assertSucceeds(getDoc(doc(participant1, "chat_rooms/goodChat/messages/goodMessage")))

      const participant2 = testEnv.authenticatedContext("examplesupplier", {email_verified: true}).firestore()

      await assertSucceeds(getDoc(doc(participant2, "chat_rooms/goodChat")))
      await assertSucceeds(getDoc(doc(participant2, "chat_rooms/goodChat/messages/goodMessage")))

      const nonparticipant = testEnv.authenticatedContext("nefarious", {email_verified: true}).firestore()

      await assertFails(getDoc(doc(nonparticipant, "chat_rooms/goodChat")))
      await assertFails(getDoc(doc(nonparticipant, "chat_rooms/goodChat/messages/goodMessage")))
    })

    it("Users should not be able to delete chat rooms or messages", async () => {
      const participant = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(deleteDoc(doc(participant, "chat_rooms/goodChat")))
      await assertFails(deleteDoc(doc(participant, "chat_rooms/goodChat/messages/goodMessage")))
    })

    it("Users should only be able to update their own messages and not update the chat room", async () => {
      const sender = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(updateDoc(doc(sender, "chat_rooms/goodChat"), {senderId: "nefarious"}))
      await assertSucceeds(updateDoc(doc(sender, "chat_rooms/goodChat/messages/goodMessage"), {message: "updated"}))

      const receiver = testEnv.authenticatedContext("exampleUser", {email_verified: true}).firestore()

      await assertFails(updateDoc(doc(receiver, "chat_rooms/goodChat"), {senderId: "nefarious"}))
      await assertFails(updateDoc(doc(receiver, "chat_rooms/goodChat/messages/goodMessage"), {message: "updated"}))
    })

    it("Users should only be allowed to read their own chat rooms subcollection", async () => {
      const user = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertSucceeds(getDoc(doc(user, "users/exampleuser/chat_rooms/goodChat")))

      const baduser = testEnv.authenticatedContext("nefarious", {email_verified: true}).firestore()

      await assertFails(getDoc(doc(baduser, "users/exampleuser/chat_rooms/goodChat")))
    })

    it("Users should have to fill out the correct fields to send a message", async () => {
      const user = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(setDoc(doc(user, "chat_rooms/goodChat/messages/anotherMessage"), {
        message: "hello there",
        sender: "Quandale Dingle",
        senderId: "exampleuser",
        receiverId: "examplesupplier",
        badsubject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))
    })

    it("Users should have to fill out the correct field types to send a message", async () => {
      const user = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(setDoc(doc(user, "chat_rooms/goodChat/messages/anotherMessage"), {
        message: 1,
        sender: "Quandale Dingle",
        senderId: "exampleuser",
        receiverId: "examplesupplier",
        subject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))
    })

    it("Users should not be allowed to update, delete, write or create under their or other's chat room subcollections", async () => {
      const user = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(setDoc(doc(user, "users/exampleuser/chat_rooms/newChat"), {chat: "chatting"}))
      await assertFails(updateDoc(doc(user, "users/exampleuser/chat_rooms/goodChat"), {user: "nefarious"}))
      await assertFails(deleteDoc(doc(user, "users/exampleuser/chat_rooms/goodChat")))

      await assertFails(setDoc(doc(user, "users/examplesupplier/chat_rooms/newChat"), {chat: "chatting"}))
      await assertFails(updateDoc(doc(user, "users/examplesupplier/chat_rooms/goodChat"), {user: "nefarious"}))
      await assertFails(deleteDoc(doc(user, "users/examplesupplier/chat_rooms/goodChat")))
    })

    it("Users can only create chats and rooms where they are the sender", async () => {
      const user = testEnv.authenticatedContext("exampleuser", {email_verified: true}).firestore()

      await assertFails(setDoc(doc(user, "chat_rooms/badChat"), {senderId: "examplevictim", supplierId: "exampleSupplier"}))
      await assertFails(setDoc(doc(user, "chat_rooms/goodChat/messages/newMessage"), {
        message: "hello there",
        sender: "Quandale Dingle",
        senderId: "examplevictim",
        receiverId: "examplesupplier",
        subject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))
    })

    it("Unauthed users should not be able to interact with the chat system", async () => {
      const unauthed = testEnv.unauthenticatedContext().firestore()

      await assertFails(setDoc(doc(unauthed, "chat_rooms/badChat"), {senderId: "unauthed", receiverId: "examplesupplier"}))
      await assertFails(setDoc(doc(unauthed, "chat_rooms/badChat/messages/badMessage"), {
        message: "hello there",
        sender: "Quandale Dingle",
        senderId: "unauthed",
        receiverId: "examplesupplier",
        subject: "business",
        timestamp: serverTimestamp(),
        edited: false,
        participants: ["exampleuser", "examplesupplier"]
      }))

      await assertFails(updateDoc(doc(unauthed, "chat_rooms/goodChat"), {senderId: "unauthed", receiverId: "examplesupplier"}))
      await assertFails(updateDoc(doc(unauthed, "chat_rooms/goodChat/messages/goodMessage"), {message: "what how did this happen"}))

      await assertFails(deleteDoc(doc(unauthed, "chat_rooms/goodChat")))
      await assertFails(deleteDoc(doc(unauthed, "chat_rooms/goodChat/messages/goodMessage")))

      await assertFails(getDoc(doc(unauthed, "chat_rooms/goodChat")))
      await assertFails(getDoc(doc(unauthed, "chat_rooms/goodChat/messages/goodMessage")))
    })

  });




