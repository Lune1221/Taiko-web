#!/usr/bin/env python3

import base64
import bcrypt
import hashlib
import json
import re
import requests
import schema
import os
import time
from datetime import datetime
from functools import wraps
from flask import Flask, g, jsonify, render_template, request, abort, redirect, session, flash, make_response, send_from_directory
from flask_caching import Cache
from flask_session import Session
from flask_wtf.csrf import CSRFProtect, generate_csrf, CSRFError
from ffmpy import FFmpeg
from pymongo import MongoClient
from redis import Redis

# 設定ファイルの読み込み
try:
    import config
except ModuleNotFoundError:
    raise FileNotFoundError('No such file or directory: \'config.py\'.')

def take_config(name, required=False):
    if hasattr(config, name):
        return getattr(config, name)
    elif required:
        raise ValueError('Required option is not defined in the config.py file: {}'.format(name))
    return None

app = Flask(__name__)

# 接続先の設定を環境変数から取得
mongo_host = os.environ.get("TAIKO_WEB_MONGO_HOST") or take_config('MONGO', required=True)['host']
client = MongoClient(mongo_host, serverSelectionTimeoutMS=5000)

basedir = take_config('BASEDIR') or '/'
app.secret_key = take_config('SECRET_KEY') or 'change-me'
app.config['SESSION_TYPE'] = 'redis'

# Redis設定の読み込みと環境変数の優先適用
redis_config = take_config('REDIS', required=True)
redis_host = os.environ.get("TAIKO_WEB_REDIS_HOST") or redis_config.get('CACHE_REDIS_HOST')
redis_port = os.environ.get("TAIKO_WEB_REDIS_PORT") or redis_config.get("CACHE_REDIS_PORT")
redis_pass = os.environ.get("TAIKO_WEB_REDIS_PASSWORD") or redis_config.get("CACHE_REDIS_PASSWORD")
redis_db = os.environ.get("TAIKO_WEB_REDIS_DB") or redis_config.get("CACHE_REDIS_DB") or 0

# デバッグ用ログ（RenderのLogsで確認）
print(f"DEBUG: Connecting to Redis at {redis_host}:{redis_port}. Password length: {len(str(redis_pass))}")

# RedisへのTLS/SSL接続設定
app.config['SESSION_REDIS'] = Redis(
    host=redis_host,
    port=int(redis_port),
    password=redis_pass,
    db=int(redis_db),
    ssl=True,
    ssl_cert_reqs=None,
    socket_connect_timeout=10,
    health_check_interval=30
)

app.cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_HOST': redis_host, 'CACHE_REDIS_PORT': redis_port})
sess = Session()
sess.init_app(app)

db = client[take_config('MONGO', required=True)['database']]

# --- (以下、既存の関数やルート定義をそのまま貼り付けてください) ---
# ...
# (ログイン処理、APIルート、データベース操作関数など)
# ...

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('port', type=int, nargs='?', default=34801)
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=args.port)
