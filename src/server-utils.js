import path from "node:path";
const types={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".svg":"image/svg+xml",".mp3":"audio/mpeg",".json":"application/json"};
export const contentTypeFor=file=>types[path.extname(file).toLowerCase()]||"application/octet-stream";
