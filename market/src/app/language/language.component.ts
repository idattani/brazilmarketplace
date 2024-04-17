import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
 selector: 'app-language',
 templateUrl: './language.component.html',
 styleUrls: ['./language.component.css']
})

export class LanguageComponent implements OnInit {

  ngOnInit(): void {
    console.log(navigator.language)
  }


  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');

    const nativeLang = navigator.language

    if (["pt", "pt-BR", "pt-PT"].includes(nativeLang)) {
      translate.use("pt")
      this.selectedLang = "pt"
    }
  }

  selectedLang = "en"

  changeLanguage(event: any) {
    const lang = event.value

    this.translate.use(lang)
  }
}
