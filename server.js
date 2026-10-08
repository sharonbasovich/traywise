import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const base=(process.env.BASE_PATH||'').replace(/\/$/,'');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.csv':'text/csv','.json':'application/json'};
http.createServer(async(req,res)=>{try{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(base&&p===base){res.writeHead(302,{Location:base+'/'});res.end();return;}if(base){if(!p.startsWith(base+'/'))throw Error();p=p.slice(base.length);}const allowed=['/','/index.html','/src/app.js','/src/model.js','/src/data.js','/src/style.css','/data/fictional-kitchen.csv','/docs/EVALUATION-REPORT.md'];if(!allowed.includes(p))throw Error();const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+path.sep))throw Error();const body=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'text/plain','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; object-src 'none'; base-uri 'none'; form-action 'none'",'X-Content-Type-Options':'nosniff'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT)||4173,'0.0.0.0',()=>console.log('TrayWise ready on port '+(process.env.PORT||4173)+(base||'/')));
