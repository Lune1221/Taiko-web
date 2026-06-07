#!/usr/bin/env python3
import os
from flask import Flask, jsonify, render_template, send_from_directory
from flask_caching import Cache
from flask_session import Session
from pymongo import MongoClient
from redis import Redis
import config

# --- アプリの初期化（重要） ---
app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key-12345")

# --- 設定読み込み ---
def take_config(name, required=False):
    if hasattr(config, name): return getattr(config, name)
    return None

# --- Redis & DB接続 ---
redis_host = os.environ.get("TAIKO_WEB_REDIS_HOST")
redis_port = int(os.environ.get("TAIKO_WEB_REDIS_PORT", 6379))
redis_pass = os.environ.get("TAIKO_WEB_REDIS_PASSWORD")

app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = Redis(
    host=redis_host, port=redis_port, password=redis_pass,
    db=0, ssl=True, ssl_cert_reqs=None
)
Session(app)

# --- ルーティング定義（ここを修正） ---
@app.route('/')
def route_index():
    # テンプレートフォルダにある index.html を返す
    return render_template('index.html')

@app.route('/api/config')
def route_config():
    return jsonify({'status': 'ok', 'basedir': '/'})

# 静的ファイルの補完（念のため）
@app.route('/src/views/<path:filename>')
def serve_views(filename):
    return send_from_directory('public/src/views', filename)

# --- サーバー起動 ---
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)
