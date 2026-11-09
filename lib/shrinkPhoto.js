const MAX_SIDE = 1280;

export async function shrinkPhotoInput(form) {
  const input = form.querySelector('input[type="file"][name="photo"]');
  const file = input && input.files && input.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.8));
    if (!blob || blob.size >= file.size) return;
    const small = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    const dt = new DataTransfer();
    dt.items.add(small);
    input.files = dt.files;
  } catch (e) {
    // If the photo cannot be shrunk, the original is sent as it is.
  }
}
