"""Run with sudo: python3 deploy.py RELEASE_ID /home/admin/it-school-upload/RELEASE_ID.tar.gz.
Only manages /opt/it-school, /var/www/it-school and one Nginx include.
"""
import json, os, re, secrets, shutil, subprocess, sys, tarfile, time, urllib.request
from pathlib import Path
ROOT=Path('/opt/it-school')
NGINX=Path('/etc/nginx/sites-enabled/telegram-miniapp').resolve()
INCLUDE=Path('/etc/nginx/snippets/it-school.conf')

def run(args, **kwargs):
    return subprocess.run(args,check=True,**kwargs)

def compose(release,*args,**kwargs):
    return run(['docker','compose','--project-name','it-school','--env-file',str(ROOT/'runtime.env'),'-f',str(release/'compose.yaml'),*args],cwd=release,**kwargs)

def write_private(path,text):
    fd=os.open(path,os.O_CREAT|os.O_WRONLY|os.O_TRUNC,0o600)
    with os.fdopen(fd,'w') as f: f.write(text)
    path.chmod(0o600)

def replace_link(path,target):
    temp=path.with_name(path.name+'.next')
    if temp.is_symlink(): temp.unlink()
    temp.symlink_to(target,target_is_directory=True)
    temp.replace(path)

def main():
    if os.geteuid()!=0: raise RuntimeError('Run with sudo')
    release_id=sys.argv[1]
    if not re.fullmatch(r'\d{8}-\d{6}',release_id): raise ValueError('Invalid release id')
    archive=Path(sys.argv[2]).resolve()
    if archive.parent!=Path('/home/admin/it-school-upload') or archive.name!=release_id+'.tar.gz': raise ValueError('Unexpected archive path')
    ROOT.mkdir(mode=0o755,parents=True,exist_ok=True)
    (ROOT/'releases').mkdir(exist_ok=True)
    (ROOT/'backups').mkdir(mode=0o700,exist_ok=True)
    release=ROOT/'releases'/release_id
    if release.exists(): raise RuntimeError('Release already exists; package a new release')
    release.mkdir()
    with tarfile.open(archive) as tar: tar.extractall(release,filter='data')
    old_release=(ROOT/'current').resolve() if (ROOT/'current').is_symlink() else None
    original_nginx=NGINX.read_text()
    old_include=INCLUDE.read_text() if INCLUDE.exists() else None
    env_path=ROOT/'runtime.env'
    previous_env=env_path.read_text() if env_path.exists() else None
    if not previous_env:
        password=secrets.token_urlsafe(27)
        environment=f'DB_PASSWORD={secrets.token_urlsafe(32)}\nADMIN_USERNAME=admin\nADMIN_INITIAL_PASSWORD={password}\nPUBLIC_URL=https://telegrambot.vps.webdock.cloud/it-school/\n'
        write_private(ROOT/'admin-access.json',json.dumps({'url':'https://telegrambot.vps.webdock.cloud/it-school/admin','username':'admin','password':password},indent=2))
    else: environment=re.sub(r'^RELEASE_ID=.*\n?','',previous_env,flags=re.M)
    write_private(ROOT/'backups'/f'nginx-{release_id}.conf',original_nginx)
    if old_release:
        with open(ROOT/'backups'/f'database-{release_id}.dump','wb') as backup:
            compose(old_release,'exec','-T','db','pg_dump','-U','it_school','-d','it_school','-Fc',stdout=backup)
    try:
        write_private(env_path,environment+f'RELEASE_ID={release_id}\n')
        compose(release,'build','api')
        compose(release,'up','-d','--wait','--wait-timeout','150')
        with urllib.request.urlopen('http://127.0.0.1:3100/api/health',timeout=10) as r:
            assert json.load(r)['database']=='up'
        with urllib.request.urlopen('http://127.0.0.1:3100/api/courses',timeout=10) as r:
            assert len(json.load(r))>=3
        web=Path('/var/www/it-school')
        if web.exists() and not web.is_symlink(): raise RuntimeError('Existing /var/www/it-school is not our symlink')
        if web.is_symlink() and str(web.readlink())!='/opt/it-school/current/frontend': raise RuntimeError('Unexpected website symlink')
        replace_link(ROOT/'current',release)
        if not web.is_symlink(): web.symlink_to(ROOT/'current/frontend',target_is_directory=True)
        INCLUDE.write_text((release/'infra/nginx-location.conf').read_text())
        marker='    include /etc/nginx/snippets/it-school.conf;'
        if marker not in original_nginx:
            anchor='    root /var/www/telegram-miniapp;'
            if original_nginx.count(anchor)!=1: raise RuntimeError('Nginx configuration changed; cannot safely insert include')
            NGINX.write_text(original_nginx.replace(anchor,marker+'\n'+anchor))
        run(['nginx','-t'])
        run(['systemctl','reload','nginx'])
        for attempt in range(10):
            try:
                with urllib.request.urlopen('https://telegrambot.vps.webdock.cloud/it-school/api/health',timeout=15) as r:
                    assert json.load(r)['status']=='ok'
                break
            except Exception:
                if attempt==9: raise
                time.sleep(1)
        write_private(ROOT/'deployment.json',json.dumps({'current':release_id,'previous':old_release.name if old_release else None,'url':'https://telegrambot.vps.webdock.cloud/it-school/','deployedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())},indent=2))
        for name in ['it-school-backup.service','it-school-backup.timer']:
            shutil.copyfile(release/'infra'/name,Path('/etc/systemd/system')/name)
        run(['systemctl','daemon-reload'])
        run(['systemctl','enable','--now','it-school-backup.timer'])
        print('DEPLOYED https://telegrambot.vps.webdock.cloud/it-school/ release='+release_id)
    except Exception:
        NGINX.write_text(original_nginx)
        if old_include is not None: INCLUDE.write_text(old_include)
        if old_release:
            replace_link(ROOT/'current',old_release)
            write_private(env_path,previous_env)
            compose(old_release,'up','-d','--wait','--wait-timeout','120')
        else:
            compose(release,'stop','api')
        run(['nginx','-t'])
        run(['systemctl','reload','nginx'])
        raise

if __name__=='__main__': main()
