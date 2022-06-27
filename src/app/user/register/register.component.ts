import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUser from 'src/app/models/user.model';
import { RegisterValidators } from '../validators/register-validators';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(
    private auth: AuthService
    ) {}
  
  inSubmission = false;

  name = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ]);
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  age = new FormControl('' , [
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ]);
  password = new FormControl('',[
    Validators.required,
    Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
  ]);
  confirm_password = new FormControl('',[
    Validators.required,

  ]);
  phoneNumber = new FormControl('',[
    Validators.required,
    Validators.minLength(11),
    Validators.maxLength(11)
  ]);

  showAlert = false;
  alertMsg = 'Please wait! Your account is being created.';
  alertColor = 'blue';

registerForm = new FormGroup({
 name: this.name,
 email: this.email,
 age: this.age,
 password: this.password,
 confirm_password: this.confirm_password,
 phoneNumber: this.phoneNumber

}, [RegisterValidators.match('password', 'confirm_password')]); //In () there are control names of the fields in html file
 
async register()
{
  this.showAlert = true;
  this.alertMsg = 'Please wait! Your account is being created.';
  this.alertColor = 'blue';
  this.inSubmission = true;


  try{
  await this.auth.createUser(this.registerForm.value as IUser)
} catch(e){
  console.error(e);

  this.alertMsg = 'An unexpected error occurred. Please try again later';
  this.alertColor = 'red';
  this.inSubmission = false;
  
  return
}

this.alertMsg = 'Success! Your account has been created'
this.alertColor = 'green';
}

}