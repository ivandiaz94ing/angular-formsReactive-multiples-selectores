import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'countries-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  constructor(
    private fb: FormBuilder,
    private countryService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChanges();
    this.onCountryChanges();
  }

  get regions(): Region[] {
    return this.countryService.regions.sort();
  }

  public formulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  onRegionChanges(): void {
    this.formulario
      .get('region')!
      .valueChanges.pipe(
        tap(() => this.formulario.get('country')?.setValue('')),
        tap(() => this.borders=[]),
        switchMap((region) => this.countryService.getCountriesByRegion(region)),
      )
      .subscribe((countries) => {
        this.countriesByRegion = countries.sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });
      });
  }

  onCountryChanges(): void {
    this.formulario.get('country')!.valueChanges.pipe(

        tap(() => this.formulario.get('border')?.setValue('')),
        filter((value: string) => value.length > 0),
        switchMap((alphaCode) => this.countryService.getCountryByAlphaCode(alphaCode) ),

        switchMap( (country) => this.countryService.getCountryByBordersByCodes(country.borders)),
          )
      .subscribe((countries) => {
        // console.log({ borders: country.borders });

          this.borders = countries
        })
      }

}
