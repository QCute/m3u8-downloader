
import { M3U8, getM3U8 } from "./m3u8.ts";

export async function download(url: string, handler: (m3u8: M3U8, index: number, data: any) => void, thread: number) {
    const workers = Array.from({ length: thread }).map(_ => {
        return new Worker(new URL("./download.ts", import.meta.url).href, {
            type: "module",
        });
    });
    const m3u8 = await getM3U8(url);
    m3u8.fragments.map((fragment, index) => {
        const worker = workers[index % workers.length];
        worker.postMessage({ state: "start", m3u8, fragment, index });
        worker.addEventListener("message", ({ data }) => {
            handler(m3u8, index, data)
        }, false);
    });
}

console.log(await download("http://1257120875.vod2.myqcloud.com/0ef121cdvodtransgzp1257120875/3055695e5285890780828799271/v.f230.m3u8", 1));