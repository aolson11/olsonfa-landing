# OCG Automated Vertical Engine

Local, configuration-driven prototype for Olson Consulting Group.

## Purpose

One engine renders vertical-specific landing copy, diagnostic questions, route results, products, marketing controls, attribution, and a provider adapter. The therapist and consultant examples use the same code.

## Run locally

From `/Users/olson/Desktop/OFA/website`:

```bash
node tests/ocg-engine-audit.mjs
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let p=path.join(root,decodeURIComponent(url.pathname==='/'?'/campaigns/ocg-engine/index.html':url.pathname));if(!p.startsWith(root)){res.writeHead(403);return res.end()}fs.stat(p,(e,s)=>{if(!e&&s.isDirectory())p=path.join(p,'index.html');fs.readFile(p,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found')}const ext=path.extname(p);res.setHeader('Content-Type',ext==='.json'?'application/json':ext==='.js'||ext==='.mjs'?'text/javascript':ext==='.css'?'text/css':'text/html');res.end(data)})})}).listen(4173)"
```

Open:

- `http://localhost:4173/campaigns/ocg-engine/?vertical=therapists&variant=control`
- `http://localhost:4173/campaigns/ocg-engine/?vertical=therapists&variant=sequence`
- `http://localhost:4173/campaigns/ocg-engine/?vertical=consultants&variant=control`

## Safety state

- No production deployment
- No checkout
- No CRM or email submission
- No live provider order
- No raw email stored in analytics
- No Austin calendar path before a future paid-consulting receipt

## Clone a vertical

Copy `verticals/consultants.json`, replace audience, variants, questions, routes, products, marketing controls, boundaries, and provider requirements, then load it with `?vertical=<verticalId>`. No engine change should be required.
