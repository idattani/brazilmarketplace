import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { UserSignUpComponent } from './user-sign-up/user-sign-up.component';
import { SupplierSignUpComponent } from './supplier-sign-up/supplier-sign-up.component';
import { CategorySelectorComponent } from './category-selector/category-selector.component';
import { MarketPlaceComponent } from './market-place/market-place.component';
import { ProviderComponent } from './provider/provider.component';
import { UserAccountManagerComponent } from './user-account-manager/user-account-manager.component';
import { SupplierAccountManagerComponent } from './supplier-account-manager/supplier-account-manager.component';
import { ChatManagerComponent } from './chat-manager/chat-manager.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RouterModule } from '@angular/router';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { ServicePickerComponent } from './service-picker/service-picker.component';
import { CustomServicePickerComponent } from './custom-service-picker/custom-service-picker.component';
import { CertificationUploaderComponent } from './certification-uploader/certification-uploader.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { provideStorage,getStorage } from '@angular/fire/storage';

import { AngularFireModule } from '@angular/fire/compat'
import { AngularFireAuthModule } from '@angular/fire/compat/auth'
import { AngularFireStorageModule } from '@angular/fire/compat/storage'
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/compat/firestore'
import { AngularFireDatabaseModule } from '@angular/fire/compat/database'

import { USE_EMULATOR as USE_AUTH_EMULATOR } from '@angular/fire/compat/auth';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { AuthGuard } from './shared/guard/auth.guard';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LanguageComponent } from './language/language.component';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    UserSignUpComponent,
    SupplierSignUpComponent,
    CategorySelectorComponent,
    MarketPlaceComponent,
    ProviderComponent,
    UserAccountManagerComponent,
    SupplierAccountManagerComponent,
    ChatManagerComponent,
    NotFoundComponent,
    NavigationBarComponent,
    ServicePickerComponent,
    CustomServicePickerComponent,
    CertificationUploaderComponent,
    ForgottenPasswordComponent,
    EmailVerificationComponent,
    LanguageComponent
  ],
  imports: [
    HttpClientModule,
    TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
        }
    }),
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'userlogin',
        component: LoginComponent
      },
      {
        path: 'supplierlogin',
        component: LoginComponent
      },
      {
        path: 'usersignup',
        component: UserSignUpComponent
      },
      {
        path: 'suppliersignup',
        component: SupplierSignUpComponent
      },
      {
        path: 'category/tier1/:tier1CategoryName/:tier2CategoryName',
        component: CategorySelectorComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'category/tier1/:tier1CategoryName',
        component: CategorySelectorComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'category/tier1',
        component: CategorySelectorComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'market/:marketCategory',
        component: MarketPlaceComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'market/search/supplier',
        component: MarketPlaceComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'provider/:id',
        component: ProviderComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/user/:id',
        component: UserAccountManagerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/supplier/:id',
        component: SupplierAccountManagerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'account/chat/:userId',
        component: ChatManagerComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'forgottenpassword',
        component: ForgottenPasswordComponent
      },
      {
        path: 'verify-email-address',
        component: EmailVerificationComponent
      },
      {
        path: 'verified-email',
        component: EmailVerificationComponent
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage())
  ],
  providers: [
    {
      provide: SETTINGS,
      useValue: environment.production ? undefined : {
        host: 'localhost:8080',
        ssl: false
      }
    },
    {provide: USE_AUTH_EMULATOR, useValue: environment.production ? undefined : ['http://localhost:9099']},
    ServicePickerComponent,
    CertificationUploaderComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
