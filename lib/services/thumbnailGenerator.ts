import * as VideoThumbnails from 'expo-video-thumbnails';

/**
 * Generate a thumbnail from a video file
 * @param videoUri - URI of the video file
 * @returns URI of the generated thumbnail image
 */
export async function generateThumbnail(videoUri: string): Promise<string> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0, // Generate thumbnail at start of video
      quality: 0.7, // Good balance between quality and file size
    });
    return uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
}
