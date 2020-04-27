import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgXmlComponent } from './svg-xml.component';

describe('SvgXmlComponent', () => {
  let component: SvgXmlComponent;
  let fixture: ComponentFixture<SvgXmlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgXmlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgXmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
