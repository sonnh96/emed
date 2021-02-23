from datetime import datetime
from main import db, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    image_file = db.Column(db.String(60), nullable=True, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    admin = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_ip = db.Column(db.String(20), nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"User('{self.id}', '{self.username}', '{self.email}', '{self.image_file}')"


class Labels(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    label = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"Labels('{self.id}', '{self.name}', '{self.label}', '{self.created_at}')"


class Pill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pill_id = db.Column(db.String(45), nullable=True)
    name = db.Column(db.String(45), nullable=False)
    active_ingredient = db.Column(db.String(200), nullable=True)
    content = db.Column(db.String(200), nullable=True)
    license = db.Column(db.String(200), nullable=True)
    packaging = db.Column(db.String(200), nullable=True)
    unit = db.Column(db.String(200), nullable=True)
    color = db.Column(db.String(200), nullable=True)
    shape = db.Column(db.String(200), nullable=True)
    link_images = db.Column(db.String(200), nullable=True)
    benefit = db.Column(db.String(200), nullable=True)
    dosage = db.Column(db.String(200), nullable=True)
    contraindication = db.Column(db.String(200), nullable=True)
    warning = db.Column(db.String(200), nullable=True)
    side_effect = db.Column(db.String(200), nullable=True)
    price = db.Column(db.String(200), nullable=True)
    images = db.relationship('PillImages', backref="pill", lazy=True)
    created_by = db.Column(db.String(20), db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"Pill('{self.id}', '{self.pill_id}', '{self.name}', '{self.active_ingredient}', '{self.content}', '{self.images}'," \
            f"'{self.license}', '{self.packaging}', '{self.unit}', '{self.color}', '{self.shape}', '{self.link_images}'," \
            f"'{self.benefit}', '{self.dosage}', '{self.contraindication}', '{self.warning}', '{self.side_effect}', '{self.price}')"


class PillImages(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pill_id = db.Column(db.String(20), db.ForeignKey('pill.id'), nullable=False)
    label = db.Column(db.String(200), nullable=True)
    image_url = db.Column(db.String(200), nullable=False)
    created_by = db.Column(db.String(20), db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f"PillImages('{self.id}', '{self.pill_id}', '{self.label}', '{self.image_url}', '{self.created_at}', '{self.deleted_at}')"
