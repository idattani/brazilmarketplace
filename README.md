# marketplace

## Configuring firebase environment
Before deployment a couple extra steps will need to be take to enable the full functionality of the application:

1. Enable storage
2. Enable Authentication with email provider
3. Enable Hosting
4. Enable Firestore Database
5. Create the firestore indexes

### Firestore Indexes
The index needs to have the following properties:

- Collection Id = messages
- fields
  - participants = Arrays
  - timestamp = Ascending
  - \__name__ = Ascending
- Collection Scope = Collection

## Developing Locally
To build and test the application locally you will have to configure firebase first. Then follow these steps:

1. To install necessary packages run the following in the root project directory, market project directory and functions directory:


       npm install

2. Then start the emulators on localhost:4000 with


        firebase emulators:start

3. Finally run the webapp


        ng serve

## Firebase Deployment
If you wish to transfer this application to another firebase instance you must do the following

1. Register the application and retrieve the necessary config to put into environment.ts
2. Build the project with


        ng build --configuration production

3. run npm install in both root project directory and functions directory
4. run


        firebase use <project_id>

5. then to deploy run


        firebase deploy

Firebase deploy should deploy all necessary components. If any are not deployed or you want to deploy only one component you can deploy them with:

    firebase deploy --only <component>

Note that this will not deploy typesense. The ability to search through providers was removed in an earlier version. Though typesense has been experimented with for full text search and is intended to come later.

## Running unit tests

To test security rules for both firestore and fire storage you can run unit tests using the emulator. Go to the root project directory and run the below commands to run the firestore test and storage tests respectively.

    firebase emulators:exec "npm run test-firestore"
    firebase emulators:exec --only storage "npm run test-storage"

If you wish to edit these tests you can find them under market/test/ in firestore.spec.js and storage.spec.js.

## Project Structure

To understand the project structure you should be familiar with angularJS. Beyond that basic understanding the structure is as follows:

### Pages

Each folder under src/app represents a single web page with the exception of the shared folder. You can find the styling for these webpages under the .css file and the logic in the typescript file.

### Services

Under src/app/shared/services there are files that handle all firebase calls. auth.service.ts contains the vast majority of firebase logic with other .ts files just exporting object schemas.

### Guards

The auth guard can be found in src/app/shared/guard/auth.guard.ts. This file is responsible for unverified or unauthenticated redirects.

## Translation

Translation for the project is done with @ngx-translate. You do not need to import the TranslateService for every component however you must pass the translate service to a constructor if you wish to use it through typescript.

If you wish to add translations you must add the corresponding english and portuguese to src/app/assets/en.json and src/app/assets/pt.json.

You can then use the translate pipe from the TranslateService in the template of your code like so:

    <p>{{ 'key.subKey' | translate }}</p>

This will display the text from whichever language json file you have selected.
