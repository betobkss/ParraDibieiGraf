import olefile, sys, os
p=sys.argv[1]
ole=olefile.OleFileIO(p)
def rd(name):
    try:
        return ole.openstream(name).read()
    except Exception:
        return None
subj=rd('__substg1.0_0037001F')
body=rd('__substg1.0_1000001F')
s=subj.decode('utf-16le',errors='replace') if subj else ''
b=body.decode('utf-16le',errors='replace') if body else ''
print('SUBJECT:', s)
print('BODY_LEN:', len(b))
open(os.path.join(os.environ['TEMP'],'modelo21_corpo.txt'),'w',encoding='utf-8').write(b)
print(b[:3000])
