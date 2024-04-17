import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-supplier-sign-up',
  templateUrl: './supplier-sign-up.component.html',
  styleUrls: ['./supplier-sign-up.component.css']
})
export class SupplierSignUpComponent implements OnInit {

  constructor(public authService: AuthService, private translate: TranslateService) { }

  ngOnInit(): void {
  }

  image_url: string | ArrayBuffer | null = "../../assets/placeholder.png"

  conname = ""
  cname = ""

  location = {
    street_name: "",
    building_name: "",
    street_number: "",
    city_name: "",
    country_name: "",
    post_code: ""
  }

  phone_number = ""
  email = ""

  image_file!: string;

  brief_description = ""
  long_description = ""

  company_url = ""

  password = ""
  password_retype = ""

  onFileChanged(event: any) {
    const files = event.target.files;
    console.log(files[0].type)
    console.log(typeof files[0])
    if (files.length === 0)
        return;

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
        window.alert("Only images are supported!")
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(files[0]); 
    reader.onload = (_event) => { 
        this.image_url = reader.result
        this.image_file = files[0]
    }
}

trackBriefCharacterCount () {
  return this.brief_description.length + "/150"
}

signUp () {
  if (this.authService.confirmPasswordRetype(this.password, this.password_retype)) {
    window.alert(this.translate.instant("notifications.Passwords did not match!"))
  }
  else{
    let stringArray = [this.conname, this.brief_description, this.long_description, this.company_url, this.cname, this.phone_number, this.email, this.password, this.password_retype]
    let checkArray = stringArray.concat(Object.values(this.location))

    if (checkArray.includes("") || this.image_file == "../../assets/placeholder.png" || !(this.authService.certificationOptions)) {
      window.alert(this.translate.instant("notifications.Please fill out all fields and upload files where appropriate"))
    }
    else{
      if(this.authService.checkServicePickerUniqueness() && this.authService.checkServicesAreCompleted()) {
        this.authService.signUpSupplier(this.email, this.password, this.conname, this.cname, this.location, this.phone_number, true, this.image_file, this.brief_description, this.long_description, this.company_url)
      }
      else {
        window.alert(this.translate.instant("notifications.Please make sure all categories are unique and contain all three levels"))
      }
    }
  }
}
}

