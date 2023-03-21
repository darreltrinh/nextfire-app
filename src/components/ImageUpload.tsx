import { ChangeEvent, useState } from 'react';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { auth, storage } from '../lib/firebase';
import Loader from './Loader';

// Uploads images to Firebase Storage
export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  // Creates a Firebase Upload Task
  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    // Get the file
    const file = Array.from(e.target.files as FileList)[0];
    const extension = file.type.split('/')[1];

    // Makes reference to the storage bucket location
    const storageRef = ref(storage, `uploads/${auth.currentUser?.uid}/${Date.now()}.${extension}`);
    setUploading(true);

    // Starts the upload
    const task = uploadBytesResumable(storageRef, file);

    // Listen to updates to upload task
    task.on('state_changed', (snapshot) => {
      const pct = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      setProgress(parseInt(pct, 10));
    },
    (error) => {
      // Handle error
      console.error(error);
      setUploading(false);
    },
    async () => {
      // Get downloadURL AFTER task resolves
      const url = await getDownloadURL(storageRef);
      setDownloadURL(url);
      setUploading(false);
    });
  };

  return (
    <div className="box">
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className="btn">
            📸 Upload Img
            <input type="file" onChange={uploadFile} accept="image/x-png,image/gif,image/jpeg" />
          </label>
        </>
      )}

      {downloadURL && <code className="upload-snippet">{`![alt](${downloadURL})`}</code>}
    </div>
  );
}
