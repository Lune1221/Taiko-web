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

# ★Flaskの静的ファイル設定：publicフォルダをルート( / )から直接配信する設定
app = Flask(__name__, static_folder='public', static_url_path='/')

# MongoDB接続
mongo_host = os.environ.get("TAIKO_WEB_MONGO_HOST") or take_config('MONGO', required=True)['host']
client = MongoClient(mongo_host, serverSelectionTimeoutMS=5000)

basedir = take_config('BASEDIR') or '/'
app.secret_key = take_config('SECRET_KEY') or 'change-me'
app.config['SESSION_TYPE'] = 'redis'

# Redis設定
redis_config = take_config('REDIS', required=True)
redis_host = os.environ.get("TAIKO_WEB_REDIS_HOST") or redis_config.get('CACHE_REDIS_HOST')
redis_port = os.environ.get("TAIKO_WEB_REDIS_PORT") or redis_config.get("CACHE_REDIS_PORT")
redis_pass = os.environ.get("TAIKO_WEB_REDIS_PASSWORD") or redis_config.get("CACHE_REDIS_PASSWORD")
redis_db = os.environ.get("TAIKO_WEB_REDIS_DB") or redis_config.get("CACHE_REDIS_DB") or 0

# Redisへの安全なTLS接続
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

# --- ルート定義 ---

@app.route('/')
def route_index():
    """トップページのルートを明示的に指定"""
    version = get_version()
    now = datetime.now()
    return render_template('index.html', version=version, config=get_config(), year=now.year, month=now.month, day=now.day)

# ※その他のAPIや管理画面のルートは必要に応じてここに追加します
# (既存のAPIルート定義などはそのままこちらに含めてください)

def get_config(credentials=False):
    # 設定取得ロジック（既存の内容）
    config_out = {'basedir': basedir, 'songs_baseurl': take_config('SONGS_BASEURL', required=True)}
    return config_out

def get_version():
    return {'commit': None}

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('port', type=int, nargs='?', default=34801)
    args = parser.parse_args()
    app.run(host='0.0.0.0', port=args.port)
