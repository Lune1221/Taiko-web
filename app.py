#!/usr/bin/env python3

import os
from flask import Flask, jsonify, render_template, send_from_directory
from flask_caching import Cache
from flask_session import Session
from redis import Redis

# --- 1. アプリ初期化 ---
# public フォルダを静的ファイルとして配信設定
app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = os.environ.get("SECRET_KEY", "change-me-to-something-secure")

# --- 2. Redis接続設定 ---
redis_host = os.environ.get("TAIKO_WEB_REDIS_HOST", "localhost")
redis_port = int(os.environ.get("TAIKO_WEB_REDIS_PORT", 6379))
redis_pass = os.environ.get("TAIKO_WEB_REDIS_PASSWORD")

app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = Redis(
    host=redis_host, 
    port=redis_port, 
    password=redis_pass,
    db=int(os.environ.get("TAIKO_WEB_REDIS_DB", 0)),
    ssl=True, 
    ssl_cert_reqs=None
)
Session(app)
app.cache = Cache(app, config={'CACHE_TYPE': 'redis', 'CACHE_REDIS_HOST': redis_host, 'CACHE_REDIS_PORT': redis_port})

# --- 3. ルーティング ---

@app.route('/')
def route_index():
    # ブラウザの loader.js が期待する version 情報をテンプレートに渡す
    version_data = {'commit_short': 'stable'}
    return render_template('index.html', version=version_data)

@app.route('/api/config')
def route_api_config():
    # フロントエンドが期待する構造（version を含む）で JSON を返却
    return jsonify({
        'basedir': '/',
        'songs_baseurl': os.environ.get("SONGS_BASEURL", "/"),
        'version': {'commit_short': 'stable'}
    })

@app.route('/src/views/<path:filename>')
def serve_views(filename):
    # GitHubのディレクトリ構造 public/views/ に合わせて配信
    return send_from_directory('public/views', filename)

# --- 4. サーバー起動 ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)
