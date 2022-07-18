import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import IClip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: IClip | null = null;


  clipID = new FormControl('')
  title = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])

  editForm = new FormGroup({
    id: this.clipID,
    title: this.title
  })

  constructor(private modal: ModalService) { }

  ngOnInit() {
    this.modal.register('editClip');
  }

  ngOnDestroy() {
    
    this.modal.unregister('editClip');
    
    
  }

  ngOnChanges() {

    if(!this.activeClip){
      return
    }
    
    this.clipID.setValue(this.activeClip.docID)
    this.title.setValue(this.activeClip.title)
  }

}