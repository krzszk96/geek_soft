import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-test',
  template: '<p>Hello</p>',
  standalone: true,
})
class TestComponent {}

describe('TestComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
