#!/usr/bin/env python3

import os
from flask import Flask, jsonify, render_template, send_from_directory
from flask_session import Session
from redis import Redis

app = Flask(__name__, static_folder='public', static_url_path='/')
app.secret_key = os.environ.get("SECRET_KEY", "secret")

# セッション設定（既存のまま）
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = Redis(host=os.environ.get("TAIKO_WEB_REDIS_HOST", "localhost"), port=6379)
Session(app)

@app.route('/')
def route_index():
    # ★ここが重要：フロントエンドが期待する 'version' を辞書形式で渡す
    version_data = {'commit_short': 'stable'}
    return render_template('index.html', version=version_data)

@app.route('/api/config')
def route_api_config():
    return jsonify({
        'basedir': '/',
        'songs_baseurl': os.environ.get("SONGS_BASEURL", "/")
    })

# public/views を正しいパスで配信
@app.route('/src/views/<path:filename>')
def serve_views(filename):
    return send_from_directory('public/views', filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
