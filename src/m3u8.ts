import { basename } from "https://deno.land/std@0.198.0/path/mod.ts";
import { Aes } from "https://deno.land/x/crypto@v0.10.1/aes.ts";
import { Cbc, Padding } from "https://deno.land/x/crypto@v0.10.1/block-modes.ts";

export declare interface M3U8 {
    url: string;
    title: string;
    duration: number;
    fragments: Array<Fragment>,
    aes?: AES,
}

export declare interface Fragment {
    line: string, 
    url: string,
    index: number,
    data: ArrayBuffer, 
    progress: number,
    length: number,
}

export async function getM3U8(url: string): Promise<M3U8> {
    const title = new URL(url).searchParams.get("title") || basename(url, ".m3u8");
    // file
    const response = await fetch(url);
    const m3u8 = await response.text();
    // calc total time
    const duration = m3u8
        .split("\n")
        .filter(line => line.toUpperCase().startsWith("#EXTINF:"))
        .reduce((sum, line) => {
            return sum + parseFloat(line.split("#EXTINF:")[1]);
        }, 0);
    // calc fragments
    const fragments = m3u8
        .split("\n")
        .filter(line => /^[^#]/.test(line))
        .map((line, index) => {
            return { line, url: parseURL(url, line), index, data: new ArrayBuffer(0), progress: 0, length: 0 }
        });
    // check aes
    const aes = await getAES(url, m3u8);
    return { url, title, duration, fragments, aes };
}

export declare interface AES {
  method: string;
  uri: string;
  iv: Uint8Array;
  key: ArrayBuffer,
  decipher: Cbc<Aes>,
}

async function getAES(url: string, m3u8: string): Promise<AES|undefined> {
    if(!m3u8.startsWith("#EXT-X-KEY")) return undefined;
    const method = (m3u8.match(/(.*METHOD=([^,\s]+))/) || ["", "", ""])[2];
    const uriText = (m3u8.match(/(.*URI="([^"]+))"/) || ["", "", ""])[2];
    const uri = parseURL(url, uriText);
    const ivText = (m3u8.match(/(.*IV=([^,\s]+))/) || ["", "", ""])[2];
    const iv = new TextEncoder().encode(ivText || "");
    // get aes key
    const response = await fetch(uri);
    const key = new Uint8Array(await response.arrayBuffer());
    // Ciphers have an internal state, you should therefore create
    // separate ciphers for encryption and decryption
    const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
    return { method, uri, iv, key, decipher };
}

function parseURL(base: string, target: string) {
    if(target.startsWith("https")) {
        return target.replace("http://","https://")
    } else if(target.startsWith("http")) {
        return target;
    } else if (target[0] === "/") {
        const domain = base.split("/")
        return domain[0] + "//" + domain[2] + target;
    } else {
        const domain = base.split("/")
        domain.pop()
        return domain.join("/") + "/" + target;
    }
}