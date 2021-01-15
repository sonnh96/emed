# -*- coding: utf-8 -*-
import os
import secrets
from flask import render_template, url_for, flash, redirect, request, jsonify, send_file
from main import app, db, bcrypt, socketio
from main.forms import *
from main.models import *
# from flask_login import login_user, current_user, logout_user, login_required
import datetime
import requests
import json
import random
from pdf2image import convert_from_path, convert_from_bytes
import numpy as np
from werkzeug.utils import secure_filename

app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'zip', 'csv', 'ai'])
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploaded')
IMG_DIR = os.path.join(BASE_DIR, 'static', 'imgs')


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = None
        if 'x-access-tokens' in request.headers:
            token = request.headers['x-access-tokens']

        if not token:
            return jsonify({'message': 'a valid token is missing'})

    return decorator


@app.route("/")
def home():
    return render_template('upload.html', title='Upload')


@app.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('home'))
        else:
            flash('Login Unsuccessful. Please check email and password', 'danger')
    return render_template('login.html', title='Login', form=form)


@app.route("/history", methods=['GET', 'POST'])
def history():
    pills = Pill.query.join(PillImages).all()
    data = []
    for pill in pills:
        data.append({
            'id': pill.pill_id,
            'name': pill.name,
            'images': [img.image_url for img in pill.images]
        })
    return render_template('history.html', title='Login', data=data)


@app.route("/upload", methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        if 'pill_name' in request.form:
            pill = Pill(name=request.form['pill_name'])
            db.session.add(pill)
            db.session.commit()
            img_data = request.files.getlist('img_data[]')
            for i, file in enumerate(img_data):
                label = request.form['label_' + str(i)]
                try:
                    path = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f") + '.' + file.filename.rsplit('.', 1)[1].lower()
                    file.save(os.path.join(UPLOAD_DIR, path))
                    pill_image = PillImages(pill_id=pill.pill_id, label=label, image_url=path)
                    db.session.add(pill_image)
                    db.session.commit()
                except Exception as e:
                    print(e)
            return jsonify({'mess': 'success'})
    return render_template('upload.html', title='Upload')
