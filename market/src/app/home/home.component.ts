import { Component, OnInit } from '@angular/core';
import { trigger, transition, query, style, stagger, animate} from '@angular/animations'
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('entrance', [
      transition('void => *', [
        query(":enter", style({opacity: 0}), {optional: true}),
        query(":enter", stagger("300ms", [
          style({opacity: 0, top: "50px"}),
          animate(500)
        ]), {optional: true})
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit(): void {
  }



}
