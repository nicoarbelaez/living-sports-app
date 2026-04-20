import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
}

export interface UseMediaPickerConfig {
  maxFiles?: number;
  allowVideo?: boolean;
  resizeWidth?: number;
  compressQuality?: number;
  multiple?: boolean;
}

async function resizeImage(uri: string, width: number, quality: number): Promise<string> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width });
  const ref = await ctx.renderAsync();
  const saved = await ref.saveAsync({ compress: quality, format: SaveFormat.JPEG });
  return saved.uri;
}

export function useMediaPicker(config: UseMediaPickerConfig = {}) {
  const {
    maxFiles = 5,
    allowVideo = true,
    resizeWidth = 1080,
    compressQuality = 0.8,
    multiple = true,
  } = config;

  const mediaTypes: ImagePicker.MediaType[] = allowVideo ? ['images', 'videos'] : ['images'];

  async function handlePickFromGallery(currentCount = 0): Promise<MediaItem[]> {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería.');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: multiple,
      selectionLimit: multiple ? maxFiles - currentCount : 1,
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets?.length) return [];

    return Promise.all(
      result.assets.map(async (asset) => {
        const isVideo = asset.type === 'video';
        const uri = isVideo
          ? asset.uri
          : await resizeImage(asset.uri, resizeWidth, compressQuality);
        return { uri, type: (isVideo ? 'video' : 'image') as 'image' | 'video' };
      })
    );
  }

  async function handlePickFromCamera(): Promise<MediaItem | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara.');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes,
      quality: 1,
      base64: false,
    });

    if (result.canceled || !result.assets?.length) return null;

    const asset = result.assets[0];
    const isVideo = asset.type === 'video';
    const uri = isVideo ? asset.uri : await resizeImage(asset.uri, resizeWidth, compressQuality);
    return { uri, type: isVideo ? 'video' : 'image' };
  }

  return { handlePickFromGallery, handlePickFromCamera };
}
