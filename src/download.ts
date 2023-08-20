
import { AES, getM3U8 } from './m3u8.ts';

export async function download(url: string, thread: number) {
    const m3u8 = await getM3U8(url);
    for(const fragment of m3u8.fragments) {
        fragment.data = await downloadFragment(url, 0, m3u8.aes);
    }
    console.log(m3u8.fragments);
}

export async function downloadFragment(url: string, index: number, aes?: AES): Promise<ArrayBuffer> {
    const result = await fetch(url);
    const buffer = await result.arrayBuffer();
    if(!aes) return buffer;
    return aes.decipher.decrypt(new Uint8Array(buffer)).buffer
}

console.log(await download("http://1257120875.vod2.myqcloud.com/0ef121cdvodtransgzp1257120875/3055695e5285890780828799271/v.f230.m3u8", 1));