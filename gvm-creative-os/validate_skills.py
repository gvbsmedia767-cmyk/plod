import zipfile,re,sys,glob,os
bad=0
for z in sorted(glob.glob('dist/*.zip')):
    n=os.path.basename(z)[:-4]
    names=zipfile.ZipFile(z).namelist()
    ok=f'{n}/SKILL.md' in names
    t=zipfile.ZipFile(z).read(f'{n}/SKILL.md').decode() if ok else ''
    m=re.match(r'---\nname: (.+)\ndescription: "?(.+?)"?\n---\n',t,re.S)
    ok=ok and m and m.group(1)==n and len(m.group(2))<=1024 and re.fullmatch(r'[a-z0-9-]{1,64}',n)
    print('PASS' if ok else 'FAIL',n,names); bad+=not ok
# .claude/skills в корне репозитория — копия для облачных сессий Claude Code; должна совпадать с skills/
for d in sorted(glob.glob('skills/*/')):
    n=os.path.basename(d.rstrip('/'))
    a=open(f'skills/{n}/SKILL.md','rb').read()
    b=f'../.claude/skills/{n}/SKILL.md'
    ok=os.path.exists(b) and open(b,'rb').read()==a
    print('PASS' if ok else 'FAIL','sync',n); bad+=not ok
sys.exit(bad)
