export default function filereader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        resolve(e.target.result);
      } else {
        reject(new Error(`Failed to read file ${file.name}`));
      }
    };
    reader.readAsText(file);
  });
}
