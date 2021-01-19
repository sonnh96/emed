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
    pills = Pill.query
    if 'search' in request.args:
        search = request.args['search']
        pills = pills.filter(Pill.name.like("%{}%".format(search)))

    total = pills.count()
    if 'page' in request.args:
        page = int(request.args['page'])
        pills = pills.paginate(page,10,error_out=False).items
    else:
        pills = pills.limit(10).all()

    res = {
        'data': [],
        'total': total
    }
    for pill in pills:
        res['data'].append({
            'id': pill.id,
            'pill_id': pill.pill_id,
            'name': pill.name,
            'images': [img.image_url for img in pill.images]
        })

    return render_template('history.html', title='Login', data=res)


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


@app.route("/search", methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        data = json.loads(request.data)
        name = data.get('name')
        pills = Pill.query.with_entities(Pill.id, Pill.pill_id, Pill.name).filter(Pill.name.like("%{}%".format(name))).limit(10).all()
        res = []
        for pill in pills:
            res.append({
                'id': pill.id,
                'pill_id': pill.pill_id,
                'name': pill.name
            })
        return jsonify({'mess': 'success', 'data': res})
    return jsonify({'mess': 'error'}), 400


@app.route("/upload", methods=['GET', 'POST'])
def upload():
    data = None
    if request.method == 'POST':
        if 'id' in request.form:
            id = request.form['id']
            pill = Pill.query.filter_by(id=id).first()
        elif 'pill_name' in request.form:
            pill = Pill(name=request.form['pill_name'])
            db.session.add(pill)
            db.session.commit()
        if pill != None:
            img_data = request.files.getlist('img_data[]')
            for i, file in enumerate(img_data):
                label = request.form['label_' + str(i)]
                status = int(request.form['status_' + str(i)])
                if status == 1:
                    try:
                        path = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f") + '.' + file.filename.rsplit('.', 1)[1].lower()
                        file.save(os.path.join(UPLOAD_DIR, path))
                        pill_image = PillImages(pill_id=pill.id, label=label, image_url=path)
                        db.session.add(pill_image)
                        db.session.commit()
                    except Exception as e:
                        print(e)
                elif status == 2:
                    id = int(request.form['id_' + str(i)])
                    try:
                        PillImages.query.filter_by(id=id).delete()
                        db.session.commit()
                    except Exception as e:
                        print(e)
            return jsonify({'mess': 'success'})
    else:
        if 'id' in request.args:
            id = request.args['id']
            pill = Pill.query.filter_by(id=id).first()
            data = {
                'id': pill.id,
                'pill_id': pill.pill_id,
                'name': pill.name,
                'images': [{'id': img.id, 'url': '/static/uploaded/' + img.image_url, 'label': img.label} for img in pill.images]
            }
    return render_template('upload.html', title='Upload', data=data)
