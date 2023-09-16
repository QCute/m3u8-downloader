
import { M3U8, Fragment } from "./m3u8.ts";

export function download(m3u8: M3U8, thread: number): Array<Promise<Fragment>> {
    const workers = Array.from({ length: thread }).map(_ => {
        return new Worker(new URL("./download.ts", import.meta.url).href, {
            type: "module",
        });
    });
    return m3u8.fragments.map(fragment => {
        const worker = workers[fragment.index % workers.length];
        worker.postMessage({ m3u8, fragment });
        return new Promise((resolve, reject) => {
            worker.addEventListener("message", ({ data: { status, statusText, progress, length, fragment } }) => {
                if(typeof status != "undefined" && typeof statusText != "undefined") {
                    reject({ status, statusText });
                } else if(typeof progress != "undefined" && typeof length != "undefined") {
                    fragment.progress = progress;
                    fragment.length = length;
                } else if (typeof fragment != "undefined") {
                    resolve(fragment);
                }
            }, false);
        });
    });
}

// console.log(await download("http://1257120875.vod2.myqcloud.com/0ef121cdvodtransgzp1257120875/3055695e5285890780828799271/v.f230.m3u8", 1));