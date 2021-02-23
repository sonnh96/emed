# -*- coding: utf-8 -*-
import os
from flask import render_template, url_for, flash, redirect, request, jsonify, send_file
from main import app, db, bcrypt, socketio
from main.forms import *
from main.models import *
from flask_login import login_user, current_user, logout_user, login_required
import datetime
import json
from werkzeug.utils import secure_filename
from functools import wraps

app.config['ALLOWED_EXTENSIONS'] = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'zip', 'csv', 'ai'])
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'static', 'uploaded')
IMG_DIR = os.path.join(BASE_DIR, 'static', 'imgs')


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def admin_require(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        if current_user.admin == 1:
            return f(*args, **kwargs)
        else:
            return "403 Forbidden"

    return decorator


@app.route("/")
@login_required
def home():
    pills = Pill.query
    if 'search' in request.args:
        search = request.args['search']
        pills = pills.filter(Pill.name.like("%{}%".format(search)))

    total = pills.count()
    if 'page' in request.args:
        page = int(request.args['page'])
        pills = pills.paginate(page, 10, error_out=False).items
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


@app.route("/admin/user_manager")
@login_required
@admin_require
def user_manager():
    users = User.query.all()

    res = {
        'data': []
    }
    for user in users:
        res['data'].append({
            'id': user.id,
            'name': user.name,
            'label': user.admin
        })

    return render_template('user_manager.html', title='Label Manager', data=res)


@app.route("/admin/labels_manager")
@login_required
@admin_require
def labels_manager():
    labels = Labels.query.all()

    res = {
        'data': []
    }
    for label in labels:
        res['data'].append({
            'id': label.id,
            'name': label.name,
            'label': label.label
        })

    return render_template('labels.html', title='Label Manager', data=res)


@app.route("/image_manager")
@login_required
@admin_require
def image_manager():
    pill_images = PillImages.query
    if 'label' in request.args:
        label = request.args['label']
        pill_images = pill_images.filter(PillImages.label.in_([label]))

    total = pill_images.count()
    if 'page' in request.args:
        page = int(request.args['page'])
        pill_images = pill_images.paginate(page, 10, error_out=False).items
    else:
        pill_images = pill_images.limit(10).all()

    res = {
        'data': [],
        'total': total
    }
    for pill_image in pill_images:
        res['data'].append({
            'id': pill_image.id,
            'pill_id': pill_image.pill_id,
            'label': pill_image.label,
            'image_url': pill_image.image_url
        })

    return render_template('image_manager.html', title='Login', data=res)


@app.route("/admin/upload_manager")
@login_required
@admin_require
def upload_manager():
    user_id = request.args.get('userid')
    if user_id is not None:
        pill_images = PillImages.query.join(User, PillImages.created_by == User.id)\
            .add_columns(PillImages.id, PillImages.image_url, PillImages.pill_id, PillImages.created_at, User.username.label('username'), User.name.label('user'), User.id.label('userid'))\
            .filter(PillImages.created_by.in_([user_id])).all()
    else:
        pill_images = PillImages.query.join(User, PillImages.created_by == User.id, isouter=True)\
            .add_columns(PillImages.id, PillImages.image_url, PillImages.pill_id, PillImages.created_at, User.username.label('username'), User.name.label('user'), User.id.label('userid'))\
            .filter(PillImages.created_by.isnot(None)).all()
    res = {
        'data': []
    }
    for pill in pill_images:
        res['data'].append({
            'id': pill.id,
            'pill_id': pill.pill_id,
            'image_url': pill.image_url,
            'user': pill.user,
            'created_at': pill.created_at,
            'username': pill.username,
            'userid': pill.userid
        })
    return render_template('upload_manager.html', title='Label Manager', data=res)


@app.route("/user_upload_manager")
@login_required
def user_upload_manager():
    pill_images = PillImages.query.join(User, PillImages.created_by == User.id) \
        .add_columns(PillImages.id, PillImages.image_url, PillImages.pill_id, PillImages.created_at, User.username.label('username'), User.name.label('user'), User.id.label('userid')) \
        .filter(PillImages.created_by.in_([current_user.id])).all()
    res = {
        'data': []
    }
    for pill in pill_images:
        res['data'].append({
            'id': pill.id,
            'image_url': pill.image_url,
            'pill_id': pill.pill_id,
            'created_at': pill.created_at,
            'user': pill.user,
            'username': pill.username,
            'userid': pill.userid
        })
    return render_template('upload_manager.html', title='Label Manager', data=res)


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


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


@app.route("/add_label", methods=['GET', 'POST'])
@login_required
@admin_require
def add_label():
    if request.method == 'POST':
        name = None
        label = None
        if 'name' in request.form:
            name = request.form['name']
        if 'label' in request.form:
            label = request.form['label']
        if name is None or label is None:
            return jsonify({'mess': 'error'}), 400
        lab = Labels(name=name, label=label)
        db.session.add(lab)
        db.session.commit()
        return jsonify({'mess': 'success'})
    return jsonify({'mess': 'error'}), 400


@app.route("/update_label", methods=['GET', 'POST'])
@login_required
@admin_require
def update_label():
    if request.method == 'POST':
        name = None
        label = None
        id = None
        if "id" in request.form:
            id = request.form['id']
        if 'name' in request.form:
            name = request.form['name']
        if 'label' in request.form:
            label = request.form['label']
        print(label, name)
        if id is None or name is None or label is None:
            return jsonify({'mess': 'error'}), 400
        try:
            lab = Labels.query.filter_by(id=id).first()
            lab.name = name
            lab.label = label
            db.session.commit()
        except Exception as e:
            print(e)
            return jsonify({'mess': 'error'}), 400
        return jsonify({'mess': 'success'})
    return jsonify({'mess': 'error'}), 400


@app.route("/del_label", methods=['GET', 'POST'])
@login_required
@admin_require
def del_label():
    if request.method == 'POST':
        if 'id' in request.form:
            id = request.form['id']
            Labels.query.filter_by(id=id).delete()
            db.session.commit()
            return jsonify({'mess': 'success'})
    return jsonify({'mess': 'error'}), 400


@app.route("/add_user", methods=['GET', 'POST'])
@login_required
@admin_require
def add_user():
    if request.method == 'POST':
        name = None
        username = None
        password = None
        is_admin = False
        print(request.form)
        if 'name' in request.form:
            name = request.form['name']
        if 'username' in request.form:
            username = request.form['username']
        if 'password' in request.form:
            password = request.form['password']
            password = bcrypt.generate_password_hash(password).decode('utf-8')
        if 'is_admin' in request.form:
            is_admin = True if int(request.form['is_admin']) == 1 else False
        if name is None or username is None or password is None:
            return jsonify({'mess': 'error'}), 400
        user = User(name=name, username=username, password=password, admin=is_admin, created_ip=request.remote_addr)
        db.session.add(user)
        db.session.commit()
        return jsonify({'mess': 'success'})
    return jsonify({'mess': 'error'}), 400


@app.route("/del_user", methods=['GET', 'POST'])
@login_required
@admin_require
def del_user():
    if request.method == 'POST':
        if 'id' in request.form:
            id = request.form['id']
            User.query.filter_by(id=id).delete()
            db.session.commit()
            return jsonify({'mess': 'success'})
    return jsonify({'mess': 'error'}), 400


@app.route("/search", methods=['GET', 'POST'])
@login_required
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
@login_required
def upload():
    data = {}
    if request.method == 'POST':
        pill = None
        if 'id' in request.form:
            id = request.form['id']
            pill = Pill.query.filter_by(id=id).first()
        elif 'pill_name' in request.form:
            pill = Pill(name=request.form['pill_name'], created_by=current_user.id)
            db.session.add(pill)
            db.session.commit()
        if pill is not None:
            img_data = request.files.getlist('img_data[]')
            for i, file in enumerate(img_data):
                label = request.form['label_' + str(i)]
                status = int(request.form['status_' + str(i)])
                if status == 1:
                    try:
                        path = datetime.datetime.now().strftime("%Y%m%d_%H%M%S%f") + '.' + file.filename.rsplit('.', 1)[1].lower()
                        file.save(os.path.join(UPLOAD_DIR, path))
                        pill_image = PillImages(pill_id=pill.id, label=label, image_url=path, created_by=current_user.id)
                        db.session.add(pill_image)
                    except Exception as e:
                        print(e)
                elif status == 2:
                    id = int(request.form['id_' + str(i)])
                    try:
                        PillImages.query.filter_by(id=id).delete()
                    except Exception as e:
                        print(e)
                elif status == 3:
                    id = int(request.form['id_' + str(i)])
                    try:
                        pill_imgage = PillImages.query.filter_by(id=id).first()
                        pill_imgage.label = label
                    except Exception as e:
                        print(e)
            db.session.commit()
            return jsonify({'mess': 'success'})
    else:
        labs = Labels.query.all()

        labels = []
        for label in labs:
            labels.append({
                'id': label.id,
                'name': label.name,
                'label': label.label
            })
        if 'id' in request.args:
            id = request.args['id']
            pill = Pill.query.filter_by(id=id).first()
            data = {
                'id': pill.id,
                'pill_id': pill.pill_id,
                'name': pill.name,
                'images': [{'id': img.id, 'url': '/static/uploaded/' + img.image_url, 'label': img.label, 'created_by': img.created_by} for img in pill.images]
            }
        data['labels'] = labels
        return render_template('upload.html', title='Upload', data=data)
