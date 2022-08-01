import { Icu } from '@angular/compiler/src/i18n/i18n_ast';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot} from '@angular/fire/compat/firestore'
import IClip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { switchMap, map } from 'rxjs/operators';
import { of, BehaviorSubject, combineLatest, lastValueFrom } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) { 
    this.clipsCollection = db.collection('clips');
  }

  createClip(data: IClip) : Promise<DocumentReference<IClip>>
  {
  return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>) {                     //Function that fetches the clips of the user and displays them in manage tab
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {
        const [user, sort] = values

        if(!user) {
          return of([])
        }

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid  //checking if found uid is equal to id of user currently logged in
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string){
    return this.clipsCollection.doc(id).update({
      title
    })   //function lets chose document from firebase database by id
  }

  async deleteClip(clip: IClip)
  {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    await clipRef.delete();
    await screenshotRef.delete();

    await this.clipsCollection.doc(clip.docID).delete();
  }

  async getClips() {      //queries are asynchronous operations
    if(this.pendingReq)  // to avoid multiple loadings at one time
    {
      return
    }

    this.pendingReq = true;

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6)

    const { length } = this.pageClips

    if(length) 
    {
      const lastDocID = this.pageClips[length - 1].docID
      const lastDoc = await lastValueFrom(this.clipsCollection.doc(lastDocID).get());

      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()

    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      })
    })

    this.pendingReq = false;
  }
}
