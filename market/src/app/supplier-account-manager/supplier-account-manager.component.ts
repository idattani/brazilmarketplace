import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-supplier-account-manager',
  templateUrl: './supplier-account-manager.component.html',
  styleUrls: ['./supplier-account-manager.component.css']
})
export class SupplierAccountManagerComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem("userData")!)
    if (user) {
      this.conname = user.contact_name
      this.cname = user.company_name
      this.location = user.address
      this.phone_number = user.phone_number
      this.email = user.email
      this.brief_description = user.brief_description
      this.long_description = user.long_description
      this.company_url = user.company_url
    }

    this.authService.getLogoFromStorage(this.uid).then((url: any) =>{
      this.image_url = url
    })
  }

  uid = JSON.parse(localStorage.getItem('user')!).uid;
  conname = "contact_name"
  cname = "company_name"

  location = {
    street_name: "streename",
    street_number: "streenum",
    building_name: "buildingname",
    city_name: "city_name",
    country_name: "country_name",
    post_code: "post_code"
  }

  phone_number = "phone_num"
  email = "email"
  email_password = ""

  brief_description = "brief_description"
  long_description = "long_description"

  company_url = "company_url"

  image_url: string | ArrayBuffer | null ="../../assets/placeholder.png"
  image_file!: string;

  onFileChanged(event: any) {
    const files = event.target.files;
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
        this.image_url= reader.result; 
        this.image_file = files[0]
    }
  }

  trackBriefCharacterCount () {
    return this.brief_description.length + "/150"
  }

  

}
