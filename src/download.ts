
import { Fragment, M3U8 } from "./m3u8.ts";

(self as Worker).addEventListener("message", async ({ data: { m3u8, fragment, index } }) => {
    console.log(m3u8, fragment, index);
    // self.postMessage(data);
    // await downloadFragment(m3u8, fragment, index);

}, false);

export async function downloadFragment(m3u8: M3U8, fragment: Fragment, index: number): Promise<ArrayBuffer> {
    const { headers, body } = await fetch(fragment.url);
    // reader
    if(!body) return new ArrayBuffer(0);
    const reader = body.getReader();
    // content length
    if(!headers) return new ArrayBuffer(0);
    const contentLength = parseInt(headers.get("Content-Length") || "0");
    // read
    let offset = 0;
    const chunks = new Uint8Array(contentLength);
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.set(value, offset);
        offset += value.length;
    }
    if(!m3u8.aes) return chunks.buffer;
    return m3u8.aes.decipher.decrypt(chunks).buffer
}
