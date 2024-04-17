import { trigger, transition, style, query, animate, stagger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-market-place',
  templateUrl: './market-place.component.html',
  styleUrls: ['./market-place.component.css'],
  animations: [trigger('entrance', [
    transition('void => *', [
      query(":enter", style({opacity: 0}), {optional: true}),
      query(":enter", stagger("150ms", [
        style({opacity: 0}),
        animate("500ms ease")
      ]), {optional: true})
    ])
  ])
]
})
export class MarketPlaceComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    
    this.route.queryParams.subscribe((query) => {
      if (query['search']) {
        const headers = new HttpHeaders().set('Access-Control-Allow-Origin', '*')

        if (!environment.production) {
          this.http.get(`${environment.devHost}/searchSuppliers?search=${query['search']}`, {headers}).subscribe(results => {
            this.suppliers = results
          })
        }
        else {
          this.http.get(`${environment.productionHost}/searchSuppliers?search=${query['search']}`, {headers}).subscribe(results => {
            this.suppliers = results
          })
        }
      }
      else {
        this.getSuppliers()
      }
    })                         
  }

  marketName!: string | null;

  nameSetter = this.route.paramMap.subscribe(
    params => {
      let title = decodeURIComponent(params.get('marketCategory')!)

      if (title != "null") {
        this.marketName = title
      }
      else {
        this.marketName = "Searched"
      }
    }
  )

  getSuppliers() {
    this.authService.querySupplierMarket(this.marketName!).then((snapshot:any) => {
      snapshot.forEach((doc:any) => {
        this.suppliers.push(doc.data())
      })
    })
  }

  suppliers: any = []
  filtered_suppliers: any = []
  filtered = false

  getSupplierRoute(supplier_uid: any): any {
    return `/provider/${supplier_uid}`
  }

  getUrl (image_file: any) {
    if (typeof image_file != 'string' || image_file.indexOf("http") != 0) {
      return "../../assets/placeholder.png"
    }
    else {
      return image_file
    }
  }

  supplierListSwitch () {
    return this.filtered ? this.filtered_suppliers : this.suppliers
  }

  regexQuery = ""

  regexFilter () {
    if (this.suppliers) {
      const filterMap = this.suppliers.filter((supplier: any) => JSON.stringify(Object.values(supplier)).toLowerCase().includes(this.regexQuery.toLowerCase()))
      this.filtered_suppliers = filterMap
      this.filtered = true
    }
  }

  certQuery = ""
  certFilter () {
    if (this.suppliers) {
      if (typeof this.suppliers[0].certifications === 'string') {
        const filterMap = this.suppliers.filter((supplier: any) => supplier.certifications.toLowerCase().includes(this.certQuery.toLowerCase()))
        this.filtered_suppliers = filterMap
        this.filtered = true
      }
      else {
        const filterMap = this.suppliers.filter((supplier: any) => JSON.stringify(Object.keys(supplier.certifications)).toLowerCase().includes(this.certQuery.toLowerCase()))
        this.filtered_suppliers = filterMap
        this.filtered = true
      }
    }
  }

  locationQuery = ""
  locationFilter () {
    if (this.suppliers) {
      if (typeof this.suppliers[0].certifications === 'string') {
        const filterMap = this.suppliers.filter((supplier: any) => supplier.address.toLowerCase().includes(this.locationQuery.toLowerCase()))
        this.filtered_suppliers = filterMap
        this.filtered = true
      }
      else {
        const filterMap = this.suppliers.filter((supplier: any) => JSON.stringify(Object.values(supplier.address)).toLowerCase().includes(this.locationQuery.toLowerCase()))
        this.filtered_suppliers = filterMap
        this.filtered = true
      }
    }
  }

  clearFilters () {
    this.filtered = false
  }



}
