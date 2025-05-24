import { Client } from "basic-ftp";
import { customAlphabet } from "nanoid";
import { Readable } from "stream";

const FTP_CONFIG = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  port: parseInt(process.env.FTP_PORT || "21"),
};

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  12
);

export async function uploadToFtp(file: File): Promise<string> {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${nanoid()}.${ext}`;
    const remotePath = `/images/${filename}`;

    const stream = Readable.from(Buffer.from(await file.arrayBuffer()));

    await client.ensureDir("/images");
    await client.uploadFrom(stream, remotePath);

    return remotePath;
  } catch (err) {
    console.error("FTP Upload Error:", err);
    throw new Error("Failed to upload file to FTP server");
  } finally {
    client.close();
  }
}

export async function deleteFromFTP(path: string): Promise<void> {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    await client.remove(path);
  } catch (err) {
    console.error(`Error: Failed to delete file from FTP ${path}`, err);
  } finally {
    client.close();
  }
}
