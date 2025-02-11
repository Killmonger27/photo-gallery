import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

export function usePhotoGallery() {
  //Fonction qui permet de sauvegarder les photos dans le stockage de l'appareil

  const savePicture = async (
    photo: Photo,
    filepath: string
  ): Promise<UserPhoto> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const file = await Filesystem.writeFile({
      path: filepath,
      data: base64Data,
      directory: Directory.Data,
    });

    return { filepath, webviewPath: photo.webPath };
  };
  //variable photos aui va servir a sauvegarder les informations d'une photo
  const [photos, setPhotos] = useState<UserPhoto[]>([]);

  //Fonction qui utilise la camera pour prendre une photo
  //On stocke le fichier dans le dossier photos
  const takePhoto = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100,
    });
    const fileName = Date.now() + ".jpg";
    const savedImage = await savePicture(photo, fileName);

    const newPhotos = [savedImage, ...photos];

    setPhotos(newPhotos);
  };

  return { photos, takePhoto };
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export async function base64FromPath(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject("method did not return a string");
      }
    };
    reader.readAsDataURL(blob);
  });
}
