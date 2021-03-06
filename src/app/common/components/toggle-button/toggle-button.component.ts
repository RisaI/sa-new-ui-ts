import {Component, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  template: `
    <label class="switch">
      <input type="checkbox" (change)="changed.emit($event.target.checked)"/>
      <span class="slider"></span>
    </label>
  `,
  styles: [`
    /* Basic Rules */
    .switch input {
      display:none;
    }
    .switch {
      display:inline-block;
      width:50px;
      height:20px;
      margin:8px;
      transform:translateY(50%);
      position:relative;
    }
    /* Style Wired */
    .slider {
      position:absolute;
      top:0;
      bottom:0;
      left:0;
      right:0;
      border-radius:30px;
      box-shadow:0 0 0 2px #777, 0 0 4px #777;
      cursor:pointer;
      border:4px solid transparent;
      overflow:hidden;
      transition:.4s;
    }
    .slider:before {
      position:absolute;
      content:"";
      width:100%;
      height:100%;
      background:#777;
      border-radius:30px;
      transform:translateX(-30px);
      /*transition:.4s;*/
    }

    input:checked + .slider:before {
      transform:translateX(30px);
      background:limeGreen;
    }
    input:checked + .slider {
      box-shadow:0 0 0 2px limeGreen,0 0 2px limeGreen;
    }

    /* Style Flat */
    .switch.flat .slider {
      box-shadow:none;
    }
    .switch.flat .slider:before {
      background:#FFF;
    }
    .switch.flat input:checked + .slider:before {
      background:white;
    }
    .switch.flat input:checked + .slider {
      background:limeGreen;
    }
  `]
})
export class ToggleButtonComponent {
  @Output() changed = new EventEmitter<boolean>();
}
