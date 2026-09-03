#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""עוטף כל data/widgets/**/*.json בקובץ .js ליד (hkWidgetJson("company/widget", {...})).
   למה: הפרוטוטיפ נפתח מ-file:// ושם הדפדפן לא מרשה fetch לקובץ .json — רק <script>.
   מריצים אחרי שמניחים JSON חדש בתיקייה:  python3 tools/widgets-json2js.py"""
import os, json, sys
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data','widgets')
n=0
for d,_,files in os.walk(root):
    for f in files:
        if not f.endswith('.json'): continue
        p=os.path.join(d,f); rel=os.path.relpath(p,root)[:-5].replace(os.sep,'/')
        try: data=json.load(open(p,encoding='utf-8'))
        except Exception as e: print('✗',rel,e); continue
        open(p[:-5]+'.js','w',encoding='utf-8').write('hkWidgetJson('+json.dumps(rel,ensure_ascii=False)+', '+json.dumps(data,ensure_ascii=False)+');\n')
        n+=1; print('✓',rel,len(data.get('rows',[])),'שורות')
print(n,'קבצים')
