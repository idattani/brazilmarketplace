const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment
} = require('@firebase/rules-unit-testing');

const { readFileSync, createWriteStream } = require('fs');
const http = require("http");

let testEnv;
let image;
let pdf;
let wrongfileformat;

before(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: "cybermarket-2fd55",
        storage: {
            rules: readFileSync("./storage.rules", "utf8"),
        }
    })

    image = readFileSync('./test/testuploads/profile.png')
    pdf = readFileSync('./test/testuploads/example.pdf')
    wrongfileformat = readFileSync('./test/testuploads/badfile.txt')

})

after(async () => {
    // Delete all the FirebaseApp instances created during testing.
    // Note: this does not affect or clear any data.
    await testEnv.cleanup()
})

describe("Storage Permissions", () => {
    it("Users should only be allowed to upload files in certifications and images folders they own", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser").storage()

        await assertSucceeds(storageUser.ref("exampleuser/images/image").put(image, { contentType: 'image/png' }))
        await assertFails(storageUser.ref("examplevictim/images/image").put(image, { contentType: 'image/png' }))
        await assertSucceeds(storageUser.ref("exampleuser/certifications/cert").put(pdf, { contentType: 'application/pdf' }))
        await assertFails(storageUser.ref("examplevictim/certifications/cert").put(pdf, { contentType: 'application/pdf' }))
    })

    it("Users should have to upload files in the correct formats for their respective folders", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser").storage()

        await assertFails(storageUser.ref("exampleuser/images/image").put(wrongfileformat, { contentType: 'text/plain' }))
        await assertFails(storageUser.ref("exampleuser/certifications/cert").put(wrongfileformat, { contentType: 'text/plain' }))
    })

    it("Users should not be able to upload outside of their images and certifications folders", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser").storage()

        await assertFails(storageUser.ref("exampleuser/badfile").put(image, { contentType: 'image/png' }))
        await assertFails(storageUser.ref("badfile").put(image, { contentType: 'image/png' }))
    })

    it("Users should be allowed to read any file if they are authenticated and no files if unauthenticated", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser", {email_verified: true}).storage()

        await assertSucceeds(storageUser.ref("exampleuser/images/image").getDownloadURL())

        const storageReader = testEnv.authenticatedContext("examplereader", {email_verified: true}).storage()

        await assertSucceeds(storageReader.ref("exampleuser/images/image").getDownloadURL())

        const storageUnverified = testEnv.unauthenticatedContext().storage()

        await assertFails(storageUnverified.ref("exampleuser/images/image").getDownloadURL())
    })

    it("Users should not be able to upload images larger than 5MB", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser", {email_verified: true}).storage()
        const largeImage = readFileSync('./test/testuploads/largeimage.png')
        
        await assertFails(storageUser.ref("exampleuser/images/image").put(largeImage, { contentType: 'image/png' }))
    })

    it("Users should not be able to upload pdfs larger than 10MB", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser", {email_verified: true}).storage()
        const largePdf = readFileSync('./test/testuploads/largepdf.pdf')

        await assertFails(storageUser.ref("exampleuser/images/image").put(largePdf, { contentType: 'application/pdf' }))
    })

    it("Users should not be able to delete other user's files", async () => {
        const storageAttacker = testEnv.authenticatedContext("exampleattacker", {email_verified: true}).storage()

        await assertFails(storageAttacker.ref("exampleuser/images/image").delete())
        await assertFails(storageAttacker.ref("exampleuser/certifications/cert").delete())
    })

    it("Users should be able to delete their own files", async () => {
        const storageUser = testEnv.authenticatedContext("exampleuser", {email_verified: true}).storage()

        await assertSucceeds(storageUser.ref("exampleuser/images/image").delete())
        await assertSucceeds(storageUser.ref("exampleuser/certifications/cert").delete())
    })
})



