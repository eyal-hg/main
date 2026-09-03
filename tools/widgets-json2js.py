#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""עוטף כל extrnal_widget/*.json בקובץ .js ליד (hkWidgetJson("name", {...})).
   למה: הפרוטוטיפ נפתח מ-file:// ושם הדפדפן לא מרשה fetch לקובץ .json — רק <script>.
   מריצים אחרי שמניחים JSON חדש בתיקייה:  python3 tools/widgets-json2js.py"""
import os, json
root=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','extrnal_widget')
n=0
for f in sorted(os.listdir(root)):
    if not f.endswith('.json'): continue
    p=os.path.join(root,f); name=f[:-5]
    try: data=json.load(open(p,encoding='utf-8'))
    except Exception as e: print('✗',name,e); continue
    open(p[:-5]+'.js','w',encoding='utf-8').write('hkWidgetJson('+json.dumps(name,ensure_ascii=False)+', '+json.dumps(data,ensure_ascii=False)+');\n')
    n+=1; print('✓',name,len(data.get('rows',[])),'שורות')
print(n,'קבצים')
