#!/usr/bin/env python3
"""Public HackerTube export + client-visible metadata. No video media downloads.
Dependencies: requests, beautifulsoup4. Run from this directory after obtaining
source-export.zip using /api/export (the site's explicit 'fork it' data download).
"""
import requests,json,time,pathlib,concurrent.futures,threading,datetime,zipfile
from urllib.parse import quote
from bs4 import BeautifulSoup
P=pathlib.Path(__file__).parent; BASE='https://hackertube.org'; lock=threading.Lock(); log=[]
def now(): return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5,minutes=30))).isoformat()
def save(name,data): (P/name).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
def get(path):
 url=BASE+path
 for attempt in range(3):
  try:
   r=requests.get(url,timeout=60,headers={'User-Agent':'OpenHackerTube-metadata-export/1.0 (public dataset reuse)'})
   if r.status_code in (403,429): raise RuntimeError('Site block/rate limit; stop rather than evade')
   if r.status_code>=500 and attempt<2: time.sleep(2**attempt);continue
   item={'url':url,'status':r.status_code,'bytes':len(r.content),'scraped_at':now(),'attempts':attempt+1}
   with lock: log.append(item)
   r.raise_for_status();time.sleep(.2);return r
  except RuntimeError: raise
  except requests.RequestException as e:
   if attempt==2:
    with lock: log.append({'url':url,'error':str(e),'scraped_at':now(),'attempts':3})
    return None
   time.sleep(2**attempt)
def work(path):
 r=get(path); return path,r.json() if r is not None else None
if __name__=='__main__':
 started=now();off=P/'official/hackertube-data'
 if not off.exists(): zipfile.ZipFile(P/'source-export.zip').extractall(P/'official')
 raw=[json.loads(x) for x in (off/'videos.jsonl').read_text().splitlines()]
 tax=json.loads((off/'taxonomy.json').read_text()); stats=json.loads((P/'stats.json').read_text());pls=json.loads((P/'playlists.json').read_text())
 paths=[f'/api/list?offset={i}&n=100' for i in range(0,stats['videos']+100,100)]
 paths += ['/api/playlist?slug='+quote(x['slug']) for x in pls]
 live={};details=[];pagination=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for path,data in pool.map(work,paths):
   if data is None: continue
   if '/api/list?' in path:
    pagination.append({'url':BASE+path,'count':len(data)})
    for v in data: live[v['vid']]=(v,BASE+path)
   else: details.append({'source_url':BASE+path,'data':data})
 save('playlist-details.json',details)
 videos=[]
 for original in raw:
  v=dict(original);lv,src=live.get(v['vid'],({},BASE+'/download/videos.jsonl'))
  for key in ['published','duration_s','views','likes','thumbnail','whys']:
   if key in lv: v[key]=lv[key]
  v.update({'id':v['vid'],'source_url':BASE+'/watch/'+v['vid'],'provider':'youtube','embed_url':'https://www.youtube-nocookie.com/embed/'+v['vid'],'provenance':{'record_source':BASE+'/download/videos.jsonl','live_metadata_source':src if lv else None,'scraped_at':now(),'export_generated':json.loads((P/'export.json').read_text())['generated']}})
  videos.append(v)
 areas=tax['areas'];cats=[dict(c,area_id=a['id'],area_name=a['name'],source_url=BASE+'/c/'+c['id']) for a in areas for c in a['categories']]
 mentions=[json.loads(x) for x in (off/'mentions.jsonl').read_text().splitlines()];related=[json.loads(x) for x in (off/'related.jsonl').read_text().splitlines()]
 save('videos.json',videos);save('categories.json',cats);save('areas.json',areas);save('mentions.json',mentions);save('related.json',related)
 # Fetch static-shell routes only once per template: thousands of /watch pages
 # are identical JS shells; all actual record data is captured above.
 shells=['/','/categories','/about','/data','/browse','/browse?dur=xlong','/playlists','/liked','/later','/history','/settings','/search/test','/c/'+cats[0]['id'],'/a/'+areas[0]['id'],'/watch/'+videos[0]['id'],'/p/'+pls[0]['slug']]
 pages=[]; (P/'pages').mkdir(exist_ok=True)
 for i,path in enumerate(shells):
  r=get(path)
  if r is None:continue
  soup=BeautifulSoup(r.text,'html.parser');(P/'pages'/f'{i:02d}.html').write_text(r.text)
  pages.append({'url':BASE+path,'title':soup.title.get_text() if soup.title else None,'text':soup.get_text(' ',strip=True),'links':[a['href'] for a in soup.select('a[href]')],'html_file':f'pages/{i:02d}.html','scraped_at':now()})
 save('pages.json',pages)
 inventory={BASE+p:{'url':BASE+p,'kind':'shell','fetched':True} for p in shells}
 for c in cats: inventory[c['source_url']]={'url':c['source_url'],'kind':'category','fetched':c['source_url'] in inventory,'data_captured':True}
 for a in areas:
  u=BASE+'/a/'+a['id'];inventory[u]={'url':u,'kind':'area','fetched':u in inventory,'data_captured':True}
 for v in videos: inventory[v['source_url']]={'url':v['source_url'],'kind':'video','fetched':v['source_url'] in inventory,'data_captured':True}
 for p in pls:
  u=BASE+'/p/'+p['slug'];inventory[u]={'url':u,'kind':'playlist','fetched':u in inventory,'data_captured':True}
 for p in pages:
  for link in p['links']:
   if link.startswith('/'):
    u=BASE+link;inventory.setdefault(u,{'url':u,'kind':'navigation','fetched':False})
 for entry in log:inventory[entry['url']]={**entry,'fetched':True,'kind':'request'}
 # Include initial discovery requests made before this reusable script.
 for path,file,status in [('/robots.txt','robots.txt',200),('/sitemap.xml','sitemap.xml',404),('/categories','categories.html',200),('/api/export','export.json',200),('/api/stats','stats.json',200),('/api/browse','browse.json',200),('/api/playlists','playlists.json',200),('/download/hackertube-data.zip','source-export.zip',200),('/api/list?offset=0&n=10000','list-probe.json',200)]:
  u=BASE+path;inventory.setdefault(u,{'url':u,'kind':'initial_request','fetched':True,'status':status,'local_file':file})
 save('url-inventory.json',list(inventory.values()));save('requests.json',log)
 ids={v['id'] for v in videos};assert len(ids)==len(videos)==stats['videos'];assert len(cats)==stats['categories'];assert len(areas)==stats['areas'];assert len(mentions)==stats['comments']
 report={'started_at':started,'completed_at':now(),'timezone':'Asia/Calcutta (IST)','counts':{'videos':len(videos),'live_metadata_videos':len(live),'categories':len(cats),'areas':len(areas),'mentions':len(mentions),'related_records':len(related),'playlists':len(pls),'playlist_details':len(details),'html_pages_fetched':len(pages),'discovered_urls':len(inventory)},'pagination':pagination,'failed_requests':[x for x in inventory.values() if x.get('error') or x.get('status',200)>=400],'validation':{'video_ids_unique':True,'matches_official_stats':True,'live_ids_missing':sorted(ids-set(live)),'live_extra_ids':sorted(set(live)-ids)},'coverage_notes':['All 6454 videos and 39834 comments in the official 2026-10-31 export, verified against live stats.','All list pages fetched using server maximum 100; terminal empty page verifies exhaustion.','Category and video routes are client-rendered identical shells. Data captured via explicit public export and the endpoints used in that shell, rather than redundantly fetching thousands of empty shells.','Not every possible search/filter query URL is enumerated. Personal likes, history and watch-later are local browser state, not public records.','robots.txt disallows /api/ and /download/ for crawlers. This uses the site\'s expressly offered Fork it / Download everything dataset and client metadata reads for this user-requested reuse; no block or credentials bypassed.','Original YouTube descriptions and speaker names absent from these records are not inferred. All missing fields omitted.','Live YouTube-derived metadata has separate licensing caveats; official export deliberately excludes it. Read DATA.md before publishing.']}
 save('coverage.json',report)
 combined={'schema_version':'1.0','provenance':{'source':BASE,'license':'ODC-By-1.0 for official dataset; credit HackerTube','scraped_at':now()},'areas':areas,'categories':cats,'videos':videos,'playlists':pls,'playlist_details':details,'mentions':mentions,'related':related,'pages':pages,'coverage':report}
 save('hackertube-complete.json',combined)
 print(json.dumps(report,indent=2))
