# OCG Automated Vertical Engine

Configuration-driven validation deployment for Olson Consulting Group.

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

- Standalone `noindex,nofollow` validation deployment at `https://olsoncg-engine.vercel.app/`
- No live checkout or payment collection
- No paid product file exposed by the static site
- No CRM or email submission
- No live provider order
- No raw email stored in analytics
- The $197 product button prepares a route-and-answer product intent locally without email, mobile, payment data, or OFA/FranTracker action
- No Austin calendar path before a future paid-consulting receipt

## Clone a vertical

Copy `verticals/consultants.json`, replace audience, variants, questions, routes, products, marketing controls, boundaries, and provider requirements, then load it with `?vertical=<verticalId>`. No engine change should be required.

## Paid product source

The private, receipt-gated product source and delivery adapter are versioned at:

`/Users/olson/Documents/Owner-Command-Center/products/ocg/practice-launch-decision-system/`

The public validation site describes the product and prepares a non-PII route payload. It does not serve the customer file. A verified paid receipt is required by the private delivery adapter before generation.
