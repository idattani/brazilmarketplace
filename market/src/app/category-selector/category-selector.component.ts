import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { transition, trigger, state, style, animate, stagger, query } from '@angular/animations';
import { AuthService } from '../shared/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-category-selector',
  templateUrl: './category-selector.component.html',
  styleUrls: ['./category-selector.component.css'],
  animations: [
    trigger('entrance', [
      transition('void => *', [
        query(":enter", style({opacity: 0}), {optional: true}),
        query(":enter", stagger("150ms", [
          style({opacity: 0, top: "250px"}),
          animate("500ms ease")
        ]), {optional: true})
      ])
    ])
  ]
})

export class CategorySelectorComponent implements OnInit {

  constructor(private router: Router, public authService: AuthService, public translate: TranslateService) { }

  ngOnInit(): void {
    this.category_title = "Level 1"
    /*this.authService.printCurrentUser().then((user) => {
      console.log(user)
    })
    .catch((error) => {
      console.log(error)
    })*/
  }

  ngAfterContentChecked(): void {
    if (this.router.url != "/category/tier1")
      this.category_title = "categories." + decodeURIComponent(decodeURIComponent(this.router.url.split("/").at(-1)!))
  }

  category_title = "Level 1"
  category_description = "*Enter description here*"

  categories: any = {
    Identify: {
      "Asset Management": [
        "Software & Security Lifecycle Management",
        "IT Management Service"
      ],
      "Business Environment": [
        "Business Impact Analysis"
      ],
      "Governance and Risk Management": [
        "Security Certification",
        "Governance & Risk Compliance"
      ],
      "Risk Assessment": [
        "Risk Management and Solution Services"
      ],
      "Risk Management Strategy": [
        "Risk Management Strategy Development & Consulting"
      ],
      "Supply Chain and Risk Management": [
        "Supply Chain Risk Monitoring Solutions & Services"
      ]
    },
    Protect: {
      "Identity Management & Access Control": [
        "Access Management",
        "Authentication",
        "Authorization",
        "Identity Management"
      ],
      "Awareness and Training": [
        "Awareness Trainings",
        "Cyber Ranges"
      ],
      "Data Security": [
        "PKI / Digital Certificates",
        "Data Leak Prevention",
        "Encryption",
        "Cloud Access Security Brokers",
        "Hardware Security Modules",
        "Digital Signatures"
      ],
      "Information Protection Processes and Procedures": [
        "Static Application Security Testing",
        "Application Security"
      ],
      "Maintenance": [
        "Patch Management",
        "Vulnerability Management",
        "Penetration Testing / Red Teaming"
      ],
      "Protective Technology": [
        "Wireless Security",
        "Remote Access / VPN",
        "IoT Security",
        "PC/Mobile/End Point Security",
        "Mobile Security / Device Management",
        "Sandboxing",
        "Content Filtering and Monitoring",
        "Firewalls / NextGen Firewalls",
        "Unified Threat Management",
        "Anti Spam",
        "Anti Virus/Worm/Malware",
        "Backup / Storage Security"
      ]
    },
    Detect: {
      "Anomalies and Events": [
        "Fraud Management",
        "Intrusion Detection"
      ],
      "Security Continuous Monitoring": [
        "SIEM / Event Correlation Solutions",
        "Cyber Threat Intelligence",
        "Security Operations Center"
      ],
      "Detection Processes": [
        "Underground/Darkweb Investigation",
        "Honeypots / Cybertraps",
        "Social Media & Brand Monitoring"
      ],
    },
    Respond: {
      "Response Planning": [
        "Incident Management",
        "Crisis Management"
      ],
      "Communications": [
        "Crisis Communication"
      ],
      "Analysis": [
        "Fraud Investigation",
        "Forensics"
      ],
      "Mitigation": [
        "Cyber Security Insurance",
        "DDoS Protection",
        "Data Recovery",
        "Incident Response Services",
        "Takedown Services"
      ],
      "Improvements": [
        "Containment Support"
      ]
    },
    Recover: {
      "Recovery Planning": [
        "System Recovery",
        "Business Continuity / Recovery Planning"
      ],
      "Improvements": [
        "Post Incident Reviews & Consulting"
      ],
      "Communications": [
        "Communications Coaching & Consulting"
      ]
    }
  }

  checkGridOffset (category_key: any) {
    let cat_list = this.returnCategoryList()
    let cat_list_length = cat_list.length

    let tile_remainder = cat_list_length % 3

    if (cat_list_length > 3) {
      switch (tile_remainder) {
        case 1:
          let last_element = cat_list.slice(-1)
  
          if (last_element.includes(category_key)) {
            return "remainder-one-offset"
          }
          else {
            return "normal-offset"
          }
       
        case 2:
          let last_two_elements = cat_list.slice(-2)
  
          if (last_two_elements.includes(category_key)) {
            return "remainder-two-offset"
          }
          else {
            return "normal-offset"
          }
  
        default:
          return "normal-offset"
      }
    }
    else {
      switch (tile_remainder) {
        case 1:
          return "lone-offset"

        case 2:
          return "lone-pair-offset"

        default:
          return "normal-offset"
      }
    }
  }

  returnCategoryList () {
    let url = this.router.url.split("/")
    
    switch (url.length) {
      case 3: 
        return Object.keys(this.categories)

      case 4:
        let current_key = decodeURIComponent(decodeURIComponent(url[3]))
        return Object.keys(this.categories[current_key])

      case 5:
        let previous_key = decodeURIComponent(decodeURIComponent(url[3]))
        let next_key = decodeURIComponent(decodeURIComponent(url[4]))

        return this.categories[previous_key][next_key]

      default:
        return Object.keys(this.categories)
    }
    
  }

  getNewRoute (category: any) {
    let url = this.router.url
    let should_market_be_accessed = (url.split("/").length == 5)

    if (should_market_be_accessed) {
      let new_url = "/market/" + encodeURIComponent(category)
      return new_url
    }
    else {
      let new_url = url + '/' + encodeURIComponent(category)
      return new_url
    }

  }

  findTileImage (category: any) {
      return "../../assets/icons/" + (category.toLowerCase()).replace(/ /g,"_").replace(/\//g,"-") + ".svg"
  }

  tile_colors = [
    "darkorange",
    "deepskyblue",
    "limegreen",
    "cornflowerblue",
    "darkturquoise",
    "crimson",
    "orchid",
    "greenyellow",
    "steelblue",
    "hotpink",
    "goldenrod",
    "coral"
  ]

  getTileColor (category: any) {
    let color = this.tile_colors[this.returnCategoryList().indexOf(category)]
    return color
  }

  initTileAnimDuration = 0.5

  getAnimationDuration () {
    var animDuration = this.initTileAnimDuration + "s"
    this.initTileAnimDuration += 0.1
    return animDuration
  }

  tile_descriptions: any = {
    Identify: "Increase your business understanding of cybersecurity risk to systems, people, assets and data.",
    Protect: "Establish appropriate safeguards and improve your ability to contain the impact of a potential cybersecurity event.",
    Detect: "Be prepared for the timely discovery of a cybersecurity event.",
    Respond: "Be prepared to take action in case you detect a cybersecurity incident. Increase your ability to contact the impact of a cyber event.",
    Recover: "Develop the ability to be resilient and restore capabilities or services impaired due to a cybersecurity incident. "
  }

  returnTileDescription (category: string) {
    const description = this.tile_descriptions[category]

    if (description) {
      return this.translate.instant("categories." + description)
    }
    else{
      return ""
    }
  }

  long_tile_descriptions: any = {
    Identify: "This function assists in developing an organizational understanding to managing cybersecurity risk to systems, people, assets, data, and capabilities. Understanding the business context, the resources that support critical functions, and the related cybersecurity risks enables an organization to focus and prioritize its efforts, consistent with its risk management strategy and business needs.",
    Protect: "This function outlines appropriate safeguards to ensure delivery of critical infrastructure services. The Protect Function supports the ability to limit or contain the impact of a potential cybersecurity event.",
    Detect: "This function defines the appropriate activities to identify the occurrence of a cybersecurity event. The Detect Function enables timely discovery of cybersecurity events.",
    Respond: "This function includes appropriate activities to take action regarding a detected cybersecurity incident. The Respond Function supports the ability to contain the impact of a potential cybersecurity incident.",
    Recover: "This function identifies appropriate activities to maintain plans for resilience and to restore any capabilities or services that were impaired due to a cybersecurity incident. The Recover Function supports timely recovery to normal operations to reduce the impact from a cybersecurity incident."
  }

  returnPageDescription () {
    let url = this.router.url.split("/")

    switch (url.length) {
      case 3:
        return "Placeholder description for level 1"
      
      case 4:
        return "categories." + this.long_tile_descriptions[url[url.length - 1]]

      case 5:
        return "categories.Choose a category"

      default:
        return "Something went wrong!"
    }
  }
}
