import { Icu } from '@angular/compiler/src/i18n/i18n_ast';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from '@angular/fire/compat/firestore'
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) { 
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip) : Promise<DocumentReference<IClip>>
  {
  return this.clipsCollection.add(data)
  }

  getUserClips() {
    return this.auth.user.pipe(
      switchMap(user => {
        if(!user) {
          return of([])
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid  //checking if found uid is equal to id of user currently logged in
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)

    )
  }
}
