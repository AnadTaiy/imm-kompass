"""Resolve private application runtimes without changing the user's PATH."""
import os, shutil, subprocess, sys
from pathlib import Path

def process_options():
 return {'creationflags':subprocess.CREATE_NO_WINDOW} if os.name=='nt' else {}

def python_executable():
 path=Path(sys.executable);console=path.with_name('python.exe')
 return str(console if path.name.lower()=='pythonw.exe' and console.exists() else path)

def node_executable():
 private=os.environ.get('IMM_NODE_EXE')
 if private:
  path=Path(private)
  if not path.is_absolute() or not path.is_file():raise RuntimeError('Konfigurert Node-runtime for validering finnes ikke.')
  return str(path)
 node=shutil.which('node')
 if not node:
  bundled=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
  if bundled.is_file():node=str(bundled)
 if not node:raise RuntimeError('Byggmiljøet mangler Node for validering.')
 return node
