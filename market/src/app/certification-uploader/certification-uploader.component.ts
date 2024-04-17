import { Component, Injectable, ElementRef, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-certification-uploader',
  templateUrl: './certification-uploader.component.html',
  styleUrls: ['./certification-uploader.component.css']
})

export class CertificationUploaderComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute, private translate: TranslateService) { }

  ngOnInit(): void {
    let url = this.router.url.split("/").at(2)

    if (url == "supplier") {
      let uid = JSON.parse(localStorage.getItem('userData')!).uid
      let certs = JSON.parse(localStorage.getItem('userData')!).certifications

      let temp_certs = this.getCertificationsOfCurrentUser(uid, certs)
      this.certifications = temp_certs
      this.authService.certificationOptions = temp_certs
    }
  }

  @ViewChild('fileInput')
  fileInput!: ElementRef;

  certification_to_be_added = "--Please choose a certification--"
  custom_certification = ""
  file_to_be_uploaded: any | null = null

  certifications: any = {}

  getCertificationsOfCurrentUser (uid: any, certs: any) {
    let temp_certs: any = {}

    for (const [cert_name, cert_ref] of Object.entries(certs)) {
      if (typeof cert_ref === 'string') {

        this.authService.getCertification(`${uid}/certifications/${cert_name}`).then((blob) => {
          let cert_file = new File([blob], cert_name)
          temp_certs[cert_name] = cert_file
        })
      }
    }

    return temp_certs
  }

  addCertification () {

    if (this.certification_to_be_added != "--Please choose a certification--" && this.certification_to_be_added != "Other" && this.file_to_be_uploaded != null) {
      this.certifications[this.certification_to_be_added] = this.file_to_be_uploaded
      this.certification_to_be_added = "--Please choose a certification--"
      this.file_to_be_uploaded = null
      this.fileInput.nativeElement.value = ""
    }
    else if (this.certification_to_be_added == "Other") {
      this.certifications[this.custom_certification] = this.file_to_be_uploaded
      this.certification_to_be_added = "--Please choose a certification--"
      this.custom_certification = ""
      this.file_to_be_uploaded = null
      this.fileInput.nativeElement.value = ""
    }
    else {
      window.alert(this.translate.instant("notifications.Certifications must have a name and uploaded file to be added to the list!"))
    }
    this.authService.certificationOptions = this.certifications
  }

  deleteCertification (certification: any) {
    delete this.certifications[certification]
    this.authService.certificationOptions = this.certifications
  }

  handleFileInput(event: any) {

    let file = event.target.files[0]

    if (file != null) {
      this.file_to_be_uploaded = file
    }
}

getCertFileName (certification_file: any) {
  return certification_file.name
}

  default_certifications: any = [
    "CompTIA Security+",
    "CRISC",
    "CySA+",
    "SSCP",
    "CIPP",
    "CCSP",
    "CHFI",
    "CCNA",
    "CCSK",
    "CGEIT",
    "CCNP",
    "GSEC",
    "ISO 27001",
    "ISO 27005",
    "CREST",
    "CEH",
    "CISM",
    "CASP",
    "GCIH",
    "OSCP"
  ]

}
