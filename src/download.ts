
import { Fragment, M3U8 } from "./m3u8.ts";

self.addEventListener("message", async ({ data: { m3u8, fragment } }) => {
    await downloadFragment(m3u8, fragment);
}, false);

export async function downloadFragment(m3u8: M3U8, fragment: Fragment): Promise<void> {
    const { status, statusText, headers, body } = await fetch(fragment.url);
    // content length
    if(!headers) return self.postMessage({ status, statusText });
    const length = parseInt(headers.get("Content-Length") || "0");
    // reader
    if(!body) return self.postMessage({ status, statusText });
    const reader = body.getReader();
    // read
    let offset = 0;
    const chunks = new Uint8Array(length);
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) break;
        chunks.set(value, offset);
        offset += value.length;
        self.postMessage({ progress: value.length, length });
    }
    fragment.data = m3u8.aes ? m3u8.aes.decipher.decrypt(chunks).buffer : chunks.buffer;
    fragment.status = 1;
    self.postMessage({ fragment });
    // return fragment;
}
